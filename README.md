# 🦊 Zoroark Card Tracker

A personal collection tracker for every Zoroark card ever printed. Built with Next.js, Supabase, and Discord webhooks. Targeting 3× copies of every variant, sorted by region → release date.

## Tech stack

- **Next.js 14** (App Router) on **Vercel** — free tier, deploys from GitHub automatically
- **Supabase** — free managed Postgres + file storage for card images
- **NextAuth** with **Discord OAuth** — you log in with your own Discord account; only your user ID can edit
- **Discord webhooks** — weekly alerts for new cards found and missing images, with confirm links back to the site
- **Pokémon TCG API** (pokemontcg.io) — English card data + images
- **TCGdex API** (tcgdex.dev) — Japanese (and other region) card data

## Features

- 📊 Progress bars: overall, per-region, per-language
- 🃏 Card grid with stacked copy display (desktop: 3-slot stack, mobile: single card with counter)
- 🔍 Quick search by card number, name, or set
- 🗂️ Binder view showing cards in your exact binder order
- 👻 Cards are transparent/ghosted when you own 0 copies
- 🔔 Weekly Discord alert when new Zoroark cards are found
- 🖼️ Weekly Discord alert for cards with missing images + admin uploader
- 🔐 Public read, admin-only write (Discord OAuth)

## Setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/zoroark-tracker.git
cd zoroark-tracker
npm install
```

### 2. Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run `supabase/migrations/001_initial.sql`
3. Then run `supabase/migrations/002_seed.sql` to import your collection data
4. Go to Storage → New bucket → name it `card-images`, set to **public**
5. Copy your Project URL and anon key from Settings → API

### 3. Discord OAuth app

1. Go to [discord.com/developers](https://discord.com/developers/applications) → New Application
2. OAuth2 → Add redirect: `https://YOUR-VERCEL-URL.vercel.app/api/auth/callback/discord`  
   (also add `http://localhost:3000/api/auth/callback/discord` for local dev)
3. Copy Client ID and Client Secret

### 4. Discord webhook

1. In your Discord server: channel Settings → Integrations → Webhooks → New Webhook
2. Copy the webhook URL

### 5. Your Discord user ID

1. Enable Developer Mode in Discord (User Settings → Advanced)
2. Right-click your name → Copy User ID

### 6. Environment variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

### 7. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel
vercel

# Add all env vars to Vercel dashboard or via CLI:
vercel env add NEXT_PUBLIC_SUPABASE_URL
# ... etc for each variable
```

The `vercel.json` configures two weekly cron jobs:
- Monday 10am: scan for new Zoroark cards
- Monday 11am: check for missing images

Vercel will call these with your `CRON_SECRET` in the Authorization header.

### 8. Pokémon TCG API key (optional but recommended)

Free key at [pokemontcg.io](https://pokemontcg.io) — removes rate limits on the card scanner.

## Adding new regions

The database `region` column accepts: `EN`, `JP`, `CN`, `KR`, `DE`, `FR`, `IT`, `ES`, `PT`, `OTHER`.

To add cards from a new region, use the admin panel or insert directly into Supabase. The TCGdex scanner can be extended for new languages in `lib/tcgdex.ts`.

## Project structure

```
app/                    Next.js App Router pages + API routes
  api/auth/             Discord OAuth (NextAuth)
  api/cards/            GET cards, PATCH copy count
  api/scan/             Weekly scanner (cron endpoint)
  api/admin/            Image upload endpoint
  binder/               Binder view page
  admin/                Admin image management
components/
  CardGrid.tsx          Main collection view with search/filter
  CardTile.tsx          Individual card with stacked copies display
  ProgressBar.tsx       Collection progress tracking
  Header.tsx            Nav + auth button
lib/
  supabase.ts           Supabase client + Card type
  tcg-api.ts            Pokémon TCG API (EN cards)
  tcgdex.ts             TCGdex API (JP + other regions)
  discord.ts            Discord webhook notifications
  auth.ts               Admin check helper
supabase/
  migrations/
    001_initial.sql     Schema
    002_seed.sql        Your 124 cards imported from Excel
vercel.json             Cron job schedule (weekly, Monday)
```

## License

MIT
