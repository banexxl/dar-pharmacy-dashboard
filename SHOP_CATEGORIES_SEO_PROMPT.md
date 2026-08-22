# Prompt: Refactor Shop Category & Product Pages to Use Supabase Category Tables + SEO Optimization

## Context

This is a Next.js (App Router) pharmacy e-commerce shop. The project already has:

### Existing Database Tables (Supabase)

1. **`products`** — fully working, stores `main_category`, `mid_category`, `sub_category` as **text values** (slugs like `'apoteka'`, `'alergije'`, `'kapsule-i-tablete'`).

2. **`main_categories`** — `id` (UUID), `label` (display name), `value` (slug), `created_at`

3. **`mid_categories`** — `id` (UUID), `label`, `value`, `main_category_id` (FK → main_categories.id), `created_at`

4. **`sub_categories`** — `id` (UUID), `label`, `value`, `mid_category_id` (FK → mid_categories.id), `created_at`

The products table references categories by their `value` (slug text), NOT by UUID FK. The category tables serve as the source of truth for what categories exist and their display labels.

### Existing Route Structure (Shop — separate Next.js frontend)

```
proizvodi/[mainCategory]/page.tsx                         → List products by main category
proizvodi/[mainCategory]/[midCategory]/page.tsx           → List products by main + mid category
proizvodi/[mainCategory]/[midCategory]/[subCategory]/page.tsx → List products by all 3 levels
proizvodi/[mainCategory]/[midCategory]/[subCategory]/category-client.tsx → Client component for category pages

proizvod/[slug]/page.tsx                                  → Single product detail
proizvod/[slug]/product-detail-client.tsx                 → Client component for product detail

proizvodi-proizvodjac-kategorija/[manufacturer]/page.tsx  → Products filtered by manufacturer
proizvodi-proizvodjac-kategorija/[manufacturer]/[mainCategory]/page.tsx → Products filtered by manufacturer + main category
```

---

## Task

Refactor the shop's category listing pages and product detail page to:

1. **Use the Supabase category tables** (`main_categories`, `mid_categories`, `sub_categories`) to dynamically resolve category labels, validate category slugs, and build navigation/breadcrumbs — instead of hardcoded arrays.

2. **Add full SEO optimization** for every page in the hierarchy.

3. **Reshape the filter/category pages** for better SEO structure.

---

## Detailed Requirements

### 1. Category Pages — Use DB Tables

For each category route (`proizvodi/[mainCategory]`, `proizvodi/[mainCategory]/[midCategory]`, etc.):

- **Server-side (page.tsx):**
  - Query `main_categories` to validate the `[mainCategory]` slug exists. If not found → `notFound()`.
  - Query `mid_categories` (filtered by the resolved main_category_id) to validate `[midCategory]` slug. If not found → `notFound()`.
  - Query `sub_categories` (filtered by the resolved mid_category_id) to validate `[subCategory]` slug. If not found → `notFound()`.
  - Fetch the corresponding products using the slug values: `WHERE main_category = :mainSlug AND mid_category = :midSlug AND sub_category = :subSlug`.
  - Also fetch sibling categories at each level to display as navigation/filter links (e.g., show all mid categories for the current main category as sidebar links).
  - Pass the resolved **labels** (human-readable names) along with the data to the client component.

- **Client component (category-client.tsx):**
  - Display a breadcrumb: `Početna > Proizvodi > {mainLabel} > {midLabel} > {subLabel}`
  - Show a sidebar or top filter bar with sibling categories as links (for internal linking / SEO).
  - Display the products grid with proper structured data.

### 2. Product Detail Page — SEO

For `proizvod/[slug]/page.tsx`:

- Resolve the product's category labels from the DB (join or lookup `main_categories`, `mid_categories`, `sub_categories` by matching the product's `main_category`, `mid_category`, `sub_category` values).
- Use those labels for breadcrumbs and structured data.

### 3. SEO Requirements for EVERY Page

#### a) Dynamic `metadata` / `generateMetadata`

Each page.tsx must export `generateMetadata` that produces:

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  // Resolve labels from DB
  return {
    title: `${categoryLabel} | Dar Pharmacy`,  // or product name for detail
    description: `Kupite ${categoryLabel} online. Širok izbor proizvoda iz kategorije ${categoryLabel}. Brza dostava.`,
    alternates: {
      canonical: `https://darpharmacy.rs/proizvodi/${mainSlug}/${midSlug}/${subSlug}`,
    },
    openGraph: {
      title: `${categoryLabel} - Dar Pharmacy`,
      description: `...`,
      url: `https://darpharmacy.rs/proizvodi/...`,
      type: 'website', // or 'product' for product detail
      images: [{ url: '...og-image or product image...' }],
    },
  };
}
```

- **Main category page title:** `{mainLabel} - Dar Pharmacy | Online Apoteka`
- **Mid category page title:** `{midLabel} - {mainLabel} | Dar Pharmacy`
- **Sub category page title:** `{subLabel} - {midLabel} | Dar Pharmacy`
- **Product detail title:** `{productName} | Dar Pharmacy`

#### b) JSON-LD Structured Data

Each page must include JSON-LD in the `<head>`:

**Category pages** — `CollectionPage` + `BreadcrumbList`:

```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "{categoryLabel}",
  "description": "...",
  "url": "https://darpharmacy.rs/proizvodi/...",
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Početna", "item": "https://darpharmacy.rs" },
      { "@type": "ListItem", "position": 2, "name": "Proizvodi", "item": "https://darpharmacy.rs/proizvodi" },
      { "@type": "ListItem", "position": 3, "name": "{mainLabel}", "item": "https://darpharmacy.rs/proizvodi/{mainSlug}" },
      ...
    ]
  }
}
```

**Product detail page** — `Product` schema:

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "...",
  "description": "...",
  "image": "...",
  "brand": { "@type": "Brand", "name": "{manufacturer_name}" },
  "offers": {
    "@type": "Offer",
    "price": "...",
    "priceCurrency": "RSD",
    "availability": "https://schema.org/InStock",  // based on available_stock
    "url": "https://darpharmacy.rs/proizvod/{slug}"
  },
  "category": "{mainLabel} > {midLabel} > {subLabel}"
}
```

