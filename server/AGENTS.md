Read the shared project instructions first:

`../AGENTS.md`

Server-specific reminder:

- APIs belong in `src/modules/<feature>`.
- Shared cross-cutting code belongs in `src/common`.
- PostgreSQL persistence belongs behind Nest services/repositories, not directly
  in controllers.
