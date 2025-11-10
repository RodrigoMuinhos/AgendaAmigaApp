### Testes
- Rodar testes: \\
pm run test -w @agenda-amiga/api\\
- Modo watch: \\
pm run test:watch -w @agenda-amiga/api\\
- Cobertura: \\
pm run test:cov -w @agenda-amiga/api\\

### Build do pacote compartilhado
- \\
pm run build -w @agenda-amiga/shared\\

### Docker
- Build localmente: \\
docker build -f apps/api/Dockerfile . --target production
- Dev com Docker Compose (usa o alvo `development` e monta o monorepo inteiro): \\
docker compose up api

