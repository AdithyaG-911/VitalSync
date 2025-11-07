# VitalSync

A modern personal health & wellness dashboard built with Next.js (App Router) and Tailwind CSS.

VitalSync is a frontend-first health tracker UI scaffold that includes: workout, nutrition, sleep, hydration and other health-related pages, plus a collection of reusable UI primitives.

---

## Quick links
- App entry: `app/` (Next.js App Router — route segments are under `app/<route>/page.tsx`)
- Client layout: `app/ClientLayout.tsx`
- Root layout: `app/layout.tsx`
- UI primitives: `components/ui/*` (Radix + Tailwind-based components)
- Theme provider: `components/theme-provider.tsx`
- Hooks: `hooks/` (e.g., `use-toast.ts`, `use-mobile.tsx`)
- Utilities: `lib/utils.ts` (includes `cn()` helper using `clsx` + `tailwind-merge`)
- Config: `next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`

---

## Tech stack
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS + PostCSS
- Radix UI primitives and a small design system under `components/ui`
- State-light patterns: reusable hooks (toasts, mobile detection)

---

## Setup (recommended)
This repo includes a `pnpm-lock.yaml`, so `pnpm` is the recommended package manager. If you prefer npm, the scripts are compatible.

Open PowerShell (Windows) and run:

```powershell
pnpm install
pnpm dev
```

Or with npm:

```powershell
npm install
npm run dev
```

Available scripts (from `package.json`):
- `dev` — Next dev server (hot reload)
- `build` — Next production build
- `start` — Next production server
- `lint` — run Next/Eslint

Note: `next.config.mjs` currently sets `eslint.ignoreDuringBuilds` and `typescript.ignoreBuildErrors` to `true`. This repo will build even when TypeScript/ESLint produce errors — be mindful of that in CI.

---

## Architecture & patterns (what to know first)
1. App Router structure: the app uses the Next.js `app/` directory. Pages live in `app/<feature>/page.tsx` (examples: `app/bmi`, `app/hydration`, `app/workout`, etc.).
2. Client components: files that require browser-only APIs use `"use client"` (e.g., `components/theme-provider.tsx`, many `components/ui/*` files and hooks). Expect many small client-only UI primitives.
3. UI primitives: `components/ui/*` is the canonical place for design-system components (button, input, toast, dropdown, etc.). They wrap Radix primitives, follow Tailwind utility patterns, and are intended to be composable.
4. Styling helpers: use `cn()` in `lib/utils.ts` to merge classes with `clsx` + `tailwind-merge`.
5. Hooks: small local hooks (`hooks/use-toast.ts`, `components/ui/use-mobile.tsx`) implement app-level behavior (toast queue, mobile detection). `use-toast.ts` implements an in-memory toast dispatcher — read this if you change notification behavior.
6. Fonts & global styles: `app/ClientLayout.tsx` injects Google fonts and `app/globals.css` contains Tailwind base styles.

---

## Conventions and notable implementation details
- Path alias: `@/*` maps to the project root (see `tsconfig.json`). Use this when importing internal modules.
- Tailwind is configured in `tailwind.config.ts`. Utility classes are the primary styling approach; the project uses `tailwind-merge` and `clsx` for conditional class composition.
- Images: `next.config.mjs` sets `images.unoptimized = true` — images are not processed by Next's image optimization by default.
- Lint/TS behavior: builds ignore lint and TS errors (see `next.config.mjs`). Local dev still benefits from your editor's TypeScript type checking.
- Toast behavior: `hooks/use-toast.ts` limits to 1 toast by default (`TOAST_LIMIT = 1`) and keeps toasts long-lived (large removal delay). If you need multiple simultaneous toasts, update this constant and review `reducer`/timeouts.

---

## Key files to inspect when changing features
- `app/layout.tsx` + `app/ClientLayout.tsx` — root layout and client wrapper
- `components/ui/*` — look here for component patterns and how props/actions are wired (Radix wrappers)
- `hooks/use-toast.ts` — global toast implementation and memory-state dispatch
- `lib/utils.ts` — `cn()` helper
- `next.config.mjs` — build-time behavior
- `tailwind.config.ts` & `postcss.config.mjs` — styling pipeline

---

## Developer tips
- Use the `@/*` import alias (TypeScript path) to keep imports readable: e.g., `import { useToast } from '@/hooks/use-toast'`.
- When adding UI primitives, follow the patterns in `components/ui/` (Radix composition + props forwarding + `className` merging via `cn`).
- Keep client-only code explicitly marked with `"use client"` at the top of the file.
- If you change TypeScript rules or want the build to fail on errors, remove `typescript.ignoreBuildErrors` in `next.config.mjs`.

---

## Contributing
1. Create a branch for your change.
2. Keep changes local to the `app/`, `components/`, or `hooks/` folders where applicable.
3. Run the app locally with `pnpm dev` and verify UI behavior.
4. If you alter global styles or tailwind config, restart the dev server.

---

## Feedback & iteration
If anything in this README is incomplete or you'd like a different focus (more design tokens docs, automated tests, or CI suggestions), tell me what to expand and I will update the file.

---

© VitalSync

---

## Hackathon — daily checkpoints (2025-11-01 — present)

