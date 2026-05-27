#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

OLLAMA_URL="${OLLAMA_BASE_URL:-http://127.0.0.1:11434}"
DEFAULT_MODEL="${OLLAMA_DEFAULT_MODEL:-gemma4:e4b}"
BASE_PORT="${OPENAGENT_PORT:-8788}"

log() {
  printf '\n[openagent] %s\n' "$1" >&2
}

fail() {
  printf '\n[openagent] %s\n' "$1" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "Missing required command: $1"
}

ensure_env_file() {
  if [ ! -f .dev.vars ] && [ -f .dev.vars.example ]; then
    cp .dev.vars.example .dev.vars
  fi
}

model_exists() {
  ollama list 2>/dev/null | awk 'NR>1 {print $1}' | grep -Fxq "$1"
}

pick_model() {
  if model_exists "$DEFAULT_MODEL"; then
    printf '%s' "$DEFAULT_MODEL"
    return 0
  fi
  for candidate in gemma4:e4b qwen3.5:9b qwen3.5:4b qwen3.5:2b; do
    if model_exists "$candidate"; then
      printf '%s' "$candidate"
      return 0
    fi
  done
  ollama list 2>/dev/null | awk 'NR==2 {print $1}'
}

ensure_ollama_running() {
  if curl -fsS "$OLLAMA_URL/api/tags" >/dev/null 2>&1; then
    return 0
  fi
  log "Starting Ollama service..."
  nohup ollama serve >/tmp/openagent-ollama.log 2>&1 &
  for _ in {1..20}; do
    if curl -fsS "$OLLAMA_URL/api/tags" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  fail "Ollama did not start in time."
}

open_browser_when_ready() {
  local port="$1"
  (
    for _ in {1..45}; do
      if curl -fsS "http://127.0.0.1:${port}" >/dev/null 2>&1; then
        open "http://127.0.0.1:${port}/admin/blog/" >/dev/null 2>&1 || true
        exit 0
      fi
      sleep 1
    done
  ) &
}

port_responding() {
  local port="$1"
  curl --connect-timeout 1 --max-time 2 -fsS "http://127.0.0.1:${port}" >/dev/null 2>&1
}

port_in_use() {
  local port="$1"
  lsof -iTCP:"${port}" -sTCP:LISTEN >/dev/null 2>&1
}

pick_port() {
  local port="$BASE_PORT"
  for _ in {1..15}; do
    log "Checking local port $port..."
    if port_responding "$port"; then
      printf '%s' "$port"
      return 0
    fi
    if ! port_in_use "$port"; then
      printf '%s' "$port"
      return 0
    fi
    port=$((port + 1))
  done
  fail "Could not find a free local port near ${BASE_PORT}."
}

require_command node
require_command npm
require_command ollama
require_command curl
require_command open
require_command lsof

ensure_env_file
ensure_ollama_running

SELECTED_MODEL="$(pick_model)"
[ -n "$SELECTED_MODEL" ] || fail "No local Ollama model found. Install qwen3.5:9b or gemma4:e4b first."

if [ -f .dev.vars ]; then
  SELECTED_MODEL="$SELECTED_MODEL" python3 - <<'PY'
from pathlib import Path
path = Path(".dev.vars")
text = path.read_text()
lines = []
seen_model = False
seen_url = False
for line in text.splitlines():
    if line.startswith("OLLAMA_DEFAULT_MODEL="):
        lines.append("OLLAMA_DEFAULT_MODEL=" + __import__("os").environ["SELECTED_MODEL"])
        seen_model = True
    elif line.startswith("OLLAMA_BASE_URL="):
        lines.append("OLLAMA_BASE_URL=http://127.0.0.1:11434")
        seen_url = True
    else:
        lines.append(line)
if not seen_model:
    lines.append("OLLAMA_DEFAULT_MODEL=" + __import__("os").environ["SELECTED_MODEL"])
if not seen_url:
    lines.append("OLLAMA_BASE_URL=http://127.0.0.1:11434")
path.write_text("\n".join(lines).rstrip() + "\n")
PY
fi

log "Using local model: $SELECTED_MODEL"
PORT="$(pick_port)"

if port_responding "$PORT"; then
  log "Workbench is already running on port $PORT. Opening browser..."
  open "http://127.0.0.1:${PORT}/admin/blog/" >/dev/null 2>&1 || true
  exit 0
fi

log "Installing dependencies if needed..."
npm install

log "Applying local D1 migrations..."
npm run d1:migrations:local

log "Starting local admin runtime on port $PORT..."
open_browser_when_ready "$PORT"
export OLLAMA_DEFAULT_MODEL="$SELECTED_MODEL"
export OPENAGENT_PORT="$PORT"
npx wrangler pages dev dist --port "$PORT"
