# Project Structure

```text
.
├── src/
│   ├── index.js          # Core Worker Logic (Entry Point)
│   └── lib/
│       ├── home.js       # Minimalist Home Page (V2.1.2)
│       ├── cache.js      # Edge Caching Logic
│       ├── signer.js     # AWS SigV4 Signing (B2)
│       └── utils.js      # Helpers & Path Sanitization
├── public/               # Cloudflare Static Assets
│   └── assets/
│       └── fonts/        # Geist Mono (.woff2)
├── templates/            # Centralized Config Templates
│   ├── dev.vars.example
│   └── cors.json.example
├── ARCHITECTURE.md       # System Design
├── CHANGELOG.md          # History this Repository
├── README.md             # The Face of Nanoo Labs
├── wrangler.toml         # Ecosystems as Code (2024-09-25)
└── package.json          # Node v22 LTS Dependencies
```
