from collections.abc import AsyncIterator

from google import genai
from google.genai import types

from app.config import settings

_client = genai.Client(api_key=settings.gemini_api_key)


async def stream_reply(persona_text: str, history: list[dict], message: str) -> AsyncIterator[str]:
    contents = []
    for turn in history:
        role = "user" if turn.get("role") == "user" else "model"
        text = (turn.get("text") or "").strip()
        if text:
            contents.append(types.Content(role=role, parts=[types.Part(text=text)]))
    contents.append(types.Content(role="user", parts=[types.Part(text=message)]))

    stream = await _client.aio.models.generate_content_stream(
        model=settings.gemini_model,
        contents=contents,
        config=types.GenerateContentConfig(system_instruction=persona_text),
    )
    async for chunk in stream:
        if chunk.text:
            yield chunk.text
