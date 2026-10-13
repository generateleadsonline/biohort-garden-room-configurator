# Biohort designer v2: points to confirm with Biohort

Checked 13 October 2026 against Biohort's GB product pages (`?country_id=gb`), their Roomle 3D configurator, the GB price index their configurator prices from, the 2026 GB price lists (`Endkundenpreisliste_gb.pdf`, `Endkundenpreisliste_cn_GB.pdf`), the English product catalogue, the CasaNova brochure and the planning drawings. Research files are in `research/`.

Where two Biohort sources disagree, both values are listed here with what the designer does. No price is invented: anything without a published GB price shows as **Quoted**.

## Before any traffic

| # | Point | What the designer does now |
|---|---|---|
| C1 | **UK phone number.** The UK site only publishes the Austrian head office, +43 7282 7788 0. | The header, forms and PDF show +43 7282 7788 0. A UK sales line would replace it in `COMPANY`. |
| C2 | **Where enquiries go.** No email or CRM destination is wired. | Every form stores the enquiry, full specification, priced lines with article numbers and design links in the private Netlify Blobs store `biohort-enquiries`. Nothing is emailed yet. |
| C3 | **"Visit showroom".** Biohort UK has no showroom of its own; buildings are on display at stockists. | The header's "Visit showroom" opens "See a Biohort building near you": a request form plus a link to Biohort's dealer search. |
| C4 | **Brochure.** Biohort publishes an English product catalogue and a CasaNova brochure as PDFs. | "Download brochure" asks for contact details, then opens Biohort's own `Biohort-Product-Catalogue-EN.pdf` (and the CasaNova brochure for CasaNova designs). Confirm the form gate is wanted. |
| C5 | **Booking calendar.** No public booking calendar exists. | "Book a call" is a request for a day and a time slot, stored with the design. A booking link would replace it. |
| C6 | **Analytics.** Every step, option change and call to action is pushed to `window.dataLayer` as `bh_*` events. | No GTM or GA4 container is installed. Add Biohort's container to collect them. |
| C7 | **Privacy wording.** The forms link Biohort's data protection page. | That page doesn't mention this designer. Confirm the wording or provide a notice. |
| C8 | **Photos and trade marks.** The range cards use Biohort's own product photographs; range names are Biohort trade marks. | Used as published on biohort.com. Confirm permission for a Biohort-branded concept. |
| C9 | **Buy online.** Biohort sells direct in the UK. | The price step links "See it in Biohort's shop" to the exact GB product variant (for example `/gb-en/p/garden-shed-highline/84040`). Confirm this, or a dealer route, is wanted. |
| C10 | **Assembly and bases.** No UK assembly price is published. | Assembly, and a customer's own concrete base, show as Quoted. Biohort's SmartBase foundations are priced. |

## Prices and what is offered

| # | Point | Sources | What the designer does |
|---|---|---|---|
| P1 | **HighLine colour per SKU.** | The data sheet prints 83xxx under "Quartz grey-metallic", 88xxx under "Dark grey" and 84xxx under "Silver". The shop data, image file names and accessory SKUs all say 83 = silver, 84 = dark grey, 88 = quartz grey. | Uses the shop's mapping. Please confirm. |
| P2 | **HighLine H5 canopy and canopy side wall.** | GB article titles: "Side Canopy L HighLine Garden Shed H5/H6" (83066 etc.) and "Side Wall for Side Canopy H5" (83068 etc.). The page data tags them H6 only. | H5 and H6 share the same canopy and side wall SKUs (same 3.15m depth). |
| P3 | **Additional double doors.** | Biohort's configurator offers an extra double door on HighLine and AvantGarde A5–A8, but no GB price is published for either. Panorama's (83004/84004/88004, £979) is printed in the GB price list but missing from the configurator's price index. | HighLine and AvantGarde: shown, marked Quoted. Panorama: priced at £979 from the price list. |
| P4 | **BikeLift mounting kit.** | The price list sells "BikeLift Mounting Kit Garden Shed" (49057, £100; Neo 49058). | Every BikeLift adds the kit. Confirm it is needed in every garden shed. |
| P5 | **BikeHolder on HighLine, AvantGarde and Europa.** | Biohort's configurator offers the bicycle holder on these ranges; their product pages don't list it. 49012 ("BikeHolder Bicycle Holder", £79) is the Panorama rack. | Priced as 49012. Neo uses its own 49032. |
| P6 | **Europa gas spring.** | The catalogue index files 40008/40009 under equipment lockers; the GB article titles say "Europa sizes 1,2,3,4,6" (40008) and "4A,5,7" (40009). Size 2A isn't named. | Offered on every size except 2A, at £53. |
| P7 | **CasaNova delivery.** | Web: "Free Shipping within 6 weeks". Price list: transport to the dealer's warehouse; the dealer arranges delivery; 4–6 weeks. Product Variety brochure: free delivery excludes CasaNova. | Shows Biohort's 6-week wording and says the dealer confirms the date and any charge. No delivery price is added. |
| P8 | **CasaNova electric sectional door on 3 x 3.** | Price list: electric opener for "3 x 3 – 3 x 6, 4 x 4 – 4 x 6". Brochure: "not for CasaNova 3 x 3 m". | On 3 x 3 the electric version shows as Quoted; manual is priced. |
| P9 | **Folding table sizes.** | Biohort's configurator offers it on every size; the page bundles only include it on some (HighLine H2–H6, AvantGarde A6–A8). | Offered everywhere except HighLine HS and H1 (1.34m inside) and CasaNova 3 x 2 and 4 x 2, which the CasaNova price list excludes. |
| P10 | **Shelf packs.** | Shelves come in packs of 2 (45010), 4 (45020) and 2 deep (45030). Biohort's configurator sells pairs. | Pairs of standard and deep shelves, as their configurator does. |
| P11 | **Ground anchors.** | Data sheets give anchors per size for gravel ("HS, H: 8" for HighLine; "H" is presumably H1). | Uses those counts, bought as the cheapest mix of 4- and 6-packs. |
| P12 | **Neo silver 3A–3D canopy.** | 81036 (£3,009) is in the price list and price index but missing from the page's accessory data. | Priced from the index. |
| P13 | **Prices are Biohort's RRP.** | The GTC says prices "do not constitute a binding offer". | Labelled as Biohort's published prices; Biohort confirms the order. |

