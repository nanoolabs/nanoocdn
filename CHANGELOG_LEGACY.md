# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2026-06-14

### Added

- Added **CORS and Referer checks** to keep assets safe.
- Added support for **wildcards (\*)** in the allowed origins list.
- Allowed **direct access** to files for easier sharing and debugging.
- Added automatic `OPTIONS` request handling for browsers.
- Added **Origin Shield** to hide private information from Backblaze B2.

### Changed

- Removed strict Bearer token login to make using the CDN easier.

## [2.1.3] - 2026-05-31

### Added

- Implement "Unified 404" strategy: mask origin errors (403, 500) with a custom 404 page
- Automated header stripping (`x-amz-*`, `x-bz-*`, `Server`) for origin shield
- Custom minimalist 404 error page matching brand identity

## [2.1.2] - 2026-05-31

### Changed

- Switch font from Geist Sans to Geist Mono for a more technical look
- Update compatibility_date to 2024-09-25 and enable static assets

## [2.1.1] - 2026-05-31

### Added

- Smart Cache Control header base on file extensions (v2.1.1)

### Fixed

- Clean up git cache to ignore `cors.json`
- Resolve variable redeclaration in `src/index.js`
- Update Node.js version to v22 in GitHub Action
- Rollback `compatibility_date` to 2023-09-04 for stability

## [2.1.0] - 2026-05-30

### Added

- New Minimalist Home page (src/lib/home.js)
- Ecosystem adjustment and centralize template management
- Cloudflare static assets support (currently disable in config)

## [2.0.0] - 2026-05-18

### Added

- Integration Cloudflare cache API for 300x faster TTFB (3ms-9ms on HIT)
- Refactore codebase to `src/` and `src/lib/` for better maintain
- Add `ARCHITECTURE.md` with Mermaid diagram
- add Log prefix `[CACHE]`, `[SIGN]`, and `[B2]`

### Changed

- Move main entry point to `src/index.js`
- Enhance header filtering and path sanitization logic

### Fixed

- Resolve `TypeError` when modification headers for cache API
- Update README to use current `pnpm create cloudflare` and `pnpm dlx wrangler deploy` command
- Fix `RCLONE_DOWNLOAD` option so that bucket name can be passed in the path

## [1.2.0] - 2024-10-09

### Added

- `RCLONE_DOWNLOAD` environment variable allows use with rclone's `--b2-download-url` option, stripping the `file\` prefix from the incoming path; fixes [#16](https://github.com/backblaze-b2-samples/cloudflare-b2/issues/16)

## [1.1.1] - 2024-10-08

### Added

- README now includes instruction to run `npm install`, fixing [#17](https://github.com/backblaze-b2-samples/cloudflare-b2/issues/17)

### Fixed

- Return correct response for ranged HEAD requests ([@jamesgreenley](https://github.com/jamesgreenley))

### Changed

- Bumped direct dependencies to current versions
- Bumped `path-to-regexp` version in response to dependabot alert

## [1.1.0] - 2024-07-20

### Fixed

- Send `HEAD` requests as `GET`s, fixing #18.

### Changed

- Update `aws4fetch` version to 1.0.19 and remove now-redundant region parsing code.
- Fix/suppress IntelliJ warnings.
- Make git ignore local worker files and directories.

## [1.0.0] - 2024-07-20

Declaring current version as 1.0.0.
