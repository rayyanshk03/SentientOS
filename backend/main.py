import os
import sys
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Ensure backend is in python path and .env is loaded
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.append(backend_dir)
load_dotenv(os.path.join(backend_dir, '..', '.env'))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from database import connect_to_mongo
from routes import agent, memories, stats, upload, standup, identity, adr, bugs, knowledge

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Eternal Architect API running")
    connect_to_mongo()
    yield

app = FastAPI(title="Eternal Architect API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health():
    return {"status": "ok"}

from fastapi.staticfiles import StaticFiles

uploads_dir = os.path.join(backend_dir, "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/api/uploads", StaticFiles(directory=uploads_dir), name="uploads")

app.include_router(agent.router, prefix="/api")
app.include_router(memories.router, prefix="/api")
app.include_router(stats.router, prefix="/api")
app.include_router(upload.router, prefix="/api")
app.include_router(standup.router, prefix="/api")
app.include_router(identity.router, prefix="/api/identity")
app.include_router(adr.router, prefix="/api")
app.include_router(bugs.router, prefix="/api")
app.include_router(knowledge.router, prefix="/api")
if __name__ == "__main__":
    # Change to backend directory so uvicorn's reloader can resolve 'main:app'
    os.chdir(backend_dir)
    uvicorn.run("main:app", host="0.0.0.0", port=3002, reload=True)
