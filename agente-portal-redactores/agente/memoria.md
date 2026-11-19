# Memoria del agente Portal Redactores (al 18 nov 2026)

## Quién y cómo
- Josefa Ogalde es la responsable de Portal Redactor; firma sus correos como "Josefa".
- Español de Chile siempre (nunca voseo). Definir cada abreviatura la primera vez. Escribir siempre "Grupo Making OF".
- Este agente solo trabaja Portal Redactores; Brief lo lleva el agente Brief y Evaluador su propio agente.
- Sin gastos extras: solo n8n, Google Sheets, Gmail y herramientas gratuitas.
- Siempre dejar Notion actualizado al entregar o cambiar HTML o flujos.
- El proyecto se nombra "Portal Redactor" (singular); la etiqueta final dice "Portal Editor".

## Personas
- Melannie Manzur (Mel): editora, da el visto bueno (VB) editorial.
- Adria Campos: redactora, usuaria de prueba con rol Redactora.
- Juan Medina (jmedina@mkof.cl): cPanel y n8n del Comité; revisa y aprueba la ficha y el paso a producción; prefiere reunión antes que correos largos. Josefa depende de él para subir archivos al servidor (GoDaddy).
- Otros contactos del Comité: gnunez@mkof.cl, josefa@talkprod.cl.

## Producto
- Se publica en acme-chile.cl/mova/seo/redactor.html.
- Estética y diagramación del Brief; tipografía de MOVA; azul Paris #0066cc en la sección Paris y en su tarjeta/ítem del hub.
- Botón sol/luna para modo oscuro; botón ☰ esconde el menú lateral también en escritorio y recuerda el estado.
- Menú lateral "Clientes": Paris, Jumbo, Prisa, Maicao, Supermercado. Cada persona ve solo las marcas a las que tiene acceso (Josefa hoy solo Paris).
- Sección Paris lee la hoja "URLs trabajadas" (Google Sheet 1vi7G3kqyo2paIiEqimT1A57DsgxdzlpbG3p69_6TXiM), de la más actual a la más antigua, con KW, URL y anchors.
- Sin mensajes verdes de confirmación; solo avisos amarillos de error.
- Al apretar "Listo" en la revisión, el correo de resumen le llega a Mel.

## Gestión
- Etapas: Levantamiento, Diseño, Construcción, Pruebas, Marcha blanca. Pasos en Asana como subtareas de la etapa de desarrollo.
- La Matriz es la fuente oficial (INFORME es réplica, no usar). Iniciativas en la hoja INICIATIVAS de la Matriz.
- WP PUBLISHER (carga masiva HTML) no es parte de Portal Redactor.
- Carpeta Drive del equipo: 1wDrSDyBdJDaKRV7BqdecxKLYWk0MMAba.
- Workspace único: https://github.com/JosefaOgalde/portal-redactores-mova-web (environment Cursor Cloud del mismo nombre).
- Origin `josefa/portal-redactores` quedó vacío con README que redirige al canónico (19 nov 2026). No abrir agentes ahí.
- Repo viejo `portal-redactores-mova-paris` = primer entregable; no usar.

## Pendientes
- Josefa tiene una v5 propia (redactor.html 151 KB y MOVA_Portal_Redactores_v5.json 77 KB) que el agente no tiene; aquí va la v5 de 152 KB y el flujo n8n v4.
- Adria con Vigente = SI; columnas L metaTitulo y M metaDescripcion en Portal_Estado; publicar v5 y activar n8n con la credencial de Gmail; restringir CORS a acme-chile.cl; confirmar fuente "URLs trabajadas" con Mel; prueba con Adria; aprobación de Juan.
