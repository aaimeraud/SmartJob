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

Authentication and recruiter job offers are implemented. The current feature
branch is `feature/job-offers`.

## Job offers

Recruiters can create, edit, publish and delete their own job offers from the
home page. Visitors and candidates can only see published offers. The API is
available under `/api/jobs`; recruiter ownership and all payload validation are
enforced server-side.

## Contributing

Create one branch per feature using the `feature/<name>` format. Run the tests,
type-check and production build before opening a pull request. Use Conventional
Commits for commit messages.
