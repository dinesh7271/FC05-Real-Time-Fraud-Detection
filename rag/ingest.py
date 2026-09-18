"""
RAG Ingestion Script
====================
Loads fraud policy documents from rag/documents/ into ChromaDB.

Usage (from project root):
    python rag/ingest.py

Supported file types: .txt, .md, .pdf (requires pypdf)
"""
import os
import sys
import logging
from pathlib import Path

# --- Configuration ---
DOCUMENTS_DIR = Path(__file__).parent / "documents"
CHROMA_DB_PATH = Path(__file__).parent / "knowledge_base" / "chroma_db"
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)


def load_documents():
    """Load all text/markdown documents from the documents directory."""
    docs = []
    if not DOCUMENTS_DIR.exists():
        logger.warning(f"Documents directory not found: {DOCUMENTS_DIR}")
        return docs

    for file_path in DOCUMENTS_DIR.iterdir():
        if file_path.suffix in (".txt", ".md"):
            logger.info(f"Loading: {file_path.name}")
            text = file_path.read_text(encoding="utf-8")
            docs.append({"content": text, "source": file_path.name})
        elif file_path.suffix == ".pdf":
            try:
                from pypdf import PdfReader
                reader = PdfReader(str(file_path))
                text = "\n".join(page.extract_text() or "" for page in reader.pages)
                docs.append({"content": text, "source": file_path.name})
                logger.info(f"Loading PDF: {file_path.name}")
            except ImportError:
                logger.warning("pypdf not installed. Skipping PDF files. Run: pip install pypdf")
        else:
            logger.debug(f"Skipping unsupported file: {file_path.name}")

    return docs


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP):
    """Simple sliding-window text chunker."""
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunks.append(" ".join(words[start:end]))
        start += chunk_size - overlap
    return chunks


def ingest():
    try:
        from langchain_community.vectorstores import Chroma
        from langchain_community.embeddings import HuggingFaceEmbeddings
        from langchain_core.documents import Document
    except ImportError as e:
        logger.error(f"Missing dependency: {e}. Run: pip install langchain-community sentence-transformers chromadb")
        sys.exit(1)

    logger.info("Loading documents...")
    raw_docs = load_documents()

    if not raw_docs:
        logger.warning(
            "No documents found in rag/documents/. "
            "Add .txt or .md files with fraud policy content, then re-run this script."
        )
        # Create a minimal seed document so ChromaDB is initialized
        raw_docs = [{
            "content": (
                "Fraud detection policy: Transactions with unusual geographic patterns, "
                "high velocity, or large amounts relative to account history should be flagged. "
                "New devices combined with high-value transactions require additional verification. "
                "Late-night transactions (10pm-5am) have elevated risk. "
                "Accounts less than 30 days old making large transfers are high risk."
            ),
            "source": "default_policy.txt"
        }]
        logger.info("Using default seed policy document.")

    # Chunk documents
    langchain_docs = []
    for doc in raw_docs:
        chunks = chunk_text(doc["content"])
        for i, chunk in enumerate(chunks):
            langchain_docs.append(
                Document(page_content=chunk, metadata={"source": doc["source"], "chunk": i})
            )

    logger.info(f"Created {len(langchain_docs)} chunks from {len(raw_docs)} documents.")

    # Initialize embeddings
    logger.info("Initializing HuggingFace embeddings (all-MiniLM-L6-v2)...")
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    # Build / update ChromaDB
    CHROMA_DB_PATH.mkdir(parents=True, exist_ok=True)
    logger.info(f"Ingesting into ChromaDB at: {CHROMA_DB_PATH}")
    vectorstore = Chroma.from_documents(
        documents=langchain_docs,
        embedding=embeddings,
        persist_directory=str(CHROMA_DB_PATH),
    )
    vectorstore.persist()
    logger.info(f"✅ Successfully ingested {len(langchain_docs)} chunks into ChromaDB.")
    logger.info("RAG knowledge base is ready. Start the backend and the RAG pipeline will work.")


if __name__ == "__main__":
    ingest()
