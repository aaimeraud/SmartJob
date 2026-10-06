# Contexte inter-agents

Lire ce fichier avant toute intervention. Le mettre à jour à la fin de chaque session, après validation des changements.

```toon
project: smart-job
branch: feature/auth-roles
status: in_progress
last_session:
  date: 2026-10-06
  feature: "Auth + rôles: base backend et PostgreSQL local"
  done[12]: "Next.js 16.3.8 scaffold","Prisma 7.10 PostgreSQL schema","Better Auth config","Auth route /api/auth/[...all]","Zod sign-up schema","Vitest tests","Prisma client generation","Next.js production build","Docker Compose PostgreSQL","Prisma migration init_auth_roles","Live sign-up success check","Live invalid/unauthorized checks"
  tests: "npm test: 2 passed; npm run db:generate: passed; npm run db:migrate: passed; npm run build: passed; live API: 200/400/401 verified"
  commit: "pending: Docker + migration + prompt stack update"
  files[7]: "docker-compose.yml","prisma/migrations/20261006182220_init_auth_roles/migration.sql","prisma.config.ts","prompt.toon","prompt.json","AGENTS.md","README.md"
current:
  feature: "1. Auth + roles"
  phase: "Backend validated; frontend not started"
  blockers[1]: "Human approval required before continuing"
next[4]: "Add role-protected application route/action and forbidden test","Implement auth frontend","Run Playwright + definition_of_done checks","Stop and request human validation"
rules[4]: "One feature per feature/<name> branch","Follow Conventional Commits","Do not start frontend before backend tests and live validation pass","Update this file after every session"
history:
  - date: 2026-10-06
    result: "Project initialized; Docker PostgreSQL migration and live Better Auth checks verified"
```
