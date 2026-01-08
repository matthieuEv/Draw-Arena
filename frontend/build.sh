#!/usr/bin/env bash
set -euo pipefail

PAGES_DIR="pages"
DIST_DIR="dist"

# --- checks ---
if [[ ! -d "$PAGES_DIR" ]]; then
  echo "❌ Dossier introuvable: $PAGES_DIR" >&2
  exit 1
fi

# Nettoyage dist
rm -rf "$DIST_DIR/*"
mkdir -p "$DIST_DIR"
mkdir -p "$DIST_DIR/pages"
mkdir -p "$DIST_DIR/css"

./jcss.sh

# Copie éventuelle d'assets (optionnel)
for d in assets js img; do
  if [[ -d "$d" && "$d" != "$PAGES_DIR" ]]; then
    mkdir -p "$DIST_DIR"
    cp -a "$d" "$DIST_DIR" || true
  fi
done

cp -a "app.js" "$DIST_DIR/" || true
cp -a "index.html" "$DIST_DIR/" || true
cp -a "staticwebapp.config.json" "$DIST_DIR/" || true

# Remplace <include src="..."></include> par le contenu du fichier src
process_file() {
  local in_file="$1"
  local out_file="$2"
  local out_dir
  out_dir="$(dirname "$out_file")"
  mkdir -p "$out_dir"

  awk '
    # Fonction: lire un fichier complet et l’imprimer
    function print_file(path,   line) {
      while ((getline line < path) > 0) print line
      close(path)
    }

    {
      # Cas: <include src="..."></include> sur une seule ligne
      if (match($0, /<include[[:space:]]+src="([^"]+)"[[:space:]]*><\/include>/, m)) {
        src = m[1]

        # Sécurité: si le fichier n’existe pas, on laisse la balise + warning
        # (awk ne peut pas tester l’existence proprement sans shell, on essaie d’ouvrir)
        test = (getline tmp < src)
        if (test < 0) {
          print "⚠️  INCLUDE introuvable: " src > "/dev/stderr"
          print $0
        } else {
          close(src)
          # Imprime le contenu complet du include
          print_file(src)
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
