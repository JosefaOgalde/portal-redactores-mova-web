import re
s=open('src.html',encoding='utf-8').read()
def R(old,new,cnt=1):
    global s
    c=s.count(old)
    assert c==cnt,(c,old[:80])
    s=s.replace(old,new)
# CSS
s=s.replace('.block.mv-drop{outline:2px dashed #0066cc}\n</style>','.block.mv-drop{outline:2px dashed #0066cc}\n'+open('css_add.css',encoding='utf-8').read()+'</style>',1)
assert 'v5 (feedback Mel' in s
# noindex
R('<meta name="viewport" content="width=device-width, initial-scale=1" />','<meta name="viewport" content="width=device-width, initial-scale=1" />\n  <meta name="robots" content="noindex,nofollow" />')
# 1 Hub: quitar CLIENTES
R('      <div class="ms-kicker">Clientes</div>\n      <h1>Un portal','      <h1>Un portal')
# 7/8 menu lateral
R('''    <button type="button" class="mvc-item" data-mvc="inicio" data-mova-nav="inicio">Inicio</button>
    <button type="button" class="mvc-item" data-mvc="revision" data-mova-nav="keywords">Keywords <em class="mvc-badge">1</em></button>
    <button type="button" class="mvc-item" data-mvc="redaccion" data-mova-nav="contenidos">Contenidos <em class="mvc-badge">2</em></button>
    <span class="mvc-item off">SEO <em class="mvc-soon">Próximo</em></span>
    <span class="mvc-item off">Implementación <em class="mvc-soon">Próximo</em></span>''',
'''    <button type="button" class="mvc-item" data-mvc="inicio" data-mova-nav="inicio">Inicio</button>
    <button type="button" class="mvc-item" data-mvc="iniciativas" data-mova-nav="iniciativas">Iniciativas</button>
    <div class="mvc-sec">Contenidos</div>
    <button type="button" class="mvc-item" data-mvc="revision" data-mova-nav="keywords">Keywords <em class="mvc-badge">1</em></button>
    <button type="button" class="mvc-item" data-mvc="redaccion" data-mova-nav="contenidos">Contenidos <em class="mvc-badge">2</em></button>
    <span class="mvc-item off">Contenidos HTML <em class="mvc-soon">Próximo</em></span>''')
R('''<button type="button" class="ms-side-item" disabled aria-disabled="true"><span class="ico">SE</span><span>SEO</span><span class="soon">Próximo</span></button>
          <button type="button" class="ms-side-item" disabled aria-disabled="true"><span class="ico">IM</span><span>Implementación</span><span class="soon">Próximo</span></button>''',
'''<button type="button" class="ms-side-item" data-mova-nav="iniciativas"><span class="ico">IN</span><span>Iniciativas</span></button>
          <button type="button" class="ms-side-item" disabled aria-disabled="true"><span class="ico">CH</span><span>Contenidos HTML</span><span class="soon">Próximo</span></button>''')
# Inicio: tarjeta Iniciativas
R('''<span class="ms-tag">Texto H2/H3/H4</span><span class="ms-tag">Anchors</span></div><span class="ms-abrir">ABRIR ›</span></div></button>
          </div>''','''<span class="ms-tag">Texto H2/H3/H4</span><span class="ms-tag">Anchors</span></div><span class="ms-abrir">ABRIR ›</span></div></button>
            <button type="button" class="ms-bullet" data-mova-nav="iniciativas"><div class="ms-bullet-top"><div class="ms-bullet-ico">IN</div><span class="ms-badge-live">MATRIZ</span></div><h3>Iniciativas Paris</h3><div class="ms-bullet-foot"><div><span class="ms-tag">Fecha</span><span class="ms-tag">Link MOVA</span></div><span class="ms-abrir">ABRIR ›</span></div></button>
          </div>''')
# Paso 1 hero + fuente
R('<p>Revisa una a una (VB o X). Keyword y URL editables. Puedes marcar las 40 de una. Al terminar: listo.</p>',
  '<p>Revisa una a una con VB (visto bueno) o X. Si marcas X, el comentario es obligatorio. La keyword y la URL se editan con doble clic. Al terminar, presiona Listo.</p>')
