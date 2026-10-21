import fs from 'node:fs';
import path from 'node:path';
const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
const notices = [];
const seen = new Set();
for (const [location, entry] of Object.entries(lock.packages)) {
  if (!location || entry.dev || !location.includes('node_modules/')) continue;
  const directory = path.resolve(location);
  if (!fs.existsSync(path.join(directory, 'package.json'))) continue;
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8'));
  const identity = `${manifest.name}@${manifest.version}`;
  if (seen.has(identity)) continue;
  seen.add(identity);
  const licenseFiles = fs.readdirSync(directory).filter(name => /^(licen[cs]e|copying|notice)(\.|$|-)/i.test(name) && fs.statSync(path.join(directory, name)).isFile());
  const text = licenseFiles.map(name => fs.readFileSync(path.join(directory, name), 'utf8')).join('\n\n');
  notices.push({ name: manifest.name, version: manifest.version, licence: manifest.license ?? entry.license ?? 'See package terms', text: text || 'No licence file bundled in this package. See the upstream package distribution for terms.', url: typeof manifest.repository === 'string' ? manifest.repository : manifest.repository?.url ?? '' });
}
notices.sort((a, b) => a.name.localeCompare(b.name));
fs.writeFileSync('src/features/settings/third-party-notices.json', JSON.stringify(notices));
console.log(`Generated ${notices.length} package notices; ${notices.filter(n => n.text.startsWith('No licence')).length} packages without bundled licence files.`);
