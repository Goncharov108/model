#!/usr/bin/env bash
# Совместимость: Hermes и старые заметки → scripts/deploy/deploy.sh
exec "$(cd "$(dirname "$0")" && pwd)/deploy/deploy.sh" "$@"
