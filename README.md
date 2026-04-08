# 한국어 메뉴 번역기 (Korean Menu Translator)

**한국 식당 메뉴 사진 한 장으로, 메뉴명·가격·설명·맵기·알레르기 정보까지 다국어로 정리해 주는 풀스택 웹 애플리케이션입니다.**

Azure Computer Vision(OCR)과 Azure OpenAI를 연동해, 실제 서비스에 가까운 형태로 **이미지 업로드 → 텍스트 추출 → 구조화된 JSON 번역/분석** 파이프라인을 구현했습니다.

---

## 채용 담당자분께

이 저장소는 **백엔드 API 설계**, **외부 클라우드 AI 연동**, **프론트엔드 UX**, **데이터 영속화**가 한 흐름으로 묶인 포트폴리오용 프로젝트입니다. 코드를 보시면 다음을 확인하실 수 있습니다.

| 영역 | 확인 포인트 |
|------|----------------|
| **백엔드** | FastAPI 라우팅, Pydantic 스키마 검증, SQLAlchemy로 스캔 이력 저장 |
| **AI 연동** | Azure CV Read API 비동기 폴링, Azure OpenAI JSON 모드·시스템 프롬프트 설계 |
| **프론트엔드** | Next.js(App Router), TypeScript, Tailwind 기반 반응형 UI 및 API 연동 |
| **품질** | CORS 구성, 에러 처리, 타입 안전성, 채용용으로 읽기 쉬운 구조 |

기술 스택과 실행 방법은 아래에 정리해 두었습니다. 로컬에서 직접 띄워 보시려면 Azure 리소스 키가 필요합니다(`.env` 설정).

---

## 프로젝트 개요

외국인 관광객이나 다국어 사용자가 **한국어 메뉴판만 있을 때** 주문을 결정하기 어렵다는 문제를 가정했습니다. 사용자는 메뉴 사진을 업로드하고 번역 언어(영어, 中文, 日本語 등)를 선택하면, 서버가 OCR로 텍스트를 뽑고 LLM이 **항목별 번역·요약 설명·가격·맵기 단계·알레르기·카테고리**를 구조화해 반환합니다. 결과는 DB에 저장되며, **히스토리 화면**에서 과거 스캔을 다시 열어볼 수 있습니다.

---

## 주요 기능

- **메뉴 이미지 스캔**: 드래그 앤 드롭 또는 클릭 업로드, 미리보기
- **다국어 출력**: 번역 대상 언어 선택(프론트 셀렉터)
- **구조화된 메뉴 카드**: 원문 / 번역 / 설명 / 가격 / 맵기 / 알레르기 / 카테고리(메인·사이드·음료·디저트)
- **스캔 이력**: 최근 스캔 목록 및 상세 조회(SQLite)
- **헬스 체크**: `/api/health`로 백엔드 상태 확인

---

## 기술 스택

| 구분 | 사용 기술 |
|------|-----------|
| **프론트엔드** | Next.js 16(App Router), React 19, TypeScript, Tailwind CSS |
| **백엔드** | Python 3, FastAPI, Uvicorn |
| **데이터** | SQLAlchemy, SQLite(`menu_translator.db`, 자동 생성·gitignore) |
| **검증·계약** | Pydantic 모델로 요청/응답 스키마 정의 |
| **OCR** | Azure Computer Vision Read API v3.2 |
| **LLM** | Azure OpenAI Chat Completions(`gpt-4.1-mini` 등, 배포명 설정 가능) |

---

## 아키텍처 개요

```
[브라우저]  --multipart-->  [FastAPI /api/scan]
                               |
                               +--> Azure CV (이미지 → 텍스트)
                               |
                               +--> Azure OpenAI (텍스트 → JSON 메뉴 구조)
                               |
                               +--> SQLite (스캔 이력 저장)
```

- OCR은 **Operation-Location 폴링**(1초 간격, 최대 30회)으로 완료를 기다립니다.
- LLM은 **`response_format: json_object`**로 JSON만 반환하도록 제한하고, 한국어 시스템 프롬프트로 필드 규칙을 명시합니다.

---

## 프로젝트 구조

```
menu-translator/
├── backend/                 # FastAPI 애플리케이션
│   ├── app/
│   │   ├── main.py        # 앱 진입점, CORS, 라우터 마운트
│   │   ├── database.py    # SQLite, ScanHistory 모델
│   │   ├── routers/
│   │   │   └── scan.py    # 스캔·히스토리 API
│   │   ├── services/
│   │   │   ├── ocr.py     # Azure Computer Vision 연동
│   │   │   └── translator.py  # Azure OpenAI 연동
│   │   └── models/
│   │       └── schemas.py # Pydantic 스키마
│   ├── requirements.txt
│   └── .env.example
└── frontend/              # Next.js 애플리케이션
    └── src/
        ├── app/           # 페이지·레이아웃
        ├── components/    # 업로더, 메뉴 카드, 언어 선택 등
        └── lib/api.ts     # 백엔드 fetch 래퍼
```

---

## 실행 방법

### 1. Azure 환경 변수

백엔드 예시 파일을 복사한 뒤 값을 채웁니다.

```bash
cp backend/.env.example backend/.env
```

`backend/.env` 예시:

```env
AZURE_CV_KEY=...
AZURE_CV_ENDPOINT=https://<your-resource>.cognitiveservices.azure.com/
AZURE_OPENAI_KEY=...
AZURE_OPENAI_ENDPOINT=https://<your-resource>.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4.1-mini
AZURE_OPENAI_API_VERSION=2024-10-21
```

**실제 키는 저장소에 커밋하지 마세요.** `backend/.env`는 gitignore 처리되어 있습니다.

### 2. 백엔드

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

- 상태 확인: [http://localhost:8000/api/health](http://localhost:8000/api/health)

### 3. 프론트엔드

```bash
cd frontend
npm install
npm run dev
```

- 브라우저: [http://localhost:3000](http://localhost:3000)

백엔드 주소를 바꿀 때는 `frontend/.env.local` 등에 `NEXT_PUBLIC_API_BASE`를 설정합니다.

---

## API 요약

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `POST` | `/api/scan` | `multipart/form-data`: `image`, `target_language` |
| `GET` | `/api/history` | 최근 스캔 20건 요약 |
| `GET` | `/api/history/{id}` | 단일 스캔 전체 결과 |
| `GET` | `/api/health` | 헬스 체크 |

### `POST /api/scan` 응답 예시

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

---

## 기타 참고

- CORS는 개발 편의를 위해 `http://localhost:3000`을 허용하도록 설정되어 있습니다. 배포 시 출처를 환경에 맞게 조정하세요.
- 본 프로젝트는 **학습·포트폴리오 목적**으로 작성되었으며, 상용 배포 시 보안·레이트 리밋·인증·로깅 등을 추가하는 것이 좋습니다.

---

## 문의

저장소 이슈 또는 이력서·포트폴리오에 기재된 연락처로 편하게 연락 주시면 됩니다. 이 프로젝트에 대한 기술 질문도 환영합니다.
