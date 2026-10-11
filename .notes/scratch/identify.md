# Phase 1 — Identify (incremental findings, one read-batch at a time)

Rule: no node/npm/tsc/eslint runs allowed (static analysis only). Verify by reading + grep.

## File inventory (git ls-files, 61 tracked; node_modules excluded)
src/: App.css App.tsx assets/react.svg components/{items/{GameCard,KardCard,PackCard,StorageCard},
layout/{Layout,ProtectedRoute,Navbar,Search,SampleNavbar.html}, ui/{Button,Card,ErrorMessage,LoadingSpinner,
Pagination,SearchBar,SearchableSelect,Select,StaticTag,TCGCamera}} config/api.ts contexts/{Auth,Cart,Theme}
hooks/{useClickOutside,useGames,useKards,usePacks,useProtectedKards,useStorages} index.css main.tsx
pages/{Cart,CreateKard,CreatePack,Games,Kards,Login,Packs,Scanner,Storages,UpdateStock} services/api.ts
services types/index.ts
root: .devcontainer/devcontainer.json .dockerignore .gitignore Dockerfile Makefile README.md eslint.config.js
index.html package.json public/vite.svg tailwind.config.js tsconfig{,.app,.node}.json vite.config.ts
NOT tracked/on disk: src/static/placeholder.svg (LoginPage import), src/components/ui/DarkModeToggle.tsx
(Layout import is commented), src/components/ui/{Navbar,Search} (they live in layout/).

## src/components/layout/Navbar.tsx (270 lines) — biggest duplication hotspot
- Same NavLink `className={({ isActive }) => isActive ? A : B}` string pair repeated 8x (2 variants) =>
  extract `const NAV_ACTIVE/NAV_IDLE` consts or a `navLink(to, label, auth?)` helper.
- 3 useState (navOpen/createOpen/showLogoutConfirm) + closeAllDropdown + handleLogoutClick/handleConfirmLogout.
- Dead/commented NavLinks: /games /packs /languages /rarities /create/pack + Flowbite sample dropdown markup.
- `import { useState } from 'react'`, `import { Link, NavLink } from 'react-router-dom'`.
- Inline logout-confirmation modal (fixed inset-0 ...) inside Navbar => belongs in its own component.
- `<Link to="#" onClick={toggleTheme}>` hack for theme toggle (no href target) => use <button>.
- `data-collapse-toggle`/`aria-*` Flowbite leftovers; `md:`/`sm:`/`lg:`/`xl:` responsive prefixes are
  Tailwind v3 style (v4 renamed `md:` -> `md:`? v4 keeps md: but `sm:`/`md:`/`lg:`/`xl:` still valid).
- `useCart()` used only for cartCount reduce => fine but pulls whole cart state into Navbar.

## src/components/layout/Search.tsx (175 lines) — **already a generic search-page abstraction**
- `export function SearchLayout<T>({ title, description, useSearch, renderItem, filters, itemsPerPage,
  noResultsText, initialQuery })` — renders title/desc + SearchBar + loading/error/empty states + grid + Pagination.
- `useSearch` param is a hook fn typed with an inline structural react-query result shape (data/isLoading/error/refetch/isFetching).
- `import { ReactNode, useState, useEffect } from "react"` — ReactNode is a TYPE => same verbatimModuleSyntax
  issue as useClickOutside (needs `import type`/`type` marker under verbatimModuleSyntax? verify TS rule).
- `data.meta.total` accessed without optional chain after `data?.data?.length` guard (narrowing gap).
- `// eslint-disable-next-line react-hooks/exhaustive-deps` on a `[]` deps useEffect (repo has no eslint config
  for that rule; harmless).
- `useEffect(() => { handleSearch() }, [])` = "run search once on mount" hack.
- FINDING: pages (Kards/Storages/Scanner/CreatePack...) likely re-implement this same skeleton => check usage
  of SearchLayout by grep; if unused, wire pages to it (biggest DRY win).

