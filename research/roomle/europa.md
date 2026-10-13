# Europa - Biohort's Roomle configurator

Configurator: https://www.biohort.com/gb-en/r/konfigurator/7425D6?country_id=gb  
Roomle master component: `biohort:Europa_Master` (label "Garden Shed EUROPA")  
Default configuration id: `biohort:Europa_Master:A9F88781D062664EBAE0A188745522042361F74DAE0D9AF83B8D3DCE1E2507FF`  
Captured 13 Oct 2026. Prices are GBP **including 20% VAT**, "price valid in GB", per unit (the basket total is the sum of unit price x quantity).

## What the shopper sees (UI walk-through, desktop 1440 px)

Same shell as every Biohort range: 3D canvas left, option panel right, step pills **Sizes & Colours -> Door -> Foundation -> Accessories**, Biohort's own button row below (Back to the product page, Print/PDF/CSV, Share, Search dealers, Add to cart), live total "Incl. 20 % VAT, price valid in GB" and "Show part list".

1. **Sizes & Colours**
   - Size (cm) dropdown, 9 sizes (width x depth): 1 (172x84), 2 (172x156), 3 (244x156, default), 4 (244x228), 5 (316x228), 6 (244x300), 7 (316x300), 2A (244x84), 4A (316x156).
   - Colour swatches: dark green, Metallic dark grey (default), Metallic quartz grey, Metallic silver.
   - Side canopy: without (default) / left / right / both sides. Not offered on sizes 1 and 2A. No S/L canopy size (unlike HighLine).
2. **Door**
   - View: whole house / show open view.
   - Every Europa ships with a double door (it is in the building SKU). The "door type" choice (double door vs double door extra wide) is switched off in the data (`&&false`, ticket BIOH-1006 "remove all extra wide doors"), so no door-type control shows.
   - Exterior accessory tile: **double door** (an additional double door docked on another wall).
3. **Foundation**
   - Foundation: without / floor frame (default in this configuration) / SmartBase / SmartBase PLUS (hidden legacy value: ground screw foundation).
   - Floor plate: with / without, only with floor frame.
4. **Accessories**
   - View dropdown (front/back/left/right wall, without roof, whole house, open view).
   - Rain water downpipe: without / front side / back side (front/back not offered when canopy = both).
   - Side canopy repeated.
   - Interior accessory: tool hangers set of 4, shelf set of 2 24.5 cm, shelf set of 2 43.5 cm, hook set, "+8 Show all" (12 in total: also foldable table, shelf baskets, bicycle hanger bikeMax, bicycle holder, electric mounting panel, suspension basket, Bike Lift, door items).
   - Exterior accessory: threshold access ramp, window.
   - Bicycle storage: Bike Lift.

## Prices observed live (GBP inc VAT)

| Configuration | Part list | Total |
|---|---|---|
| Default: size 3 (244x156) metallic dark grey, floor frame | 24030 Europa Garden Shed 3 metallic dark grey 1,299 + 41030 Aluminium Floor Frame 3 189 | **1,488** |
| Size 5 (316x228) | 24050 1,779 + 41050 Aluminium Floor Frame 5/6 249 | 2,028 |
| + side canopy left | + 42024 Side Canopy Europa Garden Shed 4,5 metallic dark grey 349 | 2,377 |

SKU scheme (master `articleNr` script): colour prefix 29 silver / 22 quartz grey / 24 dark grey / 23 dark green, then size code (e.g. 24030 = dark grey size 3, 24050 = size 5). Side canopies 4202x by colour and size band.

## Tools and features

Same Roomle toolbar as HighLine (undo/redo, AR, multi select, measurements, select view, fullscreen, reset camera, screenshot) and the same Biohort buttons (Print/PDF/CSV, Share, Search dealers, Add to cart, part list).

## UX weaknesses

