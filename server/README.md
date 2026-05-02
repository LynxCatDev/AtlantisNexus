# Atlantis Nexus Server

NestJS API server for Atlantis Nexus, backed by PostgreSQL.

## Architecture

```text
src/
  main.ts              Nest bootstrap
  app.module.ts        Root composition module
  common/              Shared types and utilities
  config/              Environment config mapping
  database/            PostgreSQL/TypeORM infrastructure
  modules/             Feature modules
    app/               Root API status endpoint
    health/            API and database health endpoints
```

Feature work should go in `src/modules/<feature>`. Database wiring should stay in
`src/database`, and cross-cutting helpers should stay in `src/common`.

## Setup

Install dependencies:

```powershell
cd "F:\Github Repository Projects\AtlantisNexus\server"
npm.cmd install
```

Create the local `.env` file if it does not exist:

```powershell
Copy-Item .env.example .env
```

PostgreSQL is expected at `localhost:5432`. If `psql` is not recognized, add this folder to your Windows user `Path`, then reopen PowerShell:

```text
F:\PostgreSQL\bin
```

Create the local database:

```powershell
psql -h localhost -U postgres
```

Then inside `psql`:

```sql
CREATE USER atlantis WITH PASSWORD '14595';
CREATE DATABASE atlantis_nexus OWNER atlantis;
\q
```

If the user already exists:

```sql
ALTER USER atlantis WITH PASSWORD '14595';
CREATE DATABASE atlantis_nexus OWNER atlantis;
\q
```

## Run

```powershell
npm.cmd run start:dev
```

Alias:

```powershell
npm.cmd run dev
```

Open:

- API: `http://127.0.0.1:4000`
- Health: `http://127.0.0.1:4000/api/v1/health`
- Database health: `http://127.0.0.1:4000/api/v1/health/db`

## Scripts

```powershell
npm.cmd run start:dev
npm.cmd run build
npm.cmd run lint
```
