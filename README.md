# FitTrack

A mobile-first fitness habit tracker. Log five daily habits in under five seconds, earn weekly streaks, and share auto-generated recap posters.

## Stack

| Layer      | Technology                                                   |
| ---------- | ------------------------------------------------------------ |
| Framework  | Next.js 16 (App Router, TypeScript strict)                   |
| Auth       | Better Auth v1 — email + password, server-side session       |
| Database   | Neon PostgreSQL (shared instance, all tables prefixed `ft_`) |
| ORM        | Prisma 5                                                     |
| Styling    | Tailwind CSS v4                                              |
| Charts     | Recharts                                                     |
| Date ops   | date-fns + date-fns-tz                                       |
| Unit tests | Vitest                                                       |
| E2E tests  | Playwright                                                   |

## Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) PostgreSQL database

## Setup

```bash
npm install
```

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env.local
```

Required variables:

```
DATABASE_URL=           # Neon connection string (pooled)
SHADOW_DATABASE_URL=    # Neon connection string (direct, for migrations)
BETTER_AUTH_SECRET=     # 32+ random chars — openssl rand -base64 32
NEXT_PUBLIC_APP_URL=    # e.g. http://localhost:3000
```

Push the schema and seed badge definitions:

```bash
npm run db:push
npm run db:seed
```

## Development

```bash
npm run dev       # http://localhost:3000
npm run lint      # ESLint
npm run format    # Prettier
```

## Testing

```bash
npm test          # Vitest unit tests (streak engine, 28 tests)
npm run test:e2e  # Playwright smoke test (requires a running dev or prod server)
```

The smoke test registers a fresh user, back-dates four movement logs into the previous completed Mon–Sun week, then asserts that `/streaks` shows a current streak of 1.

For E2E against a production build:

```bash
npm run build && npm start &
npm run test:e2e
```

## Architecture notes

- **Streaks are stateless** — computed fresh from `DailyLog` on every read; no `WeekResult` table.
- **Three-state logging** — `null` (not logged) · `true` (done) · `false` (skipped). Absence is never failure.
- **Week rule** — Mon–Sun; 4+ distinct movement days = passed.
- **Timezone-safe date ops** — all date arithmetic uses UTC noon (`T12:00:00Z`) to avoid DST boundary drift. User-local "today" is derived server-side via `date-fns-tz`.
- **DB sharing** — all FitTrack tables use `@@map("ft_*")` to coexist on a shared Neon instance.
- **Security** — every DB query is scoped by `userId` from the session; Zod validates all server action inputs; no secrets in client bundles.
