# Contexte inter-agents

Lire ce fichier avant toute intervention. Le mettre à jour à la fin de chaque session, après validation des changements.

```toon
project: smart-job
branch: feature/auth-roles
status: in_progress
last_session:
  date: 2026-10-06
  feature: "Auth + rôles: migration TypeScript du socle"
  done[15]: "Next.js 16.3.8 scaffold","Prisma 7.10 PostgreSQL schema","Better Auth config","Auth route /api/auth/[...all]","Zod sign-up schema","Vitest tests","Prisma client generation","Next.js production build","Docker Compose PostgreSQL","Prisma migration init_auth_roles","Live sign-up success check","Live invalid/unauthorized checks","Docker Compose variables d'environnement","Application files converted to TypeScript","TypeScript strict type-check"
  tests: "npx tsc --noEmit: passed; npm test: 2 passed; npm run build: passed; docker compose config: passed"
  commit: "pending: migrate application from JavaScript to TypeScript"
  files[8]: "tsconfig.json","src/app/layout.tsx","src/app/page.tsx","src/app/api/auth/[...all]/route.ts","src/lib/auth.ts","src/lib/auth-schema.ts","src/lib/auth-schema.test.ts","src/lib/prisma.ts"
current:
  feature: "1. Auth + roles"
  phase: "Backend validated; TypeScript foundation ready; frontend not started"
  blockers[1]: "Human approval required before continuing"
next[4]: "Add role-protected application route/action and forbidden test","Implement auth frontend","Run Playwright + definition_of_done checks","Stop and request human validation"
rules[4]: "One feature per feature/<name> branch","Follow Conventional Commits","Do not start frontend before backend tests and live validation pass","Update this file after every session"
history:
  - date: 2026-10-06
    result: "Project initialized; Docker PostgreSQL migration and live Better Auth checks verified"
```
