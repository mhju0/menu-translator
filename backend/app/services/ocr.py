import os
import time
from typing import List

import requests

POLL_INTERVAL_SECONDS = 1.0
MAX_POLL_ATTEMPTS = 30


def _get_config() -> tuple[str, str]:
    key = os.getenv("AZURE_CV_KEY")
    endpoint = os.getenv("AZURE_CV_ENDPOINT")
    if not key or not endpoint:
        raise RuntimeError(
            "Azure Computer Vision credentials are not configured. "
            "Set AZURE_CV_KEY and AZURE_CV_ENDPOINT in backend/.env"
        )
    return key, endpoint.rstrip("/")


def extract_text_from_image(image_bytes: bytes) -> str:
    """Run Azure Computer Vision Read API on the given image bytes.

    Returns the concatenated text lines (top-to-bottom).
    """
    key, endpoint = _get_config()

    submit_url = f"{endpoint}/vision/v3.2/read/analyze"
    headers = {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/octet-stream",
    }
    response = requests.post(submit_url, headers=headers, data=image_bytes, timeout=30)
    if response.status_code != 202:
        raise RuntimeError(
            f"Azure CV submit failed: {response.status_code} {response.text}"
        )

    operation_url = response.headers.get("Operation-Location")
    if not operation_url:
        raise RuntimeError("Azure CV did not return Operation-Location header")

    poll_headers = {"Ocp-Apim-Subscription-Key": key}
    for _ in range(MAX_POLL_ATTEMPTS):
        time.sleep(POLL_INTERVAL_SECONDS)
        poll = requests.get(operation_url, headers=poll_headers, timeout=30)
        poll.raise_for_status()
        payload = poll.json()
        status = payload.get("status")
        if status == "succeeded":
            return _extract_lines(payload)
        if status == "failed":
            raise RuntimeError("Azure CV OCR failed")

    raise TimeoutError("Azure CV OCR polling timed out")


def _extract_lines(payload: dict) -> str:
    lines: List[str] = []
    analyze_result = payload.get("analyzeResult", {})
    for read_result in analyze_result.get("readResults", []):
        for line in read_result.get("lines", []):
            text = line.get("text")
            if text:
                lines.append(text)
    return "\n".join(lines)
