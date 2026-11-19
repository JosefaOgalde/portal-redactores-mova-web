import json,copy,uuid
d=json.load(open('/workspace/portal-redactores/n8n/MOVA_Portal_Redactores_v3.json',encoding='utf-8'))
N={n['name']:n for n in d['nodes']}
N['Cont · Normalizar + rol']['parameters']['jsCode']=open('cont_norm.js',encoding='utf-8').read()
N['Cont · Rangos pestañas mes']['parameters']['jsCode']=open('cont_rangos.js',encoding='utf-8').read()
N['Rev · Armar correo']['parameters']['jsCode']=open('rev_correo.js',encoding='utf-8').read()
N['Cont · Leer Portal_Estado']['parameters']['url']=N['Cont · Leer Portal_Estado']['parameters']['url'].replace('Portal_Estado!A:K','Portal_Estado!A:M')
for k in ['Texto · Upsert Portal_Estado']:
    v=N[k]['parameters']['columns']['value']; v['metaTitulo']='={{ $json.metaTitulo }}'; v['metaDescripcion']='={{ $json.metaDescripcion }}'
c=N['Texto · Preparar fila']['parameters']['jsCode']
c=c.replace("texto: b.texto ?? '',","texto: b.texto ?? '', metaTitulo: b.metaTitulo ?? '', metaDescripcion: b.metaDescripcion ?? '',")
assert 'metaTitulo' in c; N['Texto · Preparar fila']['parameters']['jsCode']=c
# Nueva rama mova-iniciativas clonando la rama Hist
hist=[n for n in d['nodes'] if n['name'].startswith('Hist · ') or n['name'] in ('WH mova-sync-historico','Nota mova-sync-historico')]
ren=lambda x:x.replace('Hist · ','Inic · ').replace('WH mova-sync-historico','WH mova-iniciativas').replace('Nota mova-sync-historico','Nota mova-iniciativas')
dy=max(n['position'][1] for n in d['nodes'])+510-2550+ (2550-510)  # 2550+510
dy=3060-510
new=[]
for n in hist:
    m=json.loads(ren(json.dumps(n,ensure_ascii=False)))
    m['id']=str(uuid.uuid4()); m['position']=[m['position'][0],m['position'][1]+dy]
    if m['type'].endswith('webhook'):
        m['parameters']['path']='mova-iniciativas'; m['webhookId']=str(uuid.uuid4())
    new.append(m)
M={n['name']:n for n in new}
M['Nota mova-iniciativas']['parameters']['content']='## mova-iniciativas\nMatriz MOVA · hoja INICIATIVAS · solo cliente Paris'
M['Inic · Sheets tabs']['parameters']['url']='https://sheets.googleapis.com/v4/spreadsheets/1WkY6YA9wR2mB4p1KyX0zq96lGmep7sD8oiZg78kWpRk?fields=sheets.properties'
r=M.pop('Inic · Rango gid 1739267264'); r['name']='Inic · Rango INICIATIVAS'
r['parameters']['jsCode']="const ps = ($json.sheets || []).map(x => x.properties);\nconst s = ps.find(p => /iniciativ/i.test(p.title)) || ps[0];\nif (!s) return [{ json: { range: null } }];\nreturn [{ json: { range: `'${s.title.replace(/'/g, \"''\")}'!A:AZ` } }];"
M[r['name']]=r
M['Inic · Sheets valores']['parameters']['url']="={{ 'https://sheets.googleapis.com/v4/spreadsheets/1WkY6YA9wR2mB4p1KyX0zq96lGmep7sD8oiZg78kWpRk/values/' + encodeURIComponent($json.range || 'A1') }}"
M['Inic · Normalizar']['parameters']['jsCode']=open('inic_norm.js',encoding='utf-8').read()
d['nodes'].extend(M.values())
# conexiones
for k,v in list(d['connections'].items()):
    if k.startswith('Hist · ') or k=='WH mova-sync-historico':
        nv=json.loads(ren(json.dumps(v,ensure_ascii=False)).replace('Inic · Rango gid 1739267264','Inic · Rango INICIATIVAS'))
        d['connections'][ren(k).replace('Inic · Rango gid 1739267264','Inic · Rango INICIATIVAS')]=nv
d['name']='MOVA Portal Redactores · Paris (v4)'
d.pop('id',None); d['versionId']=str(uuid.uuid4())
# validar referencias $('...')
import re
names={n['name'] for n in d['nodes']}
for n in d['nodes']:
    for ref in re.findall(r"\$\('([^']+)'\)",json.dumps(n['parameters'],ensure_ascii=False)):
        assert ref in names,(n['name'],ref)
for k,v in d['connections'].items():
    assert k in names,k
    for outs in v['main']:
        for t in outs: assert t['node'] in names,t
# solapes: nodo 220x100 aprox; notas 80 de alto
box=[]
for n in d['nodes']:
    x,y=n['position']
    if n['type'].endswith('stickyNote'): w=n['parameters'].get('width',240);h=n['parameters'].get('height',80)
    else: w,h=200,100
    box.append((n['name'],x,y,w,h,n['type'].endswith('stickyNote')))
bad=[]
for i in range(len(box)):
    for j in range(i+1,len(box)):
        a,b=box[i],box[j]
        if a[1]<b[1]+b[3] and b[1]<a[1]+a[3] and a[2]<b[2]+b[4] and b[2]<a[2]+a[4]: bad.append((a[0],b[0]))
print('overlaps',bad)
json.dump(d,open('/workspace/portal-redactores/n8n/MOVA_Portal_Redactores_v4.json','w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
for n in d['nodes']:
    if n['type'].endswith('.code'):
        open('/tmp/nchk.js','w').write('(function(){'+n['parameters']['jsCode']+'\n})')
        import subprocess; r=subprocess.run(['node','--check','/tmp/nchk.js'],capture_output=True,text=True)
        if r.returncode: print('SYNTAX',n['name'],r.stderr[:300])
print(len(d['nodes']),'nodes')
