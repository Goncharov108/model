#!/usr/bin/env bash
# Строит vault/project-structure.md из дерева отслеживаемых в Git.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/vault/project-structure.md"

python3 <<'PY' > "$OUT"
"""Генерация дерева репозитория для Obsidian."""
import subprocess
import sys
from pathlib import PurePosixPath

root = subprocess.check_output(["git", "rev-parse", "--show-toplevel"], text=True).strip()

try:
    tracked = subprocess.check_output(
        ["git", "ls-files"], cwd=root, text=True
    ).splitlines()
except subprocess.CalledProcessError:
    print("# Структура проекта\n\nЗапустите из репозитория с инициализированным Git.")
    sys.exit(0)

skip_parts = frozenset({"node_modules", ".vite", "__pycache__"})

nodes = set()
for line in sorted(tracked):
    if not line.strip():
        continue
    p = PurePosixPath(line)
    parts = []
    for part in p.parts:
        if part in skip_parts:
            break
        parts.append(part)
        nodes.add(tuple(parts))

nodes.add(("private",))


def sort_key(t):
    return ("/".join(t), len(t))


def is_dir(parts):
    return any(len(o) > len(parts) and o[: len(parts)] == parts for o in nodes)

lines = [
    "---",
    'title: "Структура репозитория model"',
    "tags: [meta, структура]",
    'auto: "scripts/update-vault-structure.sh"',
    "---",
    "",
    "# Структура проекта model",
    "",
    "> Файл **генерируется** скриптом `scripts/update-vault-structure.sh`. "
    "Личные пометки к структуре — в отдельной заметке (например в `journal/`). "
    "Содержимое `private/` в дерево не входит (закон 1).",
    "",
    "```text",
]

for parts in sorted(nodes, key=sort_key):
    depth = len(parts)
    name = parts[-1]
    slash = "/" if is_dir(parts) else ""
    ind = "  " * (depth - 1)
    lines.append(f"{ind}{name}{slash}")

lines.append("```")
lines.append("")
lines.append("## Связи")
lines.append("")
lines.append(
    "Карта хранилища: [[00-индекс]]. Разделы: [[Канон]], [[Инфраструктура]], "
    "[[Журнал]], [[Model-доки]], [[Промпты]]."
)
lines.append("")
lines.append("## Обновить в Obsidian")
lines.append("")
lines.append("В терминале из корня `model`:")
lines.append("")
lines.append("```bash")
lines.append("./scripts/update-vault-structure.sh")
lines.append("```")
lines.append("")

sys.stdout.write("\n".join(lines))
PY

echo "OK: $OUT"
