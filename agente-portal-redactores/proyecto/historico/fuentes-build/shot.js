const { chromium } = require('/node_modules/playwright-core');
(async () => {
  const exe = require('fs').readdirSync(process.env.HOME + '/.cache/ms-playwright/chromium-1248').find(x => x.startsWith('chrome-linux'));
  const b = await chromium.launch({ executablePath: process.env.HOME + '/.cache/ms-playwright/chromium-1248/' + exe + '/chrome' });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, permissions: ['clipboard-read','clipboard-write'] });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  const out = '/workspace/portal-redactores/capturas/v5/';
  require('fs').mkdirSync(out, { recursive: true });
  await p.goto('file:///workspace/rp/redactor.min.html');
  await p.click('.mv-local');
  await p.waitForTimeout(300);
  const R = {};
  R.kicker = await p.evaluate(() => [...document.querySelectorAll('#view-accesos .ms-kicker')].length);
  R.rol = await p.evaluate(() => window.MOVA_USER && window.MOVA_USER.rol);
  for (const dark of [false, true]) {
    await p.evaluate(d => { document.body.classList.toggle('mvc-dark', d); }, dark);
    const sfx = dark ? '-oscuro' : '-claro';
    await p.evaluate(() => { document.querySelector('[data-mova-nav=hub]').click(); });
    await p.waitForTimeout(150);
    await p.screenshot({ path: out + '00-hub' + sfx + '.png' });
    await p.click('#mvSide [data-mova-nav=inicio]');
    await p.waitForTimeout(150);
    await p.screenshot({ path: out + '01-inicio' + sfx + '.png' });
    await p.click('#mvSide [data-mova-nav=keywords]');
    await p.waitForTimeout(150);
    await p.screenshot({ path: out + '02-paso1' + sfx + '.png' });
    await p.click('#mvSide [data-mova-nav=contenidos]');
    await p.waitForTimeout(150);
    await p.fill('#hq', 'abrigo');
    await p.waitForTimeout(100);
    await p.screenshot({ path: out + '03-paso2' + sfx + '.png', fullPage: false });
    await p.click('#mvSide [data-mova-nav=iniciativas]');
    await p.waitForTimeout(150);
    await p.screenshot({ path: out + '05-iniciativas' + sfx + '.png' });
  }
  // Pruebas funcionales (rol redactor)
  await p.evaluate(() => document.body.classList.remove('mvc-dark'));
  await p.click('#mvSide [data-mova-nav=contenidos]');
  await p.waitForTimeout(100);
  R.blocksBefore = await p.locator('.block').count();
  await p.fill('#q', 'retinol');
  R.blocksFiltered = await p.locator('.block').count();
  R.anchorsUnchanged = await p.evaluate(() => ITEMS.every(it => !it.anchors.some(a => a.a === 'retinol' || a.u === 'retinol')));
  await p.fill('#q', '');
  R.blocksAfter = await p.locator('.block').count();
  R.semana5 = await p.evaluate(() => [...document.querySelectorAll('#semana option')].map(o => o.value).join(','));
  R.estadoOpts = await p.evaluate(() => [...document.querySelectorAll('#fStatus option')].map(o => o.textContent).join(' | '));
  R.vbEditorFilter = await p.locator('#fVbEditor').count();
  R.aplicarCorr = await p.evaluate(() => document.body.innerHTML.includes('Aplicar corrección'));
  // click histórico agrega a la keyword activa (primera)
  await p.fill('#hq', 'abrigo');
  const first = await p.evaluate(() => ITEMS[idx].keyword);
  await p.click('.hist-item >> nth=0');
  R.histAdd = await p.evaluate(() => ITEMS[idx].anchors.filter(a => a.a).length);
  R.firstKw = first;
  // pegado multi-línea en URL (sólo URL)
  const cell = p.locator('.block >> nth=1').locator('.url-cell[data-u="0"]');
  await cell.click();
  await p.evaluate(() => {
    const el = document.querySelectorAll('.block')[1].querySelector('.url-cell[data-u="0"]');
    const dt = new DataTransfer(); dt.setData('text/plain', 'https://x.cl/1\nhttps://x.cl/2');
    el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  });
  R.pasteUrl = await p.evaluate(() => { const i = Number(document.querySelectorAll('.block')[1].dataset.i); return ITEMS[i].anchors.slice(0, 2).map(a => a.a + '|' + a.u); });
  R.blocksAfterPaste = await p.locator('.block').count();
  R.selectable = await p.evaluate(() => getComputedStyle(document.querySelector('.url-cell')).userSelect + ',' + getComputedStyle(document.querySelector('.pos-cell')).userSelect);
  // Editor
  await p.locator('.block >> nth=0').locator('[data-act=texto]').click();
  await p.waitForTimeout(150);
  await p.evaluate(() => {
    const ed = document.getElementById('textoBody'); ed.innerHTML=''; ed.focus();
    const dt = new DataTransfer();
    dt.setData('text/plain', '## Abrigos para mujer\nLos **abrigos** de esta temporada son ideales.\n- Abrigo largo\n- Abrigo corto con **cinturón**\n### Cómo elegir\nRevisa la [guía de tallas](https://www.paris.cl/guia/).');
    ed.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  });
  R.mdHtml = await p.evaluate(() => getTextoEditorHtml());
  await p.evaluate(() => {
    const ed = document.getElementById('textoBody');
    const dt = new DataTransfer();
    dt.setData('text/html', '<b style="font-weight:normal" id="docs-internal-guid-1"><p><span style="font-weight:700">Negrita Docs</span> normal</p><ul><li><p>uno</p></li><li><p>dos</p></li></ul></b>');
    const r = document.createRange(); r.selectNodeContents(ed); r.collapse(false); const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    ed.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  });
  R.docsHtml = await p.evaluate(() => getTextoEditorHtml());
  R.midPaste = await p.evaluate(() => {
    const ed = document.getElementById('textoBody'); const keep = ed.innerHTML;
    ed.innerHTML = '<p>AAA BBB</p>'; const t = ed.querySelector('p').firstChild; const r = document.createRange(); r.setStart(t, 4); r.collapse(true); const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    const dt = new DataTransfer(); dt.setData('text/plain', '## T\n- x\n- y');
    ed.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
    const out = getTextoEditorHtml(); ed.innerHTML = keep; return out; });
  await p.fill('#tMetaTitulo', 'Abrigos de mujer | Paris.cl');
  await p.fill('#tMetaDesc', 'Encuentra abrigos de mujer en Paris.cl con despacho a todo Chile.');
  // seleccionar palabra "abrigos" para estado de negrita
  await p.evaluate(() => { const st = document.querySelector('#textoBody strong'); const r = document.createRange(); r.selectNodeContents(st); const s = getSelection(); s.removeAllRanges(); s.addRange(r); document.dispatchEvent(new Event('selectionchange')); });
  await p.waitForTimeout(100);
  R.boldOn = await p.evaluate(() => document.querySelector('[data-cmd=bold]').classList.contains('on'));
  await p.screenshot({ path: out + '04-editor-claro.png' });
  // link bubble
  await p.click('#textoBody a');
  await p.waitForTimeout(100);
  R.bubble = await p.evaluate(() => document.getElementById('linkBub').textContent);
  await p.screenshot({ path: out + '04b-editor-enlace-claro.png' });
  await p.keyboard.press('Escape');
  await p.evaluate(() => document.body.classList.add('mvc-dark'));
  await p.evaluate(() => document.getElementById('textoBody').scrollTop = 0);
  await p.screenshot({ path: out + '04-editor-oscuro.png' });
  await p.evaluate(() => { const pp = document.querySelector('#bdTexto .popup'); pp.scrollTop = pp.scrollHeight; });
  await p.waitForTimeout(100);
  await p.screenshot({ path: out + '04c-editor-interlinking-oscuro.png' });
  await p.evaluate(() => document.body.classList.remove('mvc-dark'));
  await p.screenshot({ path: out + '04c-editor-interlinking-claro.png' });
  // copiar con etiquetas
  await p.click('#btnCopiarEtiquetas');
  await p.waitForTimeout(150);
  R.clip = await p.evaluate(() => navigator.clipboard.readText());
  await p.click('#btnGuardarTexto');
  R.saved = await p.evaluate(() => ({ t: ITEMS[idx].metaTitulo, len: (ITEMS[idx].texto || '').length }));
  R.blocksAfterSave = await p.locator('.block').count();
  R.errs = errs;
  console.log(JSON.stringify(R, null, 1));
  await b.close();
})();
