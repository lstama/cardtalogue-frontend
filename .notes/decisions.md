
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