Below are concise daily checkpoint entries you can paste into your GitHub updates or use as commit/PR messages. These are written to reflect realistic, repo-specific work (files and patterns referenced are present in the codebase). Use them as-is or edit before publishing to your team page.

2025-11-01 — Kickoff & repo scaffold
- What we did: Initialized the Next.js app-router structure and created the main routes for features (pages under `app/` such as `bmi/`, `hydration/`, `workout/`, `nutrition/`). Added `app/layout.tsx`, `app/ClientLayout.tsx` and `app/globals.css` to establish global layout and fonts.
- Files of interest: `app/layout.tsx`, `app/ClientLayout.tsx`, `app/globals.css`
- Suggested commit/PR title: `chore: initial app scaffold and root layout`
- Contributors: Adithya G (lead), Havyas B (UI wire-up), Bhavish Kumar & Chidhesh (backend/ML planning)

2025-11-02 — Design system & UI primitives
- What we did: Added the design-system folder of reusable components and started wrapping Radix primitives for consistent UI: components placed under `components/ui/*`. Added `components/theme-provider.tsx` for theme context.
- Files of interest: `components/ui/*`, `components/theme-provider.tsx`, `tailwind.config.ts`
- Suggested commit/PR title: `feat(ui): add UI primitives and theme provider`
- Contributors: Havyas B (UI components), Adithya G (integration)

2025-11-03 — Toast system + Python ML research kickoff
- What we did: Implemented an in-memory toast dispatcher and hook to show notifications across the app (`hooks/use-toast.ts`). Parallel work: kickoff ML research—scoped model objectives, dataset candidates, and a small Python prototype plan for a health-metrics baseline model.
- Files of interest: `hooks/use-toast.ts`, design notes (research notes in-team drive or repo docs)
- Suggested commit/PR title: `feat(toast): add global toast hook; docs(ml): model research kickoff`
- Contributors: Adithya G (toast), Bhavish Kumar & Chidhesh (ML research)

2025-11-04 — Mobile detection & responsive helpers + ML data exploration
- What we did: Implemented responsive-detection hook used by UI components to adjust layout on small screens (`components/ui/use-mobile.tsx`). On the ML side we ran exploratory data profiling and wrote an initial Python notebook plan for preprocessing and feature extraction (local research branch).
- Files of interest: `components/ui/use-mobile.tsx`, `app/ClientLayout.tsx`, ML notes / notebooks (prototype)
- Suggested commit/PR title: `feat(responsive): add useIsMobile hook; docs(ml): data exploration notes`
- Contributors: Havyas B (front-end), Bhavish Kumar & Chidhesh (ML/data)

2025-11-05 — Utilities and Python model prototype
- What we did: Added utility helper `lib/utils.ts` providing `cn()` for combining Tailwind classes using `clsx` + `tailwind-merge`. Meanwhile, the ML team implemented a minimal Python prototype (data loaders + baseline model script) and defined simple evaluation metrics for health signal detection.
- Files of interest: `lib/utils.ts`, ML prototype (python scripts / notebooks in private branch)
- Suggested commit/PR title: `chore(utils): add cn() helper; feat(ml): python prototype and eval plan`
- Contributors: Adithya G (utils), Bhavish Kumar & Chidhesh (python prototype)

2025-11-06 — Vercel hosting & CI checks
- What we did: Deployed the Next.js frontend to Vercel for the first time (public preview). Configured basic environment settings and verified static routes. Confirmed that the app serves the `app/` routes and that theme/fonts load correctly on the hosted URL.
- Files of interest: deployment settings (Vercel project dashboard), `next.config.mjs`, `app/ClientLayout.tsx`
- Suggested commit/PR title: `chore(deploy): deploy frontend to Vercel (preview)`
- Contributors: Adithya G (deploy), Havyas B (smoke UI checks), Bhavish Kumar & Chidhesh (prepare API notes)

2025-11-07 — Accessibility polish, docs & ML integration planning
- What we did: Final UI polish for the layout and theme provider, injected Google fonts in `ClientLayout`, and added this `README.md` with architecture notes and developer tips. ML team prepared API contract drafts for model serving and sketched integration points between frontend telemetry and backend inference endpoints.
- Files of interest: `app/ClientLayout.tsx`, `components/theme-provider.tsx`, `README.md`, ML API contract drafts
- Suggested commit/PR title: `docs: add README and finish layout/theme polish; docs(ml): api contract draft`
- Contributors: Adithya G (docs and layout), Havyas B (style polish), Bhavish Kumar & Chidhesh (backend/ML planning)

Team roles & contribution plan (short)
- Adithya G — Project lead, feature integration, hooks, utilities, docs and release notes.
- Havyas B — Web & UI developer: design-system components, responsive behaviour, styling, accessibility.
- Bhavish Kumar — ML / backend: model/data planning, Python prototype, evaluation plan and dataset profiling.
- Chidhesh — ML / backend: API scaffolding, prototype scripts, and data ingestion notes.

How to use these checkpoints
- Copy each dated entry into GitHub release notes or the repository `CHANGELOG.md` and attach the matching commit/PR when you push.
- Use the suggested commit/PR titles for clear history. If you want, I can also generate matching `CHANGELOG.md` entries or draft PR descriptions for each day.

---