- Size names are opaque codes ("2A", "4A") with only width x depth; no area, height or door width.
- No price per option; the extra-wide door option was removed silently rather than explained.
- Floor frame is pre-selected in the default, so the "from" price already includes a foundation part the shopper did not choose.
- Same duplicated side-canopy control in step 1 and step 4, same fiddly dock-point placement as HighLine.

## Steps (Roomle parameter groups, in order)

1. **Sizes & Colours** (`color_size_group`)
2. **Door** (`door_group`)
3. **Foundation** (`foundation_group`)
4. **Accessories** (`extra_group`)

## Every parameter on the master component

Machine source: `raw/europa-component.json` (`component.configuration` is a JSON string). `visible`/`enabled`/`condition` are Roomle script expressions evaluated against the other parameters. Parameters with `visible=false` are internal (they drive geometry, counts and SKUs) and are listed only once at the end.

### Sizes & Colours

- **size (cm)** `size` (String), default `5`, sort 20
  - values: `1` 1 (172x84); `2` 2 (172x156); `3` 3 (244x156); `4` 4 (244x228); `5` 5 (316x228); `6` 6 (244x300); `7` 7 (316x300); `2A` 2A (244x84); `4A` 4A (316x156)
- **colour** `color` (Material), default `biohort:dunkelgrau_metallic`, sort 30
  - values: `biohort:silber_metallic` metallic silver; `biohort:quarzgrau_metallic` metallic quartz grey; `biohort:dunkelgrau_metallic` metallic dark grey; `biohort:dunkelgruen` Dunkelgrün
- **side canopy** `canopy` (String), default `none`, sort 150, visible when `((view=='all'||view=='geoffnet'||view=='roofless')&&(!in(size,'1','2A')))`
  - values: `none` without; `left` left *(only if `!in(size,'1','2A')`)*; `right` right *(only if `!in(size,'1','2A')`)*; `both` both sides *(only if `!in(size,'1','2A')`)*
  - onValueChange: `canopy2=canopy;`

### Door

- **view** `view2` (String), default `all`, sort 1, visible when `showView2`
  - values: `all` whole house; `geoffnet` show open view
- **door type** `preferredDoorType` (Integer), default `None`, sort 35, visible when `((singleDoors+doubleDoors)>0) // BIOH-1006 &&false`
  - values: `1` double door; `2` double door extra wide *(only if `(!in(size,1,2))&&!(color=='biohort:dunkelgrau_metallic'||color=='biohort:quarzgrau_metallic') // BIOH-1006 &&false`)*
  - onValueChange: `doorChanged=true;`

### Foundation

- **foundation** `fundament` (String), default `ohne`, sort 40
  - values: `ohne` without; `bodenrahmen` floor frame; `erdschraubenfundament` ground screw foundation *(only if `fundament=='erdschraubenfundament'`)*; `smartbase` SmartBase; `smartbase_plus` SmartBase PLUS
- **floor plate** `bodenplatte` (String), default `ohne`, sort 50, visible when `(fundament==bodenrahmen)`
  - values: `mit` with; `ohne` without

### Accessories

- **view** `view` (String), default `all`, sort 1, visible when `showView`
  - values: `front` front wall; `rear` back wall; `left` left wall; `right` right wall; `roofless` without roof; `all` whole house; `geoffnet` show open view
- **rain water downpipe** `regenfallrohr` (String), default `none`, sort 100, enabled when `(view=='all'||view=='roofless'||view=='geoffnet')`
  - values: `none` without; `front` front side *(only if `canopy!=both`)*; `rear` back side *(only if `canopy!=both`)*
- **side canopy** `canopy2` (String), default `none`, sort 150, visible when `((view=='all'||view=='geoffnet'||view=='roofless')&&(!in(size,'1','2A')))`
  - values: `none` without; `left` left *(only if `!in(size,'1','2A')`)*; `right` right *(only if `!in(size,'1','2A')`)*; `both` both sides *(only if `!in(size,'1','2A')`)*
  - onValueChange: `canopy=canopy2;`

