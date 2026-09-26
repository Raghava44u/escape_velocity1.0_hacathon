from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()

class BundleRequest(BaseModel):
    document_ids: List[str]

@router.post("/reconcile")
async def reconcile_bundle(request: BundleRequest):
    return {"status": "reconciled", "conflicts": []}
