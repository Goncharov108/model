#!/usr/bin/env python3
"""Мини-обвязка для Telegram-входа: текст сообщения -> поиск видео-ссылки -> video_note.

Примеры:
  python3 api/scripts/video_note_telegram.py "Глянь https://www.instagram.com/reel/ABC/"
  echo "https://youtube.com/watch?v=dQw4w9WgXcQ" | python3 api/scripts/video_note_telegram.py --stdin
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path


URL_RE = re.compile(r"https?://[^\s]+", re.IGNORECASE)
VIDEO_HOST_MARKERS = (
    "youtube.com",
    "youtu.be",
    "instagram.com",
    "facebook.com",
    "tiktok.com",
)


def extract_video_url(text: str) -> str | None:
    for raw in URL_RE.findall(text or ""):
        candidate = raw.rstrip(").,!?;:\"'")
        low = candidate.lower()
        if any(marker in low for marker in VIDEO_HOST_MARKERS):
            return candidate
    return None


def run_video_note(url: str, language: str, asr_model: str, asr_fallback: bool) -> tuple[int, dict]:
    script_path = Path(__file__).with_name("video_note.py")
    cmd = [
        sys.executable,
        str(script_path),
        url,
        "--language",
        language,
        "--asr-model",
        asr_model,
    ]
    cmd.append("--asr-fallback" if asr_fallback else "--no-asr-fallback")

    proc = subprocess.run(cmd, capture_output=True, text=True)
    stdout = (proc.stdout or "").strip()
    if not stdout:
        return proc.returncode, {
            "ok": False,
            "error": "EMPTY_OUTPUT",
            "details": (proc.stderr or "").strip() or "video_note не вернул stdout",
        }

    try:
        payload = json.loads(stdout)
    except json.JSONDecodeError:
        payload = {
            "ok": False,
            "error": "INVALID_JSON_OUTPUT",
            "raw": stdout[:4000],
            "stderr": (proc.stderr or "").strip(),
        }
    return proc.returncode, payload


def main() -> int:
    parser = argparse.ArgumentParser(description="Telegram-обвязка для video_note")
    parser.add_argument("message", nargs="?", help="Текст сообщения Telegram")
    parser.add_argument("--stdin", action="store_true", help="Читать текст сообщения из stdin")
    parser.add_argument("--language", default="ru,en", help="Языки для video_note (по умолчанию: ru,en)")
    parser.add_argument("--asr-model", default="small", help="Модель ASR (по умолчанию: small)")
    parser.add_argument(
        "--asr-fallback",
        action=argparse.BooleanOptionalAction,
        default=True,
        help="Передать в video_note включённый ASR-фолбэк",
    )
    args = parser.parse_args()

    text = args.message or ""
    if args.stdin:
        text = (sys.stdin.read() or "").strip()

    if not text.strip():
        print(
            json.dumps(
                {
                    "ok": False,
                    "error": "EMPTY_MESSAGE",
                    "hint": "Передайте текст сообщения с видео-ссылкой.",
                },
                ensure_ascii=False,
            )
        )
        return 1

    url = extract_video_url(text)
    if not url:
        print(
            json.dumps(
                {
                    "ok": False,
                    "error": "VIDEO_URL_NOT_FOUND",
                    "hint": "В тексте не найдена ссылка YouTube/Instagram/Facebook/TikTok.",
                },
                ensure_ascii=False,
            )
        )
        return 2

    code, payload = run_video_note(
        url=url,
        language=args.language,
        asr_model=args.asr_model,
        asr_fallback=args.asr_fallback,
    )

    out = {
        "ok": bool(payload.get("ok")),
        "source": "telegram-wrapper",
        "input_url": url,
        "video_note_exit_code": code,
        "result": payload,
    }
    print(json.dumps(out, ensure_ascii=False))
    return 0 if out["ok"] else 3


if __name__ == "__main__":
    sys.exit(main())
