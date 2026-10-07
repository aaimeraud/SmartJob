# Contexte inter-agents

Lire ce fichier avant toute intervention. Le mettre à jour à la fin de chaque session, après validation des changements.

```toon
project: smart-job
branch: feature/job-offers
status: awaiting_human_validation
last_session:
  date: 2026-10-07
  feature: "Job offers: recruiter CRUD and published listing"
  done[21]: "Better Auth signup/login/logout","Candidate default role server-side","Session endpoint /api/me","Recruiter role-protected endpoint","401 unauthenticated response","403 forbidden response","Server-side Zod validation","Auth form with react-hook-form and zod resolver","French auth landing page","Subject-separated Vitest tests","Subject-separated Playwright API tests","Playwright browser auth flow","TypeScript strict type-check","Vitest 6 tests passed","Playwright 4 tests passed","Next.js production build passed"
  tests: "npx tsc --noEmit: passed; npm test: 6 passed; npm run test:e2e: 4 passed; npm run build: passed"
  commit: "06f1c9d feat(auth): complete authentication and role access"
  files[11]: "src/lib/authorization.ts","src/app/api/me/route.ts","src/app/api/recruiter/access/route.ts","src/components/auth-panel.tsx","tests/auth/auth-schema.test.ts","tests/auth/authorization.test.ts","tests/api/auth-api.spec.ts","tests/e2e/auth.spec.ts","vitest.config.ts","playwright.config.ts","README.md"
current:
  feature: "2. Job offers (recruiter CRUD)"
  branch: "feature/job-offers"
  base: "dev"
  phase: "Feature implementation and automated validation complete; awaiting human approval"
  blockers[0]:
next[3]: "Human validates feature","Merge feature/job-offers when approved","Start feature 3: search and filters"
rules[4]: "One feature per feature/<name> branch","Follow Conventional Commits","Do not start frontend before backend tests and live validation pass","Update this file after every session"
history:
  - date: 2026-10-06
    result: "Project initialized; Docker PostgreSQL migration and live Better Auth checks verified"
  - date: 2026-10-06
    result: "README rewritten for human users and contributors"
  - date: 2026-10-06
    result: "Auth + roles feature completed with backend authorization, UI, and subject-separated tests"
  - date: 2026-10-07
    result: "Job offers feature completed with Prisma migration, recruiter CRUD API, published listing, UI management, and passing tests"
```
