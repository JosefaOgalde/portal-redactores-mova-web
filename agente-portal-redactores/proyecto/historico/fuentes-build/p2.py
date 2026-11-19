s=open('s1.html',encoding='utf-8').read()
def R(old,new,cnt=1):
    global s
    c=s.count(old); assert c==cnt,(c,old[:90]); s=s.replace(old,new)
def CUT(start,end,new,keep_end=False):
    global s
    a=s.index(start); b=s.index(end,a)
    s=s[:a]+new+(s[b:] if keep_end else s[b+len(end):])
R('<div class="mv-t">Portal <span>Redactor</span></div>','<div class="mv-t">MOVA <span>Redactor</span></div>')
# Demo data: iniciativas
R(',"defaultMes":"Octubre 26","fuente":{"nota":',',"iniciativas":[{"nombre":"Portal Redactores","cliente":"Paris","estado":"En desarrollo","etapa":"Diseño","fecha":"29-10-2026","plazo":"30-10-2026","link":"https://acme-chile.cl/mova/seo/redactor.html"},{"nombre":"Ejemplo otra marca","cliente":"Maicao","estado":"Idea","fecha":"","link":""}],"defaultMes":"Octubre 26","fuente":{"nota":')
# Sin IDs de planillas en el HTML
CUT('    const SHEETS = {','    };\n','')
R('''      revListo: "https://grupomakingof.app.n8n.cloud/webhook/mova-revision-listo"''','''      revListo: "https://grupomakingof.app.n8n.cloud/webhook/mova-revision-listo",
      inic: "https://grupomakingof.app.n8n.cloud/webhook/mova-iniciativas"''')
# mapContenido + sync
CUT('    function mapContenido(c) {','    window.MOVA_PARIS_SYNC = movaSyncFromN8n;','''    function mapContenido(c) {
      const it = Object.assign({}, c);
      const m = String(it.semana == null ? "" : it.semana).match(/\\d+/);
      it.semana = m ? Math.min(5, Math.max(1, Number(m[0]))) : 1;
      if (it.vbEditor !== "ok") it.vbEditor = "pendiente";
      it.textoVb = !!it.textoVb; it.htmlOk = !!it.htmlOk;
      if (!Array.isArray(it.anchors)) it.anchors = [];
      it.anchors = it.anchors.slice(0, 10).map(x => ({ a: x.a || "", u: x.u || "", p: x.p || "" }));
      while (it.anchors.length < 10) it.anchors.push({a:"",u:"",p:""});
      return it;
    }
    function mapRevision(rows) {
      return rows.map((r, i) => ({ id: String(r.id || ("r" + i)), anio: r.anio || "", tipo: r.tipo || "", keyword: r.keyword || "", url: r.url || "", voto: "", comentario: "" }));
    }
    async function movaSyncFromN8n() {
      const tok = window.MOVA_TOKEN || "";
      if (!tok) return { ok:false, motivo:"sin-token" };
      const headers = { "Content-Type": "text/plain" };
      const body = JSON.stringify({ token: tok, empresa: "REDACTORES", cliente: "paris" });
      try {
        const [rh, rc] = await Promise.all([
          fetch(N8N.hist, { method:"POST", cache:"no-store", headers, body }).then(r => r.json()).catch(() => null),
          fetch(N8N.cont, { method:"POST", cache:"no-store", headers, body }).then(r => r.json()).catch(() => null)
        ]);
        const h = Array.isArray(rh) ? rh[0] : rh;
        const c = Array.isArray(rc) ? rc[0] : rc;
        if (h && h.ok && Array.isArray(h.historico) && h.historico.length) {
          HIST = sortHistorico(h.historico);
          try { renderHist(); } catch (e) {}
        }
        if (c && c.ok && Array.isArray(c.revision) && c.revision.length) {
          REV = mapRevision(c.revision);
          applySavedRev();
          try { renderRev(); } catch (e) {}
          const src = document.getElementById("revSrc");
          if (src) src.textContent = "Últimas " + REV.length + " filas ocupadas de la planilla fuente (columnas D keyword y E URL)" + (c.revisionHoja ? " · hoja «" + c.revisionHoja + "»" : "") + ".";
        }
        if (c && c.ok && Array.isArray(c.contenidos) && c.contenidos.length) {
          ITEMS = dedupeItems(sortContenidos(c.contenidos.map(mapContenido)));
          applyEdits();
          try {
            const mesSel = document.getElementById("mes");
            if (mesSel) {
              const cur = mesSel.value;
              const mesSet = [...new Set(ITEMS.map(i => i.mes).filter(Boolean))];
              mesSel.innerHTML = mesSet.map(mm => `<option value="${esc(mm)}">${esc(mm)}</option>`).join("");
              if (cur && mesSet.includes(cur)) mesSel.value = cur;
              else if (c.defaultMes && mesSet.includes(c.defaultMes)) mesSel.value = c.defaultMes;
              else if (mesSet[0]) mesSel.value = mesSet[0];
            }
            idx = null;
            renderBlocks();
          } catch (e) {}
        }
        return { ok:true, hist: (h && h.total) || 0, cont: (c && c.total) || ((c && c.contenidos)||[]).length, rev: REV.length };
      } catch (e) {
        return { ok:false, motivo: String(e && e.message || e) };
      }
    }
    window.MOVA_PARIS_SYNC = movaSyncFromN8n;''')
