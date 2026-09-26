from fastapi import APIRouter
from .documents import router as documents_router
from .bundles import router as bundles_router
from .events import router as events_router

router = APIRouter()
router.include_router(documents_router, prefix="/documents", tags=["documents"])
router.include_router(bundles_router, prefix="/bundles", tags=["bundles"])
router.include_router(events_router, prefix="/events", tags=["events"])
