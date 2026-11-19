# Entrega MOVA · Portal Redactores (zip para Claude + Drive)

**Empresa:** Grupo Making OF  
**Producto:** MOVA · Portal Redactores  
**Entrada del zip:** `index.html` (3 accesos)

---

## 1. Qué hay en este zip

| Archivo | Rol |
|---|---|
| `index.html` | Hub: Editor / Redactor / Cliente |
| `panel-general.html` | **Vista editor** — ve todos los clientes y lo que hacen los redactores |
| `panel-redactor.html` | **Vista redactor** — solo clientes asignados |
| `panel-cliente.html` | **Vista cliente** — pendiente (“la vemos después”) |
| `config-accesos.js` | Roles, clientes, asignaciones, Sheets, hooks n8n |
| `portal-paris.html` | Hub del cliente Paris |
| `portal-redactores-paris.html` | Portal completo Paso 1 + Paso 2 |
| `portal-redactores-paris-entregable.html` | Igual al anterior (copia de entrega) |
| `portal-redactores-paris-solo-redaccion.html` | Variante solo redacción |
| `portal-revision-keywords-paris.html` | Variante solo revisión |
| `n8n/README-n8n.md` | Flujos a cablear |
| `README.txt` | Arranque rápido |

---

## 2. Roles (importante)

1. **Editor** → ve **todo** lo que hacen los redactores (todos los clientes).  
2. **Redactor** → solo la info de los **clientes asignados**.  
3. **Cliente** → se define después (placeholder listo).

Asignaciones actuales (demo) en `config-accesos.js` → `redactores[].clientes`.  
Claude debe reemplazar esto leyendo Drive/Sheets cuando se vincule.

---

## 3. Google Sheets a vincular (Drive)

Spreadsheet: `1vi7G3kqyo2paIiEqimT1A57DsgxdzlpbG3p69_6TXiM`

### A) URLs trabajadas → buscador Histórico
https://docs.google.com/spreadsheets/d/1vi7G3kqyo2paIiEqimT1A57DsgxdzlpbG3p69_6TXiM/edit?gid=1739267264#gid=1739267264  

- Alimenta el panel **Histórico · URLs trabajadas**.  
- Mostrar de la **más actual a la más antigua** (como ya estaba).

### B) Contenidos por mes (pestañas)
https://docs.google.com/spreadsheets/d/1vi7G3kqyo2paIiEqimT1A57DsgxdzlpbG3p69_6TXiM/edit?gid=646469582#gid=646469582  

- Cada **pestaña = mes**.  
- Dentro del mes: **semana más actual → más vieja** (Semana 1–4).  
- Alimenta la grilla de Paso 2 (redacción).

> Hoy el HTML lleva un consolidado **embebido** de respaldo. Claude + Drive debe leer estos links y proponer sync (vía n8n o export) sin que el usuario final abra Drive.

---

## 4. Qué pedirle a Claude con este zip

1. Abrir el zip y leer `config-accesos.js` + este archivo.  
2. Con Drive vinculado, **leer** los dos gids de arriba.  
3. Mapear columnas del Sheet → `historico[]` y `contenidos[]` del portal.  
4. Diseñar / cablear **n8n** según `n8n/README-n8n.md`.  
5. Mantener roles: editor ve todo; redactor filtrado por asignación.  
6. No Brief. No subir a cPanel desde este paquete salvo que lo pidan.

---

## 5. Funciones ya en el portal (Paso 2)

- Texto con forma visual (h2/h3/h4/p); copiar con etiquetas.  
- KW + URL lado a lado; otras KW de la semana abajo.  
- Sol/luna en el editor de texto.  
- Selección Anchor+URL multi-semana → copia limpia `anchor\turl`.  
- Sin «Semana revisión»; filtro Semana 1–4 + mes.  
- Campo **Visto bueno editor** (aparte del estatus de redacción).

---

## 6. Cómo abrir en local

1. Descomprimir el zip.  
2. Abrir `index.html`.  
3. Elegir **Vista editor** o **Vista redactor**.  
4. Paris → Paso 1 / Paso 2.

Usuario final **no** abre Drive: Sheets + n8n alimentan el portal.
