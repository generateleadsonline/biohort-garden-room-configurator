# Competitor UX/CRO research — 11 October 2026

Both requested competitors were inspected directly in the in-app browser, including product, size, style, glazing, and quote steps. No enquiry was submitted to either competitor. Their quote PDFs could therefore not be verified from the gated live flow. The user-mentioned attachment was not available to this agent; do not claim to have compared it.

## Noah

Source: https://start.noahgardenrooms.co.uk/configurator/

Observed: six steps for garden rooms, nine for annexes. A large interactive 3D stage supports outside, interior, plan, dimensions, undo/redo, mirror, measurement, sun/shadows, full screen, sharing, and phone AR through a QR code. Saved designs can resume locally; encoded URL state restores the specification. Range cards explain differences. Sizing uses numeric fields and increment buttons, with popular sizes and feet/metres. Cladding can differ by wall. Doors/windows can be positioned on the model, with accessible panel equivalents. Specification summaries and inclusions are detailed.

The total price and PDF are gated at the last step. Form fields: first name, last name, email, phone, postcode. Copy additionally says email confirmation is needed. VAT, delivery radius, installation, validity and separately quoted work are explained. Selected upgrades nevertheless expose individual price deltas earlier.

Strengths: confidence through a visibly editable model, saved progress, transparent inclusions and room-level control. Opportunities: long panel content, five required fields, verification delay, and a technically dense flow may increase abandonment. Biohort should preserve clarity and recoverability with fewer decisions and immediately rewarding reveal.

## SMART Modular

Source: https://smart-modular-buildings-homepage.netlify.app/configurator/

Observed: five steps: use/range, size, style, glazing, quote. Use-led presets make sizing approachable. Width/depth use dropdowns; external area and imperial equivalents are displayed. The preview has 3D, floor plan and real range-photo modes, outside/front/inside cameras, dusk, zoom and reset. Undo/redo, local save and URL sharing are available. Copy carefully distinguishes reference photographs and illustrative furniture from the exact design.

A persistent quote CTA explains that enquiry unlocks price/PDF. Required inputs: name, email, postcode; phone, timeline, budget and notes are optional. Marketing consent is a separate unchecked choice. The pre-submit summary exposes exclusions. The PDF promise is a six-page guide containing views, labelled layout, specification, indicative building price and brand differentiation. Base, mains electrics and site-specific costs are quoted separately. The stated next step is a discovery call.

Strengths: benefit-led language, optional qualification and a repeated value exchange. Opportunities: tiny floor plan, small model within a broad stage, dropdown dimensions and repeated CTA clutter. Biohort can show a larger dimensioned model, snapped sliders, fewer steps and stronger PDF previews.

## Additional GitHub / Netlify patterns

### ThreeJS Room Configurator

Primary repository: https://github.com/CodeHole7/threejs-3d-room-designer

Live Netlify demo inspected: https://threejs-room-configurator.netlify.app/

Repository documents editable 2D wall plans, furniture placement in 2D/3D, orientation, dimensions and per-part materials/styles. The demo loads a responsive 3D room with a left icon rail. Useful patterns: one configuration state rendered in both 2D/3D, exact dimensional control, and immediate material changes. Its CAD-like icon-only rail and limited accessible labels would be poor choices for a consumer lead journey.

### Per-part configuration and fit-to-view

Primary repository inspected: https://github.com/gorhorvat/product-configurator-3d

Documents per-part colours, two-way selection between controls and model, orbiting, loading feedback, automatic centring and fit-to-view. Relevant inspiration: reflect each user action in the scene, keep the building framed when size changes, and provide named swatches instead of an unlabeled colour palette. Automatic fit and material caching support perceived speed.

### Model-driven selection

Primary repository inspected: https://github.com/Hornflakes/sketchfab-3d-product-configurator

Supports dynamic configuration against a 3D model through Sketchfab Viewer API. Useful conceptual pattern: keep render parts tied to the product schema. Do not import incompatible furniture assets, undocumented pricing rules or another company's product geometry merely to obtain visual complexity.

## Recommended Biohort experience

1. Start directly in the configurator with a compelling CasaNova preview and a useful standard preset. Suggested structure: Space, Style, Details, Your design/quote. A step should contain a small coherent group of decisions; do not combine unrelated product family specifications.
2. Make width and depth actual range sliders with visible values, endpoint labels, large touch targets, keyboard arrows and +/- alternatives. Snap to verified valid Biohort module dimensions; never imply arbitrary bespoke sizing. Display footprint immediately.
3. Use a large, consistently framed model with front/isometric/plan views, dimensions and visual material/glazing changes. Keep rotate instructions brief. Progressive disclosure keeps accessories understandable. Show what comes as standard beside selectable upgrades.
4. Make the final lead gate an explicit value exchange from the outset: reveal the estimate, save this exact specification, download the personalised design guide. Keep the total price and PDF genuinely hidden before submission. Avoid leaking price totals through plan labels, public DOM, hidden buttons or prematurely generated files.
5. Collect name, email and region/postcode when necessary for fulfilment; phone should be optional unless demonstrably essential. Qualification can be optional or collected after reveal. Never bundle request handling with marketing consent. Show specific privacy and response expectations backed by the actual implementation.
6. Reward successful submission immediately with the estimate, line-item selection summary and PDF. Preserve the unlocked design across reload; permit editing and re-downloading. Explain indicative pricing, exclusions and how a dealer verifies the final specification. Do not claim that an email was sent unless a delivery integration confirms it.
7. Persist design locally and encode public design selections in a shareable URL, excluding personal contact details. Offer clear reset and undo controls. Mobile layout should keep the preview visible and the primary action reachable without trapping the user in nested scroll areas.

These are CRO hypotheses. Improvement should be measured, not promised: track start, decision changes, step exits, gate views, validation failures, successful submissions, reveal and PDF downloads. Compare qualified lead rate and dealer conversion as well as raw form completion.

## Quote PDF direction

The attached competitor PDF was unavailable. Create an original, polished guide that answers the questions a dealer and buyer will need, with a consistent Biohort red/charcoal/white system and restrained typography.

- **Cover / decision page:** customer's first name, project use, design reference, date, primary 3D view, exact external dimensions and one concise sentence explaining the selected configuration.
- **Design / layout page:** clean plan plus front and side views, readable dimensions, door position and orientation, labelled glazing and a clear external-versus-internal measurement note. Use high-resolution exported current configuration, not an unrelated hero photo.
- **Specification / estimate page:** model, verified module size, finish, glazing, selected accessories, what's included, itemised indicative cost and VAT/currency basis. Put delivery, foundation, assembly and site-specific assumptions adjacent to the estimate. Never present invented pricing as an official fixed quotation.
- **Project readiness / next step page:** base/access checklist, items a dealer must verify, relevant verified Biohort quality claims, a clickable return-to-design link or QR code, and a direct dealer/contact action. Add privacy-safe contact details only when supplied by the customer.

Use a unique reference in every page footer; include page numbers and a short disclaimer. In the final QA, confirm correct current selection, no clipped tables, readable plan labels, functioning links, no blank pages, no PII in share URLs, and price/PDF access only after successful form submission.
