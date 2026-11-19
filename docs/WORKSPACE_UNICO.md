# Proyecto único · Portal Redactores

## Abre solo esto en Cursor

**Origin:** `josefa/portal-redactores`  
https://origin.cursor.com/josefa/portal-redactores

Ya tiene el HTML v5, n8n, docs y el respaldo del agente (sincronizado 19 nov 2026).

## Qué sigue apareciendo (y cómo sacarlo)

| Entrada | Acción |
|---|---|
| GitHub `portal-redactores-mova-web` | Mismo trabajo (Pages). Si no quieres verlo doble: en Cursor abre solo Origin. O en tu Mac corre `scripts/unificar-portal-redactores.sh` para crear mirror y borrar el stub. |
| GitHub `portal-redactores-mova-paris` | Primer entregable. Settings → **Archive**. |

## Script en tu Mac

```bash
bash scripts/unificar-portal-redactores.sh
```

Requiere `origin` CLI logueado (`origin auth login`). El cloud agent **no** puede borrar/crear mirror en el namespace `josefa` (token sin ese scope).

Actualizado: 19 nov 2026 (America/Santiago).
