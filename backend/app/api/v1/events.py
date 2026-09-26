from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import asyncio
from typing import AsyncGenerator
import json

router = APIRouter()

# In-memory store for events per document
# In a real app, use Redis pub/sub
document_events = {}

async def event_generator(document_id: str) -> AsyncGenerator[str, None]:
    last_idx = 0
    while True:
        if document_id in document_events:
            events = document_events[document_id]
            if last_idx < len(events):
                for i in range(last_idx, len(events)):
                    yield f"data: {json.dumps(events[i])}\n\n"
                last_idx = len(events)
        await asyncio.sleep(0.5)

@router.get("/{document_id}")
async def sse_endpoint(document_id: str):
    return StreamingResponse(
        event_generator(document_id),
        media_type="text/event-stream"
    )

def emit_event(document_id: str, event: dict):
    if document_id not in document_events:
        document_events[document_id] = []
    document_events[document_id].append(event)