Internal (hidden) parameters: `visible`, `front_panel`, `showDoorArea`

## Add-on items (Roomle possibleChildren: dragged/docked onto the building)

Machine source: `raw/europa-children.json` (items + their components). `condition` = when the item is offered.

| Item id | Label | Tab | Offered when | Preset params | Own visible parameters |
|---|---|---|---|---|---|
| `biohort:basket_big` | Shelf baskets | Accessories | always |  |  |
| `biohort:Regalboden_245` | shelf set of 2, 24.5 cm | Accessories | always | {'shelfsize': '245.00'} | depth `shelfsize` [245=24,5 cm, 435=43,5 cm] |
| `biohort:Regalboden_435` | shelf set of 2, 43.5 cm | Accessories | always | {'shelfsize': '435.00'} | depth `shelfsize` [245=24,5 cm, 435=43,5 cm] |
| `biohort:Klapptisch` | foldable table | Accessories | always |  |  |
| `biohort:Gertehalter_4_Set` | tool hangers set of 4 | Accessories | always |  |  |
| `biohort:Europa_meta_door` | double door | Door | always |  | door type `type` [1=double door, 2=Double door extra wide] |
| `biohort:Europa_meta_doubledoor` | Double door extra wide | Door | `doubleDoors==0&&color!=biohort:dunkelgrau_metallic` | {'type': '2'} | door type `type` [1=double door, 2=Double door extra wide] |
| `biohort:Window` | window | Accessories | always | {'forEuropa': True} |  |
| `biohort:Fahrradaufhaengung_bikeMax` | "bicycle hanger "bikeMax"" | Accessories | always |  |  |
| `biohort:Fahrradstaender_bikeHolder` | bicycle holder | Accessories | always |  |  |
| `biohort:Elektro-Montagepanel` | electric mounting panel | Accessories | always |  |  |
| `biohort:Haken-Set` | hook set | Accessories | always |  |  |
| `biohort:Einhaengesack` | suspension basket | Accessories | always |  |  |
| `biohort:bike_lift` | Bike Lift | Accessories | always |  |  |

## Bill of materials logic (subComponents -> SKUs)

Each sub-component is counted by `numberInPartList` and gets its SKU from its own `articleNr` script. SKUs that appear literally in the scripts are priced below; codes built by concatenation are shown as script text. Machine source: `raw/europa-subcomponents.json`.

Master articleNr script (SKU of the building itself):

```
if(color=='biohort:silber_metallic'){ articleNr='290' } if(color=='biohort:quarzgrau_metallic'){ articleNr='220' } if(color=='biohort:dunkelgrau_metallic'){ articleNr='240' } if(color=='biohort:dunkelgruen'){ articleNr='230' } if(size=='1'){ articleNr=articleNr|'10' } if(size=='2'){ articleNr=articleNr|'20' } if(size=='3'){ articleNr=articleNr|'30' } if(size=='4'){ articleNr=articleNr|'40' } if(size=='5'){ articleNr=articleNr|'50' } if(size=='6'){ articleNr=articleNr|'60' } if(size=='7'){ articleNr=articleNr|'70' } if(size=='2A'){ articleNr=articleNr|'80' } if(size=='4A'){ articleNr=articleNr|'90' }
```

