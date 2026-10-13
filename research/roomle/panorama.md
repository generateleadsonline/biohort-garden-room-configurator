# Panorama - Biohort's Roomle configurator

Configurator: https://www.biohort.com/gb-en/r/konfigurator/865AA3?country_id=gb  
Roomle master component: `biohort:Panorama_Master` (label "Garden Shed PANORMA")  
Default configuration id: `biohort:Panorama_Master:DA817C0B2516DF920AABA7F8167F7CD4B58B086A273CA135102199663D7D849F`  
Captured 13 Oct 2026. Prices are GBP **including 20% VAT**, "price valid in GB", per unit (the basket total is the sum of unit price x quantity).

## What the shopper sees (UI walk-through, desktop 1440 px)

Same shell: canvas left, panel right, steps **Sizes & Colours -> Door -> Foundation -> Accessories**, Biohort button row and live total below.

1. **Sizes & Colours**
   - Size (cm) dropdown, 5 sizes (width x depth): P1 (273 x 158), P2 (273 x 198, default in this configuration; component default is P4), P3 (273 x 238), P4 (273 x 278), P5 (273 x 318).
   - Colour swatches: Metallic dark grey (default), Metallic quartz grey, Metallic silver.
   - **No side canopy** in this range (only HighLine, Europa, Neo and AvantGarde have one).
2. **Door**: view (whole house / open view); door type standard door / double door (default double; the building SKU changes, xxx30 vs xxx39); exterior accessory **additional door** (plus a "double door" add-on tile when none exists).
3. **Foundation**: without / floor frame (default here) / SmartBase / SmartBase PLUS (+ hidden legacy ground screw foundation); floor plate with/without with floor frame.
4. **Accessories**: view dropdown; rain water downpipe without / front side / back side; interior accessory grid (window, shelf baskets, shelf sets 24.5 / 43.5 cm, foldable table, tool hangers set of 4, bikeMax, Bike Lift, bicycle holder, electric mounting panel, hook set, suspension basket, FloraBoard set of 2) and door items (tool holder for door, door baskets, threshold access ramp).

## Prices observed live (GBP inc VAT)

| Configuration | Part list | Total |
|---|---|---|
| Default: P2 (273 x 198) dark grey, double door, floor frame | 14039 Panorama P2 dark grey double door 2,989 + 41041 Aluminium Floor Frame H2, P2, A3, A5 219 | **3,208** |
| Door type -> standard door | 14030 Panorama P2 dark grey standard door 2,699 + 41041 219 | 2,918 |

SKU scheme (master `articleNr` script): 13 silver / 14 dark grey / 18 quartz grey + size digit + door digit (e.g. 13020 / 13029 for P1 silver standard / double).

## Tools and features

Same Roomle toolbar and Biohort buttons as HighLine.

## UX weaknesses

- Default loads a floor frame without saying so.
- All sizes are the same width; the dropdown does not make clear that only the depth changes.
- Same hidden per-option prices and fiddly dock placement as the other ranges.

## Steps (Roomle parameter groups, in order)

1. **Sizes & Colours** (`color_size_group`)
2. **Door** (`door_group`)
3. **Foundation** (`foundation_group`)
4. **Accessories** (`extra_group`)

## Every parameter on the master component

Machine source: `raw/panorama-component.json` (`component.configuration` is a JSON string). `visible`/`enabled`/`condition` are Roomle script expressions evaluated against the other parameters. Parameters with `visible=false` are internal (they drive geometry, counts and SKUs) and are listed only once at the end.

### Sizes & Colours

- **size (cm)** `size` (Integer), default `4`, sort 22
  - values: `1` P1 (273 x 158); `2` P2 (273 x 198); `3` P3 (273 x 238); `4` P4 (273 x 278); `5` P5 (273 x 318)
- **colour** `color` (Material), default `biohort:dunkelgrau_metallic`, sort 23
  - values: `biohort:silber_metallic` metallic silver; `biohort:quarzgrau_metallic` metallic quartz grey; `biohort:dunkelgrau_metallic` metallic dark grey

### Door

- **view** `view2` (String), default `all`, sort 1, visible when `showView2`
  - values: `all` whole house; `geoffnet` show open view
- **door type** `preferredDoorType` (Integer), default `None`, sort 24, visible when `((singleDoors+doubleDoors)>0)`
  - values: `1` standard door; `2` double door
  - onValueChange: `doorChanged=true;`

