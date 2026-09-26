import sys
import os
import json
import uuid
import shutil
from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# Add src path so we can import the pipeline
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "src"))
from inference import InferencePipeline  # type: ignore

from app.database import engine, Base
from app import models
Base.metadata.create_all(bind=engine)

from app.api import auth, health, player, coach, analyze

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="TalentTrack AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "http://localhost:5174", 
        "http://127.0.0.1:5174",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(health.router, prefix="/api")
app.include_router(player.router, prefix="/api")
app.include_router(coach.router, prefix="/api")
app.include_router(analyze.router, prefix="/api")

# Initialize the inference pipeline (loads models automatically)
pipeline = InferencePipeline(
    model_dir=os.path.join(os.path.dirname(os.path.dirname(__file__)), "models"),
    output_dir=os.path.join(os.path.dirname(os.path.dirname(__file__)), "outputs")
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

class AnalyzeRequest(BaseModel):
    video_filename: str

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "TalentTrack AI is running."}

@app.post("/upload-video")
async def upload_video(file: UploadFile = File(...)):
    """Upload a new athlete video."""
    if not file.filename or not file.filename.lower().endswith(('.mp4', '.avi', '.mov', '.mkv')):
        raise HTTPException(status_code=400, detail="Unsupported file format.")
        
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"message": "Video uploaded successfully", "video_filename": unique_filename}

@app.post("/analyze-video")
def analyze_video(request: AnalyzeRequest):
    """Analyze an uploaded video and generate an assessment."""
    video_path = os.path.join(UPLOAD_DIR, request.video_filename)
    
    if not os.path.exists(video_path):
        raise HTTPException(status_code=404, detail="Video not found.")
        
    result = pipeline.analyze_video(video_path)
    
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
        
    return result

@app.get("/assessment/{assessment_id}")
def get_assessment(assessment_id: str):
    """Fetch an already generated assessment by video ID."""
    # Based on our report generator logic, it saves as: {video_name}_assessment.json
    report_name = f"{os.path.splitext(assessment_id)[0]}_assessment.json"
    report_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "outputs", report_name)
    
    if not os.path.exists(report_path):
        raise HTTPException(status_code=404, detail="Assessment not found.")
        
    with open(report_path, "r") as f:
        data = json.load(f)
        
    return data
