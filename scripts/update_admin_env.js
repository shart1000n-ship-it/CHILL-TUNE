/* Ensure DATABASE_URL and ADMIN_EMAILS contain the temp admin */
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');

function parseEnv(content) {
  const map = new Map();
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) map.set(m[1], m[2]);
  }
  return map;
}

function serializeEnv(map) {
  return Array.from(map.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
}

function main() {
  let current = '';
  try { current = fs.readFileSync(envPath, 'utf8'); } catch {}
  const envMap = parseEnv(current);

  if (!envMap.has('DATABASE_URL')) {
    envMap.set('DATABASE_URL', 'file:./prisma/dev.db');
  }

  const adminEmail = 'admin@chillandtune.fm';
  const existing = envMap.get('ADMIN_EMAILS');
  if (!existing) {
    envMap.set('ADMIN_EMAILS', adminEmail);
  } else {
    const arr = existing.split(',').map((s) => s.trim()).filter(Boolean);
    if (!arr.includes(adminEmail)) arr.push(adminEmail);
    envMap.set('ADMIN_EMAILS', arr.join(','));
  }

  const updated = serializeEnv(envMap);
  fs.writeFileSync(envPath, updated);
  // eslint-disable-next-line no-console
  console.log('Updated .env.local with admin and database URL');
}

main();


