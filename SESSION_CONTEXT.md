# Contexte inter-agents

Lire ce fichier avant toute intervention. Le mettre à jour à la fin de chaque session, après validation des changements.

```toon
project: smart-job
branch: feature/auth-roles
status: in_progress
last_session:
  date: 2026-10-06
  feature: "Initialisation + backend Auth et rôles"
  done[8]: "Next.js 16.3.8 scaffold","Prisma 7.10 PostgreSQL schema","Better Auth config","Auth route /api/auth/[...all]","Zod sign-up schema","Vitest tests","Prisma client generation","Next.js production build"
  tests: "npm test: 2 passed; npm run db:generate: passed; npm run build: passed"
  commit: "75711bb feat(auth): initialize authentication backend"
  files[5]: "prisma/schema.prisma","prisma.config.ts","src/lib/auth.js","src/lib/auth-schema.js","src/app/api/auth/[...all]/route.js"
current:
  feature: "1. Auth + roles"
  phase: "Documentation/context setup; backend real validation pending"
  blockers[2]: "PostgreSQL instance required for migration and live endpoint tests","Human approval required before continuing"
next[5]: "Create/apply Prisma migration","Run live API checks: success, invalid input, unauthorized, forbidden","Implement auth frontend only after backend validation","Run Playwright + definition_of_done checks","Stop and request human validation"
rules[4]: "One feature per feature/<name> branch","Follow Conventional Commits","Do not start frontend before backend tests and live validation pass","Update this file after every session"
history:
  - date: 2026-10-06
    result: "Project initialized; Auth backend foundation implemented and verified"
```
