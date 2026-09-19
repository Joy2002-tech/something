import json, os, urllib.request
from pathlib import Path

url = os.environ.get('IPO_FEED_URL')
if not url:
    raise SystemExit('Set IPO_FEED_URL to a permitted/licensed JSON feed that returns the Igris schema.')

req = urllib.request.Request(url, headers={'User-Agent': 'IgrisCapital-IPO-Watch/1.0'})
with urllib.request.urlopen(req, timeout=20) as r:
    data = json.load(r)

required = ['meta', 'mainboard', 'sme', 'performance', 'unlisted']
missing = [k for k in required if k not in data]
if missing:
    raise SystemExit(f'Missing fields in feed: {missing}')

Path('ipo-data.json').write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
print('Updated ipo-data.json')
