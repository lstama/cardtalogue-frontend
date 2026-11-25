# Cardtalogue Frontend

React + TypeScript + Vite single-page app for the Cardtalogue card-management platform. This is
the client that talks to the [backend API](https://github.com/lstama/cardtalogue-backend) and
drives the ORB card-scanning flow.

## Stack

- React 19 + TypeScript
- Vite 7 (dev server on `:3000`)
- Tailwind CSS 4
- [TanStack Query](https://tanstack.com/query) for server state
- [openapi-fetch](https://github.com/drwpt/openapi-fetch) for a type-safe API client
- react-router v7, react-webcam (for the camera scan)

## Architecture

The frontend is **contract-driven**. It imports its API types from the generated TypeScript client
in the shared contract repo ([`lstama/cardtalogue-api-contract`](https://github.com/lstama/cardtalogue-api-contract)):

```
gen/ts/*   ->   import ... from '@contract/*'
```

The `@contract/*` path alias is defined in [`tsconfig.json`](tsconfig.json). Before building, the
contract types must be generated (see [Contract types](#contract-types)).

### Key modules

- `src/config/api.ts` — API base URL. Defaults to `http://localhost:8080/api/v1`; override with
  `VITE_API_BASE_URL` in a `.env` file for production.
- `src/config/app.ts` — app-wide feature flags and the captcha widget endpoint (the CAPTCHA gate
  applies to scanning and login).
- `src/services/api.ts` — openapi-fetch client with JWT auth. Authenticated calls get a proactive
  refresh (when the access token is within 5 min of expiry) and one retry on a 401; the public
  `POST /auth/login` bypasses that loader entirely (no stored bearer, no refresh, no retry).
- `src/contexts/*` — auth, cart, and theme contexts.
- `src/hooks/*` — TanStack Query hooks per resource (kards, packs, games, storages), plus
  `useCapWidget` (the `<cap-widget>` lifecycle hook behind the login and scanner CAPTCHA gates).
- `src/pages/*` — login, card/pack/game/storage lists, create/update forms, cart, scanner.
- `src/components/*` — layout, UI primitives, and the scan panel / camera.

## Prerequisites

- Node.js 20+
- The backend running (see the [backend repo](https://github.com/lstama/cardtalogue-backend))
- The contract types generated (see below)

## Setup

```bash
# 1. Generate the shared contract's TypeScript client (from the contract repo).
#    See [cardtalogue-api-contract/README.md](https://github.com/lstama/cardtalogue-api-contract/blob/master/README.md) -> "Generate"
#    This populates the contract repo's gen/ts/ directory

# 2. Install dependencies.
npm install

# 3. (Optional) Configure the API URL for your environment.
#   By default the app talks to a local backend on :8080. For production, add a
#   `.env` file with:
#     VITE_API_BASE_URL=https://api.your-production-domain.com/api/v1
#   The scanner and login pages also need the captcha widget endpoint (defaults
#   to a placeholder, so the captcha gate won't work in production without this):
#     VITE_CAP_API_ENDPOINT=https://captcha.your-production-domain.com/<site-key>
#   and, when the backend runs with CAPTCHA_MODE=on, turn the gate on as well:
#     VITE_CAPTCHA_ENABLED=true

# 4. Run the dev server.
npm run dev
```

The app opens at <http://localhost:3000>.

## How to run

```bash
# 1. Generate the shared contract's TypeScript client (populates ../cardtalogue-api-contract/gen/ts/).
cd ../cardtalogue-api-contract && make generate-ts && cd ../cardtalogue-frontend
# 2. Install and run.
npm install
npm run dev                    # dev server at http://localhost:3000
```

The app talks to the backend on `http://localhost:8080/api/v1` by default. Override with
`VITE_API_BASE_URL` (and `VITE_CAP_API_ENDPOINT` for the captcha widget) in a `.env` file.
See [Setup](#setup) for the full environment setup.

## Docker image build

The image build **generates** the contract TypeScript itself — `gen/ts/backend.ts` is never
committed (it is gitignored in the contract repo), so a clean checkout plus the contract repo is
enough. The contract repo is passed as a BuildKit **named build context** called `contract-src`,
and a `contract-types` stage runs the pinned `openapi-typescript` (7.13.0, matching the contract
repo's devDependency) on `contracts/backend.yaml`, copying the result to
`/cardtalogue-api-contract/gen/ts/` inside the build stage so the existing `@contract/*` aliases
resolve unchanged. No alias patch and no temporary vendored `contract-ts/` directory is needed.

```bash
# From the frontend repo, with cardtalogue-api-contract checked out alongside it.
docker buildx build \
  --builder multiarch-builder \
  --platform linux/arm64 \
  --build-context contract-src=../cardtalogue-api-contract \
  --load \
  -t registry.tama.id:30500/cardtalogue-frontend:arm64-$(date +%Y%m%d) \
  .
```

With `make` (same command, `CONTRACT_SRC` overrides the sibling path):

```bash
make build                       # --load, TAG=arm64 by default
make push TAG=arm64-$(date +%Y%m%d)
```

Requirements and notes:

- `--build-context` needs BuildKit (buildx / Docker ≥ 20.10 with BuildKit). Without it the build
  fails because the `contract-src` context cannot be resolved — BuildKit reports it as
  `pull access denied ... library/contract-src:latest`, which means "you forgot
  `--build-context contract-src=...`". The `make` targets check for
  `$(CONTRACT_SRC)/contracts/backend.yaml` first and print a clear error. The path is configurable
  via `CONTRACT_SRC` (Makefile) or the `--build-context` flag directly.
- The contract repo still needs network access to install the pinned `openapi-typescript` in the
  build stage; no SSH keys or private registry credentials are required.
- Build args (`VITE_API_BASE_URL`, `VITE_CAP_API_ENDPOINT`, `VITE_CAPTCHA_ENABLED`) are unchanged
  and still baked in at build time (see [Environment variables](#environment-variables)).

## How to contribute

This repo is **contract-driven** — the API types come from the shared contract repo
([`lstama/cardtalogue-api-contract`](https://github.com/lstama/cardtalogue-api-contract)).

- **UI-only change** → `npm run dev`, then `npm run verify-contract` (type-checks against the
  contract) and `npm run lint` before pushing.
- **New/changed API endpoint** → the endpoint must first exist in the contract. Coordinate with the
  backend engineer to edit `contracts/backend.yaml` in the contract repo, bump `CONTRACT_VERSION`,
  and run `make generate`. Then regenerate here (`make generate-ts`), re-run `verify-contract`, and
  open a PR.

### Contract CI (owner of the calls)

`.github/workflows/contract-check.yml` checks out the contract repo at `CONTRACT_REF`
(default `v1.1.0`, override with the `CONTRACT_REF` repo variable/secret or the
`workflow_dispatch` input), regenerates `gen/ts`, runs `npm run verify-contract`, then runs
`scripts/check-contract-calls.mjs`. That script fails when any `client.GET|POST|PUT|DELETE|PATCH`
or `fetch` path in `src/` is missing from the pinned contract (path **and** method), and fails if it
discovers zero calls. This is the owner-side half of "no orphan calls" — the contract repo can no
longer check it. Until the contract `v1.1.0` tag exists the job fails at the contract checkout; that
is the intended release gate.

Local run (against a sibling contract checkout):

```bash
node scripts/check-contract-calls.mjs --contract ../cardtalogue-api-contract
```

## Environment variables

Vite exposes variables prefixed with `VITE_`. These are **build-time** variables: they are baked
into the bundle at build time, not read at runtime. In production they are passed as Docker build
args (e.g. `docker buildx build --build-arg VITE_CAPTCHA_ENABLED=true ...`).

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:8080/api/v1` | Base URL of the backend API. Set this in production. |
| `VITE_CAP_API_ENDPOINT` | `https://example.com/captcha/` | Self-hosted captcha widget endpoint used by the scanner page and the login page. Override in production. |
| `VITE_CAPTCHA_ENABLED` | `false` | Set to `true` to require the Cap proof-of-work widget before **scanning and logging in** (the login request then carries `X-Cap-Token`). Must match the backend's `CAPTCHA_MODE`: `true` ⇔ `CAPTCHA_MODE=on`. |

## Scripts

```bash
npm run dev        # start Vite dev server (:3000)
npm run build      # type-check (tsc -b) + production build
npm run preview    # preview the production build
npm run lint       # eslint
npm run verify-contract   # tsc -b (type-checks against the contract types)
node scripts/check-contract-calls.mjs   # every call is covered by the pinned contract
```

## Features

- Email/password login issuing JWT access + refresh tokens. Later authenticated calls refresh the
  access token proactively and retry once on a 401; the login request itself never refreshes,
  retries, or carries a stored bearer. When `VITE_CAPTCHA_ENABLED=true` the login form also requires
  the Cap proof-of-work widget and sends its token as `X-Cap-Token`.
- Browse and search games, languages, rarities, packs, and cards.
- Create / update packs and cards (editor role); delete is admin-only.
- Manage storages and stock.
- Shopping cart.
- Camera-based ORB card scan (`/scanner`) that posts to the scanner service via the backend's
  `/media/scan` endpoint (with an optional captcha gate, shared with login).

## License

Licensed under the GNU General Public License v3.0. See [LICENSE](LICENSE).

Yu-Gi-Oh! card names, descriptions, and related data are used for identification and reference
purposes only. Yu-Gi-Oh! is a trademark of Konami Group Corporation. This project does not
distribute card images; image URLs are placeholders.
