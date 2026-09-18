import os
from typing import List
from langchain_groq import ChatGroq
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import DeterministicFakeEmbeddings # Replace with real OpenAI/HuggingFace embeddings
from langchain.prompts import ChatPromptTemplate
from langchain.schema.runnable import RunnablePassthrough
from dotenv import load_dotenv

load_dotenv()

class RAGService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.model_name = os.getenv("GROQ_MODEL", "llama-3.1-70b-versatile")
        self.persist_directory = os.getenv("CHROMA_DB_PATH", "../rag/knowledge_base/chroma_db")

        # Initialize LLM
        self.llm = ChatGroq(
            groq_api_key=self.api_key,
            model_name=self.model_name,
            temperature=0.2
        )

        # Initialize Vector Store
        # In a real scenario, use SentenceTransformerEmbeddings or OpenAIEmbeddings
        self.embeddings = DeterministicFakeEmbeddings()
        self.vectorstore = Chroma(
            persist_directory=self.persist_directory,
            embedding_function=self.embeddings
        )

    async def generate_explanation(self, risk_score: float, reasons: List[str], transaction_details: dict) -> str:
        """
        Queries the knowledge base and generates a human-readable explanation.
        """
        # 1. Retrieve relevant security policies from ChromaDB
        query = f"Fraud patterns for risk score {risk_score}: {', '.join(reasons)}"
        docs = self.vectorstore.similarity_search(query, k=3)
        context = "\n\n".join([doc.page_content for doc in docs])

        # 2. Build Prompt
        prompt = ChatPromptTemplate.from_template("""
        You are a Senior Fraud Analyst. Explain to a user why their transaction was flagged.

        CONTEXT FROM SECURITY POLICY:
        {context}

        TRANSACTION DETAILS:
        {details}

        RISK SCORE: {score}
        REASONS: {reasons}

        Provide a professional, empathetic, but firm explanation.
        Mention specifically why it was locked and what they should do next to verify their identity.
        Keep it under 3 sentences.
        """)

        chain = (
            {"context": lambda x: x["context"],
             "details": lambda x: x["details"],
             "score": lambda x: x["score"],
             "reasons": lambda x: x["reasons"]}
            | prompt
            | self.llm
        )

        response = chain.invoke({
            "context": context,
            "details": transaction_details,
            "score": risk_score,
            "reasons": ", ".join(reasons)
        })

        return response.content

rag_service = RAGService()
