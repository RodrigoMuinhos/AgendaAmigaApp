# Agenda Amiga

Monorepo que reúne a API em Spring Boot, o pacote compartilhado de domínio e o front-end em Next.js (Pages Router) da Agenda Amiga.

## Requisitos locais
- Node.js 20+
- npm 11+
- Java 21 (JDK completa)
- Maven 3.9+

## Estrutura do monorepo
- `packages/shared`: domínios e contratos TypeScript usados em backend e frontend.
- `apps/api-spring`: nova API em Java + Spring Boot que consome Neon/Postgres.
- `apps/frontend`: front-end em Next.js que reutiliza os serviços e o layout existentes (pages router).

## Rodando localmente

### Backend Spring Boot
1. Configure as variáveis disponíveis em `.env` (já aponta para o Neon e inclui os `NEXT_PUBLIC_*`).
2. Inicie o backend:
   ```bash
   cd apps/api-spring
   mvn spring-boot:run
   ```
   O servidor responde em `http://localhost:3001` (lembre de manter o Next na porta 3000 e apontar os `NEXT_PUBLIC_*` para essa URL).
3. Para gerar o jar pronto:
   ```bash
   mvn -f apps/api-spring/pom.xml -DskipTests package
   ```

### Frontend
1. Instale as dependências e rode o Next.js:
   ```bash
   cd apps/frontend
   npm install
   npm run dev
   ```
   O frontend estará em `http://localhost:3000` e usa `NEXT_PUBLIC_API_URL` para conversar com o backend e ativar os mocks em desenvolvimento.

### Camada compartilhada
- Sempre rode `npm run shared:build` (ou `npm run build`) antes de testar o frontend ou o backend que depende de `packages/shared`.

## Variáveis de ambiente
O `.env` na raiz define o `DATABASE_URL`, a `JWT_SECRET` local e todos os `NEXT_PUBLIC_*` necessários ao frontend (API base, logout e flags). Você pode adaptá-lo para outros ambientes, mas preserve `AUTH_PASSWORD_RESET_TTL`, `FRONTEND_ORIGIN` e `NEXT_PUBLIC_AUTH_DISABLED`.

## Observações
- Não há mais suporte a Docker no fluxo principal; as instruções acima usam apenas Maven para o backend e Next.js para o frontend.
- A API expõe `/api/auth`, `/api/familias`, `/api/criancas`, `/api/tratamentos` e `/health`, obedecendo ao contrato consumido pelo frontend.
