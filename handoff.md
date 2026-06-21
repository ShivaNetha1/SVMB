# SVMB — Project Handoff Document

> **Sri Venkateshwara Marriage Bureau — Complete System Handoff**
> 
> Date: June 22, 2026  
> Version: 1.0.0 (Initial Build)  
> Author: AI-assisted development  
> Status: ✅ Build Complete — Pending Production Deployment

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Project Structure](#4-project-structure)
5. [Database Schema](#5-database-schema)
6. [React Dashboard](#6-react-dashboard)
7. [Make.com Automation](#7-makecom-automation)
8. [Authentication & Security](#8-authentication--security)
9. [Environment Variables & Secrets](#9-environment-variables--secrets)
10. [Setup & Installation](#10-setup--installation)
11. [Build & Deployment](#11-build--deployment)
12. [Known Issues & Limitations](#12-known-issues--limitations)
13. [Future Upgrades & Roadmap](#13-future-upgrades--roadmap)
14. [Troubleshooting Guide](#14-troubleshooting-guide)
15. [Design Decisions & Rationale](#15-design-decisions--rationale)
16. [Contact & Credentials Reference](#16-contact--credentials-reference)

---

## 1. Project Overview

### What is SVMB?

A **Marriage Bureau Management System** for **Sri Venkateshwara Marriage Bureau (SVMB)**. It's a single-admin business application that allows the bureau owner to:

- **Receive client biodata via Telegram** (text, photo, PDF)
- **Automatically extract and store** structured data using AI (GPT-4o mini)
- **Manage all clients** through a polished React dashboard
- **Track matches, payments, and activity** in one place

### System Components

| Component | Purpose | Status |
|---|---|---|
| **Supabase Database** | PostgreSQL database, auth, file storage | ✅ Schema ready |
| **React Dashboard** | Admin UI — manage clients, matches, payments | ✅ Built, verified |
| **Make.com Automation** | Telegram bot → AI extraction → DB insertion | ✅ Blueprint ready |

### User Roles

- **Single Admin** — The bureau owner. Only authenticated user in the system.
- **No public access** — The dashboard is fully protected behind Supabase Auth.
- **Sign-ups disabled** — New accounts can only be created manually in Supabase Auth panel.

---

## 2. Tech Stack

### Frontend Dashboard

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.2.6 | UI framework |
| **Vite** | 8.0.12 | Build tool & dev server |
| **Tailwind CSS** | 4.3.1 | Utility-first CSS framework |
| **@tailwindcss/vite** | 4.3.1 | Vite plugin for Tailwind v4 |
| **React Router DOM** | 7.18.0 | Client-side routing |
| **@tanstack/react-table** | 8.21.3 | Data table (Clients page) |
| **Recharts** | 3.8.1 | Charts (Overview page) |
| **Lucide React** | 1.20.0 | Icon library |
| **@supabase/supabase-js** | 2.108.2 | Supabase client SDK |

### Dev Dependencies

| Technology | Version | Purpose |
|---|---|---|
| **@vitejs/plugin-react** | 6.0.1 | React Fast Refresh in dev |
| **ESLint** | 10.3.0 | Code linting |
| **eslint-plugin-react-hooks** | 7.1.1 | React hooks lint rules |
| **eslint-plugin-react-refresh** | 0.5.2 | Fast refresh lint rules |

### Backend & Infrastructure

| Technology | Purpose |
|---|---|
| **Supabase** (PostgreSQL) | Database, Auth, Storage |
| **Supabase Auth** | Email/password authentication |
| **Supabase Storage** | Profile photo uploads (`profile-photos` bucket) |
| **Make.com** | Automation workflow platform |
| **Telegram Bot API** | Input channel for biodata |
| **OpenAI GPT-4o mini** | AI text extraction from unstructured biodata |

### Design System

| Aspect | Details |
|---|---|
| **Theme** | Light Premium — white cards, soft grays, warm amber/gold accents |
| **Font** | Inter (Google Fonts) |
| **Icons** | Lucide React |
| **Animations** | CSS keyframes — fade-in, slide-up, staggered children |
| **Status Colors** | Emerald (success/paid), Rose (danger/not paid), Amber (warning/pending), Blue (info) |
| **Responsive** | Sidebar collapses at 1024px, stacks at 768px |

---

## 3. Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         ADMIN USER                              │
│                                                                 │
│    ┌──────────────────┐         ┌─────────────────────────┐     │
│    │   Telegram App   │         │   React Dashboard       │     │
│    │  (Mobile/Desktop)│         │   (Browser)             │     │
│    └────────┬─────────┘         └──────────┬──────────────┘     │
└─────────────│───────────────────────────────│────────────────────┘
              │                               │
              ▼                               ▼
    ┌─────────────────┐            ┌──────────────────────┐
    │   Make.com       │            │   Supabase           │
    │   Automation     │───────────▶│   (PostgreSQL +      │
    │   (5 branches)   │            │    Auth + Storage)   │
    │                  │            │                      │
    │   ┌───────────┐  │            │   Tables:            │
    │   │ GPT-4o    │  │            │   • clients          │
    │   │ mini      │  │            │   • matches          │
    │   └───────────┘  │            │   • payments         │
    └──────────────────┘            │   • activity_log     │
                                    │   • pending_photos   │
                                    │                      │
                                    │   Bucket:            │
                                    │   • profile-photos   │
                                    └──────────────────────┘
```

### Data Flow

```
1. TELEGRAM INPUT PATH:
   Admin sends message (text/photo/PDF) to Telegram bot
        → Make.com receives via webhook
        → Router sends to correct branch
        → GPT-4o mini extracts structured data
        → Supabase INSERT (clients table)
        → Photo uploaded to Supabase Storage
        → Activity logged
        → Telegram reply sent to admin

2. DASHBOARD PATH:
   Admin opens React dashboard
        → Supabase Auth verifies session
        → Dashboard fetches data via Supabase JS SDK
        → Admin views/edits/manages clients, matches, payments
        → Changes saved directly to Supabase via SDK
        → Activity auto-logged on key actions
```

---

## 4. Project Structure

```
d:\SVMB\
├── supabase-schema.sql           — Full database schema (run once in SQL Editor)
├── make-com-blueprint.json       — Importable Make.com automation (41 KB)
├── make-com-setup-guide.md       — Step-by-step Make.com setup instructions
├── handoff.md                    — THIS FILE
│
└── svmb-dashboard/               — React + Vite dashboard application
    ├── .env                      — Supabase credentials (⚠️ NEVER commit)
    ├── .gitignore                — Git ignore rules (includes .env)
    ├── index.html                — HTML entry point with SEO meta tags
    ├── package.json              — NPM dependencies & scripts
    ├── vite.config.js            — Vite + React + Tailwind v4 config
    ├── dist/                     — Production build output
    │
    └── src/
        ├── main.jsx              — React DOM entry point
        ├── App.jsx               — Router + layout wrapper
        ├── index.css             — Complete design system (14 KB)
        │
        ├── lib/
        │   └── supabase.js       — Supabase client initialization
        │
        ├── hooks/
        │   ├── useAuth.js        — Session management, sign in/out
        │   ├── useClients.js     — Client CRUD, unique code gen, CSV export, stats
        │   ├── useMatches.js     — Match CRUD with joined client data
        │   ├── usePayments.js    — Payment recording + status updates
        │   └── useActivityLog.js — Activity log fetch with filters
        │
        ├── components/
        │   ├── ProtectedRoute.jsx  — Auth guard → redirects to /login
        │   ├── Sidebar.jsx         — Fixed left nav with SVMB branding
        │   ├── MetricCard.jsx      — Color-coded stat card
        │   ├── InlineEditField.jsx — Click-to-edit (text/select/textarea/date)
        │   ├── PhotoUpload.jsx     — Upload to Supabase Storage
        │   └── MatchCard.jsx       — Groom+Bride side-by-side display
        │
        └── pages/
            ├── Login.jsx           — Premium login with gradient background
            ├── Overview.jsx        — 12 metric cards + 4 Recharts charts
            ├── Clients.jsx         — TanStack table, search, filters, CSV export
            ├── ClientDetail.jsx    — Full profile, ALL fields inline-editable
            ├── NewClient.jsx       — Add client form with validation
            ├── Matches.jsx         — Two-column selector + match list
            ├── Payments.jsx        — Payment tracker + modal + history
            └── ActivityLog.jsx     — Full event log with type filter
```

---

## 5. Database Schema

### Supabase Project Details

| Property | Value |
|---|---|
| **Project URL** | `https://kisjhiofaszyggakspnt.supabase.co` |
| **Project ID** | `kisjhiofaszyggakspnt` |
| **Region** | `ap-northeast-2` (Asia Pacific — Seoul) |
| **Schema File** | `supabase-schema.sql` |

### Tables

#### `clients` — Main client profiles (21+ columns)

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, auto-generated | Unique row ID |
| `unique_code` | TEXT | UNIQUE, NOT NULL | e.g. `SVMB-M-101`, `SVMB-F-102` |
| `id_number` | INTEGER | NOT NULL | Sequential number per gender |
| `bureau_type` | TEXT | NOT NULL, default `'own'` | `'own'` or `'partner'` |
| `source_bureau` | TEXT | default `'SVMB'` | Bureau name (e.g. `'SVMB'`, `'MB Krishna'`) |
| `first_name` | TEXT | NOT NULL | Client's first name |
| `last_name` | TEXT | nullable | Client's last name |
| `dob` | DATE | NOT NULL | Date of birth |
| `birth_time` | TEXT | nullable | Birth time (for horoscope) |
| `place_of_birth` | TEXT | nullable | Birthplace |
| `rashi` | TEXT | nullable | Zodiac/Rashi sign |
| `height` | TEXT | NOT NULL | e.g. `'5.6'`, `'5ft 8in'` |
| `education` | TEXT | NOT NULL | Degree/qualification |
| `religion` | TEXT | nullable | Religion |
| `caste` | TEXT | nullable | Caste |
| `gender` | TEXT | nullable | `'Male'` or `'Female'` |
| `address` | TEXT | NOT NULL | Full address |
| `phone` | TEXT | nullable | Phone number |
| `father_name` | TEXT | nullable | Father's name |
| `father_occupation` | TEXT | nullable | Father's occupation |
| `mother_name` | TEXT | nullable | Mother's name |
| `mother_occupation` | TEXT | nullable | Mother's occupation |
| `siblings` | TEXT | nullable | Siblings info (free text) |
| `photo_url` | TEXT | nullable | Public URL from Supabase Storage |
| `payment_status` | TEXT | NOT NULL, default `'Not Paid'` | `'Not Paid'` or `'Paid'` |
| `profile_status` | TEXT | NOT NULL, default `'Active'` | `'Active'`, `'Inactive'`, `'Married'` |
| `match_status` | TEXT | NOT NULL, default `'Unmatched'` | `'Unmatched'`, `'Profiles Sent'`, `'Meeting Scheduled'`, `'Married'` |
| `notes` | TEXT | nullable | Admin notes |
| `created_at` | TIMESTAMPTZ | auto NOW() | Record creation time |
| `updated_at` | TIMESTAMPTZ | auto-trigger | Auto-updates on any field change |

#### `matches` — Male-female pairings

| Column | Type | Description |
|---|---|---|
| `id` | UUID | PK |
| `male_client_id` | UUID → clients(id) | ON DELETE SET NULL |
| `female_client_id` | UUID → clients(id) | ON DELETE SET NULL |
| `suggested_date` | DATE | When match was suggested |
| `male_response` | TEXT | `'Pending'`, `'Accepted'`, `'Rejected'` |
| `female_response` | TEXT | `'Pending'`, `'Accepted'`, `'Rejected'` |
| `meeting_date` | DATE | Scheduled meeting date |
| `outcome` | TEXT | `'Pending'`, `'Meeting Scheduled'`, `'Married'`, `'Rejected'` |
| `notes` | TEXT | Admin notes on match |
| `created_at` | TIMESTAMPTZ | auto |

#### `payments` — Payment records

| Column | Type | Description |
|---|---|---|
| `id` | UUID | PK |
| `client_id` | UUID → clients(id) | ON DELETE CASCADE |
| `amount` | NUMERIC | Payment amount (₹) |
| `paid_date` | DATE | Date of payment |
| `payment_mode` | TEXT | `'Cash'`, `'UPI'`, `'Bank Transfer'`, etc. |
| `receipt_note` | TEXT | Receipt/reference note |
| `created_at` | TIMESTAMPTZ | auto |

#### `activity_log` — Audit trail

| Column | Type | Description |
|---|---|---|
| `id` | UUID | PK |
| `event_type` | TEXT | `'profile_created'`, `'field_edited'`, `'match_created'`, `'payment_recorded'`, `'photo_linked'` |
| `client_id` | UUID → clients(id) | ON DELETE SET NULL |
| `telegram_message` | TEXT | Raw Telegram message (if from bot) |
| `details` | TEXT | Human-readable event description |
| `created_at` | TIMESTAMPTZ | auto |

#### `pending_photos` — Temporary photo-linking queue

| Column | Type | Description |
|---|---|---|
| `id` | UUID | PK |
| `chat_id` | TEXT | Telegram chat ID |
| `client_id` | UUID → clients(id) | ON DELETE CASCADE |
| `expires_at` | TIMESTAMPTZ | 3-minute expiry window |
| `created_at` | TIMESTAMPTZ | auto |

### Database Features

- **`updated_at` auto-trigger** — Fires on every `clients` row update
- **Row Level Security (RLS)** — Enabled on ALL 5 tables; only `authenticated` role has access
- **Storage bucket** — `profile-photos` (public read, authenticated upload/delete)
- **Storage policies** — 4 policies for upload, update, view (public), and delete

### Unique Code Generation Logic

```
Pattern: {BUREAU}-{GENDER_PREFIX}-{SEQUENTIAL_NUMBER}

Own Bureau:    SVMB-M-101, SVMB-M-102, ..., SVMB-F-101, SVMB-F-102, ...
Partner Bureau: {PARTNER_NAME}-M-601, {PARTNER_NAME}-F-601, ...

- Own bureau IDs start from 100+
- Partner bureau IDs start from 600+
- Gender prefix: M = Male, F = Female
- Sequential: queries MAX(id_number) per gender per bureau, then +1
```

---

## 6. React Dashboard

### Pages & Routes

| Route | Page | File | Key Features |
|---|---|---|---|
| `/login` | Login | `Login.jsx` | Email+password, gradient bg, SVMB branding |
| `/` | Overview | `Overview.jsx` | 12 metric cards, 4 charts (donuts + bars) |
| `/clients` | Clients Table | `Clients.jsx` | TanStack Table, 12 columns, search, 5 filter dropdowns, pagination, CSV export |
| `/clients/new` | New Client | `NewClient.jsx` | Full form, bureau toggle, photo upload, auto-ID generation |
| `/clients/:id` | Client Detail | `ClientDetail.jsx` | Every field inline-editable, photo upload, payment & activity history |
| `/matches` | Matches | `Matches.jsx` | Groom/bride selectors, create match, status dropdowns |
| `/payments` | Payments | `Payments.jsx` | Filter by status, record payment modal, payment history table |
| `/log` | Activity Log | `ActivityLog.jsx` | All events, filter by type, newest-first, pagination |

### Components

| Component | File | Purpose |
|---|---|---|
| `ProtectedRoute` | `ProtectedRoute.jsx` | Auth guard — redirects to `/login` if no session |
| `Sidebar` | `Sidebar.jsx` | Fixed left nav with SVMB branding + Lucide icons |
| `MetricCard` | `MetricCard.jsx` | Color-coded stat card with icon, label, value |
| `InlineEditField` | `InlineEditField.jsx` | Click-to-edit — supports text, textarea, select, date |
| `PhotoUpload` | `PhotoUpload.jsx` | Upload to Supabase Storage + replace old photo |
| `MatchCard` | `MatchCard.jsx` | Side-by-side groom+bride display with controls |

### Custom Hooks

| Hook | File | Exports |
|---|---|---|
| `useAuth` | `useAuth.js` | `{ user, session, loading, signIn, signOut }` |
| `useClients` | `useClients.js` | `{ clients, loading, error, refetch }` + `useClient(id)`, `createClient()`, `updateClientField()`, `deleteClient()`, `generateUniqueCode()`, `getClientStats()`, `exportClientsCSV()` |
| `useMatches` | `useMatches.js` | `{ matches, loading, error, createMatch, updateMatch, deleteMatch, refetch }` |
| `usePayments` | `usePayments.js` | `{ payments, loading, error, recordPayment, refetch }` |
| `useActivityLog` | `useActivityLog.js` | `{ logs, loading, error, logEvent, refetch }` |

### Overview Page Metrics (12 cards)

1. Total Clients
2. Male Count
3. Female Count
4. Own Bureau Count
5. Partner Bureau Count
6. Paid
7. Not Paid
8. Active Profiles
9. Inactive Profiles
10. Married Profiles
11. Missing Photos (⚠️ warning)
12. Missing Gender (🔴 critical warning)

### Overview Page Charts (4)

1. **Donut** — Male vs Female distribution
2. **Donut** — Payment status breakdown
3. **Bar** — Match status breakdown
4. **Bar** — Profiles added per month

### Client Table Columns

`Photo` | `Unique Code` | `Name` | `Gender` | `DOB` | `Height` | `Education` | `Phone` | `Bureau` | `Payment` | `Profile Status` | `Match Status`

### Filter Dropdowns

`Gender` | `Payment Status` | `Profile Status` | `Match Status` | `Bureau Type`

---

## 7. Make.com Automation

### Blueprint File

- **File**: `make-com-blueprint.json` (41 KB)
- **Type**: Importable JSON blueprint for Make.com's "Import Blueprint" feature
- **Connections needed**: Telegram Bot, Supabase (service_role), OpenAI

### 5 Router Branches

| Branch | Trigger | What It Does |
|---|---|---|
| **1 — EDIT** | Message starts with `EDIT` | Parses `EDIT CODE field value` → updates client → logs → replies |
| **2 — Photo+Caption** | Photo with text caption | GPT extracts biodata → uploads photo → generates ID → inserts client → replies |
| **3 — Text Only** | Plain text message | GPT extracts biodata → generates ID → inserts client → creates 3-min pending_photo window → replies |
| **4 — Photo Only** | Photo without caption | Checks pending_photos → links if found, saves as unlinked if not |
| **5 — PDF** | PDF document attached | Downloads PDF → GPT extracts biodata → generates ID → inserts client → creates pending_photo → replies |

### Architecture Flow

```
Telegram Message
       ↓
[Watch Updates] → [Router]
                     ├── Branch 1: EDIT command
                     │    └── Parse → Update Supabase → Log → Reply
                     ├── Branch 2: Photo + Caption
                     │    └── GPT extract → Download photo → Upload to Storage
                     │        → Generate ID → Insert → Log → Reply
                     ├── Branch 3: Text Only
                     │    └── GPT extract → Generate ID → Insert
                     │        → Create pending_photo (3-min window) → Log → Reply
                     ├── Branch 4: Photo Only
                     │    └── Check pending_photos → Download → Upload
                     │        ├── Found → Link to client → Delete pending → Reply ✅
                     │        └── Not found → Save as unlinked → Reply ⚠️
                     └── Branch 5: PDF
                          └── Download PDF → GPT extract → Generate ID → Insert
                              → Create pending_photo → Log → Reply
```

### Key Implementation Details

- **AI Model**: GPT-4o mini (can be swapped with Claude Anthropic module — same prompt)
- **Partner Bureau Detection**: Looks for any word containing `mb` (case-insensitive) in message text
- **Pending Photo Window**: 3 minutes — after expiry, photos are stored as "unlinked"
- **Photo Storage**: All photos stored permanently in Supabase Storage (not Telegram file URLs)
- **Supabase Key**: Uses `service_role` key (NOT anon key) to bypass RLS for server-side operations

---

## 8. Authentication & Security

### Auth Architecture

- **Provider**: Supabase Auth (email + password)
- **Sign-ups**: **DISABLED** — only admin creates accounts manually from Supabase dashboard
- **Session**: Managed by `@supabase/supabase-js` with `localStorage` auto-persistence
- **Auth Guard**: `ProtectedRoute.jsx` wraps all dashboard routes; redirects to `/login` if no session
- **Auth Hook**: `useAuth.js` provides `{ user, session, loading, signIn, signOut }`

### Row Level Security (RLS)

- **Enabled on ALL 5 tables**
- **Policy**: Only `authenticated` role can SELECT/INSERT/UPDATE/DELETE
- **No public access** to any database table

### Storage Security

- `profile-photos` bucket is set to **public read** (so photos can be displayed in the dashboard)
- Upload, update, and delete require **authenticated** user
- Make.com uses the `service_role` key which bypasses all RLS

### Secrets Management

| Secret | Where Used | Exposure Risk |
|---|---|---|
| `VITE_SUPABASE_URL` | `.env` → frontend | Low — public project URL |
| `VITE_SUPABASE_ANON_KEY` | `.env` → frontend | Low — limited by RLS |
| Supabase `service_role` key | Make.com only | ⚠️ HIGH — bypasses RLS. NEVER expose in frontend |
| OpenAI API Key | Make.com only | ⚠️ HIGH — billed per use |
| Telegram Bot Token | Make.com only | ⚠️ MEDIUM — controls bot |

---

## 9. Environment Variables & Secrets

### Dashboard `.env` (in `svmb-dashboard/`)

```env
VITE_SUPABASE_URL=https://kisjhiofaszyggakspnt.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

> ⚠️ **`.env` is in `.gitignore`** — never commit this file to version control.

### Make.com Connections (configured in Make.com UI)

| Connection | What to Provide |
|---|---|
| **Telegram Bot** | Bot Token from @BotFather |
| **Supabase** | Project URL + `service_role` key (from Supabase → Settings → API) |
| **OpenAI** | API key from platform.openai.com |

---

## 10. Setup & Installation

### Prerequisites

- **Node.js** 18+ (recommend 20+)
- **npm** 9+
- **Supabase account** with a project created
- **Make.com account** (free tier works for testing)
- **Telegram Bot** created via @BotFather
- **OpenAI API key** with credits

### Step-by-Step Setup

#### Phase 1 — Database

1. Open Supabase → SQL Editor
2. Paste the entire contents of `supabase-schema.sql`
3. Click **Run** — all 5 tables, triggers, RLS policies, and storage bucket will be created
4. Go to Authentication → Settings → **Disable Sign Ups**
5. Go to Authentication → Users → **Add User** (create your admin email + password)

#### Phase 2 — Dashboard

```bash
# 1. Navigate to the dashboard directory
cd d:\SVMB\svmb-dashboard

# 2. Install dependencies (already done, but run if node_modules is missing)
npm install

# 3. Edit .env with your Supabase credentials
#    VITE_SUPABASE_URL=https://your-project.supabase.co
#    VITE_SUPABASE_ANON_KEY=your-anon-key

# 4. Start dev server
npm run dev
# → Opens at http://localhost:5173/

# 5. Login with the admin credentials you created in Step 5 of Phase 1
```

#### Phase 3 — Make.com Automation

1. Open Make.com → Scenarios → **Create a new scenario**
2. Click **⋯ (three dots)** → **Import Blueprint** → upload `make-com-blueprint.json`
3. Assign 3 connections: Telegram Bot, Supabase (`service_role`), OpenAI
4. Add error handlers on each branch (see `make-com-setup-guide.md`)
5. Turn on the scenario → Click **Run once** → test with sample messages

---

## 11. Build & Deployment

### NPM Scripts

| Script | Command | Purpose |
|---|---|---|
| `dev` | `vite` | Start dev server (http://localhost:5173/) |
| `build` | `vite build` | Production build → `dist/` folder |
| `preview` | `vite preview` | Preview production build locally |
| `lint` | `eslint .` | Run ESLint |

### Production Build

```bash
npm run build
# Output: dist/ folder
# Size: ~922 KB JS + ~17 KB CSS (verified, zero errors)
```

### Deployment Options

| Platform | How To |
|---|---|
| **Vercel** | `npm i -g vercel && vercel` — auto-detects Vite. Set env vars in Vercel dashboard. |
| **Netlify** | Connect GitHub repo. Build command: `npm run build`. Publish dir: `dist`. Set env vars. |
| **Supabase Hosting** | If available in your plan, deploy directly from Supabase dashboard. |
| **Any static host** | Upload the `dist/` folder. It's a static SPA. |

### Important Deployment Notes

- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables on your hosting platform
- For SPA routing, configure the host to redirect all routes to `index.html` (Vercel/Netlify do this automatically)
- No server-side rendering — this is a pure client-side SPA

---

## 12. Known Issues & Limitations

### Current Issues

| # | Issue | Severity | Details |
|---|---|---|---|
| 1 | **No "Partial" payment status** | Info | Intentionally removed per admin request. Only `Not Paid` and `Paid` exist. |
| 2 | **No real-time subscriptions** | Low | Dashboard doesn't auto-refresh when Telegram bot adds data. User must manually refresh the page. |
| 3 | **No pagination on server** | Low | All clients are fetched at once. Works fine for <1000 clients. May slow down beyond that. |
| 4 | **No multi-user support** | Info | Single admin by design. No role-based access control. |
| 5 | **No undo/version history** | Low | Edits are immediate and permanent. No rollback mechanism. |
| 6 | **Missing gender handling** | Low | Clients with no gender get `unique_code = 'PENDING'` and `id_number = 0`. Must be fixed manually. |
| 7 | **Photo-only message (no pending)** | Low | If admin sends a photo without a recent text message, it's stored as "unlinked" with a warning. Must be linked manually from dashboard. |
| 8 | **No offline support** | Info | Dashboard requires internet. No service worker or PWA features. |
| 9 | **Supabase free tier limits** | Medium | Free tier has storage, bandwidth, and auth limits. Monitor usage. |
| 10 | **No data backup** | Medium | No automated backup of Supabase data. Supabase Pro plan includes daily backups. |

### Browser Compatibility

- **Tested on**: Chrome 120+, Edge 120+
- **Should work on**: Firefox 120+, Safari 17+
- **Not tested on**: Older browsers, mobile browsers

---

## 13. Future Upgrades & Roadmap

### Priority 1 — High Impact

| Upgrade | Description | Complexity |
|---|---|---|
| **Real-time data sync** | Use Supabase Realtime subscriptions so dashboard auto-updates when bot adds data | Medium |
| **Server-side pagination** | Add `.range()` to Supabase queries for large datasets (1000+ clients) | Low |
| **Automated backups** | Set up daily DB exports or upgrade to Supabase Pro for auto-backups | Low |
| **Print biodata PDF** | Generate a formatted PDF of client profile for sharing with other bureaus | Medium |
| **WhatsApp integration** | Add WhatsApp as an alternative input channel alongside Telegram | High |

### Priority 2 — Nice to Have

| Upgrade | Description | Complexity |
|---|---|---|
| **Dark mode toggle** | Add dark theme support (CSS variables are already structured for this) | Low |
| **Mobile responsive** | Further optimize for phone screens (currently responsive but desktop-first) | Medium |
| **Search improvements** | Add fuzzy search, advanced filters (age range, caste, location radius) | Medium |
| **Match compatibility scoring** | AI-powered match suggestions based on age, education, location, preferences | High |
| **Notification system** | Push notifications / email alerts for new clients, pending payments, match updates | Medium |
| **Multi-language support** | Telugu/Hindi interface for non-English speaking admins | Medium |
| **Bulk import** | CSV/Excel import for existing client data migration | Medium |
| **Client self-service portal** | Let clients view their own profile and matches (separate auth flow) | High |

### Priority 3 — Advanced

| Upgrade | Description | Complexity |
|---|---|---|
| **PWA (Progressive Web App)** | Offline support, installable on mobile, push notifications | Medium |
| **Multi-admin RBAC** | Role-based access control for multiple bureau employees | High |
| **Analytics dashboard v2** | Revenue tracking, conversion rates, monthly/quarterly reports | Medium |
| **Supabase Edge Functions** | Move unique code generation to server-side for race condition safety | Medium |
| **Automated follow-ups** | Schedule Telegram reminders for pending payments, inactive profiles | High |
| **Photo auto-compress** | Resize and compress uploaded photos to save storage | Low |

---

## 14. Troubleshooting Guide

### Dashboard Issues

| Problem | Solution |
|---|---|
| **Blank white screen** | Check browser console for errors. Likely missing `.env` values. |
| **Login fails** | Verify Supabase URL and anon key in `.env`. Check that admin user exists in Supabase Auth. Restart dev server after `.env` changes. |
| **"Supabase credentials not configured"** | The `.env` file is missing or has invalid values. Must start with `https://`. |
| **Data not loading** | Check Supabase is reachable. Verify RLS policies exist. Check browser console for 401/403 errors. |
| **Photos not displaying** | Verify `profile-photos` bucket exists and is set to public. Check storage policies. |
| **CSV export empty** | Ensure clients exist. The export downloads all currently filtered clients. |
| **Build fails** | Run `npm install` first. Check Node.js version (18+ required). |

### Make.com / Telegram Issues

| Problem | Solution |
|---|---|
| **"No data was returned"** | Supabase query returned no rows. Verify table names match schema exactly. Run the SQL schema first. |
| **"Invalid API key"** | Check Supabase `service_role` key (NOT anon key). Check OpenAI API key has credits. |
| **Bot not responding** | Ensure scenario is ON and in **immediate** mode (not scheduled). Check Telegram Watch Updates shows "Listening". Verify bot token. |
| **Photo upload fails** | Ensure `profile-photos` bucket exists. Check storage policies. Bucket must be public. |
| **EDIT command not working** | Format: `EDIT [CODE] [field] [value]`. Field names must match DB columns exactly. Code must exist in DB. |
| **GPT extraction wrong** | Review the prompt in the OpenAI module. Unstructured biodata may need prompt tuning. |

### Supabase Issues

| Problem | Solution |
|---|---|
| **Schema SQL fails** | Run the entire file at once. If storage bucket section fails, create it manually from Dashboard → Storage. |
| **RLS blocking access** | Check that policies exist for `authenticated` role. In dashboard, you should see green checkmarks on each table. |
| **Storage bucket missing** | Create manually: Dashboard → Storage → New Bucket → name: `profile-photos` → public: yes. |
| **Auth not working** | Check that sign-ups are disabled. Verify admin user was created with correct email/password. |

---

## 15. Design Decisions & Rationale

### Why This Tech Stack?

| Decision | Rationale |
|---|---|
| **React + Vite** | Fast dev experience, modern tooling, large ecosystem. Vite is significantly faster than Create React App. |
| **Tailwind CSS v4** | Utility-first CSS with zero runtime cost. v4 uses the new `@tailwindcss/vite` plugin (no `tailwind.config.js` needed). |
| **Supabase** | All-in-one backend: PostgreSQL + Auth + Storage + Realtime. Free tier generous for small business. |
| **Make.com** | No-code automation that the admin can modify without developer help. Visual editor. |
| **GPT-4o mini** | Cheapest OpenAI model that handles unstructured text extraction reliably. ~$0.15 per 1M input tokens. |
| **Single admin, no multi-tenancy** | SVMB is a small family business. Multi-user adds complexity with no current need. |

### Why Light Theme?

- Admin requested light colors during planning
- Cleaner for data-heavy dashboard with tables and forms
- Premium feel with amber/gold accents on white cards
- Better for printing (if ever needed)

### Why "Partial" Payment Removed?

- Admin requested removal during the build
- Simplifies payment tracking to binary: `Not Paid` / `Paid`
- Can be re-added by modifying the enum values in schema and frontend dropdowns

### Why Client-Side Unique Code Generation?

- Simpler to implement without Supabase Edge Functions
- Works for single-admin use (no race conditions)
- ⚠️ Should be moved to server-side (Edge Function) if multi-user is ever added

### Why Pending Photos (3-min Window)?

- Telegram bot can't always receive photo + text in one message
- Admin typically sends text biodata first, then photo
- 3-minute window auto-links the photo to the most recent client
- After 3 minutes, photo is stored as "unlinked" to prevent misattribution

---

## 16. Contact & Credentials Reference

### Credentials Checklist

| Item | Where to Find | Status |
|---|---|---|
| Supabase Project URL | Supabase Dashboard → Settings → API | ✅ Configured |
| Supabase Anon Key | Supabase Dashboard → Settings → API | ✅ Configured in `.env` |
| Supabase Service Role Key | Supabase Dashboard → Settings → API | ⚠️ Needed for Make.com |
| Admin Email/Password | Supabase Dashboard → Authentication → Users | ⚠️ You created this |
| Telegram Bot Token | @BotFather on Telegram | ⚠️ Needed for Make.com |
| OpenAI API Key | platform.openai.com/api-keys | ⚠️ Needed for Make.com |
| Make.com Account | make.com | ⚠️ Needed for automation |

### File Inventory

| File | Size | Description |
|---|---|---|
| `supabase-schema.sql` | 7.4 KB | Complete database schema — run once |
| `make-com-blueprint.json` | 41.2 KB | Importable Make.com automation |
| `make-com-setup-guide.md` | 5.9 KB | Step-by-step Make.com setup guide |
| `handoff.md` | — | This document |
| `svmb-dashboard/` | — | Full React dashboard application |

### Key URLs

| Service | URL |
|---|---|
| Supabase Dashboard | https://supabase.com/dashboard/project/kisjhiofaszyggakspnt |
| Make.com | https://www.make.com |
| Local Dev Server | http://localhost:5173/ |
| Telegram BotFather | https://t.me/BotFather |
| OpenAI API Keys | https://platform.openai.com/api-keys |

---

> **End of Handoff Document**
> 
> This document is the single source of truth for the SVMB project. Keep it updated as changes are made.
