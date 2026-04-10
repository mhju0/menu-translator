import os

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routers import scan

app = FastAPI(
    title="Korean Menu Translator API",
    docs_url=None if os.getenv("DISABLE_DOCS") else "/docs",
    redoc_url=None if os.getenv("DISABLE_DOCS") else "/redoc",
)

_allowed_origins = [
    o.strip()
    for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Accept"],
)

# ---------------------------------------------------------------------------
# Simple in-memory rate limiter (per-IP, per-minute)
# ---------------------------------------------------------------------------
import time
from collections import defaultdict

_rate_store: dict[str, list[float]] = defaultdict(list)
RATE_LIMIT = int(os.getenv("RATE_LIMIT_PER_MINUTE", "15"))


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    if request.url.path == "/api/scan" and request.method == "POST":
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        window = _rate_store[client_ip]
        # Prune entries older than 60 s
        _rate_store[client_ip] = [t for t in window if now - t < 60]
        if len(_rate_store[client_ip]) >= RATE_LIMIT:
            return Response(
                content='{"detail":"Rate limit exceeded. Try again later."}',
                status_code=429,
                media_type="application/json",
            )
        _rate_store[client_ip].append(now)
    return await call_next(request)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


app.include_router(scan.router, prefix="/api")