- KardCard.tsx(200): `const { getQuantity, addToCart, removeFromCart, fixQuantity } = useCart()` but
  CartContext returns ONLY `{ cart, setCart }` => **API mismatch: 4 undefined members** (TS error + runtime
  crash). CartContext must expose those (it defines addToCart/removeFromCart internally, never getQuantity/fixQuantity).
- KardCard: `useEffect(() => fixQuantity(kard.id, kard.quantity), [kard.quantity])` side-effect effect.
- KardCard: `kard.for_sale != "yes"` (loose !=) vs `=== "yes"` elsewhere => inconsistent comparison.
- KardCard: flip via useState + onClick (setFlipped true/false) + Card.tsx has its own selected/expanded/preview
  state that KardCard does NOT use => Card.tsx state machine partly unused.
- KardCard: 6 near-identical `<button className="w-full text-xs px-2 py-1 ... rounded">` blocks => Button ui
  component exists but is unused here (duplication).
- KardCard: `¥{kard.price}` and `Rp {(kard.price * kard.price_multiplier).toLocaleString("id-ID")}` => currency
  formatting duplicated (also appears in other pages, verify).
- KardCard: commented-out StaticTag lines referencing pack_code/game_name/language_code.
- StorageCard.tsx(40): commented block references `pack.*` (copy-paste from PackCard) + uses StaticTag
  without import (inside comment, so no error) => dead code to delete.
- StorageCard: `<h3>` reused for description (should be p/div) => semantic markup bug.
- StorageCard imports `Storage` from '../../types' (single quotes, no semis) vs KardCard double quotes.

- useKards.ts(59): useKards ['kards',limit,offset] + useCreateKard(mutationFn: kardsAPI.createPack) +
  useSearchKards(enabled:false, dead) + useProtectedKard ['kard',id] + useUpdateKard(protectedKardsAPI.updateKard)
- useProtectedKards.ts(34): useProtectedKards uses queryKey ['kards',...] => **COLLIDES with useKards key**;
  useProtectedKard uses ['kard',id] => **COLLIDES with useKards.ts useProtectedKard**; duplicate export name
  `useProtectedKard` in two modules.
- usePacks.ts(37): usePacks + useCreatePack; imports useQueryClient (unused? verify) => unused import.
- useStorages.ts(34): useStorages + useUpdateStorage; `mutationFn: (data: any)`.
- useGames.ts(27): useGames (route commented out in App.tsx => dead).
- useClickOutside.ts(34): `import { useEffect, useRef, RefObject } from "react"` — RefObject is a TYPE;
  under `verbatimModuleSyntax` this is a TS error (needs `import { RefObject as _ } from 'react'` w/ type).
  Generic `<T extends HTMLDivElement>` + returns RefObject<T>; adds/removes document-level click listener
  (module-level DOM side effect).
- Every hook file repeats `staleTime: 5 * 60 * 1000` and `import ... from 'react-router-dom'`/`'../services/api'`
  /`'../types'` boilerplate => shared constants + shared import block candidate.
- Hook naming: `useCreateKard`/`useUpdateKard`/`useSearchKards` are useX wrappers (fine) but `useSearchKards`
  is dead (enabled:false) and `useKards`/`usePacks`/`useGames`/`useStorages` are 4 near-identical list queries.

## src/components/ui/* (Tailwind class-string element factories, used as React Router `element=`)
- Button.tsx(54): destructures `children` from `ButtonProps` which does NOT declare `children` => TS error;
  `variants[variant]` map + `disabled` + `onClick` props; `export const Button = forwardRef(...)` then
  `Button.displayName = 'Button'`.
- Card.tsx(115): 3 useState + 3 useEffect state mirrors (selected/expanded/preview) => 6 hooks for one
  component; `useState<string | null>(null)`; `onClick`/`onDoubleClick`/`onHover` props; class strings.
- ErrorMessage.tsx(24): `import { useState } from "react"` but useState never used => unused import (noUnusedLocals
  error). Double quotes + semicolons in this file vs none elsewhere.
- LoadingSpinner.tsx(21): size map; unused `useState`? no. OK.
- Pagination.tsx(84): imports Button; `getVisiblePages` closure per render; `rangeWithDots.push(1, '...')`
  `rangeWithDots.push(1, '...')` OK (TS evolving-array inference).
  `onClick={() => typeof page === 'number' && onPageChange(page)}` (page is number|string union).
