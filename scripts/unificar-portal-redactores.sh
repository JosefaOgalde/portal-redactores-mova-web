#!/usr/bin/env bash
# Deja UN solo Portal Redactores visible.
# Ejecutar en tu Mac con: origin auth login
set -euo pipefail

echo "==> Opción recomendada: mirror de GitHub mova-web + borrar stub Origin si sobra"
echo "    (Si ya usas Origin josefa/portal-redactores como proyecto lleno, salta al paso 3.)"
echo ""

read -r -p "¿Crear mirror Origin de JosefaOgalde/portal-redactores-mova-web? [y/N] " ans
if [[ "${ans:-}" =~ ^[yY]$ ]]; then
  origin repo create-mirrored JosefaOgalde/portal-redactores-mova-web --namespace josefa
  echo "Mirror creado. En Cursor abre josefa/portal-redactores-mova-web"
  read -r -p "¿Borrar Origin josefa/portal-redactores (stub/copia)? [y/N] " del
  if [[ "${del:-}" =~ ^[yY]$ ]]; then
    origin repo delete josefa/portal-redactores -y
  fi
fi

echo ""
echo "==> Archiva el repo viejo en el navegador:"
echo "    https://github.com/JosefaOgalde/portal-redactores-mova-paris/settings"
echo ""
origin repo list --namespace josefa --json org,name,mirrorStatus || true
echo "Listo."
