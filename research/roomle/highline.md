# HighLine - Biohort's Roomle configurator

Configurator: https://www.biohort.com/gb-en/r/konfigurator/B212BK?country_id=gb  
Roomle master component: `biohort:Highline_Master` (label "Garden Shed HIGHLINE")  
Default configuration id: `biohort:Highline_Master:F86801ECA4806817A3EEAD94666E2BA6C6A531B5D2AAE8821DFB78978F6227C5`  
Captured 13 Oct 2026. Prices are GBP **including 20% VAT**, "price valid in GB", per unit (the basket total is the sum of unit price x quantity).

## What the shopper sees (UI walk-through, desktop 1440 px)

Layout: 3D canvas on the left, option panel on the right, four step pills above the canvas (**Sizes & Colours -> Door -> Foundation -> Accessories**), "Continue to ... ->" and "<- Back" buttons at the foot of the panel. Below the canvas (Biohort's own page, not Roomle): range name, buttons **Back to the product page, Print/PDF/CSV, Share, Search dealers, Add to cart**, the live total ("Incl. 20 % VAT, price valid in GB") and a **Show part list** link.

1. **Sizes & Colours**
   - Size (cm) dropdown: HS/H1 (275 x 155), H2 (275 x 195), H3 (275 x 235), H4 (275 x 275), H5 (275 x 315), H6 (315 x 315). Default H3.
   - Colour swatches: Metallic dark grey (default), Metallic quartz grey, Metallic silver.
   - Side canopy: without / left / right / both sides (not offered on HS/H1). Default **left**.
   - Side canopy size left/right: L / S (per side). Default left = **S**.
   - Back wall for side canopy: without / left / right / both (only the sides that have a canopy).
   - Side wall for side canopy: without / left / right / both.
2. **Door**
   - View: whole house / show open view.
   - Door type: standard door (default) / double door (double door is a different building SKU, xxxx9 instead of xxxx0, +GBP 250 on H3).
   - Exterior accessory tiles: **additional door**, **double door** (dragged onto a wall dock; "double door" tile is hidden once a double door exists; HS cannot take a double door).
   - Clicking a door in 3D opens that door's own panel: door type, door accessories (tool holder for door set of 2, door baskets), exterior accessory (threshold access ramp) and a bin icon to delete it.
3. **Foundation**
   - Foundation dropdown: without (default), floor frame, SmartBase, SmartBase PLUS. (A hidden fourth value "ground screw foundation" is only kept if an old saved configuration already had it.)
   - Floor plate: with / without, only when floor frame is chosen.
   - The scene switches to the open-door view on this step.
4. **Accessories** (scene switches to "without roof" so the inside is visible)
   - View dropdown: front wall, back wall, left wall, right wall, without roof, whole house, show open view.
   - The side-canopy controls from step 1 repeated (canopy, size, back wall, side wall).
   - Rain water downpipe: without / front side / back side (back side only if there is no back canopy wall).
   - Interior accessory tiles (4 shown, "+9 Show all" opens a searchable grid/list): tool hangers set of 4, shelf set of 2 24.5 cm, shelf set of 2 43.5 cm, tool holder for door set of 2, hook set, electric mounting panel, bicycle hanger "bikeMax", bicycle holder, foldable table, suspension basket, Bike Lift, Shelf baskets, Door baskets (13).
   - Exterior accessory: threshold access ramp, window, FloraBoard set of 2.
   - Bicycle storage: Bike Lift.
   - Adding an accessory: pick the tile, ghost copies appear at every legal dock position, click one to place it. "Set the position where you want the element to be inserted." hint bubble.

Included in the building price (shown in the part list as IGNORE / "in Preis inkludiert"): 2 shelves, 2 support rails, 4 tool hangers, 2 tool holders. Extra units beyond those are charged (`regalbodenCount>2`, `geratehalterCount>4`, `werkzeughalterCount>2`).

## Prices observed live (GBP inc VAT)

| Configuration | Part list returned by /api/ext/configurator/data | Total |
|---|---|---|
| Default: H3 dark grey, standard door, side canopy left S | 84040 shed 2,699 + 84846 Side Canopy S H3 dark grey 1,229 | **3,928** |
| + floor frame | + 41042 Aluminium Floor Frame H3, P3, A6 229 | 4,157 |
| + floor plate (with) | + 48042 Aluminium Floor Panel H3, P3, A6 579 | 4,736 |
| + double door | 84040 -> 84049 double door shed 2,949 | 4,986 |
| (API test) H5 dark grey standard door alone | 84060 | 3,199 |

SKU scheme for the building (master `articleNr` script): colour prefix 830 silver / 840 dark grey / 880 quartz grey (847/887 = hidden "window" edition, not sold in GB) + size digit (1 HS, 2 H1, 3 H2, 4 H3, 5 H4, 6 H5, 7 H6) + door digit (0 standard, 9 double), e.g. 840+4+0 = 84040. Side canopies: 83xx6/84xx6/88xx6 (L) and 838x6/848x6/888x6 (S) by size.

## Tools and features

- Left toolbar (Roomle): undo, AR (view in your space), enable multi select, show measurements, select view (camera presets), fullscreen, reset camera, screenshot.
- Click any part in 3D to edit or delete it; hint bubbles ("Explore the variety of possibilities by selecting and customizing elements").
- Biohort page: Print/PDF/CSV (POST /api/ext/configurator/pdf and /csv), Share (short code such as B212BK via /create), Search dealers, Add to cart (live online shop in GB), Show part list (SKU, title, unit price, qty).
- Not deliverable / error modals exist (`isDeliverable`, `notDeliverable`, `hasError` in the data response).

## UX weaknesses

- Canvas and panel are squeezed: at 800 x 600 the panel shows two options and the page itself scrolls instead of the panel; at desktop the step panel still needs internal scrolling on Accessories.
- Side-canopy options appear twice (step 1 and step 4) as duplicate parameters (`canopy`/`canopy2` etc.), which is confusing.
- Size labels are codes plus centimetres (H3 275 x 235) with no floor area, height or "what fits" help; no dimension drawing in the panel.
- The total updates but there is no per-option price on any tile or button; you only learn a cost from the total or the part list.
- Placing accessories by clicking tiny ghost dock points is fiddly; a mis-click selects the wall or door instead (it happened in testing).
- HS vs H1 share one size entry ("HS/H1"); how to get HS is not explained.
- Views jump on their own (open door on Foundation, roofless on Accessories), which disorients.
- Cookie banner blocks the whole configurator until dismissed.

## Steps (Roomle parameter groups, in order)

1. **Sizes & Colours** (`color_size_group`)
2. **Door** (`door_group`)
3. **Foundation** (`foundation_group`)
4. **Accessories** (`extra_group`)

## Every parameter on the master component

Machine source: `raw/highline-component.json` (`component.configuration` is a JSON string). `visible`/`enabled`/`condition` are Roomle script expressions evaluated against the other parameters. Parameters with `visible=false` are internal (they drive geometry, counts and SKUs) and are listed only once at the end.

### Sizes & Colours

- **size (cm)** `size` (Integer), default `3`, sort 22
  - values: `1` HS/H1 (275 x 155) *(only if `in(edition,'classic')`)*; `2` H2 (275 x 195) *(only if `in(edition,'classic')`)*; `3` H3 (275 x 235); `4` H4 (275 x 275); `5` H5 (275 x 315); `6` H6 (315 x 315)
  - onValueChange: `if(in(size,1,0)){canopy='none'};`
- **colour** `color` (Material), default `biohort:dunkelgrau_metallic`, sort 23
  - values: `biohort:silber_metallic` metallic silver *(only if `in(edition,'classic')`)*; `biohort:quarzgrau_metallic` metallic quartz grey; `biohort:dunkelgrau_metallic` metallic dark grey
- **side canopy** `canopy` (String), default `none`, sort 35, visible when `(!in(size,1,0))`, enabled when `((view=='all'||view=='geoffnet'||view=='roofless')&&(!in(size,1,0)))`
  - values: `none` without; `left` left; `right` right; `both` both sides
  - onValueChange: `if(parameter.userTriggeredChange){ if(canopyWasBefore=='both'&&canopy=='left'&&canopy_back_walls=='both'){ canopy_back_walls='left'; } if(canopyWasBefore=='both'&&canopy=='right'&&canopy_back_walls=='both'){ canopy_back_walls='right'; } if(canopyWasBefore=='both'&&canopy=='left'&&canopy_side_walls==`
- **Side canopy size left** `canopy_left_size` (String), default `l`, sort 35, visible when `(!in(size,1,0))&&(in(canopy,'left','both'))`, enabled when `((view=='all'||view=='geoffnet'||view=='roofless')&&(in(canopy,'left','both'))&&(!in(size,1,0)))`
  - values: `l` L; `s` S
  - onValueChange: `if(parameter.userTriggeredChange){canopy_left_size2=canopy_left_size;}`
- **Side canopy size right** `canopy_right_size` (String), default `l`, sort 35, visible when `(!in(size,1,0))&&(in(canopy,'right','both'))`, enabled when `((view=='all'||view=='geoffnet'||view=='roofless')&&(in(canopy,'right','both'))&&(!in(size,1,0)))`
  - values: `l` L; `s` S
  - onValueChange: `if(parameter.userTriggeredChange){canopy_right_size2=canopy_right_size;}`
- **back wall for side canopy** `canopy_back_walls` (String), default `none`, sort 36, visible when `canopy!='none'`
  - values: `none` without; `left` left *(only if `in(canopy,'left','both')`)*; `right` right *(only if `in(canopy,'right','both')`)*; `both` both sides *(only if `canopy=='both'`)*
  - onValueChange: `if(parameter.userTriggeredChange){canopy_back_walls2=canopy_back_walls;}`
- **side wall for side canopy** `canopy_side_walls` (String), default `none`, sort 36, visible when `canopy!='none'`
  - values: `none` without; `left` left *(only if `in(canopy,'left','both')`)*; `right` right *(only if `in(canopy,'right','both')`)*; `both` both sides *(only if `canopy=='both'`)*
  - onValueChange: `if(parameter.userTriggeredChange){canopy_side_walls2=canopy_side_walls;}`

### Door

- **view** `view2` (String), default `all`, sort 1, visible when `showView2`
  - values: `all` whole house; `geoffnet` show open view
- **door type** `preferredDoorType` (Integer), default `None`, sort 24, visible when `((singleDoors+doubleDoors)>0)&&!isSizeHs`
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
- **side canopy** `canopy2` (String), default `none`, sort 15, visible when `(!in(size,1,0))`, enabled when `((view=='all'||view=='geoffnet'||view=='roofless')&&(!in(size,1,0)))`
  - values: `none` without; `left` left; `right` right; `both` both sides
  - onValueChange: `if(parameter.userTriggeredChange){ if(canopyWasBefore=='both'&&canopy=='left'&&canopy_back_walls=='both'){ canopy_back_walls='left'; } if(canopyWasBefore=='both'&&canopy=='right'&&canopy_back_walls=='both'){ canopy_back_walls='right'; } if(canopyWasBefore=='both'&&canopy=='left'&&canopy_side_walls==`
- **Side canopy size left** `canopy_left_size2` (String), default `l`, sort 35, visible when `(!in(size,1,0))&&(in(canopy,'left','both'))`, enabled when `((view=='all'||view=='geoffnet'||view=='roofless')&&(in(canopy,'left','both'))&&(!in(size,1,0)))`
  - values: `l` L; `s` S
  - onValueChange: `if(parameter.userTriggeredChange){canopy_left_size=canopy_left_size2;}`
- **Side canopy size right** `canopy_right_size2` (String), default `l`, sort 35, visible when `(!in(size,1,0))&&(in(canopy,'right','both'))`, enabled when `((view=='all'||view=='geoffnet'||view=='roofless')&&(in(canopy,'right','both'))&&(!in(size,1,0)))`
  - values: `l` L; `s` S
  - onValueChange: `if(parameter.userTriggeredChange){canopy_right_size=canopy_right_size2;}`
- **back wall for side canopy** `canopy_back_walls2` (String), default `none`, sort 36, visible when `canopy!='none'`
  - values: `none` without; `left` left *(only if `in(canopy,'left','both')`)*; `right` right *(only if `in(canopy,'right','both')`)*; `both` both sides *(only if `canopy=='both'`)*
  - onValueChange: `if(parameter.userTriggeredChange){canopy_back_walls=canopy_back_walls2;}`
- **side wall for side canopy** `canopy_side_walls2` (String), default `none`, sort 36, visible when `canopy!='none'`
  - values: `none` without; `left` left *(only if `in(canopy,'left','both')`)*; `right` right *(only if `in(canopy,'right','both')`)*; `both` both sides *(only if `canopy=='both'`)*
  - onValueChange: `if(parameter.userTriggeredChange){canopy_side_walls=canopy_side_walls2;}`
- **rain water downpipe** `regenfallrohr` (String), default `none`, sort 40, enabled when `(view=='all'||view=='roofless'||view=='geoffnet')`
  - values: `none` without; `front` front side; `rear` back side *(only if `rearWalls==0`)*

### (no group)

- **None** `fensterCount` (Integer), default `0`, sort None
  - values: (free / computed)

Internal (hidden) parameters: `edition`, `showDoorArea`, `barCountExt`, `floraBoardCount`, `isSizeHs`

## Add-on items (Roomle possibleChildren: dragged/docked onto the building)

Machine source: `raw/highline-children.json` (items + their components). `condition` = when the item is offered.

| Item id | Label | Tab | Offered when | Preset params | Own visible parameters |
|---|---|---|---|---|---|
| `biohort:Window` | window | Accessories | always | {'forEuropa': True} |  |
| `biohort:basket_big` | Shelf baskets | Accessories | always |  |  |
| `biohort:Regalboden_245` | shelf set of 2, 24.5 cm | Accessories | always | {'shelfsize': '245.00'} | depth `shelfsize` [245=24,5 cm, 435=43,5 cm] |
| `biohort:Regalboden_435` | shelf set of 2, 43.5 cm | Accessories | always | {'shelfsize': '435.00'} | depth `shelfsize` [245=24,5 cm, 435=43,5 cm] |
| `biohort:Klapptisch` | foldable table | Accessories | always |  |  |
| `biohort:Gertehalter_4_Set` | tool hangers set of 4 | Accessories | always |  |  |
| `biohort:meta_door` | additional door | Door | `doubleDoors==0&&singleDoors==0` |  | door type `type` [1=standard door, 2=double door]; Gas pressure spring `gasSpring` [with=with, without=without] |
| `biohort:meta_doubledoor` | double door | Door | `doubleDoors==0&&isSizeHs==false` | {'type': '2'} | door type `type` [1=standard door, 2=double door]; Gas pressure spring `gasSpring` [with=with, without=without] |
| `biohort:meta_door_additional` | additional door | Door | `(doubleDoors>0||singleDoors>0)` |  | door type `type` [1=standard door, 2=double door]; Gas pressure spring `gasSpring` [with=with, without=without] |
| `biohort:Fahrradaufhaengung_bikeMax` | "bicycle hanger "bikeMax"" | Accessories | always |  |  |
| `biohort:Fahrradstaender_bikeHolder` | bicycle holder | Accessories | always |  |  |
| `biohort:bike_lift` | Bike Lift | Accessories | always |  |  |
| `biohort:Elektro-Montagepanel` | electric mounting panel | Accessories | always |  |  |
| `biohort:Haken-Set` | hook set | Accessories | always |  |  |
| `biohort:Einhaengesack` | suspension basket | Accessories | always |  |  |
| `biohort:Deko-Element_FloraBoard` | FloraBoard set of 2 | Accessories | always |  | Farbe `color` [biohort:silber_metallic=Silber-metallic, biohort:quarzgrau_metallic=Quarzgrau-metallic, biohort:dunkelgrau_metallic=Dunkelgrau-metallic] |
| `biohort:Highline_Seitenwand` | side wall for side canopy | Accessories | `false&&canopy!='none'` |  |  |
| `biohort:Highline_Ruckwand` | back wall for side canopy | Accessories | `false&&(canopy!='none')&&(regenfallrohr!='rear')` |  |  |

## Bill of materials logic (subComponents -> SKUs)

Each sub-component is counted by `numberInPartList` and gets its SKU from its own `articleNr` script. SKUs that appear literally in the scripts are priced below; codes built by concatenation are shown as script text. Machine source: `raw/highline-subcomponents.json`.

Master articleNr script (SKU of the building itself):

```
if(color=='biohort:silber_metallic'){ articleNr='830'; } if(color=='biohort:dunkelgrau_metallic'&&edition=='classic'){ articleNr='840'; } if(color=='biohort:quarzgrau_metallic'&&edition=='classic'){ articleNr='880'; } if(color=='biohort:dunkelgrau_metallic'&&edition=='window'){ articleNr='847'; } if(color=='biohort:quarzgrau_metallic'&&edition=='window'){ articleNr='887'; } if(size==1){ if(isSizeHs){ articleNr=articleNr|'1'; } if(isSizeH1){ articleNr=articleNr|'2'; } }else{ articleNr=articleNr|substring(size+1,0,1); } if(doubleDoors==0){ articleNr=articleNr|'0'; }else{ articleNr=articleNr|'9'; }
```

| Sub-component | Component | Quantity rule | SKUs named in its articleNr script |
|---|---|---|---|
| Window | `biohort:Window` | `number=0; if(edition=='window'){ number=fensterCount-1; }else{ number=0; }` | 43040 (Window Unit Europa Garden Shed dark green GBP 309), 43050 (Window Unit Europa Garden Shed metallic dark grey GBP 309), 43055 (Window Unit Garden Shed metallic dark grey GBP 339), 43060 (Window Unit Europa Garden Shed metallic silver GBP 309), 43065 (Window Unit Garden Shed metallic silver GBP 339), 43080 (Window Unit Europa Garden Shed metallic quartz grey GBP 309), 43085 (Window Unit Garden Shed metallic quartz grey GBP 339) |
| Pillar | `biohort:pillar` | `None` |  |
| Panel-G | `biohort:Panel-G` | `None` |  |
| Panel-AM | `biohort:Panel-AM` | `None` |  |
| Roof | `biohort:Roof_Highline` | `None` |  |
| 1_door | `biohort:Zusatztuer` | `if(doubleDoors>0){number=singleDoors;}else{if(singleDoors>1){number=singleDoors-1;}else{number=0;}}` | 83002 (Additional Door metallic silver GBP 619), 83602 (Additional Door AvantGarde ECO metallic silver GBP 409), 84002 (Additional Door metallic dark grey GBP 619), 84602 (Additional Door AvantGarde ECO metallic dark grey GBP 409), 88002 (Additional Door metallic quartz grey GBP 619), 88602 (Additional Door AvantGarde ECO metallic quartz grey GBP 409) |
| included_standarddoor | `biohort:Standardtuer` | `if(doubleDoors==0){ number=1; }else{ number=0; }` | script: `if(includedInPrice){ articleNr='IGNORE'; }else{ articleNr='Standardtuer'; }` |
| included_doubledoor | `biohort:Doppeltuer` | `if(doubleDoors>0){ number=1; }else{ number=0; }` | script: `if(includedInPrice){ articleNr='IGNORE'; }else{ articleNr='Doppeltüre'; }` |
| regenfallrohr | `biohort:Regenfallrohr-Set` | `if(regenfallrohr!='none'){ if(canopy=='none'){ number=1; }else{ if(canopy=='both'){ number=1; }else{ number=1; } } }else{ number=0; }` | 44025 (Rainwater Downpipe Set HighLine® Garden Shed metallic silver (2 pieces) GBP 99), 44065 (Rainwater Downpipe Set HighLine® Garden Shed metallic dark grey (2 pieces) GBP 99), 44085 (Rainwater Downpipe Set HighLine Garden Shed metallic quartz grey (2 pieces) GBP 99) |
| Seitendach_left | `biohort:Seitendach` | `if(canopy=='both'//canopy=='left'){ number=1; }else{ number=0; }` | 83036 (Side Canopy L HighLine Garden Shed H2 silver GBP 1439), 83046 (Side Canopy L HighLine Garden Shed H3 silver GBP 1539), 83056 (Side Canopy L HighLine Garden Shed H4 silver GBP 1639), 83066 (Side Canopy L HighLine Garden Shed H5/H6 silver GBP 1749), 83836 (Side Canopy S HighLine Garden Shed H2 silver  GBP 1129), 83846 (Side Canopy S HighLine Garden Shed H3 Silver GBP 1229), 83856 (Side Canopy S HighLine Garden Shed H4 Silver GBP 1339), 83866 (Side Canopy S HighLine Garden Shed H5/H6 Silver GBP 1439), 84036 (Side Canopy L HighLine Garden Shed H2 dark grey GBP 1439), 84046 (Side Canopy L HighLine Garden Shed H3 dark grey GBP 1539), 84056 (Side Canopy L HighLine Garden Shed H4 dark grey GBP 1639), 84066 (Side Canopy L HighLine Garden Shed H5/H6 dark grey GBP 1749), 84836 (Side Canopy S HighLine Garden Shed H2 dark grey GBP 1129), 84846 (Side Canopy S HighLine Garden Shed H3 dark grey GBP 1229), 84856 (Side Canopy S HighLine Garden Shed H4 dark grey GBP 1339), 84866 (Side Canopy S HighLine Garden Shed H5/H6 dark grey GBP 1439), 88036 (Side Canopy L HighLine Garden Shed H2 quartz grey GBP 1439), 88046 (Side Canopy L HighLine Garden Shed H3 quartz grey GBP 1539), 88056 (Side Canopy L HighLine Garden Shed H4 quartz grey GBP 1639), 88066 (Side Canopy L HighLine Garden Shed H5/H6 quartz grey GBP 1749), 88836 (Side Canopy S HighLine Garden Shed H2 quartz grey GBP 1129), 88846 (Side Canopy S HighLine Garden Shed H3 quartz grey GBP 1229), 88856 (Side Canopy S HighLine Garden Shed H4 quartz grey GBP 1339), 88866 (Side Canopy S HighLine Garden Shed H5/H6 quartz grey GBP 1439) |
| Seitendach_right | `biohort:Seitendach` | `if(canopy=='both'//canopy=='right'){ number=1; }else{ number=0; }` | 83036 (Side Canopy L HighLine Garden Shed H2 silver GBP 1439), 83046 (Side Canopy L HighLine Garden Shed H3 silver GBP 1539), 83056 (Side Canopy L HighLine Garden Shed H4 silver GBP 1639), 83066 (Side Canopy L HighLine Garden Shed H5/H6 silver GBP 1749), 83836 (Side Canopy S HighLine Garden Shed H2 silver  GBP 1129), 83846 (Side Canopy S HighLine Garden Shed H3 Silver GBP 1229), 83856 (Side Canopy S HighLine Garden Shed H4 Silver GBP 1339), 83866 (Side Canopy S HighLine Garden Shed H5/H6 Silver GBP 1439), 84036 (Side Canopy L HighLine Garden Shed H2 dark grey GBP 1439), 84046 (Side Canopy L HighLine Garden Shed H3 dark grey GBP 1539), 84056 (Side Canopy L HighLine Garden Shed H4 dark grey GBP 1639), 84066 (Side Canopy L HighLine Garden Shed H5/H6 dark grey GBP 1749), 84836 (Side Canopy S HighLine Garden Shed H2 dark grey GBP 1129), 84846 (Side Canopy S HighLine Garden Shed H3 dark grey GBP 1229), 84856 (Side Canopy S HighLine Garden Shed H4 dark grey GBP 1339), 84866 (Side Canopy S HighLine Garden Shed H5/H6 dark grey GBP 1439), 88036 (Side Canopy L HighLine Garden Shed H2 quartz grey GBP 1439), 88046 (Side Canopy L HighLine Garden Shed H3 quartz grey GBP 1539), 88056 (Side Canopy L HighLine Garden Shed H4 quartz grey GBP 1639), 88066 (Side Canopy L HighLine Garden Shed H5/H6 quartz grey GBP 1749), 88836 (Side Canopy S HighLine Garden Shed H2 quartz grey GBP 1129), 88846 (Side Canopy S HighLine Garden Shed H3 quartz grey GBP 1229), 88856 (Side Canopy S HighLine Garden Shed H4 quartz grey GBP 1339), 88866 (Side Canopy S HighLine Garden Shed H5/H6 quartz grey GBP 1439) |
| Alu-Bodenrahmen | `biohort:Alu-Bodenrahmen` | `if(fundament==bodenrahmen){ number=1; }` | 41022 (Aluminium Floor Frame H1, HS, P1 GBP 199), 41041 (Aluminium Floor Frame H2, P2, A3, A5 GBP 219), 41042 (Aluminium Floor Frame H3, P3, A6 GBP 229), 41043 (Aluminium Floor Frame H6 GBP 289), 41051 (Aluminium Floor Frame H4, P4, A7 GBP 249), 41062 (Aluminium Floor Frame H5, P5 GBP 279) |
| Alu-Bodenplatten | `biohort:Bodenplatten` | `if(bodenplatte&&(fundament==bodenrahmen)){number=1;}` | 48022 (Aluminium Floor Panel HS, H1, P1 GBP 409), 48041 (Aluminium Floor Panel H2, P2, A3, A5 GBP 509), 48042 (Aluminium Floor Panel H3, P3, A6 GBP 579), 48043 (Aluminium Floor Panel H6 GBP 959), 48051 (Aluminium Floor Panel A7 GBP 679), 48062 (Aluminium Floor Panel H5, P5 GBP 819) |
| SMARTBASE | `biohort:SmartBase` | `(in(fundament,'smartbase','smartbase_plus'))` | 43439 (SmartBasePLUS MiniGarage GBP 1249), 43452 (SmartBasePLUS HS, H1 GBP 1349), 43458 (SmartBase PLUS A3, A5 GBP 1589), 43463 (SmartBasePLUS A6 GBP 1829), 43468 (SmartBase PLUS A7 GBP 2019), 43473 (SmartBase PLUS H5 GBP 2409), 43490 (not in GB price list), 43492 (not in GB price list), 43495 (SmartBasePLUS H6 GBP 2789), 43938 (SmartBase MiniGarage GBP 1049), 43952 (SmartBase P1 GBP 1159), 43958 (SmartBase A3, A5 GBP 1399), 43963 (SmartBase A6 GBP 1589), 43968 (SmartBase A7 GBP 1779), 43973 (SmartBase P5 GBP 2019), 43990 (not in GB price list), 43995 (SmartBase H6 GBP 2309) |
| BAR | `biohort:Regalsteher` | `0` | 46020 (Support Rail for Europa and Equipment Locker (2 pieces) GBP 49), 46021 (Garden Shed Support Rail (2 pieces) GBP 49) |
| BAR_inner | `biohort:Regalsteher` | `if(barCount>2){number=barCount-2;}else{number=0;}` | 46020 (Support Rail for Europa and Equipment Locker (2 pieces) GBP 49), 46021 (Garden Shed Support Rail (2 pieces) GBP 49) |
| BAR_included | `biohort:Regalsteher_included` | `2` | script: `'IGNORE'` |
| Regalboden_articleNr | `biohort:Regalboden_articleNr` | `2` | script: `'IGNORE'` |
| Regalboden | `biohort:Regalboden` | `number=0;if(regalbodenCount>2){number=regalbodenCount-2;}` | 45010 (Shelves 2 pieces per package GBP 69), 45020 (Shelves 4 pieces per package GBP 89), 45030 (Shelves 2 pieces per package, deep GBP 99) |
| Geraetehalter_included | `biohort:Geraetehalter_included` | `4` | script: `'IGNORE'` |
| window_included | `biohort:window_articlenr` | `(edition=='window')?1 : 0` | script: `IGNORE` |
| Geraetehalter | `biohort:Geraetehalter` | `number=0;if(geratehalterCount>4){number=geratehalterCount-4;}` | 47020 (Tool Hanger (4 pieces) GBP 29) |
| Werkzeughalter_included | `biohort:Werkzeughalter_included` | `2` | script: `'IGNORE'` |
| Werkzeughalter | `biohort:Werkzeughalter` | `number=0;if(werkzeughalterCount>2){number=werkzeughalterCount-2;}` | 47031 (Tool Holder metallic silver (2 pieces) GBP 39), 47032 (Neo/Eco Tool Holder, metallic silver GBP 39), 47051 (Tool Holder metallic dark grey (2 pieces) GBP 39), 47052 (Neo/Eco Tool Holder, metallic dark grey GBP 39), 47081 (Tool Holder metallic quartz grey (2 pieces) GBP 39), 47082 (Neo/Eco Tool Holder, metallic quartz grey GBP 39) |
| floraboardInPartlist | `biohort:Deko-Element_FloraBoard_ArticleNr` | `countOfFloraboards` | script: `article` |
| fundamentZusatzpaket | `biohort:Fundament-Zusatzpaket` | `if(in(fundament,'smartbase','smartbase_plus')){ if(singleDoors+doubleDoors>1){ number=singleDoors+doubleDoors-1; } }` | 43405 (SmartBasePLUS Foundation Additional Package GBP 89), 43505 (SmartBase Foundation Additional Package GBP 89) |
| BACK_WALL_LEFT | `biohort:Highline_Ruckwand` | `(in(canopy_back_walls,'left','both'))*1` | script: `if(color=='biohort:silber_metallic'){ articleNr='830'; } if(color=='biohort:dunkelgrau_metallic'){ articleNr='840'; } if(color=='biohort:quarzgrau_metallic'){ articleNr='880'; } if(isShort){ articleNr` |
| BACK_WALL_RIGHT | `biohort:Highline_Ruckwand` | `(in(canopy_back_walls,'right','both'))*1` | script: `if(color=='biohort:silber_metallic'){ articleNr='830'; } if(color=='biohort:dunkelgrau_metallic'){ articleNr='840'; } if(color=='biohort:quarzgrau_metallic'){ articleNr='880'; } if(isShort){ articleNr` |
| SIDE_WALL_LEFT | `biohort:Highline_Seitenwand` | `(in(canopy_side_walls,'left','both'))*1` | script: `if(color=='biohort:silber_metallic'){ articleNr='830'; } if(color=='biohort:dunkelgrau_metallic'){ articleNr='840'; } if(color=='biohort:quarzgrau_metallic'){ articleNr='880'; } if(size!=-1&&size!=6){` |
| SIDE_WALL_RIGHT | `biohort:Highline_Seitenwand` | `(in(canopy_side_walls,'right','both'))*1` | script: `if(color=='biohort:silber_metallic'){ articleNr='830'; } if(color=='biohort:dunkelgrau_metallic'){ articleNr='840'; } if(color=='biohort:quarzgrau_metallic'){ articleNr='880'; } if(size!=-1&&size!=6){` |

## GB price list: every SKU whose title contains "HighLine"

From `raw/gb-configurator-prices.json` (the configurator's own `/api/ext/configurator/data` pricing; identical to the GB catalogue index for all 1,631 SKUs).

| SKU | Title | GBP inc VAT |
|---|---|---|
| 45016 | Bin bag holder for equipment locker, Europa, HighLine, AvantGarde and Panorama | 109 |
| 84029 | HighLine® Garden Shed H1 metallic dark grey double door | 2,319 |
| 84020 | HighLine® Garden Shed H1 metallic dark grey standard door | 2,029 |
| 88029 | HighLine® Garden Shed H1 metallic quartz grey double door | 2,319 |
| 88020 | HighLine® Garden Shed H1 metallic quartz grey standard door | 2,029 |
| 83029 | HighLine® Garden Shed H1 metallic silver double door | 2,319 |
| 83020 | HighLine® Garden Shed H1 metallic silver standard door | 2,029 |
| 84039 | HighLine® Garden Shed H2 metallic dark grey double door | 2,609 |
| 84030 | HighLine® Garden Shed H2 metallic dark grey standard door | 2,319 |
| 88039 | HighLine® Garden Shed H2 metallic quartz grey double door | 2,609 |
| 88030 | HighLine® Garden Shed H2 metallic quartz grey standard door | 2,319 |
| 83039 | HighLine® Garden Shed H2 metallic silver double door | 2,609 |
| 83030 | HighLine® Garden Shed H2 metallic silver standard door | 2,319 |
| 84049 | HighLine® Garden Shed H3 metallic dark grey double door | 2,949 |
| 84040 | HighLine® Garden Shed H3 metallic dark grey standard door | 2,699 |
| 88049 | HighLine® Garden Shed H3 metallic quartz grey double door | 2,949 |
| 88040 | HighLine® Garden Shed H3 metallic quartz grey standard door | 2,699 |
| 83049 | HighLine® Garden Shed H3 metallic silver double door | 2,949 |
| 83040 | HighLine® Garden Shed H3 metallic silver standard door | 2,699 |
| 84059 | HighLine® Garden Shed H4 metallic dark grey double door | 3,179 |
| 84050 | HighLine® Garden Shed H4 metallic dark grey standard door | 2,899 |
| 88059 | HighLine® Garden Shed H4 metallic quartz grey double door | 3,179 |
| 88050 | HighLine® Garden Shed H4 metallic quartz grey standard door | 2,899 |
| 83059 | HighLine® Garden Shed H4 metallic silver double door | 3,179 |
| 83050 | HighLine® Garden Shed H4 metallic silver standard door | 2,899 |
| 84069 | HighLine® Garden Shed H5 metallic dark grey double door | 3,449 |
| 84060 | HighLine® Garden Shed H5 metallic dark grey standard door | 3,199 |
| 88069 | HighLine® Garden Shed H5 metallic quartz grey double door | 3,449 |
| 88060 | HighLine® Garden Shed H5 metallic quartz grey standard door | 3,199 |
| 83069 | HighLine® Garden Shed H5 metallic silver double door | 3,449 |
| 83060 | HighLine® Garden Shed H5 metallic silver standard door | 3,199 |
| 84079 | HighLine® Garden Shed H6 metallic dark grey double door | 3,749 |
| 84070 | HighLine® Garden Shed H6 metallic dark grey standard door | 3,499 |
| 88079 | HighLine® Garden Shed H6 metallic quartz grey double door | 3,749 |
| 88070 | HighLine® Garden Shed H6 metallic quartz grey standard door | 3,499 |
| 83079 | HighLine® Garden Shed H6 metallic silver double door | 3,749 |
| 83070 | HighLine® Garden Shed H6 metallic silver standard door | 3,499 |
| 84010 | HighLine® Garden Shed HS metallic dark grey standard door | 2,029 |
| 88010 | HighLine® Garden Shed HS metallic quartz grey standard door | 2,029 |
| 83010 | HighLine® Garden Shed HS metallic silver standard door | 2,029 |
| 47023 | PV mounting system for Highline, Avantgarde, Panorama | 89 |
| 44085 | Rainwater Downpipe Set HighLine Garden Shed metallic quartz grey (2 pieces) | 99 |
| 44065 | Rainwater Downpipe Set HighLine® Garden Shed metallic dark grey (2 pieces) | 99 |
| 44025 | Rainwater Downpipe Set HighLine® Garden Shed metallic silver (2 pieces) | 99 |
| 84036 | Side Canopy L HighLine Garden Shed H2 dark grey | 1,439 |
| 88036 | Side Canopy L HighLine Garden Shed H2 quartz grey | 1,439 |
| 83036 | Side Canopy L HighLine Garden Shed H2 silver | 1,439 |
| 84046 | Side Canopy L HighLine Garden Shed H3 dark grey | 1,539 |
| 88046 | Side Canopy L HighLine Garden Shed H3 quartz grey | 1,539 |
| 83046 | Side Canopy L HighLine Garden Shed H3 silver | 1,539 |
| 84056 | Side Canopy L HighLine Garden Shed H4 dark grey | 1,639 |
| 88056 | Side Canopy L HighLine Garden Shed H4 quartz grey | 1,639 |
| 83056 | Side Canopy L HighLine Garden Shed H4 silver | 1,639 |
| 84066 | Side Canopy L HighLine Garden Shed H5/H6 dark grey | 1,749 |
| 88066 | Side Canopy L HighLine Garden Shed H5/H6 quartz grey | 1,749 |
| 83066 | Side Canopy L HighLine Garden Shed H5/H6 silver | 1,749 |
| 84836 | Side Canopy S HighLine Garden Shed H2 dark grey | 1,129 |
| 88836 | Side Canopy S HighLine Garden Shed H2 quartz grey | 1,129 |
| 83836 | Side Canopy S HighLine Garden Shed H2 silver  | 1,129 |
| 83846 | Side Canopy S HighLine Garden Shed H3 Silver | 1,229 |
| 84846 | Side Canopy S HighLine Garden Shed H3 dark grey | 1,229 |
| 88846 | Side Canopy S HighLine Garden Shed H3 quartz grey | 1,229 |
| 83856 | Side Canopy S HighLine Garden Shed H4 Silver | 1,339 |
| 84856 | Side Canopy S HighLine Garden Shed H4 dark grey | 1,339 |
| 88856 | Side Canopy S HighLine Garden Shed H4 quartz grey | 1,339 |
| 83866 | Side Canopy S HighLine Garden Shed H5/H6 Silver | 1,439 |
| 84866 | Side Canopy S HighLine Garden Shed H5/H6 dark grey | 1,439 |
| 88866 | Side Canopy S HighLine Garden Shed H5/H6 quartz grey | 1,439 |

## Default configuration (as loaded from the find endpoint)

Master parameters: `{"barCountExt": "0", "bodenplatte": "false", "canopy": "left", "canopy2": "left", "canopy_back_walls": "none", "canopy_back_walls2": "none", "canopy_left_size": "s", "canopy_left_size2": "s", "canopy_right_size": "l", "canopy_right_size2": "l", "canopy_side_walls": "none", "canopy_side_walls2": "none", "color": "biohort:dunkelgrau_metallic", "edition": "classic", "fensterCount": "0", "floraBoardCount": "0", "fundament": "none", "isSizeHs": "0", "preferredDoorType": "1", "regenfallrohr": "none", "showDoorArea": "0", "size": "3", "view": "all", "view2": "all"}`

Children placed by default: biohort:Geraetehalter, biohort:Regalboden, biohort:meta_door

Part list stored with the default configuration (find endpoint, prices may be older than live):

- 41041 ALU-Bodenrahmen x1 GBP 207.9 Größe: H2, P2, A3, A5
- 84039 Gerätehaus HighLine® H2 dunkelgrau-metallic Doppeltüre x1 GBP 2499 Farbe: Dunkelgrau-metallic; Türoption: Doppeltür; Größe: H2 (275 x 195 cm)
