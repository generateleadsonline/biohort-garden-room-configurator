# AvantGarde - Biohort's Roomle configurator

Configurator: https://www.biohort.com/gb-en/r/konfigurator/B212BT?country_id=gb  
Roomle master component: `biohort:AvantGarde_Master` (label "Garden Shed AvantGarde")  
Default configuration id: `biohort:AvantGarde_Master:7D4121AFCF18B057A76DAB494698910002B876FA657DC5DDE3C6C87AB589F71E`  
Captured 13 Oct 2026. Prices are GBP **including 20% VAT**, "price valid in GB", per unit (the basket total is the sum of unit price x quantity).

## What the shopper sees (UI walk-through, desktop 1440 px)

Same shell: canvas left, panel right, steps **Sizes & Colours -> Door -> Foundation -> Accessories**, Biohort button row and live total below.

1. **Sizes & Colours**
   - **Variant**: AvantGarde (default) / AvantGarde ECO (ECO is a cheaper edition, about GBP 230-240 less per building; SKUs 15/17/19 + 6xx).
   - Size (cm) dropdown, 8 sizes (width x depth): A1 (180 x 220), A2 (180 x 260), A3 (180 x 300), A4 (180 x 380), A5 (260 x 220, default), A6 (260 x 260), A7 (260 x 300), A8 (260 x 380).
   - Colour swatches: Metallic dark grey (default), Metallic quartz grey, Metallic silver.
   - Side canopy: without / left / right (default) / both sides. The canopy is size L in the default (17056 "Side canopy size L ... A1,A5"); there is no S/L control in this range's UI.
   - Back wall for side canopy, side wall for side canopy: without / the canopy side(s).
2. **Door**
   - View: whole house / show open view.
   - Door type: standard door / double door (default double). The building SKU changes (xxx10 standard vs xxx19 double).
   - Exterior accessory: **additional door**; a "double door" add-on tile only appears for the 260 cm wide sizes (A5-A8) when preferred door type is double and no double door exists.
   - Gas pressure spring (with/without) exists for ECO doors in the data but is switched off (`false &&`).
3. **Foundation**: without / floor frame / SmartBase / SmartBase PLUS (+ hidden legacy ground screw foundation); floor plate with/without with floor frame.
4. **Accessories**: view dropdown; rain water downpipe (without / back side only); interior accessory grid (window, shelf baskets, shelf sets 24.5 / 43.5 cm, foldable table, tool hangers set of 4, bikeMax, Bike Lift, bicycle holder, electric mounting panel, hook set, suspension basket, FloraBoard set of 2) plus door items (tool holder for door, door baskets, threshold access ramp) when a door is selected.

## Prices observed live (GBP inc VAT)

| Configuration | Part list | Total |
|---|---|---|
| Default: AvantGarde A5 (260 x 220) dark grey, double door, side canopy right (L) | 17059 AvantGarde A5 dark grey double door 2,259 + 17056 Side canopy L A1,A5 dark grey 1,009 | **3,268** |
| Variant -> AvantGarde ECO | 17659 ECO A5 dark grey double door 2,029 + 17056 1,009 | 3,038 |
| (price list) A1 dark grey standard door / double door | 17010 1,589 / 17019 1,879 | - |
| (price list) ECO A1 dark grey standard door | 17610 1,349 | - |

SKU scheme (master `articleNr` script): colour 15 silver / 17 dark grey / 19 quartz grey, ECO adds "6", then size digit and door digit (0 standard, 9 double).

## Tools and features

Same Roomle toolbar and Biohort buttons as HighLine.

## UX weaknesses

- Variant switch (AvantGarde vs ECO) gives no explanation of what ECO drops, only a lower total.
- Size labels A1-A8 do not follow width order (A1-A4 are 180 wide, A5-A8 260 wide), and the dropdown shows only width x depth.
- Same duplicated canopy controls, hidden per-option prices and fiddly dock placement as the other ranges.

## Steps (Roomle parameter groups, in order)

1. **Sizes & Colours** (`color_size_group`)
2. **Door** (`door_group`)
3. **Foundation** (`foundation_group`)
4. **Accessories** (`extra_group`)

## Every parameter on the master component

Machine source: `raw/avantgarde-component.json` (`component.configuration` is a JSON string). `visible`/`enabled`/`condition` are Roomle script expressions evaluated against the other parameters. Parameters with `visible=false` are internal (they drive geometry, counts and SKUs) and are listed only once at the end.

### Sizes & Colours

- **Variant** `edition` (String), default `AvantGarde`, sort 1
  - values: `AvantGarde` AvantGarde; `eco` AvantGarde ECO
- **size (cm)** `size` (Integer), default `1`, sort 2
  - values: `1` A1 (180 x 220); `5` A2 (180 x 260); `6` A3 (180 x 300); `7` A4 (180 x 380); `2` A5 (260 x 220); `8` A6 (260 x 260); `3` A7 (260 x 300); `4` A8 (260 x 380)
- **colour** `color` (Material), default `biohort:dunkelgrau_metallic`, sort 23
  - values: `biohort:silber_metallic` metallic silver; `biohort:quarzgrau_metallic` metallic quartz grey; `biohort:dunkelgrau_metallic` metallic dark grey
