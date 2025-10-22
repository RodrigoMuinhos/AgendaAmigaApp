import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const children = await prisma.pacientes.findMany({
    select: { id: true },
  });

  for (const child of children) {
    await prisma.nutritionFeedSettings.upsert({
      where: { childId: child.id },
      create: {
        childId: child.id,
        honeyAlertEnabled: true,
        sugarAlertEnabled: true,
      },
      update: {},
    });
  }
}

main()
  .then(() => {
    console.info(`Backfill completed for ${new Date().toISOString()}`);
  })
  .catch((error) => {
    console.error('Failed to backfill nutrition feed settings', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
