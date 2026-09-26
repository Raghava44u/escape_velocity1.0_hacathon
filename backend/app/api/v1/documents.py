import os
import uuid
import hashlib
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from app.database.database import get_db
from app.models.document import Document, ExtractedFieldModel
from app.schemas.document import DocumentUploadResponse, DocumentStatusResponse
from app.services.pipeline import process_document_pipeline

router = APIRouter()

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../data/uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    background_tasks: BackgroundTasks, 
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    doc_id = str(uuid.uuid4())
    
    ext = file.filename.split(".")[-1].lower()
    if ext not in ["pdf", "jpg", "jpeg", "png"]:
        raise HTTPException(status_code=400, detail="INVALID_FILE_FORMAT")
        
    file_type = "PDF" if ext == "pdf" else "IMAGE"
    
    file_path = os.path.join(UPLOAD_DIR, f"{doc_id}.{ext}")
    
    content = await file.read()
    
    sha256_hash = hashlib.sha256(content).hexdigest()
    
    existing_doc = db.query(Document).filter(Document.sha256 == sha256_hash).first()
    is_duplicate = existing_doc is not None
    
    with open(file_path, "wb") as f:
        f.write(content)
        
    db_doc = Document(
        id=doc_id,
        filename=file.filename,
        file_type=file_type,
        page_count=1,
        sha256=sha256_hash,
        status="UPLOADED"
    )
    db.add(db_doc)
    db.commit()
    
    background_tasks.add_task(process_document_pipeline, doc_id, file_path, file_type)
    
    return DocumentUploadResponse(
        document_id=doc_id,
        file_type=file_type,
        page_count=1,
        sha256=sha256_hash,
        duplicate=is_duplicate
    )

@router.get("/{id}")
async def get_document(id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(404)
        
    fields = db.query(ExtractedFieldModel).filter(ExtractedFieldModel.document_id == id).all()
    
    return {
        "document": {
            "id": doc.id,
            "filename": doc.filename,
            "file_type": doc.file_type,
            "status": doc.status,
            "sha256": doc.sha256
        },
        "fields": fields
    }

@router.get("/{id}/status")
async def get_document_status(id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(404)
    return DocumentStatusResponse(document_id=id, overall_process_status=doc.status)

@router.get("/{id}/evidence/{field}")
async def get_document_evidence(id: str, field: str, db: Session = Depends(get_db)):
    db_field = db.query(ExtractedFieldModel).filter(ExtractedFieldModel.document_id == id, ExtractedFieldModel.field_name == field).first()
    if not db_field:
        raise HTTPException(404)
    return {"document_id": id, "field": field, "evidence": db_field.evidence}

@router.get("/{id}/review")
async def get_document_review(id: str, db: Session = Depends(get_db)):
    review_items = db.query(ExtractedFieldModel).filter(
        ExtractedFieldModel.document_id == id,
        ExtractedFieldModel.review_required == True
    ).all()
    return {"document_id": id, "review_items": review_items}

from pydantic import BaseModel
class ReviewAction(BaseModel):
    field_id: str
    action: str # ACCEPT, EDIT, REJECT
    corrected_value: str = None
    reason: str = None

@router.post("/{id}/review")
async def submit_document_review(id: str, action: ReviewAction, db: Session = Depends(get_db)):
    db_field = db.query(ExtractedFieldModel).filter(ExtractedFieldModel.id == action.field_id).first()
    if not db_field:
        raise HTTPException(404)
        
    if action.action == "EDIT":
        db_field.value_text = action.corrected_value
        db_field.status = "VERIFIED"
        db_field.review_required = False
        db_field.review_reason = f"Human corrected: {action.reason}"
    elif action.action == "ACCEPT":
        db_field.status = "VERIFIED"
        db_field.review_required = False
        db_field.review_reason = "Human accepted"
    elif action.action == "REJECT":
        db_field.status = "FAILED"
        db_field.review_required = False
        db_field.review_reason = "Human rejected"
        
    db.commit()
    
    # Check if doc can be verified now
    pending_reviews = db.query(ExtractedFieldModel).filter(
        ExtractedFieldModel.document_id == id,
        ExtractedFieldModel.review_required == True
    ).count()
    
    if pending_reviews == 0:
        doc = db.query(Document).filter(Document.id == id).first()
        doc.status = "VERIFIED"
        db.commit()
        
    return {"status": "success", "remaining_reviews": pending_reviews}