- **side canopy** `canopy` (String), default `none`, sort 35, visible when `in(size, 1, 2, 5, 8, 6, 3, 7, 4)`, enabled when `((view == 'all' || view == 'geoffnet' || view == 'roofless') && in(size, 1, 2, 5, 8, 6, 3, 7, 4))`
  - values: `none` without; `left` left *(only if `in(size, 1, 2, 5, 8, 6, 3, 7, 4)`)*; `right` right *(only if `in(size, 1, 2, 5, 8, 6, 3, 7, 4)`)*; `both` both sides *(only if `in(size, 1, 2, 5, 8, 6, 3, 7, 4)`)*
  - onValueChange: `if (parameter.userTriggeredChange) { if (canopyWasBefore == 'both' && canopy == 'left' && canopy_back_walls == 'both') { canopy_back_walls = 'left'; } if (canopyWasBefore == 'both' && canopy == 'right' && canopy_back_walls == 'both') { canopy_back_walls = 'right'; } if (canopyWasBefore == 'both' && `
- **back wall for side canopy** `canopy_back_walls` (String), default `none`, sort 36, visible when `canopy != 'none'`
  - values: `none` without; `left` left *(only if `in(canopy, 'left', 'both')`)*; `right` right *(only if `in(canopy, 'right', 'both')`)*; `both` both sides *(only if `canopy == 'both'`)*
- **side wall for side canopy** `canopy_side_walls` (String), default `none`, sort 36, visible when `canopy != 'none'`
  - values: `none` without; `left` left *(only if `in(canopy, 'left', 'both')`)*; `right` right *(only if `in(canopy, 'right', 'both')`)*; `both` both sides *(only if `canopy == 'both'`)*

### Door

- **view** `view2` (String), default `all`, sort 1, visible when `showView2`
  - values: `all` whole house; `geoffnet` show open view
- **door type** `preferredDoorType` (Integer), default `None`, sort 24, visible when `((singleDoors + doubleDoors) > 0)`
  - values: `1` standard door; `2` double door
  - onValueChange: `doorChanged = true;`
- **Gas pressure spring** `gasSpring` (String), default `without`, sort 24, visible when `false && (edition == 'eco') && ((singleDoors + doubleDoors) > 0)`
  - values: `with` with; `without` without

### Foundation

- **foundation** `fundament` (String), default `none`, sort 25
  - values: `none` without; `bodenrahmen` floor frame; `erdschraubenfundament` ground screw foundation *(only if `fundament == 'erdschraubenfundament'`)*; `smartbase` SmartBase; `smartbase_plus` SmartBase PLUS
- **floor plate** `bodenplatte` (String), default `false`, sort 30, visible when `(fundament == bodenrahmen)`
  - values: `true` with; `false` without

### Accessories

- **view** `view` (String), default `all`, sort 1, visible when `showView`
  - values: `front` front wall; `rear` back wall; `left` left wall; `right` right wall; `roofless` without roof; `all` whole house; `geoffnet` show open view
- **rain water downpipe** `regenfallrohr` (String), default `none`, sort 40, enabled when `(view == 'all' || view == 'roofless' || view == 'geoffnet')`
  - values: `none` without; `rear` back side

Internal (hidden) parameters: `showDoorArea`, `barCountExt`, `floraBoardCount`

## Add-on items (Roomle possibleChildren: dragged/docked onto the building)

Machine source: `raw/avantgarde-children.json` (items + their components). `condition` = when the item is offered.

| Item id | Label | Tab | Offered when | Preset params | Own visible parameters |
|---|---|---|---|---|---|
| `biohort:Window` | window | Accessories | always | {'forEuropa': True} |  |
| `biohort:basket_big` | Shelf baskets | Accessories | always |  |  |
| `biohort:Regalboden_245` | shelf set of 2, 24.5 cm | Accessories | always | {'shelfsize': '245.00'} | depth `shelfsize` [245=24,5 cm, 435=43,5 cm] |
| `biohort:Regalboden_435` | shelf set of 2, 43.5 cm | Accessories | always | {'shelfsize': '435.00'} | depth `shelfsize` [245=24,5 cm, 435=43,5 cm] |
| `biohort:Klapptisch` | foldable table | Accessories | always |  |  |
| `biohort:Gertehalter_4_Set` | tool hangers set of 4 | Accessories | always |  |  |
| `biohort:meta_door` | additional door | Door | `doubleDoors == 0 && singleDoors == 0` |  | door type `type` [1=standard door, 2=double door]; Gas pressure spring `gasSpring` [with=with, without=without] |
| `biohort:meta_doubledoor` | double door | Door | `preferredDoorType == 2 && doubleDoors == 0 && (in(size, 2, 8, 3, 4))` | {'type': '2'} | door type `type` [1=standard door, 2=double door]; Gas pressure spring `gasSpring` [with=with, without=without] |
| `biohort:meta_door_additional` | additional door | Door | `doubleDoors > 0 || singleDoors > 0` |  | door type `type` [1=standard door, 2=double door]; Gas pressure spring `gasSpring` [with=with, without=without] |
| `biohort:Fahrradaufhaengung_bikeMax` | "bicycle hanger "bikeMax"" | Accessories | always |  |  |
| `biohort:bike_lift` | Bike Lift | Accessories | always |  |  |
| `biohort:Fahrradstaender_bikeHolder` | bicycle holder | Accessories | always |  |  |
| `biohort:Elektro-Montagepanel` | electric mounting panel | Accessories | always |  |  |
| `biohort:Haken-Set` | hook set | Accessories | always |  |  |
| `biohort:Einhaengesack` | suspension basket | Accessories | always |  |  |
| `biohort:Deko-Element_FloraBoard` | FloraBoard set of 2 | Accessories | always |  | Farbe `color` [biohort:silber_metallic=Silber-metallic, biohort:quarzgrau_metallic=Quarzgrau-metallic, biohort:dunkelgrau_metallic=Dunkelgrau-metallic] |

