# VERIDOC AI

Trusted Document Intelligence & Verification Engine

## Features
- **Zero Hallucination Policy:** If unreadable, fails loudly.
- **Evidence Mapping:** Every extracted value is linked to exact bounding box coordinates.
- **Mathematical Validation:** Automatically detects if totals do not match line items or tax.
- **Human-in-the-Loop:** Pushes uncertain values (<92% confidence) to a review queue.
- **Real-Time Pipeline Tracking:** Uses SSE to show you the pipeline logic in real-time.
- **Integrity Analysis:** OpenCV-based blur/quality detection and artifact checking.

## Tech Stack
- **Backend:** FastAPI, Python, SQLAlchemy, OpenCV, PyMuPDF
- **Frontend:** Next.js, React, Tailwind CSS, Lucide Icons
- **Database:** SQLite (Demo) / PostgreSQL (Prod)

## Run Locally (Docker)
```bash
cd docker
docker-compose up --build
```

## Run Locally (Manual)
### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python -m app.database.init_db
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Demo Cases
Located in `data/demo/`:
- `clean_invoice.pdf`
- `blurred_invoice.pdf`
- `wrong_total_invoice.pdf`
- `tampered_invoice.pdf`

Upload these files to test the various rule engine branches and the human review UI.
