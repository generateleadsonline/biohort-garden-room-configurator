# Biohort CasaNova Design Studio

A branded, responsive garden room configurator concept for Biohort, created by Generate Leads Online. Designed to reduce configuration friction and make the value of an enquiry tangible. Conversion uplift is a hypothesis to measure, not a guaranteed result.

## Experience

- Four focused stages: space, style, details, quote.
- Real width and depth sliders snap to Biohort's nine compatible CasaNova sizes. The unavailable 4 × 3 m combination is excluded.
- Interactive 3D, a dimensioned floor plan, official product inspiration, front view, rotation, zoom, dimensions, and evening lighting.
- Metallic dark grey and quartz grey, supported door/glazing options, accessories and foundation/assembly preferences.
- Automatic local design saving and shareable links containing public design choices only.
- Three required form fields, optional phone and project timeline, separate optional marketing consent.
- Price is calculated on the server only after successful private enquiry storage. PDF download requires a valid, expiring quote token.
- Six-page personalised PDF: design, dimensions, specification, itemised estimate, site readiness, next steps.

## Product and price basis

Official [CasaNova product documentation](https://www.biohort.com/gb-en/p/casanova) and [2026 UK price list](https://www.biohort.com/asset/Inhalte/Allgemeine-Seiten/Preislisten/Endkundenpreisliste_cn_GB.pdf). Prices are GBP including 20% VAT and transport to the dealer warehouse. Home delivery, assembly, foundations, electrical work, roof insulation and permissions are separate. Estimates require dealer confirmation.

CasaNova has insulated walls; it is not advertised here as a fully finished, year-round office. The 3D and plan are concept illustrations, not manufacturing or construction drawings. Furniture, vegetation and site styling are illustrative. See `docs/` for research and competitor findings. The competitor quote attachment was not available in the supplied workspace, so no attachment-specific comparison is claimed.

## Run and deploy

Node 22 recommended. Install with `npm install`, validate with `npm test`, build with `npm run build`. Netlify settings are in `netlify.toml`. Continuous deployment follows `main`; static files publish from `dist` and server functions from `netlify/functions`.

Serve the source locally for UI QA; quote/PDF APIs require Netlify function context. Netlify Blobs are private and configured for strong consistency in the EU region. Failed storage prevents price unlock. Expired quote access returns 410. A scheduled function removes expired records daily.

## Enquiries, privacy and measurement

The live concept stores enquiries privately in the Netlify site, not in Biohort's CRM. It sends no automated email or sales follow-up. The operator must connect and verify the authorised CRM/email destination before adopting the tool as a production sales channel. Download links expire after 30 days and expired enquiries are removed daily. Site owners can manage records through authenticated Netlify administration; no public listing endpoint exists.

`window.dataLayer` receives events `biohort_studio_start`, `biohort_step_view`, `biohort_design_change`, `biohort_design_save`, `biohort_design_share`, `biohort_preview_view`, `biohort_quote_request`, `biohort_quote_unlocked`, `biohort_quote_error`, and `biohort_pdf_download`. Events contain no contact details. A production analytics integration should compare valid enquiries, qualified leads, dealer appointments and sales against the original experience. No analytics vendor is installed in this concept.

## Quality checks

Automated checks cover the official size/price matrix, compatibility, VAT arithmetic, validation, persistence failure, PDF gating/expiry and six-page PDF generation. Browser QA covers desktop/mobile layout, continuous sliders, finish and accessory changes, floor plan, share/resume, quote submission, and PDF download. PDF pages are visually rendered and reviewed.

Branding and product photography belong to Biohort. Dependencies are pinned. No credentials, enquiry records, price tables in browser assets, or build output are committed.