## Bill of materials logic (subComponents -> SKUs)

Each sub-component is counted by `numberInPartList` and gets its SKU from its own `articleNr` script. SKUs that appear literally in the scripts are priced below; codes built by concatenation are shown as script text. Machine source: `raw/avantgarde-subcomponents.json`.

Master articleNr script (SKU of the building itself):

```
articleNr = ''; if (edition == 'eco') { if (color == 'biohort:silber_metallic') { articleNr = articleNr | '15'; } if (color == 'biohort:quarzgrau_metallic') { articleNr = articleNr | '19'; } if (color == 'biohort:dunkelgrau_metallic') { articleNr = articleNr | '17'; } articleNr = articleNr | '6'; if (size == 1) { /* A1 */ articleNr = articleNr | '1'; } else if (size == 5) { /* A2 */ articleNr = articleNr | '2'; } else if (size == 6) { /* A3 */ articleNr = articleNr | '3'; } else if (size == 7) { /* A4 */ articleNr = articleNr | '4'; } else if (size == 2) { /* A5 */ articleNr = articleNr | '5'; } else if (size == 8) { /* A6 */ articleNr = articleNr | '6'; } else if (size == 3) { /* A7 */ articleNr = articleNr | '7'; } else if (size == 4) { /* A8 */ articleNr = articleNr | '8'; } if (doubleDoors == 0) { articleNr = articleNr | '0'; } else { articleNr = articleNr | '9'; } } else { /* A1 */ if (size == 1) { if (color == 'biohort:silber_metallic') { if (doubleDoors == 0) { articleNr = '15010'; } else { articleNr = '15019'; } } if (color == 'biohort:quarzgrau_metallic') { if (doubleDoors == 0) { articleNr = '19010'; } else { articleNr = '19019'; } } if (color == 'biohort:dunkelgrau_metallic') { if (doubleDoors == 0) { articleNr = '17010'; } else { articleNr = '17019'; } } } /* A5 */ if (size == 2) { if (color == 'biohort:silber_metallic') { if (doubleDoors == 0) { articleNr = '15050'; } else { articleNr = '15059'; } } if (color == 'biohort:quarzgrau_metallic') { if (doubleDoors == 0) { articleNr = '19050'; } else { articleNr = '19059'; } } if (color == 'biohort:dunkelgrau_metallic') { if (doubleDoors == 0) { articleNr = '17050'; } else { articleNr = '17059'; } } } /* A7 */ if (size == 3) { if (color == 'biohort:silber_metallic') { if (doubleDoors == 0) { articleNr = '15070'; } else { articleNr = '15079'; } } if (color == 'biohort:quarzgrau_metallic') { if (doubleDoors == 0) { articleNr = '19070'; } else { articleNr = '19079'; } } if (color == 'biohort:dunkelgrau_metallic') { if (doubleDoors == 0) { articleNr = '17070'; } else { articleNr = '17079'; } } } /* A8 */ if (size == 4) { if (color == 'biohort:silber_metallic') { if (doubleDoors == 0) { articleNr = '15080'; } else { articleNr = '15089'; } } if (color == 'biohort:quarzgrau_metallic') { if (doubleDoors == 0) { articleNr = '19080'; } else { articleNr = '19089'; } } if (color == 'biohort:dunkelgrau_metallic') { if (doubleDoors == 0) { articleNr = '17080'; } else { articleNr = '17089'; } } } /* A2 */ if (size == 5) { if (color == 'biohort:silber_metallic') { if (doubleDoors == 0) { articleNr = '15020'; } else { articleNr = '15029'; } } if (color == 'biohort:quarzgrau_metallic') { if (doubleDoors == 0) { articleNr = '19020'; } else { articleNr = '19029'; } } if (color == 'biohort:dunkelgrau_metallic') { if (doubleDoors == 0) { articleNr = '17020'; } else { articleNr = '17029'; } } } /* A3 */ if (size == 6) { if (color == 'biohort:silber_metallic') { if (doubleDoors == 0) { articleNr = '15030'; } else
```

