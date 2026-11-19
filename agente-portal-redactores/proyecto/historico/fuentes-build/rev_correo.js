const b = $('Rev · Preparar').first().json.b || {};
const u = $('Rev · Validar acceso').first().json;
const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const rech = Array.isArray(b.rechazadas) ? b.rechazadas : [];
const dest = 'mmanzur@mkof.cl';
const total = Number(b.total) || 0;
const vb = Number(b.aprobadas) || (total - rech.length);
const conCom = rech.filter(r => String(r.comentario || '').trim()).length;
const filas = rech.map(r => `<tr><td>${esc(r.keyword)}</td><td><a href="${esc(r.url)}">${esc(r.url)}</a></td><td>${esc(r.comentario)}</td></tr>`).join('');
const tabla = rech.length ? `<p><b>Keywords con X:</b></p><table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-size:13px"><thead style="background:#0066cc;color:#fff"><tr><th>Keyword</th><th>URL</th><th>Comentario</th></tr></thead><tbody>${filas}</tbody></table>` : '';
// Sin línea Mes/Semana: en el Paso 1 ese dato aún no existe
const html = `<div style="font-family:Arial,sans-serif;color:#222;font-size:14px"><p><b>PARIS</b> terminó la revisión de keywords desde MOVA.</p><ul><li>Revisado por: ${esc(u.nombre || u.correo)} (<a href="mailto:${esc(u.correo)}">${esc(u.correo)}</a>)</li><li>Fecha: ${esc(u.ts)}</li><li>Keywords revisadas: <b>${total}</b></li><li>Con VB (visto bueno): ${vb}</li><li>Con X (rechazadas): ${rech.length}</li><li>X con comentario: ${conCom}</li><li>Hoja: Contenidos</li></ul>${tabla}<p>Recuerda corregir las keywords marcadas con X antes de redactar.</p><p style="color:#8a9a94;font-size:12px;font-weight:bold">MOVA · Portal Redactor</p></div>`;
return [{ json: { dest, asunto: `Paris · Revisión lista · ${rech.length} con X de ${total}`, html, rechazadas: rech.length,
  histBody: { values: [[u.ts, u.nombre || '', u.correo, u.nivel || '', 'REVISION LISTA', `${rech.length} con X de ${total} · ${vb} VB -> ${dest}`]] } } }];
