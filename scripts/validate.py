from pathlib import Path
import json
import subprocess

required = [
    'index.html', 'src/app.js', 'src/styles.css', 'src/core/store.js',
    'src/core/permissions.js', 'src/modules/renderers.js', 'src/data/seed.js',
    'db/schema.sql', 'README.md', 'public/manifest.webmanifest'
]
missing = [p for p in required if not Path(p).exists()]
if missing:
    raise SystemExit(f'Missing files: {missing}')

html = Path('index.html').read_text()
if 'type="module" src="/src/app.js"' not in html or 'src/styles.css' not in html:
    raise SystemExit('index.html must load the module app and stylesheet')

schema = Path('db/schema.sql').read_text()
for table in ['users','condominiums','units','residents','tickets','reservations','visitors','packages','documents','audit_logs','ai_document_chunks']:
    if f'create table {table}' not in schema:
        raise SystemExit(f'Missing table {table}')

manifest = json.loads(Path('public/manifest.webmanifest').read_text())
for key in ['name', 'short_name', 'start_url', 'display', 'theme_color']:
    if key not in manifest:
        raise SystemExit(f'Manifest missing {key}')

for js_file in ['src/app.js', 'src/core/store.js', 'src/core/permissions.js', 'src/modules/renderers.js', 'src/data/seed.js']:
    subprocess.run(['node', '--check', js_file], check=True)

print('CondoFlow validation passed: files, schema, manifest and JavaScript syntax are valid')
