#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

SRC_DIR="$ROOT_DIR/src"
PAGES_DIR="$SRC_DIR/pages"
MODULES_DIR="$SRC_DIR/modules"
MODULES_REF_DIR="modules"
JCSS_DIR="$SRC_DIR/jcss"
DIST_DIR="$ROOT_DIR/dist"
CSS_DIR="$DIST_DIR/css"

MODE="full"
declare -a CHANGED_FILES=()
declare -a DELETED_FILES=()

usage() {
  cat <<'EOF'
Usage:
  ./build.sh
  ./build.sh --full
  ./build.sh --changed <file> [--changed <file> ...] [--deleted <file> ...]
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      usage
      exit 0
      ;;
    --full)
      MODE="full"
      shift
      ;;
    --changed)
      if [[ -z "${2:-}" ]]; then
        echo "❌ Missing value for --changed" >&2
        exit 1
      fi
      MODE="incremental"
      CHANGED_FILES+=("$2")
      shift 2
      ;;
    --deleted)
      if [[ -z "${2:-}" ]]; then
        echo "❌ Missing value for --deleted" >&2
        exit 1
      fi
      MODE="incremental"
      DELETED_FILES+=("$2")
      shift 2
      ;;
    *)
      echo "❌ Option inconnue: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ "$MODE" == "full" && ( ${#CHANGED_FILES[@]} -gt 0 || ${#DELETED_FILES[@]} -gt 0 ) ]]; then
  echo "❌ --full ne peut pas être utilisé avec --changed/--deleted" >&2
  exit 1
fi

# Remplace <include src="..."></include> par le contenu du fichier src
ensure_dist_dirs() {
  mkdir -p "$DIST_DIR/pages" "$CSS_DIR"
}