| Sub-component | Component | Quantity rule | SKUs named in its articleNr script |
|---|---|---|---|
| Pillar | `biohort:pillar` | `None` |  |
| Panel-G | `biohort:Panel-G` | `None` |  |
| Panel-AM | `biohort:Panel-AM` | `None` |  |
| 1_door | `biohort:Zusatztuer` | `if (doubleDoors > 0) { number = singleDoors; } else { if (singleDoors > 1) { number = singleDoors - 1; } else { number = 0; }}` | 83002 (Additional Door metallic silver GBP 619), 83602 (Additional Door AvantGarde ECO metallic silver GBP 409), 84002 (Additional Door metallic dark grey GBP 619), 84602 (Additional Door AvantGarde ECO metallic dark grey GBP 409), 88002 (Additional Door metallic quartz grey GBP 619), 88602 (Additional Door AvantGarde ECO metallic quartz grey GBP 409) |
| included_standarddoor | `biohort:Standardtuer` | `if (doubleDoors == 0) { number = 1; } else { number = 0; }` | script: `if(includedInPrice){ articleNr='IGNORE'; }else{ articleNr='Standardtuer'; }` |
| included_doubledoor | `biohort:Doppeltuer` | `if (doubleDoors > 0) { number = 1; } else { number = 0; }` | script: `if(includedInPrice){ articleNr='IGNORE'; }else{ articleNr='Doppeltüre'; }` |
| regenfallrohr | `biohort:Avantgarde_Regenfallrohr-Set` | `if (regenfallrohr != 'none') { number = 1; } else { number = 0; }` | 44022 (Rainwater Downpipe Set AvantGarde® Garden Shed metallic silver (2 pieces) GBP 99), 44062 (Rainwater Downpipe Set AvantGarde® Garden Shed metallic dark grey (2 pieces) GBP 99), 44082 (Rainwater Downpipe Set AvantGarde® Garden Shed metallic quartz grey (2 pieces) GBP 99) |
| Alu-Bodenrahmen | `biohort:Avantgarde_Alu-Bodenrahmen` | `if (fundament == bodenrahmen) { number = 1 }` | 41031 (Aluminium Floor Frame A1 GBP 189), 41041 (Aluminium Floor Frame H2, P2, A3, A5 GBP 219), 41042 (Aluminium Floor Frame H3, P3, A6 GBP 229), 41051 (Aluminium Floor Frame H4, P4, A7 GBP 249), 41052 (not in GB price list), 41061 (Aluminium Floor Frame A8 GBP 289), 41071 (Aluminium Floor Frame for AvantGarde Garden Shed size A2 GBP 199), 41081 (Aluminium Floor Frame for AvantGarde Garden Shed size A4 GBP 239) |
| Alu-Bodenplatten | `biohort:Avantgarde_Bodenplatten` | `if (bodenplatte && (fundament == bodenrahmen)) { number = 1; }` | 48031 (Aluminium Floor Panel A1 GBP 339), 48041 (Aluminium Floor Panel H2, P2, A3, A5 GBP 509), 48042 (Aluminium Floor Panel H3, P3, A6 GBP 579), 48051 (Aluminium Floor Panel A7 GBP 679), 48052 (not in GB price list), 48061 (Aluminium Floor Panel A8 GBP 959), 48071 (Aluminium Floor Panel for AvantGarde Garden Shed size A2 GBP 409), 48081 (Aluminium Floor Panel for AvantGarde Garden Shed size A4 GBP 609) |
| SMARTBASE | `biohort:Avantgarde_SmartBase` | `(in(fundament, 'smartbase', 'smartbase_plus'))` | 43446 (SmartBasePLUS A1 GBP 1249), 43458 (SmartBase PLUS A3, A5 GBP 1589), 43463 (SmartBasePLUS A6 GBP 1829), 43468 (SmartBase PLUS A7 GBP 2019), 43476 (SmartBasePLUS for AvantGarde Garden Shed A4 GBP 1929), 43478 (SmartBasePLUS A8 GBP 2699), 43488 (SmartBasePLUS for AvantGarde Garden Shed A2 GBP 1349), 43511 (not in GB price list), 43911 (not in GB price list), 43946 (SmartBase AvantGarde A1 GBP 1049), 43958 (SmartBase A3, A5 GBP 1399), 43963 (SmartBase A6 GBP 1589), 43968 (SmartBase A7 GBP 1779), 43976 (SmartBase AvantGarde A4 GBP 1679), 43978 (SmartBase AvantGarde A8 GBP 2219), 43988 (SmartBase AvantGarde A2 GBP 1199) |
| BAR | `biohort:Regalsteher` | `0` | 46020 (Support Rail for Europa and Equipment Locker (2 pieces) GBP 49), 46021 (Garden Shed Support Rail (2 pieces) GBP 49) |
| BAR_inner | `biohort:Regalsteher` | `number = 0; if (edition == 'AvantGarde' && barCount > 2) { number = barCount - 2; } else if (edition == 'eco') { number = barCount; }` | 46020 (Support Rail for Europa and Equipment Locker (2 pieces) GBP 49), 46021 (Garden Shed Support Rail (2 pieces) GBP 49) |
| BAR_included | `biohort:Regalsteher_included` | `(edition == 'eco') ? 0 : 2` | script: `'IGNORE'` |
| Regalboden_articleNr | `biohort:Regalboden_articleNr` | `(edition == 'eco') ? 0 : 2` | script: `'IGNORE'` |
| Regalboden | `biohort:Regalboden` | `number = 0; if (edition == 'AvantGarde' && regalbodenCount > 2) { number = regalbodenCount - 2; } else if (edition == 'eco') { number = regalbodenCount; }` | 45010 (Shelves 2 pieces per package GBP 69), 45020 (Shelves 4 pieces per package GBP 89), 45030 (Shelves 2 pieces per package, deep GBP 99) |
| Geraetehalter_included | `biohort:Geraetehalter_included` | `(edition == 'eco') ? 0 : 4` | script: `'IGNORE'` |
| Geraetehalter | `biohort:Geraetehalter` | `number = 0; if (edition == 'AvantGarde' && geratehalterCount > 4) { number = geratehalterCount - 4; } else if (edition == 'eco') { number = geratehalterCount; }` | 47020 (Tool Hanger (4 pieces) GBP 29) |
| Werkzeughalter_included | `biohort:Werkzeughalter_included` | `(edition == 'eco') ? 0 : 2` | script: `'IGNORE'` |
| Werkzeughalter | `biohort:Werkzeughalter` | `number = 0; if (edition == 'AvantGarde' && werkzeughalterCount > 2) { number = werkzeughalterCount - 2; } else if (edition == 'eco') { number = werkzeughalterCo` | 47031 (Tool Holder metallic silver (2 pieces) GBP 39), 47032 (Neo/Eco Tool Holder, metallic silver GBP 39), 47051 (Tool Holder metallic dark grey (2 pieces) GBP 39), 47052 (Neo/Eco Tool Holder, metallic dark grey GBP 39), 47081 (Tool Holder metallic quartz grey (2 pieces) GBP 39), 47082 (Neo/Eco Tool Holder, metallic quartz grey GBP 39) |
| floraboardInPartlist | `biohort:Deko-Element_FloraBoard_ArticleNr` | `countOfFloraboards` | script: `article` |
| fundamentZusatzpaket | `biohort:Fundament-Zusatzpaket` | `if (in(fundament, 'smartbase', 'smartbase_plus')) { if (singleDoors + doubleDoors > 1) { number = singleDoors + doubleDoors - 1; } }` | 43405 (SmartBasePLUS Foundation Additional Package GBP 89), 43505 (SmartBase Foundation Additional Package GBP 89) |
| gasSpring_singledoor | `biohort:avantgarde_eco_gas_spring` | `false && ((edition == 'eco') && gasSpring == 'with' && (preferredDoorType == 1)) * 1` | 83608 (Gas Spring Set 1 piece per package GBP 29), 83609 (Gas Spring Set 2 pieces per package GBP 49) |
| gasSpring_doubledoor | `biohort:avantgarde_eco_gas_spring` | `false && ((edition == 'eco') && gasSpring == 'with' && (preferredDoorType == 2)) * 1` | 83608 (Gas Spring Set 1 piece per package GBP 29), 83609 (Gas Spring Set 2 pieces per package GBP 49) |
| CANOPY_LEFT | `biohort:avantgarde_canopy` | `canopy == 'left' // canopy == 'both'` | script: `articleNr = ''; if (color == 'biohort:silber_metallic') { articleNr = articleNr / '150'; } else if (color == 'biohort:dunkelgrau_metallic') { articleNr = articleNr / '170'; } else if (color == 'biohor` |
| CANOPY_RIGHT | `biohort:avantgarde_canopy` | `canopy == 'right' // canopy == 'both'` | script: `articleNr = ''; if (color == 'biohort:silber_metallic') { articleNr = articleNr / '150'; } else if (color == 'biohort:dunkelgrau_metallic') { articleNr = articleNr / '170'; } else if (color == 'biohor` |
| CANOPY_WALL_BACK_LEFT | `biohort:avantgarde_canopy_wall` | `canopy_back_walls == 'left' // canopy_back_walls == 'both'` | script: `articleNr = ''; if (color == 'biohort:silber_metallic') { articleNr = articleNr / '150'; } else if (color == 'biohort:dunkelgrau_metallic') { articleNr = articleNr / '170'; } else if (color == 'biohor` |
| CANOPY_WALL_BACK_RIGHT | `biohort:avantgarde_canopy_wall` | `canopy_back_walls == 'right' // canopy_back_walls == 'both'` | script: `articleNr = ''; if (color == 'biohort:silber_metallic') { articleNr = articleNr / '150'; } else if (color == 'biohort:dunkelgrau_metallic') { articleNr = articleNr / '170'; } else if (color == 'biohor` |
| CANOPY_WALL_SIDE_LEFT | `biohort:avantgarde_canopy_wall` | `canopy_side_walls == 'left' // canopy_side_walls == 'both'` | script: `articleNr = ''; if (color == 'biohort:silber_metallic') { articleNr = articleNr / '150'; } else if (color == 'biohort:dunkelgrau_metallic') { articleNr = articleNr / '170'; } else if (color == 'biohor` |
| CANOPY_WALL_SIDE_RIGHT | `biohort:avantgarde_canopy_wall` | `canopy_side_walls == 'right' // canopy_side_walls == 'both'` | script: `articleNr = ''; if (color == 'biohort:silber_metallic') { articleNr = articleNr / '150'; } else if (color == 'biohort:dunkelgrau_metallic') { articleNr = articleNr / '170'; } else if (color == 'biohor` |

