# MOVA · Portal Redactores (Paris) · Grupo Making OF

**Workspace único:** este repo (`portal-redactores-mova-web`). No usar `portal-redactores-mova-paris` ni Origin `josefa/portal-redactores`. Ver `docs/WORKSPACE_UNICO.md`.

Respaldo oficial del proyecto Portal Redactores. Actualizado al 19 de noviembre de 2026.
Responsable: Josefa Ogalde. Editora: Melannie Manzur (Mel). Aprobación y paso a producción: Juan Medina. Redactora de prueba: Adria Campos.

## Qué es
Es un portal web donde las redactoras trabajan sin entrar a Google Drive:
- **Paso 1:** revisan keywords (KW, palabras clave) y marcan VB (visto bueno) o X (observado) con un comentario. Al apretar "Listo", se envía un correo de resumen a Mel.
- **Paso 2:** redactan contenidos e interlinking (enlaces internos), filtrando por mes y semana.
- **Iniciativas Paris:** se leen desde la Matriz MOVA, que es la fuente oficial. La hoja INFORME no se usa porque es solo una réplica del reporte de Mel.

Funciona con acceso Google (Google Sign-In), n8n (herramienta de automatización) y Google Sheets. Sin costos extra: solo n8n, Google Sheets, Gmail y herramientas gratuitas.

## Estado
- Etapa: 4. Pruebas (las etapas son 1. Levantamiento, 2. Diseño, 3. Construcción, 4. Pruebas, 5. Marcha blanca).
- Avance: 85 %.
- El trabajo quedó en pausa el 30 de octubre por las vacaciones de Josefa.

## Estructura del repositorio
| Carpeta | Qué contiene |
|---|---|
| `portal/redactor.html` | Versión de producción v5 (minificada, 149 KB). Se sube a cPanel en `public_html/mova/seo/redactor.html`. URL: https://acme-chile.cl/mova/seo/redactor.html |
| `portal/src/redactor.src.html` | Fuente sin minificar de la v5. **Edita aquí** y minifica con terser y csso. |
| `n8n/MOVA_Portal_Redactores_v4.json` | Flujo n8n vigente (84 nodos). Se importa en n8n (grupomakingof.app.n8n.cloud) y no se sube a cPanel. |
| `n8n/MOVA_Redactores_Auth_v1.json`, `validar-acceso-redactores.code.js` | Rama de acceso para redactores. |
| `n8n/historico/` | Versiones anteriores del flujo (v2 y v3). |
| `docs/` | Feedback de Mel (31 puntos, en .md y PDF ilustrado), prompts, listados de archivos, instrucciones de cPanel, plantilla de la planilla Estado y accesos, y capturas de la v5. |
| `historico/` | Variantes anteriores del HTML y scripts del proceso de construcción. Son solo referencia. |

## Webhooks n8n que usa el portal
`mova-auth`, `mova-sync-historico`, `mova-sync-contenidos`, `mova-guardar-texto`, `mova-vb-editor`, `mova-revision-listo`, `mova-iniciativas`.
- Credencial de Sheets: "Google Sheets account 3".
- Credencial de Gmail: hay que elegirla en n8n al importar, porque en el JSON viene el marcador `REEMPLAZAR_CREDENCIAL_GMAIL`.

## Fuentes de datos
- **Planilla Paris** `1vi7G3kqyo2paIiEqimT1A57DsgxdzlpbG3p69_6TXiM`: Paso 1 lee la hoja "URLs trabajadas" (últimas 40 filas, de la más actual a la más antigua, con KW, URL y anchors).
- **Planilla "MOVA · Portal Redactores · Estado y accesos"**: hojas Accesos, Historico y Portal_Estado.
- **Matriz MOVA**, hoja INICIATIVAS.
- **Carpeta Drive del equipo:** `1wDrSDyBdJDaKRV7BqdecxKLYWk0MMAba`.

## Reglas de diseño y comportamiento
- Estética y diagramación del Brief, solo como referencia (no se modifica el Brief). Misma tipografía que MOVA.
- Dentro de Paris, todos los acentos van en el azul de Paris (#0066cc).
- Modo oscuro con un botón sol/luna.
- El botón ☰ esconde el menú lateral también en escritorio y el portal recuerda el estado elegido.
- Cada persona ve solo las marcas a las que tiene acceso. El menú "Clientes" incluye Paris, Jumbo, Prisa, Maicao y Supermercado.
- No se muestran mensajes verdes de confirmación, solo los avisos amarillos de error.
- Editor de texto: H2, H3 y H4 (títulos y subtítulos), P (párrafo), negritas, listas, enlaces y metas (meta título y meta descripción). Se copia con etiquetas.
- Idioma: español de Chile, sin voseo. Cada abreviatura se define la primera vez que aparece. El nombre de la empresa se escribe siempre "Grupo Making OF".
- WP PUBLISHER (carga masiva HTML) no es parte de este proyecto.

## Pendientes
- [ ] Dejar a Adria con Vigente = SI en Accesos.
- [ ] Agregar las columnas L `metaTitulo` y M `metaDescripcion` en Portal_Estado.
- [ ] Publicar la v5 en cPanel, importar y activar el flujo en n8n y elegir la credencial de Gmail.
- [ ] Confirmar que "Google Sheets account 3" puede leer la Matriz, y verificar los títulos reales de las columnas J/K y de INICIATIVAS.
- [ ] CORS (regla de qué sitios pueden llamar al n8n): hoy el valor es `*`. Hay que limitarlo a acme-chile.cl.
- [ ] Confirmar con Mel que Paso 1 lee "URLs trabajadas" (columnas D/E, últimas 40 filas).
- [ ] Sesión de prueba con Adria, ajustes, quitar la pestaña de prueba, registrar en la Matriz y obtener la aprobación de Juan para pasar a producción.
- [ ] Por definir: el nivel de Mel (Redactor o Editor) y el cliente de PORTAL REDACTORES en la Matriz (MKOF o PARIS).
- Nota: Josefa mencionó una v5 propia (redactor.html de 151 KB y MOVA_Portal_Redactores_v5.json de 77 KB) que no está en este respaldo. Si existe, súbela aquí y reemplaza los archivos de `portal/` y `n8n/`.

## Notion
- Estado: https://app.notion.com/p/408e059235b78184b0e0f999191e8d2a
- Feedback de Mel: https://app.notion.com/p/409e059235b781aa81abe3daccf41ae8
- Código del HTML: https://app.notion.com/p/408e059235b781488db1d8f1c668ee64
- JSON n8n: https://app.notion.com/p/408e059235b7811c8b8bcd39909cc415
