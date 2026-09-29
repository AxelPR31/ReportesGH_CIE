#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${1:-$(cd "$ROOT/.." && pwd)/produccion_cie}"

fix_external_module_shims() {
  local nm="$1"
  [[ -d "$nm" ]] || return 0
  for entry in "$nm"/*; do
    [[ -L "$entry" ]] || continue
    local name pkg
    name=$(basename "$entry")
    pkg=$(basename "$(readlink "$entry")")
    rm "$entry"
    mkdir "$entry"
    cat > "$entry/package.json" <<EOF
{"name":"${name}","main":"index.js"}
EOF
    cat > "$entry/index.js" <<EOF
const path = require("path");
module.exports = require(path.join(__dirname, "../../../node_modules/${pkg}"));
EOF
    echo "  shim: ${name} -> ${pkg}"
  done
}

echo "Build en $ROOT ..."
(cd "$ROOT" && npm run build)

echo "Empaquetando en $DEST ..."
mkdir -p "$DEST/.next/static"

# No copiar node_modules del build (suele ser de otra OS). En el servidor: instalar-deps.cmd
rsync -a --delete \
  --exclude '.env' \
  --exclude '.DS_Store' \
  --exclude 'node_modules' \
  "$ROOT/.next/standalone/" "$DEST/"

cp "$ROOT/package-lock.json" "$DEST/package-lock.json"

rsync -a --delete "$ROOT/.next/static/" "$DEST/.next/static/"
rsync -a --delete "$ROOT/public/" "$DEST/public/"

rm -f "$DEST/.env"
find "$DEST" -name '.DS_Store' -delete
rm -rf "$DEST/node_modules"

echo "Reemplazando enlaces simbólicos en .next/node_modules (ZIP Windows)..."
fix_external_module_shims "$DEST/.next/node_modules"

if [[ ! -f "$DEST/.env.example" ]]; then
  cat > "$DEST/.env.example" <<'EOF'
CS_SQL_SERVER=
CS_SQL_DATABASE=CIE_BD
CS_SQL_DATABASE2=CIE_BD
CS_SQL_USER=
CS_SQL_PASSWORD=
CS_SQL_ESQUEMA=ERPADMIN
CS_SQL_ENCRYPT=false
CS_SQL_TRUST_CERT=true
CS_JWT_SECRET=
CS_JWT_EXPIRES_IN=8h
CS_AUTH_COOKIE=cs_auth
EOF
fi

cp "$ROOT/scripts/INSTALAR-WINDOWS.txt" "$DEST/INSTALAR-WINDOWS.txt"
cp "$ROOT/scripts/instalar-deps.cmd" "$DEST/instalar-deps.cmd"

echo "Listo. BUILD_ID=$(cat "$DEST/.next/BUILD_ID")"
