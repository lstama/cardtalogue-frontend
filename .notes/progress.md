# progress.md — cardtalogue-frontend refactor

## Goal
Refactor the repo in 3 phases (identify -> plan -> execute). Static analysis ONLY: never run node/npm/tsc/eslint.
Verify by read + grep. Incremental: one file per step, record findings as you go.

## Done
- Phase 1 (identify) COMPLETE: all 61 tracked files scanned (full read for small files, grep-outline for the
  4 big pages). Findings in `.notes/scratch/identify.md` (272 lines).
- Phase 2 (plan) COMPLETE: `.notes/plan.md` — Tier A (build-breaking, 5 items), Tier B (type/runtime mismatch,
  7 items), Tier C (structure/duplication, 11 items), plus out-of-scope list.

## Status / next
- **Phase 3 (Execute)**: DONE — Tier A (CartContext, useProtectedKards, api.ts, useKards)
  + Tier B (type imports, React.FC/FormEvent, package.json, 4 dead files deleted)
  + Tier C (config/api, STALE_TIME_MS, Navbar, Dropdown/Select, ItemCard, CreateKardPage split).
  Import checker clean over 51 src files. Remaining optional: repo-wide quote/semicolon sweep.

## Execution rules (read before resuming)
- One file per step: read -> edit -> log decision. Never re-read an edited file.
- Trust `.notes/plan.md`; do not re-plan. Unlisted decision -> pick conservative option and log it.
- Accurate line counts live in identify.md (an earlier wc listing in-session was wrong).
- Key facts: Vite does not type-check; missing-file import (`../static/placeholder.svg`) DOES break the build.
- CartContext returns only {cart,setCart} but CartPage + KardCard expect 8 more members.
- All `useSearchX` hooks are `enabled:false`; useProtectedKards keys collide with useKards keys.

## Open problems
- `@vitejs/plugin-react ^4.0.3` vs `vite ^7.1.7` left unchanged (unverifiable offline).
- `useSearchX enabled:false` kept (user: intentional demo state).
- Optional not-done: repo-wide single-quote/semicolon normalisation (plan item 20).
