# PROMPT PARA CLAUDE — MOVA · Portal Redactor (Paris) · Grupo Making OF

Responde y escribe todo en español de Chile (sin voseo), en lenguaje claro, y define cada abreviatura la primera vez. NO es el Brief ni el Evaluador: solo el Portal Redactor. Sin gastos extras: solo n8n, Google Sheets, Gmail y herramientas gratuitas (nada de servicios pagos como PDF.co).

## 1. Fuentes (léelas primero; son las versiones más recientes)
- Notion, proyecto: Portal Redactores MOVA → https://app.notion.com/p/3fbe059235b781ada97bce7111fc52d2
- Notion, estado actual: https://app.notion.com/p/408e059235b78184b0e0f999191e8d2a
- Notion, código redactor.html (última versión): https://app.notion.com/p/408e059235b781488db1d8f1c668ee64
- Notion, JSON n8n v3: https://app.notion.com/p/408e059235b7811c8b8bcd39909cc415
- Notion, flujo mostrado por Juan (28 oct): https://app.notion.com/p/408e059235b781c6820bc65289d1e32e
- Drive, planilla Paris: https://docs.google.com/spreadsheets/d/1vi7G3kqyo2paIiEqimT1A57DsgxdzlpbG3p69_6TXiM
  - URLs trabajadas (Histórico): gid=1739267264
  - Contenidos: gid=646469582 + una pestaña por mes (octubre)
- Drive, planilla accesos: "MOVA · Portal Redactores · Estado y accesos" (ID 1yKKKpgAhgwA4IK8vXOzoZx2iMCWqPC5TgYf1D81xvk0), pestañas Accesos | Historico | Portal_Estado.

## 2. Paso previo obligatorio: revisar las planillas (solo lectura)
Antes de tocar código, entrega una tabla por pestaña (letra de columna | título exacto | ejemplo) para:
- URLs trabajadas (gid=1739267264): títulos exactos, fila donde empiezan los datos, si lo nuevo se agrega al final o al principio.
- Contenidos, pestaña de octubre: títulos exactos, cómo se identifica la semana (Sem 1, Semana 1, fecha…), orden actual, columnas de keyword, URL, texto, anchor y URLs de interlinking.
- Accesos: títulos y si es Google Sheet nativo o .xlsx.
Señala celdas combinadas, filas vacías arriba o títulos repetidos.

## 3. Arquitectura (no rehacer)
- Un solo archivo autocontenido: redactor.html (sin CSS/JS aparte), lo más liviano posible (hoy ~167 KB; objetivo menor, minificado). NO embeber el consolidado Paris (causó error 500): los datos llegan por n8n después del login.
- Se sube a public_html/mova/seo/redactor.html → https://acme-chile.cl/mova/seo/redactor.html (ya funciona). No usar index.html.
- n8n: https://grupomakingof.app.n8n.cloud — webhooks POST: mova-auth, mova-sync-historico, mova-sync-contenidos, mova-guardar-texto, mova-vb-editor, mova-revision-listo. Todos reciben {token, empresa:"REDACTORES", cliente:"paris", correo}.
- Google Client ID: 352285024176-ki6a4n01f6vcbos3o12n9ql6uc6t2vq4.apps.googleusercontent.com
- Auth responde {ok, motivo, nombre, correo, nivel, rol, clientes, reingresar}. Nivel: editor/desarrollador/admin → editor; redact* → redactor; cliente → sin acceso. Solo Vigente = SI.
- Credenciales n8n: "Google Sheets account 3" y una cuenta Gmail (placeholder REEMPLAZAR_CREDENCIAL_GMAIL).

## 4. Diseño (ya aplicado; mantener)
- Layout y estética del Brief: login en tarjeta crema sobre degradado verde; barra superior blanca tipo píldora (☰, "Grupo Making OF · MOVA", título por pantalla, nombre, botón sol/luna, Salir); panel lateral petróleo redondeado; tarjetas blancas; tipografía MOVA (Instrument Sans títulos, Lato texto).
- ☰ esconde/muestra el panel lateral en escritorio y móvil (recuerda estado).
- Botón sol/luna = modo oscuro en todo el portal (recuerda preferencia). Contraste legible (WCAG AA) en día y noche.
- Dentro de Paris, todos los acentos en azul Paris (#0066cc / #1a7ae8 / #003d7a).
- Marcas: solo se muestran las que el usuario tiene en la columna Clientes Y que tienen portal (hoy solo Paris). Las demás (Jumbo, Prisa, Maicao, Supermercado) NO se ven.
- Sin franja "Entraste como…", sin cajas durazno informativas, sin tarjetas de indicadores, sin textos repetidos en la barra.

## 5. Cambios pendientes que debes aplicar
1. Paso 1: botón "Marcar las 40 ✓" → solo "Marcar".
2. Botón "Listo" (Paso 1): envía a mova-revision-listo solo las keywords con X y su comentario (una X sin comentario no deja enviar). n8n arma tabla HTML y la manda por Gmail al destinatario; registra en Historico.
3. Histórico · URLs trabajadas: colores con buen contraste en día y noche (URL, chips "Filtro · 2026", labels, input, select).
4. Eliminar el botón "Copiar selección Anchor+URL".
5. Interlinking: un clic (o arrastrar) en una keyword del histórico la agrega en la siguiente fila vacía de la tabla ANCHOR | URLS INTERLINKING | POSICIÓN (anchor = keyword, URL = su URL), sin duplicados; también se puede pegar con Ctrl+V texto "anchor<TAB>url" en varias filas. Tooltip: "Agregar a interlinking".
6. Contenidos: en la pestaña del mes (octubre) las semanas van de la MÁS ANTIGUA a la MÁS NUEVA (Sem 1 → Sem 4/5), en el HTML y en mova-sync-contenidos. Mes por defecto: el actual.
7. Histórico de URLs trabajadas: ordenado de la más actual a la más antigua, mismos parámetros de siempre, ajustado a los títulos reales que encontraste en el paso 2.
8. JSON n8n: nodos ordenados sin solaparse (una fila por webhook, de izquierda a derecha), JSON compacto, mismos IDs y credenciales.
9. Mantener: VB/X con comentarios, texto h2/h3/h4/p sin etiquetas visibles (copiar con etiquetas), KW + URL lado a lado, otras KW de la semana abajo, sol/luna del editor de texto, guardar texto y VB del editor en Portal_Estado y recuperarlos al recargar.

## 6. Entrega esperada
- redactor.html final (un archivo) y MOVA_Portal_Redactores_v4.json importable.
- Lista corta de qué cambió y pasos para Josefa: subir a cPanel, importar en n8n, asignar credenciales, activar y probar con Mel (mmanzur@mkof.cl, Editor, Vigente SI).
- Actualiza Notion (código y estado) reemplazando versiones viejas, con fecha.
