# Campus Desk · Student Records

A student directory with create, read, update, and delete actions, search by student number or name, and program/year filters. The UI is built with Vite and vanilla JavaScript; Supabase provides PostgreSQL storage.

## Run locally

1. Install Node.js, then run `npm install` and `npm run dev`.
2. Copy `.env.example` to `.env` and add your Supabase project URL and anon/publishable key.
3. In the Supabase SQL Editor, run [`supabase/schema.sql`](supabase/schema.sql).

The app reads `students` ordered by creation date. Student number is unique; required fields and year level 1–4 are validated in the form and database.

## Deploy to Vercel

Import this project into Vercel. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under Project Settings → Environment Variables, then deploy. The Vite build output is `dist`; `vercel.json` routes app paths to the single page.

## Access control

The SQL file enables row-level security and includes an open policy so the unauthenticated demo can perform CRUD with the anon key. That policy grants public access to all student rows and is **not appropriate for a public production directory**. Before publishing real student data, remove it and add policies limited to authenticated, authorized users (or enable Supabase Auth and scope records by user/role). Never put a service-role key in frontend environment variables.
