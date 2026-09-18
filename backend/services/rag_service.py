import os
import logging
from typing import List
from langchain_groq import ChatGroq
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv

# Use langchain_huggingface if available (preferred), fall back to community
try:
    from langchain_huggingface import HuggingFaceEmbeddings
except ImportError:
    from langchain_community.embeddings import HuggingFaceEmbeddings

load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RAGService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.model_name = os.getenv("GROQ_MODEL", "llama-3.1-70b-versatile")
        _rag_default = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "..", "rag", "knowledge_base", "chroma_db"))
        self.persist_directory = os.getenv("CHROMA_DB_PATH", _rag_default)
        self.embeddings = None
        self.vectorstore = None
        self._initialized_vectorstore = False

        # Initialize LLM directly (very lightweight, API-based)
        self.llm = None
        if self.api_key:
            try:
                self.llm = ChatGroq(
                    groq_api_key=self.api_key,
                    model_name=self.model_name,
                    temperature=0.2
                )
                logger.info("Groq LLM initialized.")
            except Exception as e:
                logger.error(f"Groq initialization failed: {e}")
        else:
            logger.warning("GROQ_API_KEY missing. RAG will use template explanations.")

    def _ensure_vectorstore(self):
        """
        Lazy load SentenceTransformer and ChromaDB only when actually needed.
        Prevents Render 512MB OOM crash during container boot.
        """
        if self._initialized_vectorstore:
            return
        self._initialized_vectorstore = True

        # Disable heavy ML embedding on memory-constrained servers if configured
        if os.getenv("DISABLE_LOCAL_EMBEDDINGS", "false").lower() == "true":
            logger.info("Local embeddings disabled via DISABLE_LOCAL_EMBEDDINGS=true.")
            return

        try:
            logger.info("Lazy-loading HuggingFace embeddings...")
            self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
            self.vectorstore = Chroma(
                persist_directory=self.persist_directory,
                embedding_function=self.embeddings
            )
            logger.info("ChromaDB vector store connected.")
        except Exception as e:
            logger.warning(f"Vector store not loaded (falling back to direct LLM/templates): {e}")
            self.embeddings = None
            self.vectorstore = None

    async def generate_explanation(self, risk_score: float, reasons: List[str], transaction_details: dict) -> str:
        """
        Queries knowledge base and generates an explanation.
        Provides robust fallbacks if LLM or VectorStore is unavailable.
        """
        # Fallback 1: If LLM is missing
        if not self.llm:
            return self._get_fallback_explanation(risk_score, reasons)

        try:
            # 1. Retrieve context from ChromaDB (lazy loaded on demand)
            self._ensure_vectorstore()
            context = ""
            if self.vectorstore and self.embeddings:
                query = f"Fraud pattern: {', '.join(reasons)}"
                docs = self.vectorstore.similarity_search(query, k=3)
                context = "\n\n".join([doc.page_content for doc in docs])

            # 2. Generate response via Groq
            prompt = ChatPromptTemplate.from_template("""
            You are a Senior Fraud Analyst. Explain to a user why their transaction was flagged.

            SECURITY POLICY CONTEXT:
            {context}

            TRANSACTION DATA:
            {details}

            RISK SCORE: {score}
            REASONS: {reasons}

            Provide a professional, transparent explanation. Explain the 'why' and the next step (verification).
            Keep it under 3 sentences.
            """)

            chain = prompt | self.llm
            response = chain.invoke({
                "context": context if context else "No specific policy found. Use general fraud detection principles.",
                "details": transaction_details,
                "score": risk_score,
                "reasons": ", ".join(reasons)
            })

            return response.content

        except Exception as e:
            logger.error(f"RAG Generation Error: {e}")
            return self._get_fallback_explanation(risk_score, reasons)

    def _get_fallback_explanation(self, risk_score: float, reasons: List[str]) -> str:
        """
        Simple template-based fallback if the AI pipeline fails.
        """
        if risk_score > 0.7:
            return f"Your account was temporarily locked due to high-risk patterns: {', '.join(reasons)}. Please verify your identity to unlock."
        return f"Transaction flagged for review based on: {', '.join(reasons)}."

rag_service = RAGService()
