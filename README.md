# Korean Menu Translator

한국어 음식 메뉴 사진을 업로드하면 다국어로 번역된 메뉴 정보를 제공하는 풀스택 웹 애플리케이션입니다.

## 소개

사용자가 한국 식당 메뉴 사진을 촬영하여 업로드하면, Azure Computer Vision으로 텍스트를 추출하고 Azure OpenAI를 통해 각 메뉴 항목을 분석합니다. 원문, 번역명, 설명, 가격, 매운맛 정도, 알레르기 성분, 카테고리 등 구조화된 정보를 제공합니다.

## 주요 기능

- 드래그 앤 드롭 이미지 업로드 및 미리보기
- 5개 언어 지원 (영어, 중국어, 일본어, 스페인어, 프랑스어)
- 메뉴 항목별 상세 정보 카드 표시
- 최근 스캔 이력 조회 (최대 20건)
- IP 기반 요청 속도 제한
- 파일 크기 및 형식 검증

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프론트엔드 | Next.js 16, React 19, TypeScript, Tailwind CSS |
| 백엔드 | Python 3, FastAPI, Uvicorn |
| 데이터베이스 | SQLAlchemy, SQLite |
| OCR | Azure Computer Vision Read API v3.2 |
| LLM | Azure OpenAI Chat Completions |

## 프로젝트 구조

```
menu-translator/
├── backend/
│   ├── app/
│   │   ├── main.py                # 앱 진입점, CORS, 미들웨어
│   │   ├── database.py            # DB 엔진, 세션, 모델
│   │   ├── routers/scan.py        # 스캔 및 이력 API
│   │   ├── services/ocr.py        # Azure CV 클라이언트 (비동기)
│   │   ├── services/translator.py # Azure OpenAI 번역
│   │   └── models/schemas.py      # Pydantic 스키마
│   ├── requirements.txt
│   ├── .env.example
│   └── .env                       # 실제 키 (git 추적 제외)
└── frontend/
    └── src/
        ├── app/                   # 페이지 및 레이아웃
        ├── components/            # UI 컴포넌트
        └── lib/api.ts             # API 클라이언트
```

## 환경 설정

### 1. 백엔드 환경 변수

```bash
cp backend/.env.example backend/.env
```

`backend/.env` 파일에 Azure 자격 증명을 입력합니다:

```env
AZURE_CV_KEY=your-key
AZURE_CV_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
AZURE_OPENAI_KEY=your-key
AZURE_OPENAI_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4.1-mini
AZURE_OPENAI_API_VERSION=2024-10-21
ALLOWED_ORIGINS=http://localhost:3000
RATE_LIMIT_PER_MINUTE=15
```

### 2. 프론트엔드 환경 변수

```bash
# frontend/.env.local
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

> `.env` 파일에는 실제 키가 포함되므로 절대 커밋하지 마십시오. `.gitignore`에 이미 등록되어 있습니다.

## 실행 방법

### 백엔드

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

헬스 체크: `http://localhost:8000/api/health`

### 프론트엔드

```bash
cd frontend
npm install
npm run dev
```

접속: `http://localhost:3000`

## API 명세

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `POST` | `/api/scan` | 메뉴 이미지 스캔 (`multipart/form-data`: `image`, `target_language`) |
| `GET` | `/api/history` | 최근 스캔 이력 조회 |
| `GET` | `/api/history/{id}` | 특정 스캔 상세 조회 |
| `GET` | `/api/health` | 서버 상태 확인 |

### 응답 예시 (`POST /api/scan`)

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
  "created_at": "2026-04-10T12:34:56"
}
```

## 보안

- CORS 허용 출처는 `ALLOWED_ORIGINS` 환경 변수로 관리
- `/api/scan` 엔드포인트에 IP 기반 속도 제한 적용 (기본 15회/분)
- 업로드 파일 크기 제한 (최대 10MB) 및 형식 검증 (JPG, PNG, WebP, HEIC)
- 내부 오류 메시지는 클라이언트에 노출되지 않음
- 운영 환경에서는 `DISABLE_DOCS=1`로 Swagger 문서 비활성화 가능

## 라이선스

이 프로젝트는 내부 학습 및 개발 목적으로 작성되었습니다.
