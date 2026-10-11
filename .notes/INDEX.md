# Notes INDEX — cardtalogue-frontend refactor

- `scratch/identify.md` — Phase 1 findings: per-file smells, bugs, broken imports, duplication counts (accurate line counts included).
- `progress.md` — current goal / status / next steps.
- `decisions.md` — append-only log of refactor decisions + rejected alternatives.
- `plan.md` — Phase 2 refactor plan (ordered, with risk notes).
- `scratch/importcheck.py` — regex import/export/unused checker (run: `python3 .notes/scratch/importcheck.py src`)
- `ui/Dropdown.tsx`, `ui/LogoutModal.tsx`, `items/ItemCard.tsx`, `ui/ScanPanel.tsx`, `ui/NewStorageModal.tsx`, `ui/ConfirmModal.tsx`, `ui/ErrorModal.tsx`, `ui/ChoiceButtons.tsx` — new shared components (Tier C)
