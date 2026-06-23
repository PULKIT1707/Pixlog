# pixlog

**Draw pixel art on your GitHub contribution graph using real commits.**

Type text or paint cells on a 52×7 grid that mirrors GitHub's contribution graph. Pixlog generates a repo and pushes the exact number of backdated commits needed to produce your design — no local git, no personal access tokens, no credentials ever leave your browser.

---

## How it works

1. **Sign in with GitHub** — OAuth via a GitHub App (read-only scopes for auth, write via installation token)
2. **Draw** — paint cells at intensity 1–4, or type text with the built-in 5×7 bitmap font
3. **Pick a repo and year** — select an existing repo or create a new one; pick any past year
4. **Generate** — Pixlog calls the GitHub Git Data API to create backdated commits at the exact timestamps needed; progress updates live via polling
5. **Share** — a modal with pre-filled LinkedIn / X captions appears on completion; add your piece to the public community gallery with one click

Existing contributions are fetched via the GitHub GraphQL API and shown as locked blue cells so your real activity is never overwritten.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Auth | NextAuth v5 beta + GitHub App |
| Database / queue | Supabase (Postgres) |
| Commit engine | GitHub Git Data API via `@octokit/rest` |
| Styling | Tailwind CSS v4 |
| Language | TypeScript |
| Runtime | Node.js (worker) + Edge (OG image) |

---

## Project structure

```
src/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── editor/page.tsx           # Main editor
│   ├── gallery/
│   │   ├── page.tsx              # Community gallery
│   │   └── [id]/page.tsx         # Individual gallery item + OG meta
│   └── api/
│       ├── auth/[...nextauth]/   # NextAuth handler
│       ├── contributions/        # GitHub GraphQL → existing commit cells
│       ├── jobs/                 # POST create job / GET poll status
│       ├── gallery/              # GET paginated gallery / POST submit
│       └── og/                   # Dynamic OG image (edge runtime)
├── components/
│   ├── editor/
│   │   ├── PixelGrid.tsx         # 52×7 interactive grid
│   │   ├── FontInput.tsx         # Text → grid via 5×7 bitmap font
│   │   ├── IntensityPicker.tsx   # Intensity level selector (1–4)
│   │   ├── YearPicker.tsx        # Year dropdown
│   │   ├── RepoSelector.tsx      # Repo dropdown + "create new" mode
│   │   ├── RepoDetails.tsx       # Live repo stats from GitHub REST API
│   │   ├── InstallGate.tsx       # Warning banner when App not installed
│   │   └── ShareModal.tsx        # Post-generation share + gallery submit
│   └── gallery/
│       ├── GalleryGrid.tsx       # Paginated gallery with cards
│       ├── MiniPixelGrid.tsx     # Tiny pixel art preview
│       └── CopyLinkButton.tsx    # Copy-to-clipboard with feedback
├── hooks/
│   └── useUndoRedo.ts            # 50-step undo/redo history stack
├── lib/
│   ├── auth.ts                   # NextAuth config
│   ├── env.ts                    # Zod-validated environment variables
│   └── supabase/
│       ├── client.ts             # Browser Supabase client
│       └── server.ts             # Server Supabase client (service role)
├── types/
│   └── index.ts                  # PixelGrid, IntensityLevel, etc.
└── worker.ts                     # Background job processor (polls Supabase)

supabase/migrations/
├── 000_jobs.sql                  # Job queue table
└── 001_gallery.sql               # Public gallery table
```

---

## Local setup

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- A [GitHub App](https://github.com/settings/apps/new) (see below)

### 1. Clone and install

```bash
git clone https://github.com/PULKIT1707/Pixlog.git
cd Pixlog
npm install
```

### 2. Create a GitHub App

Go to **GitHub → Settings → Developer settings → GitHub Apps → New GitHub App**.

| Field | Value |
|---|---|
| GitHub App name | anything (e.g. `pixlogapp`) |
| Homepage URL | `http://localhost:3000` |
| Callback URL | `http://localhost:3000/api/auth/callback/github` |
| Webhook | disabled |
| **Repository permissions** | Contents: Read & Write |
| Where can this app be installed? | Any account |

After creation:
- Note the **App ID** and **App Slug**
- Generate a **Private Key** (downloads a `.pem` file)
- Note the **Client ID** and generate a **Client Secret**

### 3. Configure environment variables

Create `.env.local` in the project root:

```env
# GitHub App
GITHUB_APP_ID=your_app_id
GITHUB_APP_SLUG=your_app_slug
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret

# NextAuth
NEXTAUTH_SECRET=run_openssl_rand_-base64_32
NEXTAUTH_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Private key format:** paste the entire `.pem` contents as a single-line string with literal `\n` between lines, wrapped in double quotes.

### 4. Run database migrations

In your Supabase dashboard → **SQL Editor**, run both migration files in order:

```
supabase/migrations/000_jobs.sql
supabase/migrations/001_gallery.sql
```

### 5. Start the app

Open two terminals:

```bash
# Terminal 1 — Next.js dev server
npm run dev

# Terminal 2 — background job worker
npx tsx src/worker.ts
```

Open [http://localhost:3000](http://localhost:3000).

---

## How commits are generated

Each painted cell maps to a commit count based on intensity:

| Intensity | Commits per cell | Color |
|---|---|---|
| 1 | 1 | Light green |
| 2 | 4 | |
| 3 | 9 | |
| 4 | 16 | Dark green |

Pixlog uses the **GitHub Git Data API** (`POST /repos/{owner}/{repo}/git/commits`) to create commits with `author.date` set to the target date of each cell. No local git binary is required — everything runs server-side via an installation token issued by the GitHub App.

---

## Features

- **Text rendering** — type any string and it renders in a 5×7 pixel bitmap font across the grid
- **Undo / redo** — 50-step history, keyboard shortcuts `⌘Z` / `⌘⇧Z`
- **Existing activity protection** — your real contribution cells are fetched and shown in blue; they cannot be painted over
- **Live repo details** — stars, forks, language, and last push appear instantly when you select a repo
- **Progress bar** — real-time commit push progress (polls every 2 seconds)
- **Community gallery** — public grid of submitted pixel art at `/gallery`
- **Shareable permalinks** — each piece gets a `/gallery/[id]` page with a dynamic OG image for rich link previews on LinkedIn and X
- **Share modal** — pre-filled captions for LinkedIn and X generated automatically on job completion

---

## Deployment

### Next.js app (Vercel)

Push to GitHub and import the repo in [Vercel](https://vercel.com). Add all `.env.local` variables as environment variables in the Vercel project settings.

### Worker (Railway / Render / Fly.io)

The worker (`src/worker.ts`) is a long-lived Node.js process that polls Supabase every 2 seconds for pending jobs. Deploy it separately on any platform that supports persistent processes. It only needs the Supabase and GitHub App environment variables.

```bash
npx tsx src/worker.ts
```

---

## Contributing

PRs welcome. Open an issue first for anything beyond a small bug fix.

---

## License

MIT
