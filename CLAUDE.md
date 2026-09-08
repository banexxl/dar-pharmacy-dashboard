# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Admin dashboard for a Serbian pharmacy business ("DAR Pharmacy"), built on Next.js 16 (App Router) + React 19 + TypeScript, MUI v7, and Supabase (auth + Postgres). Manages products, orders, customers, blog posts, and a file manager, plus SEO tooling (sitemap submission to Google Search Console). UI copy, validation messages, and seeded data (e.g. category names) are in Serbian.

## Commands

- `npm run dev` — start the Next dev server
- `npm run build` — runs `vitest run` and `next build` (note: joined with `&`, not `&&`, so they run concurrently rather than test-then-build)
- `npm start` — start the production server (after build)
- `npm run lint` / `npm run lint-fix` — `next lint`
- `npm test` — run the full vitest suite once; `npm run test:watch` for watch mode
- Run a single test file: `npx vitest run src/path/to/file.test.ts`
- `npm run generate-env-example` — regenerates `.env.example` from `.env` by stripping values (keys only)

## Architecture

### Routing (`src/app`)
App Router with one route group, `(dashboard)`, holding the authenticated admin pages (`artikli` = products, `porudzbenice` = orders incl. `[orderId]`, `klijenti` = customers, `blog` incl. `[id]`, `datoteke` = file manager). `src/app/auth/` holds login/forgot-password/reset-password/error pages, an OAuth/magic-link callback route, and server actions (`actions.ts`). `src/app/401/` is the unauthorized page. API route handlers live under `src/app/api/`: `aws/aws-s3-file-storage`, `aws/aws-s3-image-storage`, `aws/blog-image-storage`, `categories`, `manufacturers`, `orders/status`, `product-api`.

### Auth
`src/proxy.ts` is the Next 16 middleware (Next 16 renamed `middleware.ts` → `proxy.ts`, exporting `proxy` instead of `middleware`). It matches dashboard/auth/api routes, creates a Supabase SSR client, calls `auth.getUser()` with a 10s timeout race, clears stale `sb-*` cookies on failure, redirects unauthenticated users to `/auth/login?redirect=...` (or returns 401 JSON for API routes), and bounces already-authenticated users away from the login page. `src/context/auth-context.tsx` (`AuthProvider`/`useAuth`) is the client-side counterpart — it wraps `supabaseBrowser.auth.getUser()` / `onAuthStateChange` and exposes `{status, viewer, refresh, signOut}`. **Auth is Supabase + React Context only — there is no Redux auth slice.**

### Data layer
- `src/services/supabase-browser.ts` — client-side Supabase client (`createBrowserClient`), plus generic `fetchRows`/`fetchSingleRow` helpers that try multiple candidate table names and swallow "relation missing" errors.
- `src/services/supabase-server.ts` — `'server-only'` server client (`createServerClient` + Next `cookies()`) for RSC/server actions.
- `src/services/{product,order,user}-services.ts` — domain-specific query/aggregation modules built on the browser client's `fetchRows` (e.g. joining products with manufacturers).
- `src/lib/google/search-console.ts` — Google Search Console API integration (sitemap submission); called directly, not exposed as its own API route.
- `mongodb` and `socket.io`/`socket.io-client` are listed in `package.json` but are **not wired up anywhere in `src`** — treat as vestigial/unused unless you're the one adding that integration.
- `@reduxjs/toolkit`/`react-redux` are dependencies but there is no store, slice, or `useSelector`/`useDispatch` anywhere in the codebase — likely leftover from the admin template this project was scaffolded from. Don't assume Redux state exists.

### Database (`supabase/migrations`)
Three-tier product category hierarchy: `main_categories` → `mid_categories` (FK to main) → `sub_categories` (FK to mid), each with `id/label/value(slug)/created_at`, seeded with real pharmacy categories in Serbian. RLS is enabled on all three tables but currently fully permissive (`USING(true) WITH CHECK(true)`) — not yet locked down. The `products` table references categories by slug text (`main_category`/`mid_category`/`sub_category`), not by foreign key.

### UI structure
- `src/components/` — generic, reusable, app-wide chrome/primitives (`top-nav`, `side-nav`, `account-popover`, `chart`, `file-dropzone`, `scrollbar`, `severity-pill`, `logo`).
- `src/sections/` — page/domain-specific composed UI, one subfolder per feature (`products`, `order`, `customer`, `file-manager`, `companies`, `account`, `overview`), each bundling its tables, dialogs, forms, and feature-local validation schemas (e.g. `src/sections/products/new-product-schema.ts`). These are wired into the corresponding `app/(dashboard)/**/page.tsx`.
- `src/schemas/` — mostly plain TypeScript types/interfaces describing DB row shapes (`customer.ts`, `order.ts`, `product.ts`, `file-manager.ts`), **not** the yup validation schemas. Actual yup schemas (with Serbian `.required()` messages) live next to their form in `src/sections/**`.
- `src/theme/` — modular MUI theme (`create-palette.ts`, `create-components.ts`, `create-shadows.ts`, `create-typography.ts`, `colors.ts` composed in `index.ts`), custom breakpoints (`xl: 1440`), `shape.borderRadius: 8`.
- `src/hooks/` — small reusable hooks (`use-dialog`, `use-popover`, `use-selection`, `use-mounted`, `use-update-effect`).
- `src/utils/` — AWS S3 helper (`utils/aws/aws-s3.ts`), slug generation, currency/byte formatting, emotion cache setup.

### Path aliases
`@/*` and `src/*` both resolve to `./src/*` (see `tsconfig.json` and `vitest.config.mts`) — either prefix is used interchangeably across the codebase.

### Testing
Vitest, tests colocated next to the source file as `*.test.ts`/`*.test.tsx` (no separate `__tests__` directory), e.g. `src/app/api/categories/route.test.ts`, `src/services/supabase-browser.test.ts`, `src/sections/products/new-product-schema.test.ts`.

### TypeScript
`strict` is `false` in `tsconfig.json` — don't assume strict-mode guarantees when reading or writing code here.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
