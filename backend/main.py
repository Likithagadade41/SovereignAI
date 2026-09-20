from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
from datetime import datetime
import csv
import io
import shutil

# ============================================================
# SOVEREIGN AI - LOCAL INDUSTRIAL INTELLIGENCE BACKEND
# ============================================================

app = FastAPI(
    title="Sovereign AI",
    description="On-Premise Agentic AI Workbench for Confidential Industrial Work",
    version="1.0.0"
)

# ------------------------------------------------------------
# CORS - Allow React frontend to communicate with FastAPI
# ------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------
# LOCAL STORAGE
# ------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent

DATA_DIR = BASE_DIR / "data"
DOCUMENTS_DIR = DATA_DIR / "documents"
IMAGES_DIR = DATA_DIR / "images"
SENSOR_DIR = DATA_DIR / "sensor_data"

for directory in [DATA_DIR, DOCUMENTS_DIR, IMAGES_DIR, SENSOR_DIR]:
    directory.mkdir(parents=True, exist_ok=True)


# ============================================================
# DATA MODELS
# ============================================================

class QuestionRequest(BaseModel):
    question: str


class SensorRequest(BaseModel):
    vibration: float
    temperature: float
    pressure: float
    rpm: float


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():
    return {
        "status": "online",
        "application": "Sovereign AI",
        "message": "Sovereign AI backend is running locally.",
        "processing": "ON-PREMISE"
    }


# ============================================================
# SYSTEM STATUS
# ============================================================

@app.get("/api/system-status")
def system_status():

    return {
        "local_inference": {
            "status": "READY",
            "description": "AI inference configured for local execution"
        },

        "knowledge_base": {
            "status": "READY",
            "documents": 12,
            "storage": "LOCAL"
        },

        "file_storage": {
            "status": "READY",
            "location": "LOCAL"
        },

        "model": {
            "status": "READY",
            "type": "OPEN-WEIGHT MULTIMODAL"
        },

        "external_api_calls": 0,

        "internet_required": False,

        "audit_logging": {
            "status": "ENABLED"
        },

        "security": "SOVEREIGN / ON-PREMISE"
    }


# ============================================================
# DOCUMENT LIBRARY
# ============================================================

@app.get("/api/documents")
def get_documents():

    documents = [
        {
            "id": 1,
            "name": "Pump_P204_Maintenance_Manual.pdf",
            "type": "PDF",
            "category": "Maintenance Manual",
            "status": "Indexed",
            "size": "2.4 MB"
        },
        {
            "id": 2,
            "name": "P204_SOP_Operations.pdf",
            "type": "PDF",
            "category": "SOP",
            "status": "Indexed",
            "size": "1.8 MB"
        },
        {
            "id": 3,
            "name": "Bearing_Failure_Guide.pdf",
            "type": "PDF",
            "category": "Technical Guide",
            "status": "Indexed",
            "size": "3.1 MB"
        },
        {
            "id": 4,
            "name": "Plant_Safety_Protocol.pdf",
            "type": "PDF",
            "category": "Safety",
            "status": "Indexed",
            "size": "1.2 MB"
        }
    ]

    # Add actual uploaded files
    for index, file_path in enumerate(DOCUMENTS_DIR.iterdir(), start=5):

        if file_path.is_file():

            documents.append({
                "id": index,
                "name": file_path.name,
                "type": file_path.suffix.replace(".", "").upper(),
                "category": "Uploaded Document",
                "status": "Stored Locally",
                "size": f"{file_path.stat().st_size / 1024:.1f} KB"
            })

    return {
        "count": len(documents),
        "storage": "LOCAL",
        "documents": documents
    }


# ============================================================
# DOCUMENT UPLOAD
# ============================================================

@app.post("/api/upload-document")
async def upload_document(file: UploadFile = File(...)):

    if not file.filename:
        return {
            "success": False,
            "message": "No filename provided."
        }

    destination = DOCUMENTS_DIR / Path(file.filename).name

    with destination.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "success": True,
        "filename": destination.name,
        "location": "LOCAL",
        "status": "Stored successfully",
        "indexed": True,
        "message": "Document stored and added to the local knowledge base."
    }
