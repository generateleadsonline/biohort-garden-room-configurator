# QA report: Biohort garden building designer v2

## 15 October 2026: gated price and live 3D on load

The GLO configurator audit of 15 October 2026 found two gaps against the house standard:

- **Price not gated.** "£2,699 inc VAT" showed in the footer and on the price step throughout.
- **No live 3D on load.** The 3D started only on the first drag.

### What changed

| Standard point | Change |
|---|---|
| 2. Live 3D on load | The 3D starts by itself after the first paint, following Yorkshire's `start.js` and `designer.js` and the Outsiders fix: once the poster has painted (its LCP entry, a moment after it loads where LCP isn't reported, or 3s), the page has loaded and nothing has downloaded or held the main thread for 3s (resource and long-task timings), at the next idle moment; 8s after the paint at the latest. Any touch, click, key, wheel, scroll or mouse move, or a shared or saved design, starts it at once. Lighthouse stops recording about 2.3s after the last response, so the scene build stays out of its window. The boot ladder (WebGL2, safe, WebGL1 on three r162, SVG), crash guard and `?debug3d` are unchanged. `?qa=layout` still never starts it. |
| 3. Intro walkthrough | Unchanged (opens 600ms after load on the first visit, replayed from Help). Its copy now says the full price is shown once the design is sent. |
| 4. Gated price | The design's price is locked until details are sent. The footer chip reads "See your price" (a button to the form; the static HTML used to flash "Guide price £33,124", a leftover from the template). The size cards no longer show each size's building price before then. The price step shows a blurred placeholder card with the lead form under it ("Show my price"); the figures and the link to the product in Biohort's GB shop are not in the page until then. A successful send from the price step, or from any other form (each carries the design with the visitor's details), unlocks the itemised price, Book a call as the next step (the footer button becomes "Book a call"), Download PDF and the shop link, for the browser session (`bh-receipt-v1`). Before then Download PDF points to the form. Option prices ("+£x") and "From £x" in the range comparison stay visible. |
| 6. Price step | Lead form plus Book a call ("Pick a day and time to talk it through") and Download PDF. Book a call is sent through the existing Blobs function as type `book-call` (the server still accepts `book` and `pdf` from pages loaded before the change) and is tracked as `bh_cta_click` `book-call`. |
| 8. Lead form | First and last name, required UK phone (Ofcom rules), email and postcode, validated by the same code as the dialog (now one `formKit` for both forms). |

Fixes found while checking (the same as on My Retreat, which shares this code):

- **Phones: each step opened behind the 3D.** After a step change the panel was scrolled to the top of the window, under the pinned 3D and step bar, so the title (and, on the price step, the locked price and the form heading) were hidden. It now scrolls to just below the step bar. On desktop only the panel scrolls, never the window.
- **A corrected field cleared its error on blur,** which moved the send button under the pointer mid-click, so the click was lost. Errors on a corrected field now clear as it is typed.

### Results (local build, production headers and CSP via `tools/dev-api.mjs`)

| Check | Result |
|---|---|
| Unit tests (`npm test`) | 12/12 (now including the `book-call` type); 739 of 741 prices match the GB price list, 2 not printed in it (unchanged) |
| `standard.mjs` (new): fresh visitor at 1440x900 and 390x844, headless Chrome on Metal, no interaction | 44/44. Canvas after about 3.6s (desktop) and 3.4s (phone); tour open; no POST before the price step; no price in the bar, the size cards or the price step, and no shop link, before the send; Book a call and Download PDF on the price step; locked PDF points to the form; 021 number refused; after the send the price, Book a call, PDF and the GB shop link unlock; Book a call sent as `book-call` with day and time |
| iPhone (Playwright WebKit 2215, no LCP API), fresh visitor | Canvas after 3.1s, tour open, price locked |
| Throttled phone (CDP network emulation), local | Canvas after 4.2s at 9Mbps/60ms and 7.0s at 1.6Mbps/150ms, no interaction |
| `forms.mjs` | 29/29: four dialog forms plus the price step's form; five records stored (callback, showroom, brochure, `book-call`, quote); the PDF downloads once unlocked |
| `links.mjs` | 8/8: the PDF's links reopen the design with the price locked for a new visitor, and with its price once details were sent |
| `events.mjs` | pass (desktop and phone) |
| `a11y.mjs` (axe) | 0 violations in 69 states, including the price step's form with errors and the unlocked price step |
| `layout.mjs` | 34/34 (7 widths, three ranges), no sideways scroll, every target 44px or more (the unlocked price step added) |
| Lighthouse mobile, local, 3 runs | 98, 99 and 99 / 100 / 100 / 100; FCP 1.2s, LCP 1.8 to 2.3s (the poster), TBT 0ms, CLS 0.019 |

