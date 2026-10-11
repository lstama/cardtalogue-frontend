# Phase 2 — Refactor plan (cardtalogue-frontend)

Constraints: no node/npm/tsc/eslint runs (static analysis only). Vite does NOT type-check at build, so
TS errors won't fail the build, but a missing-file import WILL (Rollup unresolved import).

Precaution / stop rules (avoid thinking loops):
- One file per step: read -> edit -> record in decisions.md. Never re-read a file already edited.
- Do not re-plan; this file is the plan. If a step needs a decision not covered here, pick the
  conservative option and log it.
- Cap: finish tiers A->B->C in order; stop when `decisions.md` covers every touched file.

## Tier A — build-breaking / hard defects (must fix)
1. `src/pages/LoginPage.tsx`: `import Placeholder from '../static/placeholder.svg'` — file absent (not on
   disk, not in git). Replace with inline `<svg>` placeholder (no new asset, no new request).
2. `src/contexts/CartContext.tsx`: localStorage key mismatch — useState reads `"cart"`, writes `"offline_cart"`.
   Unify on STORAGE_KEY.
3. `src/hooks/useProtectedKards.ts`: react-query key collision (`['kards',...]` vs useKards, `['kard',id]`
   vs useKard) + duplicate export name. Give protected queries distinct keys (`['protected-kards',...]`).
4. `src/hooks/useKards.ts`: `useCreateKard` mutationFn points at `kardsAPI.createPack` (misnamed API fn)
   -> rename api fn to `createKard`.
5. `src/hooks/useKards.ts`: `useSearchKards` + usePacks/useGames/useStorages `useSearchX` all `enabled:false`
   -> pages never fetch. Enable (keep gating only where a real condition exists, e.g. protectedKard id).

## Tier B — API/type mismatches that crash at runtime (should fix)
6. `src/contexts/CartContext.tsx`: expose the API its consumers already assume:
   `{ cart, setCart, addToCart, removeFromCart, deleteFromCart, clearCart, getQuantity, fixQuantity, getSimplifiedCart }`
   (consumers: CartPage.tsx, KardCard.tsx). Implement once, keep `useCart()` name.
7. `src/types/index.ts` + CartContext: export `CartItem` (UpdateStockPage imports it; currently non-exported).
8. `src/services/api.ts`: `kardsAPI.getKard` annotated `ApiResponse<Kard[]>` for a single-item endpoint -> `ApiResponse<Kard>`.
9. Missing `import React`/`import { ReactNode }` where `React.FC`/`React.ReactNode`/`React.FormEvent` used
   without import: ProtectedRoute.tsx, ThemeContext.tsx, ScannerPage.tsx (React.FC), LoginPage.tsx (React.FormEvent).
   Use `import type { … } from "react"` style (verbatimModuleSyntax).
10. `src/components/ui/Button.tsx`: `children` destructured from ButtonProps but not declared -> add to type.
11. `src/components/ui/ErrorMessage.tsx`: unused `useState` import (noUnusedLocals).
12. `src/hooks/useClickOutside.ts` + `src/components/layout/Search.tsx`: type-only imports (`RefObject`,
   `ReactNode`) imported as values -> mark `import type`.

## Tier C — structure / duplication (the actual refactor)
13. `src/services/api.ts` (322): collapse 3 axios clients into one factory + one generic request helper
    for the repeated `get/search/create` + `{limit,offset}` boilerplate; drop dead API groups
    (games/languages/rarities/packs if unused — verify by grep before deleting).
14. `src/hooks/*`: single `src/hooks/queryKeys.ts` (or shared const) for `STALE_TIME`; keep one hook per
    concern; delete `enabled:false` dead queries; remove duplicate `useProtectedKard` export.
15. Pages: route the 4 list pages (Kards/Packs/Games/Storages) through `SearchLayout` (already exists in
    components/layout/Search.tsx); give Scanner/CreatePack/CreateKard/UpdateStock the same loading/error/
    empty-state sub-components instead of re-inventing them.
16. `src/components/layout/Navbar.tsx` (263): extract `NAV_ACTIVE`/`NAV_IDLE` class consts + a `navLink()`
    helper (8 copies of the same pair); move the inline logout-confirm modal into its own component.
17. `src/components/ui/{Select,SearchableSelect,SearchBar}.tsx`: one Select core; SearchableSelect = Select +
    search; SearchBar = Select + open/click state. Shared `Option` type into `src/types`.
18. `src/components/items/{KardCard,PackCard,GameCard,StorageCard}.tsx`: shared card shell (header/price/
    actions slots) — only if it doesn't fight the `element=`/children convention.
19. `src/pages/CreateKardPage.tsx` (627): split into (a) form-state model + handleChange, (b) camera/match
    flow, (c) new-storage modal, (d) JSX sections; target <200 lines for the page itself.
20. Style unification (mechanical, low risk): single quotes, no semicolons, `export const X` for pages,
   `import type` for type-only imports, no `console.log` in library-ish modules.
21. Dead files: `src/App.css` (unused), `src/components/layout/SampleNavbar.html`, `src/assets/react.svg`,
   `tailwind.config.js` (not read by v4 unless @config), README (Vite template text).
22. package.json: `react-router-dom ^6.30.1` vs v7 `element=` syntax in use -> bump to `^7`; eslint 8 flags
   (`--ext`) vs flat config -> `eslint: ^9` + `lint: "eslint ."`. Unused deps: js-cookie, zustand.
23. `src/config/api.ts`: hardcoded localhost base URL -> env-overridable const (keep default).

## Explicitly OUT of scope (do not drift into)
- No new framework/dependency installs, no runtime behaviour redesign (cap-widget, TCGCamera flow).
- No renaming user-facing routes/paths.
- No Tailwind v4 class-name migration sweep (large, unverifiable without running the build).
