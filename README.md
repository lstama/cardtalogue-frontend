# Cardtalogue Frontend

React + TypeScript + Vite single-page app for the Cardtalogue card-management platform. This is
the client that talks to the [backend API](../cardtalogue-backend) and drives the ORB card-scanning
flow.

## Stack

- React 19 + TypeScript
- Vite 7 (dev server on `:3000`)
- Tailwind CSS 4
- [TanStack Query](https://tanstack.com/query) for server state
- [openapi-fetch](https://github.com/drwpt/openapi-fetch) for a type-safe API client
- react-router v7, react-webcam (for the camera scan)

## Architecture

The frontend is **contract-driven**. It imports its API types from the generated TypeScript client
in the shared contract repo:

```
cardtalogue-api-contract/gen/ts/*   ->   import ... from '@contract/*'
```

The `@contract/*` path alias is defined in [`tsconfig.json`](tsconfig.json). Before building, the
contract types must be generated (see [Contract types](#contract-types)).

### Key modules

- `src/config/api.ts` — API base URL. Defaults to `http://localhost:8080/api/v1`; override with
  `VITE_API_BASE_URL` in a `.env` file for production.
- `src/config/app.ts` — app-wide feature flags (e.g. the scan captcha gate).
- `src/services/api.ts` — openapi-fetch client with JWT auth, proactive token refresh, and a
  single 401-retry.
- `src/contexts/*` — auth, cart, and theme contexts.
- `src/hooks/*` — TanStack Query hooks per resource (kards, packs, games, storages).
- `src/pages/*` — login, card/pack/game/storage lists, create/update forms, cart, scanner.
- `src/components/*` — layout, UI primitives, and the scan panel / camera.

## Prerequisites

- Node.js 20+
- The backend running (see [cardtalogue-backend](../cardtalogue-backend))
- The contract types generated (see below)

## Setup

```bash
# 1. Generate the shared contract's TypeScript client (from the contract repo).
#    See cardtalogue-api-contract/README.md -> "Generate"
#    This populates ../cardtalogue-api-contract/gen/ts/

# 2. Install dependencies.
npm install

# 3. (Optional) Configure the API URL for your environment.
#   By default the app talks to a local backend on :8080. For production, add a
#   `.env` file with:
#     VITE_API_BASE_URL=https://api.your-production-domain.com/api/v1

# 4. Run the dev server.
npm run dev
```

The app opens at <http://localhost:3000>.

## Environment variables

Vite exposes variables prefixed with `VITE_`.

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:8080/api/v1` | Base URL of the backend API. Set this in production. |

## Scripts

```bash
npm run dev        # start Vite dev server (:3000)
npm run build      # type-check (tsc -b) + production build
npm run preview    # preview the production build
npm run lint       # eslint
npm run verify-contract   # tsc -b (type-checks against the contract types)
```

## Features

- Email/password login with JWT access + refresh tokens (auto-refresh + single 401 retry).
- Browse and search games, languages, rarities, packs, and cards.
- Create / update packs and cards (editor role); delete is admin-only.
- Manage storages and stock.
- Shopping cart.
- Camera-based ORB card scan (`/scanner`) that posts to the scanner service via the backend's
  `/media/scan` endpoint (with an optional captcha gate).

## License

Licensed under the GNU General Public License v3.0. See [LICENSE](LICENSE).

Yu-Gi-Oh! card names, descriptions, and related data are used for identification and reference
purposes only. Yu-Gi-Oh! is a trademark of Konami Group Corporation. This project does not
distribute card images; image URLs are placeholders.
