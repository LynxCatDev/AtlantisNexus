# Atlantis Nexus Agent Notes

This file is the shared project memory for Codex, Claude, and other coding
agents. Read it before changing either app.

## Project Shape

- `client/` is the Next.js App Router frontend.
- `server/` is the NestJS API backend with PostgreSQL.
- Frontend runs on `http://localhost:3000`.
- Backend runs on `http://127.0.0.1:4000`.
- Keep frontend route files thin. Put UI in `client/src/components`, static data in
  `client/src/constants`, and shared types in `client/src/types`.
- Keep backend APIs in feature modules under `server/src/modules/<feature>`.
- Keep `server/src/common` only for shared guards, decorators, filters, pipes,
  types, and utilities.

## Product Rules

1. Admin access starts with only the owner's account. Signed-in admins can access
   `/admin`.
2. Admins can add articles and delete/remove comments. Articles must be stored in
   PostgreSQL.
3. Users have profile/settings data:
   - Required: email, nickname.
   - Optional: avatar, date of birth.
4. All signups must be saved in PostgreSQL.
5. The first languages are English as the main language, Russian, and Romanian.
   Use `next-intl` for frontend internationalization.
6. A superadmin can grant admin permission to other users, for example the
   owner's wife.
7. Main categories are `Dev`, `Gaming`, and `AI`.
8. Admins can add extra categories. Extra categories are not main navigation
   items. If extra categories exist, show them in a separate navigation dropdown.
9. Prefer `/signup` instead of `/get-started`.
10. Anonymous browsing should stay possible. Signup is required only for account
    features such as profile, reactions, and admin access.
11. Users can react to content with likes/emotions:
    - applause
    - funny
    - heart
    - fire

## Backend Direction

- Use role-based authorization with roles such as `USER`, `ADMIN`, and
  `SUPERADMIN`.
- Do not hard-code long-term permissions in controllers. Store users, roles,
  articles, comments, reactions, and categories in PostgreSQL.
- Design articles so they can support localization.
- Design user avatars and article images so they can later use server-side file
  storage or object storage without rewriting the API contract.

## Frontend Direction

- Use `next-intl` when internationalization is added.
- Keep English as the default/main locale.
- Plan for admin pages under `/admin`.
- Replace the current get-started route with `/signup` when auth work begins.
- Keep public content readable without requiring signup.
