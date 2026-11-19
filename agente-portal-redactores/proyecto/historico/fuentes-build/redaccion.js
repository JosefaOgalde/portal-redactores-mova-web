    /* ---- Redacción ---- */
    const LS_EDITS = "mova-paris-edits-v5";
    function itemKey(it) { return it._key || (it._key = [it.mes || "", it.ord || "", String(it.keyword || "").toLowerCase()].join("|")); }
    function loadEdits() { try { return JSON.parse(localStorage.getItem(LS_EDITS) || "{}") || {}; } catch (e) { return {}; } }
    function saveEdit(it) {
      if (!it) return;
      try {
        const all = loadEdits();
        all[itemKey(it)] = { keyword: it.keyword, tipo: it.tipo, url: it.url, semana: it.semana, texto: it.texto || "",
          metaTitulo: it.metaTitulo || "", metaDescripcion: it.metaDescripcion || "", listo: !!it.listo,
          anchors: (it.anchors || []).map(x => ({ a: x.a || "", u: x.u || "", p: x.p || "" })), t: Date.now() };
        localStorage.setItem(LS_EDITS, JSON.stringify(all));
      } catch (e) {}
    }
    function applyEdits() {
      const all = loadEdits();
      ITEMS.forEach(it => {
        const e = all[itemKey(it)];
        if (!e) return;
        ["keyword","tipo","url","texto","metaTitulo","metaDescripcion"].forEach(k => { if (e[k] != null && e[k] !== "") it[k] = e[k]; });
        if (e.semana) it.semana = Number(e.semana) || it.semana;
        if (e.listo) it.listo = true;
        if (Array.isArray(e.anchors) && e.anchors.some(x => x.a || x.u || x.p)) it.anchors = e.anchors.slice(0, 10);
        while (it.anchors.length < 10) it.anchors.push({a:"",u:"",p:""});
      });
    }
    function dedupeItems(list) {
      const seen = new Set();
      return list.filter(it => {
        const k = [it.mes, it.semana, String(it.keyword || "").trim().toLowerCase(), String(it.url || "").trim().toLowerCase()].join("|");
        if (seen.has(k)) return false;
        seen.add(k); return true;
      });
    }

    function semClass(n) {
      const s = Math.max(1, Math.min(5, Number(n) || 1));
      return `sem sem-${s}`;
    }
    function cleanPos(p) {
      return String(p ?? "").replace(/\s*\([^)]*\)/g, "").replace(/\s*\([^)]*$/g, "").trim();
    }
    function estadoDe(it) {
      if (it.htmlOk) return "html";
      if (it.textoVb || it.vbEditor === "ok") return "vb";
      return "sinvb";
    }
    // Solo filtra: nunca escribe en ITEMS ni en celdas
    function filteredItems() {
      const q = document.getElementById("q").value.trim().toLowerCase();
      const mes = mesSel.value;
      const sem = document.getElementById("semana").value;
      const st = document.getElementById("fStatus").value;
      return ITEMS.map((it, i) => ({ it, i })).filter(({ it }) => {
        if (mes && it.mes !== mes) return false;
        if (sem && String(Number(it.semana) || "") !== sem) return false;
        if (st && estadoDe(it) !== st) return false;
        if (q) {
          const hay = [it.keyword, it.url].concat((it.anchors || []).flatMap(a => [a.a, a.u])).join(" ").toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      }).sort((a, b) => {
        const ds = (Number(a.it.semana) || 0) - (Number(b.it.semana) || 0);
        if (ds) return ds;
        return (Number(a.it.ord) || a.i) - (Number(b.it.ord) || b.i);
      }).map(({ it, i }) => Object.assign({ _i: i }, it));
    }
    function blockRoot(i) { return blocksEl.querySelector(`.block[data-i="${i}"]`); }
    function setActive(i) {
      if (idx === i) return;
      idx = i;
      blocksEl.querySelectorAll(".block").forEach(b => b.classList.toggle("active", Number(b.dataset.i) === i));
      syncTextoHead();
    }
    function ensureAnchors(it) {
      if (!Array.isArray(it.anchors)) it.anchors = [];
      while (it.anchors.length < 10) it.anchors.push({a:"",u:"",p:""});
      return it.anchors;
    }
    function readBlockToItem(i) {
      const root = blockRoot(i);
      if (!root || !ITEMS[i]) return;
      const it = ITEMS[i];
      const g = f => root.querySelector(`[data-f=${f}]`);
      if (g("semana")) it.semana = Number(g("semana").value) || 1;
      if (g("keyword")) it.keyword = g("keyword").value.trim();
      if (g("tipo")) it.tipo = g("tipo").value;
      if (g("url")) it.url = g("url").value.trim();
      ensureAnchors(it);
      for (let n = 0; n < 10; n++) {
        const a = root.querySelector(`.anc-cell[data-a="${n}"]`), u = root.querySelector(`.url-cell[data-u="${n}"]`), p = root.querySelector(`.pos-cell[data-n="${n}"]`);
        if (a) it.anchors[n].a = cellText(a);
        if (u) it.anchors[n].u = cellText(u);
        if (p) it.anchors[n].p = cleanPos(cellText(p));
      }
      saveEdit(it);
    }
    function readSheetToItem() { if (idx != null) readBlockToItem(idx); }
    function refreshBlockCells(i) {
      const root = blockRoot(i), it = ITEMS[i];
      if (!root || !it) return;
      ensureAnchors(it);
      for (let n = 0; n < 10; n++) {
        const a = root.querySelector(`.anc-cell[data-a="${n}"]`), u = root.querySelector(`.url-cell[data-u="${n}"]`), p = root.querySelector(`.pos-cell[data-n="${n}"]`);
        if (a) a.textContent = it.anchors[n].a || "";
        if (u) { u.textContent = it.anchors[n].u || ""; u.title = it.anchors[n].u || ""; }
        if (p) { p.textContent = cleanPos(it.anchors[n].p || ""); p.classList.toggle("failed", /failed/i.test(String(it.anchors[n].p || ""))); }
      }
    }

    function fallbackCopy(text, done) {
      const ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta);
      if (done) done();
    }
    function copyText(text, msg) {
      const done = () => mvToast(msg);
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
      else fallbackCopy(text, done);
    }
    function copyRich(html, plain, msg) {
      const done = () => mvToast(msg);
      try {
        if (navigator.clipboard && window.ClipboardItem) {
          navigator.clipboard.write([new ClipboardItem({ "text/plain": new Blob([plain], { type: "text/plain" }), "text/html": new Blob([html], { type: "text/html" }) })]).then(done).catch(() => copyText(plain, msg));
          return;
        }
      } catch (e) {}
      copyText(plain, msg);
    }
    function mvToast(m) {
      const t = document.getElementById("toast");
      if (!t) return;
      t.textContent = m; t.classList.add("show");
      clearTimeout(mvToast._t); mvToast._t = setTimeout(() => t.classList.remove("show"), 2400);
    }

    function estadoCellHtml(it) {
      const e = estadoDe(it);
      let pills = "";
      if (e === "html") pills = `<span class="st-pill html" title="Columna K HTML OK con visto bueno">HTML OK</span><span class="st-pill ok" title="Columna J TEXTO VB">Texto VB</span>`;
      else if (e === "vb") pills = `<span class="st-pill ok" title="Columna J TEXTO VB con visto bueno">Texto VB</span>`;
      else if (it.listo) pills = `<span class="st-pill pend" title="Enviado; falta el VB del editor">Por revisar</span>`;
      else pills = `<span class="st-pill off">Sin VB</span>`;
      if (movaEsEditor()) {
        const ok = it.vbEditor === "ok" || it.textoVb;
        pills += `<select data-vb title="Visto bueno del editor"><option value="pendiente" ${ok ? "" : "selected"}>Sin VB</option><option value="ok" ${ok ? "selected" : ""}>Dar VB</option></select>`;
      }
      return pills;
    }
    function renderBlockHtml(it) {
      const i = it._i;
      const tipoOpts = ["PLP","Filtro","Lista","Blog","Landing","Search"].map(t => `<option ${normalizeTipo(it.tipo)===t?"selected":""}>${t}</option>`).join("");
      const semOpts = [1,2,3,4,5].map(n => `<option value="${n}" ${Number(it.semana)===n?"selected":""}>Sem ${n}</option>`).join("");
      const tieneTexto = !!(it.texto || "").trim();
      const drive = /^https?:\/\//i.test(it.textoDrive || "") ? `<a class="drive-link" href="${esc(it.textoDrive)}" target="_blank" rel="noopener">Texto Drive ↗</a>` : "";
      const an = ensureAnchors(it);
      let rows = "";
      for (let n = 0; n < 10; n++) {
        const a = an[n] || {a:"",u:"",p:""};
        rows += `<tr data-row-item="${i}">`;
        if (n === 0) {
          rows += `<td class="cell-span" rowspan="10" style="text-align:center;vertical-align:middle"><select data-f="semana" class="sem-sel ${semClass(it.semana)}" title="Semana">${semOpts}</select></td>`;
          rows += `<td class="cell-kw" rowspan="10"><textarea class="cell-ta" data-f="keyword" rows="3" spellcheck="false" title="${esc(it.keyword||"")}">${esc(it.keyword||"")}</textarea></td>`;
          rows += `<td class="cell-span" rowspan="10"><select data-f="tipo">${tipoOpts}</select></td>`;
          rows += `<td class="cell-span cell-url-main" rowspan="10"><textarea class="cell-ta" data-f="url" rows="4" spellcheck="false" title="${esc(it.url||"")}">${esc(it.url||"")}</textarea></td>`;
        }
        rows += `<td class="anc-cell" data-a="${n}" contenteditable="true" spellcheck="false">${esc(a.a||"")}</td>`;
        rows += `<td class="url-cell" data-u="${n}" contenteditable="true" spellcheck="false" title="${esc(a.u||"")}">${esc(a.u||"")}</td>`;
        rows += `<td class="pos-cell${/failed/i.test(String(a.p||""))?" failed":""}" data-item="${i}" data-n="${n}" contenteditable="true" spellcheck="false">${esc(cleanPos(a.p||""))}</td>`;
        if (n === 0) {
          rows += `<td class="cell-span est-cell no-select" rowspan="10">${estadoCellHtml(it)}</td>`;
          rows += `<td class="cell-span no-select" rowspan="10" style="text-align:center">
            ${drive}
            <div style="font-size:.65rem;color:var(--muted);margin-bottom:.35rem" data-texto-flag>${tieneTexto ? "Texto cargado" : "Sin texto"}</div>
            <button type="button" class="btn btn-ghost" data-act="texto" style="width:100%;margin-bottom:.35rem">Texto</button>
            <button type="button" class="btn btn-ok" data-act="listo" style="width:100%">${it.listo ? "Enviado" : "Listo"}</button>
          </td>`;
        }
        rows += "</tr>";
      }
      return `<div class="block ${idx===i?"active":""}" data-i="${i}">
        <div class="block-bar"><div class="title"><span data-title>${esc(it.keyword||"sin keyword")}</span></div></div>
        <table class="sheet excel">
          <colgroup><col class="c-sem" /><col class="c-kw" /><col class="c-tipo" /><col class="c-url" /><col class="c-anc" /><col class="c-iu" /><col class="c-pos" /><col class="c-vb" /><col class="c-txt" /></colgroup>
          <thead><tr>
            <th>Semana</th><th>Keyword</th><th>Tipo</th><th>Url</th>
            <th class="col-selectable" data-col-sel="anc" title="Clic para copiar todos los anchors">Anchor</th>
            <th class="col-selectable" data-col-sel="url" title="Clic para copiar todas las URL">URLs interlinking</th>
            <th class="col-selectable" data-col-sel="pos" title="Clic para copiar todas las posiciones">Posición</th>
            <th class="no-select">Estatus</th><th class="no-select">Texto</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
    }

    // Pegado tipo Excel: desde la celda hacia abajo (sigue en la keyword siguiente) y hacia la derecha (Anchor → URL → Posición)
    function pasteGrid(cell, raw) {
      const kinds = ["anc","url","pos"];
      const kind = cell.classList.contains("anc-cell") ? "anc" : cell.classList.contains("url-cell") ? "url" : "pos";
      const lines = String(raw).replace(/\r\n?/g, "\n").split("\n");
      while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
      const rows = lines.map(l => l.split("\t"));
      const list = [...blocksEl.querySelectorAll("." + kind + "-cell")];
      const s = list.indexOf(cell);
      if (s < 0) return 0;
      const touched = new Set(); let k = 0;
      for (const r of rows) {
        const c = list[s + k]; if (!c) break;
        let cols = r;
        if (kind === "anc" && r.length === 1) { const m = r[0].match(/^(.*?)\s+(https?:\/\/\S+)\s*$/i); if (m) cols = [m[1], m[2]]; }
        const tr = c.closest("tr"), st = kinds.indexOf(kind);
        cols.forEach((v, j) => {
          const kk = kinds[st + j]; if (!kk) return;
          const t = tr.querySelector("." + kk + "-cell"); if (!t) return;
          t.textContent = kk === "pos" ? cleanPos(v) : String(v).trim();
          if (kk === "url") t.title = t.textContent;
        });
        touched.add(Number(c.closest(".block").dataset.i)); k++;
      }
      touched.forEach(i => readBlockToItem(i));
      if (idx != null && touched.has(idx)) renderInterlink();
      mvToast(k + " fila(s) pegadas" + (k < rows.length ? " · " + (rows.length - k) + " no cupieron" : ""));
      return k;
    }

    function copyColumn(i, kind) {
      readBlockToItem(i);
      const it = ITEMS[i]; if (!it) return;
      const vals = ensureAnchors(it).map(x => kind === "anc" ? x.a : kind === "url" ? x.u : cleanPos(x.p));
      const last = vals.map(v => !!String(v||"").trim()).lastIndexOf(true);
      if (last < 0) { mvToast("La columna está vacía"); return; }
      copyText(vals.slice(0, last + 1).join("\n"), (kind === "anc" ? "Anchors" : kind === "url" ? "URLs" : "Posiciones") + " copiadas (" + (last + 1) + ")");
    }

    function renderBlocks() {
      const rows = filteredItems();
      if (!rows.length) {
        blocksEl.innerHTML = `<div class="empty">Sin contenidos para este filtro</div>`;
        return;
      }
      if (idx == null || !rows.some(r => r._i === idx)) idx = rows[0]._i;
      blocksEl.innerHTML = rows.map(renderBlockHtml).join("");
      blocksEl.querySelectorAll(".block").forEach(block => {
        const i = Number(block.dataset.i);
        block.addEventListener("focusin", () => setActive(i));
        block.addEventListener("mousedown", () => setActive(i));
        block.querySelectorAll("[data-f]").forEach(el => {
          const upd = () => {
            readBlockToItem(i);
            if (el.dataset.f === "keyword") { const t = block.querySelector("[data-title]"); if (t) t.textContent = el.value.trim() || "sin keyword"; el.title = el.value; }
            if (el.dataset.f === "url") el.title = el.value;
            if (el.dataset.f === "semana") el.className = "sem-sel " + semClass(el.value);
            if (idx === i) syncTextoHead();
          };
          el.addEventListener("input", upd);
          el.addEventListener("change", upd);
        });
        block.querySelectorAll(".anc-cell,.url-cell,.pos-cell").forEach(el => {
          el.addEventListener("input", () => { readBlockToItem(i); if (el.classList.contains("url-cell")) el.title = cellText(el); });
          el.addEventListener("blur", () => {
            const v = el.classList.contains("pos-cell") ? cleanPos(cellText(el)) : cellText(el);
            if (el.textContent !== v) el.textContent = v;
            readBlockToItem(i);
          });
          el.addEventListener("keydown", e => {
            if (e.key === "Enter" || e.key === "Escape") { e.preventDefault(); el.blur(); }
          });
          el.addEventListener("paste", e => {
            const raw = (e.clipboardData || window.clipboardData).getData("text") || "";
            e.preventDefault();
            if (!raw) return;
            const multi = /[\n\t]/.test(raw.replace(/[\r\n]+$/, "")) || (el.classList.contains("anc-cell") && /\s+https?:\/\/\S+\s*$/i.test(raw.trim()));
            if (multi) { pasteGrid(el, raw); return; }
            document.execCommand("insertText", false, raw.replace(/[\r\n]+/g, " ").trim());
            readBlockToItem(i);
          });
          el.addEventListener("drop", e => { if (![...(e.dataTransfer.types || [])].includes("text/mv-hist")) e.preventDefault(); });
        });
        block.querySelectorAll("th.col-selectable").forEach(th => {
          th.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); setActive(i); copyColumn(i, th.getAttribute("data-col-sel")); });
        });
        const btnTexto = block.querySelector('[data-act="texto"]');
        const btnListo = block.querySelector('[data-act="listo"]');
        if (btnTexto) btnTexto.addEventListener("click", e => { e.stopPropagation(); setActive(i); openTexto(); });
        if (btnListo) btnListo.addEventListener("click", e => { e.stopPropagation(); setActive(i); markListo(); });
      });
      syncTextoHead();
    }

    blocksEl.addEventListener("change", e => {
      const vbEl = e.target.closest && e.target.closest("[data-vb]");
      if (!vbEl) return;
      e.stopPropagation();
      const i = Number(vbEl.closest(".block").dataset.i), itv = ITEMS[i];
      if (!itv) return;
      if (!movaEsEditor()) { alert("Solo el rol editor puede dar el VB."); vbEl.value = estadoDe(itv) === "sinvb" ? "pendiente" : "ok"; return; }
      itv.vbEditor = vbEl.value === "ok" ? "ok" : "pendiente";
      if (itv.vbEditor !== "ok") itv.textoVb = false;
      movaPost(N8N.vb, { mes: itv.mes, semana: itv.semana, keyword: itv.keyword, url: itv.url, vbEditor: itv.vbEditor });
      vbEl.closest(".est-cell").innerHTML = estadoCellHtml(itv);
      if (idx === i) syncTextoHead();
    });

    /* ---- Panel del editor ---- */
    function renderTextoRefs() {
      const box = document.getElementById("tRefsList");
      if (!box) return;
      if (idx == null || !ITEMS[idx]) { box.innerHTML = ""; return; }
      const it = ITEMS[idx];
      const kw = (it.keyword || "").trim() || "—", url = (it.url || "").trim() || "—";
      box.innerHTML = `
        <div class="ref-main">
          <div class="ref-col"><div class="ref-col-top"><span class="ref-lab">Keyword</span><button type="button" class="btn-mini" data-copy-btn="kw">Copiar</button></div><span class="ref-val">${esc(kw)}</span></div>
          <div class="ref-col"><div class="ref-col-top"><span class="ref-lab">URL</span><button type="button" class="btn-mini" data-copy-btn="url">Copiar</button></div><span class="ref-val" title="${esc(url)}">${esc(url)}</span></div>
        </div>`;
      box.querySelectorAll("[data-copy-btn]").forEach(btn => btn.addEventListener("click", () => {
        const k = btn.getAttribute("data-copy-btn");
        copyText(k === "kw" ? kw : url, k === "kw" ? "Keyword copiada" : "URL copiada");
      }));
      renderInterlink();
    }
    function renderInterlink() {
      const box = document.getElementById("tInterlink");
      if (!box) return;
      const it = idx != null && ITEMS[idx];
      const list = it ? ensureAnchors(it).map((x, n) => ({ n: n + 1, a: (x.a || "").trim(), u: (x.u || "").trim() })).filter(x => x.a || x.u) : [];
      if (!list.length) { box.innerHTML = `<div class="empty" style="padding:.7rem">Esta keyword aún no tiene interlinking. Agrégalo en la tabla de Contenidos.</div>`; return; }
      box.innerHTML = `<table class="il-table"><colgroup><col class="cn" /><col class="ca" /><col /><col class="cc" /></colgroup>
        <thead><tr><th>#</th><th>Anchor</th><th>URL</th><th></th></tr></thead><tbody>${list.map((x, k) => `<tr><td class="n">${x.n}</td><td class="a">${esc(x.a || "—")}</td><td class="u">${esc(x.u || "—")}</td><td class="c">${x.u ? `<button type="button" class="btn-mini" data-il="${k}">Copiar URL</button>` : ""}</td></tr>`).join("")}</tbody></table>`;
      box.querySelectorAll("[data-il]").forEach(b => b.addEventListener("click", () => copyText(list[Number(b.dataset.il)].u, "URL copiada")));
    }
    function copyAllRefs() {
      const it = idx != null && ITEMS[idx];
      const urls = it ? ensureAnchors(it).map(x => (x.u || "").trim()).filter(Boolean) : [];
      if (!urls.length) { alert("No hay URL de interlinking para copiar."); return; }
      copyText(urls.join("\n"), urls.length + " URL copiadas");
    }
    function syncTextoHead() {
      if (idx == null || !ITEMS[idx]) return;
      const it = ITEMS[idx];
      document.getElementById("tTitle").textContent = it.keyword || "Contenido";
      const e = estadoDe(it);
      document.getElementById("tMetaRow").innerHTML = `
        <span class="meta-chip">Semana ${esc(it.semana || 1)}</span>
        <span class="meta-chip">${esc(it.mes || "")}</span>
        <span class="meta-chip">${esc(it.tipo || "")}</span>
        <span class="meta-chip">${e === "html" ? "HTML OK" : e === "vb" ? "Texto con VB" : "Sin VB"}</span>`;
      document.getElementById("tUrl").textContent = it.url || "—";
      if (document.getElementById("bdTexto").classList.contains("open")) renderTextoRefs();
      const root = blockRoot(idx);
      const f = root && root.querySelector("[data-texto-flag]");
      if (f) f.textContent = (it.texto || "").trim() ? "Texto cargado" : "Sin texto";
    }

    /* ---- Normalizador de texto: h1-h4, p, ul/ol/li, strong, em, a ---- */
    function escText(s) { return String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
    function escAttr(s) { return String(s ?? "").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;"); }
    function mdInline(t) {
      return escText(t)
        .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (m, a, u) => `<a href="${escAttr(u)}">${a}</a>`)
        .replace(/\*\*([^*]+?)\*\*/g, "<strong>$1</strong>")
        .replace(/__([^_]+?)__/g, "<strong>$1</strong>")
        .replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\*)/g, "$1<em>$2</em>");
    }
    const BLOCK_RE = /^(P|DIV|H[1-6]|UL|OL|LI|SECTION|ARTICLE|BLOCKQUOTE|TABLE|THEAD|TBODY|TR|TD|TH|HEADER|FOOTER|MAIN|PRE|FIGURE|DL|DT|DD|HR)$/;
    const BLOCK_SEL = "p,div,h1,h2,h3,h4,h5,h6,ul,ol,li,section,article,blockquote,table,tr,td,pre";
    function inlineHtml(node) {
      let out = "";
      node.childNodes.forEach(n => {
        if (n.nodeType === 3) { out += /\*\*|__|\]\(/.test(n.textContent) ? mdInline(n.textContent) : escText(n.textContent); return; }
        if (n.nodeType !== 1) return;
        const t = n.tagName;
        if (t === "BR") { out += "<br>"; return; }
        if (t === "SCRIPT" || t === "STYLE" || t === "META" || t === "LINK") return;
        if (t === "UL" || t === "OL") return;
        const st = (n.getAttribute("style") || "").toLowerCase().replace(/\s+/g, "");
        let inner = inlineHtml(n);
        if (!inner.replace(/<br>/g, "").trim()) { out += inner.trim() ? inner : (/\s/.test(n.textContent) ? " " : ""); return; }
        if (t === "A" && n.getAttribute("href") && !/^javascript:/i.test(n.getAttribute("href"))) inner = `<a href="${escAttr(n.getAttribute("href"))}">${inner}</a>`;
        const bTag = t === "STRONG" || (t === "B" && !/font-weight:(normal|[1-4]00)/.test(st));
        const bSty = /font-weight:(bold|bolder|[6-9]00)/.test(st);
        if (bTag || (bSty && t !== "B")) inner = `<strong>${inner}</strong>`;
        if (t === "EM" || t === "I" || /font-style:italic/.test(st)) inner = `<em>${inner}</em>`;
        out += inner;
      });
      return out;
    }
    function cleanInline(h) {
      const d = document.createElement("div"); d.innerHTML = h;
      d.querySelectorAll("strong strong, em em").forEach(x => x.replaceWith(...x.childNodes));
      let r = d.innerHTML.replace(/<\/strong>(\s*)<strong>/g, "$1").replace(/<\/em>(\s*)<em>/g, "$1").replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ");
      r = r.replace(/^(\s|<br>)+|(\s|<br>)+$/g, "");
      return r;
    }
    function htmlToBlocks(root) {
      const out = [];
      let pend = document.createElement("div");
      const flush = () => { const h = cleanInline(inlineHtml(pend)); if (h) out.push("<p>" + h + "</p>"); pend = document.createElement("div"); };
      const pushB = (tag, el) => { const h = cleanInline(inlineHtml(el)); if (h) out.push(`<${tag}>${h}</${tag}>`); };
      const list = (el) => {
        const tag = el.tagName === "OL" ? "ol" : "ul";
        const items = [];
        [...el.children].forEach(li => {
          if (li.tagName !== "LI") { const h = cleanInline(inlineHtml(li)); if (h) items.push("<li>" + h + "</li>"); return; }
          const h = cleanInline(inlineHtml(li)); if (h) items.push("<li>" + h + "</li>");
          li.querySelectorAll(":scope > ul > li, :scope > ol > li").forEach(sub => { const hs = cleanInline(inlineHtml(sub)); if (hs) items.push("<li>" + hs + "</li>"); });
        });
        if (items.length) out.push(`<${tag}>\n` + items.join("\n") + `\n</${tag}>`);
      };
      const visit = (node) => {
        [...node.childNodes].forEach(n => {
          if (n.nodeType === 3) { pend.appendChild(n.cloneNode()); return; }
          if (n.nodeType !== 1) return;
          const t = n.tagName;
          const isBlock = BLOCK_RE.test(t) || (n.querySelector && n.querySelector(BLOCK_SEL));
          if (!isBlock) { pend.appendChild(n.cloneNode(true)); return; }
          flush();
          if (t === "H1") return pushB("h1", n);
          if (t === "H2") return pushB("h2", n);
          if (t === "H3") return pushB("h3", n);
          if (t === "H4" || t === "H5" || t === "H6") return pushB("h4", n);
          if (t === "UL" || t === "OL") return list(n);
          if (t === "LI") { out.push("<ul>\n<li>" + cleanInline(inlineHtml(n)) + "</li>\n</ul>"); return; }
          if (t === "HR") return;
          if (t === "P" && !n.querySelector(BLOCK_SEL)) { const h = cleanInline(inlineHtml(n)); if (h) out.push("<p>" + h + "</p>"); return; }
          if (!n.querySelector(BLOCK_SEL)) { const h = cleanInline(inlineHtml(n)); if (h) out.push("<p>" + h + "</p>"); return; }
          visit(n); flush();
        });
      };
      visit(root); flush();
      // une listas contiguas del mismo tipo
      return out.join("\n").replace(/\n<\/ul>\n<ul>\n/g, "\n").replace(/\n<\/ol>\n<ol>\n/g, "\n");
    }
    function mdToHtml(text) {
      const lines = String(text || "").replace(/\r\n?/g, "\n").split("\n");
      const out = []; let lst = null;
      const endList = () => { if (lst) { out.push(`<${lst.t}>\n` + lst.items.join("\n") + `\n</${lst.t}>`); lst = null; } };
      lines.forEach(l => {
        const t = l.trim();
        if (!t) { endList(); return; }
        let m = t.match(/^(#{1,6})\s+(.*)$/);
        if (m) { endList(); const lv = Math.min(4, m[1].length); out.push(`<h${lv}>${mdInline(m[2].replace(/\s*#+\s*$/, ""))}</h${lv}>`); return; }
        m = t.match(/^([-*•·–])\s+(.*)$/) || t.match(/^(\d+[.)])\s+(.*)$/);
        if (m) { const tt = /\d/.test(m[1]) ? "ol" : "ul"; if (!lst || lst.t !== tt) { endList(); lst = { t: tt, items: [] }; } lst.items.push("<li>" + mdInline(m[2]) + "</li>"); return; }
        endList();
        out.push("<p>" + mdInline(t) + "</p>");
      });
      endList();
      return out.join("\n");
    }
    function looksLikeHtml(s) { return /<\s*(h[1-6]|p|div|ul|ol|li|strong|b|em|a|span|br|table)\b/i.test(String(s || "")); }
    function normalizeTextoHtml(input) {
      const raw = String(input || "").trim();
      if (!raw) return "";
      if (!looksLikeHtml(raw)) return mdToHtml(raw);
      const holder = document.createElement("div");
      holder.innerHTML = raw.replace(/<!--[\s\S]*?-->/g, "");
      return htmlToBlocks(holder);
    }
    function decorateLinks(ed) {
      ed.querySelectorAll("a[href]").forEach(a => { a.title = a.getAttribute("href"); });
    }
    function setTextoEditorHtml(html) {
      const ed = document.getElementById("textoBody");
      ed.innerHTML = normalizeTextoHtml(html) || "";
      decorateLinks(ed);
    }
    function getTextoEditorHtml() { return normalizeTextoHtml(document.getElementById("textoBody").innerHTML); }
    function copyTextoConEtiquetas() {
      const html = getTextoEditorHtml(); // solo el cuerpo (H1/H2 hacia abajo); las metas van aparte
      if (!html) { alert("No hay texto para copiar."); return; }
      copyText(html, "Texto copiado con etiquetas (sin metas)");
    }

    /* ---- Barra de formato + enlaces (contenteditable nativo) ---- */
    const textoBodyEl = document.getElementById("textoBody");
    const linkBub = document.getElementById("linkBub");
    let savedRange = null, bubLink = null;
    try { document.execCommand("defaultParagraphSeparator", false, "p"); } catch (e) {}
    function selInEditor() {
      const s = window.getSelection();
      return s && s.rangeCount && textoBodyEl.contains(s.getRangeAt(0).commonAncestorContainer) ? s.getRangeAt(0) : null;
    }
    function restoreSel() {
      textoBodyEl.focus();
      if (savedRange) { const s = window.getSelection(); s.removeAllRanges(); s.addRange(savedRange); }
    }
    function closestIn(node, sel) {
      const el = node && (node.nodeType === 1 ? node : node.parentElement);
      const x = el && el.closest(sel);
      return x && textoBodyEl.contains(x) ? x : null;
    }
    function toolbarState() {
      const r = selInEditor();
      const tb = document.getElementById("edToolbar");
      if (!tb) return;
      const blk = r ? closestIn(r.startContainer, "h1,h2,h3,h4,p,li") : null;
      const tag = blk ? blk.tagName.toLowerCase() : "";
      tb.querySelectorAll("[data-cmd]").forEach(b => {
        const c = b.dataset.cmd;
        let on = false;
        if (r) {
          if (c === "bold") { try { on = document.queryCommandState("bold"); } catch (e) {} }
          else if (c === "ul") on = !!closestIn(r.startContainer, "ul");
          else if (c === "link") on = !!closestIn(r.startContainer, "a");
          else if (/^h[2-4]$|^p$/.test(c)) on = tag === c;
        }
        b.classList.toggle("on", on);
      });
    }
    function placeBub(rect) {
      linkBub.classList.add("open");
      const w = linkBub.offsetWidth, h = linkBub.offsetHeight;
      let x = Math.max(8, Math.min(window.innerWidth - w - 8, rect.left));
      let y = rect.bottom + 6; if (y + h > window.innerHeight - 8) y = Math.max(8, rect.top - h - 6);
      linkBub.style.left = x + "px"; linkBub.style.top = y + "px";
    }
    function closeBub() { linkBub.classList.remove("open"); linkBub.innerHTML = ""; bubLink = null; }
    function normUrl(u) { u = String(u || "").trim(); if (!u) return ""; if (!/^(https?:|mailto:|\/|#)/i.test(u)) u = "https://" + u; return u; }
    function openLinkEdit(a, rect) {
      bubLink = a || null;
      const cur = a ? a.getAttribute("href") : "";
      linkBub.innerHTML = `<input type="url" id="bubUrl" placeholder="https://www.paris.cl/…" value="${escAttr(cur)}" /><button type="button" class="pri" id="bubOk">${a ? "Guardar" : "Aplicar"}</button>${a ? '<button type="button" class="del" id="bubDel">Quitar enlace</button>' : ""}<button type="button" id="bubX">Cancelar</button>`;
      placeBub(rect);
      const inp = document.getElementById("bubUrl");
      inp.focus(); inp.select();
      const ok = () => {
        const u = normUrl(inp.value);
        if (!u) { if (bubLink) unwrapLink(bubLink); closeBub(); return; }
        if (bubLink) { bubLink.setAttribute("href", u); bubLink.title = u; }
        else {
          restoreSel();
          const r = selInEditor();
          if (r && r.collapsed) document.execCommand("insertHTML", false, `<a href="${escAttr(u)}">${escText(u)}</a>`);
          else document.execCommand("createLink", false, u);
          decorateLinks(textoBodyEl);
        }
        closeBub(); toolbarState();
      };
      document.getElementById("bubOk").addEventListener("click", ok);
      inp.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); ok(); } if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); closeBub(); restoreSel(); } });
      const del = document.getElementById("bubDel"); if (del) del.addEventListener("click", () => { unwrapLink(bubLink); closeBub(); });
      document.getElementById("bubX").addEventListener("click", () => { closeBub(); restoreSel(); });
    }
    function showLinkInfo(a) {
      bubLink = a;
      const u = a.getAttribute("href") || "";
      linkBub.innerHTML = `<a href="${escAttr(u)}" target="_blank" rel="noopener" title="Abrir en otra pestaña">${escText(u)} ↗</a><button type="button" id="bubEdit">Editar</button><button type="button" class="del" id="bubDel">Quitar</button><button type="button" id="bubCopy">Copiar URL</button>`;
      placeBub(a.getBoundingClientRect());
      document.getElementById("bubEdit").addEventListener("click", () => openLinkEdit(a, a.getBoundingClientRect()));
      document.getElementById("bubDel").addEventListener("click", () => { unwrapLink(a); closeBub(); });
      document.getElementById("bubCopy").addEventListener("click", () => { copyText(u, "URL copiada"); closeBub(); });
    }
    function unwrapLink(a) { if (a && a.parentNode) { a.replaceWith(...a.childNodes); toolbarState(); } }
    function edCmd(c) {
      const r = selInEditor();
      if (!r && c !== "link") { textoBodyEl.focus(); }
      if (c === "bold") document.execCommand("bold");
      else if (c === "ul") document.execCommand("insertUnorderedList");
      else if (/^h[2-4]$|^p$/.test(c)) document.execCommand("formatBlock", false, "<" + c + ">");
      else if (c === "unlink") {
        const rr = selInEditor();
        const a = rr && closestIn(rr.startContainer, "a");
        if (a && rr.collapsed) unwrapLink(a); else document.execCommand("unlink");
      } else if (c === "link") {
        const rr = selInEditor();
        if (!rr) { textoBodyEl.focus(); return; }
        savedRange = rr.cloneRange();
        const a = closestIn(rr.startContainer, "a");
        const rect = rr.getBoundingClientRect();
        openLinkEdit(a, rect.width || rect.height ? rect : textoBodyEl.getBoundingClientRect());
        return;
      }
      decorateLinks(textoBodyEl);
      toolbarState();
    }
    document.getElementById("edToolbar").addEventListener("mousedown", e => { if (e.target.closest("[data-cmd]")) e.preventDefault(); });
    document.getElementById("edToolbar").addEventListener("click", e => { const b = e.target.closest("[data-cmd]"); if (b) edCmd(b.dataset.cmd); });
    document.addEventListener("selectionchange", () => { if (document.getElementById("bdTexto").classList.contains("open")) toolbarState(); });
    textoBodyEl.addEventListener("keydown", e => {
      const k = (e.key || "").toLowerCase();
      if ((e.ctrlKey || e.metaKey) && k === "k") { e.preventDefault(); edCmd("link"); }
      if ((e.ctrlKey || e.metaKey) && k === "b") { e.preventDefault(); edCmd("bold"); }
    });
    textoBodyEl.addEventListener("click", e => {
      const a = e.target.closest && e.target.closest("a");
      if (a && textoBodyEl.contains(a)) { e.preventDefault(); showLinkInfo(a); }
      else if (!linkBub.contains(e.target)) closeBub();
    });
    document.addEventListener("mousedown", e => { if (linkBub.classList.contains("open") && !linkBub.contains(e.target) && !e.target.closest("#edToolbar") && !(e.target.closest && e.target.closest("#textoBody a"))) closeBub(); });
    document.querySelector("#bdTexto .popup").addEventListener("scroll", closeBub);
    textoBodyEl.addEventListener("paste", e => {
      e.preventDefault();
      const cd = e.clipboardData || window.clipboardData;
      const html = cd && cd.getData("text/html");
      const plain = cd && cd.getData("text/plain");
      const norm = (html && looksLikeHtml(html)) ? normalizeTextoHtml(html) : mdToHtml(plain || "");
      if (!norm) return;
      if (!String(textoBodyEl.innerHTML || "").replace(/<br\s*\/?>/gi, "").trim()) textoBodyEl.innerHTML = norm;
      else document.execCommand("insertHTML", false, norm);
      decorateLinks(textoBodyEl);
      toolbarState();
    });
    function selectionHtml() {
      const r = selInEditor(); if (!r || r.collapsed) return "";
      const d = document.createElement("div");
      const blk = closestIn(r.commonAncestorContainer, "h1,h2,h3,h4,p,li,ul,ol");
      if (blk && blk !== textoBodyEl) { const w = document.createElement(blk.tagName === "LI" ? "ul" : blk.tagName); if (blk.tagName === "LI") { const li = document.createElement("li"); li.appendChild(r.cloneContents()); w.appendChild(li); } else w.appendChild(r.cloneContents()); d.appendChild(w); }
      else d.appendChild(r.cloneContents());
      return normalizeTextoHtml(d.innerHTML);
    }
    textoBodyEl.addEventListener("copy", e => {
      const html = selectionHtml(); if (!html) return;
      e.preventDefault();
      e.clipboardData.setData("text/plain", html);
      e.clipboardData.setData("text/html", html);
    });
    textoBodyEl.addEventListener("cut", e => {
      const html = selectionHtml(); if (!html) return;
      e.preventDefault();
      e.clipboardData.setData("text/plain", html);
      e.clipboardData.setData("text/html", html);
      document.execCommand("delete");
    });

    /* ---- Metas ---- */
    const META_LIM = { tMetaTitulo: 60, tMetaDesc: 155 };
    function metaCount() {
      [["tMetaTitulo","cntMetaTitulo"],["tMetaDesc","cntMetaDesc"]].forEach(([f, c]) => {
        const v = document.getElementById(f).value, el = document.getElementById(c);
        el.textContent = v.length + "/" + META_LIM[f]; el.classList.toggle("over", v.length > META_LIM[f]);
      });
    }
    ["tMetaTitulo","tMetaDesc"].forEach(id => document.getElementById(id).addEventListener("input", metaCount));
    document.querySelectorAll("[data-copy-meta]").forEach(b => b.addEventListener("click", () => {
      const v = document.getElementById(b.dataset.copyMeta).value.trim();
      if (!v) { mvToast("Campo vacío"); return; }
      copyText(v, (b.dataset.copyMeta === "tMetaTitulo" ? "Meta título" : "Meta descripción") + " copiada");
    }));

    /* ---- Histórico → interlinking (clic explícito; el buscador no escribe) ---- */
    function addHistToItem(h, i) {
      if (!h) return;
      if (i == null || !ITEMS[i]) { mvToast("Selecciona primero una keyword en la tabla"); return; }
      const it = ITEMS[i];
      readBlockToItem(i);
      ensureAnchors(it);
      const nu = String(h.url || "").trim().toLowerCase(), na = String(h.keyword || "").trim().toLowerCase();
      if (it.anchors.some(s => (nu && String(s.u || "").trim().toLowerCase() === nu) || (!nu && String(s.a || "").trim().toLowerCase() === na))) { mvToast("Ya está en interlinking"); return; }
      const e = it.anchors.findIndex(s => !String(s.a || "").trim() && !String(s.u || "").trim());
      if (e < 0) { mvToast("Las 10 filas de interlinking ya están llenas"); return; }
      it.anchors[e].a = h.keyword || ""; it.anchors[e].u = h.url || "";
      saveEdit(it);
      refreshBlockCells(i);
      mvToast("Agregado a interlinking de «" + (it.keyword || "") + "» (fila " + (e + 1) + ")");
    }
    document.addEventListener("dragover", e => { if (e.target.closest && e.target.closest(".block") && [...(e.dataTransfer.types||[])].includes("text/mv-hist")) e.preventDefault(); });
    document.addEventListener("drop", e => { const b = e.target.closest && e.target.closest(".block"); const hi = e.dataTransfer.getData("text/mv-hist"); if (!b || hi === "") return; e.preventDefault(); e.stopPropagation(); addHistToItem(HIST[Number(hi)], Number(b.dataset.i)); }, true);

    function renderHist() {
      const q = document.getElementById("hq").value.trim().toLowerCase();
      const t = document.getElementById("htipo").value;
      const box = document.getElementById("hist");
      if (!q) {
        box.innerHTML = `<div class="empty">Escribe una keyword o URL<br/><span style="font-size:.65rem;opacity:.8">Fuente: URLs trabajadas (más actual → más antigua)</span></div>`;
        return;
      }
      const rows = HIST.map((h, k) => ({ h, k })).filter(({ h }) => {
        if (t && normalizeTipo(h.tipo) !== normalizeTipo(t)) return false;
        return (h.keyword || "").toLowerCase().includes(q) || (h.url || "").toLowerCase().includes(q) || String(h.anio).includes(q);
      }).slice(0, 120);
      if (!rows.length) { box.innerHTML = '<div class="empty">Sin resultados</div>'; return; }
      box.innerHTML = rows.map(({ h, k }) => `
        <button type="button" class="hist-item" data-hi="${k}" title="Clic para agregar a interlinking de la keyword activa" draggable="true">
          <div class="kw">${esc(h.keyword)}</div>
          <div class="meta">${esc(h.url)}</div>
          <span class="badge">${esc(h.tipo || "—")} · ${esc(h.anio)}</span>
        </button>`).join("");
      box.querySelectorAll(".hist-item").forEach(b => {
        b.addEventListener("click", () => addHistToItem(HIST[Number(b.dataset.hi)], idx));
        b.addEventListener("dragstart", e => { const h = HIST[Number(b.dataset.hi)]; e.dataTransfer.setData("text/mv-hist", b.dataset.hi); e.dataTransfer.setData("text/plain", (h.keyword||"") + "\t" + (h.url||"")); });
      });
    }

    function openTexto() {
      if (idx == null || !ITEMS[idx]) return;
      readSheetToItem();
      const it = ITEMS[idx];
      document.getElementById("bdTexto").classList.add("open");
      syncTextoHead();
      renderTextoRefs();
      setTextoEditorHtml(it.texto || "");
      document.getElementById("tMetaTitulo").value = it.metaTitulo || "";
      document.getElementById("tMetaDesc").value = it.metaDescripcion || "";
      metaCount();
      textoBodyEl.focus();
      toolbarState();
    }
    function closeTexto() { closeBub(); document.getElementById("bdTexto").classList.remove("open"); }
    document.getElementById("btnCerrarTexto").addEventListener("click", closeTexto);
    document.getElementById("bdTexto").addEventListener("click", e => { if (e.target.id === "bdTexto") closeTexto(); });
    document.getElementById("btnCopiarEtiquetas").addEventListener("click", copyTextoConEtiquetas);
    document.getElementById("btnCopiarRefs").addEventListener("click", copyAllRefs);

    (function initTextoTheme() {
      const ed = document.getElementById("textoBody");
      const btn = document.getElementById("btnTemaTexto");
      const key = "mova-paris-texto-theme";
      const apply = (mode) => {
        const light = mode === "light";
        ed.classList.toggle("theme-light", light);
        btn.textContent = light ? "☀️" : "🌙";
        btn.title = light ? "Fondo claro (clic para oscuro)" : "Fondo oscuro (clic para claro)";
        try { localStorage.setItem(key, light ? "light" : "dark"); } catch (e) {}
      };
      let mode = "dark";
      try { mode = localStorage.getItem(key) || "dark"; } catch (e) {}
      apply(mode === "light" ? "light" : "dark");
      btn.addEventListener("mousedown", e => e.preventDefault());
      btn.addEventListener("click", () => apply(ed.classList.contains("theme-light") ? "dark" : "light"));
    })();

    function guardarTexto(status) {
      const it = ITEMS[idx];
      return movaPost(N8N.guardar, { mes: it.mes, semana: it.semana, ord: it.ord, keyword: it.keyword, tipo: it.tipo, url: it.url,
        texto: it.texto || "", metaTitulo: it.metaTitulo || "", metaDescripcion: it.metaDescripcion || "",
        anchors: ensureAnchors(it), status: status })
        .then(r => { if (r && r.ok === false) { const st = document.getElementById("status"); st.className = "status show warn"; st.textContent = "No se pudo guardar en n8n (" + (r.motivo || "sin respuesta") + "). El texto quedó guardado en este navegador."; } });
    }
    document.getElementById("btnGuardarTexto").addEventListener("click", () => {
      if (idx == null || !ITEMS[idx]) return;
      const body = getTextoEditorHtml();
      const it = ITEMS[idx];
      it.texto = body;
      it.metaTitulo = document.getElementById("tMetaTitulo").value.trim();
      it.metaDescripcion = document.getElementById("tMetaDesc").value.trim();
      if (!body && !it.metaTitulo && !it.metaDescripcion) { alert("Pega o escribe el texto."); return; }
      saveEdit(it);
      guardarTexto(it.listo ? "listo" : "en redaccion");
      closeTexto();
      syncTextoHead();
      mvToast("Contenido guardado");
    });

    function markListo() {
      if (idx == null) return;
      readSheetToItem();
      const it = ITEMS[idx];
      if (!it.keyword || !it.url) { alert("Completa Keyword y URL."); return; }
      if (!(it.texto || "").trim()) { alert("Falta el texto. Ábrelo con el botón Texto."); return; }
      it.listo = true;
      saveEdit(it);
      guardarTexto("listo");
      const root = blockRoot(idx);
      if (root) {
        const b = root.querySelector('[data-act="listo"]'); if (b) b.textContent = "Enviado";
        const ec = root.querySelector(".est-cell"); if (ec) ec.innerHTML = estadoCellHtml(it);
      }
      mvToast("Listo: «" + it.keyword + "» quedó enviado para VB");
    }

    /* ---- Iniciativas (Matriz MOVA vía n8n; solo cliente Paris) ---- */
    let INIC = Array.isArray(DATA.iniciativas) ? DATA.iniciativas : [];
    let inicLoaded = false;
    function esParis(x) { return /paris/i.test(String(x.cliente || "")); }
    function renderIniciativas(nota) {
      const box = document.getElementById("iniBox");
      if (!box) return;
      const rows = INIC.filter(esParis);
      if (!rows.length) { box.innerHTML = `<div class="empty">${nota || "No hay iniciativas de Paris registradas en la Matriz."}</div>`; return; }
      box.innerHTML = `<table class="ini-table"><thead><tr><th>Iniciativa</th><th>Cliente</th><th>Estado</th><th>Fecha</th><th>Link MOVA</th></tr></thead><tbody>${rows.map(x => `
        <tr><td class="nm">${esc(x.nombre || "—")}${x.etapa ? `<div style="font-weight:500;font-size:.72rem;color:var(--muted)">Etapa: ${esc(x.etapa)}</div>` : ""}</td>
        <td><span class="cli">${esc(x.cliente)}</span></td>
        <td>${esc(x.estado || "—")}</td>
        <td>${esc(x.fecha || "—")}${x.plazo ? `<div style="font-size:.72rem;color:var(--muted)">Plazo: ${esc(x.plazo)}</div>` : ""}</td>
        <td>${/^https?:\/\//i.test(x.link || "") ? `<a class="go" href="${esc(x.link)}" target="_blank" rel="noopener" title="${esc(x.link)}">Abrir en MOVA ↗</a>` : `<span class="nolink">Sin link en la Matriz</span>`}</td></tr>`).join("")}</tbody></table>`;
    }
    function loadIniciativas() {
      renderIniciativas();
      if (inicLoaded || !window.MOVA_TOKEN) return;
      inicLoaded = true;
      movaPost(N8N.inic, {}).then(r => {
        r = Array.isArray(r) ? r[0] : r;
        if (r && r.ok && Array.isArray(r.iniciativas)) { INIC = r.iniciativas; renderIniciativas(); }
        else { inicLoaded = false; renderIniciativas("No se pudieron cargar las iniciativas desde n8n."); }
      });
    }
    window.MOVA_LOAD_INIC = loadIniciativas;

    document.getElementById("hq").addEventListener("input", renderHist);
    document.getElementById("htipo").addEventListener("change", renderHist);
    document.getElementById("q").addEventListener("input", () => renderBlocks());
    document.getElementById("fStatus").addEventListener("change", () => renderBlocks());
    mesSel.addEventListener("change", () => renderBlocks());
    document.getElementById("semana").addEventListener("change", () => renderBlocks());

    document.addEventListener("keydown", e => {
      if (e.key === "Escape") {
        if (linkBub.classList.contains("open")) { closeBub(); return; }
        if (document.getElementById("bdTexto").classList.contains("open")) closeTexto();
      }
    });

