import re,subprocess,sys
s=open(sys.argv[1],encoding='utf-8').read()
def js(m):
    code=m.group(1)
    open('/tmp/in.js','w',encoding='utf-8').write(code)
    r=subprocess.run(['/home/box/.local/bin/terser','/tmp/in.js','-c','-m','--ecma','2020'],capture_output=True,text=True)
    assert r.returncode==0,r.stderr
    return '<script>'+r.stdout.strip().replace('</script','<\\/script')+'</script>'
s=re.sub(r'<script>([\s\S]*?)</script>',js,s)
def css(m):
    open('/tmp/in.css','w',encoding='utf-8').write(m.group(1))
    r=subprocess.run(['/home/box/.local/bin/csso','/tmp/in.css','--no-restructure'],capture_output=True,text=True)
    assert r.returncode==0,r.stderr
    return '<style>'+r.stdout.strip()+'</style>'
s=re.sub(r'<style>([\s\S]*?)</style>',css,s)
s=re.sub(r'<!--(?!\[)[\s\S]*?-->','',s)
s=re.sub(r'>\s+<','> <',s)
s=re.sub(r'\n\s*',' ',s)
open(sys.argv[2],'w',encoding='utf-8').write(s)
