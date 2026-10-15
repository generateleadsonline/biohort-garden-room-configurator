# Biohort garden building designer (v2)

A 3D designer for Biohort's six walk-in metal garden buildings, built by Generate Leads Online as a concept for Biohort UK.

**Live:** https://biohort-garden-room-configurator.netlify.app/configurator/

## What it does

- **Eight steps:** range, size, colour, doors and windows, roof, base, inside, price.
- **Six ranges, 54 sizes:** HighLine (7), AvantGarde (8), Europa (9), Panorama (5), Neo (16) and CasaNova (9), in every colour Biohort sells each one in.
- **Options:** doors, double doors, windows and glass panels; roofs, canopies, light bands, PV and downpipes; SmartBase and other foundations; and the inside fittings (shelves, rails, bike holders, tool holders, lights, panelling, sauna).
- **Prices:**
  - Every option resolves to a Biohort article number and its published GB price.
  - Anything Biohort doesn't price (assembly, your own concrete base, extra double doors on HighLine and AvantGarde, the electric gate on CasaNova 3 x 3) shows as **Quoted**. No price is invented.
  - **Gated (since 15 Oct 2026):** the design's price stays locked until the visitor sends their details. The footer shows "See your price", the size cards show no building price, and the price step shows a blurred card with the form under it ("Show my price"); the figures and the shop link are not in the page until then. A successful send (from the price step or any other form, since every form carries the design) unlocks the itemised price, Book a call as the next step, Download PDF and the link to the product in Biohort's GB shop, for the browser session (sessionStorage `bh-receipt-v1`). Option prices ("+£x") and "From £x" stay visible.
- **3D:**
  - Each range is built to Biohort's dimension tables, drawings and their own configurator's grid.
  - Textures are at true scale.
  - Every option change turns the camera to the part and highlights it.
  - Outside, inside and plan views. Zoom with buttons, scroll or pinch. The plan shows dimensions.
  - The page paints a poster first (the LCP). The 3D then starts by itself, as Yorkshire's `start.js` does: once the poster has painted (its LCP entry, a moment after it loads, or 3s) and the page has loaded and settled (2.5s, then the first idle moment), with an 8s backstop. A first interaction, or a shared or saved design, starts it sooner. `?qa=layout` never starts it.
- **Sales:**
  - The header has Request a callback, Visit showroom (stockist search), Download brochure (Biohort's own catalogue) and the phone number.
  - The price step adds the lead form, Book a call (open at any time; stored as type `book-call`), Download PDF and, once unlocked, a link to the exact product in Biohort's GB shop.
  - Verified selling points sit beside each step.
  - A first-visit tour can be replayed from Help.
- **Forms:**
  - Fields: first name, last name, a UK phone checked against Ofcom's numbering plan, email and postcode.
  - Each enquiry carries the full specification, the priced lines and links that reopen the design.
- **PDF:** cover render, every side, inside and plan renders, a dimensioned plan, the specification, an itemised price with article numbers, and next steps with a booking link and QR code.

Points to confirm with Biohort, including every place their sources disagree, are in [docs/CONFIRMATIONS.md](docs/CONFIRMATIONS.md). The QA results are in [docs/QA-REPORT.md](docs/QA-REPORT.md).

## Where the data comes from

`research/` holds the sources:

- the GB product pages;
- Biohort's Roomle configurator and the GB price index it prices from;
- the 2026 GB price lists;
- the English catalogue and the CasaNova brochure;
- photographs and measurements.

`npm run data` (`tools/build-catalog-data.mjs`) turns them into `src/data/{sizes,prices,accessories}.js`. `src/catalog.js` holds the ranges, options, the article-number resolver and the price lines. `npm test` checks every option resolves on more than 1,000 designs and compares all 741 article prices against the price-list text.

## Code

- `src/app.js`: steps, panels, forms, analytics (`bh_*` events on `window.dataLayer`), share links (`b1.` codes).
- `src/scene/`:
  - `boot.js`: the SMART start-up ladder. Quality tiers, WebGL 1 build, safe tier, SVG drawing, crash guard, `?debug3d`.
  - `scene.js`: camera, views, focus and highlight, plan overlay.
  - `building.js`: walls, doors, roofs, canopies, bases.
  - `fittings.js`: inside fittings.
  - `textures.js`: textures.
  - `svg.js`: last-resort drawing.
- `src/pdf.js`: the PDF (jsPDF; fonts and logo in `src/pdf-assets.js`, built by `tools/build-pdf-assets.py`).
- `server/` and `netlify/functions/`:
  - `enquiry`: stores enquiries in the private Netlify Blobs store `biohort-enquiries`.
  - `diagnostics`: stores 3D device reports in `biohort-3d-diagnostics`.
- `three` 0.170 for the main build. `three-webgl1` (three r162) for the WebGL 1 build in `dist/legacy/`.

## Run, test, deploy

```bash
npm install
npm test
npm run build
PORT=4841 STATIC_DIR=dist node tools/dev-api.mjs
```

`tools/dev-api.mjs` serves `dist` with the production headers and CSP plus the two functions, so forms work locally. Netlify is Git-linked: a push to `main` builds and deploys. Docs-only commits use `[skip netlify]`.

## QA tools (`tools/qa/`)

Set `BASE` to the local or live origin. Set `GPU=1` (example PDF) or `ANGLE=metal` (the other suites) to render on the Mac GPU.

| Script | Checks |
|---|---|
| `option-sweep.mjs` | Every option changes the 3D, the camera turns to it and the right part is highlighted |
| `check-zfighting.mjs` | No coplanar overlapping faces across ranges, sizes and options (`zfight.js` runs in the page) |
| `check-mobile-3d.mjs` | iPhone (WebKit) and Android (Chrome) with forced failures: dropped context, no WebGL, WebGL 1 only, shader failures, crash guard |
| `layout.mjs` | 320 to 1440px: no sideways scroll, 44px targets |
| `a11y.mjs` | axe-core over every step, form, dialog and the tour |
| `events.mjs`, `forms.mjs`, `links.mjs` | Analytics, form validation and storage including the price step's form and the PDF it unlocks (`LIVE=1` never submits), PDF links |
| `standard.mjs` | The 15 Oct 2026 standard as a fresh visitor sees it, at 1440x900 and 390x844: the 3D shows by itself within 10s, the tour opens, the price (bar, size cards, price step) and shop link are hidden until details are sent, then the price, Book a call (`book-call`), PDF and shop link unlock. `LIVE=1` answers every POST in the browser |
| `example-pdf.mjs` | Generates the reviewed example PDF |
| `verify-live.mjs` | Live files match the build by MD5 |

The 3D checks reuse SMART Modular's `check-mobile-3d.mjs`, `check-zfighting.mjs` and `configurator-boot.js`.

Product photographs, the logo and range names belong to Biohort GmbH.
