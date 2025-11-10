-- CreateTable
CREATE TABLE "usuarios" (
  "id" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "senha_hash" TEXT NOT NULL,
  "responsavel_nome" TEXT NOT NULL,
  "responsavel_parentesco" TEXT,
  "responsavel_telefone" TEXT,
  "responsavel_cpf" TEXT,
  "criado_em" TIMESTAMPTZ(6) DEFAULT NOW(),
  CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios" ("email");

-- Seed default tutor to keep legacy data functioning
INSERT INTO "usuarios" (
  "id",
  "nome",
  "email",
  "senha_hash",
  "responsavel_nome",
  "responsavel_parentesco",
  "responsavel_telefone",
  "responsavel_cpf"
)
VALUES (
  'demo-tutor',
  'Responsavel Demo',
  'demo@agendaamiga.local',
  '$2b$10$J8Wc1Kqz5uWJ2gE3obBOUOjlYvA3S7l1Yf1gC5y5e8w7d9Y6aQjRe',
  'Responsavel Demo',
  NULL,
  NULL,
  NULL
)
ON CONFLICT ("id") DO NOTHING;

-- AddForeignKey
ALTER TABLE "criancas"
ADD CONSTRAINT "criancas_tutor_id_fkey"
FOREIGN KEY ("tutor_id")
REFERENCES "usuarios" ("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
