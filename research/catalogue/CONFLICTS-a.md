# Biohort source conflicts: HighLine, Europa, AvantGarde

Checked 2026-10-13. All web sources were fetched with `?country_id=gb`.

Sources compared:
- **PAGE**: the GB product page. This covers the size selector, the Overview, Colours & Sizes, Standard Equipment, the comparison table, the Technical Data "Data sheet" and the dimension tables.
- **SHOP**: the variant data embedded in the same page. Each SKU has a colour, door and size in `filter_properties`, plus a `url_key`.
- **LD**: the JSON-LD Product offers on the page.
- **CAT**: the GB catalogue index used by the shop: `https://www.biohort.com/api/catalog/siwa_vue_gb_en/product/_search`.
- **PDFs**: the Minifolder brochure and the submission plans (Einreichplan).

**No GB price-list PDF exists for these three ranges.** None is linked from the pages. Only CasaNova has a known `Endkundenpreisliste_cn_GB.pdf`, and guessed filenames returned HTTP 400. So the web prices could not be checked against a price list. LD and SHOP prices agree for every SKU: 39 HighLine, 36 Europa and 96 AvantGarde.

The Minifolder brochure (`https://www.biohort.com/asset/downloads/files/Prospekte/Minifolder_EN.pdf`) has no prices and no dimensions. Its counts match the web:
- HighLine: 7 sizes and 3 colours
- Europa: 9 sizes and 4 colours
- AvantGarde: 8 sizes and 3 colours

## HighLine (https://www.biohort.com/gb-en/p/garden-shed-highline?country_id=gb)

| # | Topic | Value A (source) | Value B (source) | What the JSON uses |
|---|---|---|---|---|
| H1 | **Which colour each EAN/SKU is** | PAGE data sheet column headings, left to right: "Quartz grey-metallic", "Dark grey-metallic", "Silver-metallic". Under them: 83xxx, 88xxx, 84xxx. So the data sheet reads 83 = quartz grey, 88 = dark grey, 84 = silver. | SHOP `filter_properties`/`url_key`: 83xxx = Metallic silver (e.g. `highline-garden-shed-hs-metallic-silver-standard-door`), 84xxx = Metallic dark grey, 88xxx = Metallic quartz grey. Image filenames agree: every 83xxx image is named `..._silber` (e.g. `83010_HighLine_HS_silber_Rendering`) every 84xxx image `..._dunkelgrau` (e.g. `84039_HighLine_H2_dunkelgrau`) and every 88xxx image `..._quarzgrau` (e.g. `88010_HighLine_HS_quarzgrau`). CAT accessory colours fit the same pattern, e.g. side canopy 83036 = Metallic silver. | The SHOP mapping. The data sheet column label is kept per SKU in `dataSheetColourColumn` so you can see the mismatch. **Ask Biohort to confirm before you tie a colour to an SKU.** |
| H2 | H6 overall height | Data sheet: "314.3 x 314.3 x 221**" | Size selector: "H6 (314.3 x 314.3 x 222 cm)". Dimension table: E = 222. | `exteriorCm` is [314.3, 314.3, 221], as the data sheet prints it. |
| H3 | H6 effective space | Data sheet: 8.53 m². Selector: "8,53 m²". | Colours & Sizes text: "H6: 314,3 x 314,3 cm (9,87 m²)*" | 8.53 |
| H4 | H6 width and length | Data sheet: 314.3 x 314.3 | Comparison table: "W: 155-315 cm / L: 155-315 cm". Dimension table: roof K = 315, L = 315. | 314.3 (probably rounding) |
| H5 | Double-door opening width | Colours & Sizes: "Double doors: 155 x 182 cm". Comparison table: "DD: 155 x 182 cm". | Dimension table: "Clearance - Width (optional 2nd door) (156)" | 155 |
| H6 | Side canopy L on size H5 | PAGE bundle names: "Side Canopy L HighLine Garden Shed H5/H6 silver" (83066, plus 84066 and 88066), offered on both the H5 and H6 variants. | CAT size option for 83066/84066/88066 says "H6" only. No H5 option exists for the canopy (S or L) or for the side wall (83068 etc. = "H6"). | `fits` lists H5 because of the bundle. The catalogue label is kept. |
| H7 | Side canopy width compared with roof width | Side canopy description (PAGE bundle): S = 150 cm, L = 282 cm wide. With the shed roof K = 275, that adds up to 425 / 557. | Dimension table: "Width of roof with side canopy" K1 = S 414 / L 548 (H2-H5), S 455 / L 588 (H6) | Both recorded. Not reconciled: the two may measure different things. |
| H8 | Ground anchors on gravel | Data sheet note: "For size HS, H: 8 pcs ... H2, H3: 10 ... H4, H5, H6: 12". "H" is presumably H1 (a typo). | - | Recorded as printed |

