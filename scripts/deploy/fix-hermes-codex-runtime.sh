#!/usr/bin/env bash
# Применяет серверные hotfix для Hermes Codex runtime после обновлений пакета.
set -euo pipefail

DEPLOY_HOST="${DEPLOY_HOST:-93.183.71.104}"
DEPLOY_USER="${DEPLOY_USER:-root}"
SSH_PORT="${SSH_PORT:-22}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519}"

SSH_OPTS=(-p "$SSH_PORT" -o BatchMode=yes)
[[ -f "$SSH_KEY" ]] && SSH_OPTS+=(-i "$SSH_KEY")
SSH_TARGET="${DEPLOY_USER}@${DEPLOY_HOST}"

echo "[1/4] Patch run_agent.py + title_generator.py on ${SSH_TARGET}..."
ssh "${SSH_OPTS[@]}" "$SSH_TARGET" 'python3 - <<'"'"'PY'"'"'
from pathlib import Path

RUN_AGENT = Path("/home/hermes/.local/lib/python3.12/site-packages/run_agent.py")
TITLE_GEN = Path("/home/hermes/.local/lib/python3.12/site-packages/agent/title_generator.py")

run_text = RUN_AGENT.read_text(encoding="utf-8")
title_text = TITLE_GEN.read_text(encoding="utf-8")

# 1) Codex stream: treat output=None the same as empty list.
run_text = run_text.replace(
    "if isinstance(_out, list) and not _out:",
    "if not isinstance(_out, list) or not _out:",
    2,
)

# 2) Codex stream parser TypeError fallback.
needle_runtime = "            except RuntimeError as exc:\n"
insert_runtime = (
    "            except TypeError as exc:\n"
    "                # Some Codex backends produce stream terminal payloads where\n"
    "                # SDK parser sees response.output=None and raises TypeError.\n"
    "                logger.debug(\n"
    "                    \"Codex Responses stream parser TypeError; falling back to create(stream=True). %s error=%s\",\n"
    "                    self._client_log_context(),\n"
    "                    exc,\n"
    "                )\n"
    "                return self._run_codex_create_stream_fallback(api_kwargs, client=active_client)\n"
    "            except RuntimeError as exc:\n"
)
if insert_runtime not in run_text and needle_runtime in run_text:
    run_text = run_text.replace(needle_runtime, insert_runtime, 1)

# 3) Safe output_text access when response.output may be None.
unsafe_output_text = (
    '                                    _out_text = getattr(response, "output_text", None)\n'
    '                                    _out_text_stripped = _out_text.strip() if isinstance(_out_text, str) else ""'
)
safe_output_text = (
    '                                    _out_text = None\n'
    '                                    _resp_dict = getattr(response, "__dict__", None)\n'
    '                                    if isinstance(_resp_dict, dict):\n'
    '                                        _out_text = _resp_dict.get("output_text")\n'
    '                                    _out_text_stripped = _out_text.strip() if isinstance(_out_text, str) else ""'
)
if unsafe_output_text in run_text:
    run_text = run_text.replace(unsafe_output_text, safe_output_text, 1)

# 4) chat() must not crash on partial/error result payload.
unsafe_chat = (
    "        result = self.run_conversation(message, stream_callback=stream_callback)\n"
    "        return result[\"final_response\"]\n"
)
safe_chat = (
    "        result = self.run_conversation(message, stream_callback=stream_callback)\n"
    "        # Keep gateways alive when a turn ends with partial/error payload.\n"
    "        return result.get(\"final_response\") or result.get(\"error\") or \"\"\n"
)
if unsafe_chat in run_text:
    run_text = run_text.replace(unsafe_chat, safe_chat, 1)

# 5) Suppress user-facing warning for known auxiliary title parser glitch.
title_needle = '        title = (response.choices[0].message.content or "").strip()\n'
title_safe = (
    '        # Be defensive: some providers can return choices=None in auxiliary mode.\n'
    '        _choices = getattr(response, "choices", None)\n'
    '        if _choices is None and hasattr(response, "__dict__"):\n'
    '            _choices = response.__dict__.get("choices")\n'
    '        title = ""\n'
    '        if isinstance(_choices, list) and _choices:\n'
    '            _msg = getattr(_choices[0], "message", None)\n'
    '            _content = getattr(_msg, "content", None) if _msg is not None else None\n'
    '            if _content is None and isinstance(_choices[0], dict):\n'
    '                _content = (_choices[0].get("message") or {}).get("content")\n'
    '            title = (_content or "").strip() if isinstance(_content, str) else ""\n'
)
if title_needle in title_text:
    title_text = title_text.replace(title_needle, title_safe, 1)

title_except_needle = "    except Exception as e:\n"
title_except_insert = (
    "    except Exception as e:\n"
    "        # Suppress noisy user-facing warnings for known auxiliary parser glitches.\n"
    "        _msg = str(e)\n"
    "        if \"NoneType\" in _msg and \"iterable\" in _msg:\n"
    "            logger.debug(\"Title generation suppressed known TypeError: %s\", e)\n"
    "            logger.debug(\"Title generation traceback\", exc_info=True)\n"
    "            return None\n"
)
if title_except_insert not in title_text and title_except_needle in title_text:
    title_text = title_text.replace(title_except_needle, title_except_insert, 1)

RUN_AGENT.write_text(run_text, encoding="utf-8")
TITLE_GEN.write_text(title_text, encoding="utf-8")
print("patch-applied")
PY'

echo "[2/4] Python syntax check..."
ssh "${SSH_OPTS[@]}" "$SSH_TARGET" \
  "python3 -m py_compile /home/hermes/.local/lib/python3.12/site-packages/run_agent.py /home/hermes/.local/lib/python3.12/site-packages/agent/title_generator.py"

echo "[3/4] Restart hermes-gateway..."
ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "systemctl restart hermes-gateway && sleep 2 && systemctl is-active hermes-gateway"

echo "[4/4] Smoke test..."
ssh "${SSH_OPTS[@]}" "$SSH_TARGET" \
  "sudo -u hermes -H bash -lc 'cd /home/hermes/.local/lib/python3.12/site-packages && HOME=/home/hermes HERMES_HOME=/home/hermes/.hermes ALL_PROXY=socks5h://127.0.0.1:10808 HTTPS_PROXY=socks5h://127.0.0.1:10808 HTTP_PROXY=socks5h://127.0.0.1:10808 /usr/bin/python3 -m hermes_cli.main -z \"тест\"'"

echo "DONE: Hermes hotfix applied on ${SSH_TARGET}"
