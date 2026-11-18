const norm = s => String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
const u = $('Cont · Validar acceso').first().json;
const cliente = String(($('Cont · Preparar').first().json.b || {}).cliente || 'paris').toLowerCase();
if (u.rol === 'redactor' && u.clientes.length && !u.clientes.includes(cliente)) {
  return [{ json: { ok: true, rol: u.rol, cliente, meses: [], defaultMes: null, total: 0, contenidos: [], revision: [] } }];
}
if (u.rol === 'cliente') return [{ json: { ok: false, motivo: 'Vista cliente aun no disponible.', contenidos: [], revision: [] } }];
const cfg = $('Cont · Rangos pestañas mes').first().json;
const MES = {enero:1,febrero:2,marzo:3,abril:4,mayo:5,junio:6,julio:7,agosto:8,septiembre:9,setiembre:9,octubre:10,noviembre:11,diciembre:12};
const mesKey = t => { const l=t.toLowerCase(); const m=Object.keys(MES).find(k=>l.includes(k)); const y=Number((l.match(/\d{2,4}/)||[0])[0]); return (y<100?2000+y:y)*100+(MES[m]||0); };
const cell = (r, i) => (i >= 0 && r[i] != null) ? String(r[i]).trim() : '';
// Columna por título (alias) o, si no está, por posición fija de la planilla
const col = (hdr, alias, pos) => { for (const a of alias) { const i = hdr.indexOf(norm(a)); if (i >= 0) return i; } return pos; };
// Ticket/VB en J (TEXTO VB) y K (HTML OK / HTML VB): casilla TRUE, ✓, VB, OK, SI
const tick = v => /^(true|verdadero|si|s[ií]|ok|vb|listo|✓|✔|☑|✅)$/i.test(String(v||'').trim()) && !/^(false|falso|no)$/i.test(String(v||'').trim());
let contenidos = [], revision = [], revisionHoja = '';
for (const vr of ($('Cont · Sheets batchGet').first().json.valueRanges || [])) {
  const tab = String(vr.range || '').split('!')[0].replace(/^'|'$/g,'').replace(/''/g,"'");
  const values = vr.values || [];
  if (!values.length) continue;
  const hdr = (values[0] || []).map(norm);
  if (tab === cfg.fuente) {
    // PASO 1: últimas 40 filas ocupadas de D (keyword) y E (URL) de la hoja fuente (A Año, C Tipo)
    revisionHoja = tab;
    const occ = [];
    values.forEach((r, i) => { if (i === 0) return; const kw = cell(r, 3), url = cell(r, 4); if (kw || url) occ.push({ id: 'r' + (i + 1), fila: i + 1, anio: cell(r, 0), tipo: cell(r, 2), keyword: kw, url }); });
    revision = occ.slice(-40);
    continue;
  }
  // PASO 2: A Semana | B Keyword | C Tipo | D Url | E Anchor | F URLs interlinking | G Posicion | H Texto drive | I Excel HTML | J TEXTO VB | K HTML OK
  const cS = col(hdr, ['semana','week'], 0), cK = col(hdr, ['keyword','kw','palabra clave'], 1), cT = col(hdr, ['tipo','type'], 2), cU = col(hdr, ['url','link'], 3);
  const cA = col(hdr, ['anchor text interlinking','anchor text','anchor'], 4), cIU = col(hdr, ['urls interlinking','url interlinking'], 5), cP = col(hdr, ['posicion','position'], 6);
  const cTD = col(hdr, ['texto drive','texto'], 7), cJ = col(hdr, ['texto vb'], 9), cKk = col(hdr, ['html ok','html vb'], 10);
  let sem = null, cur = null, ord = 0;
  values.slice(1).forEach(r => {
    if (!r || !r.some(c => String(c).trim() !== '')) return;
    const sv = cell(r, cS); const sm = sv.match(/\d+/); if (sm) sem = Math.min(5, Number(sm[0]));   // relleno hacia abajo (celdas combinadas)
    const kw = cell(r, cK);
    if (kw) {
      ord++;
      cur = { mes: tab, semana: sem || 1, ord, keyword: kw, tipo: cell(r, cT), url: cell(r, cU), textoDrive: cell(r, cTD), texto: '',
        textoVb: tick(cell(r, cJ)), htmlOk: tick(cell(r, cKk)), listo: false, status: '', vbEditor: 'pendiente', anchors: [], _k: mesKey(tab) };
      contenidos.push(cur);
    }
    if (!cur) return;
    if (!cur.url && cell(r, cU)) cur.url = cell(r, cU);
    if (tick(cell(r, cJ))) cur.textoVb = true;
    if (tick(cell(r, cKk))) cur.htmlOk = true;
    const a = cell(r, cA), iu = cell(r, cIU), p = cell(r, cP);
    if ((a || iu || p) && cur.anchors.length < 10) cur.anchors.push({ a, u: iu, p });
  });
}
// Lo guardado desde el portal (Portal_Estado): texto, metas, status, vbEditor
try {
  const pe = ($('Cont · Leer Portal_Estado').first().json || {}).values || [];
  const h = (pe[0] || []).map(norm); const ix = k => h.indexOf(norm(k));
  const est = {};
  pe.slice(1).forEach(r => { const id = String(r[ix('id')] || '').trim(); if (id) est[id] = r; });
  contenidos.forEach(x => {
    const r = est[[cliente, x.mes, x.semana, x.url || x.keyword].join('|')];
    if (!r) return;
    const g = k => { const i = ix(k); return i >= 0 ? String(r[i] ?? '').trim() : ''; };
    if (g('texto')) x.texto = g('texto');
    if (g('metaTitulo')) x.metaTitulo = g('metaTitulo');
    if (g('metaDescripcion')) x.metaDescripcion = g('metaDescripcion');
    if (g('status')) { x.status = g('status'); x.listo = /listo|publicado/i.test(x.status); }
    if (/ok|si|sí/i.test(g('vbEditor'))) x.vbEditor = 'ok';
  });
} catch (e) {}
contenidos = contenidos.filter(x => x.keyword || x.url)
  .sort((a,b) => b._k-a._k || (a.semana||0)-(b.semana||0) || a.ord-b.ord)   // mes actual→viejo; semana 1→5 (antigua→nueva)
  .map(({_k,...x}) => x);
const meses = [...new Set(contenidos.map(x => x.mes))];
return [{ json: { ok: true, rol: u.rol, cliente, meses, defaultMes: meses[0] || null, total: contenidos.length, actualizado: new Date().toISOString(), contenidos, revision, revisionHoja } }];
