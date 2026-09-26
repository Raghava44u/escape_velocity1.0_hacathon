# Intelligent Document Processing (IDP) Platform 🚀

A production-grade, full-stack document extraction platform built for the **Escape Velocity 1.0 Hackathon**. This system ingests documents (PDFs and Images), runs them through a multi-stage OCR and Computer Vision pipeline, and securely extracts highly-structured data with exact bounding-box coordinates for visual verification.

## ✨ Key Features
- **Precision OCR & Computer Vision:** Uses PyMuPDF and PyTesseract backed by OpenCV for aggressive noise-reduction and contrast thresholding on blurry/low-quality images.
- **Dynamic Bounding Boxes (Bouncebox):** Click on any extracted data point in the UI, and the system instantly draws a glowing bounding box over the exact source pixels on the original document.
- **Mathematical Reconciliation Engine:** Automatically validates line items against subtotals, tax rates, and grand totals to flag discrepancies.
- **Real-Time Pipeline Tracking:** Uses Server-Sent Events (SSE) to stream the real-time status of the 17-stage backend processing pipeline directly to the UI.
- **Human-in-the-Loop Review:** Automatically detects completely unreadable documents or mathematical mismatches and flags them into a high-priority "Human Review Queue".

## 🛠️ Tech Stack
**Backend:**
- Python 3 / **FastAPI**
- **Uvicorn** (Async Server)
- **SQLite + SQLAlchemy** (ORM & Database)
- **OpenCV** (Image Preprocessing)
- **Tesseract (PyTesseract)** & **PyMuPDF** (OCR & Layout Analysis)

**Frontend:**
- **Next.js** / **React**
- **Tailwind CSS** (Styling)
- **Axios** (API requests)
- **Lucide React** (Icons)

---

## 🚀 How to Run Locally

### 1. Start the Backend (FastAPI)
Open a terminal, navigate to the backend folder, set up your Python environment, and start the server:
```bash
cd backend
python -m venv venv
# Activate the virtual environment:
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*The backend will now be running on `http://localhost:8000`*

### 2. Start the Frontend (Next.js)
Open a **second** terminal, navigate to the frontend folder, install dependencies, and start the development server:
```bash
cd frontend
npm install
npm run dev
```
*The frontend will now be running on `http://localhost:3000`*

---

## 🧪 How to Test & Verify

We have provided a set of test documents in the repository to demonstrate the system's capabilities, including edge cases.

1. **Open the Dashboard:** Go to `http://localhost:3000` in your browser.
2. **Upload a Document:** Click the upload area and select a document from the `data/demo/` folder in the repository.
   
### Included Test Files (`data/demo/`):
- `clean_invoice.pdf`: A standard, high-quality digital invoice. The system will extract Line Items, Totals, Invoice IDs, and Company Names instantly.
- `blurred_invoice.pdf` / `blurred_invoice.png`: A low-quality image. Watch the backend OpenCV engine automatically apply Gaussian Blurs and Otsu thresholding to salvage and extract the text.
- `wrong_total_invoice.pdf`: An invoice where the line items mathematically *do not add up* to the Grand Total. The system will catch this, flag a `CRITICAL_RECONCILIATION_MISMATCH`, and push it to the Human Review Queue.

### Testing the "Bouncebox" UI
Once a document is processed, you will see cards on the right side under **Structured Extraction**. 
Simply **Click on any card** (like the Invoice ID or a Line Item). The UI will instantly jump to the original document on the left and draw a blue bounding box exactly where that text was found. 

---

## 🏗️ Pipeline Architecture Overview
When a document is uploaded, it passes through 17 autonomous stages:
1. File Validation & Integrity Check
2. Quality Analysis (Blur detection)
3. Image Preprocessing (Grayscale, Sharpening, Thresholding)
4. OCR & Bounding Box Generation (PyMuPDF / Tesseract)
5. Layout Analysis & Y-Axis Row Stitching
6. Regex Data Classification & Mapping
7. Mathematical Reconciliation
8. Final Verification / Human Review routing

> **Note:** Tesseract OCR must be installed on your host machine for image processing to work. (On Windows, install to `C:\Program Files\Tesseract-OCR\tesseract.exe`).
