# Contexte inter-agents

Lire ce fichier avant toute intervention. Le mettre à jour à la fin de chaque session, après validation des changements.

```toon
project: smart-job
branch: feature/applications-cv
status: awaiting_human_validation
last_session:
  date: 2026-10-07
  feature: "Applications with CV"
  done[22]: "Application Prisma model and migration","Candidate-only application creation","PDF and DOCX CV validation with 5 MB limit","PDF/DOCX signature validation","Optional candidate message","One application per candidate and offer","Candidate application listing","Recruiter-owned application listing","Recruiter status updates","Authorized and rate-limited CV download","AES-256-GCM CV encryption at rest","Candidate application/CV deletion","Upload rate limiting","Filename header sanitization","GDPR retention/key-management documentation","Vitest application schema coverage","Playwright API and browser coverage","TypeScript strict type-check","Vitest 15 tests passed","Playwright 12 tests passed","Next.js production build passed"
  tests: "npx tsc --noEmit: passed; npm test: 15 passed; npm run test:e2e: 12 passed; npm run build: passed; CV_ENCRYPTION_KEY configured for live tests"
  commit: "pending"
  files[13]: "prisma/schema.prisma","prisma/migrations/20261007100000_add_applications/migration.sql","prisma/migrations/20261007100500_encrypt_application_cvs/migration.sql","src/lib/application-schema.ts","src/lib/cv-storage.ts","src/lib/rate-limit.ts","src/app/api/jobs/[id]/applications/route.ts","src/app/api/applications/route.ts","src/app/api/applications/[id]/route.ts","src/components/job-board.tsx","src/components/auth-panel.tsx","tests/api/applications-api.spec.ts","tests/e2e/applications.spec.ts"
current:
  feature: "4. Applications with CV"
  branch: "feature/applications-cv"
  base: "dev"
  phase: "Security and privacy hardening complete; awaiting human approval"
  blockers[0]:
next[3]: "Human validates feature","Merge feature/applications-cv when approved","Start feature 5: recruiter dashboard"
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
  - date: 2026-10-07
    result: "Applications feature hardened with signature validation, AES-256-GCM encryption, rate limits, candidate deletion, filename sanitization, key-management and retention documentation; all validation passed"
```