- SearchBar.tsx(134): own dropdown logic duplicating Select; `useClickOutside<HTMLDivElement>(...)`;
  commented-out JSX lines `// <div ref={closeClickOutside}>` inside expression; long class strings.
- Select.tsx(64) vs SearchableSelect.tsx(95): ~85% identical markup (button + popup + ul + 'No results');
  both declare local `type Option` (differing: Select allows number|string, SearchableSelect number only)
  => extract shared Select core + `search` option.
- StaticTag.tsx(20): color map; `me-1`/`rounded-sm` class names.
- TCGCamera.tsx(101): uses react-webcam? verify import.
- Style drift across ui/: double quotes + semicolons in ErrorMessage/Select/SearchableSelect/SearchBar vs
  single quotes, no semicolons in Button/Card/StaticTag/Pagination.
- package.json: `"type": "module"` present; deps block is `"dependencies"` (verify spelling).
- package.json `lint` uses `eslint . --ext ts,tsx` (eslint 8 flag) but eslint.config.js is FLAT config
  (`import ... from 'eslint/config'`, `defineConfig`, `globalIgnores`) => needs eslint ^9. devDeps pin
  `eslint: ^8.57.1` + `typescript: ^5.0.2` (too old for ts-eslint 8.x). lint script is broken as declared.
- package.json declares `react-router-dom: ^6.30.1` but src/App.tsx uses React Router v7 JSX form
  (`<Route element={...} />`, nested `<Route path="create" element={<Outlet/>}>` with children).
  `element=` prop does NOT exist in v6 => dep version mismatch (needs react-router/react-router-dom ^7).
- package.json deps include `axios`, `js-cookie`, `react-webcam`, `zustand`, `tailwindcss` (runtime pkg) —
  check actual usage; unused deps = removal candidates.
- vite.config.ts: no `src/App.css` referenced? check. `server.port: 3000` only.
- tsconfig.app.json: strict + noUnusedLocals/Params + erasableSyntaxOnly + verbatimModuleSyntax.
  => any refactor must keep TS strict-clean and use `import { X }`/`import type` style.

## src/main.tsx (10 lines)
- Vite template entry: imports `App from './App.tsx'` (default export) + `import './index.css'`.
- `React.StrictMode` wrapper. Fine.

## index.html
- References `/vite.svg` favicon (file absent? verify) and template default title partly customized.
- Loads external `@cap.js/widget@0.1.58` from jsdelivr (capbar?) — third-party, keep.

## src/App.tsx (73 lines)
- Dead imports: `PacksPage`, `GamesPage` commented out; routes for /packs and /games commented.
- Mixed quote styles (single vs double) throughout file.
- `import ProtectedRoute from './components/layout/ProtectedRoute'` = default import; ProtectedRoute
  does `export default function ProtectedRoute` => OK.
- `import { Layout } ...` but Layout.tsx exports `export const Layout` => OK.
- Route tree: `/` KardsPage, /login, /cart, /scan, /stock-update + /storages wrapped in ProtectedRoute,
  nested `/create` -> pack, card, card/:id.
- `export default App` (no semicolon style) — file-level style inconsistent with rest.

## src/components/layout/Layout.tsx (18 lines)
- `export const Layout = ({ children }: LayoutProps) => ...` — no `export default`, so `<Layout>` in App
  works via named import. But React Router v7 `element` children: Layout receives `children` prop — OK.
- Commented `DarkModeToggle` import (dead).
- Tailwind class lists are missing `min-`/`max-` prefixes? They are `min-h-screen`, `max-w-7xl` — fine,
  but `dark:bg-gray-900` requires `dark:` variant support (Tailwind v3 syntax; repo pins tailwindcss ^4.1.13
  + @tailwindcss/vite). Tailwind v4 uses same `dark:` variant => OK, but v4 renamed some scales
  (gray-50 -> ok? v4 has gray-50..950). VERIFY v4 class names if we touch them.