# sortContenidos: mes rank dinámico
R('''      const mesRank = {"Octubre 26":1,"Septiembre 26":2,"Agosto 26":3,"Julio 26":4,"Junio 26":5,"Mayo 26":6,"Abril 26":7,"Marzo 26":8,"Febrero 26":9,"Enero 26":10};
      return [...(rows || [])].map((r, i) => ({...r, _i: i})).sort((a, b) => {
        const ma = mesRank[a.mes] || 99, mb = mesRank[b.mes] || 99;''','''      const MES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
      const mk = t => { const l = String(t || "").toLowerCase(); const mi = MES.findIndex(m => l.includes(m)); const y = Number((l.match(/\\d{2,4}/) || [0])[0]); return -(((y < 100 ? 2000 + y : y) * 100) + (mi + 1)); };
      return [...(rows || [])].map((r, i) => ({...r, _i: i})).sort((a, b) => {
        const ma = mk(a.mes), mb = mk(b.mes);''')
# REV: merge por id (lote), sin items de revisión en Paso 2
CUT('      const saved = JSON.parse(localStorage.getItem(LS_REV) || "null");','        revisionDone = !!saved.done;\n      }\n','      applySavedRev();\n')
CUT('      const fromRev = JSON.parse(localStorage.getItem(LS_ITEMS) || "null");','        ITEMS = extras.concat(ITEMS);\n      }\n','      localStorage.removeItem(LS_ITEMS);\n')
R('''    const mesSel = document.getElementById("mes");
    const blocksEl''','''    ITEMS = dedupeItems(ITEMS.map(mapContenido));
    try { applyEdits(); } catch (e) {}
    const mesSel = document.getElementById("mes");
    const blocksEl''')
R('''    let idx = 0;
    let revisionDone = false;''','''    let idx = null;
    let revisionDone = false;
    function revBatch() { return REV.map(r => r.id).join(","); }
    function applySavedRev() {
      revisionDone = false;
      let saved = null;
      try { saved = JSON.parse(localStorage.getItem("mova-paris-rev-v5") || "null"); } catch (e) {}
      if (!saved || saved.batch !== revBatch() || !Array.isArray(saved.rows)) return;
      const byId = Object.fromEntries(saved.rows.map(r => [r.id, r]));
      REV = REV.map(r => { const sv = byId[r.id]; return sv ? { ...r, voto: sv.voto || "", comentario: sv.comentario || "", keyword: sv.keyword != null ? sv.keyword : r.keyword, url: sv.url != null ? sv.url : r.url } : r; });
      revisionDone = !!saved.done;
    }''')
R('''      localStorage.setItem(LS_REV, JSON.stringify({
        done: revisionDone,''','''      localStorage.setItem("mova-paris-rev-v5", JSON.stringify({
        batch: revBatch(),
        done: revisionDone,''')
R('''        localStorage.removeItem("mova-paris-items-from-rev-v3");''','''        localStorage.removeItem("mova-paris-items-from-rev-v3");
        localStorage.removeItem("mova-paris-rev-v4");''')
# Normaliza ítems: (ya no hay "Semana revisión")
CUT('    // Normaliza ítems: quita mes artificial y asegura VB editor','    });\n','')
CUT('    // Meses del consolidado en orden','    mesSel.value = [...mesSel.options]','''    const mesOrdered = [...new Set(ITEMS.map(i => i.mes).filter(Boolean))];
    mesOrdered.forEach(m => {
      const o = document.createElement("option"); o.value = m; o.textContent = m; mesSel.appendChild(o);
    });
    mesSel.value = [...mesSel.options]''')