R('<div class="panel-h">Keywords de la semana</div>','<div class="panel-h">Keywords a revisar<small id="revSrc">Últimas 40 filas ocupadas de la planilla fuente (columnas D keyword y E URL).</small></div>')
R('<button type="button" class="btn btn-ghost" id="btnAllVb" title="Marca VB en las 40">Marcar</button>','<button type="button" class="btn btn-ghost" id="btnAllVb" title="Marca VB en todas las keywords">Marcar</button>')
R('<button type="button" class="btn btn-ok" id="btnListoRev" disabled>listo</button>','<button type="button" class="btn btn-ok" id="btnListoRev" disabled>Listo</button>')
# Paso 2 hero
R('<p>Textos por Semana 1–4 y mes. El texto se ve con forma (sin etiquetas); al copiar lleva HTML.</p>',
  '<p>Textos por mes y semana (1 a 5). En el editor ves el texto con formato; al copiar se lleva con etiquetas HTML.</p>')
# Filtros semana 5 + estado único
R('''<option value="3">Semana 3</option><option value="4">Semana 4</option>
              </select>''','''<option value="3">Semana 3</option><option value="4">Semana 4</option>
                <option value="5">Semana 5</option>
              </select>''')
R('''            <div class="fld">
              <label>Estado redacción</label>
              <select id="fStatus">
                <option value="">Todas</option>
                <option value="ok">Con VB</option>
                <option value="pendiente">Pendientes</option>
              </select>
            </div>
            <div class="fld">
              <label>Visto bueno editor</label>
              <select id="fVbEditor">
                <option value="">Todas</option>
                <option value="pendiente">Pendiente</option>
                <option value="ok">OK</option>
              </select>
            </div>''','''            <div class="fld">
              <label>Estado</label>
              <select id="fStatus" title="Visto bueno (VB) leído de la planilla: columnas J TEXTO VB y K HTML OK">
                <option value="">Todos</option>
                <option value="sinvb">Sin VB</option>
                <option value="vb">Texto con VB</option>
                <option value="html">HTML OK</option>
              </select>
            </div>''')