#### c) `generateStaticParams` (Optional but Recommended)

For category pages, export `generateStaticParams` to pre-render all valid category combinations at build time:

```typescript
export async function generateStaticParams() {
  // Query all main_categories → return [{ mainCategory: 'apoteka' }, { mainCategory: 'kolagen' }, ...]
  // For nested routes, query mid/sub accordingly
}
```

This enables ISR/SSG for all category pages.

#### d) Semantic HTML Structure

- Use `<h1>` for the category label (only one per page).
- Use `<h2>` for section headings like "Proizvodi" or subcategory navigation.
- Use `<nav>` with `aria-label="breadcrumb"` for breadcrumbs.
- Use `<main>` for the primary content area.
- Use `<article>` for each product card in the grid.
- Wrap category sidebar links in `<aside>` with `<nav>`.
- All images must have `alt` text (product name).
- All links must have descriptive text (no "click here").

#### e) Internal Linking for SEO

- Category pages should display links to child categories (if on main → show mid categories as links; if on mid → show sub categories).
- Product cards should link to `/proizvod/{slug}`.
- Breadcrumbs should link to each parent level.
- Footer or sidebar should include top-level category links.

#### f) URL Canonicalization

- Every page must have a `<link rel="canonical" href="..." />` via the metadata `alternates.canonical`.
- Category URLs must be lowercase slugs with no trailing slashes.
- If a user hits an invalid category combo → 404 (already handled by `notFound()`).

### 4. Manufacturer + Category Pages

For `proizvodi-proizvodjac-kategorija/[manufacturer]/[mainCategory]/page.tsx`:

- Validate manufacturer exists in the `manufacturers` table.
- Validate main category exists in `main_categories`.
- Fetch products filtered by both.
- SEO title: `{manufacturerName} - {mainCategoryLabel} | Dar Pharmacy`
- Include `BreadcrumbList` structured data.
- Canonical URL pointing to this specific filter combination.

### 5. Performance Considerations

- Use `cache: 'force-cache'` or `next: { revalidate: 3600 }` for category table queries (they rarely change).
- Products can use `revalidate: 300` (5 min) or on-demand revalidation.
- Category lists (for sidebar navigation) should be fetched once and shared across the layout if possible.

### 6. Sitemap Considerations

- Generate dynamic sitemap entries for:
  - All main category pages
  - All main + mid category combinations
  - All main + mid + sub category combinations
  - All product detail pages
  - All manufacturer pages and manufacturer + category combos

---

## Summary of Files to Modify/Create

| File | Action |
|------|--------|
| `proizvodi/[mainCategory]/page.tsx` | Refactor to query DB categories, add `generateMetadata`, `generateStaticParams` |
| `proizvodi/[mainCategory]/[midCategory]/page.tsx` | Same as above for mid level |
| `proizvodi/[mainCategory]/[midCategory]/[subCategory]/page.tsx` | Same for sub level |
| `proizvodi/[mainCategory]/[midCategory]/[subCategory]/category-client.tsx` | Refactor to accept labels from server, render breadcrumbs + structured data + semantic HTML |
| `proizvod/[slug]/page.tsx` | Add `generateMetadata` with product SEO, resolve category labels |
| `proizvod/[slug]/product-detail-client.tsx` | Add JSON-LD Product schema, breadcrumbs with category labels |
| `proizvodi-proizvodjac-kategorija/[manufacturer]/page.tsx` | Validate manufacturer, add SEO metadata |
| `proizvodi-proizvodjac-kategorija/[manufacturer]/[mainCategory]/page.tsx` | Validate both, add SEO metadata |
| New: `lib/categories.ts` or `services/category-services.ts` | Shared helper functions to query/validate categories from Supabase |
| New: `components/breadcrumbs.tsx` | Reusable breadcrumb component with JSON-LD |
| New: `components/json-ld.tsx` | Helper to render JSON-LD script tags |

---

## Tech Stack Reminder

- Next.js 15 (App Router)
- Supabase (PostgreSQL) via `@supabase/ssr`
- TypeScript
- MUI (Material UI) for components
- Serbian language for user-facing content
- Domain: `darpharmacy.rs`
