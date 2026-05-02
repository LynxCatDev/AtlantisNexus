# Atlantis Nexus Client

Next.js App Router frontend for Atlantis Nexus.

## Architecture

```text
src/
  app/                 Route files only
  components/          Reusable UI grouped by component
  constants/           Static app data and navigation data
  types/               Shared TypeScript content/UI types
```

Route files should stay thin. Put real UI in `src/components`, and put static data in
`src/constants`.

Current routes:

- `/` -> Nexus Hub home page
- `/articles` -> articles/blog library page
- `/article/[slug]` -> article detail page
- `/signup` -> account creation page
- `/get-started` -> redirects to `/signup`

## Run

```powershell
npm.cmd run dev
```

Open:

```text
http://localhost:3000
```
