from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.v1 import router as api_router
import os

app = FastAPI(
    title="VERIDOC AI API",
    description="Trusted Document Intelligence & Verification Engine API",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

# Mount static files
data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data"))
app.mount("/media", StaticFiles(directory=data_dir), name="media")

@app.get("/health")
def health_check():
    return {"status": "ok", "version": "1.0.0"}