R('<input id="q" type="search" placeholder="Keyword o URL…" />','<input id="q" type="search" placeholder="Filtrar por keyword o URL…" autocomplete="off" name="filtro-contenidos" />')
R('<input id="hq" type="search" placeholder="Keyword o URL…" autocomplete="off" />','<input id="hq" type="search" placeholder="Keyword o URL…" autocomplete="off" name="filtro-historico" />')
R('''<span class="toast" id="toast"></span><span style="font-size:.68rem;color:var(--muted);margin-left:.5rem">Arrastra Anchor+URL (varias semanas) · solo esas columnas · Ctrl/Cmd+C · Ctrl+V «anchor⇥url» en varias filas · clic o arrastra del Histórico para agregar · doble clic para editar</span>''',
'''<span class="sheet-hint">Todas las celdas se editan directo: escribe o pega con Ctrl+V. Puedes pegar varias filas de una vez (por ejemplo, Anchor ⇥ URL desde Excel). Clic en una keyword del Histórico la agrega a la keyword activa. Clic en el título de una columna la copia. El buscador solo filtra.</span><span class="toast" id="toast"></span>''')
# Popup editor
R('''        <div class="texto-refs" id="tKwUrlMeta" aria-label="URL y keyword del ítem">
          <div class="refs-head">
            <span class="refs-title">URL y keyword</span>
            <div class="refs-tools">
              <button type="button" class="btn-mini" id="btnCopiarRefs">Copiar todas</button>
            </div>
          </div>
          <div id="tRefsList"></div>
        </div>
        <div class="texto-theme-bar">
          <button type="button" class="btn-theme" id="btnTemaTexto" title="Cambiar fondo del texto (luna = oscuro, sol = claro)" aria-label="Cambiar tema del texto">🌙</button>
        </div>
        <div id="textoBody" class="texto-editor" contenteditable="true" role="textbox" aria-multiline="true" data-placeholder="Escribe o pega el texto. Verás la forma (títulos y párrafos) sin etiquetas. Al copiar se llevan &lt;h2&gt;, &lt;h3&gt;, &lt;h4&gt; y &lt;p&gt;."></div>''',
'''        <div class="texto-refs" id="tKwUrlMeta" aria-label="Keyword y URL del contenido">
          <div class="refs-head">
            <span class="refs-title">Keyword y URL</span>
          </div>
          <div id="tRefsList"></div>
        </div>
        <div class="meta-fields">
          <div class="mf">
            <div class="mf-top"><label for="tMetaTitulo">Meta título</label><span><span class="cnt" id="cntMetaTitulo">0/60</span> <button type="button" class="btn-mini" data-copy-meta="tMetaTitulo">Copiar</button></span></div>
            <input id="tMetaTitulo" type="text" autocomplete="off" placeholder="Título para buscadores (recomendado hasta 60 caracteres)" />
          </div>
          <div class="mf">
            <div class="mf-top"><label for="tMetaDesc">Meta descripción</label><span><span class="cnt" id="cntMetaDesc">0/155</span> <button type="button" class="btn-mini" data-copy-meta="tMetaDesc">Copiar</button></span></div>
            <textarea id="tMetaDesc" rows="2" placeholder="Descripción para buscadores (recomendado hasta 155 caracteres)"></textarea>
          </div>
        </div>
        <div class="ed-toolbar" id="edToolbar" role="toolbar" aria-label="Formato del texto">
          <button type="button" data-cmd="bold" title="Negrita (Ctrl+B)"><b>B</b></button>
          <span class="sep"></span>
          <button type="button" data-cmd="link" title="Agregar enlace (Ctrl+K)">🔗 Enlace</button>
          <button type="button" data-cmd="unlink" title="Quitar enlace">Quitar enlace</button>
          <span class="sep"></span>
          <button type="button" data-cmd="ul" title="Lista con viñetas">• Lista</button>
          <span class="sep"></span>
          <button type="button" data-cmd="h2" title="Título H2">H2</button>
          <button type="button" data-cmd="h3" title="Subtítulo H3">H3</button>
          <button type="button" data-cmd="h4" title="Subtítulo H4">H4</button>
          <button type="button" data-cmd="p" title="Párrafo">P</button>
          <span class="grow"></span>
          <button type="button" class="btn-theme" id="btnTemaTexto" title="Cambiar fondo del texto" aria-label="Cambiar fondo del texto">🌙</button>
        </div>
        <div id="textoBody" class="texto-editor" contenteditable="true" role="textbox" aria-multiline="true" data-placeholder="Escribe o pega el texto (desde Claude, Word o Docs se mantienen títulos, negritas, listas y enlaces). Al copiar se lleva con etiquetas HTML."></div>
        <div class="texto-refs interlink-box" aria-label="Interlinking de la keyword">
          <div class="refs-head">
            <span class="refs-title">Interlinking</span>
            <div class="refs-tools"><button type="button" class="btn-mini" id="btnCopiarRefs">Copiar todas las URL</button></div>
          </div>
          <div id="tInterlink"></div>
        </div>
        <div class="link-bub" id="linkBub" role="dialog" aria-label="Enlace"></div>''')
# Vista Iniciativas
R('''    </div>
  </main>
  <footer>''','''    </div>

    <!-- ========== INICIATIVAS ========== -->
    <div class="view" id="view-iniciativas">
      <section class="hero">
        <h1>Iniciativas Paris</h1>
        <p>Iniciativas de Paris registradas en la Matriz MOVA, con su fecha y el link directo a cada portal.</p>
      </section>
      <div class="panel" style="margin-top:1rem;min-height:auto">
        <div class="panel-h">Iniciativas<small>Fuente: Matriz de iniciativas MOVA (hoja INICIATIVAS), leída vía n8n. Solo se muestran las de Paris.</small></div>
        <div class="sheet-wrap scroll"><div id="iniBox"></div></div>
      </div>
    </div>
  </main>
  <footer>''')
R('<footer>Grupo Making Of · MOVA · Portal Redactores · Paris.cl</footer>','<footer>Grupo Making OF · MOVA · Portal Redactor · Paris.cl</footer>')
R('<div class="mv-t">MOVA <span>Redactor</span></div>','<div class="mv-t">Portal <span>Redactor</span></div>')
open('s1.html','w',encoding='utf-8').write(s)
print('ok')