## GB price list: every SKU whose title contains "AvantGarde"

From `raw/gb-configurator-prices.json` (the configurator's own `/api/ext/configurator/data` pricing; identical to the GB catalogue index for all 1,631 SKUs).

| SKU | Title | GBP inc VAT |
|---|---|---|
| 84602 | Additional Door AvantGarde ECO metallic dark grey | 409 |
| 88602 | Additional Door AvantGarde ECO metallic quartz grey | 409 |
| 83602 | Additional Door AvantGarde ECO metallic silver | 409 |
| 41071 | Aluminium Floor Frame for AvantGarde Garden Shed size A2 | 199 |
| 41081 | Aluminium Floor Frame for AvantGarde Garden Shed size A4 | 239 |
| 48071 | Aluminium Floor Panel for AvantGarde Garden Shed size A2 | 409 |
| 48081 | Aluminium Floor Panel for AvantGarde Garden Shed size A4 | 609 |
| 17080 | AvantGarde Garden Shed A8 metallic dark grey | 2,749 |
| 17680 | AvantGarde Garden Shed ECO A8 metallic dark grey | 2,549 |
| 17019 | AvantGarde® Garden Shed A1 metallic dark grey double door | 1,879 |
| 17010 | AvantGarde® Garden Shed A1 metallic dark grey standard door | 1,589 |
| 19019 | AvantGarde® Garden Shed A1 metallic quartz grey double door | 1,879 |
| 19010 | AvantGarde® Garden Shed A1 metallic quartz grey standard door | 1,589 |
| 15019 | AvantGarde® Garden Shed A1 metallic silver double door | 1,879 |
| 15010 | AvantGarde® Garden Shed A1 metallic silver standard door | 1,589 |
| 17029 | AvantGarde® Garden Shed A2 metallic dark grey double door | 2,069 |
| 17020 | AvantGarde® Garden Shed A2 metallic dark grey standard door | 1,779 |
| 19029 | AvantGarde® Garden Shed A2 metallic quartz grey double door | 2,069 |
| 19020 | AvantGarde® Garden Shed A2 metallic quartz grey standard door | 1,779 |
| 15029 | AvantGarde® Garden Shed A2 metallic silver double door | 2,069 |
| 15020 | AvantGarde® Garden Shed A2 metallic silver standard door | 1,779 |
| 17039 | AvantGarde® Garden Shed A3 metallic dark grey double door | 2,259 |
| 17030 | AvantGarde® Garden Shed A3 metallic dark grey standard door | 1,969 |
| 19039 | AvantGarde® Garden Shed A3 metallic quartz grey double door | 2,259 |
| 19030 | AvantGarde® Garden Shed A3 metallic quartz grey standard door | 1,969 |
| 15039 | AvantGarde® Garden Shed A3 metallic silver double door | 2,259 |
| 15030 | AvantGarde® Garden Shed A3 metallic silver standard door | 1,969 |
| 17049 | AvantGarde® Garden Shed A4 metallic dark grey double door | 2,549 |
| 17040 | AvantGarde® Garden Shed A4 metallic dark grey standard door | 2,259 |
| 19049 | AvantGarde® Garden Shed A4 metallic quartz grey double door | 2,549 |
| 19040 | AvantGarde® Garden Shed A4 metallic quartz grey standard door | 2,259 |
| 15049 | AvantGarde® Garden Shed A4 metallic silver double door | 2,549 |
| 15040 | AvantGarde® Garden Shed A4 metallic silver standard door | 2,259 |
| 17059 | AvantGarde® Garden Shed A5 metallic dark grey double door | 2,259 |
| 17050 | AvantGarde® Garden Shed A5 metallic dark grey standard door | 1,969 |
| 19059 | AvantGarde® Garden Shed A5 metallic quartz grey double door | 2,259 |
| 19050 | AvantGarde® Garden Shed A5 metallic quartz grey standard door | 1,969 |
| 15059 | AvantGarde® Garden Shed A5 metallic silver double door | 2,259 |
| 15050 | AvantGarde® Garden Shed A5 metallic silver standard door | 1,969 |
| 17069 | AvantGarde® Garden Shed A6 metallic dark grey double door | 2,459 |
| 17060 | AvantGarde® Garden Shed A6 metallic dark grey standard door | 2,169 |
| 19069 | AvantGarde® Garden Shed A6 metallic quartz grey double door | 2,459 |
| 19060 | AvantGarde® Garden Shed A6 metallic quartz grey standard door | 2,169 |
| 15069 | AvantGarde® Garden Shed A6 metallic silver double door | 2,459 |
| 15060 | AvantGarde® Garden Shed A6 metallic silver standard door | 2,169 |
| 17079 | AvantGarde® Garden Shed A7 metallic dark grey double door | 2,749 |
| 17070 | AvantGarde® Garden Shed A7 metallic dark grey standard door | 2,459 |
| 19079 | AvantGarde® Garden Shed A7 metallic quartz grey double door | 2,749 |
| 19070 | AvantGarde® Garden Shed A7 metallic quartz grey standard door | 2,459 |
| 15079 | AvantGarde® Garden Shed A7 metallic silver double door | 2,749 |
| 15070 | AvantGarde® Garden Shed A7 metallic silver standard door | 2,459 |
| 17089 | AvantGarde® Garden Shed A8 metallic dark grey double door | 3,039 |
| 19089 | AvantGarde® Garden Shed A8 metallic quartz grey double door | 3,039 |
| 19080 | AvantGarde® Garden Shed A8 metallic quartz grey standard door | 2,749 |
| 15089 | AvantGarde® Garden Shed A8 metallic silver double door | 3,039 |
| 15080 | AvantGarde® Garden Shed A8 metallic silver standard door | 2,749 |
| 17619 | AvantGarde® Garden Shed ECO A1 metallic dark grey double door | 1,639 |
| 17610 | AvantGarde® Garden Shed ECO A1 metallic dark grey standard door | 1,349 |
| 19619 | AvantGarde® Garden Shed ECO A1 metallic quartz grey double door | 1,639 |
| 19610 | AvantGarde® Garden Shed ECO A1 metallic quartz grey standard door | 1,349 |
| 15619 | AvantGarde® Garden Shed ECO A1 metallic silver double door | 1,639 |
| 15610 | AvantGarde® Garden Shed ECO A1 metallic silver standard door | 1,349 |
| 17629 | AvantGarde® Garden Shed ECO A2 metallic dark grey double door | 1,839 |
| 17620 | AvantGarde® Garden Shed ECO A2 metallic dark grey standard door | 1,549 |
| 19629 | AvantGarde® Garden Shed ECO A2 metallic quartz grey double door | 1,839 |
| 19620 | AvantGarde® Garden Shed ECO A2 metallic quartz grey standard door | 1,549 |
| 15629 | AvantGarde® Garden Shed ECO A2 metallic silver double door | 1,839 |
| 15620 | AvantGarde® Garden Shed ECO A2 metallic silver standard door | 1,549 |
| 17639 | AvantGarde® Garden Shed ECO A3 metallic dark grey double door | 2,029 |
| 17630 | AvantGarde® Garden Shed ECO A3 metallic dark grey standard door | 1,739 |
| 19639 | AvantGarde® Garden Shed ECO A3 metallic quartz grey double door | 2,029 |
| 19630 | AvantGarde® Garden Shed ECO A3 metallic quartz grey standard door | 1,739 |
| 15639 | AvantGarde® Garden Shed ECO A3 metallic silver double door | 2,029 |
| 15630 | AvantGarde® Garden Shed ECO A3 metallic silver standard door | 1,739 |
| 17649 | AvantGarde® Garden Shed ECO A4 metallic dark grey double door | 2,319 |
| 17640 | AvantGarde® Garden Shed ECO A4 metallic dark grey standard door | 2,029 |
| 19649 | AvantGarde® Garden Shed ECO A4 metallic quartz grey double door | 2,319 |
| 19640 | AvantGarde® Garden Shed ECO A4 metallic quartz grey standard door | 2,029 |
| 15649 | AvantGarde® Garden Shed ECO A4 metallic silver double door | 2,319 |
| 15640 | AvantGarde® Garden Shed ECO A4 metallic silver standard door | 2,029 |
| 17659 | AvantGarde® Garden Shed ECO A5 metallic dark grey double door | 2,029 |
| 17650 | AvantGarde® Garden Shed ECO A5 metallic dark grey standard door | 1,739 |
| 19659 | AvantGarde® Garden Shed ECO A5 metallic quartz grey double door | 2,029 |
| 19650 | AvantGarde® Garden Shed ECO A5 metallic quartz grey standard door | 1,739 |
| 15659 | AvantGarde® Garden Shed ECO A5 metallic silver double door | 2,029 |
| 15650 | AvantGarde® Garden Shed ECO A5 metallic silver standard door | 1,739 |
| 17669 | AvantGarde® Garden Shed ECO A6 metallic dark grey double door | 2,219 |
| 17660 | AvantGarde® Garden Shed ECO A6 metallic dark grey standard door | 1,949 |
| 19669 | AvantGarde® Garden Shed ECO A6 metallic quartz grey double door | 2,219 |
| 19660 | AvantGarde® Garden Shed ECO A6 metallic quartz grey standard door | 1,949 |
| 15669 | AvantGarde® Garden Shed ECO A6 metallic silver double door | 2,219 |
| 15660 | AvantGarde® Garden Shed ECO A6 metallic silver standard door | 1,949 |
| 17679 | AvantGarde® Garden Shed ECO A7 metallic dark grey double door | 2,509 |
| 17670 | AvantGarde® Garden Shed ECO A7 metallic dark grey standard door | 2,219 |
| 19679 | AvantGarde® Garden Shed ECO A7 metallic quartz grey double door | 2,509 |
| 19670 | AvantGarde® Garden Shed ECO A7 metallic quartz grey standard door | 2,219 |
| 15679 | AvantGarde® Garden Shed ECO A7 metallic silver double door | 2,509 |
| 15670 | AvantGarde® Garden Shed ECO A7 metallic silver standard door | 2,219 |
| 17689 | AvantGarde® Garden Shed ECO A8 metallic dark grey double door | 2,799 |
| 19689 | AvantGarde® Garden Shed ECO A8 metallic quartz grey double door | 2,799 |
| 19680 | AvantGarde® Garden Shed ECO A8 metallic quartz grey standard door | 2,549 |
| 15689 | AvantGarde® Garden Shed ECO A8 metallic silver double door | 2,799 |
| 15680 | AvantGarde® Garden Shed ECO A8 metallic silver standard door | 2,549 |
| 17097 | Back wall size L for side canopy for garden shed AvantGarde metallic dark grey | 669 |
| 19097 | Back wall size L for side canopy for garden shed AvantGarde metallic quartz grey | 669 |
| 15097 | Back wall size L for side canopy for garden shed AvantGarde metallic silver | 669 |
| 45016 | Bin bag holder for equipment locker, Europa, HighLine, AvantGarde and Panorama | 109 |
| 47023 | PV mounting system for Highline, Avantgarde, Panorama | 89 |
| 44062 | Rainwater Downpipe Set AvantGarde® Garden Shed metallic dark grey (2 pieces) | 99 |
| 44082 | Rainwater Downpipe Set AvantGarde® Garden Shed metallic quartz grey (2 pieces) | 99 |
| 44022 | Rainwater Downpipe Set AvantGarde® Garden Shed metallic silver (2 pieces) | 99 |
| 17056 | Side canopy size L for garden shed AvantGarde A1,A5 metallic dark grey | 1,009 |
| 19056 | Side canopy size L for garden shed AvantGarde A1,A5 metallic quartz grey | 1,009 |
| 15056 | Side canopy size L for garden shed AvantGarde A1,A5 metallic silver | 1,009 |
| 17066 | Side canopy size L for garden shed AvantGarde A2,A6 metallic dark grey | 1,109 |
| 19066 | Side canopy size L for garden shed AvantGarde A2,A6 metallic quartz grey | 1,109 |
| 15066 | Side canopy size L for garden shed AvantGarde A2,A6 metallic silver | 1,109 |
| 17076 | Side canopy size L for garden shed AvantGarde A3,A7 metallic dark grey | 1,199 |
| 19076 | Side canopy size L for garden shed AvantGarde A3,A7 metallic quartz grey | 1,199 |
| 15076 | Side canopy size L for garden shed AvantGarde A3,A7 metallic silver | 1,199 |
| 17086 | Side canopy size L for garden shed AvantGarde A4,A8 metallic dark grey | 1,299 |
| 19086 | Side canopy size L for garden shed AvantGarde A4,A8 metallic quartz grey | 1,299 |
| 15086 | Side canopy size L for garden shed AvantGarde A4,A8 metallic silver | 1,299 |
| 17058 | Side wall for side canopy for garden shed AvantGarde A1,A5 metallic dark grey | 429 |
| 19058 | Side wall for side canopy for garden shed AvantGarde A1,A5 metallic quartz grey | 429 |
| 15058 | Side wall for side canopy for garden shed AvantGarde A1,A5 metallic silver | 429 |
| 17068 | Side wall for side canopy for garden shed AvantGarde A2,A6 metallic dark grey | 479 |
| 19068 | Side wall for side canopy for garden shed AvantGarde A2,A6 metallic quartz grey | 479 |
| 15068 | Side wall for side canopy for garden shed AvantGarde A2,A6 metallic silver | 479 |
| 17078 | Side wall for side canopy for garden shed AvantGarde A3,A7 metallic dark grey | 529 |
| 19078 | Side wall for side canopy for garden shed AvantGarde A3,A7 metallic quartz grey | 529 |
| 15078 | Side wall for side canopy for garden shed AvantGarde A3,A7 metallic silver | 529 |
| 17088 | Side wall for side canopy for garden shed AvantGarde A4,A8 metallic dark grey | 579 |
| 19088 | Side wall for side canopy for garden shed AvantGarde A4,A8 metallic quartz grey | 579 |
| 15088 | Side wall for side canopy for garden shed AvantGarde A4,A8 metallic silver | 579 |
| 43946 | SmartBase AvantGarde A1 | 1,049 |
| 43988 | SmartBase AvantGarde A2 | 1,199 |
| 43976 | SmartBase AvantGarde A4 | 1,679 |
| 43978 | SmartBase AvantGarde A8 | 2,219 |
| 43488 | SmartBasePLUS for AvantGarde Garden Shed A2 | 1,349 |
| 43476 | SmartBasePLUS for AvantGarde Garden Shed A4 | 1,929 |

## Default configuration (as loaded from the find endpoint)

Master parameters: `{"barCountExt": "0", "bodenplatte": "false", "canopy": "right", "canopy_back_walls": "none", "canopy_side_walls": "none", "color": "biohort:dunkelgrau_metallic", "edition": "AvantGarde", "floraBoardCount": "0", "fundament": "none", "gasSpring": "without", "preferredDoorType": "2", "regenfallrohr": "none", "showDoorArea": "0", "size": "2", "view": "all", "view2": "all"}`

Children placed by default: biohort:meta_door

Part list stored with the default configuration (find endpoint, prices may be older than live):

- 41041 ALU-Bodenrahmen x1 GBP 207.9 Größe: H2, P2, A3, A5
- 84039 Gerätehaus HighLine® H2 dunkelgrau-metallic Doppeltüre x1 GBP 2499 Farbe: Dunkelgrau-metallic; Türoption: Doppeltür; Größe: H2 (275 x 195 cm)
