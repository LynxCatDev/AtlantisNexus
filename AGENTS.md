# Atlantis Nexus Agent Notes

This file is the shared project memory for Codex, Claude, and other coding
agents. Read it before changing either app.

## Project Shape

- `client/` is the Next.js App Router frontend.
- `server/` is the NestJS API backend with PostgreSQL (via Prisma).
- Frontend runs on `http://localhost:3000`.
- Backend runs on `http://127.0.0.1:4000`.
- Keep frontend route files thin. Put UI in `client/src/components`, static data in
  `client/src/constants`, and shared types in `client/src/types`.
- Keep backend APIs in feature modules under `server/src/modules/<feature>`.
- Keep `server/src/common` only for shared guards, decorators, filters, pipes,
  types, and utilities.
- Reuse existing components/helpers before adding new ones.
- Verify with `npm run build` in `client/` and/or `server/` for the app you
  changed.
- Use ASCII only in code, comments, and docs. Non-English text belongs only in
  `client/messages/*.json` locale files and article content.

## Product Rules

1. Admin access starts with only the owner's account. Signed-in admins can access
   `/admin`.
2. Admins can add articles and delete/remove comments. Articles must be stored in
   PostgreSQL (via Prisma).
3. Users have profile/settings data:
   - Required: email, nickname.
   - Optional: avatar.
4. All signups must be saved in PostgreSQL (via Prisma).
5. Supported locales for articles: `en` (default), `ru`, `ro`. Planned: `es`,
   `de`, `fr`. English is the default and required on every article. The
   backend stores per-locale title/excerpt/sections in `ArticleTranslation`.
   Use `next-intl` for frontend internationalization.
6. A superadmin can grant admin permission to other users, for example the
   owner's wife.
7. Main categories are `dev`, `ai`, `gaming`, `movies`, `tech` (slugs). They
   are seeded on boot and cannot be edited or deleted via the API.
8. SUPERADMIN can add extra categories (`isMain: false`). Extra categories must
   not collide with main slugs. Extras are not top-level nav items; the
   frontend renders them in a dropdown placed between `Dev` and `Tools`.
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
  articles, comments, reactions, and categories in PostgreSQL (via Prisma).
- Design articles so they can support localization.
- Design user avatars and article images so they can later use server-side file
  storage or object storage without rewriting the API contract.

## Frontend Direction

- Use `next-intl` when internationalization is added.
- Keep English as the default/main locale.
- Plan for admin pages under `/admin`.
- Replace the current get-started route with `/signup` when auth work begins.
- Keep public content readable without requiring signup.
- Use `px` for every CSS length, spacing, radius, typography, and breakpoint
  value. Do not use root-relative or font-relative length units.
- Do not use CSS `clamp()` in SCSS for font sizes or layout sizing. Use explicit
  `px` values, with media-query overrides when a breakpoint needs a different
  size. `-webkit-line-clamp` is allowed for text truncation. Existing `clamp()`
  usages (e.g. `AboutPage.scss`, `Admin.scss`) should be converted when those
  files are touched.
- Page motion: use the animation mixins from `client/src/app/mixins.scss`.
  Use `fade-in-down` for hero/page-intro sections and `fade-in-up` or
  `fade-in-left` for cards, grids, and supporting sections. When creating or
  heavily restyling a route-level SCSS file, add subtle animation to the main
  sections unless there is a clear performance/accessibility reason not to. Do
  not animate only the page wrapper while leaving the main surface static.
