#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

SRC_DIR="src/jcss"
OUT_DIR="dist/css"
ONE_FILE=""
ONE_OUT=""
MODE="dir"
SRC_DIR_SET=""
OUT_DIR_SET=""

usage() {
  cat <<'EOF'
Usage:
  ./jcss.sh [src_dir] [out_dir]
  ./jcss.sh --file <input> --out <output>
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      usage
      exit 0
      ;;
    --file)
      if [[ -z "${2:-}" ]]; then
        echo "Missing value for --file" >&2
        exit 1
      fi
      MODE="file"
      ONE_FILE="$2"
      shift 2
      ;;
    --out)
      if [[ -z "${2:-}" ]]; then
        echo "Missing value for --out" >&2
        exit 1
      fi
      ONE_OUT="$2"
      shift 2
      ;;
    *)
      if [[ "$MODE" == "file" ]]; then
        echo "Unknown option: $1" >&2
        usage
        exit 1
      fi
      if [[ -z "$SRC_DIR_SET" ]]; then
        SRC_DIR="$1"
        SRC_DIR_SET="1"
        shift
        continue
      fi
      if [[ -z "$OUT_DIR_SET" ]]; then
        OUT_DIR="$1"
        OUT_DIR_SET="1"
        shift
        continue
      fi
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ "$MODE" == "file" ]]; then
  if [[ -z "$ONE_FILE" || -z "$ONE_OUT" ]]; then
    echo "Missing --file or --out" >&2
    usage
    exit 1
  fi
else
  if [[ ! -d "$SRC_DIR" ]]; then
    echo "Dossier JCSS introuvable: $SRC_DIR" >&2
    exit 1
  fi
  mkdir -p "$OUT_DIR"
fi

compile_file() {
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
    function pad(n,   i,s){
      s=""
      for(i=0;i<n;i++) s=s"  "
      return s
    }
    function join_selectors(n,   i,s){
      s=""
      for(i=1;i<=n;i++){
        if(typ[i]!="sel") continue
        if(sel[i]=="") continue
        if(abs[i]) {
          s = sel[i]              # ce niveau est déjà complet → on remplace la chaîne
        } else {
          s = (s=="" ? sel[i] : s" "sel[i])
        }
      }
      return trim(s)
    }
    function join_at(n,   i,s){
      s=""
      for(i=1;i<=n;i++){
        if(typ[i]!="at") continue
        if(at[i]=="") continue
        s = (s=="" ? at[i] : s CHAIN_SEP at[i])
      }
      return s
    }
    function replace_vars(l, k){ for(k in v) gsub("\\$"k"\\b", v[k], l); return l }
    function expand_amp(c,p,o){ o=c; gsub(/&/,p,o); return o }
    function print_body(indent, body,   b){
      b=body
      sub(/\n$/, "", b)
      gsub(/\n/, "\n" indent, b)
      if(b!="") print indent b
    }
    function print_block(indent, selector, body,   pad_in, b){
      print indent selector " {"
      pad_in = indent "  "
      b=body
      sub(/\n$/, "", b)
      gsub(/\n/, "\n" pad_in, b)
      if(b!="") print pad_in b
      print indent "}"
    }

    BEGIN{ d=0; ic=0; oc=0; tc=0; ac=0; CHAIN_SEP="||" }

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

      # Variables $name: value;
      if(match(line,/^\$[A-Za-z_][A-Za-z0-9_-]*[ \t]*:/)){
        n=line; sub(/^\$/,"",n); sub(/[ \t]*:.*/,"",n)
        val=line; sub(/^\$[^:]*:/,"",val); sub(/;$/,"",val)
        v[n]=trim(val)
        next
      }

      line=replace_vars(line)

      # Ouverture de bloc
      if(match(line,/\{$/)){
        s=line; sub(/\{$/,"",s); s=trim(s)

        if(s ~ /^@/){
          d++
          typ[d]="at"
          at[d]=s
          sel[d]=""
          abs[d]=0
          next
        }

        if(index(s,"&")){
          p = join_selectors(d)       # chemin complet (sans @)
          s = expand_amp(s,p)         # devient un sélecteur complet
          d++
          typ[d]="sel"
          sel[d]=s
          abs[d]=1                    # IMPORTANT: ne pas re-préfixer après
        } else {
          d++
          typ[d]="sel"
          sel[d]=s
          abs[d]=0
        }
        next
      }

      # Fermeture de bloc
      if(line~/^\}$/){
        if(d>0){
          delete sel[d]
          delete abs[d]
          delete at[d]
          delete typ[d]
          d--
        }
        next
      }

      # Déclaration dans un bloc: bufferise
      if(d>0){
        f=join_selectors(d)
        a=join_at(d)
        if(a==""){
          if(f==""){
            top[++tc]=line
            next
          }
          if(!(f in seen)){ seen[f]=1; order[++oc]=f }
          rules[f]=rules[f] line "\n"
          next
        }

        if(!(a in at_seen)){ at_seen[a]=1; at_order[++ac]=a }
        if(f==""){
          at_direct[a]=at_direct[a] line "\n"
          next
        }
        key=a SUBSEP f
        if(!(key in at_sel_seen)){
          at_sel_seen[key]=1
          sel_count[a]++
          sel_order[a, sel_count[a]]=f
        }
        at_rules[a, f]=at_rules[a, f] line "\n"
        next
      }

      # Hors bloc: on garde tel quel (ex: @import, etc.)
      top[++tc]=line
    }

    END{
      for(i=1;i<=tc;i++) print top[i]

      if(tc>0 && (oc>0 || ac>0)) print ""

      for(i=1;i<=oc;i++){
        f=order[i]
        print_block("", f, rules[f])
      }

      if(oc>0 && ac>0) print ""

      for(i=1;i<=ac;i++){
        a=at_order[i]
        n=split(a, at_parts, /\|\|/)
        for(j=1;j<=n;j++){
          indent=pad(j-1)
          print indent at_parts[j] " {"
        }

        if(a in at_direct){
          indent=pad(n)
          print_body(indent, at_direct[a])
        }

        for(j=1;j<=sel_count[a];j++){
          f=sel_order[a, j]
          indent=pad(n)
          print_block(indent, f, at_rules[a, f])
        }

        for(j=n;j>=1;j--){
          indent=pad(j-1)
          print indent "}"
        }
      }
    }
    ' "$in" > "$out"
}

export -f compile_file

if [[ "$MODE" == "file" ]]; then
  if [[ ! -f "$ONE_FILE" ]]; then
    echo "Fichier JCSS introuvable: $ONE_FILE" >&2
    exit 1
  fi
  mkdir -p "$(dirname "$ONE_OUT")"
  echo "JCSS -> CSS : $ONE_FILE -> $ONE_OUT"
  compile_file "$ONE_FILE" "$ONE_OUT"
  echo "✔ Compilation terminée"
  exit 0
fi

find "$SRC_DIR" -type f -name "*.jcss" | while read -r file; do
  rel="${file#$SRC_DIR/}"
  out="$OUT_DIR/${rel%.jcss}.css"

  mkdir -p "$(dirname "$out")"
  echo "JCSS -> CSS : $file -> $out"
  compile_file "$file" "$out"
done

echo "✔ Compilation terminée"