### Foundation

- **foundation** `fundament` (String), default `none`, sort 25
  - values: `none` without; `bodenrahmen` floor frame; `erdschraubenfundament` ground screw foundation *(only if `fundament=='erdschraubenfundament'`)*; `smartbase` SmartBase; `smartbase_plus` SmartBase PLUS
- **floor plate** `bodenplatte` (String), default `false`, sort 30, visible when `(fundament==bodenrahmen)`
  - values: `true` with; `false` without

### Accessories

- **view** `view` (String), default `all`, sort 1, visible when `showView`
  - values: `front` front wall; `rear` back wall; `left` left wall; `right` right wall; `roofless` without roof; `all` whole house; `geoffnet` show open view
- **rain water downpipe** `regenfallrohr` (String), default `none`, sort 40, enabled when `(view=='all'||view=='roofless'||view=='geoffnet')`
  - values: `none` without; `front` front side; `rear` back side

Internal (hidden) parameters: `showDoorArea`, `barCountExt`, `floraBoardCount`

## Add-on items (Roomle possibleChildren: dragged/docked onto the building)

Machine source: `raw/panorama-children.json` (items + their components). `condition` = when the item is offered.

| Item id | Label | Tab | Offered when | Preset params | Own visible parameters |
|---|---|---|---|---|---|
| `biohort:Window` | window | Accessories | always | {'forEuropa': True} |  |
| `biohort:basket_big` | Shelf baskets | Accessories | always |  |  |
| `biohort:Regalboden_245` | shelf set of 2, 24.5 cm | Accessories | always | {'shelfsize': '245.00'} | depth `shelfsize` [245=24,5 cm, 435=43,5 cm] |
| `biohort:Regalboden_435` | shelf set of 2, 43.5 cm | Accessories | always | {'shelfsize': '435.00'} | depth `shelfsize` [245=24,5 cm, 435=43,5 cm] |
| `biohort:Klapptisch` | foldable table | Accessories | always |  |  |
| `biohort:Gertehalter_4_Set` | tool hangers set of 4 | Accessories | always |  |  |
| `biohort:meta_door` | additional door | Door | `doubleDoors==0&&singleDoors==0` |  | door type `type` [1=standard door, 2=double door]; Gas pressure spring `gasSpring` [with=with, without=without] |
| `biohort:meta_doubledoor` | double door | Door | `doubleDoors==0` | {'type': '2'} | door type `type` [1=standard door, 2=double door]; Gas pressure spring `gasSpring` [with=with, without=without] |
| `biohort:meta_door_additional` | additional door | Door | `doubleDoors>0||singleDoors>0` |  | door type `type` [1=standard door, 2=double door]; Gas pressure spring `gasSpring` [with=with, without=without] |
| `biohort:Fahrradaufhaengung_bikeMax` | "bicycle hanger "bikeMax"" | Accessories | always |  |  |
| `biohort:bike_lift` | Bike Lift | Accessories | always |  |  |
| `biohort:Fahrradstaender_bikeHolder` | bicycle holder | Accessories | always |  |  |
| `biohort:Elektro-Montagepanel` | electric mounting panel | Accessories | always |  |  |
| `biohort:Haken-Set` | hook set | Accessories | always |  |  |
| `biohort:Einhaengesack` | suspension basket | Accessories | always |  |  |
| `biohort:Deko-Element_FloraBoard` | FloraBoard set of 2 | Accessories | always |  | Farbe `color` [biohort:silber_metallic=Silber-metallic, biohort:quarzgrau_metallic=Quarzgrau-metallic, biohort:dunkelgrau_metallic=Dunkelgrau-metallic] |

## Bill of materials logic (subComponents -> SKUs)

Each sub-component is counted by `numberInPartList` and gets its SKU from its own `articleNr` script. SKUs that appear literally in the scripts are priced below; codes built by concatenation are shown as script text. Machine source: `raw/panorama-subcomponents.json`.

Master articleNr script (SKU of the building itself):

