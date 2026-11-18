# Prompt para Cursor · Portal Redactores (última versión)

Pega esto en Cursor y adjunta el zip (o la carpeta descomprimida). Archivo de entrada: `panel-general.html` (README). Trabaja sobre `portal-redactores-paris.html` / `portal-redactores-paris-entregable.html` (misma base). No reescribas todo el portal: aplica estos cambios puntuales.

Empresa: Grupo Making OF. Español claro. El redactor no ve etiquetas HTML; al copiar sí debe llevar etiquetas. Usuario final no abre Google Drive.

## 1) Renombrar la vista
La vista general del panel / portal debe llamarse **«Vista editor»** (texto visible en UI, títulos y menú). Busca «Vista general», «Panel general» donde sea la vista del editor y unifica el nombre a **Vista editor**. Mantén `panel-general.html` como archivo de entrada si hace falta, pero el nombre que ve la persona es Vista editor.

## 2) Popup de texto (bdTexto / textoBody) — estructura tipográfica
Hoy el popup es un `<textarea>` de bloque continuo. Cámbialo para que:

### Reglas de estructura del contenido
- **h2** = encabezados (siempre hay **2 h2** por texto).
- **h3** y **h4** = subtítulos.
- Todo lo demás = **p** (párrafo).
- No uses otras etiquetas de bloque para el cuerpo (nada de h1/h5/h6/div sueltos en el contenido del artículo).

### Comportamiento para el redactor
- **En pantalla:** ve el texto con la misma forma (jerarquía visual: dos encabezados h2, subtítulos h3/h4, párrafos), **sin ver las etiquetas** `<h2>`, `<p>`, etc.
- **Al copiar (Ctrl/Cmd+C o botón «Copiar con etiquetas»):** el portapapeles debe llevar el HTML con las etiquetas correctas (`<h2>`, `<h3>`, `<h4>`, `<p>`), para pegarlo donde corresponda.
- Si pega un texto que ya viene con esa forma / etiquetas, al abrirlo debe **visualizarse con la misma forma** (no aplastarlo a un solo bloque plano).

Implementación sugerida: editor visual (contenteditable o bloques) + capa/serialización HTML; botón explícito «Copiar con etiquetas». Al guardar, persiste el HTML estructurado (no solo texto plano).

## 3) Arriba del área de texto en el popup: URLs + keywords (KW)
Encima del editor de texto (dentro del popup), muestra las **URL con sus keywords (KW)** del ítem / bloque actual.
- El redactor debe poder **copiar y pegar** cada URL (y ver la KW asociada).
- Si hay varias URLs/anchors del bloque, listarlas todas de forma clara (KW + URL + botón o clic para copiar).

## 4) Paso 2 — quitar «Semana de revisión»
Los redactores trabajan por **semana** (sem + número: Semana 1, 2, 3, 4…).
- Quita la opción / pestaña / mes **«Semana revisión»** (y cualquier lógica que la inyecte al final del selector de mes).
- El filtro de **Semana** (1–4) y el mes de trabajo se mantienen.
- No inventes otra semana especial de revisión.

## 5) Paso 2 — campo «Visto bueno del editor»
Hoy hay estatus de redacción (ej. con VB / pendientes). Falta un campo aparte para el **visto bueno del editor**.
- Agrega un campo/columna/control claro: **Visto bueno editor** (valores simples, ej. Pendiente / OK, o checkbox; alinea con el diseño actual del portal).
- No reemplaces el estatus de redacción: son **dos cosas**: estado de redacción + visto bueno del editor.
- Que se pueda filtrar o ver en la grilla del Paso 2.

## 6) Entrega
- Aplica los cambios en los HTML del entregable.
- Si `portal-redactores-paris.html` y `portal-redactores-paris-entregable.html` son duplicados, deja una sola fuente de verdad y sincroniza o documenta cuál abrir.
- Actualiza `panel-general.html` para que el enlace/nombre diga Vista editor.
- Devuélveme: lista de archivos tocados, cómo probar el popup (ver sin etiquetas / copiar con etiquetas), y captura o descripción de Paso 2 sin «Semana revisión» y con «Visto bueno editor».

No toques Brief ni Paris marketing portal salvo lo necesario para este portal de redactores. No subas a cPanel tú: deja el zip/archivos listos.
