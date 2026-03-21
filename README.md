# Restaurant Management System

Frontend + backend-integrated restaurant management app using React, Supabase Postgres, and custom database auth.

## Stack

- React + Vite + TypeScript
- Tailwind + shadcn/ui
- Custom authentication with PostgreSQL (`pgcrypto` password hashing + session tokens)
- PostgreSQL (through Supabase)

## Environment setup

1. Copy `.env.example` to `.env`
2. Add your Supabase project values:

```sh
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=...
VITE_SUPABASE_ANON_KEY=...
```

## Database setup (Supabase SQL editor)

Run in order:

1. `supabase/schema.sql`
2. `supabase/seed.sql`

This creates:
- Auth tables `app_users`, `user_roles`, `user_sessions`
- RPC auth functions `app_sign_up`, `app_sign_in`, `app_validate_session`, `app_sign_out`
- Persistent `menu_items`, `tables`, `orders`, `order_items`, `inventory_items`
- RLS policies and grants required by the app

### Seeded test accounts

After running `supabase/seed.sql`, you can sign in with:

- `customer@rms.local` / `Password123!`
- `waiter@rms.local` / `Password123!`
- `chef@rms.local` / `Password123!`
- `manager@rms.local` / `Password123!`
- `multirole@rms.local` / `Password123!` (manager + chef)

## Run locally

```sh
npm install
npm run dev
```

## Auth + RBAC flow

- Users sign in/sign up on `/auth`
- Signup writes to `app_users` with encrypted password hash and `user_roles`
- Login creates hashed session tokens in `user_sessions`
- Entry dashboard (`/`) shows account details and only the roles assigned to the user
- Route guards enforce role access:
  - `/customer`
  - `/waiter`
  - `/chef`
  - `/manager`
