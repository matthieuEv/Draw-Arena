#!/usr/bin/env bash
set -euo pipefail

SRC_DIR="${1:-jcss}"
OUT_DIR="${2:-dist/css}"

if [[ ! -d "$SRC_DIR" ]]; then
  echo "Dossier JCSS introuvable: $SRC_DIR" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

compile_file() {
  local in="$1"
  local out="$2"

  awk '
    function trim(s){ sub(/^[ \t\r\n]+/, "", s); sub(/[ \t\r\n]+$/, "", s); return s }
    function join(n,   i,s){
      s=""
      for(i=1;i<=n;i++){
        if(sel[i]=="") continue
        if(abs[i]) {
          s = sel[i]              # ce niveau est déjà complet → on remplace la chaîne
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
      sub(/[ \t]*\/\/.*$/, "", line)

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

        if(index(s,"&")){
          p = join(d)                 # chemin complet
          s = expand_amp(s,p)         # devient un sélecteur complet
          d++
          sel[d]=s
          abs[d]=1                    # IMPORTANT: ne pas re-préfixer après
        } else {
          d++
          sel[d]=s
          abs[d]=0
        }
        next
      }

      # Fermeture de bloc
      if(line~/^\}$/){ if(d>0)d--; next }

      # Déclaration dans un bloc: bufferise
      if(d>0){
        f=join(d)
        if(!(f in seen)){ seen[f]=1; order[++oc]=f }
        rules[f]=rules[f] "  " line "\n"
        next
      }

      # Hors bloc: on garde tel quel (ex: @import, etc.)
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

export -f compile_file

find "$SRC_DIR" -type f -name "*.scss" | while read -r file; do
  rel="${file#$SRC_DIR/}"
  out="$OUT_DIR/${rel%.scss}.css"

  mkdir -p "$(dirname "$out")"
  echo "SCSS → CSS : $file → $out"
  compile_file "$file" "$out"
done

echo "✔ Compilation terminée"
