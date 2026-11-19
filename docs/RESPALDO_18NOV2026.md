# Respaldo agente-portal-redactores (18 nov 2026)

Fuente: `agente-portal-redactores.zip` (perfil del agente + proyecto).

## Entregable cPanel
- Archivo: `portal-redactores-mova.html` / `portal-redactores-paris-entregable.html` (= `proyecto/portal/redactor.html`, ~149 KB)
- Fuente editable: `portal-redactores-paris.src.html` (= `proyecto/portal/src/redactor.src.html`)
- Ruta servidor: `public_html/mova/seo/redactor.html`
- URL: https://acme-chile.cl/mova/seo/redactor.html

## Prompt Cursor (ya cubierto en esta v5)
1. Nombre UI «Vista editor»
2. Popup tipográfico contenteditable (h2/h3/h4/p) sin tags visibles; copiar con etiquetas
3. KW + URL arriba del editor (`textoRefs`)
4. Sin «Semana revisión»
5. Campo «Visto bueno del editor» aparte del estado de redacción

## n8n
- Vigente: `n8n/MOVA_Portal_Redactores_v4.json`
- Auth: `n8n/MOVA_Redactores_Auth_v1.json` + `validar-acceso-redactores.code.js`

## Nota
Josefa menciona otra v5 propia (151 KB HTML + JSON v5 77 KB) que no venía en este zip. Si aparece, reemplaza portal/ y n8n/.