```
if(size==1){ if(color=='biohort:silber_metallic'){ if(doubleDoors==0){ articleNr='13020'; }else{ articleNr='13029'; } } if(color=='biohort:quarzgrau_metallic'){ if(doubleDoors==0){ articleNr='18020'; }else{ articleNr='18029'; } } if(color=='biohort:dunkelgrau_metallic'){ if(doubleDoors==0){ articleNr='14020'; }else{ articleNr='14029'; } } } if(size==2){ if(color=='biohort:silber_metallic'){ if(doubleDoors==0){ articleNr='13030'; }else{ articleNr='13039'; } } if(color=='biohort:quarzgrau_metallic'){ if(doubleDoors==0){ articleNr='18030'; }else{ articleNr='18039'; } } if(color=='biohort:dunkelgrau_metallic'){ if(doubleDoors==0){ articleNr='14030'; }else{ articleNr='14039'; } } } if(size==3){ if(color=='biohort:silber_metallic'){ if(doubleDoors==0){ articleNr='13040'; }else{ articleNr='13049'; } } if(color=='biohort:quarzgrau_metallic'){ if(doubleDoors==0){ articleNr='18040'; }else{ articleNr='18049'; } } if(color=='biohort:dunkelgrau_metallic'){ if(doubleDoors==0){ articleNr='14040'; }else{ articleNr='14049'; } } } if(size==4){ if(color=='biohort:silber_metallic'){ if(doubleDoors==0){ articleNr='13050'; }else{ articleNr='13059'; } } if(color=='biohort:quarzgrau_metallic'){ if(doubleDoors==0){ articleNr='18050'; }else{ articleNr='18059'; } } if(color=='biohort:dunkelgrau_metallic'){ if(doubleDoors==0){ articleNr='14050'; }else{ articleNr='14059'; } } } if(size==5){ if(color=='biohort:silber_metallic'){ if(doubleDoors==0){ articleNr='13060'; }else{ articleNr='13069'; } } if(color=='biohort:quarzgrau_metallic'){ if(doubleDoors==0){ articleNr='18060'; }else{ articleNr='18069'; } } if(color=='biohort:dunkelgrau_metallic'){ if(doubleDoors==0){ articleNr='14060'; }else{ articleNr='14069'; } } }
```