- Layout does NOT apply theme class; ThemeContext sets `html` class light/dark instead.

## src/components/layout/ProtectedRoute.tsx (10 lines)
- BUG: uses `React.ReactNode` with NO `import React`/`import { ReactNode }` => TS error under this repo's
  config (no global React). Same pattern in ThemeContext.tsx.
- `type ProtectedRouteProps = { children: React.ReactNode }` (semicolon style, double quotes) vs other files.
- Redirects to /login when !isAuthenticated.

## src/contexts/CartContext.tsx (140 lines)
- STORAGE_KEY `offline_cart` but useState initializer reads `localStorage.getItem("cart")` (line 12) while
  persist useEffect writes `offline_cart` and a 3rd useEffect reads `offline_cart` => key mismatch bug.
- 3 useEffects + useState init all doing JSON.parse(localStorage...) => duplicated load logic x3.
- `useCart` returns `{ cart, setCart }` but pages destructure `{ cart }` only (verify) => setCart unused.
- `React.FC` + `import React, { useState, useEffect } from 'react'` style (old) vs ThemeContext `import {
  useContext } from 'react'` (new) => two import styles in same dir.
- `addToCart`/`removeFromCart` mutate state then setCart([...cart]) => two state writes per action.
- `removeFromCart` uses `indexOf(item)` (identity) — works only for same object refs.
- console.log noise: 'Cart initialized from localStorage', 'Cart persisted to localStorage'.

## src/contexts/AuthContext.tsx (205 lines)
- Monkey-patches `localStorage.setItem`/`getItem` globally (prototype patch) to intercept auth tokens +
  user => fragile, leaks state to unrelated localStorage users (CartContext writes are also intercepted
  and logged). Refactor candidate: explicit setAuthTokens/getAuthState functions.
- `React.FC` + `import React, {...} from 'react'` (old style) again.
- `useAuth` returns fresh object literal each call; `user` typed `AuthContext['user']` (indexing an
  interface) => awkward.
- `login` returns `ApiResponse<LoginResponse>` but api.authAPI.login already returns that; double wrap.
- `logout` sets `localStorage.setItem('user', null)` (string 'null') then removeItem('user') => redundant.
- `isAuthenticated` getter via `useAuth().isAuthenticated` recursion; `useAuth` returns object with
  `get`-style props? verify exact shape.
- `useState<AuthContext['user']>` etc. rely on `AuthContext` interface indexing.
- Dead: `useAuth().user` mutation of `state.user` object identity.

## src/services/api.ts (322 lines)
- `import { API_BASE_URL } from '../config/api'` — src/config/api.ts EXISTS (2 lines, one commented prod URL
  + hardcoded `http://localhost:8080/api/v1`) => hardcoded host, no env override. Note: importing a value
  from a module without `export`? it IS exported. OK.
- 3 near-identical axios clients (private/public/auth) with same baseURL/timeout(1000000)/withCredentials.
- 8 API group objects (packs/kards/protectedKards/games/languages/rarities/storages/media/mediaAPIScan)
  repeating `params: { limit, offset }` + `response.data` boilerplate => factory/generic helper candidate.
- Copy-paste bug: `kardsAPI.createPack` (should be createKard) POSTs /cards.
- Type bug: `kardsAPI.getKard`/`getKards` annotated `ApiResponse<Kard[]>` for single-item endpoint.
- `mediaAPIScan.uploadImage: Promise<any>`; `MediaScanResponse`/`MediaUploadResponse` nested `scan.scan`.
- Dead exports (routes commented): gamesAPI, languagesAPI, raritiesAPI, packsAPI.* (verify usage by grep).
- Comment typos: 'intercerptors', curly apostrophe in "doesn’t", trailing whitespace after formData.append.
- `window.location.href = '/login'` inside axios interceptor => side-effect navigation in a service layer.
- `privateApiClient.interceptors.request.use` catch returns `Promise.reject(error)` from a request
  interceptor (mixes reject + config return) and swallows refresh errors.

