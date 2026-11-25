import json,glob,statistics as st,sys
d=sys.argv[1]
rows=[]
for f in sorted(glob.glob(d+'/*.report.json')):
    j=json.load(open(f,encoding='utf-8')); a=j['audits']; c=j['categories']
    r=dict(f=f.split('/')[-1].replace('.report.json',''),perf=round(c['performance']['score']*100),fcp=round(a['first-contentful-paint']['numericValue']),lcp=round(a['largest-contentful-paint']['numericValue']),tbt=round(a['total-blocking-time']['numericValue']),cls=round(a['cumulative-layout-shift']['numericValue'],4),si=round(a['speed-index']['numericValue']),tti=round(a['interactive']['numericValue']),kb=round(a['total-byte-weight']['numericValue']/1024),boot=round(a['bootup-time']['numericValue']),mt=round(a['mainthread-work-breakdown']['numericValue']))
    rows.append(r); print(r)
for grp in ['dev-mobile','prodlike-mobile']:
    g=[r for r in rows if grp in r['f']]
    if g: print('MEDIAN',grp,{k:st.median([r[k] for r in g]) for k in ['perf','fcp','lcp','tbt','cls','si','kb','mt']})