## Dimensions that disagree

| # | Range | Point | What the designer shows |
|---|---|---|---|
| D1 | HighLine | H6 height 221cm on the data sheet, 222 in the size selector and dimension table. H6 usable area 8.53m² on the data sheet, 9.87m² in the Colours & Sizes text. Width 314.3 vs 315. | Data sheet: 314.3 x 314.3 x 221, 8.53m². |
| D2 | HighLine | Double door opening 155cm in the text, 156 in the dimension table. Canopy S 150 / L 282cm wide (description) vs roof with canopy S 414 / L 548 (dimension table). | 155cm; canopy widths from the dimension table (S 1.39m, L 2.73m added). |
| D3 | Europa | Door opening height 170cm in the text, 171 in the dimension table and plan. Canopy 150cm (description) vs 144.5 (dimension table). | 135 x 170cm; canopy drawn 1.445m. |
| D4 | AvantGarde | Double door 139 / 154.5cm (data sheet) vs 138 / 155 (comparison table) vs 144 / 156 (clearance). Classic A1 double-door row says 222cm long (every other source 220). A3/A7 height 217 vs 218. A2/A6 length 260 vs roof length 255. | Data sheet values. |
| D5 | Neo | 3B standard door interior printed 276 x 208 x 220, 4.58m²; the 3B double-door row and the size selector give 220 x 276 x 208, 6.07m². | The 6.07m² row. |
| D6 | Neo | Both 3B rows give the foundation as 229 x 217cm, which cannot fit a 2.92m-long shed. | No base size; points to Biohort's foundation plan. |
| D7 | Neo | 4A and 1D usable area 5.45m² (data sheet) vs 5.44 (size selector). SmartBase 1D/4A printed 344cm wide (every other D size 334). Shelf baskets 46026 are 72cm wide, listed among Neo's 56cm fittings. | Data sheet; SKU as listed. |
| D8 | Panorama | Tool holders per door: five (web) vs four (price list). P5 roof width printed "2730". Shelf 45010 printed 72 x 25.5 (pack of 2) vs 72 x 24.5 (pack of 4). | Two holders come with the building; one more pair on a single door (four in all), three more on a double door. 2.73m roof; 24.5cm shelves. |
| D9 | CasaNova | Weights: web 700–1,440kg vs price list and brochure 510–1,130kg. Base 304 x 204cm (web) vs 300 x 200 (brochure), foundation 304 x 204 (web) vs 293.1 x 193.1 (brochure). Door 95 x 200 (price list element) vs 90 x 198 clear (web, brochure). Sauna heater 6kW (brochure) vs 6.8kW (price list). Short shelves both 93 x 44.7cm (price list) vs 24.5 / 43.5 deep (brochure). Glass element 103 x 50 x 206cm (a 50cm depth is implausible). | Web data sheet for sizes and weights; 90 x 198cm clear door; base from the web. |
| D10 | Neo, Panorama | Every weight differs between the web data sheet and the price list (which says it gives gross weights). | Web weights (not shown in the designer). |

## 3D: what is measured and what is estimated

Measured from Biohort's dimension tables, drawings and their Roomle configurator's construction grid (see `research/photos/FINDINGS.md`): every size, roof overhang, wall and fascia height, door opening, door position, canopy width and HighLine's 800/400mm panels and 80mm grid.

Estimated from photographs and scaled drawings, and worth checking against a real building:

- **Wall pressings.** Rib pitch about 80mm (HighLine, AvantGarde, Panorama); Europa's four ribs then a plain band, repeating every 720mm; Neo's seam every 280mm; CasaNova's joint every metre.
- **Light bands and fascias.** Glazing-band heights (HighLine about 210mm, Panorama's eaves strip, AvantGarde's front band, CasaNova's light band). AvantGarde's fascia (about 140mm), roof pitch (about 6°) and front/back overhang split (390/70mm). CasaNova's fascia (265mm).
- **Fittings.** Corner post diameters, door leaf sizes (only clear openings are published), handle heights.
- **Colours.** Biohort's colours have no exact RAL match. The swatches are sampled from Biohort's own colour chips; screens vary.
- **Canopy walls.** Drawn as the building's own wall panels: the steel colour outside and the grey white inner finish facing the canopy.
- **Layout.** Doors and windows snap to the wall grid; the exact panel is fixed at order. Inside, fittings sit where Biohort's photos show them; bikes hang in the corners farthest from the door; tools, bikes and plants are illustrative.
- **CasaNova details.** The CASA NOVA fascia lettering uses a system sans, not Biohort's cut. Spotlights in the soffit cut-outs are illustrative: the option is the cut-outs only.