## src/types/index.ts (205 lines)
- Mixed semicolons (CardMatch/Media blocks) vs none elsewhere; comments inside interface bodies.
- `Kard`/`ProtectedKard` ~90% identical (ProtectedKard adds enabled/storage_*) => composition candidate.
- `for_sale: string` and `status: string` should be enums/unions (values are 'true'/'false' per pages? verify).
- `ApiResponse<T>.meta` required but many responses lack it (api.ts returns response.data as-is).
- `Media`, `CardMatch`, `Game`, `Language`, `Rarity`, `Storage`, `User` — some only used by dead routes.

## src/config/api.ts (2 lines)
- Commented-out prod URL + hardcoded localhost; no env/dev switch.

## Missing files / broken imports
- `src/static/placeholder.svg` DOES NOT EXIST (not on disk, not in `git ls-files`) but LoginPage does
  `import Placeholder from '../static/placeholder.svg'` => build-breaking import. Fix = inline SVG asset
  or move to public/ + URL, or drop placeholder usage.
- `src/assets/react.svg` present but unreferenced (Vite template leftover).
- `public/vite.svg` referenced by index.html favicon (exists).
- `src/components/layout/SampleNavbar.html` (72 lines) = dead sample markup inside src tree.
- Also present: tailwind.config.js, Dockerfile, .dockerignore, Makefile (check consistency).
- Same `React.ReactNode` missing-import bug.
- `useTheme` throws when provider missing (inconsistent with other contexts? compare Auth/Cart).
- Reads localStorage + matchMedia inside useState initializer (runs per component instance).
- useEffect mutates `document.documentElement` classList; also writes localStorage every theme change.
- `toggleTheme` closure calls setTheme — exposed through context (impure hook-ish API).

## CORRECTIONS + additions (after full re-read of hooks/pages)

### src/hooks/* (accurate)
- useKards.ts(66): useKards['kards',l,o] · useKard['kard',id] · useProtectedKard['protected-kard',id]
  (enabled: id!==null, throws when null) · useSearchKards(gameId,languageId,packId,query,limit,offset)
  **enabled:false** · useCreateKard (mutationFn: kardsAPI.createPack = MISNAMED; onSuccess commented out
  and references undefined queryClient) · useUpdateKard(id) (mutationFn (data:any)=>protectedKardsAPI.updateKard)
- useProtectedKards.ts(34): useProtectedKards key ['kards',l,o] **COLLIDES** with useKards; useProtectedKard
  key ['kard',id] **COLLIDES** with useKard AND duplicates the export name from useKards.ts.
- usePacks.ts(39): usePacks · useSearchPacks(gameId,languageId,query,limit,offset) **enabled:false** · useCreatePack.
- useGames.ts(24): useGames · useSearchGames **enabled:false**.  useStorages.ts(24): useStorages · useSearchStorages **enabled:false**.
- SYSTEMIC BUG: every useSearchX has enabled:false => SearchLayout pages never fetch (data undefined).
- All hook files repeat `staleTime: 5 * 60 * 1000` + identical import lines => shared STALE_TIME module candidate.
- useClickOutside.ts(20): `import { useEffect, useRef, RefObject } from "react"` (RefObject is a type-only export).

### Accurate line counts (trust these)
pages: Cart 170 · CreateKard 627 · CreatePack 222 · Games 18 · Kards 69 · Login 68 · Packs 48 · Scanner 189 ·
Storages 18 · UpdateStock 286. layout: Navbar 263 · Search 114 · Layout 19 · ProtectedRoute 16.
items: GameCard 41 · KardCard 168 · PackCard 47 · StorageCard 36. ui: Button 36 · Card 26 · ErrorMessage 24 ·
LoadingSpinner 13 · Pagination 85 · SearchBar 142 · SearchableSelect 93 · Select 67 · StaticTag 20 · TCGCamera 139.
api.ts 322 · types/index.ts 205 · contexts Auth 205 · Cart 140 · Theme 46 · config/api.ts 2 · main.tsx 10 · App.tsx 73.