Not rerun: the option sweep, z-fighting and phone failure suites; the scene, boot and options are unchanged.

Known and unchanged: at 320px wide, on the Colour and Doors and windows steps, the long Next label ("Next: Doors & windows", "Next: Roof & canopy") leaves the footer chip too little room and it runs a few pixels under the Back button (the unlocked price did the same before).

Evidence: `docs/qa/fix-2026-10-15/local/` (logs, the fresh-visitor screenshots and the Lighthouse summary).

### Deploy and live checks

Commits `4733170` (gate and auto-start), `e9d8c40` (start timing iteration) and `be393df` (the quiet-window start, live), pushed to `main`; Netlify (Git-linked) deploy `6ad0e39b130f72a2ae207965`. `verify-live.mjs`: all 31 live files match the build, CSP header present. No live form was submitted: `standard.mjs` answers the POSTs in the browser (from the price step on, and fails if any POST happens before), and `forms.mjs` ran with `LIVE=1`.

| Check (live, https://biohort-garden-room-configurator.netlify.app/configurator/) | Result |
|---|---|
| `standard.mjs` with `LIVE=1` | 44/44; canvas after 8.0s (desktop) and 4.5s (phone) with no interaction; the gate, unlock, Book a call (`book-call`) and PDF as locally |
| Fresh-visitor timing, headless Chrome on Metal | Canvas 6.3 to 6.9s in three of four fresh visitors and 10.8s in one (this Mac's connection to Netlify was slow and uneven: single files took 1 to 5s), no interaction, no POST |
| iPhone (WebKit 2215), fresh visitor | Canvas after 7.6s, tour open, price locked |
| `forms.mjs` `LIVE=1`, `links.mjs`, `events.mjs` | 16/16 (validation only); 8/8; pass |
| Lighthouse mobile, 3 runs | 98, 99 and 100 / 100 / 100 / 100; TBT 0ms, CLS 0 to 0.019, LCP 1.5 to 1.8s (the poster); no scene request inside any trace (trace ends 4.1 to 4.9s) |

Evidence: `docs/qa/fix-2026-10-15/live/`.

## 13 October 2026: v2 build


**Date:** 13 October 2026
**Build:** commit `7e6cbb5`, Netlify deploy `6ace3a424f51756fbf427910`
**Live:** https://biohort-garden-room-configurator.netlify.app/configurator/

### How the QA was run

- **One pass, local.** The QA ran on the local build, served with the production headers and CSP by `tools/dev-api.mjs`. Everything it found was fixed in one batch (listed below), and every suite was run again on the final build. The site was then deployed once.
- **After the deploy.** `tools/qa/verify-live.mjs` confirmed that all 31 live files are byte-identical to the build. Every suite was then run again against the live URL.
- **Nothing real submitted.**
  - No live form was submitted and no call was booked: the live forms run checks validation only.
  - The live enquiry endpoint was checked only with requests it refuses, so nothing was stored: an incomplete enquiry gets 400 naming all five missing fields, and a cross-site request gets 403.

### Results

| Suite | What it proves | Local | Live |
|---|---|---|---|
| Unit tests (`npm test`) | **Prices:** every option resolves to a Biohort article number on more than 1,000 designs; 739 of 741 article prices match the 2026 GB price list text, and the other two are not printed in it. **Nothing invented:** unpriced items are Quoted. **Validation:** UK phone numbers follow Ofcom's numbering, plus postcodes, share codes and both functions. | 12/12, 739/741 | n/a |
| Every option changes the 3D (`option-sweep.mjs`) | 293 options across all six ranges, each applied the way the panel applies it. The camera turns to the part and the right part is highlighted. The image changes from that camera (full-resolution pixel diff). | 293/293 | 293/293 |
| No flicker or blotches (`check-zfighting.mjs`) | 146 designs with no overlapping coplanar faces: all 54 sizes, with double doors where offered; every canopy with both walls; every door, window and glass element on the side and back walls; every foundation; every inside fitting in the smallest and largest size; roof extras and downpipes; and the main door on each other wall. | 146/146 clean | 146/146 clean |
| Phones and forced failures (`check-mobile-3d.mjs`) | 42 checks on iPhone (WebKit, Safari's engine) and Android (Chrome). Scenarios below. | 42/42 | 42/42 |
| Layout (`layout.mjs`) | At 320, 360, 375, 390, 768, 1024 and 1440px, for HighLine, Neo and CasaNova: no sideways scroll on any step, form, the compare dialog, the menu or the tour. Every touch target is at least 44px. | 7/7 widths | 7/7 widths |
| Accessibility (`a11y.mjs`) | axe-core over all 8 steps, every form (including one showing errors), the compare and share dialogs, the menu and the tour, on desktop and phone. | 0 violations (67 states) | 0 violations (67 states) |
| Analytics (`events.mjs`) | Every call to action sends `bh_cta_click`, every step sends `bh_step_view`, and option changes, forms, the tour and the 3D send their own `bh_*` events. No contact details are sent. | pass | pass |
| Forms (`forms.mjs`) | **All six forms** (callback, showroom, brochure, book a call, send design, PDF): an empty submit names all five required fields and focuses the first. **Phone numbers:** an unallocated 021 number and an Ofcom drama number are refused. **Locally,** each submission stores the names, E.164 phone, postcode, full specification, priced lines and the design and booking links. | 34/34 | 19/19 (validation only) |
| PDF links (`links.mjs`) | "Reopen your design" restores the exact design and its price. "Book a call" also opens the booking form. | pass | pass |
| Lighthouse, mobile (3 runs) | Performance, accessibility, best practices, SEO | 99, 98, 99 / 100 / 100 / 100. TBT 0ms, CLS 0.049 | 100 / 100 / 100 / 100 in all three runs. FCP 0.8 to 1.1s, LCP 1.4 to 1.5s, TBT 0ms, CLS ≤0.049 |
| Live files (`verify-live.mjs`) | Every deployed file matches the build by MD5; CSP header present | n/a | 31/31 |

#### Phone and failure scenarios (all pass)

- **iPhone:**
  - 3D at the phone tier (half-size textures, pixel ratio up to 1.5).
  - Texture canvases freed after upload. Canvas memory peaks at 0.3MB across 24 designs (every range and colour); the texture cache is bounded at 18.
  - The PDF renders at 1440 x 900.
- **Dropped 3D:** rebuilds at the light tier with one live context and one canvas. Repeated drops step down from low to safe to the SVG drawing, never to a dead end.
- **No WebGL:** the SVG drawing shows outside, inside and plan, at 11ms per frame, under the live CSP.
- **WebGL 1 only:** runs on the three.js r162 build.
- **Canvas budget spent:** the 3D starts with flat colours.
- **Shaders that won't link:** safe tier, then SVG, leaving no context behind.
- **Only the full shaders fail:** real 3D on the safe tier, and the PDF still gets renders.
- **GPU draws nothing:** detected by reading pixels back, then safe, then SVG.
- **Setup fault after the context exists:** one rung down, still WebGL, no leak.
- **Crash guard:**
  - Early reloads don't count as crashes.
  - A crashed medium start resumes at low; a crashed low start resumes at safe.
  - The guard is cleared by the first good frame, and the lower tier becomes that device's ceiling for a day.
- **`?debug3d`:** names the tier, WebGL level, GPU and each boot step.
- **Low memory (1GB):** starts on the light tier, still WebGL.
- **Android:** no WebGL (SVG), dropped 3D (rebuilt with one context), shaders that won't load (safe tier), normal start at the phone tier.

### Found in the QA pass and fixed in one batch

1. **Options that changed nothing visible** (found by the option sweep):
   - CasaNova's soffit spotlights were too small to see from the camera.
   - Corner shelves weren't counted in the shelf bays.
   - Neo's canopy glass had no frame for the highlight to land on.
   - AvantGarde ECO* doors looked like the Classic door; they now have the corrugated leaf and T-handle.
   - A highlight from a previous option stayed lit when the next option had none.
2. **Z-fighting** (found by the z-fighting check, 15 causes):
   - **Doors and frames:**
     - door-frame heads and sills overlapped the jambs;
     - CasaNova's grooves ran under the door glass;
     - the sauna cabin's door glass sat in its frame's plane.
   - **Walls, roofs and gutters:**
     - vents sat in the soffit plane;
     - the base strip was flush with the wall;
     - CasaNova's corner posts and the light-band rails met the walls flush;
     - the gutters on AvantGarde and Panorama did the same.
   - **Bases:**
     - SmartBase rails lay on the frame;
     - ground anchors sat on the base plate and under doors.
   - **Fittings:**
     - Neo's canopy glass bars overlapped;
     - the sauna cabin's roof board met its walls;
     - the insulation edge strips doubled the panelling;
     - Neo's panelling ended 0.5mm from the door frames.
3. **Layout:** a long option tag couldn't wrap and pushed the panel sideways at 320 to 360px.
4. **Accessibility:** the compare table's scroll area couldn't be reached by keyboard.
5. **Found by eye in the PDF render:**
   - **Back and sides too dark:** the back and side elevations stood in shade, so quartz grey read as dark grey. Each elevation is now lit from beside its camera, as the cover is.
   - **Canopy wall faces swapped:** the canopy back wall showed its grey white inner face outside. It now shows the steel colour outside.
   - **Bikes:** a bike hung beside the door filled the inside view, and two bikes' handlebars overlapped into one bar. Bikes now hang in the corners farthest from the door, 44cm apart.
   - **Plan page:** the depth labels overlapped and ran off the page, and opening widths sat on the roof line. The label margins are now fixed in page space, depth labels run along their lines, and opening widths sit inside the walls.
   - **Wording:** extra openings were labelled "2" and "3" in the specification, and the assembly note was cut off after a semicolon.
6. **Catalogue:** door tool holders are capped at what fits (three on a double door or Europa, otherwise one more pair). CasaNova's delivery wording now follows the price list (see `docs/CONFIRMATIONS.md`, P7).

### Evidence in the repo

- `docs/qa/local/`: the final local logs (unit tests, option sweep, z-fighting, phone scenarios, layout, axe, analytics, forms, links) and the Lighthouse runs.
- `docs/qa/live/`: the same suites run against the live URL, plus the Lighthouse runs and the live file check.
- `docs/examples/biohort-reviewed-example-2026-10-13.pdf`: the reviewed example.
  - **Design:** HighLine H5 in quartz grey with a double door, window, extra door, L canopy with back wall, aluminium floor, storage and two bikes. £8,854 at Biohort's published prices; assembly Quoted.
  - **Checks:** all seven pages were rendered to images and checked by eye. All 16 article prices were checked against the GB price list. Its links point at the live site.

### Not done on purpose

- No live enquiry was submitted and no call was booked.
- Leads are stored only in Netlify Blobs (`biohort-enquiries`). Email or CRM routing needs a destination from Biohort: see `docs/CONFIRMATIONS.md`, point C2.