normalize_path() {
  local p="$1"
  if [[ "$p" != /* ]]; then
    p="${p#./}"
    p="$ROOT_DIR/$p"
  fi
  printf '%s' "$p"
}

process_file() {
  local in_file="$1"
  local out_file="$2"
  local out_dir
  out_dir="$(dirname "$out_file")"
  mkdir -p "$out_dir"

  local in_dir
  in_dir="$(dirname "$in_file")"

  awk -v file_dir="$in_dir" -v src_root="$SRC_DIR" '
    # Fonction: lire un fichier complet et l’imprimer
    function print_file(path,   line) {
      while ((getline line < path) > 0) print line
      close(path)
    }
    function can_open(path,   line) {
      if ((getline line < path) >= 0) { close(path); return 1 }
      return 0
    }
    function resolve_path(src,   cand) {
      cand = file_dir "/" src
      if (can_open(cand)) return cand
      cand = src_root "/" src
      if (can_open(cand)) return cand
      if (can_open(src)) return src
      return ""
    }

    {
      # Cas: <include src="..."></include> sur une seule ligne
      if (match($0, /<include[[:space:]]+src="([^"]+)"[[:space:]]*><\/include>/, m)) {
        src = m[1]
        resolved = resolve_path(src)
        if (resolved == "") {
          print "⚠️  INCLUDE introuvable: " src " (depuis " file_dir ")" > "/dev/stderr"
          print $0
        } else {
          # Imprime le contenu complet du include
          print_file(resolved)
        }
        next
      }

      # Ligne normale
      print
    }
  ' "$in_file" > "$out_file"

  if [[ ! -s "$out_file" ]]; then
    echo "⚠️  Généré vide: $out_file (source: $in_file)" >&2
  else
    echo "✅ ${in_file} -> ${out_file}"
  fi
}

process_page() {
  local file="$1"
  local rel="${file#$PAGES_DIR/}"
  local out="$DIST_DIR/pages/$rel"
  process_file "$file" "$out"
}

process_module() {
  local file="$1"
  local rel="${file#$MODULES_DIR/}"
  local module_ref="$MODULES_REF_DIR/$rel"
  local needle="src=\"$module_ref\""
  local -a pages=()

  if command -v rg >/dev/null 2>&1; then
    mapfile -t pages < <(rg -l -F "$needle" "$PAGES_DIR" 2>/dev/null || true)
  else
    mapfile -t pages < <(grep -rl --fixed-strings "$needle" "$PAGES_DIR" 2>/dev/null || true)
  fi

  if [[ ${#pages[@]} -eq 0 ]]; then
    return
  fi

  local p
  for p in "${pages[@]}"; do
    process_page "$p"
  done
}

process_jcss() {
  local file="$1"
  local rel="${file#$JCSS_DIR/}"
  local out="$CSS_DIR/${rel%.jcss}.css"
  mkdir -p "$(dirname "$out")"
  ./jcss.sh --file "$file" --out "$out"
}

copy_src_file() {
  local in="$1"
  local rel="${in#$SRC_DIR/}"
  local out="$DIST_DIR/$rel"
  mkdir -p "$(dirname "$out")"
  cp -a "$in" "$out"
  echo "✅ $in -> $out"
}

remove_src_file() {
  local in="$1"
  local rel="${in#$SRC_DIR/}"
  local out="$DIST_DIR/$rel"
  rm -f "$out"
  echo "✅ Removed $out"
}

handle_change() {
  local file="$1"

  if [[ "$file" == "$PAGES_DIR/"* && "$file" == *.html ]]; then
    process_page "$file"
    return
  fi

  if [[ "$file" == "$MODULES_DIR/"* && "$file" == *.html ]]; then
    process_module "$file"
    return
  fi

  if [[ "$file" == "$JCSS_DIR/"* && "$file" == *.jcss ]]; then
    process_jcss "$file"
    return
  fi

  if [[ "$file" == "$SRC_DIR/index.html" || "$file" == "$SRC_DIR/app.js" || "$file" == "$SRC_DIR/config.js" ]]; then
    copy_src_file "$file"
    return
  fi

  if [[ "$file" == "$SRC_DIR/assets/"* || "$file" == "$SRC_DIR/js/"* || "$file" == "$SRC_DIR/img/"* ]]; then
    copy_src_file "$file"
    return
  fi
}

handle_delete() {
  local file="$1"

  if [[ "$file" == "$PAGES_DIR/"* ]]; then
    local rel="${file#$PAGES_DIR/}"
    rm -f "$DIST_DIR/pages/$rel"
    echo "✅ Removed $DIST_DIR/pages/$rel"
    return
  fi

  if [[ "$file" == "$MODULES_DIR/"* ]]; then
    process_module "$file"
    return
  fi

  if [[ "$file" == "$JCSS_DIR/"* ]]; then
    local rel="${file#$JCSS_DIR/}"
    rm -f "$CSS_DIR/${rel%.jcss}.css"
    echo "✅ Removed $CSS_DIR/${rel%.jcss}.css"
    return
  fi

  if [[ "$file" == "$SRC_DIR/index.html" || "$file" == "$SRC_DIR/app.js" || "$file" == "$SRC_DIR/config.js" ]]; then
    remove_src_file "$file"
    return
  fi

  if [[ "$file" == "$SRC_DIR/assets/"* || "$file" == "$SRC_DIR/js/"* || "$file" == "$SRC_DIR/img/"* ]]; then
    remove_src_file "$file"
    return
  fi
}

full_build() {
  if [[ ! -d "$PAGES_DIR" ]]; then
    echo "❌ Dossier introuvable: $PAGES_DIR" >&2
    exit 1
  fi

  rm -rf "$DIST_DIR"/*
  ensure_dist_dirs

  ./jcss.sh "$JCSS_DIR" "$CSS_DIR"

  for d in assets js img; do
    if [[ -d "$SRC_DIR/$d" ]]; then
      cp -a "$SRC_DIR/$d" "$DIST_DIR" || true
    fi
  done

  for f in app.js config.js index.html; do
    if [[ -f "$SRC_DIR/$f" ]]; then
      cp -a "$SRC_DIR/$f" "$DIST_DIR/" || true
    fi
  done

  while IFS= read -r -d '' file; do
    process_page "$file"
  done < <(find "$PAGES_DIR" -type f -name "*.html" -print0)

  echo "🎉 Build terminé dans ./dist"
}

incremental_build() {
  ensure_dist_dirs

  local file
  for file in "${CHANGED_FILES[@]}"; do
    file="$(normalize_path "$file")"
    if [[ -f "$file" ]]; then
      handle_change "$file"
    else
      handle_delete "$file"
    fi
  done

  for file in "${DELETED_FILES[@]}"; do
    file="$(normalize_path "$file")"
    handle_delete "$file"
  done
}

if [[ "$MODE" == "incremental" ]]; then
  incremental_build
else
  full_build
fi