### src/pages/PacksPage.tsx (48) — GOOD reference pattern for SearchLayout usage
- useSearch adapter fixes arg order: (query,limit,offset) => useSearchPacks(gameId, languageId, query, limit, offset).
- filters[] with {label,value,onChange,options} — options from raw axios useEffect (gamesAPI.getGames(100,0).then())
  => unhandled rejection, no loading state, magic id 0 = "All Games".
- `import { useEffect, useState } from "react"`.

### Page import graph (grep)
- SearchLayout used by: GamesPage, KardsPage, PacksPage, StoragesPage (NOT Scanner/CreatePack/CreateKard/UpdateStock/Cart/Login).
- SearchBar used directly by: KardsPage, ScannerPage, CreatePackPage, CreateKardPage, UpdateStockPage (dup of Search.tsx).
- Pagination used by: Search.tsx, KardsPage, ScannerPage, CreatePackPage (dup).
- LoadingSpinner/ErrorMessage used by: Search.tsx, KardsPage, ScannerPage, CreatePackPage, UpdateStockPage, CartPage (dup).
- UpdateStockPage imports `CartItem from "../contexts/CartContext"` — CartItem is a non-exported interface => broken import.
- ScannerPage uses `React.FC` — verify React import present.
- KardsPage imports `useSearchParams from "react-router-dom"` (v7 hook) + `useState from "react"`.

## Remaining files (final batch)
- src/index.css: `@import "tailwindcss"` (Tailwind v4 entry) + `@custom-variant dark (&:where(.dark, .dark *))`
  + 4 hand-written utilities (.perspective/.backface-hidden/.rotate-y-180/.transform-style-preserve-3d) that
  duplicate Tailwind v4 built-ins (perspective-*, backface-hidden, rotate-y-180, transform-style-3d).
- src/App.css: Vite template leftovers (#root/.logo/.read-the-docs) — imported by NOTHING (main.tsx imports
  './index.css' only) => delete file.
- tailwind.config.js: v3-era config (`darkMode: 'class'`) NOT read by @tailwindcss/vite v4 => dead file
  (v4 needs explicit `@config "./tailwind.config.js"` in CSS). Keep or delete = decision.
- Dockerfile: `npm install` (should be `npm ci`), `COPY . .` after install (cache-busting), nginx SPA fallback OK.
- Makefile: buildx arm64 target, fine. .dockerignore exists (verify contents cover node_modules/dist).
- KardsPage.tsx(69): 3 useState constants (gameId/languageId/packId = 0) + big commented block of filters +
  raw axios useEffects => filters UI removed; `useSearchKards` disabled. `// filters={...}` inside JSX tag is
  a VALID comment (TS scanner skips trivia) => just dead code, not a syntax error.
- CartPage.tsx(170): destructures `{ cart, addToCart, removeFromCart, deleteFromCart, clearCart, getSimplifiedCart }`
  from useCart() => **6 of 6 missing** (CartContext returns {cart,setCart}) => runtime crash. 4 useState, 0 useEffect.
  Inline totals computed with 2 reduces (price*priceMultiplier, "id-ID" locale) => shared currency helper.
- LoginPage.tsx(68): `export default function LoginPage()` (only page using default export; others `export const`),
  `React.FormEvent` without React import (type-only error), `console.log(err)` in catch, navigate('/') after login.
- UpdateStockPage.tsx(286): imports non-exported `CartItem` interface from CartContext; 8 useState, 0 useEffect;
  JSON textarea input parsed client-side; protectedKardsAPI/storagesAPI called directly (no hooks).
- CreateKardPage.tsx(627): 17 useState + 3 useEffect + defaultFormState()/handleChange/applyMatch/onCaptured/
  handleSubmit/confirmSubmit + ~430 lines of inline JSX (lines ~200-627) => split into modules + sub-components.
- ScannerPage.tsx(189): `React.FC` with NO React import (type error); hardcoded CAP_API_ENDPOINT const;
  customElements 'cap-widget' lifecycle inline in page; useRef<HTMLDivElement>.
- Navbar.tsx(263): see section above (dup NavLink class x8, inline logout modal, dead commented links).
- TCGCamera.tsx(139): unread in full — verify imports (react-webcam usage) before touching.
- README.md: Vite template text (verify; likely stale).
