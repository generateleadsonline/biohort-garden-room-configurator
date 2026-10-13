# QA report: Biohort garden building designer v2

**Date:** 13 October 2026
**Build:** commit `COMMIT`, Netlify deploy `DEPLOY`
**Live:** https://biohort-garden-room-configurator.netlify.app/configurator/

## How the QA was run

- **One pass, local.** The QA ran on the local build, served with the production headers and CSP by `tools/dev-api.mjs`. Everything it found was fixed in one batch (listed below), and every suite was run again on the final build. The site was then deployed once.
- **After the deploy.** `tools/qa/verify-live.mjs` checked the live files against the build by MD5. Every suite was then run again against the live URL.
- **Nothing real submitted.**
  - No live form was submitted and no call was booked: the live forms run checks validation only.
  - The live enquiry endpoint was checked only with requests it refuses, so nothing was stored.

## Results

| Suite | What it proves | Local | Live |
|---|---|---|---|
| Unit tests (`npm test`) | **Prices:** every option resolves to a Biohort article number on more than 1,000 designs; 739 of 741 article prices match the 2026 GB price list text, and the other two are not printed in it. **Nothing invented:** unpriced items are Quoted. **Validation:** UK phone numbers follow Ofcom's numbering, plus postcodes, share codes and both functions. | 12/12, 739/741 | n/a |
| Every option changes the 3D (`option-sweep.mjs`) | 293 options across all six ranges, each applied the way the panel applies it. The camera turns to the part and the right part is highlighted. The image changes from that camera (full-resolution pixel diff). | 293/293 | LIVE_SWEEP |
| No flicker or blotches (`check-zfighting.mjs`) | 146 designs with no overlapping coplanar faces: every range at its smallest and largest sizes, every colour, every door, window and glass element on every wall, canopies with walls, roofs, bases, and every inside fitting. | 146/146 clean | LIVE_ZF |
| Phones and forced failures (`check-mobile-3d.mjs`) | 42 checks on iPhone (WebKit, Safari's engine) and Android (Chrome). Scenarios below. | 42/42 | LIVE_MOBILE |
| Layout (`layout.mjs`) | At 320, 360, 375, 390, 768, 1024 and 1440px, for HighLine, Neo and CasaNova: no sideways scroll on any step, form, the compare dialog, the menu or the tour. Every touch target is at least 44px. | 7/7 widths | LIVE_LAYOUT |
| Accessibility (`a11y.mjs`) | axe-core over all 8 steps, every form (including one showing errors), the compare and share dialogs, the menu and the tour, on desktop and phone. | 0 violations | LIVE_A11Y |
| Analytics (`events.mjs`) | Every call to action sends `bh_cta_click`, every step sends `bh_step_view`, and option changes, forms, the tour and the 3D send their own `bh_*` events. No contact details are sent. | pass | LIVE_EVENTS |
| Forms (`forms.mjs`) | **All six forms** (callback, showroom, brochure, book a call, send design, PDF): an empty submit names all five required fields and focuses the first. **Phone numbers:** an unallocated 021 number and an Ofcom drama number are refused. **Locally,** each submission stores the names, E.164 phone, postcode, full specification, priced lines and the design and booking links. | 34/34 | LIVE_FORMS |
| PDF links (`links.mjs`) | "Reopen your design" restores the exact design and its price. "Book a call" also opens the booking form. | pass | LIVE_LINKS |
| Lighthouse, mobile (3 runs) | Performance, accessibility, best practices, SEO | 99, 98, 99 / 100 / 100 / 100. TBT 0ms, CLS 0.049 | LIVE_LH |
| Live files (`verify-live.mjs`) | Every deployed file matches the build by MD5; CSP header present | n/a | LIVE_FILES |

### Phone and failure scenarios (all pass)

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

## Found in the QA pass and fixed in one batch

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

## Evidence in the repo

- `docs/qa/local/`: the final local logs (unit tests, option sweep, z-fighting, phone scenarios, layout, axe, analytics, forms, links) and the Lighthouse runs.
- `docs/qa/live/`: the same suites run against the live URL, plus the Lighthouse runs and the live file check.
- `docs/examples/biohort-reviewed-example-2026-10-13.pdf`: the reviewed example.
  - **Design:** HighLine H5 in quartz grey with a double door, window, extra door, L canopy with back wall, aluminium floor, storage and two bikes. £8,854 at Biohort's published prices; assembly Quoted.
  - **Checks:** all seven pages were rendered to images and checked by eye. All 16 article prices were checked against the GB price list. Its links point at the live site.

## Not done on purpose

- No live enquiry was submitted and no call was booked.
- Leads are stored only in Netlify Blobs (`biohort-enquiries`). Email or CRM routing needs a destination from Biohort: see `docs/CONFIRMATIONS.md`, point C2.
