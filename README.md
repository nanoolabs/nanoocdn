# Nanoo CDN

A high-performance CDN edge proxy for nanoo.cloud. it uses Cloudflare Workers to serve files securely from a private Backblaze B2 bucket.

This project is based on the cloudflare-b2 implementation.

## Architecture

This service works as a bridge between users and private storage.

Client -> Cloudflare Worker -> Backblaze B2

The B2 bucket is private. The Worker signs each request using AWS Signature Version 4 and fetches the file from the B2 endpoint. This prevents unauthorized access to your files.

### Benefits
- No Egress Cost: Moving data from Backblaze B2 to Cloudflare is free because of the Bandwidth Alliance.
- Edge Caching: Files are cached at Cloudflare edge nodes. This makes delivery faster and reduces costs.
- Security: Directory listing is disabled. The Worker uses a restricted key that can only read from the nanoo-assets bucket.

<!-- ## Repository Structure

Files in the B2 bucket are organized into these folders ():

- brands/: logos, banners, and icons for Nanoo Cloud.
- ui/: images and icons for the user interface.
- public/: general files like fonts and global styles. -->

## Getting Started

### Prerequisites
- pnpm installed.
- A Cloudflare account with the domain nanoo.cloud.
- A Backblaze B2 account with a private bucket.

### Local Development
1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Create a .dev.vars file from the .dev.vars.template and add your B2_APPLICATION_KEY.
3. Start the development server:
   ```bash
   pnpm dlx wrangler dev
   ```

### Deployment
Deployment is done with Wrangler. You must save your secrets in Cloudflare:

```bash
# Save your B2 Secret Key (run this once)
pnpm dlx wrangler secret put B2_APPLICATION_KEY
```

# Deploy to production
```bash
pnpm dlx wrangler deploy
```

## License
This project is licensed under the MIT License and Apache License 2.0.