# Smart Job

Job board platform built with Next.js, TypeScript, Prisma and PostgreSQL.

## Prerequisites

- Node.js 20+
- npm
- Docker

## Installation

```bash
npm install
cp .env.example .env
```

Update `.env` with your local secrets. The default Docker database uses port
`5433`.

Start PostgreSQL and apply the database migrations:

```bash
docker compose up -d
npm run db:generate
npm run db:migrate
```

Start the development server:

```bash
npm run dev
```

The application is available at <http://localhost:3000>.

## Useful commands

```bash
npm test              # Run unit tests
npm run test:e2e      # Run API and browser tests
npx tsc --noEmit      # Type-check
npm run build         # Create a production build
docker compose down   # Stop PostgreSQL
```

## Project status

Authentication, recruiter job offers, published-offer search, and candidate
applications are implemented. The current feature branch is
`feature/applications-cv`.

## Job offers

Recruiters can create, edit, publish and delete their own job offers from the
home page. Visitors and candidates can only see published offers. The API is
available under `/api/jobs`; recruiter ownership and all payload validation are
enforced server-side.

## Search and filters

Published offers can be searched with keyword, location, contract type, skills,
and salary range filters. Results are paginated and the active filters are
reflected in the URL. The public API accepts `q`, `location`, `contractType`,
`skills`, `minSalary`, `maxSalary`, `page`, and `pageSize` query parameters.

## Applications

Candidates can apply once to a published offer with a PDF or DOCX CV up to
5 MB and an optional message. Candidates can view their applications, while
recruiters can view applications for their own offers, update statuses, and
download CVs. CV content is never returned in JSON responses and is only
available through an authorized endpoint. CVs are encrypted at rest with
AES-256-GCM, and candidates can delete their own application and CV.

Set `CV_ENCRYPTION_KEY` to a persistent 64-character hexadecimal key in every
environment. Never rotate or replace it without a planned re-encryption
procedure, otherwise existing CVs cannot be decrypted. Production deployments
should also configure a scheduled retention job to delete applications and CVs
after the documented GDPR retention period.

## Contributing

Create one branch per feature using the `feature/<name>` format. Run the tests,
type-check and production build before opening a pull request. Use Conventional
Commits for commit messages.
