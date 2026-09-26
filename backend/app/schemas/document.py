from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class ProcessingEvent(BaseModel):
    event_id: str
    document_id: str
    stage: str
    stage_number: int
    status: str
    title: str
    message: str
    details: Optional[Dict[str, Any]] = None
    started_at: str
    completed_at: Optional[str] = None
    duration_ms: Optional[int] = None
    error_code: Optional[str] = None

class DocumentStatusResponse(BaseModel):
    document_id: str
    overall_process_status: str

class DocumentUploadResponse(BaseModel):
    document_id: str
    file_type: str
    page_count: int
    sha256: str
    duplicate: bool

class BBox(BaseModel):
    page: int
    pixel_bbox: List[float] # [ymin, xmin, ymax, xmax]
    normalized_bbox: List[float] # [ymin, xmin, ymax, xmax]

class ExtractedField(BaseModel):
    field_name: str
    value: Any
    confidence_score: float
    score_breakdown: Dict[str, float]
    status: str
    review_required: bool
    review_priority: Optional[str] = None
    review_reason: Optional[str] = None
    evidence: Optional[BBox] = None

class ExtractedData(BaseModel):
    fields: Dict[str, ExtractedField]
    tables: List[Any] = []

class TamperDetection(BaseModel):
    suspicious_alterations_detected: bool
    risk_level: str
    flagged_anomalies: List[str]

class DocumentMetadata(BaseModel):
    document_type: str
    overall_process_status: str
    quality: Dict[str, Any]
    tamper_detection: TamperDetection

class FinalResult(BaseModel):
    document_metadata: DocumentMetadata
    extracted_data: ExtractedData
    reconciliation_checks: List[Any]
    duplicate_analysis: Dict[str, Any]
    system_errors: List[str]
