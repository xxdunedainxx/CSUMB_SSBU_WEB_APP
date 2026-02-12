**Frontend — Astro (minimal)**

This folder contains the frontend site built with Astro (v5). It serves a small UI for cognitive and reaction tests (static HTML test pages live under `public/cognitive_dexterity_tests/`).

**Quick start**

- Install dependencies:

```powershell
cd frontend
npm install
```

- Run development server (hot reload):

```powershell
npm run dev
```

- Build for production:

```powershell
npm run build
```

- Preview a production build locally:

```powershell
npm run preview
```

Scripts are defined in `package.json` and use the installed `astro` package.

**Project structure (important files)**

- `public/` — static files and the HTML-based cognitive tests (e.g., `public/cognitive_dexterity_tests/GoNoGo.html`). These are served as-is.
- `src/pages/` — Astro pages and route entry points (e.g., `src/pages/index.astro`).
- `src/layouts/` — layout templates used across pages (`BaseLayout.astro`, `TestLayout.astro`).
- `src/components/` — shared UI components such as `Header.astro` and `Footer.astro`.
- `src/data/tests.ts` — metadata for the test pages (IDs, filenames, descriptions). The app uses this to list available tests.
- `src/styles/global.css` — global styling.

**Notes & TODOs found in code**

- `src/components/Header.astro` and `Footer.astro` include TODOs for site title and credit text.
- `src/data/tests.ts` contains descriptive TODOs for improving test descriptions.

These are safe to edit as you flesh out branding and content.

**How tests are served**

The tests are simple HTML/JS apps living in `public/cognitive_dexterity_tests/`. The frontend lists them using the metadata in `src/data/tests.ts` and links directly to the static HTML files.

**Contributing / Iteration tips**

- Update test metadata in `src/data/tests.ts` when adding or changing tests.
- Update layout and components in `src/layouts/` and `src/components/` to change site chrome.
- Add images and other static assets to `public/`.

**Useful links**

- Astro docs: https://docs.astro.build

