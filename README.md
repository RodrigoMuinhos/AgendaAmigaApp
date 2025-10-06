# Agenda Amiga

Monorepo que agrupa a API Express e o pacote compartilhado de dominio usados pelo projeto Agenda Amiga.

## Requisitos locais
- Node.js 18+
- npm 9+
- Docker e Docker Compose (para os cenarios descritos abaixo)

## Estrutura do monorepo
- `packages/shared`: dominio e contratos em TypeScript
- `apps/api`: API HTTP Express em Node.js
- `apps/frontend`: front-end demonstrativo (React/Vite)

## Scripts principais
- `npm run build` compila `@agenda-amiga/shared` e, em seguida, `@agenda-amiga/api`
- `npm run dev:api` roda a API em modo desenvolvimento com hot reload (nodemon + ts-node)
- `npm run start:api` executa a API a partir do build gerado em `apps/api/dist`

## Desenvolvimento com Docker
1. Construa e inicie o container de desenvolvimento (hot reload + volumes):
   ```bash
   docker compose -f docker-compose.dev.yml up --build
   ```
2. O `nodemon` dentro do container observa `apps/api/src` e `packages/shared/src`. Alteracoes reiniciam a API automaticamente.
3. O volume nomeado preserva os `node_modules` dentro do container, evitando re-instalacoes a cada rebuild.
4. O servidor respondera em `http://localhost:3000`.

## Execucao para producao local
1. Gere a imagem pronta para producao:
   ```bash
   docker compose build
   ```
2. Suba o container utilizando o target `production` do Dockerfile multi-stage:
   ```bash
   docker compose up -d
   ```
3. Para atualizar a imagem no Docker Hub manualmente:
   ```bash
   docker build --target production -t docker.io/<seu_usuario>/agenda-amiga:latest .
   docker push docker.io/<seu_usuario>/agenda-amiga:latest
   ```

## CI/CD com GitHub Actions
O workflow `Build and Push Docker Image` (`.github/workflows/docker-build.yml`) executa em pushes para `main`:
- Efetua checkout do repositorio
- Configura Docker Buildx com cache `type=gha`
- Realiza login no Docker Hub usando `secrets.DOCKERHUB_USERNAME` e `secrets.DOCKERHUB_TOKEN`
- Gera a imagem a partir do target `production`
- Publica as tags `latest` e o SHA do commit (`docker.io/<usuario>/agenda-amiga:<sha>`)

## Variaveis de ambiente relevantes
A API utiliza variaveis carregadas via `dotenv`. Ajuste um arquivo `.env` (ou injete pelo Compose) com as chaves esperadas em `apps/api/src/config`.

## Fluxo manual sem Docker
1. Instale dependencias: `npm install`
2. Construa shared + api: `npm run build`
3. Rode a API: `npm run start:api`
4. Para desenvolvimento continuo: `npm run dev:api`

## Dominios e casos de uso disponiveis
A camada compartilhada exposta em `@agenda-amiga/shared` inclui:
- Value Objects: `Email`, `SenhaHash`, `NumeroCarteirinha`, `DoseHorario`, `UnidadeDosagem`, `Periodo`, `TokenShare`, `Adesao`
- Entidades/Aggregates: `Paciente`, `PlanoSaude`, `Medicamento`, `EsquemaDose`, `DoseLog`, `Consulta`, `Documento`, `ShareLink`
- Events/Specifications: `DoseConfirmada`, `EsquemaDeDoseAlterado`, `ShareLinkGerado`, `ShareLinkAcessado`
- Repositorios/Gateways: `PacienteRepository`, `MedicamentoRepository`, `DoseLogRepository`, `ConsultaRepository`, `DocumentoRepository`, `ShareLinkRepository`, `Clock`
- Casos de uso: `ListarPacientesPorTutor`, `ConfirmarTomadaDose`, `AlterarEsquemaDose`, `GerarShareLink`

A API injeta essas dependencias e expoe rotas REST (ex.: `/health`, `/tutores/:tutorId/pacientes`, `/share-links`). O front-end Vite consome essas rotas para demonstrar o fluxo ponta a ponta.