- **Translations are mandatory for every user-visible label.** When adding or
  renaming a category, nav item, filter chip, button, footer link, or any other
  text the user sees, update **every** locale file in `client/messages/`
  (`en.json`, `ro.json`, `ru.json`, and any future locales) in the same change.
  Also extend any whitelist that gates which translation namespace a key resolves
  to (e.g. `Footer.tsx`'s `resolveLinkLabel`). Missing keys throw
  `IntlError: MISSING_MESSAGE` at runtime.
- **Categories are referenced in multiple places.** When adding a main
  category, update all of: backend `MAIN_CATEGORIES` seed, `ArticleCategory`
  union in `client/src/types/content.ts`, `articleCategories` +
  `articleCategorySlugs` in `client/src/constants/articles.ts`,
  `mainNavigation` + `footerLinkGroups` in `client/src/constants/navigation.ts`,
  and the `nav.*` + `categories.*` keys in every locale file.

## Current Design Direction

- The visual reference is `https://apex-weave-lab.lovable.app`.
- Keep the dark premium media-hub style: restrained cards, cyan/violet accents,
  soft borders, and smooth hover states.
- Home `/` is the product hub page. `/articles` is the article/library page.
- Article detail pages live under `/article/[slug]`.
- Article cards should hover like the Lovable reference: border brightens, image
  subtly zooms, title shifts to primary blue, with no heavy lift.
- The home hero `Browse tools` action should be dark glass by default and violet
  on hover.
- The home feature cards use icons, not text badges:
  - Gaming: gamepad
  - AI: brain
  - Dev: code
- The article detail sidebar uses a `1536px` page container with a `280px`
  desktop sidebar so its right edge aligns with the header actions.

## SEO

- One query, one URL: never create a route/category page and an article that
  target the same search intent. Intent is the user's goal, not the title's
  wording. Before adding a new article or route, check existing articles,
  `client/src/app/**/page.tsx` metadata, and the sitemap for the same intent;
  if one exists, strengthen that URL instead of duplicating it.
- Keep rendered title tags between 30 and 65 characters for indexable pages
  where practical. Avoid titles under 30 characters except fallback/not-found
  states.
- The article published date is the source of truth for recency/sorting. Set a
  modified date only for real updates.
- No redirect URLs in the sitemap.
- Add internal links between related articles and categories.
- When an SEO audit reports a missing URL, do not add a redirect route just to
  make the audit green. Find the source link first; if it is wrong, point it at
  the real canonical page. If no canonical page exists, ask before adding a
  route or redirect.

## Generated Images

- Save every generated raster asset as WebP (`.webp`). Do not generate PNG
  unless the user explicitly requests it.
- Generate at the highest available quality and detail. Inspect the
  native-resolution result before replacing a project asset.

## Architecture Decisions

- Use the global `$architecture-advisor` skill for architecture design and
  review when it is available.
- Work from actors and workflows to measurable quality attributes and
  constraints before selecting infrastructure.
- Default to the existing modular monolith (Next.js client + NestJS feature
  modules + PostgreSQL). Add distributed components only when a measured
  driver and an explicit revisit trigger justify them.

## TokenSave

- The index lives in `.tokensave/` (`config.json` is committed, `*.db` is
  ignored). The CLI is not on PATH:
  `C:\Users\Theodore\scoop\apps\tokensave\tokensave.exe`.
- Do not rerun `tokensave init`; it resets `.tokensave/config.json` to defaults
  and drops the project excludes. Use `tokensave sync` (`--force` for a full
  re-index).
- The TokenSave MCP server is shared with other projects (e.g. IP-Tracker). If
  a result warns that it comes from a different worktree, pass
  `graph_root: "F:\\Github Repository Projects\\AtlantisNexus"` or restart the
  MCP server from this folder.
- Start code research with the narrowest TokenSave query that can answer it:
  `tokensave_search`, then `tokensave_node`, `tokensave_callers`,
  `tokensave_callees`, or `tokensave_impact`.
- Use `tokensave_context` only when the task genuinely spans several symbols.
  Start with at most 10 nodes and 3 code blocks; expand only when a named gap
  remains.
- Read files directly only after TokenSave identifies the exact file and symbol.
  Read the smallest useful line range, and never dump whole files for context.
- After commits, merges, rebases, or large working-tree changes, run
  `tokensave sync --doctor` before further code research.
- Do not repeat TokenSave output in commentary. Report only the conclusion and
  the files or symbols that support it.

## Agent Efficiency

- When TokenSave MCP tools are available, use them before broad file scans for
  codebase context, symbol search, callers, callees, and impact analysis. Fall
  back to `rg` and direct file reads when TokenSave cannot answer the question.
- Be terse. No trailing summaries of what changed. One-line answers when one
  line suffices.
- Do not repeat file contents or paste long code unless asked.
- Read only the files needed for the current task; never read full
  directories. Skip `node_modules`, `.next`, `dist`, build output, lockfiles,
  and generated token-save databases.
- Prefer precise file paths, short diffs, and verification results over long
  summaries.
