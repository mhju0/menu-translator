# 🍜 Korean Menu Translator

Snap a photo of a Korean restaurant menu, get instant per-item translations,
descriptions, prices, spice levels, and allergen warnings — powered by Azure
Computer Vision (OCR) and Azure OpenAI (gpt-4.1-mini).

## Stack
- **Backend:** FastAPI, SQLAlchemy (SQLite)
- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS
- **OCR:** Azure Computer Vision Read API (v3.2)
- **LLM:** Azure OpenAI Chat Completions (`gpt-4.1-mini`)

## Project layout
```
menu-translator/
├── backend/   # FastAPI app
└── frontend/  # Next.js app
```

## 1. Configure secrets

Copy the example file and fill in your Azure credentials:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```
AZURE_CV_KEY=...
AZURE_CV_ENDPOINT=https://<your-resource>.cognitiveservices.azure.com/
AZURE_OPENAI_KEY=...
AZURE_OPENAI_ENDPOINT=https://<your-resource>.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4.1-mini
AZURE_OPENAI_API_VERSION=2024-10-21
```

> `backend/.env` is gitignored. **Never commit real keys.**

## 2. Run the backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Health check: <http://localhost:8000/api/health>

## 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:3000>.

To point at a non-default backend, set `NEXT_PUBLIC_API_BASE` (e.g. in
`frontend/.env.local`).

## API

| Method | Path                  | Description                              |
| ------ | --------------------- | ---------------------------------------- |
| POST   | `/api/scan`           | Multipart upload — `image`, `target_language` |
| GET    | `/api/history`        | Latest 20 scans                          |
| GET    | `/api/history/{id}`   | Single scan with full result             |
| GET    | `/api/health`         | Liveness probe                           |

### `POST /api/scan` response shape
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
- The SQLite file `menu_translator.db` is created automatically on first run
  and is gitignored.
- OCR uses simple polling at 1-second intervals (max 30 attempts).
- The LLM is instructed to always return strict JSON via
  `response_format={"type": "json_object"}`.
