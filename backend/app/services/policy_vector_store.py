from langchain_core.documents import Document
from langchain_postgres import PGVector
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.models import StorePolicy
from app.services.embeddings import get_gemini_embedding_client


def get_policy_pgvector_store(db: Session | None = None) -> PGVector:
    from app.services.admin_service import get_or_create_ai_settings
    from app.services.embeddings import get_gemini_embedding_client, get_openai_embedding_client
    from app.db.session import SessionLocal
    
    _db = db
    if not _db:
        _db = SessionLocal()
        
    cfg = get_or_create_ai_settings(_db)
    
    if cfg.embedding_provider == "openai":
        embeddings = get_openai_embedding_client(cfg.embedding_model)
    else:
        actual_model = cfg.embedding_model
        if "embedding-001" in actual_model or "embedding-2" in actual_model:
            actual_model = "models/gemini-embedding-2"
        embeddings = get_gemini_embedding_client(actual_model)
        
    return PGVector(
        embeddings=embeddings,
        connection=settings.database_url,
        collection_name="store_policies",
        use_jsonb=True,
    )


def sync_policy_documents(db: Session) -> int:
    from langchain_text_splitters import MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter
    
    policies = db.scalars(select(StorePolicy)).all()
    if not policies:
        return 0
        
    headers_to_split_on = [
        ("#", "Header 1"),
        ("##", "Header 2"),
        ("###", "Header 3"),
        ("####", "Header 4"),
    ]
    
    markdown_splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers_to_split_on)
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    
    all_docs = []
    for policy in policies:
        # Split by headers
        sections = markdown_splitter.split_text(policy.content)
        
        # Further split sections into chunks with overlap
        chunks = text_splitter.split_documents(sections)
        
        # Enrich metadata
        for chunk in chunks:
            chunk.metadata.update({
                "policy_id": policy.id,
                "policy_type": policy.policy_type,
                "locale": policy.locale,
                "title": policy.title or "Untitled"
            })
            all_docs.append(chunk)
            
    store = get_policy_pgvector_store(db)
    # Note: We don't delete by ID here because one policy now results in multiple docs
    # Instead, we should probably clear the collection or use metadata filtering
    # For now, let's just add them. A more robust solution would use a separate collection or better IDs.
    store.add_documents(all_docs)
    return len(all_docs)
