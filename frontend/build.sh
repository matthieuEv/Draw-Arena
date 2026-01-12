#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

SRC_DIR="src"
PAGES_DIR="$SRC_DIR/pages"
DIST_DIR="dist"
JCSS_DIR="$SRC_DIR/jcss"

# --- checks ---
if [[ ! -d "$PAGES_DIR" ]]; then
  echo "❌ Dossier introuvable: $PAGES_DIR" >&2
  exit 1
fi

# Nettoyage dist
rm -rf "$DIST_DIR"/*
mkdir -p "$DIST_DIR/pages" "$DIST_DIR/css"

./jcss.sh "$JCSS_DIR" "$DIST_DIR/css"

# Copie éventuelle d'assets (optionnel)
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

# Remplace <include src="..."></include> par le contenu du fichier src
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

export -f process_file

# Parcours de tous les HTML sous pages/ (y compris sous-dossiers)
# Conserve la structure dans dist/
while IFS= read -r -d '' file; do
  rel="${file#$PAGES_DIR/}"           # chemin relatif
  out="$DIST_DIR/pages/$rel"                # chemin de sortie
  process_file "$file" "$out"
done < <(find "$PAGES_DIR" -type f -name "*.html" -print0)

echo "🎉 Build terminé dans ./$DIST_DIR"
