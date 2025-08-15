/* Create or update a temporary admin user */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function main() {
  const prisma = new PrismaClient();
  const email = process.env.ADMIN_EMAIL || 'admin@chillandtune.fm';
  const password = process.env.ADMIN_PASSWORD || 'Temp12345!';
  const username = process.env.ADMIN_USERNAME || 'admin';

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: { hashedPassword: hashed, username, name: 'Admin' },
    create: { email, username, name: 'Admin', hashedPassword: hashed },
  });
  // eslint-disable-next-line no-console
  console.log('Admin user ready:', email);
  await prisma.$disconnect();
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});


