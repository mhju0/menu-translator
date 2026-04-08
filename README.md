# Korean Menu Translator

Full-stack web application that turns a photo of a Korean restaurant menu into structured, multilingual dish entries. The pipeline runs **Azure Computer Vision (Read API)** for OCR, then **Azure OpenAI** to normalize and enrich each line into JSON (translations, short descriptions, prices, spice level, allergens, and category).

## Overview

Users upload a menu image, pick a target language, and receive a parsed menu: original Korean text, translated names, optional descriptions, KRW prices, spice indicators, allergen tags, and grouping (main, side, drink, dessert). Scan results are persisted so recent sessions can be reopened from a history view.

## Features

- Image upload with drag-and-drop and preview
- Target language selection on the client
- Structured menu cards with metadata per dish
- Scan history (latest 20) with detail retrieval
- Health endpoint for service checks

## Tech stack

| Layer | Technologies |
|--------|----------------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS |
| Backend | Python 3, FastAPI, Uvicorn |
| Persistence | SQLAlchemy, SQLite (`menu_translator.db`, auto-created, gitignored) |
| API contracts | Pydantic request/response models |
| OCR | Azure Computer Vision Read API v3.2 |
| LLM | Azure OpenAI Chat Completions (deployment configurable, e.g. `gpt-4.1-mini`) |

## Implementation notes

- **Backend**: REST routes under `/api`, multipart upload handling, dependency-injected DB sessions, HTTP error mapping for OCR/LLM failures.
- **OCR integration**: asynchronous job pattern via `Operation-Location` polling (1s interval, up to 30 attempts).
- **LLM integration**: `response_format={"type": "json_object"}` with a Korean system prompt defining the output schema; low temperature for stable extraction.
- **Frontend**: typed `fetch` helpers, form-data upload to the scan endpoint, no-store reads for history.

## Architecture

```
Browser  --multipart-->  FastAPI  /api/scan
                            |
                            +--> Azure Computer Vision  (image → text)
                            |
                            +--> Azure OpenAI  (text → structured menu JSON)
                            |
                            +--> SQLite  (scan history)
```

## Repository layout

```
menu-translator/
├── backend/
│   ├── app/
│   │   ├── main.py              # App entry, CORS, router mount
│   │   ├── database.py          # Engine, session, ScanHistory model
│   │   ├── routers/scan.py      # Scan and history endpoints
│   │   ├── services/ocr.py      # Azure CV client
│   │   ├── services/translator.py
│   │   └── models/schemas.py    # Pydantic models
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    └── src/
        ├── app/                 # Routes and layout
        ├── components/
        └── lib/api.ts           # API client
```

## Configuration

Copy the example environment file and set Azure credentials:

```bash
cp backend/.env.example backend/.env
```

`backend/.env`:

```env
AZURE_CV_KEY=...
AZURE_CV_ENDPOINT=https://<your-resource>.cognitiveservices.azure.com/
AZURE_OPENAI_KEY=...
AZURE_OPENAI_ENDPOINT=https://<your-resource>.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4.1-mini
AZURE_OPENAI_API_VERSION=2024-10-21
```

Do not commit real secrets; `backend/.env` is ignored by git.

## Running locally

**Backend**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Health check: http://localhost:8000/api/health

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:3000

Override the API base URL with `NEXT_PUBLIC_API_BASE` (e.g. in `frontend/.env.local`) if the backend is not on `http://localhost:8000`.

## API

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/scan` | `multipart/form-data`: `image`, `target_language` |
| `GET` | `/api/history` | Latest 20 scans (summary) |
| `GET` | `/api/history/{id}` | Full result for one scan |
| `GET` | `/api/health` | Liveness |

### Example `POST /api/scan` response

```json
{
  "id": 1,
  "target_language": "English",
  "raw_text": "김치찌개 9000\n...",
  "result": {
    "restaurant_name": "할머니집",
    "items": [
      {
        "original": "김치찌개",
        "translated": "Kimchi Stew",
        "description": "Spicy fermented cabbage stew with pork and tofu.",
        "price": 9000,
        "spicy_level": 2,
        "allergens": ["soy"],
        "category": "main"
      }
    ]
  },
  "created_at": "2026-04-08T12:34:56"
}
```

## Notes

- CORS allows `http://localhost:3000` for local development; tighten origins for production.
- A production deployment would typically add authentication, rate limiting, observability, and hardened secret management.
