# HapoPay Architecture

## Overview

```
┌─────────────────────────────────────────────────────────┐
│                        Clients                          │
│   React/TS Web App          Flutter Mobile App          │
│   (Vite + TailwindCSS)      (iOS & Android)             │
└──────────────┬──────────────────────┬───────────────────┘
               │  REST + JWT          │  REST + JWT
               ▼                      ▼
┌─────────────────────────────────────────────────────────┐
│              Django REST API  (port 8000)                │
│  /api/users  /api/children  /api/transactions           │
│  /api/rewards  /api/auth/token                          │
└──────────────────────────┬──────────────────────────────┘
                           │  psycopg2
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Supabase (PostgreSQL)                   │
│  Auth · Database · Storage · Realtime subscriptions     │
└─────────────────────────────────────────────────────────┘
```

## Key Design Decisions

- **Monorepo** — all three sub-projects live in one repo for easier cross-cutting changes and shared docs.
- **Django as API layer** — handles business logic, validation, and auth (JWT via SimpleJWT). Supabase is the database.
- **Supabase** — used for PostgreSQL, file storage, and real-time subscriptions. The Django backend connects via `DATABASE_URL`.
- **React + Vite** — fast dev experience, TypeScript for safety, TailwindCSS for styling, React Query for server state.
- **Flutter** — single codebase for iOS and Android, Riverpod for state, GoRouter for navigation.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/token/` | Obtain JWT |
| POST | `/api/auth/token/refresh/` | Refresh JWT |
| POST | `/api/users/register/` | Register new user |
| GET/PATCH | `/api/users/me/` | Current user profile |
| GET/POST | `/api/children/` | List / create children |
| GET/PATCH/DELETE | `/api/children/{id}/` | Child detail |
| GET | `/api/transactions/` | Transaction history |
| GET | `/api/rewards/points/` | Reward points |
| GET | `/api/rewards/achievements/` | Achievements |
