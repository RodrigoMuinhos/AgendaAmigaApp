const { PrismaClient } = require("@prisma/client");

(async () => {
  const p = new PrismaClient();
  try {
    // CAST pra text para o Prisma não reclamar do tipo regclass
    const r1 = await p.$queryRawUnsafe("SELECT to_regclass('app.criancas')::text AS t");
    console.log("to_regclass (app.criancas):", r1);

    const r2 = await p.$queryRawUnsafe("SHOW search_path");
    console.log("search_path:", r2);
  } catch (e) {
    console.error(e);
  } finally {
    await p.$disconnect();
  }
})();
