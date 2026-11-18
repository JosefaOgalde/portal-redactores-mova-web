const norm = s => String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
const u = $('Inic · Validar acceso').first().json;
const cliente = String(($('Inic · Preparar').first().json.b || {}).cliente || 'paris').toLowerCase();
if (u.rol === 'redactor' && u.clientes.length && !u.clientes.includes(cliente)) return [{ json: { ok: true, cliente, total: 0, iniciativas: [] } }];
const values = $json.values || [];
const hdr = (values[0] || []).map(norm);
const ix = alias => { for (const a of alias) { const i = hdr.indexOf(norm(a)); if (i >= 0) return i; } return -1; };
const g = (r, i) => i >= 0 && r[i] != null ? String(r[i]).trim() : '';
const C = { nombre: ix(['iniciativa','nombre','nombre iniciativa','titulo','proyecto']), cliente: ix(['cliente','marca','empresa','cuenta']),
  estado: ix(['estado','status']), etapa: ix(['etapa','fase']), fecha: ix(['fecha','fecha inicio','inicio','fecha idea','fecha_idea','creacion']),
  plazo: ix(['fin','fecha fin','plazo','fecha termino','fecha_fin']), link: ix(['link_mova','link mova','link','url','enlace']), id: ix(['id']) };
const iniciativas = values.slice(1).filter(r => r && r.some(c => String(c).trim() !== ''))
  .map(r => ({ id: g(r, C.id), nombre: g(r, C.nombre), cliente: g(r, C.cliente), estado: g(r, C.estado), etapa: g(r, C.etapa), fecha: g(r, C.fecha), plazo: g(r, C.plazo), link: g(r, C.link) }))
  .filter(x => x.nombre && norm(x.cliente).includes(norm(cliente)));   // dentro de Paris, solo iniciativas de Paris
return [{ json: { ok: true, cliente, total: iniciativas.length, columnas: Object.fromEntries(Object.entries(C).map(([k, i]) => [k, i >= 0 ? (values[0] || [])[i] : null])), iniciativas } }];
