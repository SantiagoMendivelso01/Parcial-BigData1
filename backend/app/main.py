from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, tracks, invoices
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Chinook Music Store API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend EC2 IP in production
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
#AQWR
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(tracks.router, prefix="/api/tracks", tags=["tracks"])
app.include_router(invoices.router, prefix="/api/invoices", tags=["invoices"])

@app.get("/")
def root():
    return {"message": "Chinook Music Store API running"}

@app.get("/health")
def health():
    return {"status": "ok"}