| Sub-component | Component | Quantity rule | SKUs named in its articleNr script |
|---|---|---|---|
| Pillar | `biohort:pillar` | `None` |  |
| Panel-G | `biohort:Panel-G` | `None` |  |
| Panel-AM | `biohort:Panel-AM` | `None` |  |
| 1_door | `biohort:Zusatztuer` | `if(doubleDoors>0){number=singleDoors;}else{if(singleDoors>1){number=singleDoors-1;}else{number=0;}}` | 83002 (Additional Door metallic silver GBP 619), 83602 (Additional Door AvantGarde ECO metallic silver GBP 409), 84002 (Additional Door metallic dark grey GBP 619), 84602 (Additional Door AvantGarde ECO metallic dark grey GBP 409), 88002 (Additional Door metallic quartz grey GBP 619), 88602 (Additional Door AvantGarde ECO metallic quartz grey GBP 409) |
| included_standarddoor | `biohort:Standardtuer` | `if(doubleDoors==0){ number=1; }else{ number=0; }` | script: `if(includedInPrice){ articleNr='IGNORE'; }else{ articleNr='Standardtuer'; }` |
| included_doubledoor | `biohort:Doppeltuer` | `if(doubleDoors>0){ number=1; }else{ number=0; }` | script: `if(includedInPrice){ articleNr='IGNORE'; }else{ articleNr='Doppeltüre'; }` |
| regenfallrohr | `biohort:Panorama_Regenfallrohr-Set` | `if(regenfallrohr!='none'){ number=1; }else{ number=0; }` | 44024 (Rainwater Downpipe Set Panorama® Garden Shed metallic silver (2 pieces) GBP 99), 44064 (Rainwater Downpipe Set Panorama® Garden Shed metallic dark grey (2 pieces) GBP 99), 44084 (Rainwater Downpipe Set Panorama® Garden Shed metallic quartz grey (2 pieces) GBP 99) |
| Alu-Bodenrahmen | `biohort:Alu-Bodenrahmen` | `if(fundament==bodenrahmen){ number=1 }` | 41022 (Aluminium Floor Frame H1, HS, P1 GBP 199), 41041 (Aluminium Floor Frame H2, P2, A3, A5 GBP 219), 41042 (Aluminium Floor Frame H3, P3, A6 GBP 229), 41043 (Aluminium Floor Frame H6 GBP 289), 41051 (Aluminium Floor Frame H4, P4, A7 GBP 249), 41062 (Aluminium Floor Frame H5, P5 GBP 279) |
| Alu-Bodenplatten | `biohort:Bodenplatten` | `if(bodenplatte&&(fundament==bodenrahmen)){number=1;}` | 48022 (Aluminium Floor Panel HS, H1, P1 GBP 409), 48041 (Aluminium Floor Panel H2, P2, A3, A5 GBP 509), 48042 (Aluminium Floor Panel H3, P3, A6 GBP 579), 48043 (Aluminium Floor Panel H6 GBP 959), 48051 (Aluminium Floor Panel A7 GBP 679), 48062 (Aluminium Floor Panel H5, P5 GBP 819) |
| SMARTBASE | `biohort:SmartBase` | `(in(fundament,'smartbase','smartbase_plus'))` | 43439 (SmartBasePLUS MiniGarage GBP 1249), 43452 (SmartBasePLUS HS, H1 GBP 1349), 43458 (SmartBase PLUS A3, A5 GBP 1589), 43463 (SmartBasePLUS A6 GBP 1829), 43468 (SmartBase PLUS A7 GBP 2019), 43473 (SmartBase PLUS H5 GBP 2409), 43490 (not in GB price list), 43492 (not in GB price list), 43495 (SmartBasePLUS H6 GBP 2789), 43938 (SmartBase MiniGarage GBP 1049), 43952 (SmartBase P1 GBP 1159), 43958 (SmartBase A3, A5 GBP 1399), 43963 (SmartBase A6 GBP 1589), 43968 (SmartBase A7 GBP 1779), 43973 (SmartBase P5 GBP 2019), 43990 (not in GB price list), 43995 (SmartBase H6 GBP 2309) |
| BAR | `biohort:Regalsteher` | `0` | 46020 (Support Rail for Europa and Equipment Locker (2 pieces) GBP 49), 46021 (Garden Shed Support Rail (2 pieces) GBP 49) |
| BAR_inner | `biohort:Regalsteher` | `if(barCount>2){number=barCount-2;}else{number=0;}` | 46020 (Support Rail for Europa and Equipment Locker (2 pieces) GBP 49), 46021 (Garden Shed Support Rail (2 pieces) GBP 49) |
| BAR_included | `biohort:Regalsteher_included` | `2` | script: `'IGNORE'` |
| Regalboden_articleNr | `biohort:Regalboden_articleNr` | `2` | script: `'IGNORE'` |
| Regalboden | `biohort:Regalboden` | `number=0;if(regalbodenCount>2){number=regalbodenCount-2;}` | 45010 (Shelves 2 pieces per package GBP 69), 45020 (Shelves 4 pieces per package GBP 89), 45030 (Shelves 2 pieces per package, deep GBP 99) |
| Geraetehalter_included | `biohort:Geraetehalter_included` | `4` | script: `'IGNORE'` |
| Geraetehalter | `biohort:Geraetehalter` | `number=0;if(geratehalterCount>4){number=geratehalterCount-4;}` | 47020 (Tool Hanger (4 pieces) GBP 29) |
| Werkzeughalter_included | `biohort:Werkzeughalter_included` | `2` | script: `'IGNORE'` |
| Werkzeughalter | `biohort:Werkzeughalter` | `number=0;if(werkzeughalterCount>2){number=werkzeughalterCount-2;}` | 47031 (Tool Holder metallic silver (2 pieces) GBP 39), 47032 (Neo/Eco Tool Holder, metallic silver GBP 39), 47051 (Tool Holder metallic dark grey (2 pieces) GBP 39), 47052 (Neo/Eco Tool Holder, metallic dark grey GBP 39), 47081 (Tool Holder metallic quartz grey (2 pieces) GBP 39), 47082 (Neo/Eco Tool Holder, metallic quartz grey GBP 39) |
| floraboardInPartlist | `biohort:Deko-Element_FloraBoard_ArticleNr` | `countOfFloraboards` | script: `article` |
| fundamentZusatzpaket | `biohort:Fundament-Zusatzpaket` | `if(in(fundament,'smartbase','smartbase_plus')){ if(singleDoors+doubleDoors>1){ number=singleDoors+doubleDoors-1; } }` | 43405 (SmartBasePLUS Foundation Additional Package GBP 89), 43505 (SmartBase Foundation Additional Package GBP 89) |

## GB price list: every SKU whose title contains "Panorama"