# goView con iniciativas
R('''      if (crumb) crumb.textContent = name === "redaccion" ? "Paso 2 · Contenidos" : "Paso 1 · Keywords";
      if (name === "redaccion") {''','''      if (crumb) crumb.textContent = name === "redaccion" ? "Paso 2 · Contenidos" : "Paso 1 · Keywords";
      document.body.classList.toggle("mvc-on-inic", name === "iniciativas");
      if (name === "iniciativas") {
        try { history.replaceState(null, "", "#iniciativas"); } catch (e) {}
        if (window.MOVA_LOAD_INIC) window.MOVA_LOAD_INIC();
      } else if (name === "redaccion") {''')
# Quita selección por arrastre (las celdas se seleccionan y copian de forma nativa)
CUT('    const pairSel = { active: false','    function esc(s) {','    function esc(s) {',)
# Revisión: textos dinámicos
R('''      btn.textContent = revisionDone ? "enviado" : "listo";
      btn.title = xNeedComment
        ? `Hay ${c.xSinCom} fila(s) con X sin comentario. Completa el porqué para habilitar listo.`
        : (!allOk ? "Revisa las 40 (VB o X) para habilitar listo." : "Enviar observaciones y pasar a Redacción");''','''      btn.textContent = revisionDone ? "Enviado" : "Listo";
      btn.title = xNeedComment
        ? `Hay ${c.xSinCom} fila(s) con X sin comentario. Completa el porqué para habilitar Listo.`
        : (!allOk ? `Revisa las ${c.total} keywords (VB o X) para habilitar Listo.` : "Enviar el resumen a Mel y pasar a Contenidos");''')
# Correo: sin mes ni semana (en Paso 1 no existen)
R('''      const mesEl = document.getElementById("mes"), semEl = document.getElementById("semana");
      const rech = [];''','''      const rech = [];''')
R('''        mes: (mesEl && mesEl.value) || DATA.defaultMes || "", semana: (semEl && semEl.value) || "",
        total:''','''        total:''')
# Quita FormSubmit (servicio externo) y aplicar corrección / pushToRedaccion
CUT('    function buildObsEmailBody(mods) {','    function persistItemsFromRev() {','''    function buildObsEmailBody(mods) {
      const lines = ["Hola Mel:", "", "Keywords con X en la revisión de Paris (Portal Redactor):", ""];
      mods.forEach((r, i) => { lines.push((i + 1) + ") " + r.keyword); lines.push("URL: " + (r.url || "(sin URL)")); lines.push("Comentario: " + ((r.comentario || "").trim() || "—")); lines.push(""); });
      return lines.join("\\n");
    }

    // Única vía: n8n mova-revision-listo (valida token Google y envía Gmail a Mel). Sin servicios externos.
    async function sendRevisionN8n(toEmail) {
      const tok = window.MOVA_TOKEN || "";
      if (!tok) return { ok:false, motivo:"Sin sesión Google (token)." };
      const rech = [];
      REV.forEach((r, i) => { if (r.voto === "x") rech.push({ n: i + 1, "año": r.anio || "", tipo: r.tipo || "", keyword: r.keyword || "", url: r.url || "", comentario: (r.comentario || "").trim() }); });
      const body = { token: tok, empresa: "REDACTORES", cliente: "paris",
        correo: (window.MOVA_USER && window.MOVA_USER.correo) || "", destinatario: toEmail,
        total: REV.length, aprobadas: REV.filter(r => r.voto === "vb").length, rechazadas: rech };
      try {
        const r = await fetch(N8N.revListo, { method:"POST", cache:"no-store", headers:{"Content-Type":"text/plain"}, body: JSON.stringify(body) });
        let d = await r.json(); d = Array.isArray(d) ? d[0] : d;
        return d && d.ok ? { ok:true } : { ok:false, motivo:(d && d.motivo) || ("HTTP " + r.status) };
      } catch (e) { return { ok:false, motivo:"No se pudo conectar con n8n." }; }
    }

''',keep_end=True)
CUT('    function persistItemsFromRev() {','    document.getElementById("btnAllVb")','''    function persistItemsFromRev() {}

    document.getElementById("btnAllVb")''')
