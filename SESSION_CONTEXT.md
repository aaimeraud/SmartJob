# Contexte inter-agents

Lire ce fichier avant toute intervention. Le mettre à jour à la fin de chaque session, après validation des changements.

```toon
project: smart-job
branch: feature/auth-roles
status: in_progress
last_session:
  date: 2026-10-06
  feature: "Auth + rôles: backend, autorisation et interface"
  done[21]: "Better Auth signup/login/logout","Candidate default role server-side","Session endpoint /api/me","Recruiter role-protected endpoint","401 unauthenticated response","403 forbidden response","Server-side Zod validation","Auth form with react-hook-form and zod resolver","French auth landing page","Subject-separated Vitest tests","Subject-separated Playwright API tests","Playwright browser auth flow","TypeScript strict type-check","Vitest 6 tests passed","Playwright 4 tests passed","Next.js production build passed"
  tests: "npx tsc --noEmit: passed; npm test: 6 passed; npm run test:e2e: 4 passed; npm run build: passed"
  commit: "pending: complete auth and roles feature"
  files[11]: "src/lib/authorization.ts","src/app/api/me/route.ts","src/app/api/recruiter/access/route.ts","src/components/auth-panel.tsx","tests/auth/auth-schema.test.ts","tests/auth/authorization.test.ts","tests/api/auth-api.spec.ts","tests/e2e/auth.spec.ts","vitest.config.ts","playwright.config.ts","README.md"
current:
  feature: "1. Auth + roles"
  phase: "Feature implementation and automated validation complete"
  blockers[1]: "Human approval required before merging or starting feature 2"
next[3]: "Human validates feature","Merge feature/auth-roles when approved","Start feature 2: recruiter job offers"
rules[4]: "One feature per feature/<name> branch","Follow Conventional Commits","Do not start frontend before backend tests and live validation pass","Update this file after every session"
history:
  - date: 2026-10-06
    result: "Project initialized; Docker PostgreSQL migration and live Better Auth checks verified"
  - date: 2026-10-06
    result: "README rewritten for human users and contributors"
  - date: 2026-10-06
    result: "Auth + roles feature completed with backend authorization, UI, and subject-separated tests"
```
