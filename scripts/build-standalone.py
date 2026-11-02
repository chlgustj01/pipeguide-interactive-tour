"""Build a double-clickable presentation with no companion JS/HTML files."""
from pathlib import Path
import json
root = Path(__file__).resolve().parent.parent
presentation = (root / 'presentation.html').read_text()
app = (root / 'program.html').read_text().replace('parent.PGPresentation', 'window.PGPresentation')
bridge = (root / 'live-app-bridge.js').read_text()
head, tail = app.rsplit('</body>', 1)
app = head + '<script>\n' + (root / 'pacing.js').read_text() + '\n' + bridge + '\n</script>\n</body>' + tail
payload = '<script type="application/json" id="pg-embedded-program">' + json.dumps(app, ensure_ascii=False).replace('<', '\\u003c') + '</script>'
presentation = presentation.replace('<link rel="stylesheet" href="guided-presentation.css">', '<style>\n' + (root / 'guided-presentation.css').read_text() + '\n</style>\n' + payload)
# Font fallback makes the standalone presentation independent of network access.
presentation = presentation.replace('<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">', '')
import re
for name in ['pacing.js', 'presentation-bridge.js', 'guided-tour.js']:
    presentation = re.sub(r'<script src="' + re.escape(name) + r'"[^>]*></script>', lambda _: '<script>\n' + (root / name).read_text() + '\n</script>', presentation)
output = root / 'PipeGuide-Guided-Live.html'
output.write_text(presentation)
print(f'{output.name}: {output.stat().st_size} bytes')
