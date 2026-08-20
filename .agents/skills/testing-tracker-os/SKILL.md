---
name: testing-tracker-os
description: How to test the Tracker OS app (deployed Cloudflare Pages frontend + Render FastAPI backend), including the gratitude journal flow, known deployment gotchas, and computer-use input limitations.
---

# Testing Tracker OS

## Environments
- Deployed frontend (Cloudflare Pages): `https://tracker-os-bop-9jg.pages.dev` (Pages project `rintu-tracker-os`).
- Deployed backend (Render, FastAPI): `https://tracker-os.onrender.com`
  - `GET /health`, `GET /api/gratitude`, `GET /api/gratitude/today`, `POST /api/gratitude`
  - `/docs` is disabled unless `ENABLE_DOCS=1`.
- No login/auth exists — the sidebar "Log out" button only shows a toast. No credentials needed to test.
- Local dev (if ever needed): see repo blueprint (`docker compose up -d` for postgres, uvicorn, `npm run dev`).

## Quick pre-flight checks before browser testing
```bash
curl -s https://tracker-os.onrender.com/health
# CORS check for the deployed origin (must echo the Pages origin back):
curl -s -D- -o /dev/null -H "Origin: https://tracker-os-bop-9jg.pages.dev" \
  https://tracker-os.onrender.com/api/gratitude | grep -i access-control
# Confirm the deployed bundle has the right API URL baked in (Next static export):
grep -rl "onrender.com" frontend/.vercel/output/static/_next/static/chunks | head
grep -rl "localhost:8000" frontend/.vercel/output/static/_next/static/chunks | head   # must be empty
```
`NEXT_PUBLIC_API_URL` is baked at build time (`frontend/src/lib/api.ts`), so a wrong value can only be fixed by rebuilding + redeploying — check the bundle, not just the workflow file.

## Gratitude journal specifics (main real feature)
- UI path: `/dashboard/gratitude` (sidebar "Gratitude").
- Save gating lives in `frontend/src/lib/gratitude.ts`: `canSave = items.some(i => i.trim().length > 0)` — the button enables when **any one** field is non-blank, not all three. Whitespace-only counts as blank.
- `POST /api/gratitude` **upserts by today's date** (`backend/app/routers/gratitude.py`), so re-saving updates today's row instead of creating a duplicate. To see a "new" entry appear you must wait for a new date or edit the DB.
- Backend `str_strip_whitespace=True` and `max_length=500` (`backend/app/schemas.py`): whitespace-only values are silently saved as empty strings; >500 chars returns 422 and the UI shows `Save failed (422).`
- Success message "Saved today's entry." auto-hides after 2.5s — screenshot within ~1-2s of clicking Save or you will miss it.
- Testing writes to the user's **real** database. Keep entries recognizable and restore the previous values when done (read them first from `GET /api/gratitude`).

## Other UI surfaces
- All non-gratitude dashboard routes are "Coming soon." placeholders (`PlaceholderSection`). Expected, not a bug.
- `/` (root) still serves the default create-next-app boilerplate — flag it, but it is a known gap, not a deploy failure.
- Theme toggle = sidebar bottom-left button `aria-label="Toggle theme"`, stored in `localStorage.theme`; survives reloads.
- Assistant FAB = bottom-right `aria-label="Toggle assistant"`, opens a placeholder panel.

## Computer-use input gotcha (important)
`xdotool`-based `type` silently drops non-Latin-1 characters (CJK, Arabic, emoji, em dash). To test unicode round-trips, put the text on the clipboard and paste:
```bash
sudo apt-get install -y xclip   # may not be preinstalled
printf 'Unicode 你好 مرحبا 🙏' | xclip -selection clipboard -i   # uses $DISPLAY=:0
```
then `ctrl+a` / `ctrl+v` in the field. Accented Latin (é, à, ü) types fine directly.

## Devin Secrets Needed
- `CLOUDFLARE_API_TOKEN` — only needed for (re)deploying to Cloudflare Pages; requires Account → Cloudflare Pages → **Edit** (a Read-only token fails `pages deploy` with code 10000). Not needed for pure testing of the already-deployed site.