| Sub-component | Component | Quantity rule | SKUs named in its articleNr script |
|---|---|---|---|
| Panel-G | `biohort:Europa_Panel-G` | `None` |  |
| Panel-AM-Left | `biohort:Europa_Panel-AM` | `None` |  |
| Panel-AM-Right | `biohort:Europa_Panel-AM` | `None` |  |
| Corner | `biohort:Europa_Corner` | `None` |  |
| included_door | `biohort:Europa_Standardtuer` | `((singleDoors==0)&&(doubleDoors==1))==false` | script: `'IGNORE'` |
| 1_door | `biohort:Europa_doubledoorArtNr` | `if(singleDoors>0){number=singleDoors-1;/*one is included*/}` | script: `if(color=='biohort:silber_metallic'){ articleNr='290' } if(color=='biohort:quarzgrau_metallic'){ articleNr='220' } if(color=='biohort:dunkelgrau_metallic'){ articleNr='240' } if(color=='biohort:dunkel` |
| 2_door | `biohort:Europa_doubledoorArtNr` | `if(singleDoors>0){number=doubleDoors;}if(singleDoors==0&&doubleDoors>0){number=doubleDoors-1;}` | script: `if(color=='biohort:silber_metallic'){ articleNr='290' } if(color=='biohort:quarzgrau_metallic'){ articleNr='220' } if(color=='biohort:dunkelgrau_metallic'){ articleNr='240' } if(color=='biohort:dunkel` |
| 2a_door | `biohort:Europa_doubledoorExtArtNr` | `if(singleDoors==0&&doubleDoors>0){number=1;}` | script: `if(color=='biohort:silber_metallic'){ articleNr='290' } if(color=='biohort:quarzgrau_metallic'){ articleNr='220' } if(color=='biohort:dunkelgrau_metallic'){ articleNr='240' } if(color=='biohort:dunkel` |
| regenfallrohr | `biohort:Europa_Regenfallrohr-Set` | `if(regenfallrohr!='none'){number=1;}else{number=0;}` | 44040 (Rainwater Downpipe Set Europa Garden Shed dark green (2 pieces) GBP 89), 44050 (Rainwater Downpipe Set Europa Garden Shed metallic dark grey (2 pieces) GBP 89), 44070 (Rainwater Downpipe Set Europa Garden Shed metallic silver (2 pieces) GBP 89), 44080 (Rainwater Downpipe Set Europa Garden Shed metallic quartz grey (2 pieces) GBP 89) |
| Alu-Bodenrahmen | `biohort:Europa_Alu-Bodenrahmen` | `if(fundament=='bodenrahmen'){number=1;}` | 41010 (Aluminium Floor Frame 150 GBP 139), 41011 (Aluminium Floor Frame 90 GBP 99), 41012 (Aluminium Floor Frame 190 GBP 149), 41015 (Aluminium Floor Frame 190 LARGE GBP 169), 41020 (Aluminium Floor Frame 2 GBP 159), 41030 (Aluminium Floor Frame 3 GBP 189), 41040 (Aluminium Floor Frame Neo 2B GBP 219), 41050 (Aluminium Floor Frame 5/6 GBP 249), 41070 (Aluminium Floor Frame 7 GBP 289), 41080 (Aluminium Floor Frame 230 GBP 159), 41090 (Aluminium Floor Frame 4A GBP 209) |
| Alu-Bodenplatten | `biohort:Europa_Alu-Bodenplatten` | `if((fundament=='bodenrahmen')&&(bodenplatte=='mit')){ number=1; }` | 48010 (Woodstock Aluminium Floor Panel 150 GBP 169), 48011 (Aluminium Floor Panel 90 GBP 89), 48012 (Aluminium Floor Panel 190 GBP 189), 48015 (Aluminium Floor Panel 190 LARGE GBP 309), 48020 (Aluminium Floor Panel 2 GBP 289), 48030 (Aluminium Floor Panel 3 GBP 389), 48040 (Neo Aluminium Floor Panel 2B, Europa 4 GBP 529), 48050 (Aluminium Floor Panel 5/6 GBP 719), 48070 (Aluminium Floor Panel 7 GBP 959), 48080 (Aluminium Floor Panel 230 GBP 219), 48090 (Aluminium Floor Panel 4A GBP 489) |
| SMARTBASE | `biohort:Europa_SmartBase` | `(in(fundament,'smartbase','smartbase_plus'))` | 43401 (SmartBasePLUS 150 GBP 799), 43406 (SmartBasePLUS 2 GBP 1109), 43412 (SmartBasePLUS 3 GBP 1349), 43418 (SmartBasePLUS Neo 2B GBP 1829), 43423 (SmartBasePLUS 5/6 GBP 2019), 43426 (SmartBasePLUS 190 GBP 999), 43430 (SmartBasePLUS 7 GBP 2789), 43436 (SmartBasePLUS 230 GBP 1149), 43442 (SmartBasePLUS 4A GBP 1599), 43482 (SmartBasePLUS 90 GBP 609), 43510 (SmartBasePLUS 190 LARGE GBP 1229), 43901 (SmartBase Equipment Locker 150 GBP 609), 43906 (SmartBase Foundation Europa 2 GBP 889), 43910 (SmartBase Foundation 190 LARGE GBP 1009), 43912 (SmartBase Foundation Europa 3 GBP 1109), 43918 (SmartBase Europa 4 GBP 1439), 43923 (SmartBase Foundation Europa 5/6 GBP 1779), 43929 (SmartBase Equipment Locker 190 GBP 699), 43930 (SmartBase Foundation Europa 7 GBP 2359), 43936 (SmartBase Equipment Locker 230 GBP 949), 43942 (SmartBase Foundation Europa 4A GBP 1389), 43982 (SmartBase for Equipment Locker size 90 GBP 459) |
| BAR | `biohort:Regalsteher` | `None` | 46020 (Support Rail for Europa and Equipment Locker (2 pieces) GBP 49), 46021 (Garden Shed Support Rail (2 pieces) GBP 49) |
| BAR_inner | `biohort:Regalsteher` | `if(barCount>2){number=barCount-2;}else{number=0;}` | 46020 (Support Rail for Europa and Equipment Locker (2 pieces) GBP 49), 46021 (Garden Shed Support Rail (2 pieces) GBP 49) |
| BAR_included | `biohort:Regalsteher_included` | `2` | script: `'IGNORE'` |
| Regalboden_articleNr | `biohort:Regalboden_articleNr` | `2` | script: `'IGNORE'` |
| Regalboden | `biohort:Regalboden` | `number=0;if(regalbodenCount>2){number=regalbodenCount-2;}` | 45010 (Shelves 2 pieces per package GBP 69), 45020 (Shelves 4 pieces per package GBP 89), 45030 (Shelves 2 pieces per package, deep GBP 99) |
| Geraetehalter_included | `biohort:Geraetehalter_included` | `4` | script: `'IGNORE'` |
| Geraetehalter | `biohort:Geraetehalter` | `number=0;if(geratehalterCount>4){number=geratehalterCount-4;}` | 47020 (Tool Hanger (4 pieces) GBP 29) |
| seitendachCanopyArtNr | `biohort:Europa_Seitendach` | `(canopy=='left'//canopy=='right')+2*(canopy=='both')` | 42012 (Side Canopy Europa Garden Shed 2,3,4A metallic quartz grey GBP 269), 42014 (Side Canopy Europa Garden Shed 2,3,4A metallic dark grey GBP 269), 42019 (Side Canopy Europa Garden Shed 2,3,4A metallic silver GBP 269), 42022 (Side Canopy Europa Garden Shed 4,5 metallic quartz grey GBP 349), 42024 (Side Canopy Europa Garden Shed 4,5 metallic dark grey GBP 349), 42029 (Side Canopy Europa Garden Shed 4,5 metallic silver GBP 349), 42032 (Side Canopy Europa Garden Shed 6,7 metallic quartz grey GBP 399), 42034 (Side Canopy Europa Garden Shed 6,7 metallic dark grey GBP 399), 42039 (Side Canopy Europa Garden Shed 6,7 metallic silver GBP 399), 42040 (Side Canopy Europa Garden Shed 2,3,4A dark green GBP 269), 42050 (Side Canopy Europa Garden Shed 4,5 dark green GBP 349), 42060 (Side Canopy Europa Garden Shed 6,7 dark green GBP 399) |
| fundamentZusatzpaket | `biohort:Fundament-Zusatzpaket` | `if(in(fundament,'smartbase','smartbase_plus')){ if(singleDoors+doubleDoors>1){ number=singleDoors+doubleDoors-1; } }` | 43405 (SmartBasePLUS Foundation Additional Package GBP 89), 43505 (SmartBase Foundation Additional Package GBP 89) |

