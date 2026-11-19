# n8n · Portal Redactores MOVA (Grupo Making OF)

No se encontró en el box ni en el repo el JSON actual de `mova-auth` (lo usa también el Brief), así que no se pudo verificar si ya maneja `empresa: "REDACTORES"`.

Archivos:
- `MOVA_Redactores_Auth_v1.json`: flujo importable, independiente, con ruta de prueba `mova-auth-redactores` (para no pisar el `mova-auth` del Brief).
- `validar-acceso-redactores.code.js`: el mismo código de validación, para pegarlo como rama en el `mova-auth` existente.

Opción A (recomendada): en el flujo `mova-auth` existente, agregar un nodo IF `{{$json.empresa}} == "REDACTORES"` después de "Preparar" → leer pestaña `Accesos` del Sheet "MOVA · Portal Redactores · Estado y accesos" → nodo Code con `validar-acceso-redactores.code.js` (renombrar las referencias `$('Rd · ...')` a los nombres de nodos reales) → Responder.
Opción B: importar `MOVA_Redactores_Auth_v1.json`, cambiar la ruta del webhook a `mova-auth` solo si el Brief NO usa ese webhook (si lo usa, dejar `mova-auth-redactores` y cambiar `MV.auth` en redactor.html).

Reemplazar antes de activar:
- `REEMPLAZAR_ID_SHEET_ESTADO_Y_ACCESOS`: ID del Google Sheet. Ojo: si el archivo es .xlsx en Drive, hay que abrirlo y "Guardar como Hojas de cálculo de Google"; la API de Sheets no lee .xlsx.
- `REEMPLAZAR_CREDENCIAL`: credencial Google Sheets de n8n.

Respuesta: `{ ok, motivo, nombre, correo, nivel, rol, clientes, reingresar }`. Rol: editor/desarrollador/admin → editor; redact* → redactor; cliente → cliente (rechazado). Solo Vigente = SI.

Pendientes: verificar que `mova-sync-historico`, `mova-sync-contenidos`, `mova-guardar-texto`, `mova-vb-editor` validen el token igual. El HTML envía `{token, empresa:"REDACTORES", cliente:"paris", correo, mes, semana, ord, keyword, url, texto|vbEditor}`. `mova-revision-listo` sigue pendiente (el portal usa correo local/FormSubmit).
