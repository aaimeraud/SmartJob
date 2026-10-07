# Contexte inter-agents

Lire ce fichier avant toute intervention. Le mettre à jour à la fin de chaque session, après validation des changements.

```toon
project: smart-job
branch: feature/job-offers
status: awaiting_human_validation
last_session:
  date: 2026-10-07
  feature: "Search and filters for published job offers"
  done[12]: "Strict Zod search filter validation","Keyword, location, contract, skill and salary filters","Server-side pagination with total metadata","Filter URL parameters preserved by the UI","Recruiter and public API behavior preserved","Vitest search schema coverage","Playwright live API filter and pagination coverage","Playwright browser filter flow coverage","TypeScript strict type-check","Vitest 13 tests passed","Playwright 9 tests passed","Next.js production build passed"
  tests: "npx tsc --noEmit: passed; npm test: 13 passed; npm run test:e2e: 9 passed; npm run build: passed"
  commit: "pending"
  files[7]: "src/lib/job-offer-schema.ts","src/app/api/jobs/route.ts","src/components/job-board.tsx","tests/jobs/job-offer-schema.test.ts","tests/api/job-offers-api.spec.ts","tests/e2e/job-search.spec.ts","README.md","SESSION_CONTEXT.md"
current:
  feature: "3. Search + filters"
  branch: "feature/search-filters"
  base: "dev"
  phase: "Feature implementation and automated validation complete; awaiting human approval"
  blockers[0]:
next[3]: "Human validates feature","Merge feature/search-filters when approved","Start feature 4: applications with CV"
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
  - date: 2026-10-07
    result: "Search and filters feature completed with validated API filters, pagination, URL-synchronized UI, browser coverage, and passing build"
```
