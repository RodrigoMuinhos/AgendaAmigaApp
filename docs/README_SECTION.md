# Nutrition module – backend foundation

1. **Feature flag**  
   Copy `apps/api/.env.example` para `.env` (ou adicione manualmente) e mantenha `NUTRITION_MODULE_ENABLED=false` até concluir as próximas fases.

2. **Migração Prisma**  
   ```bash
   npx prisma migrate deploy --schema apps/api/prisma/schema.prisma
   ```
   A migração apenas cria enums e tabelas novas (`nutrition_*`), sem alterações destrutivas.

3. **Seed opcional (catálogo de alimentos base)**  
   ```bash
   npx ts-node --project apps/api/tsconfig.build.json apps/api/prisma/seeds/seed-nutrition-food-items.ts
   ```

4. **Backfill opcional das configurações por criança**  
   ```bash
   npx ts-node --project apps/api/tsconfig.build.json apps/api/prisma/scripts/backfill-nutrition-feed-settings.ts
   ```

Próximos passos virão nas próximas seções: API (`/api/nutrition`) e UI (`children/:id/nutrition`). Mantenha a flag desligada até concluir todo o rollout.
