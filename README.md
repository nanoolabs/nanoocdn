# Nanoo CDN [⌐■_■]

> Edge proxy for Nanoo Labs assets. Zero egress cost, fast TTFB, and SigV4 security using Cloudflare Workers and Backblaze B2

`pnpm` `Cloudflare Workers` `Backblaze B2` `aws4fetch`

## 📖 Overview

Deliver assets fast and secure for the Nanoo Labs ecosystem.
Proxies a private Backblaze B2 bucket throug Cloudflare Workers with AWS SigV4 signing, edge caching, and CORS enforcement. No egress costs. Origin stays hidden.

## 🏗️ Architecture & Tech Stack

- **Runtime:** Cloudflare worker (V8 Isolate)
- **Auth:** AWS SigV4 via `aws4fetch`
- **Storage:** Backblaze B2 (S3-compatible)
- **Cache:** Cloudflare Cache API
- **Language:** Vanilla JS (no build step)

## 🚀 Quickstart

```bash
# 1. Install and setup env
pnpm install
pnpm run setup

# 2. Add B2 credentials to .dev.vars
     B2_APPLICATION_KEY = "your-key"
     ALLOWED_ORIGINS = "http://localhost:8787,http://localhost:5173"

# 3. Run dev server
pnpm dlx wrangler dev

# 4. Deploy to Cloudflare
pnpm dlx wrangler deploy

# 5. Set production secrets (other var in wrangler.toml)
pnpm dlx wrangler secret put B2_APPLICATION_KEY
pnpm dlx wrangler secret put ALLOWED_ORIGINS
```

## 📂 Project Structure

```text
├── src/
│   ├── index.js          # Worker entry point
│   └── lib/
│       ├── signer.js     # AWS SigV4 signing
│       ├── cache.js      # Edge cache logic
│       ├── utils.js      # Helper
│       └── home.js       # Home page and 404 page
├── public/
│   └── assets/           # CSS and fonts
├── .dev.vars.example     # Env template
├── wrangler.toml         # Worker config
└── ARCHITECTURE.md       # System design
```

## ⚙️ Development & Ops

- **Format:** `pnpm run format` (Prettier, no-semi)
- **Deploy:** Auto on push to `main` via GitHub actions
- **Secrets:** use `wrangler secret put <KEY>` for production
- **No build step** — pure JS

---

## 🌐 Nanoo Labs Ecosystem

Part of [nanoolabs.dev](https://nanoolabs.dev) ecosystem.

## 🤝 Contributing

1. Branch from `main` to `feat/name-feature`.
2. Run `pnpm run format` before push.
3. Use Conventional Commits (e.g. `feat: add cache invalidation`).

## 📜 License

MIT and Apache 2.0 — Nanoo Labs © 2026.

---

*Based on [cloudflare-b2](https://github.com/backblaze-b2-samples/cloudflare-b2) template by Pat Patterson (@backblaze). Refactored and extended by Nanoo Labs.*
