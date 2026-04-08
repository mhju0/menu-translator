import json
import os
from typing import Any, Dict

from openai import AzureOpenAI

SYSTEM_PROMPT_TEMPLATE = """너는 한국 음식 메뉴 번역 전문가야.
OCR로 추출된 한국어 메뉴 텍스트를 받아서 각 메뉴 항목을 분석해.
번역 대상 언어: {target_language}

반드시 아래 JSON 형식만 반환해 (다른 텍스트, 마크다운 코드 펜스 금지):
{{
  "restaurant_name": "가게명 (없으면 null)",
  "items": [
    {{
      "original": "한국어 원문",
      "translated": "{target_language}로 번역한 메뉴 이름",
      "description": "{target_language}로 작성한 이 음식에 대한 짧은 설명",
      "price": 가격숫자 또는 null,
      "spicy_level": 0-3 사이 정수 (0=안매움, 3=매우매움),
      "allergens": ["알레르기 성분 리스트"],
      "category": "main / side / drink / dessert 중 하나"
    }}
  ]
}}

규칙:
- 가게 이름이 명확하지 않으면 restaurant_name은 null.
- 가격은 원화 숫자(예: 12000), 통화기호 없이. 모르면 null.
- OCR 노이즈/오타는 무시하고 메뉴 항목만 추출.
- items는 빈 배열일 수 있어.
"""


def _get_client() -> tuple[AzureOpenAI, str]:
    key = os.getenv("AZURE_OPENAI_KEY")
    endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4.1-mini")
    api_version = os.getenv("AZURE_OPENAI_API_VERSION", "2024-10-21")
    if not key or not endpoint:
        raise RuntimeError(
            "Azure OpenAI credentials are not configured. "
            "Set AZURE_OPENAI_KEY and AZURE_OPENAI_ENDPOINT in backend/.env"
        )
    client = AzureOpenAI(
        api_key=key,
        azure_endpoint=endpoint,
        api_version=api_version,
    )
    return client, deployment


def translate_menu(raw_text: str, target_language: str) -> Dict[str, Any]:
    """Send OCR text to Azure OpenAI and parse the JSON menu result."""
    client, deployment = _get_client()
    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(target_language=target_language)

    response = client.chat.completions.create(
        model=deployment,
        temperature=0.2,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": f"OCR로 추출된 메뉴 텍스트:\n{raw_text}",
            },
        ],
    )

    content = response.choices[0].message.content or "{}"
    try:
        data = json.loads(content)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"LLM did not return valid JSON: {content[:200]}") from exc

    data.setdefault("restaurant_name", None)
    data.setdefault("items", [])
    return data
