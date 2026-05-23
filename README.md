# Repair Shop Management System

A full-stack web application for managing electrical-appliance repair jobs in a small shop, from intake to engineer assignment, to customer pickup and revenue reporting. Built as a learning / portfolio project to demonstrate a **Bun + Elysia** REST API paired with a **Next.js 15 (App Router) + React 19** front-end, backed by **PostgreSQL** through **Prisma ORM**.

---

## Overview

The shop receives broken electrical devices from walk-in customers, dispatches repair work to engineers, tracks progress, and collects payment when the customer returns to pick the device up. The application supports three user roles, each with a tailored workflow:

| Role         | Primary workflow                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------- |
| **Admin**    | Full back-office: dashboard, staff, devices, repair records, status, income reports, shop profile |
| **User**     | Front desk — create and edit repair records (intake)                                              |
| **Engineer** | Update repair status, log how the problem was solved, mark jobs complete                          |

The dashboard summarises total jobs, completed vs. in-progress jobs, total revenue, and plots daily / monthly income with ApexCharts.

---

## Tech Stack

### Backend (`bun_workshop_2024_api/app`)

- **[Bun](https://bun.sh/)** — JavaScript runtime and package manager
- **[Elysia](https://elysiajs.com/)** — Fast, ergonomic HTTP framework for Bun
- **[Prisma 6](https://www.prisma.io/)** — Type-safe ORM (PostgreSQL provider)
- **[@elysiajs/jwt](https://elysiajs.com/plugins/jwt)** — JWT auth (Bearer tokens)
- **[@elysiajs/cors](https://elysiajs.com/plugins/cors)** — CORS for the web client
- **[Day.js](https://day.js.org/)** — Date utilities for reporting
- **PostgreSQL** (hosted on [Neon](https://neon.tech/) by default)

### Frontend (`bun_workshop_2024_web/my-app`)

- **[Next.js 15](https://nextjs.org/)** with **App Router** and **Turbopack** dev server
- **React 19** + **TypeScript 5**
- **[Tailwind CSS 4](https://tailwindcss.com/)** — utility-first styling
- **[Axios](https://axios-http.com/)** — HTTP client
- **[SweetAlert2](https://sweetalert2.github.io/)** — toast / confirm dialogs
- **[ApexCharts](https://apexcharts.com/)** — dashboard charts
- **Day.js** — date formatting

---

## Repository Layout

```
bun_nextjs_workshop/
├── bun_workshop_2024_api/
│   └── app/                       # Bun + Elysia API
│       ├── prisma/
│       │   ├── schema.prisma      # Data model
│       │   └── migrations/
│       └── src/
│           ├── index.ts           # Elysia app + route table
│           └── controllers/
│               ├── UserController.ts
│               ├── DeviceController.ts
│               ├── DepartmentController.ts
│               ├── SectionController.ts
│               ├── RepairRecordController.ts
│               └── CompanyController.ts
│
└── bun_workshop_2024_web/
    └── my-app/                    # Next.js 15 web client
        └── app/
            ├── page.tsx           # Sign-in page
            ├── layout.tsx
            ├── config.ts          # API URL + token key + shared dialogs
            ├── components/
            │   ├── sidebar.tsx    # Role-based navigation
            │   ├── top-nav.tsx
            │   └── modal.tsx
            └── backoffice/
                ├── dashboard/
                ├── user/          # Staff management
                ├── employee/
                ├── device/        # Device / inventory registry
                ├── repair-record/ # Intake & edit
                ├── repair-status/ # Engineer workflow
                ├── income-report/ # Date-range revenue report
                ├── company/       # Shop profile
                └── profile/
```

---

## Data Model

Defined in [bun_workshop_2024_api/app/prisma/schema.prisma](bun_workshop_2024_api/app/prisma/schema.prisma):

- **User** — staff account with `level` (`admin` / `user` / `engineer`), soft-deleted via `status`, optionally tied to a `Section`.
- **Department** → **Section** → **User** — organisational hierarchy for staff.
- **Device** — items the shop tracks (name, barcode, serial, expiry, status).
- **RepairRecord** — the core entity: customer info, device info, problem description, solving notes, assigned engineer, lifecycle dates (`createdAt`, `endJobDate`, `payDate`, `expireDate`), `amount` charged, optional before/after images, and a `status` driving the workflow.
- **Company** — shop profile (name, address, phone, email, Facebook page, tax code).

Soft-delete pattern: rows are never physically removed — `status` is flipped to `inactive` (or `complete` for paid-up repairs).

---

## API Surface

All endpoints are mounted from [bun_workshop_2024_api/app/src/index.ts](bun_workshop_2024_api/app/src/index.ts) and run on `http://localhost:3001`.

### Auth & Users

| Method | Path                          | Purpose                          |
| ------ | ----------------------------- | -------------------------------- |
| POST   | `/api/user/signin`            | Sign in, returns JWT             |
| PUT    | `/api/user/update`            | Update the signed-in user        |
| GET    | `/api/user/level`             | Return the caller's role         |
| GET    | `/api/user/list`              | List active staff                |
| POST   | `/api/user/create`            | Create a staff account           |
| PUT    | `/api/user/updateUser/:id`    | Update a staff account           |
| DELETE | `/api/user/remove/:id`        | Soft-delete a staff account      |
| GET    | `/api/user/listEngineer`      | List engineers for job dispatch  |

### Organisation

| Method | Path                                            | Purpose                          |
| ------ | ----------------------------------------------- | -------------------------------- |
| GET    | `/api/department/list`                          | List departments                 |
| GET    | `/api/section/listByDepartment/:departmentId`   | List sections in a department    |

### Devices

| Method | Path                       | Purpose                  |
| ------ | -------------------------- | ------------------------ |
| GET    | `/api/device/list`         | List devices             |
| POST   | `/api/device/create`       | Register a new device    |
| PUT    | `/api/device/update/:id`   | Update a device          |
| DELETE | `/api/device/remove/:id`   | Soft-delete a device     |

### Company

| Method | Path                  | Purpose                                              |
| ------ | --------------------- | ---------------------------------------------------- |
| GET    | `/api/company/info`   | Get shop profile (JWT-protected via `checkSignIn`)   |
| PUT    | `/api/company/update` | Update shop profile                                  |

### Repair Records & Reporting

| Method | Path                                            | Purpose                                                |
| ------ | ----------------------------------------------- | ------------------------------------------------------ |
| GET    | `/api/repairRecord/list`                        | List all repair jobs (with device + engineer)          |
| POST   | `/api/repairRecord/create`                      | Intake a new repair job                                |
| PUT    | `/api/repairRecord/update/:id`                  | Edit an existing job                                   |
| DELETE | `/api/repairRecord/remove/:id`                  | Soft-delete a job                                      |
| PUT    | `/api/repairRecord/updateStatus/:id`            | Engineer updates status / solving notes / `engineerId` |
| PUT    | `/api/repairRecord/receive`                     | Mark device picked up + record `amount` + `payDate`    |
| GET    | `/api/income/report/:startDate/:endDate`        | Revenue list for a date range                          |
| GET    | `/api/repairRecord/dashboard?year=&month=`      | KPIs + daily income for a given month                  |
| GET    | `/api/repairRecord/incomePerMonth?year=`        | Monthly income breakdown for a year                    |

### Authentication

- The API issues a JWT on `POST /api/user/signin` containing `{ id, username, level }`.
- The web client stores the token in `localStorage` under the key `token_bun_service` and sends it as `Authorization: Bearer <token>`.
- Protected endpoints (e.g. `/api/company/info`) use the `checkSignIn` `beforeHandle` middleware defined in [index.ts](bun_workshop_2024_api/app/src/index.ts).

---

## Front-End Flow

1. The user signs in at [`/`](bun_workshop_2024_web/my-app/app/page.tsx). On success, the token and user info are written to `localStorage` and the user is routed to a role-appropriate landing page:
   - `admin` → `/backoffice/dashboard`
   - `user`  → `/backoffice/repair-record`
   - `engineer` → `/backoffice/repair-status`
2. The shared [Sidebar](bun_workshop_2024_web/my-app/app/components/sidebar.tsx) fetches the caller's role from `/api/user/level` and renders only the menu items that role is allowed to use.
3. Pages under `app/backoffice/*` use Axios to call the API, with confirm/error dialogs powered by SweetAlert2.
4. The dashboard renders KPI cards and ApexCharts charts from the `dashboard` / `incomePerMonth` endpoints.

---

## Repair Job Lifecycle

```
       ┌──────────────────┐
intake │  status: active  │  ← created via POST /api/repairRecord/create
       └────────┬─────────┘
                │  engineer updates status / adds solving notes
                ▼
       ┌──────────────────┐
       │ status: <custom> │  ← e.g. "in-progress", set by updateStatus
       └────────┬─────────┘
                │  customer returns to pick the device up
                ▼
       ┌──────────────────┐
       │ status: complete │  ← /api/repairRecord/receive
       │ payDate, amount  │
       └──────────────────┘
```

Only `complete` records with a `payDate` in range count toward revenue reports and the dashboard's "total income" KPI.

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) ≥ 1.0 (runs both the API and is fine for the web app)
- A PostgreSQL database (a free [Neon](https://neon.tech/) project works well)

### 1. API

```bash
cd bun_workshop_2024_api/app

# Install dependencies
bun install

# Configure the database connection
# Create / edit .env in this folder:
#   DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"

# Apply migrations (and generate the Prisma client)
bunx prisma migrate deploy
bunx prisma generate

# Start the dev server (port 3001, hot reload)
bun run dev
```

### 2. Web

```bash
cd bun_workshop_2024_web/my-app

bun install      # or: npm install

# The API URL is configured in app/config.ts (default: http://localhost:3001)
# Change it there if your API runs elsewhere.

bun run dev      # or: npm run dev   — Next.js with Turbopack on port 3000
```

Open <http://localhost:3000>, sign in, and you should land on a page that matches your account's role.

---

## Notable Implementation Details

- **Soft deletes everywhere.** Users, devices, and repair records flip `status` to `inactive` instead of being removed, preserving history for reporting.
- **Role-driven navigation.** The sidebar derives the menu from `/api/user/level` rather than trusting the stored level in `localStorage`, so revoking access on the server takes effect on the next render.
- **Stateless auth.** JWTs are signed with HS256; the API has no session store.
- **Aggregated reporting in SQL.** `dashboard` and `incomePerMonth` use Prisma's `aggregate` + day/month windows to compute revenue series server-side, so the chart layer just renders numbers.
- **Single source of truth for API URL.** [app/config.ts](bun_workshop_2024_web/my-app/app/config.ts) centralises `apiUrl`, the JWT storage key, and a shared confirm-delete dialog used across pages.

---

## Possible Improvements (Backlog Ideas)

These are intentionally out of scope for the current build, but worth calling out for portfolio context:

- Hash passwords with `bun.password` / Argon2 instead of storing plaintext.
- Move the JWT secret from a hard-coded string in [index.ts](bun_workshop_2024_api/app/src/index.ts) to an environment variable.
- Use the JWT middleware on every protected route, not only `/api/company/info`.
- Add an upload pipeline for `imageBeforeRepair` / `imageAfterRepair` (currently typed but unwired).
- Add automated tests (Bun's built-in test runner on the API side; Playwright on the web).
- Containerise with Docker Compose for one-command spin-up.

---

## License

This is a personal learning / portfolio project — feel free to read, fork, and adapt.
