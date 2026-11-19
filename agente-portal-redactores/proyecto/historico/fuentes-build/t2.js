const { chromium } = require('/node_modules/playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.HOME + '/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome' });
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  const rev = Array.from({ length: 40 }, (_, i) => ({ id: 'r' + (100 + i), anio: '2026', tipo: 'PLP', keyword: 'keyword fuente ' + (i + 1), url: 'https://www.paris.cl/categoria/subcategoria/una-url-bastante-larga-para-probar-el-salto-de-linea-' + (i + 1) + '/' }));
  const cont = [
    { mes: 'Octubre 26', semana: 1, ord: 1, keyword: 'kw sem1', tipo: 'PLP', url: 'https://p/1', textoVb: true, htmlOk: false, anchors: [{ a: 'a1', u: 'https://p/a1', p: '3.0' }] },
    { mes: 'Octubre 26', semana: 2, ord: 2, keyword: 'kw sem2', tipo: 'Lista', url: 'https://p/2', textoVb: true, htmlOk: true, anchors: [] },
    { mes: 'Octubre 26', semana: 5, ord: 3, keyword: 'kw sem5', tipo: 'Blog', url: 'https://p/5', anchors: [] }];
  await p.route(/n8n\.cloud\/webhook\/(.*)/, r => {
    const path = r.request().url().split('/').pop();
    let body = { ok: true };
    if (path === 'mova-sync-contenidos') body = { ok: true, contenidos: cont, revision: rev, revisionHoja: 'URLs trabajadas', defaultMes: 'Octubre 26' };
    if (path === 'mova-sync-historico') body = { ok: true, historico: [{ anio: 2026, tipo: 'PLP', keyword: 'hk', url: 'https://p/hk' }] };
    if (path === 'mova-iniciativas') body = { ok: true, iniciativas: [{ nombre: 'Portal Redactores', cliente: 'Paris', estado: 'En desarrollo', etapa: 'Diseño', fecha: '29-10-2026', plazo: '30-10-2026', link: 'https://acme-chile.cl/mova/seo/redactor.html' }] };
    if (path === 'mova-revision-listo') { globalThis.lastRev = r.request().postData(); }
    r.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(body) });
  });
  await p.goto('file:///workspace/rp/redactor.min.html');
  await p.click('.mv-local');
  await p.evaluate(() => { window.MOVA_TOKEN = 'tok'; });
  await p.click('#mvSide [data-mova-nav=inicio]');
  await p.waitForTimeout(500);
  await p.click('#mvSide [data-mova-nav=keywords]');
  await p.waitForTimeout(200);
  const R = {};
  R.revRows = await p.locator('#revBody tr').count();
  R.src = await p.textContent('#revSrc');
  await p.screenshot({ path: '/workspace/portal-redactores/capturas/v5/02b-paso1-40filas-claro.png' });
  await p.click('#btnAllVb');
  await p.locator('#revBody tr >> nth=2').locator('[data-voto=x]').click();
  R.listoDisabledSinCom = await p.isDisabled('#btnListoRev');
  await p.locator('#revBody tr >> nth=2').locator('textarea').fill('URL no corresponde');
  R.listoDisabledConCom = await p.isDisabled('#btnListoRev');
  await p.click('#btnListoRev');
  await p.waitForTimeout(300);
  R.revPayload = JSON.parse(globalThis.lastRev || '{}'); delete R.revPayload.token;
  R.revPayload = { keys: Object.keys(R.revPayload), rech: R.revPayload.rechazadas };
  R.view = await p.evaluate(() => document.querySelector('.view.active').id);
  R.blocks = await p.locator('.block').count();
  await p.selectOption('#semana', '2'); R.sem2 = await p.locator('.block').count();
  await p.selectOption('#semana', '5'); R.sem5 = await p.locator('.block').count();
  await p.selectOption('#semana', '');
  await p.selectOption('#fStatus', 'vb'); R.fVb = await p.locator('.block').count();
  await p.selectOption('#fStatus', 'html'); R.fHtml = await p.locator('.block').count();
  await p.selectOption('#fStatus', '');
  R.pills = await p.evaluate(() => [...document.querySelectorAll('.est-cell')].map(c => c.textContent.trim()));
  // toolbar
  await p.locator('.block >> nth=0').locator('[data-act=texto]').click();
  await p.evaluate(() => { const ed = document.getElementById('textoBody'); ed.innerHTML = '<p>uno dos</p>'; const r = document.createRange(); r.selectNodeContents(ed.querySelector('p')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); });
  await p.click('[data-cmd=h3]');
  R.h3 = await p.evaluate(() => getTextoEditorHtml());
  await p.click('[data-cmd=ul]');
  R.ul = await p.evaluate(() => getTextoEditorHtml() + ' DOM:' + document.getElementById('textoBody').innerHTML);
  await p.evaluate(() => { const ed = document.getElementById('textoBody'); ed.innerHTML = '<p>ver tallas</p>'; const r = document.createRange(); r.selectNodeContents(ed.querySelector('p')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); });
  await p.click('[data-cmd=link]');
  await p.fill('#bubUrl', 'www.paris.cl/guia');
  await p.click('#bubOk');
  R.link = await p.evaluate(() => getTextoEditorHtml());
  await p.evaluate(() => { const a = document.querySelector('#textoBody a'); const r = document.createRange(); r.selectNodeContents(a); const s = getSelection(); s.removeAllRanges(); s.addRange(r); });
  await p.click('[data-cmd=unlink]');
  R.unlink = await p.evaluate(() => getTextoEditorHtml());
  await p.click('#btnCerrarTexto');
  await p.click('#mvSide [data-mova-nav=iniciativas]');
  await p.waitForTimeout(300);
  R.ini = await p.textContent('#iniBox');
  R.title = await p.textContent('#mvcTitle');
  R.stepsHidden = await p.evaluate(() => getComputedStyle(document.querySelector('.mvc-steps')).display);
  R.errs = errs;
  console.log(JSON.stringify(R, null, 1));
  await b.close();
})();
