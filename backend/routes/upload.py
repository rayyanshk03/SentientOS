import asyncio
import os
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from pydantic import BaseModel
import io
from docx import Document
from pypdf import PdfReader
from parcle import save_memory
from database import get_collections
from datetime import datetime

router = APIRouter()

MAX_FILE_SIZE = 10 * 1024 * 1024 # 10MB

def chunk_text(text: str, max_words=500, overlap=50):
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = words[i:i + max_words]
        chunks.append(" ".join(chunk))
        if i + max_words >= len(words):
            break
        i += max_words - overlap
    return chunks

@router.post("/upload")
async def upload_file(file: UploadFile = File(...), projectId: str = Form("default-project")):
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    filename = file.filename
    ext = filename.split(".")[-1].lower() if "." in filename else ""
    text = ""

    try:
        if ext in ["txt", "md"]:
            text = contents.decode("utf-8", errors="ignore")
        elif ext == "pdf":
            reader = PdfReader(io.BytesIO(contents))
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        elif ext == "docx":
            doc = Document(io.BytesIO(contents))
            for para in doc.paragraphs:
                text += para.text + "\n"
        elif ext in ["png", "jpg", "jpeg", "svg", "webp", "gif"]:
            text = f"[Visual Diagram / Image Uploaded] Filename: {filename}"
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract text: {str(e)}")

    if not text.strip():
        raise HTTPException(status_code=400, detail="Document contains no readable text")

    chunks = chunk_text(text, 500, 50)
    sem = asyncio.Semaphore(10) # 10 concurrent requests max

    async def save_chunk(i, chunk):
        async with sem:
            title = f"{filename} — Part {i+1} of {len(chunks)}"
            tags = ["uploaded-doc", filename, projectId, "knowledge-base"]
            try:
                session_id = await save_memory(title, chunk, tags)
                return 1 if session_id else 0
            except Exception as e:
                print(f"[Upload] Failed to save chunk {i+1}: {e}")
                return 0

    results = await asyncio.gather(*(save_chunk(i, chunk) for i, chunk in enumerate(chunks)))
    stored_chunks = sum(results)

    UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb") as f:
        f.write(contents)

    # Create a master memory so the LLM and the Sidebar know about the file URL
    master_title = f"File Uploaded: {filename}"
    master_content = f"The user uploaded a file named '{filename}'. It is safely stored locally.\n\nDownload/View Link: http://localhost:3002/api/uploads/{filename}\n\nThe file contains {len(text.split())} words of text."
    master_tags = ["decision", "uploaded-file", "document", projectId]
    try:
        await save_memory(master_title, master_content, master_tags)
    except Exception as e:
        print(f"[Upload] Failed to save master memory: {e}")

    try:
        cols = get_collections()
        if cols and cols.get("uploads") is not None:
            cols["uploads"].insert_one({
                "filename": filename,
                "projectId": projectId,
                "filePath": file_path,
                "chunksStored": stored_chunks,
                "totalWords": len(text.split()),
                "uploadedAt": datetime.utcnow()
            })
    except Exception as e:
        print(f"[Upload] Failed to log upload to MongoDB: {e}")

    return {
        "success": True,
        "filename": filename,
        "filePath": file_path,
        "chunksStored": stored_chunks,
        "totalWords": len(text.split())
    }

