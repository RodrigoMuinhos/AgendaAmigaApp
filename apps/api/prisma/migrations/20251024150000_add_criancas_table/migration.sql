-- CreateTable
CREATE TABLE IF NOT EXISTS "criancas" (
    "id" TEXT PRIMARY KEY,
    "tutor_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "nascimento_iso" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "atualizado_em" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_criancas_tutor" ON "criancas" ("tutor_id", "criado_em");
