
## 2026-07-18 user scope answers (Phase 3)
- Depth: FULL Tier A + B + C, incl. splitting CreateKardPage (627 lines).
- Delete all four dead files: src/App.css, src/components/layout/SampleNavbar.html, src/assets/react.svg, tailwind.config.js.
- useSearchX `enabled:false` is an INTENTIONAL demo state -> DO NOT enable. Tier A item 5 dropped.
  Still fix: react-query key collisions in useProtectedKards + duplicate export name + misnamed api fn.

## 2026-07-18 Phase 3 executed (Tier A + B)
- Verified with a python import checker (no node): all relative imports resolve (extensionless OK under Vite);
  earlier notes about missing placeholder.svg / non-exported CartItem / missing CartContext members were WRONG -> pruned.
- CartContext.tsx: 3 localStorage effects + 2 keys ("cart" vs "offline_cart") -> single `readCart` + single persist
  effect on STORAGE_KEY. Kept full API (it was already complete).
- useProtectedKards.ts: queryKey 'kards'/'kard' -> 'protected-kards'/'protected-kard' (collision with useKards).
- api.ts: full rewrite 322 -> ~230 lines. 3 clients via createClient(); shared refreshAccessToken() used by both
  interceptors (was duplicated); helpers getList/getOne/searchList/create/update/uploadMedia; every exported
  method signature preserved. Renamed kardsAPI.createPack -> createKard (useKards.ts mutationFn updated).
  getKard return type ApiResponse<Kard[]> -> ApiResponse<Kard>. Verified no invented/removed endpoints vs git HEAD
  (packsAPI has NO getPack/getPacksByGame/getPacksByLanguage - removed after first draft).
- Type-only imports as VALUES (breaks Rollup build under verbatimModuleSyntax) -> `import type`: ReactNode in
  Layout/Card/Search/CartContext, RefObject in useClickOutside. AuthContext: dropped React value import + React.FC
  annotations (ScannerPage too), removed info console.log, kept console.error.
- LoginPage: React.FormEvent -> `import type { FormEvent }`. ProtectedRoute: React.ReactNode -> ReactNode.
- Button.tsx: declared `children?: ReactNode` in ButtonProps (was destructured but undeclared).
- Deleted dead files (git rm): src/App.css, src/assets/react.svg, src/components/layout/SampleNavbar.html,
  tailwind.config.js (zero references anywhere; Tailwind v4 via @tailwindcss/vite does not read it).
- package.json: build `tsc -b && vite build` (tsconfig.json uses references), lint `eslint .` (flat config; --ext
  invalid in v9), react/react-dom/@types/react* ^19.0.0 (code uses React 19 ESM named imports), react-router-dom
  ^7.0.0 (code uses v7 `element=` prop), eslint ^9.14.0 + globals ^15.11.0 (eslint.config.js imports both),
  eslint-plugin-react-hooks ^9.0.0 (config uses configs['recommended-latest']); dropped js-cookie/@types/js-cookie/zustand (unused).
  Verified version lines exist: react 19.3.0 latest, @types/react 19.3.0 latest (npm), globals ^15.11.0 (create-vite template).
- OPEN: @vitejs/plugin-react ^4.0.3 vs vite ^7.1.7 (template for vite 7 uses plugin-react ^5) - left unchanged, unverifiable offline.

