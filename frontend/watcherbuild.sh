#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

SRC_DIR="$ROOT_DIR/src"
BUILD_SCRIPT="$ROOT_DIR/build.sh"

WATCH_INTERVAL="0.5"

usage() {
  cat <<'EOF'
Usage: ./watcherbuild.sh [seconds]
       ./watcherbuild.sh --interval <seconds>
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      usage
      exit 0
      ;;
    -i|--interval)
      if [[ -z "${2:-}" ]]; then
        echo "[ERROR] Missing value for --interval" >&2
        exit 1
      fi
      WATCH_INTERVAL="$2"
      shift 2
      ;;
    *)
      WATCH_INTERVAL="$1"
      shift
      ;;
  esac
done

if [[ ! -d "$SRC_DIR" ]]; then
  echo "[ERROR] Missing src directory: $SRC_DIR" >&2
  exit 1
fi

run_full_build() {
  echo "[INFO] Running build.sh (full)"
  bash "$BUILD_SCRIPT"
}

list_watch_files() {
  find "$SRC_DIR" -type f -print0
}

trap 'echo "[INFO] Stopping watcher."; exit 0' INT TERM

declare -A MTIME
declare -A SEEN

run_full_build
echo "[INFO] Watching for changes (interval: ${WATCH_INTERVAL}s)"

while true; do
  SEEN=()
  changed_files=()
  deleted_files=()

  while IFS= read -r -d '' file; do
    SEEN["$file"]=1
    mtime="$(stat -c %Y "$file" 2>/dev/null || echo 0)"
    if [[ "${MTIME["$file"]:-}" != "$mtime" ]]; then
      MTIME["$file"]="$mtime"
      changed_files+=("$file")
    fi
  done < <(list_watch_files)

  for file in "${!MTIME[@]}"; do
    if [[ -z "${SEEN["$file"]:-}" ]]; then
      deleted_files+=("$file")
      unset 'MTIME[$file]'
    fi
  done

  if [[ ${#changed_files[@]} -gt 0 || ${#deleted_files[@]} -gt 0 ]]; then
    args=()
    for file in "${changed_files[@]}"; do
      args+=(--changed "$file")
    done
    for file in "${deleted_files[@]}"; do
      args+=(--deleted "$file")
    done
    echo "[INFO] Running build.sh (changed: ${#changed_files[@]}, deleted: ${#deleted_files[@]})"
    bash "$BUILD_SCRIPT" "${args[@]}"
  fi

  sleep "$WATCH_INTERVAL"
done
