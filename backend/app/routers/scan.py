import asyncio
import json
import logging
from datetime import datetime
from functools import partial
from typing import List

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database import ScanHistory, get_db
from app.models.schemas import (
    HistoryDetail,
    HistoryItem,
    MenuResult,
    ScanResponse,
)
from app.services.ocr import extract_text_from_image
from app.services.translator import translate_menu

logger = logging.getLogger(__name__)

router = APIRouter()

MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/heic"}


@router.post("/scan", response_model=ScanResponse)
async def scan_menu(
    image: UploadFile = File(...),
    target_language: str = Form("English"),
    db: Session = Depends(get_db),
) -> ScanResponse:
    if not image.content_type or image.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Upload JPG, PNG, WebP, or HEIC.",
        )

    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty image")

    if len(image_bytes) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=413, detail="Image too large. Maximum size is 10 MB."
        )

    try:
        raw_text = await extract_text_from_image(image_bytes)
    except Exception as exc:
        logger.exception("OCR failed")
        raise HTTPException(
            status_code=502, detail="OCR service is unavailable. Please try again."
        ) from exc

    if not raw_text.strip():
        raise HTTPException(status_code=422, detail="No text detected in image")

    try:
        # translate_menu is synchronous (OpenAI SDK) — run in thread pool
        result_dict = await asyncio.get_event_loop().run_in_executor(
            None, partial(translate_menu, raw_text, target_language)
        )
    except Exception as exc:
        logger.exception("Translation failed")
        raise HTTPException(
            status_code=502,
            detail="Translation service is unavailable. Please try again.",
        ) from exc

    result = MenuResult(**result_dict)

    record = ScanHistory(
        image_filename=image.filename,
        result_json=json.dumps(result.model_dump(), ensure_ascii=False),
        target_language=target_language,
        created_at=datetime.utcnow(),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return ScanResponse(
        id=record.id,
        target_language=target_language,
        raw_text=raw_text,
        result=result,
        created_at=record.created_at,
    )


@router.get("/history", response_model=List[HistoryItem])
def list_history(db: Session = Depends(get_db)) -> List[HistoryItem]:
    rows = (
        db.query(ScanHistory)
        .order_by(ScanHistory.created_at.desc())
        .limit(20)
        .all()
    )
    items: List[HistoryItem] = []
    for row in rows:
        try:
            data = json.loads(row.result_json)
        except json.JSONDecodeError:
            data = {"restaurant_name": None, "items": []}
        items.append(
            HistoryItem(
                id=row.id,
                target_language=row.target_language,
                created_at=row.created_at,
                restaurant_name=data.get("restaurant_name"),
                item_count=len(data.get("items", [])),
            )
        )
    return items


@router.get("/history/{scan_id}", response_model=HistoryDetail)
def get_history_detail(scan_id: int, db: Session = Depends(get_db)) -> HistoryDetail:
    row = db.query(ScanHistory).filter(ScanHistory.id == scan_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Scan not found")
    try:
        data = json.loads(row.result_json)
    except json.JSONDecodeError:
        data = {"restaurant_name": None, "items": []}
    return HistoryDetail(
        id=row.id,
        target_language=row.target_language,
        created_at=row.created_at,
        result=MenuResult(**data),
    )
