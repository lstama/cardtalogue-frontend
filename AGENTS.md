# AGENTS.md — Cardtalogue Frontend

Instructions for agents working in this repo.

## Contract-first wiring (Phase 4)

This frontend consumes the **contract** in the sibling repo
`cardtalogue-api-contract/`. It does **not** vendor the generated types; it
imports them through a path alias.

- `contracts/backend.yaml` (contract repo) is the source of truth for the
  backend API. The generated TS types live in
  `cardtalogue-api-contract/gen/ts/backend.ts`.
- `tsconfig.json` maps the alias:
  ```json
  "paths": { "@contract/*": ["../cardtalogue-api-contract/gen/ts/*"] }
  ```
- `src/services/api.ts` builds the openapi-fetch client from those types.

### API layer

`src/services/api.ts` is the single place all backend calls go. It uses
`openapi-fetch` (replaced axios) with a custom `fetch` loader that:

- injects the `Authorization: Bearer <jwt>` header from `localStorage`;
- decodes the JWT and proactively refreshes when < 5 min remain;
- retries once on 401 using the refresh token (single in-flight lock,
  `x-retry` header guard to prevent loops);
- redirects to `/login` and clears tokens on logout.

Every call returns `{ data, meta, error, response }`. Use `requireData<T>(res)`
to unwrap `data` (throws on `error`).

### Commands

```bash
npm run verify-contract   # tsc -b: type-checks the whole project (contract types included)
npm run build             # production build
```

`verify-contract` runs `tsc -b`. It type-checks the contract-bound files
(`src/services/api.ts`, `src/types/*`) against the generated TS types. If it
passes, the frontend's calls are covered by the contract (no orphan calls).

### Generated types invariants

- The generated `gen/ts/backend.ts` is **not** edited by hand. If the contract
  changes, regenerate in the contract repo:
  ```bash
  cd ../cardtalogue-api-contract
  make generate-ts
  ```
- The alias resolves to the sibling repo's `gen/ts/` at type-check time, so no
  sync step is needed here.

## Do not

- Do not call the backend directly from components. Route every call through
  `src/services/api.ts`.
- Do not add a new axios/fetch call bypassing the loader — you lose auth,
  refresh, and 401-retry.
- Do not hand-edit `../cardtalogue-api-contract/gen/ts/backend.ts` — edit the
  contract and regenerate.

## Contract discipline

- Every frontend→backend call must match a path in the contract's
  `backend.yaml`. If you call a new endpoint, add it to the contract first
  (operationId, summary, description, request/response schemas, examples, tags),
  validate, then regenerate.
- The frontend need not adopt the whole contract — only the subset it calls. But
  every call it makes must be covered (no orphan calls).
- Response shapes: the contract wraps list responses in `{ data, meta }` and
  single resources in `{ data }`. Map `StorageRequest` to the contract's
  `CreateStorageRequest` (name + code + description).
