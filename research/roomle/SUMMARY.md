# Biohort's Roomle configurator: how it works, endpoints, and options per range

Captured 13 Oct 2026 from the GB English site (`/gb-en/r/konfigurator/<code>?country_id=gb`). Nothing was added to cart or submitted. Cookies: "Deny all cookies" + Save. Per-range detail is in `highline.md`, `europa.md`, `neo.md`, `avantgarde.md`, `panorama.md` and `casanova.md`. Raw JSON is in `raw/`.

## How it works
1. Biohort's Vue page calls `GET /api/ext/configurator/find/<code>?storeCode=gb-en`. This maps the short code (e.g. B212BK) to a Roomle configuration ID such as `biohort:Highline_Master:F868...`.
2. Roomle's configurator runs in an iframe (`https://www.roomle.com/t/cp/`). It is created with `usePriceService:false`, share on, part list, request-product and save-draft off, and primary colour #3a4e87. Roomle provides the 3D view, the option panel, the step tabs and the bill of materials, but never prices anything.
3. When the part list changes, the page POSTs Roomle's `fullList` (`articleNr`, `count`, `parameters`) plus the configuration hash to `/api/ext/configurator/data?storeCode=gb-en`. Biohort's backend returns `products[]` (sku, title, ean, image, unit price, qty), the total `price`, `taxPercent` 20, `isDeliverable` and `hideProductPrice`. The page shows "Incl. 20 % VAT, price valid in GB".
4. Rows with `articleNr: "IGNORE"` are included in the building price (2 shelves, 4 tool hangers, 2 tool holders, 2 support rails, the included door). Extra units beyond those are charged.
5. Each range is a Roomle master component made of:
   - parameters, with script expressions controlling when each is visible, enabled or allowed;
   - add-on items that dock onto the walls (`possibleChildren`);
   - sub-components such as canopies, floor frames, SmartBase and downpipes, each counted by its own rule;
   - an `articleNr` script that builds the building's SKU from the chosen options.

## Endpoints (public, no login, replayable with curl)
- Short code to Roomle configuration: `curl 'https://www.biohort.com/api/ext/configurator/find/B212BK?storeCode=gb-en'`. Without `storeCode` it returns code 500.
- Price any SKU list: `curl -X POST -H 'Content-Type: application/json' 'https://www.biohort.com/api/ext/configurator/data?storeCode=gb-en' -d '{"hash":"<config id>","data":[{"articleNr":"84060","componentId":"x","count":1,"label":"x","parameters":[],"packageSize":1}]}'`. The full GB price list is in `raw/gb-configurator-prices.json` (1,631 SKUs, identical to the catalogue).
- GB catalogue: `GET /api/catalog/siwa_vue_gb_en/product/_search?_source_include=sku,name,price,type_id&size=2000&request={"query":{"query_string":{"query":"*"}}}` (URL-encoded) returns 1,917 products. Saved as `raw/gb-catalogue-products.json`.
- Roomle data (header `apiKey: roomle_portal_v2`):
  - `https://api.roomle.com/v2/components/<id>`: options and rules, in `component.configuration` as a JSON string.
  - `/v2/items/<id>`: add-on presets.
  - `/v2/configurations/<id>`: a saved configuration.
- Also used by the page but not called: `/api/ext/configurator/create`, `/update`, `/pdf`, `/csv`, `/add` (cart) and `/confirm`. `/countries` is a harmless GET.

## Shared UI and tools
- Steps, always in this order: Sizes & Colours, Door, Foundation, Accessories, with Continue and Back buttons.
- Roomle toolbar: undo/redo, AR, multi select, measurements, camera views, fullscreen, reset camera, screenshot.
- Click a part in 3D to edit or delete it. Accessories are added by picking a tile and clicking a ghost dock position.
- Biohort's buttons below the canvas: Back to the product page, Print/PDF/CSV, Share, Search dealers, Add to cart, Show part list.
- Weaknesses shared by all ranges: no price against any individual option; size names are codes; side-canopy controls appear twice (steps 1 and 4); placing accessories on small dock points is fiddly, and a mis-click selects a wall or door; the view jumps on its own; the panel is cramped below about 1,000 px; the cookie banner blocks the configurator until dismissed.

## Things the replacement needs to handle
- Roomle never prices anything. Biohort's own backend prices the SKUs Roomle lists.
- Parts listed as "IGNORE" are included in the building price: 2 shelves, 4 tool hangers, 2 tool holders, 2 support rails and the included door. Only units beyond those are charged.
- On HighLine, AvantGarde and Panorama, the double door is a different building SKU, not an add-on.
- Neo panelling and insulation SKUs depend on both size and door type.
- The CasaNova building SKU depends on which side the door is hinged.
- Several defaults silently include a floor frame or canopy, so the opening price already includes parts the shopper didn't choose.

## Options per range
| | HighLine | Europa | Neo | AvantGarde | Panorama | CasaNova |
|---|---|---|---|---|---|---|
| Code / Roomle master | B212BK / Highline_Master | 7425D6 / Europa_Master | C685BC / neo_master | B212BT / AvantGarde_Master | 865AA3 / Panorama_Master | FF4232 / CasaNova_Master |
| Variant | (hidden "window" edition) | - | - | AvantGarde / ECO | - | - |
| Sizes | 6: HS/H1 275x155 to H6 315x315 | 9: 1 172x84 to 7 316x300, plus 2A and 4A | 16: 1A-4D grid, 180-348 x 180-348 | 8: A1-A4 180 wide, A5-A8 260 wide, 220-380 deep | 5: P1-P5, 273 wide, 158-318 deep | 9: 3x2 to 4x6 m |
| Colours | 3 | 4 (includes dark green) | 3 body (door colour hidden) | 3 | 3 | 2 |
| Side canopy | left/right/both, S or L per side, back and side walls | left/right/both | left/right/both, back and side walls | left/right/both (L), back and side walls | none | none |
| Door type | standard / double (separate building SKU) | double always | standard / double | standard / double | standard / double | hinge right/left, metal or glass |
| Extra doors | additional door, double door | additional double door | additional door, double door | additional door (+ double door on A5-A8) | additional door, double door | 5 door add-ons + gate with electric opener |
| Foundation | none, floor frame + plate, SmartBase, SmartBase PLUS | same | same | same | same | floor frame with/without + plate |
| Range-specific extras | downpipe front/back | downpipe | panelling, insulation | downpipe back only | downpipe | roof stayer, acrylic glass, downpipe, window, glass element, light, sauna |
| Default price | £3,928 | £1,488 | £3,978 | £3,268 | £3,208 | £11,569 |
| GB SKUs with range name in title | 68 | 75 | 199 | 141 | 35 | 52 |

Live price changes checked: HighLine floor frame +£229, floor plate +£579, double door +£250. Europa size 5 = £2,028; adding a left canopy = £2,377. Neo panelling +£919, insulation +£169; switching to a standard door changes the panelling and insulation SKUs too, giving £4,906. AvantGarde ECO version £3,038. Panorama standard door £2,918. CasaNova acrylic glass +£319, roof stayer +£329.
