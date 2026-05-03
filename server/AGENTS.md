Read the shared project instructions first:

`../AGENTS.md`

Server-specific reminder:

- APIs belong in `src/modules/<feature>`.
- Shared cross-cutting code belongs in `src/common`.
- PostgreSQL persistence goes through `PrismaService` (see `src/database/`).
  Do not call Prisma directly from controllers — use a Nest service.
- Auth: short-lived access JWT in `Authorization: Bearer`, long-lived refresh
  in `HttpOnly Secure SameSite=Strict` cookie scoped to `/api/v1/auth`.
  Refresh tokens are random opaque, hashed with SHA-256 in DB, rotated on
  every refresh.
- Roles: `USER`, `ADMIN`, `SUPERADMIN`. Use `@Roles()` + `RolesGuard`.
- Superadmin is bootstrapped on app start from `SUPERADMIN_*` envs if no
  SUPERADMIN exists. Only SUPERADMIN can promote users to ADMIN.
- After editing `prisma/schema.prisma`, run `npm run prisma:generate`.
  For schema changes against the DB, run `npm run prisma:migrate`.
