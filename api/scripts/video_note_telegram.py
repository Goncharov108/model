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
from typing import Iterable


URL_RE = re.compile(r"https?://[^\s]+", re.IGNORECASE)
VIDEO_HOST_MARKERS = (
    "youtube.com",
    "youtu.be",
    "instagram.com",
    "facebook.com",
    "tiktok.com",
)


def _truncate(text: str, limit: int = 450) -> str:
    clean = " ".join((text or "").split())
    if len(clean) <= limit:
        return clean
    return clean[: limit - 1].rstrip() + "…"


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


def _note_to_text(note_value: object) -> str:
    if isinstance(note_value, str):
        return note_value.strip()
    if isinstance(note_value, dict):
        for key in ("short_summary", "summary", "text"):
            value = note_value.get(key)
            if isinstance(value, str) and value.strip():
                return value.strip()
        try:
            return json.dumps(note_value, ensure_ascii=False)
        except TypeError:
            return str(note_value)
    if note_value is None:
        return ""
    return str(note_value).strip()


def render_human_success(url: str, payload: dict) -> str:
    note = _note_to_text(payload.get("note"))
    transcript = str(payload.get("transcript") or "").strip()
    keywords = payload.get("keywords") or []
    if not isinstance(keywords, list):
        keywords = []

    lines = [
        "Готово. Обработал видео-ссылку.",
        f"Ссылка: {url}",
    ]
    if note:
        lines.extend(["", "Краткая заметка:", _truncate(note, 700)])
    if keywords:
        lines.append("")
        lines.append("Ключевые слова: " + ", ".join(str(k) for k in keywords[:8]))
    if transcript:
        lines.extend(["", "Фрагмент расшифровки:", _truncate(transcript, 500)])
    return "\n".join(lines)


def render_human_error(error: str, hint: str = "") -> str:
    base = {
        "EMPTY_MESSAGE": "Не получил текст сообщения.",
        "VIDEO_URL_NOT_FOUND": "Не нашёл видео-ссылку в сообщении.",
        "EMPTY_OUTPUT": "Скрипт обработки не вернул результат.",
        "INVALID_JSON_OUTPUT": "Скрипт обработки вернул некорректный ответ.",
    }.get(error, "Не удалось обработать сообщение.")
    if hint:
        return f"{base}\n{hint}"
    return base


def _split_sentences(text: str) -> list[str]:
    chunks = re.split(r"(?<=[.!?])\s+|\n+", text or "")
    out: list[str] = []
    for chunk in chunks:
        clean = " ".join(chunk.split()).strip("-• ")
        if len(clean) >= 24:
            out.append(clean)
    return out


def _unique_keep_order(items: Iterable[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for item in items:
        key = item.lower().strip()
        if not key or key in seen:
            continue
        seen.add(key)
        out.append(item)
    return out


def render_human_briefing(url: str, payload: dict) -> str:
    note = _note_to_text(payload.get("note"))
    transcript = str(payload.get("transcript") or "").strip()
    merged_text = "\n".join(part for part in (note, transcript) if part)
    sentences = _split_sentences(merged_text)

    thesis = _unique_keep_order(sentences[:5])

    arg_markers = ("потому", "так как", "поэтому", "следовательно", "доказ", "например", "факт", "цифр", "%")
    arguments = [s for s in sentences if any(m in s.lower() for m in arg_markers)]
    arguments = _unique_keep_order(arguments)[:5]

    rec_markers = ("нужно", "стоит", "рекоменду", "совет", "лучше", "сделайте", "делай", "делайте", "начните", "попробуйте")
    recommendations = [s for s in sentences if any(m in s.lower() for m in rec_markers)]
    recommendations = _unique_keep_order(recommendations)[:5]

    lines = [
        "Готово. Разобрал видео и собрал конспект.",
        f"Ссылка: {url}",
        "",
        "Основные тезисы:",
    ]
    if thesis:
        lines.extend([f"- {_truncate(t, 220)}" for t in thesis])
    else:
        lines.append("- Недостаточно данных для выделения тезисов.")

    lines.extend(["", "Аргументы автора:"])
    if arguments:
        lines.extend([f"- {_truncate(a, 220)}" for a in arguments])
    else:
        lines.append("- Явные аргументы в расшифровке не выделились.")

    lines.extend(["", "Рекомендации автора (оценка: дельные/не дельные):"])
    if recommendations:
        for rec in recommendations:
            rec_low = rec.lower()
            score = "дельная"
            why = "практическая и применимая"
            if any(x in rec_low for x in ("всегда", "никогда", "100%", "гарант")):
                score = "спорная"
                why = "слишком категоричная формулировка"
            lines.append(f"- {_truncate(rec, 180)} — {score}, {why}.")
    else:
        lines.append("- Явные практические рекомендации не обнаружены.")

    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Telegram-обвязка для video_note")
    parser.add_argument("message", nargs="?", help="Текст сообщения Telegram")
    parser.add_argument("--stdin", action="store_true", help="Читать текст сообщения из stdin")
    parser.add_argument(
        "--human",
        action="store_true",
        help="Вернуть короткий человекочитаемый текст вместо JSON",
    )
    parser.add_argument(
        "--brief",
        action="store_true",
        help="Вернуть структурный конспект: тезисы, аргументы, рекомендации автора",
    )
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
        error = "EMPTY_MESSAGE"
        hint = "Передайте текст сообщения с видео-ссылкой."
        if args.human or args.brief:
            print(render_human_error(error, hint))
        else:
            print(json.dumps({"ok": False, "error": error, "hint": hint}, ensure_ascii=False))
        return 1

    url = extract_video_url(text)
    if not url:
        error = "VIDEO_URL_NOT_FOUND"
        hint = "В тексте не найдена ссылка YouTube/Instagram/Facebook/TikTok."
        if args.human or args.brief:
            print(render_human_error(error, hint))
        else:
            print(json.dumps({"ok": False, "error": error, "hint": hint}, ensure_ascii=False))
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

    if args.human or args.brief:
        if out["ok"]:
            if args.brief:
                print(render_human_briefing(url=url, payload=payload))
            else:
                print(render_human_success(url=url, payload=payload))
        else:
            err = str(payload.get("error") or "UNKNOWN_ERROR")
            hint = str(payload.get("hint") or payload.get("details") or "")
            print(render_human_error(err, hint))
    else:
        print(json.dumps(out, ensure_ascii=False))

    return 0 if out["ok"] else 3


if __name__ == "__main__":
    sys.exit(main())