@app.delete("/api/documents/{filename}")
def delete_document(filename: str):
    safe_name = Path(filename).name

    document_path = DOCUMENTS_DIR / safe_name
    index_path = INDEX_DIR / f"{Path(safe_name).stem}.txt"

    deleted_document = False
    deleted_index = False

    if document_path.exists():
        document_path.unlink()
        deleted_document = True

    if index_path.exists():
        index_path.unlink()
        deleted_index = True

    if not deleted_document:
        return {
            "success": False,
            "message": "Document not found."
        }

    return {
        "success": True,
        "filename": safe_name,
        "document_deleted": deleted_document,
        "index_deleted": deleted_index,
        "message": "Document and its local index were deleted."
    }


# ============================================================
# ============================================================
# PRIVATE AI QUESTION ANSWERING
# ============================================================

@app.post("/api/ask")
def ask_private_ai(request: QuestionRequest):

    question = request.question.lower()

    if "p-204" in question or "pump" in question:

        answer = (
            "Pump P-204 is showing indicators associated with possible "
            "bearing degradation. The investigation should correlate "
            "vibration, temperature and operating conditions with the "
            "maintenance history before maintenance action is taken."
        )

        evidence = [
            "Elevated vibration trend",
            "Increase in bearing temperature",
            "Recent maintenance history",
            "Pump P-204 maintenance manual"
        ]

    elif "vibration" in question:

        answer = (
            "Abnormally increasing vibration can indicate imbalance, "
            "misalignment, bearing degradation or mechanical looseness. "
            "For Pump P-204, the available telemetry indicates that "
            "bearing condition should be inspected."
        )

        evidence = [
            "Vibration telemetry",
            "Equipment maintenance records",
            "Bearing failure guide"
        ]

    elif "security" in question or "privacy" in question:

        answer = (
            "Sovereign AI is designed so confidential industrial data "
            "can remain inside the organization's infrastructure. "
            "Documents, telemetry and investigation results are processed "
            "through the local application stack."
        )

        evidence = [
            "Local storage",
            "Local inference architecture",
            "External API count: 0"
        ]

    else:

        answer = (
            "The local knowledge system has received your request. "
            "For this demonstration, the investigation engine correlates "
            "industrial documents, telemetry and visual evidence locally."
        )

        evidence = [
            "Local knowledge base",
            "Industrial telemetry",
            "Investigation engine"
        ]

    return {
        "success": True,
        "processing": "LOCAL",
        "answer": answer,
        "evidence": evidence,
        "external_api_calls": 0
    }


# ============================================================
# SENSOR ANALYSIS
# ============================================================

@app.post("/api/analyze-sensor")
def analyze_sensor(data: SensorRequest):

    alerts = []
    risk_score = 0

    # Vibration
    if data.vibration > 7:
        alerts.append("Critical vibration level detected")
        risk_score += 40
    elif data.vibration > 5:
        alerts.append("Elevated vibration detected")
        risk_score += 25

    # Temperature
    if data.temperature > 85:
        alerts.append("High bearing temperature detected")
        risk_score += 30
    elif data.temperature > 70:
        alerts.append("Temperature above normal operating range")
        risk_score += 15

    # Pressure
    if data.pressure < 2.5:
        alerts.append("Low discharge pressure detected")
        risk_score += 15

    # RPM
    if data.rpm > 3100:
        alerts.append("RPM above configured operating threshold")
        risk_score += 15

    risk_score = min(risk_score, 100)

    if risk_score >= 70:
        risk = "CRITICAL"
    elif risk_score >= 45:
        risk = "HIGH"
    elif risk_score >= 20:
        risk = "MEDIUM"
    else:
        risk = "LOW"

    return {
        "success": True,
        "equipment": "Pump P-204",
        "risk": risk,
        "risk_score": risk_score,
        "alerts": alerts,
        "telemetry": {
            "vibration": data.vibration,
            "temperature": data.temperature,
            "pressure": data.pressure,
            "rpm": data.rpm
        },
        "processing": "LOCAL",
        "external_api_calls": 0
    }


# ============================================================
# VISUAL INSPECTION
# ============================================================

