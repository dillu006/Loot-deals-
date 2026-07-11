# LootLe

India's crazy-price loot deal discovery app. Live deals, ranked by a
Loot Score — not raw discount % — so a genuinely wanted product at a
shocking price beats a fake-MRP trick every time.

## Files

- `index.html` — the whole app (PWA, installable, works offline for
  the last-loaded deals). No build step, no dependencies.
- `api/deals.js` — a Vercel serverless function that serves the live
  feed. It rotates a subset of your deal pool every minute, so deals
  genuinely appear and expire on their own — no manual editing needed
  minute to minute.
- `deals.json` — a human-readable reference copy of the deal pool
  (handy for editing by hand and eyeballing what's in rotation). It's
  not read by the live app anymore — `api/deals.js` is.

## How to deploy

1. Push this folder to a GitHub repo.
2. Import the repo into **Vercel** (Netlify's free tier doesn't run
   this kind of function the same way — stick with Vercel). No build
   settings needed.
3. Done. Your app is live at the Vercel URL, and the feed rotates
   every minute automatically — nobody needs to touch anything for
   that part to keep happening.

## How live rotation works

`api/deals.js` holds a `POOL` array of real deals. On every request,
it derives which deals are "live right now" purely from the current
clock minute (no database) — so:

- Every visitor in the same minute sees the identical feed.
- Next minute, some deals age out (`expiresAt` passes) and different
  ones from the pool rotate in.
- The frontend already polls this endpoint every 60 seconds and drops
  expired entries — that part needed no changes.

This is a real stopgap, not a trick: it's honestly rotating your
actual `POOL` deals, just without a live scraping/affiliate-API feed
behind it yet.

## How to update the deal pool

Edit the `POOL` array directly inside `api/deals.js` (each entry:
`title, store, category, price, mrp, image, link`) and push. This is
also where you manually add Blinkit/Zepto ₹1-loot deals, since those
still have no public API. Optionally mirror the same entries into
`deals.json` so you have a readable master copy.

## How ranking works

Every deal gets a **Loot Score (0–10)**, shown as a 🎯 badge on every
card:

- **Price Shock** — how dramatic the MRP-to-price drop feels
- **Demand** — recognizable brand + frequently-bought category
- **Value Gap** — real rupees saved, normalized by category
- **Trust** — capped hard if the MRP looks inflated (>30x price) or
  the link is a search page instead of the exact product

Top Loot and the live ticker sort by this score, not discount %.

## What's not automated yet

- No live price-fetching from real stores — `POOL` in `api/deals.js`
  is manually maintained until you wire in a real data source (e.g.
  Flipkart Affiliate API). The minute-by-minute add/remove is real;
  the underlying prices are as fresh as your last edit to `POOL`.
- Blinkit/Zepto have no public API — those entries need manual
  curation inside `POOL`.
