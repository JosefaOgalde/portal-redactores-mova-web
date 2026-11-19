const fs=require('fs');
const code=fs.readFileSync('cont_norm.js','utf8');
const data={
 'Cont · Validar acceso':{rol:'redactor',clientes:[]},
 'Cont · Preparar':{b:{cliente:'paris'}},
 'Cont · Rangos pestañas mes':{fuente:'URLs trabajadas'},
 'Cont · Leer Portal_Estado':{values:[['id','texto','metaTitulo'],['paris|Octubre 26|2|https://p/b','<p>hola</p>','MT']]},
 'Cont · Sheets batchGet':{valueRanges:[
  {range:"'Octubre 26'!A1:K30",values:[['Semana','Keyword','Tipo','Url','Anchor text Interlinking','URLs interlinking','Posición','Texto drive','Excel HTML','TEXTO VB','HTML OK'],
   ['Semana 1','kwA','PLP','https://p/a','an1','https://p/1','5.0','https://docs.google.com/x','','TRUE','FALSE'],
   ['','','','','an2','https://p/2','Not Ranked (Top 10).'],
   ['Semana 2','kwB','Lista','https://p/b','an3','https://p/3','3','','','FALSE','TRUE'],
   ['','kwC','Blog','https://p/c','','','','','','',''],
  ]},
  {range:"'URLs trabajadas'!A1:E100",values:[['Año','Implementado','Tipo','Keyword','URL']].concat(Array.from({length:50},(_,i)=>['2026','SI','PLP','k'+i,'https://p/k'+i])).concat([['','','','','']])}
 ]}};
const $=n=>({first:()=>({json:data[n]})});
const out=new Function('$',code)($);
const j=out[0].json; console.log(JSON.stringify(j.contenidos,null,0)); console.log(j.revision.length,j.revision[0],j.revision[39],j.revisionHoja);