## Tier C structural (2026-10-11, cont.)
- Navbar.tsx (263->167): class strings hoisted to NAV_ACTIVE/NAV_IDLE/SIGN_IN_BUTTON/HAMBURGER_BUTTON consts; local `navLink(to,label)` helper for the repeated NavLink; logout-confirm markup moved to new `src/components/ui/LogoutModal.tsx` (page owns showLogoutConfirm state). Commented-out nav links replaced by one comment listing the unlinked routes; the Tailwind "flowbite double-dropdown" demo comment deleted.
- Select/SearchableSelect unified: new `src/components/ui/Dropdown.tsx` (shared dropdown, optional search input). `Select.tsx` is now `export const Select = Dropdown`; `SearchableSelect.tsx` wraps Dropdown and maps onSearchQueryChange -> onSearch. SearchBar.tsx left separate (different visual design); only its dead `// <div>` comments removed + quotes normalised.
- items cards: new `src/components/items/ItemCard.tsx` shared shell (title/image/watermark/tags/description). GameCard, PackCard, StorageCard are now thin wrappers (public names unchanged; PacksPage/StoragesCard consumers unaffected).
- CreateKardPage.tsx (627->300): extracted `ui/ScanPanel.tsx` (camera open/upload/matches/autofill state; previewUrl stays in the page and is passed in + set via onPreview so the "Check" button still works), `ui/NewStorageModal.tsx` (owns code/name/desc + createStorage call; page owns open flag + storages list), `ui/ConfirmModal.tsx`, `ui/ErrorModal.tsx`, `ui/ChoiceButtons.tsx` (quantity / for-sale / visibility / rarity button rows, accent colour prop). Behaviour kept; one intentional change: match-selector modal is no force-closed after a successful create (ScanPanel owns it; the "Confirm Selection" button closes it).
- Verification: `.notes/scratch/importcheck.py` (regex-based, no node) — all 51 src files: every relative import resolves to a real file, every imported name is exported, no unused imports. Run: `python3 .notes/scratch/importcheck.py src`.
- Not done (optional): repo-wide quote/semicolon normalisation sweep (plan item 20); only SearchBar.tsx normalised so far.
## 2026-07-18 — verified: refactor build is BROKEN (npm run build allowed this session)
- `npm run build` = `tsc -b && vite build`. HEAD `921e560 refactor by pi harness` -> exit 1, 11 TS1xxx syntax errors, all in `src/services/api.ts`.
- Root cause: unbalanced generics at api.ts:156 and api.ts:173 — `Promise<ApiResponse<Pack[]]>` / `Promise<ApiResponse<Kard[]]>` (one `<` unclosed). Fix: `Promise<ApiResponse<Pack[]>>` / `Promise<ApiResponse<Kard[]>>`.
- Proof it is refactor-introduced: worktree at `5205c9d` (pre-refactor) builds with 0 errors (exit 0); HEAD does not.
- After patching only those 2 lines, build still fails with 7 type errors: ItemCard.tsx(54,38) TS2322; Navbar.tsx(37,23) TS7031; LogoutModal.tsx(3,31)+(3,41) TS7031; SearchableSelect.tsx(21,3) TS2322; AuthContext.tsx(39,32) TS7031; api.ts(82,34) TS2345 (string|null vs string|undefined). All 6 files were touched by the refactor.
- Repro cmds: `npm run build`; single-file check `node_modules/.bin/tsc --target es2020 --module es2022 --jsx react-jsx --lib dom,es2022 src/services/api.ts`.
- Cleanup done: removed tsc -b JS artifacts `src/config/api.js`, `src/services/api.js`; removed scratch worktree /tmp/prebuild.
- NOT fixed in repo (user only asked to check). Uncommitted pre-existing change: `src/config/api.ts`.

## 2026-10-13 — fixed the 9 refactor errors at HEAD; build green (exit 0)
- Applied on top of `921e560` (uncommitted). `npm run build` -> exit 0, tsc -b clean, vite 174 modules.
- api.ts:156/173 -> added the missing `>` (`Promise<ApiResponse<Pack[]>>`, `Promise<ApiResponse<Kard[]>>`).
- api.ts storeTokens: `refreshToken?: string` -> `refreshToken?: string | null` (RefreshResponse.refresh_token is `string|null`; body already truthiness-guards). Chose signature change over `?? undefined` at the call site so the API type is the source of truth.
- ItemCard.tsx: added local `type TagColor = 'blue'|'green'|'red'|'yellow'|'purple'` and `TAG_COLORS: TagColor[]`. StaticTagProps is not exported, so its `color` union had to be restated locally.
- Navbar.tsx: `const navClass = ({ isActive }: { isActive: boolean }) => ...` — the arrow was bound to a variable first, so it had no contextual type (that is why TS7031, not the react-router prop type).
- LogoutModal.tsx: added `type LogoutModalProps = { onCancel: () => void; onConfirm: () => void }` (mirrors ConfirmModal convention).
- SearchableSelect.tsx: `onChange: (id: number) => void` -> `(id: number | string) => void` to match Dropdown (contravariance). All 4 JSX call sites (CreatePackPage x2, CreateKardPage x2) pass unannotated inline arrows into handleChange(`string|number`), so widening is safe; no runtime coercion added.
- AuthContext.tsx: `({ children }: { children: ReactNode })` + `import type { ReactNode } from 'react'` (same pattern as CartContext).
- Left alone: pre-existing uncommitted `src/config/api.ts`; untracked `tsconfig*.tsbuildinfo`, `vite.config.js`, `vite.config.d.ts` (regenerated by tsc -b, not gitignored).
- Not committed: user asked only to check + fix. Decide later whether to commit these as a fixup commit.

## 2026-10-13 — browser test of the main page (web_browse) + API base URL
- `100.64.0.4` = `cachy-pc.ts.tama.id` (/etc/hosts via Tailscale); NOT 127.0.0.1. Vite dev binds localhost only,
  so the app is at http://localhost:3000 (127.0.0.1:3000 and 100.64.0.4:3000 both fail).
- Local backend (`api` binary, `*:8080`) answers on both localhost:8080 and 100.64.0.4:8080 and sends
  `Access-Control-Allow-Origin: http://localhost:3000` (CORS OK). Nothing listens on :80.
- BUG in the user's `src/config/api.ts` edit: `LOCAL_API_BASE_URL = 'http://100.64.0.4/api/v1'` -> port 80 -> dead.
  Needs `http://100.64.0.4:8080/api/v1` (or keep `localhost:8080`). Proved by testing with the port added, then reverted.
- Remote `https://card-api.tama.id/api/v1` -> HTTP 530 (down), so the REMOTE branch is unusable right now.
- Test recipe: `nohup npm run dev > /tmp/vite-dev.log 2>&1 &` then `web_browse http://localhost:3000/`
  (console on, wait_until=networkidle). Result: page renders; with the port fixed the card list resolves to
  "No card found" (local backend has cards total=0, packs total>=1, games total=1).
