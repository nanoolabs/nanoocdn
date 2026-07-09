# Nanoo CDN v2.2.0

High performance, secure edge proxy using cloudflare workers and backblaze B2.
zero egress costs, 3ms-9ms TTFB, and AWS SigV4 security

## Quick start

1. **Install:** `pnpm install`
2. **Setup:** `pnpm run setup` and add your `B2_APPLICATION_KEY` to `.dev.vars`
3. **Dev:** `pnpm dlx wrangler dev` (testing at `http://localhost:8787`)
4. **Deploy:** `pnpm dlx wrangler deploy`

## Project Structure

```text
.
├── src/
│   ├── index.js          # Core Worker Logic (Entry Point)
│   └── lib/
│       ├── home.js       # Minimalist Home Page
│       ├── cache.js      # Edge Caching Logic
│       ├── signer.js     # AWS SigV4 Signing (B2)
│       └── utils.js      # Helpers & Path Sanitization
├── public/               # Cloudflare Static Assets
│   └── assets/
│       └── fonts/        # Geist Mono (.woff2)
├── .dev.vars.example     # Local dev env template
├── ARCHITECTURE.md       # System Design
├── CHANGELOG.md          # History this Repository
├── wrangler.toml         # Wrangler configuration
└── package.json          # Dependencies & scripts
```

## Documentation

- **[Architecture & flow](ARCHITECTURE.md)**: Deep dive to the request lifecycle and mermaid diagrams
- **[Changelog](CHANGELOG.md)**: Track the latest updates and v2.0 improvements

## Credit

Based on the [cloudflare-b2](https://github.com/backblaze-b2-samples/cloudflare-b2) implementation by backblaze

## License

Licensed under MIT and Apache 2.0

> Original implementation by Pat Patterson (@backblaze). Refactored, secured, and modernized by Nanoo Labs
