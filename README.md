# Atlantis Nexus

Atlantis Nexus is split into two apps:

```text
client/   Next.js App Router frontend
server/   NestJS API server with PostgreSQL
```

## Architecture

The frontend keeps route files thin and moves real UI into reusable component
folders:

```text
client/src/
  app/          Routes only
  components/   UI grouped by feature/component
  constants/    Static app data
  types/        Shared TypeScript types
```

The backend follows a modular NestJS layout:

```text
server/src/
  main.ts       Bootstrap and global app setup
  app.module.ts Root module composition
  common/       Shared types and utilities
  config/       Environment config mapping
  database/     PostgreSQL/TypeORM infrastructure
  modules/      Feature modules
```

## Run

Frontend:

```powershell
cd "F:\Github Repository Projects\AtlantisNexus\client"
npm.cmd run dev
```

Backend:

```powershell
cd "F:\Github Repository Projects\AtlantisNexus\server"
npm.cmd run start:dev
```

Backend URLs:

- `http://127.0.0.1:4000`
- `http://127.0.0.1:4000/api/v1/health`
- `http://127.0.0.1:4000/api/v1/health/db`

Frontend routes:

- `/` -> Nexus Hub home page
- `/articles` -> articles/blog library page
- `/article/[slug]` -> article detail page
- `/signup` -> account creation page
