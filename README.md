# Atlantis Nexus

Atlantis Nexus is split into two apps:

```text
client/   Next.js App Router frontend
server/   NestJS API server (PostgreSQL via Prisma)
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
server/
  prisma/schema.prisma   Database schema (User, Article, Comment, Reaction, ...)
  src/
    main.ts              Bootstrap + global pipes/CORS/cookie-parser
    app.module.ts        Root module composition
    common/              Shared guards, decorators, types, utils
    config/              Environment config mapping
    database/            PrismaService (global)
    modules/             Feature modules
      auth/              register/login/refresh/session/logout
      users/             /users/me, role management (SUPERADMIN)
      categories/        Main + extra categories (writes SUPERADMIN)
      articles/          CRUD + per-locale translations (writes ADMIN/SUPERADMIN)
      comments/          /articles/:slug/comments
      reactions/         /articles/:slug/reactions
      health/            /health, /health/db
```

## Run

Frontend:

```powershell
cd "F:\Github Repository Projects\AtlantisNexus\client"
npm.cmd run dev
```

Backend (one-time setup):

```powershell
cd "F:\Github Repository Projects\AtlantisNexus\server"
npm.cmd install
npm.cmd run prisma:generate
npm.cmd run prisma:migrate -- --name init
```

Backend dev:

```powershell
cd "F:\Github Repository Projects\AtlantisNexus\server"
npm.cmd run start:dev
```

On first boot, the server creates the SUPERADMIN account from `.env`
(`SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD`, `SUPERADMIN_NICKNAME`).

## API surface

Public:

- `GET  /` -> root health
- `GET  /api/v1/health`
- `GET  /api/v1/health/db`
- `GET  /api/v1/categories`
- `GET  /api/v1/articles?locale=en|ru|ro|es|de|fr`
- `GET  /api/v1/articles/:slug?locale=...`
- `GET  /api/v1/articles/:slug/comments`
- `GET  /api/v1/articles/:slug/reactions`

Auth:

- `POST   /api/v1/auth/register`
- `POST   /api/v1/auth/login`
- `POST   /api/v1/auth/refresh`
- `GET    /api/v1/auth/session`     (Bearer)
- `POST   /api/v1/auth/logout`

Authenticated user:

- `GET    /api/v1/users/me`                          (Bearer)
- `POST   /api/v1/articles/:slug/comments`           (Bearer)
- `POST   /api/v1/articles/:slug/reactions`          (Bearer, body: `{ "type": "applause"|"funny"|"heart"|"fire" }`)

Admin / superadmin:

- `POST   /api/v1/categories`                        (SUPERADMIN; extras only, slug must not collide with `dev`/`ai`/`gaming`)
- `PATCH  /api/v1/categories/:slug`                  (SUPERADMIN; main categories are locked)
- `DELETE /api/v1/categories/:slug`                  (SUPERADMIN; main categories locked, fails if articles still reference it)
- `POST   /api/v1/articles`                          (ADMIN/SUPERADMIN; body must include at least the `en` translation)
- `PATCH  /api/v1/articles/:slug`                    (ADMIN/SUPERADMIN; partial update; nested `translations[]` upserts each locale)
- `DELETE /api/v1/articles/:slug`                    (ADMIN/SUPERADMIN)
- `PUT    /api/v1/articles/:slug/translations/:locale` (ADMIN/SUPERADMIN; locale ∈ en/ru/ro/es/de/fr)
- `DELETE /api/v1/articles/:slug/translations/:locale` (ADMIN/SUPERADMIN; cannot delete `en`)
- `DELETE /api/v1/comments/:id`                      (ADMIN/SUPERADMIN)
- `GET    /api/v1/users`                             (ADMIN/SUPERADMIN)
- `PATCH  /api/v1/users/:id/role`                    (SUPERADMIN; body: `{ "role": "USER"|"ADMIN" }`)

## Auth model

- Access token: signed JWT, short-lived (default 15m), sent as `Authorization: Bearer <token>`.
- Refresh token: random 64-byte opaque token, stored as SHA-256 hash in
  `RefreshToken`. Delivered via `HttpOnly Secure SameSite=Strict` cookie scoped
  to `/api/v1/auth`. Rotated on every `/auth/refresh`. Revoked on `/auth/logout`.
