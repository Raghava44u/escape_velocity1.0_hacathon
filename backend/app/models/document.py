from sqlalchemy import Column, String, Integer, Float, Boolean, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, index=True)
    filename = Column(String)
    file_type = Column(String)
    page_count = Column(Integer)
    sha256 = Column(String, index=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="PENDING")
    document_type = Column(String, nullable=True) # INVOICE, RECEIPT, etc.
    quality_metrics = Column(JSON, nullable=True)
    tamper_analysis = Column(JSON, nullable=True)

class ExtractedFieldModel(Base):
    __tablename__ = "extracted_fields"

    id = Column(String, primary_key=True, index=True)
    document_id = Column(String, ForeignKey("documents.id"))
    field_name = Column(String)
    value_text = Column(String)
    confidence_score = Column(Float)
    score_breakdown = Column(JSON)
    status = Column(String) # VERIFIED, NEEDS_HUMAN_REVIEW, FAILED
    review_required = Column(Boolean, default=False)
    review_priority = Column(String, nullable=True)
    review_reason = Column(String, nullable=True)
    evidence = Column(JSON, nullable=True)
    
    document = relationship("Document")

class ProcessingEventModel(Base):
    __tablename__ = "processing_events"

    id = Column(String, primary_key=True, index=True)
    document_id = Column(String, ForeignKey("documents.id"))
    stage = Column(String)
    stage_number = Column(Integer)
    status = Column(String)
    title = Column(String)
    message = Column(String)
    details = Column(JSON, nullable=True)
    started_at = Column(DateTime)
    completed_at = Column(DateTime, nullable=True)
    duration_ms = Column(Integer, nullable=True)
    error_code = Column(String, nullable=True)
    
    document = relationship("Document")