R('''      s.textContent = "Las 40 quedaron con VB. Puedes cambiar filas una a una.";''','''      s.textContent = "Todas quedaron con VB. Puedes cambiar filas una a una.";''')
R('''        alert("Debes revisar las 40 keywords/URLs (VB o X) antes de presionar listo.");''','''        alert(`Debes revisar las ${c.total} keywords (VB o X) antes de presionar Listo.`);''')
R('''        alert(`Hay ${sinCom.length} fila(s) con X sin comentario del porqué. Completa esos comentarios para poder dar listo.`);''','''        alert(`Hay ${sinCom.length} fila(s) con X sin comentario del porqué. Complétalos para poder dar Listo.`);''')
CUT('      // Primero deja las 40 en Redacción; después envía el correo (sin abrir el cliente)\n      pushToRedaccion();\n','      if (mods.length) document.getElementById("fStatus").value = "pendiente";\n    });\n','''      revisionDone = true;
      persistRev();
      updateRevStats();
      const rn = await sendRevisionN8n(mel);
      const s = document.getElementById("statusRev");
      if (!rn.ok) {
        revisionDone = false; persistRev(); updateRevStats();
        if (mods.length) { try { await navigator.clipboard.writeText(buildObsEmailBody(mods)); } catch (e) {} }
        s.className = "status show warn";
        s.textContent = "No se pudo enviar el correo a Mel (" + rn.motivo + ")." + (mods.length ? " El resumen de las X quedó copiado para que lo reenvíes." : "") + " Puedes reintentar con Listo.";
        return;
      }
      s.className = "status show";
      s.textContent = mods.length ? `Listo. Correo enviado a Mel con ${mods.length} keyword(s) con X.` : "Listo. Revisión registrada (todas con VB).";
      syncNavLock();
      goView("redaccion");
    });
''')
# Bloque Redacción completo
a=s.index('    /* ---- Redacción ---- */'); b=s.index('    // Deep-link paso 2')
s=s[:a]+open('redaccion.js',encoding='utf-8').read()+'\n'+s[b:]
R('''      if (h === "#redaccion" || h === "#paso-2" || h === "#paso2") return true;''','''      if (h === "#redaccion" || h === "#paso-2" || h === "#paso2") return true;
      if (h === "#iniciativas") return "iniciativas";''')
R('''    if (wantRedaccion) goView("redaccion");''','''    if (wantRedaccion === "iniciativas") goView("iniciativas");
    else if (wantRedaccion) goView("redaccion");''')
R('''    bindPairSelection();\n''','',0) if s.count('bindPairSelection();')==0 else None
# Shell: nav iniciativas
R('''    if (typeof goView === "function") goView(paso === 2 ? "redaccion" : "revision");''','''    if (typeof goView === "function") goView(paso === 3 ? "iniciativas" : paso === 2 ? "redaccion" : "revision");''')
R('''    else if (to === "contenidos") openParis(2);''','''    else if (to === "contenidos") openParis(2);
    else if (to === "iniciativas") openParis(3);''')
# act(): ítem lateral y título
R('''    var rv=document.getElementById("view-redaccion"), step=(rv&&rv.classList.contains("active"))?"redaccion":"revision";''','''    var rv=document.getElementById("view-redaccion"), ri=document.getElementById("view-iniciativas"), step=(ri&&ri.classList.contains("active"))?"iniciativas":((rv&&rv.classList.contains("active"))?"redaccion":"revision");''')
R('''if(t)t.innerHTML=paris?(step==="redaccion"?"Paris / <span>Paso 2</span>":"Paris / <span>Paso 1</span>")''','''if(t)t.innerHTML=paris?(step==="iniciativas"?"Paris / <span>Iniciativas</span>":step==="redaccion"?"Paris / <span>Paso 2</span>":"Paris / <span>Paso 1</span>")''')
R('''  document.querySelectorAll(".mova-shell-view,.view,.nav button").forEach''','''  document.querySelectorAll(".mova-shell-view,.view,.nav button").forEach''')
# colgroup widths: sin columna VB editor separada
R('table.sheet col.c-pos{width:10%} table.sheet col.c-est{width:78px} table.sheet col.c-vb{width:96px} table.sheet col.c-txt{width:84px}','table.sheet col.c-pos{width:9%} table.sheet col.c-vb{width:104px} table.sheet col.c-txt{width:92px}')
R('table.sheet col.c-url{width:18%} table.sheet col.c-anc{width:13%} table.sheet col.c-iu{width:20%}','table.sheet col.c-url{width:17%} table.sheet col.c-anc{width:15%} table.sheet col.c-iu{width:24%}')
R('table.sheet col.c-sem{width:48px} table.sheet col.c-kw{width:100px}','table.sheet col.c-sem{width:64px} table.sheet col.c-kw{width:120px}')
open('s2.html','w',encoding='utf-8').write(s)
print('ok')