From `raw/gb-configurator-prices.json` (the configurator's own `/api/ext/configurator/data` pricing; identical to the GB catalogue index for all 1,631 SKUs).

| SKU | Title | GBP inc VAT |
|---|---|---|
| 45016 | Bin bag holder for equipment locker, Europa, HighLine, AvantGarde and Panorama | 109 |
| 47023 | PV mounting system for Highline, Avantgarde, Panorama | 89 |
| 14029 | Panorama® Garden Shed P1 metallic dark grey double door | 2,699 |
| 14020 | Panorama® Garden Shed P1 metallic dark grey standard door | 2,409 |
| 18029 | Panorama® Garden Shed P1 metallic quartz grey double door | 2,699 |
| 18020 | Panorama® Garden Shed P1 metallic quartz grey standard door | 2,409 |
| 13029 | Panorama® Garden Shed P1 metallic silver double door | 2,699 |
| 13020 | Panorama® Garden Shed P1 metallic silver standard door | 2,409 |
| 14039 | Panorama® Garden Shed P2 metallic dark grey double door | 2,989 |
| 14030 | Panorama® Garden Shed P2 metallic dark grey standard door | 2,699 |
| 18039 | Panorama® Garden Shed P2 metallic quartz grey double door | 2,989 |
| 18030 | Panorama® Garden Shed P2 metallic quartz grey standard door | 2,699 |
| 13039 | Panorama® Garden Shed P2 metallic silver double door | 2,989 |
| 13030 | Panorama® Garden Shed P2 metallic silver standard door | 2,699 |
| 14049 | Panorama® Garden Shed P3 metallic dark grey double door | 3,279 |
| 14040 | Panorama® Garden Shed P3 metallic dark grey standard door | 2,989 |
| 18049 | Panorama® Garden Shed P3 metallic quartz grey double door | 3,279 |
| 18040 | Panorama® Garden Shed P3 metallic quartz grey standard door | 2,989 |
| 13049 | Panorama® Garden Shed P3 metallic silver double door | 3,279 |
| 13040 | Panorama® Garden Shed P3 metallic silver standard door | 2,989 |
| 14059 | Panorama® Garden Shed P4 metallic dark grey double door | 3,469 |
| 14050 | Panorama® Garden Shed P4 metallic dark grey standard door | 3,179 |
| 18059 | Panorama® Garden Shed P4 metallic quartz grey double door | 3,469 |
| 18050 | Panorama® Garden Shed P4 metallic quartz grey standard door | 3,179 |
| 13059 | Panorama® Garden Shed P4 metallic silver double door | 3,469 |
| 13050 | Panorama® Garden Shed P4 metallic silver standard door | 3,179 |
| 14069 | Panorama® Garden Shed P5 metallic dark grey double door | 3,759 |
| 14060 | Panorama® Garden Shed P5 metallic dark grey standard door | 3,469 |
| 18069 | Panorama® Garden Shed P5 metallic quartz grey double door | 3,759 |
| 18060 | Panorama® Garden Shed P5 metallic quartz grey standard door | 3,469 |
| 13069 | Panorama® Garden Shed P5 metallic silver double door | 3,759 |
| 13060 | Panorama® Garden Shed P5 metallic silver standard door | 3,469 |
| 44064 | Rainwater Downpipe Set Panorama® Garden Shed metallic dark grey (2 pieces) | 99 |
| 44084 | Rainwater Downpipe Set Panorama® Garden Shed metallic quartz grey (2 pieces) | 99 |
| 44024 | Rainwater Downpipe Set Panorama® Garden Shed metallic silver (2 pieces) | 99 |

## Default configuration (as loaded from the find endpoint)

Master parameters: `{"barCountExt": "0", "bodenplatte": "false", "color": "biohort:dunkelgrau_metallic", "floraBoardCount": "0", "fundament": "bodenrahmen", "preferredDoorType": "2", "regenfallrohr": "none", "showDoorArea": "0", "size": "2", "view": "all", "view2": "all"}`

Children placed by default: biohort:meta_door

Part list stored with the default configuration (find endpoint, prices may be older than live):

- 41041 ALU-Bodenrahmen x1 GBP 207.9 Größe: H2, P2, A3, A5
- 14039 Gerätehaus Panorama® P2 dunkelgrau-metallic Doppeltüre x1 GBP 2449 Farbe: Dunkelgrau-metallic; Türoption: Doppeltür; Größe: P2 (273 x 198 cm)
