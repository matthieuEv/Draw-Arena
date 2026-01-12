#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

PAGES_DIR="pages"
MODULES_DIR="modules"
JCSS_DIR="jcss"
DIST_DIR="dist"
CSS_DIR="$DIST_DIR/css"

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

mkdir -p "$DIST_DIR/pages" "$CSS_DIR"

process_file() {
  local in_file="$1"
  local out_file="$2"
  local out_dir
  out_dir="$(dirname "$out_file")"
  mkdir -p "$out_dir"

  awk '
    function print_file(path,   line) {
      while ((getline line < path) > 0) print line
      close(path)
    }

    {
      if (match($0, /<include[[:space:]]+src="([^"]+)"[[:space:]]*><\/include>/, m)) {
        src = m[1]
        test = (getline tmp < src)
        if (test < 0) {
          print "[WARN] INCLUDE not found: " src > "/dev/stderr"
          print $0
        } else {
          close(src)
          print_file(src)
        }
        next
      }
      print
    }
  ' "$in_file" > "$out_file"

  if [[ ! -s "$out_file" ]]; then
    echo "[WARN] Generated empty: $out_file (source: $in_file)" >&2
  else
    echo "[OK] $in_file -> $out_file"
  fi
}

compile_jcss_file() {
  local in="$1"
  local out="$2"

  awk '
    function protect_urls(s){
      gsub(/https:\/\//, "https:__JCSS_SLASH__", s)
      gsub(/http:\/\//, "http:__JCSS_SLASH__", s)
      return s
    }
    function restore_urls(s){
      gsub(/https:__JCSS_SLASH__/, "https://", s)
      gsub(/http:__JCSS_SLASH__/, "http://", s)
      return s
    }
    function trim(s){ sub(/^[ \t\r\n]+/, "", s); sub(/[ \t\r\n]+$/, "", s); return s }
    function join(n,   i,s){
      s=""
      for(i=1;i<=n;i++){
        if(sel[i]=="") continue
        if(abs[i]) {
          s = sel[i]
        } else {
          s = (s=="" ? sel[i] : s" "sel[i])
        }
      }
      return trim(s)
    }
    function replace_vars(l, k){ for(k in v) gsub("\\$"k"\\b", v[k], l); return l }
    function expand_amp(c,p,o){ o=c; gsub(/&/,p,o); return o }

    BEGIN{ d=0; ic=0; oc=0; tc=0 }

    {
      line=$0
      line=protect_urls(line)
      sub(/[ \t]*\/\/.*$/, "", line)
      line=restore_urls(line)

      if(ic){
        if(match(line,/\*\//)){ sub(/^.*\*\//,"",line); ic=0 } else next
      }
      while(match(line,/\/\*/)){
        pre=substr(line,1,RSTART-1)
        post=substr(line,RSTART+2)
        if(match(post,/\*\//)){
          post=substr(post,RSTART+2)
          line=pre post
        } else {
          line=pre; ic=1; break
        }
      }

      line=trim(line)
      if(line=="") next

      if(match(line,/^\$[A-Za-z_][A-Za-z0-9_-]*[ \t]*:/)){
        n=line; sub(/^\$/,"",n); sub(/[ \t]*:.*/,"",n)
        val=line; sub(/^\$[^:]*:/,"",val); sub(/;$/,"",val)
        v[n]=trim(val)
        next
      }

      line=replace_vars(line)

      if(match(line,/\{$/)){
        s=line; sub(/\{$/,"",s); s=trim(s)

        if(index(s,"&")){
          p = join(d)
          s = expand_amp(s,p)
          d++
          sel[d]=s
          abs[d]=1
        } else {
          d++
          sel[d]=s
          abs[d]=0
        }
        next
      }

      if(line~/^\}$/){ if(d>0)d--; next }

      if(d>0){
        f=join(d)
        if(!(f in seen)){ seen[f]=1; order[++oc]=f }
        rules[f]=rules[f] "  " line "\n"
        next
      }

      top[++tc]=line
    }

    END{
      for(i=1;i<=tc;i++) print top[i]
      if(tc>0 && oc>0) print ""
      for(i=1;i<=oc;i++){
        f=order[i]
        print f " {"
        printf "%s", rules[f]
        print "}"
      }
    }
    ' "$in" > "$out"
}

copy_file() {
  local in="$1"
  local out="$2"
  mkdir -p "$(dirname "$out")"
  cp -a "$in" "$out"
  echo "[OK] $in -> $out"
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
  local module_ref="$MODULES_DIR/$rel"
  local needle="src=\"$module_ref\""
  local -a pages=()

  if command -v rg >/dev/null 2>&1; then
    mapfile -t pages < <(rg -l -F "$needle" "$PAGES_DIR" 2>/dev/null || true)
  else
    mapfile -t pages < <(grep -rl --fixed-strings "$needle" "$PAGES_DIR" 2>/dev/null || true)
  fi

  if [[ ${#pages[@]} -eq 0 ]]; then
    echo "[INFO] No pages reference module: $module_ref"
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
  local out="$CSS_DIR/${rel%.scss}.css"
  mkdir -p "$(dirname "$out")"
  echo "SCSS -> CSS: $file -> $out"
  compile_jcss_file "$file" "$out"
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

  if [[ "$file" == "$JCSS_DIR/"* && "$file" == *.scss ]]; then
    process_jcss "$file"
    return
  fi

  if [[ "$file" == "index.html" || "$file" == "app.js" || "$file" == "config.js" ]]; then
    copy_file "$file" "$DIST_DIR/$file"
    return
  fi

  if [[ "$file" == assets/* || "$file" == js/* || "$file" == img/* ]]; then
    copy_file "$file" "$DIST_DIR/$file"
    return
  fi
}

handle_delete() {
  local file="$1"

  if [[ "$file" == "$PAGES_DIR/"* ]]; then
    local rel="${file#$PAGES_DIR/}"
    rm -f "$DIST_DIR/pages/$rel"
    echo "[OK] Removed $DIST_DIR/pages/$rel"
    return
  fi

  if [[ "$file" == "$MODULES_DIR/"* ]]; then
    process_module "$file"
    return
  fi

  if [[ "$file" == "$JCSS_DIR/"* ]]; then
    local rel="${file#$JCSS_DIR/}"
    rm -f "$CSS_DIR/${rel%.scss}.css"
    echo "[OK] Removed $CSS_DIR/${rel%.scss}.css"
    return
  fi

  if [[ "$file" == "index.html" || "$file" == "app.js" || "$file" == "config.js" ]]; then
    rm -f "$DIST_DIR/$file"
    echo "[OK] Removed $DIST_DIR/$file"
    return
  fi

  if [[ "$file" == assets/* || "$file" == js/* || "$file" == img/* ]]; then
    rm -f "$DIST_DIR/$file"
    echo "[OK] Removed $DIST_DIR/$file"
    return
  fi
}

list_watch_files() {
  local dir
  for dir in "$PAGES_DIR" "$MODULES_DIR" "$JCSS_DIR" "assets" "js" "img"; do
    [[ -d "$dir" ]] || continue
    find "$dir" -type f -print0
  done
  for f in index.html app.js config.js; do
    [[ -f "$f" ]] && printf '%s\0' "$f"
  done
}

trap 'echo "[INFO] Stopping watcher."; exit 0' INT TERM

declare -A MTIME
declare -A SEEN

echo "[INFO] Watching for changes (interval: ${WATCH_INTERVAL}s)"

while true; do
  SEEN=()
  changed=()

  while IFS= read -r -d '' file; do
    SEEN["$file"]=1
    mtime="$(stat -c %Y "$file" 2>/dev/null || echo 0)"
    if [[ "${MTIME["$file"]:-}" != "$mtime" ]]; then
      MTIME["$file"]="$mtime"
      changed+=("$file")
    fi
  done < <(list_watch_files)

  for file in "${!MTIME[@]}"; do
    if [[ -z "${SEEN["$file"]:-}" ]]; then
      handle_delete "$file"
      unset 'MTIME[$file]'
    fi
  done

  for file in "${changed[@]}"; do
    if [[ -f "$file" ]]; then
      handle_change "$file"
    else
      handle_delete "$file"
    fi
  done

  sleep "$WATCH_INTERVAL"
done
