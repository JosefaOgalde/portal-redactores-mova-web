# Portal Redactores MOVA · Qué archivos tenemos que tener (patrón Portal Evaluador)

| # | Archivo | Dónde va | Estado |
|---|---|---|---|
| 1 | redactor.html (único, autocontenido, ~126 KB) | cPanel: public_html/mova/seo/redactor.html | EXISTE: /workspace/portal-redactores/para-cpanel/redactor.html |
| 2 | JSON n8n mova-auth (rama REDACTORES) | n8n (importar, NO subir a cPanel) | PREPARADO: n8n/MOVA_Redactores_Auth_v1.json + validar-acceso-redactores.code.js. Falta exportar el mova-auth real para comparar |
| 3 | JSON n8n mova-sync-historico | n8n | FALTA en box/repo (dicen que está activo en n8n; exportar) |
| 4 | JSON n8n mova-sync-contenidos | n8n | FALTA en box/repo (exportar) |
| 5 | JSON n8n mova-guardar-texto | n8n | FALTA (el HTML ya llama a este webhook) |
| 6 | JSON n8n mova-vb-editor | n8n | FALTA (el HTML ya llama a este webhook) |
| 7 | JSON n8n mova-revision-listo (Gmail) | n8n | PENDIENTE, no bloquea |
| 8 | Planilla "MOVA · Portal Redactores · Estado y accesos" (Accesos / Historico / Portal_Estado) | Drive, como Google Sheet | PLANTILLA: planilla/…(plantilla).xlsx. Falta confirmar la real en Drive y su ID |
| 9 | Spreadsheet Paris 1vi7G3kq… (gid 1739267264 y 646469582) | Drive | EXISTE (fuente de datos) |
| 10 | 404.html (opcional, como el Evaluador) | cPanel | No hecho |