## GB price list: every SKU whose title contains "Europa"

From `raw/gb-configurator-prices.json` (the configurator's own `/api/ext/configurator/data` pricing; identical to the GB catalogue index for all 1,631 SKUs).

| SKU | Title | GBP inc VAT |
|---|---|---|
| 49010 | "BikeMax" Bicycle Hanger, Europa Garden Shed (1 piece) | 49 |
| 49020 | "BikeMax" Bicycle Hanger, Europa Garden Shed (2 pieces) | 89 |
| 23001 | Additional Door Europa Garden Shed dark green | 409 |
| 24001 | Additional Door Europa Garden Shed metallic dark grey | 409 |
| 22001 | Additional Door Europa Garden Shed metallic quartz grey | 409 |
| 29001 | Additional Door Europa Garden Shed metallic silver | 409 |
| 45016 | Bin bag holder for equipment locker, Europa, HighLine, AvantGarde and Panorama | 109 |
| 46030 | Electrical Mounting Panel for Europa and Equipment Locker  | 69 |
| 23010 | Europa Garden Shed 1 dark green | 889 |
| 24010 | Europa Garden Shed 1 metallic dark grey | 889 |
| 22010 | Europa Garden Shed 1 metallic quartz grey | 889 |
| 29010 | Europa Garden Shed 1 metallic silver | 889 |
| 23020 | Europa Garden Shed 2 dark green | 1,109 |
| 24020 | Europa Garden Shed 2 metallic dark grey | 1,109 |
| 22020 | Europa Garden Shed 2 metallic quartz grey | 1,109 |
| 29020 | Europa Garden Shed 2 metallic silver | 1,109 |
| 23080 | Europa Garden Shed 2A dark green | 1,059 |
| 24080 | Europa Garden Shed 2A metallic dark grey | 1,059 |
| 22080 | Europa Garden Shed 2A metallic quartz grey | 1,059 |
| 29080 | Europa Garden Shed 2A metallic silver | 1,059 |
| 23030 | Europa Garden Shed 3 dark green | 1,299 |
| 24030 | Europa Garden Shed 3 metallic dark grey | 1,299 |
| 22030 | Europa Garden Shed 3 metallic quartz grey | 1,299 |
| 29030 | Europa Garden Shed 3 metallic silver | 1,299 |
| 23040 | Europa Garden Shed 4 dark green | 1,539 |
| 24040 | Europa Garden Shed 4 metallic dark grey | 1,539 |
| 22040 | Europa Garden Shed 4 metallic quartz grey | 1,539 |
| 29040 | Europa Garden Shed 4 metallic silver | 1,539 |
| 23090 | Europa Garden Shed 4A dark green | 1,449 |
| 24090 | Europa Garden Shed 4A metallic dark grey | 1,449 |
| 22090 | Europa Garden Shed 4A metallic quartz grey | 1,449 |
| 29090 | Europa Garden Shed 4A metallic silver | 1,449 |
| 23050 | Europa Garden Shed 5 dark green | 1,779 |
| 24050 | Europa Garden Shed 5 metallic dark grey | 1,779 |
| 22050 | Europa Garden Shed 5 metallic quartz grey | 1,779 |
| 29050 | Europa Garden Shed 5 metallic silver | 1,779 |
| 23060 | Europa Garden Shed 6 dark green | 1,779 |
| 24060 | Europa Garden Shed 6 metallic dark grey | 1,779 |
| 22060 | Europa Garden Shed 6 metallic quartz grey | 1,779 |
| 29060 | Europa Garden Shed 6 metallic silver | 1,779 |
| 23070 | Europa Garden Shed 7 dark green | 2,059 |
| 24070 | Europa Garden Shed 7 metallic dark grey | 2,059 |
| 22070 | Europa Garden Shed 7 metallic quartz grey | 2,059 |
| 29070 | Europa Garden Shed 7 metallic silver | 2,059 |
| 40008 | Gas spring retrofit set Europa sizes 1,2,3,4,6 and equipment locker 150,230,150L,230L | 53 |
| 40009 | Gas spring retrofit set Europa sizes 4A,5,7 and equipment locker 190,190L | 53 |
| 48040 | Neo Aluminium Floor Panel 2B, Europa 4 | 529 |
| 47022 | PV mounting system for Europa | 89 |
| 44040 | Rainwater Downpipe Set Europa Garden Shed dark green (2 pieces) | 89 |
| 44050 | Rainwater Downpipe Set Europa Garden Shed metallic dark grey (2 pieces) | 89 |
| 44080 | Rainwater Downpipe Set Europa Garden Shed metallic quartz grey (2 pieces) | 89 |
| 44070 | Rainwater Downpipe Set Europa Garden Shed metallic silver (2 pieces) | 89 |
| 42040 | Side Canopy Europa Garden Shed 2,3,4A dark green | 269 |
| 42014 | Side Canopy Europa Garden Shed 2,3,4A metallic dark grey | 269 |
| 42012 | Side Canopy Europa Garden Shed 2,3,4A metallic quartz grey | 269 |
| 42019 | Side Canopy Europa Garden Shed 2,3,4A metallic silver | 269 |
| 42050 | Side Canopy Europa Garden Shed 4,5 dark green | 349 |
| 42024 | Side Canopy Europa Garden Shed 4,5 metallic dark grey | 349 |
| 42022 | Side Canopy Europa Garden Shed 4,5 metallic quartz grey | 349 |
| 42029 | Side Canopy Europa Garden Shed 4,5 metallic silver | 349 |
| 42060 | Side Canopy Europa Garden Shed 6,7 dark green | 399 |
| 42034 | Side Canopy Europa Garden Shed 6,7 metallic dark grey | 399 |
| 42032 | Side Canopy Europa Garden Shed 6,7 metallic quartz grey | 399 |
| 42039 | Side Canopy Europa Garden Shed 6,7 metallic silver | 399 |
| 43918 | SmartBase Europa 4 | 1,439 |
| 43906 | SmartBase Foundation Europa 2 | 889 |
| 43912 | SmartBase Foundation Europa 3 | 1,109 |
| 43942 | SmartBase Foundation Europa 4A | 1,389 |
| 43923 | SmartBase Foundation Europa 5/6 | 1,779 |
| 43930 | SmartBase Foundation Europa 7 | 2,359 |
| 46020 | Support Rail for Europa and Equipment Locker (2 pieces) | 49 |
| 43040 | Window Unit Europa Garden Shed dark green | 309 |
| 43050 | Window Unit Europa Garden Shed metallic dark grey | 309 |
| 43080 | Window Unit Europa Garden Shed metallic quartz grey | 309 |
| 43060 | Window Unit Europa Garden Shed metallic silver | 309 |

## Default configuration (as loaded from the find endpoint)

Master parameters: `{"bodenplatte": "ohne", "canopy": "none", "color": "biohort:dunkelgrau_metallic", "front_panel": "0", "fundament": "bodenrahmen", "preferredDoorType": "1", "regenfallrohr": "none", "showDoorArea": "0", "size": "3", "view": "all", "view2": "all", "visible": "1"}`

Children placed by default: biohort:Europa_meta_door

Part list stored with the default configuration (find endpoint, prices may be older than live):

- 41030 ALU-Bodenrahmen x1 GBP 185.9 Größe: 3
- 24030 Gerätehaus Europa 3 dunkelgrau-metallic x1 GBP 1099 Farbe: Dunkelgrau-metallic; Größe: 3 (244 x 156 cm)
