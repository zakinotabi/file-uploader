import { prisma } from './lib/prisma.js';

async function main() {}

main()
  .catch((e) => {
    console.log(e.messages);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
