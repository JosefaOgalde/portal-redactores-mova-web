# n8n · Flujos necesarios (MOVA Portal Redactores)

Objetivo: el usuario final **no abre Drive**. n8n lee Sheets y empuja datos / eventos al portal o a un backend liviano.

## Fuentes

| Flujo | Sheet | gid | Destino |
|---|---|---|---|
| Sync histórico | Consolidado Paris | `1739267264` | `HIST` / buscador Histórico |
| Sync contenidos | Consolidado Paris (pestañas mes) | `646469582` (+ otras pestañas mes) | `ITEMS` Paso 2 |
| Asignaciones | (definir pestaña o Sheet) | TBD | `config.redactores` |

Spreadsheet ID: `1vi7G3kqyo2paIiEqimT1A57DsgxdzlpbG3p69_6TXiM`

## Flujos mínimos

### 1. `sync-historico`
- Trigger: Schedule (ej. cada hora) o Manual.
- Nodo Google Sheets: leer gid `1739267264`.
- Normalizar: `{ anio, tipo, keyword, url }`.
- Orden: más actual → más antigua.
- Salida: JSON / webhook que el portal o un host consuma.

### 2. `sync-contenidos-mes`
- Leer pestañas de mes (cada tab = mes).
- Normalizar: `{ mes, semana (1–4), keyword, tipo, url, anchors[10], status, … }`.
- Orden por mes y semana (actual → vieja).
- Salida: JSON para Paso 2.

### 3. `revision-listo`
- Webhook POST desde el portal al dar **listo** en revisión.
- Body: filas con X + comentarios + email Mel.
- Acción: correo / Slack / ticket (reemplaza o complementa Formspree local).

### 4. `guardar-texto` / `vb-editor`
- Webhook para persistir `texto` (HTML h2/h3/h4/p) y `vbEditor`.
- Evitar depender solo de `localStorage`.

### 5. `asignaciones-redactor`
- Leer tabla redactor → clientes.
- Exponer a `panel-redactor.html` (hoy demo en `config-accesos.js`).

## Contrato sugerido de webhooks (rellenar en `config-accesos.js` → `n8n.webhooks`)

```json
{
  "syncHistorico": "https://TU-N8N/webhook/mova-sync-historico",
  "syncContenidos": "https://TU-N8N/webhook/mova-sync-contenidos",
  "revisionListo": "https://TU-N8N/webhook/mova-revision-listo",
  "guardarTexto": "https://TU-N8N/webhook/mova-guardar-texto",
  "vbEditor": "https://TU-N8N/webhook/mova-vb-editor"
}
```

## Roles (no romper)

- **Editor:** consume todos los clientes / todos los ITEMS.  
- **Redactor:** filtrar por asignación antes de devolver datos.  
- **Cliente:** fuera de alcance por ahora.

## Nota para Claude

Con Drive vinculado: inspeccionar columnas reales de ambos gids, proponer mapeo exacto y un workflow n8n importable (JSON) sin pedir al usuario abrir Drive.