Not a conflict, but a different measure: the submission-plan "Floorspace" is not the data sheet "effective space". The plans give HS 3.4, H1 3.4, H2 4.4, H3 5.40, H4 6.45, H5 7.45 and H6 8.64 m². The data sheet gives 3.33 / 3.33 / 4.33 / 5.34 / 6.35 / 7.36 / 8.53. Sources: `https://www.biohort.com/asset/downloads/files/sonstige/HighLine_Einreichplan_H1-H2.pdf` and `https://www.biohort.com/asset/downloads/files/sonstige/HighLine_Einreichplan_H3-H4-H5-H6.pdf`.

## Europa (https://www.biohort.com/gb-en/p/garden-shed-europa?country_id=gb)

The data sheet EAN columns (Silver 29 / Quartz grey 22 / Dark grey 24 / Dark green 23) match SHOP. No colour conflict.

| # | Topic | Value A (source) | Value B (source) | What the JSON uses |
|---|---|---|---|---|
| E1 | Door opening height | Colours & Sizes: "door opening: 135 x 170 cm (W x H)". Comparison table: "DD: 135 x 170 cm". | Dimension table: clearance height G = 171. Submission plan `https://www.biohort.com/asset/downloads/files/sonstige/Einreichplan_Gertehaus_Europa.pdf`: "Durchgangslichte - Höhe G 1710" mm. | 135 x 170 (the published door opening). 171 is recorded in `dimensionTable`. |
| E2 | Side canopy width | Side canopy description (PAGE bundle, e.g. 42012): "The width of the side canopy is 150 cm" | Dimension table: N "Width of roof, side canopy" = 144.5. O "Width of side canopy to support" = 144.5. P "Roof overhang" = 10. Plan: 1445 mm. | Both recorded. 144.5 + overhang may explain the 150. |
| E3 | Side widths H/J | Web dimension table prints run-together cells, e.g. "8.544.580.5". | The submission plan separates them: 85/445/805 mm, 85/805/1525 mm. | The plan values (in cm) |
| E4 | Height range | Comparison table: "H: 196-209cm". Data sheet: 196 / 203 / 209. | Dimension table: E = 196.5 / 203 / 209.5. Plan: 1965 / 2030 / 2095 mm. | Data sheet values in `exteriorCm`. The dimension table is kept as published. |
| E5 | Gas spring for Europa | Minifolder p.5: "The tried-and-tested gas spring is now also available as an accessory for the Europa shed and the equipment locker" | CAT "Gas Spring Retrofit Set" (in the Europa accessory category) has only Equipment Locker options: 40008 "Equipment Locker: 150 / 230 / 150 LARGE / 230 LARGE" and 40009 "190 / 190 LARGE", GBP 53. | Recorded as listed. **Unclear whether a Europa gas spring is sold in GB.** |
| E6 | Accessory size "2B / 4" | CAT floor frame, floor panel, SmartBase and SmartBasePLUS use a "2B / 4" option. | 2B is not a Europa size on the GB page. | Mapped to size 4 only. |

