#!/usr/bin/env python3
"""Утилита: ссылка на видео -> транскрипт (если доступен) -> короткая заметка.

Поддержка:
- YouTube (watch, youtu.be, shorts): извлекает субтитры через youtube-transcript-api.
- Прочие платформы (reels/shorts без субтитров): возвращает понятный статус,
  что нужен ASR-фолбэк (Whisper/Faster-Whisper) и аудиодорожка.

Пример:
  python3 api/scripts/video_note.py "https://youtube.com/watch?v=dQw4w9WgXcQ"
  python3 api/scripts/video_note.py "https://youtube.com/shorts/VIDEO_ID" --language ru,en
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from urllib.parse import parse_qs, urlparse


STOPWORDS_RU = {
    "и", "в", "во", "на", "с", "со", "по", "за", "к", "ко", "от", "до", "для", "из", "у", "о", "об", "а", "но",
    "или", "это", "как", "что", "чтобы", "не", "ни", "мы", "вы", "они", "он", "она", "оно", "я", "ты", "же", "ли", "бы",
}

STOPWORDS_EN = {
    "the", "a", "an", "and", "or", "to", "of", "in", "on", "for", "with", "is", "are", "was", "were", "be", "as", "at",
    "it", "this", "that", "from", "by", "we", "you", "they", "he", "she", "i", "not",
}


def parse_video_id(url_or_id: str) -> tuple[str | None, str]:
    raw = url_or_id.strip()
    if re.fullmatch(r"[A-Za-z0-9_-]{11}", raw):
        return raw, "youtube"

    parsed = urlparse(raw)
    host = parsed.netloc.lower()
    path = parsed.path

    if "youtube.com" in host:
        if path.startswith("/watch"):
            video_id = parse_qs(parsed.query).get("v", [None])[0]
            return video_id, "youtube"
        if path.startswith("/shorts/"):
            parts = path.split("/")
            return parts[2] if len(parts) > 2 else None, "youtube"

    if "youtu.be" in host:
        video_id = path.lstrip("/").split("/")[0]
        return video_id or None, "youtube"

    if "instagram.com" in host or "facebook.com" in host or "tiktok.com" in host:
        return None, "social"

    return None, "unknown"


def summarize_transcript(text: str, max_sentences: int = 5) -> dict:
    cleaned = re.sub(r"\s+", " ", text).strip()
    if not cleaned:
        return {
            "short_summary": "Пустой транскрипт.",
            "bullet_points": [],
            "keywords": [],
            "word_count": 0,
        }

    sentences = re.split(r"(?<=[.!?])\s+", cleaned)
    picked = [s.strip() for s in sentences if s.strip()][:max_sentences]

    words = re.findall(r"[A-Za-zА-Яа-яЁё0-9_-]{3,}", cleaned.lower())
    words = [w for w in words if w not in STOPWORDS_RU and w not in STOPWORDS_EN]
    keywords = [w for w, _ in Counter(words).most_common(8)]

    bullets = []
    for sentence in picked[:4]:
        bullets.append(sentence[:240])

    return {
        "short_summary": " ".join(picked)[:1200],
        "bullet_points": bullets,
        "keywords": keywords,
        "word_count": len(cleaned.split()),
    }


def fetch_youtube_transcript(video_id: str, languages: list[str]) -> tuple[str, str]:
    try:
        from youtube_transcript_api import YouTubeTranscriptApi
    except Exception:
        raise RuntimeError("MISSING_DEPENDENCY: установите youtube-transcript-api")

    api = YouTubeTranscriptApi()
    transcript = api.fetch(video_id=video_id, languages=languages if languages else None)
    text_parts = [item.text.strip() for item in transcript if getattr(item, "text", "").strip()]
    language = getattr(transcript, "language_code", "unknown")
    return "\n".join(text_parts), language


def main() -> int:
    parser = argparse.ArgumentParser(description="Сделать заметку из видео")
    parser.add_argument("source", help="YouTube URL/ID или ссылка на рилс/шортс")
    parser.add_argument("--language", default="ru,en", help="Языки транскрипта через запятую (по умолчанию: ru,en)")
    args = parser.parse_args()

    languages = [x.strip() for x in args.language.split(",") if x.strip()]
    video_id, platform = parse_video_id(args.source)

    if platform == "youtube" and video_id:
        try:
            text, lang = fetch_youtube_transcript(video_id, languages)
            note = summarize_transcript(text)
            print(
                json.dumps(
                    {
                        "ok": True,
                        "platform": "youtube",
                        "video_id": video_id,
                        "language": lang,
                        "note": note,
                        "transcript": text,
                    },
                    ensure_ascii=False,
                )
            )
            return 0
        except Exception as exc:
            print(
                json.dumps(
                    {
                        "ok": False,
                        "platform": "youtube",
                        "video_id": video_id,
                        "error": str(exc),
                        "hint": "Если у видео выключены субтитры, используйте ASR-фолбэк (Whisper/Faster-Whisper) после получения аудио.",
                    },
                    ensure_ascii=False,
                )
            )
            return 2

    if platform == "social":
        print(
            json.dumps(
                {
                    "ok": False,
                    "platform": "social",
                    "error": "TRANSCRIPT_NOT_DIRECT",
                    "hint": "Для reels/части shorts нужен отдельный ASR-пайплайн: скачать аудио и распознать Whisper/Faster-Whisper.",
                },
                ensure_ascii=False,
            )
        )
        return 3

    print(
        json.dumps(
            {
                "ok": False,
                "platform": "unknown",
                "error": "UNSUPPORTED_LINK",
                "hint": "Поддерживаются YouTube-ссылки или 11-символьный video_id.",
            },
            ensure_ascii=False,
        )
    )
    return 4


if __name__ == "__main__":
    sys.exit(main())
