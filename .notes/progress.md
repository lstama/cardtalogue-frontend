# progress.md — cardtalogue-frontend refactor

## Goal
Refactor the repo in 3 phases (identify -> plan -> execute), then verify/repair. Static-analysis-only applied DURING
the refactor; since 2026-10-13 the user authorised running `npm run build` / `npm run dev` (and web_browse testing).

## Done
- Phase 1 (identify) COMPLETE: all 61 tracked files scanned (full read for small files, grep-outline for the
  4 big pages). Findings in `.notes/scratch/identify.md` (272 lines).
- Phase 2 (plan) COMPLETE: `.notes/plan.md` — Tier A (build-breaking, 5 items), Tier B (type/runtime mismatch,
  7 items), Tier C (structure/duplication, 11 items), plus out-of-scope list.

## Status / next
- **Phase 3 (Execute)**: committed as HEAD `921e560 refactor by pi harness`. Build was BROKEN (9 errors),
  then FIXED post-hoc (2026-10-13) at HEAD: `npm run build` now **exit 0** (tsc -b + vite, 174 modules).
- Fixes applied (uncommitted, on top of `921e560`):
  `src/services/api.ts` (2 unbalanced generics + `storeTokens` refreshToken `?: string | null`),
  `ItemCard.tsx` (`TAG_COLORS: TagColor[]` local union), `Navbar.tsx` (`navClass` param `: { isActive: boolean }`),
  `LogoutModal.tsx` (`LogoutModalProps` type), `SearchableSelect.tsx` (`onChange: (id: number | string) => void`),
  `AuthContext.tsx` (`children: ReactNode` + `import type { ReactNode } from 'react'`).
- Uncommitted local change (pre-existing, not mine): `src/config/api.ts`. Untracked build artifacts left in place:
  `tsconfig*.tsbuildinfo`, `vite.config.js`, `vite.config.d.ts` (not gitignored; `dist` is).
- Tier A + Tier B + Tier C all applied and committed (see plan.md). Import checker clean over 51 src files.
  Optional not done: repo-wide single-quote/semicolon normalisation (plan item 20).
- Browser test of the main page (2026-10-13): `npm run dev` (localhost:3000) + `web_browse` -> page renders.
  `LOCAL_API_BASE_URL` in `src/config/api.ts` is missing `:8080` (points at dead port 80); with the port added the
  card list resolves to "No card found" (local backend: cards total=0, packs/games total=1). Remote API -> HTTP 530 (down).

## Execution rules (read before resuming)
- One file per step: read -> edit -> log decision. Never re-read an edited file.
- Trust `.notes/plan.md`; do not re-plan. Unlisted decision -> pick conservative option and log it.
- Accurate line counts live in identify.md (an earlier wc listing in-session was wrong).
- Key facts: Vite does not type-check; missing-file import (`../static/placeholder.svg`) DOES break the build.
- CartContext returns only {cart,setCart} but CartPage + KardCard expect 8 more members.
- All `useSearchX` hooks are `enabled:false`; useProtectedKards keys collide with useKards keys.

## Open problems
- Type-check passes at HEAD; main page renders in a real browser, but deeper pages/flows still UNTESTED (no tests in repo).
- `@vitejs/plugin-react ^4.0.3` vs `vite ^7.1.7` left unchanged (unverifiable offline).
- `useSearchX enabled:false` kept (user: intentional demo state).
- Optional not-done: repo-wide single-quote/semicolon normalisation (plan item 20).