Different measure, not a conflict: the plan "Floorspace" gives 1 1.22, 2 2.31, 2A 1.80, 3 3.40, 4 5.02, 4A 4.62, 5 6.63, 6 6.63 and 7 8.76 m². The data sheet "effective space" gives 1.17 / 2.25 / 1.73 / 3.33 / 4.93 / 4.41 / 6.53 / 6.53 / 8.64.

## AvantGarde and AvantGarde ECO* (https://www.biohort.com/gb-en/p/garden-shed-avantgarde?country_id=gb)

The data sheet EAN columns (Silver 15 / Quartz grey 19 / Dark grey 17) match SHOP. No colour conflict.

| # | Topic | Value A (source) | Value B (source) | What the JSON uses |
|---|---|---|---|---|
| A1 | Double-door opening width | Data sheet headings and Colours & Sizes: "A1 to A4: 139 x 182 cm, A5 to A8: 154,5 x 182 cm" | Comparison table: "DD: A1-A4: 138 x 182, A5-A8: 155 x 182 cm". Dimension table: "Clearance - width (optional double door panel)" = 144 (A1-A4) / 156 (A5-A8). | 139 / 154.5 |
| A2 | Classic AvantGarde A1 with double door, exterior length | Data sheet (AvantGarde with double door): A1 "180 x 222 x 218" | Same data sheet, standard door A1: "180 x 220 x 218". ECO double door A1: "180 x 220 x 218". Selector: "A1 (180 x 220 x 218 cm)". | Recorded as printed: 222 for that row (probably a typo for 220). |
| A3 | A3/A7 overall height | Data sheet and selector: A3 "180 x 300 x 217", A7 "260 x 300 x 217" | Dimension table: E = 218 for A3 and A7 | Data sheet 217 |
| A4 | A2/A6 length | Data sheet and selector: exterior length 260, including roof overhang | Dimension table: roof length L = 255. Einreichplan_GHA_M_L.pdf: L = 255 for A2 and A6. | 260 in `exteriorCm`. 255 is kept in `dimensionTable`. |
| A5 | Right/left side widths | Web dimension table: H = 49 for all sizes. J = 49 (A1-A4) and 129 (A5-A8). | `https://www.biohort.com/asset/downloads/files/sonstige/Einreichplan_GHA_M_L.pdf`: H = "15/49" (A1-A4) and "49/129" (A5-A8). J = "15/49" and "129/49". These are probably alternative door positions. | Web values in `dimensionTable`. The plan values are noted here. |
| A6 | Data sheet language | Standard-door heading on the GB page is in German: "AvantGarde® mit Standardtüre (Türanschlag rechts, Türöffnung: 76 x 182 cm)" | The other headings are in English | - |

Different measure, not a conflict: the plan "Floorspace" gives A1 3.00, A2 3.70, A3 4.40, A4 5.8, A5 4.40, A6 5.40, A7 6.45 and A8 8.5 m². The same values appear in all three AvantGarde plans. The data sheet "effective space" gives 2.96 / 3.65 / 4.33 / 5.71 / 4.33 / 5.34 / 6.35 / 8.37.

## Shared accessory oddities (from CAT and PAGE bundles)

- **Additional Door SKUs are shared.** 83002, 84002 and 88002 (GBP 619) are listed under both the HighLine and AvantGarde accessory categories. Their colour digits follow the HighLine pattern. The AvantGarde listing ("Additional Door Garden Shed AvantGarde Classic/ECO*") adds ECO doors 83602, 84602 and 88602 at GBP 409.
- **The tool holder is bundled inconsistently by colour.** On HighLine pages it appears only in double-door bundles for every colour. On AvantGarde pages, silver 47031 and quartz grey 47081 appear only on double-door variants, but dark grey 47051 appears on both door types.
- **The Neo/Eco tool holder is the ECO version's.** 47032/47052/47082 is in the AvantGarde category and bundled only with ECO* variants. The ECO* door holds "max. 4 tool holders per door"; the classic holds max. 5 per door panel.
