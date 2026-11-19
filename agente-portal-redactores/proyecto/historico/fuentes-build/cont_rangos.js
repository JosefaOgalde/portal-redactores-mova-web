const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','setiembre','octubre','noviembre','diciembre'];
const sheets = ($json.sheets || []).map(s => s.properties);
const tabs = sheets.map(p => p.title);
const meses = tabs.filter(t => MESES.some(m => t.toLowerCase().includes(m)));
// Hoja fuente del Paso 1: URLs trabajadas (gid 1739267264), columnas A:E (D keyword, E URL)
const src = sheets.find(p => String(p.sheetId) === '1739267264');
const fuente = src ? src.title : '';
const q = t => 'ranges=' + encodeURIComponent(`'${t.replace(/'/g, "''")}'!A:K`);
const parts = meses.map(q);
if (fuente) parts.push('ranges=' + encodeURIComponent(`'${fuente.replace(/'/g, "''")}'!A:E`));
return [{ json: { meses, fuente, qs: parts.join('&') || 'ranges=A1' } }];
