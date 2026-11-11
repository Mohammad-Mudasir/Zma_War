# Zma Wār (زما وار)

**Book your turn, skip the waiting room.**

Zma Wār ("my turn" in Pashto) is an appointment booking system. People browse open time slots, reserve one, and get an email reminder before it's time. An administrator manages everything from a separate admin panel.

The project is currently built for a single fictional hospital, but the appointment system itself is the focus. A multi-organisation SaaS version is planned for the future.

> Zma Wār is a learning project. The hospital used in the demo data is fictional.

## Features

**For users**

- Browse open and reserved time slots without signing in
- **Find a time** shows the next three days at a glance
- **Book ahead** lets you pick any day up to 30 days away
- Register, verify your email address, and sign in securely
- Hold up to **2 upcoming reservations** at once
- Choose how early the reminder email arrives (10 minutes to 1 day), per reservation, and change it later
- Cancel a reservation in one tap so the slot opens up for someone else
- A personal dashboard that shows reservations as queue-ticket cards

**For the administrator**

- Separate, protected admin panel
- Daily schedule showing who holds each slot
- Reserve a slot on behalf of a user
- Cancel any reservation; the user is notified by email
- Search and filter all reservations (upcoming, past, cancelled)
- Set the default reminder time for everyone

**Behind the scenes**

- A reminder worker sends due emails, never twice, and retries failures
- Two people can't take the same slot, even if they click at the same moment
- Times are stored in UTC and shown in one configurable timezone

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Database | MySQL with Prisma ORM |
| Validation | Zod |
| Auth | bcrypt password hashing, signed session cookies (JWT via `jose`) |
| Email | Nodemailer (any SMTP provider) |
| Tests | Vitest |

Forms use Next.js Server Actions, which include built-in CSRF protection and keep client-side JavaScript small.

## Getting started

### Requirements

- Node.js 20 or newer
- MySQL 8

### 1. Install

```bash
git clone https://github.com/Mohammad-Mudasir/Zma_War.git
cd zma-war
npm install
```

### 2. Create the database

In MySQL Workbench:

```sql
CREATE DATABASE zma_war CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'zma_user'@'localhost' IDENTIFIED BY 'choose_a_strong_password';
GRANT ALL PRIVILEGES ON *.* TO 'zma_user'@'localhost';
FLUSH PRIVILEGES;
```

The broad `GRANT` is for local development only: Prisma needs permission to create a temporary shadow database when running migrations.

### 3. Configure the environment

Create a `.env` file in the project root:

```env
DATABASE_URL="mysql://zma_user:choose_a_strong_password@localhost:3306/zma_war"
AUTH_SECRET="a-long-random-string-of-at-least-32-characters"
APP_URL="http://localhost:3000"

ADMIN_NAME="Administrator"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="ChangeMe12345"

# Optional: also create a demo user (demo@zmawar.test / Demo12345)
SEED_DEMO="true"
```

### 4. Create the tables and seed data

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

The seed script creates the administrator, the default settings and the upcoming appointment slots.

### 5. Run it

```bash
npm run dev
```

Open <http://localhost:3000>. The admin panel is at <http://localhost:3000/admin/login>.

In a second terminal, start the reminder worker:

```bash
npm run job:reminders
```

## Email (SMTP)

With no `SMTP_HOST` set, emails are **printed in the terminal** during development, which is enough to copy a verification link into your browser.

To send real email, add these to `.env` and restart the app and the worker:

```env
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-smtp-username"
SMTP_PASSWORD="your-smtp-password"
EMAIL_FROM="Zma Wār <no-reply@example.com>"
```

Gmail (with an app password), Brevo and Mailtrap all work. Use `SMTP_PORT="465"` and `SMTP_SECURE="true"` if your provider requires port 465.

## Configuration reference

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | MySQL connection string |
| `AUTH_SECRET` | Yes | Signs session cookies (32+ characters) |
| `APP_URL` | Yes | Public address, used in email links |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | For seeding | The administrator account |
| `SMTP_*`, `EMAIL_FROM` | For real email | See above |
| `HOSPITAL_NAME` | No | Organisation name shown in the app and emails (defaults to a fictional hospital) |
| `APP_TIMEZONE` | No | Defaults to `Asia/Kabul` |
| `SLOT_MINUTES` | No | Slot length, default `30` |
| `SLOT_OPEN`, `SLOT_CLOSE` | No | Daily hours, default `09:00` to `15:00` |
| `SLOT_WORKING_DAYS` | No | `0` = Sunday … `6` = Saturday, default `1,2,3,4,5` |
| `REMINDER_INTERVAL_SECONDS` | No | How often the worker checks, default `60` |
| `COOKIE_SECURE` | No | Set to `false` to test a production build over plain HTTP |

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Generate the Prisma client and build for production |
| `npm start` | Run the production build |
| `npm run job:reminders` | Run the reminder worker (`-- --once` checks once and exits) |
| `npm run db:migrate` | Create and apply a migration (development) |
| `npm run db:deploy` | Apply existing migrations (production) |
| `npm run db:seed` | Seed the administrator, settings and slots |
| `npm run db:studio` | Browse the database in Prisma Studio |
| `npm test` | Run the unit tests |
| `npm run lint` / `npm run typecheck` | Lint and type-check the code |

## Project structure

```
prisma/            Database schema and seed script
src/
  app/             Pages and route handlers
    (public)/      Landing page and slot browsing
    (auth)/        Sign in, register, verify email
    (user)/        Dashboard, reservations, account
    admin/         Admin login and panel
    api/           Email verification link and health check
  actions/         Server Actions (form handlers)
  components/      UI, layout, auth, user and admin components
  services/        Business rules (booking, cancelling, reminders)
  lib/             Auth, email, time zones, config, helpers
  validations/     Zod schemas
  emails/          Email templates
  jobs/            The reminder worker
tests/unit/        Unit tests
```

## Business rules

- A user can hold at most **2 upcoming reservations**. A reservation counts only until its appointment ends.
- Slots can be booked up to **30 days ahead**.
- Users must **verify their email** before reserving. The administrator can book for any user.
- Cancelled reservations are kept as history rather than deleted.
- Verification links work once and expire after 24 hours.

## Security notes

- Passwords are hashed with bcrypt and never stored in plain text.
- Verification tokens are stored only as hashes.
- Every protected page and action checks the session and role on the server.
- Inputs are validated on the server with Zod, and the database is accessed through Prisma's parameterised queries.
- Login attempts are rate limited. The limiter is in memory, so it is per server process.

## Testing

```bash
npm test
```

The unit tests cover time zone and slot generation, validation rules and reminder timing.

## Roadmap

Zma Wār is also a hands-on project for practising deployment and DevOps. Planned work:

- **Docker:** containerise the web app, the reminder worker and the database (a `Dockerfile` and Compose setup)
- **Hosting:** deploy to a server
- **CI/CD:** a pipeline that lints, type-checks, tests and builds on every push, then deploys automatically
- **Integration tests** that run against a real database in CI
- **SaaS version:** support multiple organisations, each with its own schedule, branding and administrator, instead of a single fictional hospital

The app is already prepared for this: it builds as a standalone Node server, exposes a `/api/health` endpoint for health checks, reads all configuration from environment variables, and runs the reminder worker as its own process.

## License

Released under the [MIT License](LICENSE).