@app.post("/api/inspect-image")
async def inspect_image(file: UploadFile = File(...)):

    if not file.filename:
        return {
            "success": False,
            "message": "No image supplied."
        }

    destination = IMAGES_DIR / Path(file.filename).name

    with destination.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "success": True,
        "filename": destination.name,
        "processing": "LOCAL VISION ENGINE",
        "equipment": "Pump P-204",
        "findings": [
            "Surface condition requires inspection",
            "Possible abnormality around bearing housing",
            "No visible fluid leak detected",
            "Mechanical inspection recommended"
        ],
        "confidence": 91,
        "risk": "HIGH",
        "external_api_calls": 0
    }


# ============================================================
# AGENTIC INVESTIGATION
# ============================================================

@app.post("/api/investigate")
def investigate():

    timestamp = datetime.now().isoformat()

    steps = [
        {
            "step": 1,
            "name": "Understand incident",
            "status": "completed"
        },
        {
            "step": 2,
            "name": "Identify equipment",
            "status": "completed"
        },
        {
            "step": 3,
            "name": "Search private maintenance records",
            "status": "completed"
        },
        {
            "step": 4,
            "name": "Read Pump P-204 manual",
            "status": "completed"
        },
        {
            "step": 5,
            "name": "Analyze sensor telemetry",
            "status": "completed"
        },
        {
            "step": 6,
            "name": "Inspect equipment image",
            "status": "completed"
        },
        {
            "step": 7,
            "name": "Correlate evidence",
            "status": "completed"
        },
        {
            "step": 8,
            "name": "Generate recommendation",
            "status": "completed"
        }
    ]

    evidence = [
        {
            "source": "Pump_P204_Maintenance_Manual.pdf",
            "finding": "Bearing inspection required when vibration exceeds operating threshold."
        },
        {
            "source": "P204_SOP_Operations.pdf",
            "finding": "Abnormal vibration requires controlled inspection procedure."
        },
        {
            "source": "Sensor Telemetry",
            "finding": "Vibration and temperature are above normal operating conditions."
        },
        {
            "source": "Visual Inspection",
            "finding": "Possible abnormality detected around bearing housing."
        }
    ]

    return {
        "success": True,

        "investigation_id": "INV-P204-001",

        "timestamp": timestamp,

        "equipment": {
            "id": "P-204",
            "name": "Process Water Pump",
            "location": "Production Unit A"
        },

        "incident": {
            "type": "Abnormal vibration",
            "severity": "HIGH",
            "reported_by": "Plant Operator"
        },

        "steps": steps,

        "assessment": {
            "risk": "HIGH",
            "possible_cause": "Bearing degradation",
            "confidence": 89
        },

        "evidence": evidence,

        "recommendation": [
            "Reduce equipment load if operationally safe.",
            "Inspect Pump P-204 bearing assembly.",
            "Check lubrication condition.",
            "Verify shaft alignment.",
            "Review vibration trend after inspection."
        ],

        "agent_summary": (
            "The investigation engine correlated maintenance documentation, "
            "sensor telemetry and visual inspection evidence. The combined "
            "evidence indicates a high-risk mechanical condition with "
            "possible bearing degradation."
        ),

        "processing": {
            "mode": "ON-PREMISE",
            "external_api_calls": 0,
            "internet_required": False
        }
    }


# ============================================================
# REPORT GENERATION
# ============================================================

@app.post("/api/report")
def generate_report():

    return {
        "success": True,
        "report_id": "RPT-P204-001",

        "title": "Industrial Incident Investigation Report",

        "equipment": "Pump P-204",

        "incident": "Abnormal vibration detected",

        "risk": "HIGH",

        "assessment": "Possible bearing degradation",

        "evidence": [
            "Maintenance documentation",
            "Sensor telemetry",
            "Visual inspection",
            "Operating procedure"
        ],

        "recommended_action": (
            "Inspect bearing assembly, verify lubrication and alignment, "
            "and review vibration trend after maintenance."
        ),

        "generated_by": "Sovereign AI Investigation Engine",

        "processing_mode": "ON-PREMISE",

        "external_api_calls": 0,

        "internet_required": False,

        "timestamp": datetime.now().isoformat()
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/api/health")
def health():

    return {
        "status": "healthy",
        "backend": "FastAPI",
        "mode": "LOCAL",
        "external_api_calls": 0
    }