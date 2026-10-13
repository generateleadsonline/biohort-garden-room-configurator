# Neo - Biohort's Roomle configurator

Configurator: https://www.biohort.com/gb-en/r/konfigurator/C685BC?country_id=gb  
Roomle master component: `biohort:neo_master` (label "Garden Shed Neo")  
Default configuration id: `biohort:neo_master:10165960BD811D0DBE492EB9A46F756AB743FA78B61DBB3B991ADC5E4501B3C6`  
Captured 13 Oct 2026. Prices are GBP **including 20% VAT**, "price valid in GB", per unit (the basket total is the sum of unit price x quantity).

## What the shopper sees (UI walk-through, desktop 1440 px)

Same shell: canvas left, panel right, steps **Sizes & Colours -> Door -> Foundation -> Accessories**, Biohort button row and live total below.

1. **Sizes & Colours**
   - Size (cm) dropdown, 16 sizes on a 4 x 4 grid of widths x depths (width 180/236/292/348 cm = A/B/C/D... label is depth-number + width-letter): 1A (180 x 180), 2A (180 x 236), 3A (180 x 292), 4A (180 x 348), 1B (236 x 180), 2B (236 x 236, default), 3B (236 x 292), 4B (236 x 348), 1C (292 x 180), 2C (292 x 236), 3C (292 x 292), 4C (292 x 348), 1D (348 x 180), 2D (348 x 236), 3D (348 x 292), 4D (348 x 348).
   - Colour swatches (one body colour): Metallic dark grey (default), Metallic quartz grey, Metallic silver. A separate door colour exists in the data (`color_door`, "Door Colour") and shows in the part list, but it is hidden in the GB UI, so door = body colour. The default config id still carries a two-tone `color_master` value (`biohort:variation_1_2`).
   - Side canopy: without / left / right / both (not offered when depth = 180 cm).
2. **Door**
   - View: whole house / show open view.
   - Door type: standard door / double door (double door not offered on 1A, 2A, 3A, 4A). Default config has a double door.
   - Exterior accessory: **additional door**, **additional doubledoor** (the latter only if the house has no double door and size is not an A size).
3. **Foundation**: without / floor frame (default in this configuration) / SmartBase / SmartBase PLUS; floor plate with/without when floor frame is chosen.
4. **Accessories**
   - View dropdown; side canopy repeated; **Interior Panelling** yes / no (default no in this configuration); **Insulation** yes / no (only when panelling = yes).
   - Back wall / side wall for side canopy appear as add-on items when a canopy exists.
   - Interior accessory: Shelf baskets, Door baskets, bicycle holder, Bike Lift, "+8 Show all" (12: also shelf set of 2 26 cm, shelf set of 2 44.5 cm, tool hangers set of 2, electric mounting panel, hook set, suspension basket, bicycle hanger bikeMax, tool holder for door).
   - Exterior accessory: Acrylic Glass Panel, FloraBoard set of 2, threshold access ramp.
   - Clicking the building shows "The starting element of the configuration cannot be deleted, but feel free to replace it!".

## Prices observed live (GBP inc VAT)

| Configuration | Part list | Total |
|---|---|---|
| Default: 2B (236 x 236) dark grey, double door, floor frame, no panelling | 85063 Neo 2B dark grey double door 3,759 + 41040 Aluminium Floor Frame Neo 2B 219 | **3,978** |
| + Interior panelling yes | + 46055 Neo Interior Panelling 2B DT 919 | 4,897 |
| + Insulation yes | + 46082 Neo Insulation 1B / 2A ST, 2B / 1C DT 169 | 5,066 |
| Door type -> standard door | 85034 2B standard door 3,469; panelling becomes 46054 "2B ST" 1,029; insulation becomes 46084 189 | 4,906 |

Note: interior panelling and insulation SKUs depend on size **and** door type (ST/DT), so they must be re-derived when the door changes.

## Tools and features

Same Roomle toolbar (undo/redo, AR, multi select, measurements, select view, fullscreen, reset camera, screenshot) and Biohort buttons (Print/PDF/CSV, Share, Search dealers, Add to cart, Show part list).

## UX weaknesses

- 16 sizes in a plain dropdown with codes like "3C"; no visual grid or footprint picker, although the range is literally a grid.
- Door colour exists in the product (and is printed in the part list) but cannot be chosen in the GB UI.
- Panelling and insulation prices are hidden until toggled; changing the door silently re-prices panelling (+GBP 110 here).
- Same duplicated canopy controls and fiddly dock placement as the other ranges.

## Steps (Roomle parameter groups, in order)

1. **Sizes & Colours** (`color_size_group`)
2. **Door** (`door_group`)
3. **Foundation** (`foundation_group`)
4. **Accessories** (`extra_group`)

## Every parameter on the master component

Machine source: `raw/neo-component.json` (`component.configuration` is a JSON string). `visible`/`enabled`/`condition` are Roomle script expressions evaluated against the other parameters. Parameters with `visible=false` are internal (they drive geometry, counts and SKUs) and are listed only once at the end.

### Sizes & Colours

- **size (cm)** `size` (Integer), default `4`, sort 22
  - values: `1` 1A (180 x 180); `3` 2A (180 x 236); `5` 3A (180 x 292); `6` 4A (180 x 348); `2` 1B (236 x 180); `4` 2B (236 x 236); `7` 3B (236 x 292); `8` 4B (236 x 348); `9` 1C (292 x 180); `10` 2C (292 x 236); `11` 3C (292 x 292); `12` 4C (292 x 348); `13` 1D (348 x 180); `14` 2D (348 x 236); `15` 3D (348 x 292); `16` 4D (348 x 348)
- **colour** `color_master` (Material), default `biohort:variation_1_2`, sort 23
  - values: `biohort:silber_metallic` metallic silver; `biohort:quarzgrau_metallic` metallic quartz grey; `biohort:dunkelgrau_metallic` metallic dark grey
  - onValueChange: `/* house can be two colored */ color = color_master; color_roof_door = color_master; if (color_master == 'biohort:variation_1_2') { color = 'biohort:silber_metallic'; color_roof_door = 'biohort:quarzgrau_metallic'; } if (color_master == 'biohort:varation_1_3') { color = 'biohort:silber_metallic'; co`
- **side canopy** `canopy` (String), default `none`, sort 150, visible when `((view == 'all' || view == 'geoffnet' || view == 'roofless') && depth != 1800)`
  - values: `none` without; `left` left *(only if `depth != 1800`)*; `right` right *(only if `depth != 1800`)*; `both` both sides *(only if `depth != 1800`)*
  - onValueChange: `canopy2 = canopy;`

### Door

- **view** `view2` (String), default `all`, sort 1, visible when `showView2`
  - values: `all` whole house; `geoffnet` show open view
- **door type** `preferredDoorType` (Integer), default `1`, sort 24, visible when `(!in(size, 1, 3, 5, 6))`
  - values: `1` standard door; `2` double door *(only if `(!in(size, 1, 3, 5, 6))`)*

### Foundation

- **foundation** `fundament` (String), default `none`, sort 25
  - values: `none` without; `bodenrahmen` floor frame; `smart_base` SmartBase; `smart_base_plus` SmartBase PLUS
- **floor plate** `bodenplatte` (String), default `False`, sort 30, visible when `(fundament == bodenrahmen)`
  - values: `true` with *(only if `(fundament == bodenrahmen)`)*; `false` without

### Accessories

- **Interior Panelling** `interior_panelling` (String), default `yes`, sort None
  - values: `yes` yes; `no` no
- **Insulation** `isolation` (String), default `no`, sort None, visible when `interior_panelling == 'yes'`
  - values: `yes` yes *(only if `interior_panelling == 'yes'`)*; `no` no
- **view** `view` (String), default `all`, sort 1, visible when `showView`
  - values: `front` front wall; `rear` back wall; `left` left wall; `right` right wall; `roofless` without roof; `all` whole house; `geoffnet` show open view
- **side canopy** `canopy2` (String), default `none`, sort 150, visible when `((view == 'all' || view == 'geoffnet' || view == 'roofless') && depth != 1800)`
  - values: `none` without; `left` left *(only if `depth != 1800`)*; `right` right *(only if `depth != 1800`)*; `both` both sides *(only if `depth != 1800`)*
  - onValueChange: `canopy = canopy2;`

### (no group)

- **None** `geratehalterCount` (Integer), default `0`, sort None
  - values: (free / computed)
- **None** `werkzeugCount` (Integer), default `0`, sort None, enabled when `False`
  - values: (free / computed)
- **None** `werkzeugCount_front` (Integer), default `0`, sort None, enabled when `False`
  - values: (free / computed)
- **None** `werkzeugCount_back` (Integer), default `0`, sort None, enabled when `False`
  - values: (free / computed)
- **None** `werkzeugCount_right` (Integer), default `0`, sort None, enabled when `False`
  - values: (free / computed)
- **None** `werkzeugCount_left` (Integer), default `0`, sort None, enabled when `False`
  - values: (free / computed)

Internal (hidden) parameters: `partListSort`, `color_door`, `color_roof_door`, `color`, `regenfallrohr`, `showDoorArea`, `front_door_status`, `rear_door_status`, `right_door_status`, `left_door_status`, `house_has_double_door`, `front_double_to_single_door`, `rear_double_to_single_door`, `right_double_to_single_door`, `left_double_to_single_door`, `number_of_shelves_260`, `number_of_shelves_445`, `fullHeightOccupations_front`, `fullHeightOccupations_rear`, `fullHeightOccupations_left`, `fullHeightOccupations_right`, `total_left_right_panels`, `total_front_back_panels`, `width_for_inner_measurment`, `depth_for_inner_measurment`, `gotMainDoor`

## Add-on items (Roomle possibleChildren: dragged/docked onto the building)

Machine source: `raw/neo-children.json` (items + their components). `condition` = when the item is offered.

| Item id | Label | Tab | Offered when | Preset params | Own visible parameters |
|---|---|---|---|---|---|
| `biohort:neo_canopy_wall` | back wall for side canopy | Accessories | `False` | {'color': 'biohort:dunkelgrau_metallic', 'depth': '0', 'docked_index': '0', 'interior_panelling': 'yes', 'isBack': '1', 'nrOfPanels': '10', 'size': '2', 'wallType': '1', 'width': '0'} | Colour `color` |
| `biohort:neo_glas_panel` | Neo Glas Panel | Accessories | `False` |  |  |
| `biohort:neo_shelf` | Shelf set of 2, 26 cm | Accessories | `False` | {'shelfsize': '260.00', 'visible': '1'} |  |
| `biohort:neo_tool_holder` | tool hangers set of 2 | Accessories | `False` |  |  |
| `biohort:neo_door` | additional door | Door | `False` | {'color': 'biohort:dunkelgrau_metallic', 'color_border': 'biohort:dunkelgrau_metallic', 'doorLocation': 'front', 'doorType': '1', 'doubleDoorPossible': '1', 'house_has_double_door': '0', 'mainDoor': '0', 'open': '0', 'rampPossible': '0', 'showArea': '0', 'visible': '1'} | door type `doorType` [1=standard door, 2=double door] |
| `biohort:neo_ele_montage_panel` | electric mounting panel | Accessories | `False` |  |  |
| `biohort:neo_hanging_set` | hook set | Accessories | `False` |  |  |
| `biohort:neo_hanging_basket` | suspension basket | Accessories | `False` |  |  |
| `biohort:neo_bike_holder` | bicycle holder | Accessories | `False` |  |  |
| `biohort:neo_bike_max` | "bicycle hanger "bikeMax"" | Accessories | `False` |  |  |
| `biohort:glas_panel` | Acrylic Glass Panel | Accessories | always | {'elementType': 'glas_panel'} |  |
| `biohort:neo_floraboard` | FloraBoard set of 2 | Accessories | `False` |  |  |
| `biohort:basket_big` | Shelf baskets | Accessories | always |  |  |
| `biohort:neo_shelf` | Shelf set of 2, 26 cm | Accessories | always | {'shelfsize': '260.00', 'visible': '1'} |  |
| `biohort:shelf_big` | Shelf set of 2, 44.5 cm | Accessories | always | {'shelfsize': '445.00', 'visible': '1'} |  |
| `biohort:neo_tool_holder` | tool hangers set of 2 | Accessories | always |  |  |
| `biohort:neo_door` | additional door | Door | always | {'color': 'biohort:dunkelgrau_metallic', 'color_border': 'biohort:dunkelgrau_metallic', 'doorLocation': 'front', 'doorType': '1', 'doubleDoorPossible': '1', 'house_has_double_door': '0', 'mainDoor': '0', 'open': '0', 'rampPossible': '0', 'showArea': '0', 'visible': '1'} | door type `doorType` [1=standard door, 2=double door] |
| `biohort:neo_doubledoor` | additional doubledoor | Door | `!house_has_double_door && size != 1 && size != 3 && size != 5 && size != 6` | {'color': 'biohort:dunkelgrau_metallic', 'color_border': 'biohort:dunkelgrau_metallic', 'doorLocation': 'front', 'doorType': '2', 'doubleDoorPossible': '1', 'house_has_double_door': '0', 'mainDoor': '0', 'open': '0', 'rampPossible': '0', 'showArea': '0', 'visible': '1'} | door type `doorType` [1=standard door, 2=double door] |
| `biohort:neo_ele_montage_panel` | electric mounting panel | Accessories | always |  |  |
| `biohort:neo_hanging_set` | hook set | Accessories | always |  |  |
| `biohort:neo_hanging_basket` | suspension basket | Accessories | always |  |  |
| `biohort:neo_bike_holder` | bicycle holder | Accessories | always |  |  |
| `biohort:neo_bike_lift` | Bike Lift | Accessories | always |  |  |
| `biohort:neo_bike_max` | "bicycle hanger "bikeMax"" | Accessories | always |  |  |
| `biohort:neo_canopy_wall` | back wall for side canopy | Accessories | `canopy != 'none'` | {'color': 'biohort:dunkelgrau_metallic', 'depth': '0', 'docked_index': '0', 'interior_panelling': 'yes', 'isBack': '1', 'nrOfPanels': '10', 'size': '2', 'wallType': '1', 'width': '0'} | Colour `color` |
| `biohort:neo_canopy_wall_side` | side wall for side canopy | Accessories | `canopy != 'none'` | {'color': 'biohort:dunkelgrau_metallic', 'depth': '0', 'docked_index': '0', 'interior_panelling': 'yes', 'isBack': '0', 'nrOfPanels': '5', 'size': '13', 'wallType': '1', 'width': '0'} | Colour `color` |
| `biohort:neo_floraboard` | FloraBoard set of 2 | Accessories | always |  |  |

## Bill of materials logic (subComponents -> SKUs)

Each sub-component is counted by `numberInPartList` and gets its SKU from its own `articleNr` script. SKUs that appear literally in the scripts are priced below; codes built by concatenation are shown as script text. Machine source: `raw/neo-subcomponents.json`.

Master articleNr script (SKU of the building itself):

```
articleNr = ''; if (in(color_master, 'biohort:variation_1_2', 'biohort:varation_1_3', 'biohort:variation_2_1', 'biohort:variation_2_3', 'biohort:variation_3_1', 'biohort:variation_3_2')) { if (color == 'biohort:silber_metallic') { if (preferredDoorType == 1 && house_has_double_door == false && (!in(size, 13, 14, 15, 16))) { articleNr = articleNr | '810'; } if (preferredDoorType == 1 && house_has_double_door == false && (in(size, 13, 14, 15, 16))) { articleNr = articleNr | '820'; } if ((preferredDoorType == 2 || house_has_double_door == true) && (in(size, 2, 4, 7, 8))) { articleNr = articleNr | '810'; } if ((preferredDoorType == 2 || house_has_double_door == true) && (!in(size, 2, 4, 7, 8))) { articleNr = articleNr | '820'; } } if (color == 'biohort:quarzgrau_metallic') { if (preferredDoorType == 1 && house_has_double_door == false && (!in(size, 13, 14, 15, 16))) { articleNr = articleNr | '870'; } if (preferredDoorType == 1 && house_has_double_door == false && (in(size, 13, 14, 15, 16))) { articleNr = articleNr | '890'; } if ((preferredDoorType == 2 || house_has_double_door == true) && (in(size, 2, 4, 7, 8))) { articleNr = articleNr | '870'; } if ((preferredDoorType == 2 || house_has_double_door == true) && (!in(size, 2, 4, 7, 8))) { articleNr = articleNr | '890'; } } if (color == 'biohort:dunkelgrau_metallic') { if (preferredDoorType == 1 && house_has_double_door == false && (!in(size, 13, 14, 15, 16))) { articleNr = articleNr | '850'; } if (preferredDoorType == 1 && house_has_double_door == false && (in(size, 13, 14, 15, 16))) { articleNr = articleNr | '860'; } if ((preferredDoorType == 2 || house_has_double_door == true) && (in(size, 2, 4, 7, 8))) { articleNr = articleNr | '850'; } if ((preferredDoorType == 2 || house_has_double_door == true) && (!in(size, 2, 4, 7, 8))) { articleNr = articleNr | '860'; } } if (in(color_master, 'biohort:variation_1_2', 'biohort:varation_1_3')) { if (color_roof_door == 'biohort:quarzgrau_metallic') { if (preferredDoorType == 1 && house_has_double_door == false) { if (in(size, 1, 0)) { articleNr = articleNr | '05'; /* 1A */ } if (size == 3) { articleNr = articleNr | '08'; /* 2A */ } if (size == 5) { articleNr = articleNr | '13'; /* 3A */ } if (size == 6) { articleNr = articleNr | '17'; /* 4A */ } if (size == 2) { articleNr = articleNr | '33'; /* 1B */ } if (size == 4) { articleNr = articleNr | '39'; /* 2B */ } if (size == 7) { articleNr = articleNr | '43'; /* 3B */ } if (size == 8) { articleNr = articleNr | '49'; /* 4B */ } if (size == 9) { articleNr = articleNr | '84'; /* 1C */ } if (size == 10) { articleNr = articleNr | '87'; /* 2C */ } if (size == 11) { articleNr = articleNr | '91'; /* 3C */ } if (size == 12) { articleNr = articleNr | '94'; /* 4C */ } if (size == 13) { articleNr = articleNr | '27'; /* 1D */ } if (size == 14) { articleNr = articleNr | '30'; /* 2D */ } if (size == 15) { articleNr = articleNr | '33'; /* 3D */ } if (size == 16) { articleNr = articleNr | '37'; /* 4D */ } } else { if (size == 2) { ar
```

| Sub-component | Component | Quantity rule | SKUs named in its articleNr script |
|---|---|---|---|
| neo_canopy | `biohort:neo_canopy` | `number = 0; if (canopy == 'left' // canopy == 'right') { number = 1; } if (canopy == 'both') { number = 2; }` | script: `articleNr=''; if(color_master=='biohort:silber_metallic'){ articleNr=articleNr/'810'; } if(color_master=='biohort:quarzgrau_metallic'){ articleNr=articleNr/'870'; } if(color_master=='biohort:dunkelgra` |
| neo_rain | `biohort:neo_rain` | `1` | script: `articleNr='IGNORE'` |
| neo_wall_front | `biohort:neo_wall` | `0` |  |
| neo_wall_back | `biohort:neo_wall` | `0` |  |
| neo_wall_left | `biohort:neo_wall` | `0` |  |
| neo_wall_right | `biohort:neo_wall` | `0` |  |
| neo_wall_panel | `biohort:neo_wall_panel` | `0` |  |
| neo_wall_corner | `biohort:neo_wall_corner` | `0` |  |
| extra_doors | `biohort:neo_door_artiklnr` | `number = number_of_doors - 1;` | 81002 (Additional Door NEO Garden Shed metallic silver GBP 659), 85002 (Additional Door NEO Garden Shed metallic dark grey GBP 659), 87002 (Additional Door NEO Garden Shed metallic quartz grey GBP 659) |
| included_standarddoor | `biohort:Standardtuer` | `1` | script: `if(includedInPrice){ articleNr='IGNORE'; }else{ articleNr='Standardtuer'; }` |
| neo_interior_panelling | `biohort:neo_interior_panelling` | `if (interior_panelling == 'yes') { number = 1 }` | 46051 (Neo Interior Panelling 1A ST GBP 749), 46052 (Neo Interior Panelling 1B / 2A ST GBP 869), 46053 (Neo Interior Panelling 1B DT GBP 779), 46054 (Neo Interior Panelling 2B ST GBP 1029), 46055 (Neo Interior Panelling 2B DT GBP 919), 46056 (Neo Garden Shed Interior Panelling 1C/3A Standard Door GBP 1029), 46057 (Neo Garden Shed Interior Panelling 1C Double Door GBP 1029), 46058 (Neo Garden Shed Interior Panelling 1D/4A Standard Door GBP 1159), 46059 (Neo Garden Shed Interior Panelling 2C/3B Standard Door GBP 1159), 46060 (Neo Garden Shed Interior Panelling 2C/3B Double Door GBP 1059), 46061 (Neo Garden Shed Interior Panelling 1D Double Door GBP 1059), 46062 (Neo Garden Shed Interior Panelling 2D/4B Standard Door GBP 1279), 46063 (Neo Garden Shed Interior Panelling 3C Standard Door GBP 1279), 46064 (Neo Garden Shed Interior Panelling 2D/4B Double Door GBP 1159), 46065 (Neo Garden Shed Interior Panelling 3C Double Door GBP 1159), 46066 (Neo Garden Shed Interior Panelling 3D/4C Standard Door GBP 1399), 46067 (Neo Garden Shed Interior Panelling 3D/4C Double Door GBP 1349), 46068 (Neo Garden Shed Interior Panelling 4D Standard Door GBP 1539), 46069 (Neo Garden Shed Interior Panelling 4D Double Door GBP 1439) |
| neo_isolation | `biohort:neo_isolation` | `if (isolation == 'yes') { number = 1 }` | 46081 (Neo Insulation 1A / 1B Double Door GBP 159), 46082 (Neo Insulation 1B / 2A Standard Door, 2B / 1C Double Door GBP 169), 46084 (Neo Insulation 2B / 1C / 3A Standard Door and 1D / 2C / 3B Double Door GBP 189), 46086 (Neo Garden Shed Insulation 1D / 2C / 3B / 4A Standard Door, 2D / 3C / 4B Double Door GBP 239), 46088 (Neo Garden Shed Insulation 2D / 3C / 4B Standard Door, 3D / 4C Double Door GBP 299), 46090 (Neo Garden Shed Insulation 3D / 4C Standard Door, 4D Double Door GBP 359), 46093 (Neo Garden Shed Insulation 4D Standard Door GBP 429) |
| Alu-Bodenrahmen | `biohort:neo_floor_frame` | `if (fundament == bodenrahmen) { number = 1 }` | 41014 (Aluminium Floor Frame 1A GBP 169), 41024 (Aluminium Floor Frame 1B/2A GBP 199), 41034 (Floor Frame Neo Garden Shed 1C/3A GBP 219), 41040 (Aluminium Floor Frame Neo 2B GBP 219), 41044 (Floor Frame Neo Garden Shed 1D/4A GBP 249), 41054 (Floor Frame Neo Garden Shed 2C/3B GBP 259), 41067 (Floor Frame Neo Garden Shed 2D/4B GBP 309), 41074 (Floor Frame Neo Garden Shed 3C GBP 329), 41084 (Floor Frame Neo Garden Shed 3D/4C GBP 369), 41094 (Floor Frame Neo Garden Shed 4D GBP 429) |
| Alu-Bodenplatten | `biohort:neo_floor_plate` | `if (bodenplatte) { number = 1; }` | 48014 (Aluminium Floor Panel 1A GBP 349), 48024 (Aluminium Floor Panel 1B/2A GBP 439), 48034 (Neo Garden Shed Floor Panel 1C/3A GBP 579), 48040 (Neo Aluminium Floor Panel 2B, Europa 4 GBP 529), 48044 (Neo Garden Shed Floor Panel 1D/4A GBP 689), 48054 (Neo Garden Shed Floor Panel 2C/3B GBP 679), 48064 (Neo Garden Shed Floor Panel 2D/4B GBP 869), 48074 (Neo Garden Shed Floor Panel 3C GBP 1029), 48084 (Neo Garden Shed Floor Panel 3D/4C GBP 1159), 48094 (Neo Garden Shed Floor Panel 4D GBP 1349) |
| neo_smartbase | `biohort:neo_smartbase` | `if (in(fundament, 'smart_base', 'smart_base_plus')) { number = 1; }` | 43418 (SmartBasePLUS Neo 2B GBP 1829), 43450 (SmartBasePLUS 1A GBP 1249), 43454 (SmartBasePLUS 1B/2A GBP 1489), 43455 (SmartBasePLUS Neo 1C/3A GBP 1999), 43456 (SmartBasePLUS Neo 1D/4A GBP 2219), 43460 (SmartBasePLUS Neo Garden Shed 2C/3B GBP 2449), 43462 (SmartBasePLUS Neo 2D/4B GBP 2699), 43465 (SmartBasePLUS Neo 3C GBP 2999), 43470 (SmartBasePLUS Neo 3D/4C GBP 3849), 43474 (SmartBasePLUS Neo 4D GBP 4239), 43918 (SmartBase Europa 4 GBP 1439), 43950 (SmartBase for Neo Garden Shed, size 1A GBP 1049), 43954 (SmartBase for Neo Garden Shed, size 1B/2A GBP 1199), 43955 (SmartBase Neo Garden Shed 1C/3A GBP 1449), 43956 (SmartBase Neo Garden Shed 1D/4A GBP 1679), 43960 (SmartBase Neo Garden Shed 2C/3B GBP 1779), 43962 (SmartBase Neo Garden Shed 2D/4B GBP 2119), 43965 (SmartBase Neo 3C GBP 2509), 43970 (SmartBase Neo 3D/4C GBP 2889), 43974 (SmartBase Neo Garden Shed 4D GBP 3469) |
| Regalboden_articleNr_ignore | `biohort:neo_shelf_artiklnr` | `2` | 45040 (Shelves Neo 2 pieces per package GBP 89), 45050 (Shelves Neo 4 pieces per package GBP 109), 45060 (Shelves Neo 2 pieces per package, deep GBP 99) |
| Regalboden_260_articleNr | `biohort:neo_shelf_artiklnr` | `number = 0; if (number_of_shelves_260 >= 2) { if (fmod(number_of_shelves_260, 2) == 1) { number_of_shelves_260 = number_of_shelves_260 + 1; } number = number_of` | 45040 (Shelves Neo 2 pieces per package GBP 89), 45050 (Shelves Neo 4 pieces per package GBP 109), 45060 (Shelves Neo 2 pieces per package, deep GBP 99) |
| Regalboden_445_articleNr | `biohort:neo_shelf_artiklnr` | `if (fmod(number_of_shelves_445, 2) == 1) { number_of_shelves_445 = number_of_shelves_445 + 1; } number = number_of_shelves_445;` | 45040 (Shelves Neo 2 pieces per package GBP 89), 45050 (Shelves Neo 4 pieces per package GBP 109), 45060 (Shelves Neo 2 pieces per package, deep GBP 99) |
| Geraetehalter_included | `biohort:neo_tool_holder_artiklnr` | `2` | 47021 (Neo Tool Hanger 2-piece GBP 39) |
| Geraetehalter | `biohort:neo_tool_holder_artiklnr` | `number = 0; if (geratehalterCount > 2) { number = geratehalterCount - 2; }` | 47021 (Neo Tool Hanger 2-piece GBP 39) |
| Werkzeughalter_included | `biohort:Werkzeughalter_included` | `number_of_doors * 2` | script: `'IGNORE'` |
| Werkzeughalter | `biohort:neo_door_tool_holder_artiklnr` | `number = 0; if (number_of_doors != 0) { if (werkzeugCount / number_of_doors > 2) { number = werkzeugCount - (2 * number_of_doors); } }` | 47032 (Neo/Eco Tool Holder, metallic silver GBP 39), 47052 (Neo/Eco Tool Holder, metallic dark grey GBP 39), 47082 (Neo/Eco Tool Holder, metallic quartz grey GBP 39) |
| neo_extra_fundament | `biohort:neo_extra_fundament` | `number = 0; if (in(fundament, 'smart_base', 'smart_base_plus') && number_of_doors > 1) { number = number_of_doors - 1; }` | 43405 (SmartBasePLUS Foundation Additional Package GBP 89), 43505 (SmartBase Foundation Additional Package GBP 89) |

## GB price list: every SKU whose title contains "Neo"

From `raw/gb-configurator-prices.json` (the configurator's own `/api/ext/configurator/data` pricing; identical to the GB catalogue index for all 1,631 SKUs).

| SKU | Title | GBP inc VAT |
|---|---|---|
| 85001 | Additional Door NEO Garden Shed metallic dark grey | 959 |
| 85002 | Additional Door NEO Garden Shed metallic dark grey | 659 |
| 87001 | Additional Door NEO Garden Shed metallic quartz grey | 959 |
| 87002 | Additional Door NEO Garden Shed metallic quartz grey | 659 |
| 81001 | Additional Door NEO Garden Shed metallic silver | 959 |
| 81002 | Additional Door NEO Garden Shed metallic silver | 659 |
| 41040 | Aluminium Floor Frame Neo 2B | 219 |
| 85098 | Back Wall for Neo Garden Shed Side Canopy metallic dark grey | 909 |
| 87098 | Back Wall for Neo Garden Shed Side Canopy metallic quartz grey | 909 |
| 81098 | Back Wall for Neo Garden Shed Side Canopy metallic silver | 909 |
| 45046 | Bin bag holder for Garden Shed Neo and wall mounting | 109 |
| 41034 | Floor Frame Neo Garden Shed 1C/3A | 219 |
| 41044 | Floor Frame Neo Garden Shed 1D/4A | 249 |
| 41054 | Floor Frame Neo Garden Shed 2C/3B | 259 |
| 41067 | Floor Frame Neo Garden Shed 2D/4B | 309 |
| 41074 | Floor Frame Neo Garden Shed 3C | 329 |
| 41084 | Floor Frame Neo Garden Shed 3D/4C | 369 |
| 41094 | Floor Frame Neo Garden Shed 4D | 429 |
| 47056 | FloraBoard for Neo Garden Shed Side Canopy metallic dark grey | 199 |
| 47086 | FloraBoard for Neo Garden Shed Side Canopy metallic quartz grey | 199 |
| 47036 | FloraBoard for Neo Garden Shed Side Canopy metallic silver | 199 |
| 47055 | FloraBoard for Neo Garden Shed metallic dark grey | 199 |
| 47085 | FloraBoard for Neo Garden Shed metallic quartz grey | 199 |
| 47035 | FloraBoard for Neo Garden Shed metallic silver | 199 |
| 47954 | Glass Panel for Neo Garden Shed Side Canopy metallic dark grey | 199 |
| 47984 | Glass Panel for Neo Garden Shed Side Canopy metallic quartz grey | 199 |
| 47934 | Glass Panel for Neo Garden Shed Side Canopy metallic silver | 199 |
| 49058 | Mounting Kit Garden Shed Garden shed Neo | 100 |
| 48040 | Neo Aluminium Floor Panel 2B, Europa 4 | 529 |
| 49030 | Neo Bicycle Hanger "BikeMax" | 99 |
| 46034 | Neo Electrical Mounting Panel | 89 |
| 85003 | Neo Garden Shed 1A metallic dark grey | 2,699 |
| 87003 | Neo Garden Shed 1A metallic quartz grey | 2,699 |
| 81003 | Neo Garden Shed 1A metallic silver | 2,699 |
| 85060 | Neo Garden Shed 1B metallic dark grey double door | 3,279 |
| 85029 | Neo Garden Shed 1B metallic dark grey standard door | 2,999 |
| 87060 | Neo Garden Shed 1B metallic quartz grey double door | 3,279 |
| 87029 | Neo Garden Shed 1B metallic quartz grey standard door | 2,999 |
| 81060 | Neo Garden Shed 1B metallic silver double door | 3,279 |
| 81029 | Neo Garden Shed 1B metallic silver standard door | 2,999 |
| 86005 | Neo Garden Shed 1C metallic dark grey double door | 3,659 |
| 85082 | Neo Garden Shed 1C metallic dark grey standard door | 3,369 |
| 89005 | Neo Garden Shed 1C metallic quartz grey double door | 3,659 |
| 87082 | Neo Garden Shed 1C metallic quartz grey standard door | 3,369 |
| 82005 | Neo Garden Shed 1C metallic silver double door | 3,659 |
| 81082 | Neo Garden Shed 1C metallic silver standard door | 3,369 |
| 86044 | Neo Garden Shed 1D metallic dark grey double door | 4,049 |
| 86024 | Neo Garden Shed 1D metallic dark grey standard door | 3,799 |
| 89044 | Neo Garden Shed 1D metallic quartz grey double door | 4,049 |
| 89024 | Neo Garden Shed 1D metallic quartz grey standard door | 3,799 |
| 82044 | Neo Garden Shed 1D metallic silver double door | 4,049 |
| 82024 | Neo Garden Shed 1D metallic silver standard door | 3,799 |
| 85006 | Neo Garden Shed 2A metallic dark grey standard door | 2,999 |
| 87006 | Neo Garden Shed 2A metallic quartz grey standard door | 2,999 |
| 81006 | Neo Garden Shed 2A metallic silver standard door | 2,999 |
| 85063 | Neo Garden Shed 2B metallic dark grey double door | 3,759 |
| 85034 | Neo Garden Shed 2B metallic dark grey standard door | 3,469 |
| 87063 | Neo Garden Shed 2B metallic quartz grey double door | 3,759 |
| 87034 | Neo Garden Shed 2B metallic quartz grey standard door | 3,469 |
| 81063 | Neo Garden Shed 2B metallic silver double door | 3,759 |
| 81034 | Neo Garden Shed 2B metallic silver standard door | 3,469 |
| 86008 | Neo Garden Shed 2C metallic dark grey double door | 4,239 |
| 85085 | Neo Garden Shed 2C metallic dark grey standard door | 3,949 |
| 89008 | Neo Garden Shed 2C metallic quartz grey double door | 4,239 |
| 87085 | Neo Garden Shed 2C metallic quartz grey standard door | 3,949 |
| 82008 | Neo Garden Shed 2C metallic silver double door | 4,239 |
| 81085 | Neo Garden Shed 2C metallic silver standard door | 3,949 |
| 86048 | Neo Garden Shed 2D metallic dark grey double door | 4,499 |
| 86028 | Neo Garden Shed 2D metallic dark grey standard door | 4,199 |
| 89048 | Neo Garden Shed 2D metallic quartz grey double door | 4,499 |
| 89028 | Neo Garden Shed 2D metallic quartz grey standard door | 4,199 |
| 82048 | Neo Garden Shed 2D metallic silver double door | 4,499 |
| 82028 | Neo Garden Shed 2D metallic silver standard door | 4,199 |
| 85009 | Neo Garden Shed 3A metallic dark grey standard door | 3,369 |
| 87009 | Neo Garden Shed 3A metallic quartz grey standard door | 3,369 |
| 81009 | Neo Garden Shed 3A metallic silver standard door | 3,369 |
| 85069 | Neo Garden Shed 3B metallic dark grey double door | 4,239 |
| 85040 | Neo Garden Shed 3B metallic dark grey standard door | 3,949 |
| 87069 | Neo Garden Shed 3B metallic quartz grey double door | 4,239 |
| 87040 | Neo Garden Shed 3B metallic quartz grey standard door | 3,949 |
| 81069 | Neo Garden Shed 3B metallic silver double door | 4,239 |
| 81040 | Neo Garden Shed 3B metallic silver standard door | 3,949 |
| 86011 | Neo Garden Shed 3C metallic dark grey double door | 4,719 |
| 85089 | Neo Garden Shed 3C metallic dark grey standard door | 4,429 |
| 89011 | Neo Garden Shed 3C metallic quartz grey double door | 4,719 |
| 87089 | Neo Garden Shed 3C metallic quartz grey standard door | 4,429 |
| 82011 | Neo Garden Shed 3C metallic silver double door | 4,719 |
| 81089 | Neo Garden Shed 3C metallic silver standard door | 4,429 |
| 86051 | Neo Garden Shed 3D metallic dark grey double door | 5,199 |
| 86031 | Neo Garden Shed 3D metallic dark grey standard door | 4,909 |
| 89051 | Neo Garden Shed 3D metallic quartz grey double door | 5,199 |
| 89031 | Neo Garden Shed 3D metallic quartz grey standard door | 4,909 |
| 82051 | Neo Garden Shed 3D metallic silver double door | 5,199 |
| 82031 | Neo Garden Shed 3D metallic silver standard door | 4,909 |
| 85014 | Neo Garden Shed 4A metallic dark grey standard door | 3,799 |
| 87014 | Neo Garden Shed 4A metallic quartz grey standard door | 3,799 |
| 81014 | Neo Garden Shed 4A metallic silver standard door | 3,799 |
| 85072 | Neo Garden Shed 4B metallic dark grey double door | 4,619 |
| 85044 | Neo Garden Shed 4B metallic dark grey standard door | 4,339 |
| 87072 | Neo Garden Shed 4B metallic quartz grey double door | 4,619 |
| 87044 | Neo Garden Shed 4B metallic quartz grey standard door | 4,339 |
| 81072 | Neo Garden Shed 4B metallic silver double door | 4,619 |
| 81044 | Neo Garden Shed 4B metallic silver standard door | 4,339 |
| 86014 | Neo Garden Shed 4C metallic dark grey double door | 5,199 |
| 85092 | Neo Garden Shed 4C metallic dark grey standard door | 4,909 |
| 89014 | Neo Garden Shed 4C metallic quartz grey double door | 5,199 |
| 87092 | Neo Garden Shed 4C metallic quartz grey standard door | 4,909 |
| 82014 | Neo Garden Shed 4C metallic silver double door | 5,199 |
| 81092 | Neo Garden Shed 4C metallic silver standard door | 4,909 |
| 86054 | Neo Garden Shed 4D metallic dark grey double door | 5,589 |
| 86034 | Neo Garden Shed 4D metallic dark grey standard door | 5,299 |
| 89054 | Neo Garden Shed 4D metallic quartz grey double door | 5,589 |
| 89034 | Neo Garden Shed 4D metallic quartz grey standard door | 5,299 |
| 82054 | Neo Garden Shed 4D metallic silver double door | 5,589 |
| 82034 | Neo Garden Shed 4D metallic silver standard door | 5,299 |
| 48034 | Neo Garden Shed Floor Panel 1C/3A | 579 |
| 48044 | Neo Garden Shed Floor Panel 1D/4A | 689 |
| 48054 | Neo Garden Shed Floor Panel 2C/3B | 679 |
| 48064 | Neo Garden Shed Floor Panel 2D/4B | 869 |
| 48074 | Neo Garden Shed Floor Panel 3C | 1,029 |
| 48084 | Neo Garden Shed Floor Panel 3D/4C | 1,159 |
| 48094 | Neo Garden Shed Floor Panel 4D | 1,349 |
| 46086 | Neo Garden Shed Insulation 1D / 2C / 3B / 4A Standard Door, 2D / 3C / 4B Double Door | 239 |
| 46088 | Neo Garden Shed Insulation 2D / 3C / 4B Standard Door, 3D / 4C Double Door | 299 |
| 46090 | Neo Garden Shed Insulation 3D / 4C Standard Door, 4D Double Door | 359 |
| 46093 | Neo Garden Shed Insulation 4D Standard Door | 429 |
| 46057 | Neo Garden Shed Interior Panelling 1C Double Door | 1,029 |
| 46056 | Neo Garden Shed Interior Panelling 1C/3A Standard Door | 1,029 |
| 46061 | Neo Garden Shed Interior Panelling 1D Double Door | 1,059 |
| 46058 | Neo Garden Shed Interior Panelling 1D/4A Standard Door | 1,159 |
| 46060 | Neo Garden Shed Interior Panelling 2C/3B Double Door | 1,059 |
| 46059 | Neo Garden Shed Interior Panelling 2C/3B Standard Door | 1,159 |
| 46064 | Neo Garden Shed Interior Panelling 2D/4B Double Door | 1,159 |
| 46062 | Neo Garden Shed Interior Panelling 2D/4B Standard Door | 1,279 |
| 46065 | Neo Garden Shed Interior Panelling 3C Double Door | 1,159 |
| 46063 | Neo Garden Shed Interior Panelling 3C Standard Door | 1,279 |
| 46067 | Neo Garden Shed Interior Panelling 3D/4C Double Door | 1,349 |
| 46066 | Neo Garden Shed Interior Panelling 3D/4C Standard Door | 1,399 |
| 46069 | Neo Garden Shed Interior Panelling 4D Double Door | 1,439 |
| 46068 | Neo Garden Shed Interior Panelling 4D Standard Door | 1,539 |
| 47054 | Neo Glass Panel metallic dark grey | 199 |
| 47084 | Neo Glass Panel metallic quartz grey | 199 |
| 47034 | Neo Glass Panel metallic silver | 199 |
| 47072 | Neo Hook Set | 79 |
| 46081 | Neo Insulation 1A / 1B Double Door | 159 |
| 46082 | Neo Insulation 1B / 2A Standard Door, 2B / 1C Double Door | 169 |
| 46084 | Neo Insulation 2B / 1C / 3A Standard Door and 1D / 2C / 3B Double Door | 189 |
| 46051 | Neo Interior Panelling 1A ST | 749 |
| 46052 | Neo Interior Panelling 1B / 2A ST | 869 |
| 46053 | Neo Interior Panelling 1B DT | 779 |
| 46055 | Neo Interior Panelling 2B DT | 919 |
| 46054 | Neo Interior Panelling 2B ST | 1,029 |
| 47073 | Neo Suspension Basket | 79 |
| 47021 | Neo Tool Hanger 2-piece | 39 |
| 49032 | Neo bicycle holder "BikeHolder" | 69 |
| 47052 | Neo/Eco Tool Holder, metallic dark grey | 39 |
| 47082 | Neo/Eco Tool Holder, metallic quartz grey | 39 |
| 47032 | Neo/Eco Tool Holder, metallic silver | 39 |
| 47024 | PV mounting system for Neo | 89 |
| 45040 | Shelves Neo 2 pieces per package | 89 |
| 45060 | Shelves Neo 2 pieces per package, deep | 99 |
| 45050 | Shelves Neo 4 pieces per package | 109 |
| 85026 | Side Canopy for Neo Garden Shed size 2A/2B/2C/2D metallic dark grey | 2,409 |
| 87026 | Side Canopy for Neo Garden Shed size 2A/2B/2C/2D metallic quartz grey | 2,409 |
| 81026 | Side Canopy for Neo Garden Shed size 2A/2B/2C/2D metallic silver | 2,409 |
| 85036 | Side Canopy for Neo Garden Shed size 3A/3B/3C/3D metallic dark grey | 3,009 |
| 87036 | Side Canopy for Neo Garden Shed size 3A/3B/3C/3D metallic quartz grey | 3,009 |
| 81036 | Side Canopy for Neo Garden Shed size 3A/3B/3C/3D metallic silver | 3,009 |
| 85046 | Side Canopy for Neo Garden Shed size 4A/4B/4C/4D metallic dark grey | 3,409 |
| 87046 | Side Canopy for Neo Garden Shed size 4A/4B/4C/4D metallic quartz grey | 3,409 |
| 81046 | Side Canopy for Neo Garden Shed size 4A/4B/4C/4D metallic silver | 3,409 |
| 85028 | Side Wall for Side Canopy for Neo Garden Shed size 2A/2B/2C/2D metallic dark grey | 719 |
| 87028 | Side Wall for Side Canopy for Neo Garden Shed size 2A/2B/2C/2D metallic quartz grey | 719 |
| 81028 | Side Wall for Side Canopy for Neo Garden Shed size 2A/2B/2C/2D metallic silver | 719 |
| 85038 | Side Wall for Side Canopy for Neo Garden Shed size 3A/3B/3C/3D metallic dark grey | 819 |
| 87038 | Side Wall for Side Canopy for Neo Garden Shed size 3A/3B/3C/3D metallic quartz grey | 819 |
| 81038 | Side Wall for Side Canopy for Neo Garden Shed size 3A/3B/3C/3D metallic silver | 819 |
| 85048 | Side Wall for Side Canopy for Neo Garden Shed size 4A/4B/4C/4D metallic dark grey | 919 |
| 87048 | Side Wall for Side Canopy for Neo Garden Shed size 4A/4B/4C/4D metallic quartz grey | 919 |
| 81048 | Side Wall for Side Canopy for Neo Garden Shed size 4A/4B/4C/4D metallic silver | 919 |
| 43965 | SmartBase Neo 3C | 2,509 |
| 43970 | SmartBase Neo 3D/4C | 2,889 |
| 43955 | SmartBase Neo Garden Shed 1C/3A | 1,449 |
| 43956 | SmartBase Neo Garden Shed 1D/4A | 1,679 |
| 43960 | SmartBase Neo Garden Shed 2C/3B | 1,779 |
| 43962 | SmartBase Neo Garden Shed 2D/4B | 2,119 |
| 43974 | SmartBase Neo Garden Shed 4D | 3,469 |
| 43950 | SmartBase for Neo Garden Shed, size 1A | 1,049 |
| 43954 | SmartBase for Neo Garden Shed, size 1B/2A | 1,199 |
| 43455 | SmartBasePLUS Neo 1C/3A | 1,999 |
| 43456 | SmartBasePLUS Neo 1D/4A | 2,219 |
| 43418 | SmartBasePLUS Neo 2B | 1,829 |
| 43462 | SmartBasePLUS Neo 2D/4B | 2,699 |
| 43465 | SmartBasePLUS Neo 3C | 2,999 |
| 43470 | SmartBasePLUS Neo 3D/4C | 3,849 |
| 43474 | SmartBasePLUS Neo 4D | 4,239 |
| 43460 | SmartBasePLUS Neo Garden Shed 2C/3B | 2,449 |
| 49052 | Standard BikeLift for Neo garden shed metallic dark grey | 519 |
| 41001 | Threshold Access Ramp Neo Garden Shed | 99 |

## Default configuration (as loaded from the find endpoint)

Master parameters: `{"bodenplatte": "false", "canopy": "none", "color": "biohort:dunkelgrau_metallic", "color_door": "biohort:dunkelgrau_metallic", "color_master": "biohort:dunkelgrau_metallic", "color_roof_door": "biohort:dunkelgrau_metallic", "depth_for_inner_measurment": "1955.00", "front_door_status": "2", "front_double_to_single_door": "0", "fullHeightOccupations_front": "[101.00,100.00,100.00,100.00,100.00,100.00,102.00,0.00,0.00,0.00,0.00,0.00]", "fullHeightOccupations_left": "[0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00]", "fullHeightOccupations_rear": "[0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00]", "fullHeightOccupations_right": "[0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00]", "fundament": "bodenrahmen", "geratehalterCount": "0", "house_has_double_door": "1", "index": "0.00", "index_X": "0.00", "index_X_floraboard": "0.00", "index_X_panel": "0.00", "index_X_value": "0.00", "index_Z": "0.00", "interior_panelling": "no", "isolation": "no", "left_door_status": "0", "left_double_to_single_door": "0", "number_of_shelves_260": "0", "number_of_shelves_445": "0", "preferredDoorType": "2", "rear_door_status": "0", "rear_double_to_single_door": "0", "regenfallrohr": "rear", "right_door_status": "0", "right_double_to_single_door": "0", "showDoorArea": "0", "size": "4", "total_front_back_panels": "7.00", "total_left_right_panels": "7.00", "view": "all", "view2": "all", "werkzeugCount": "0", "werkzeugCount_back": "0", "werkzeugCount_front": "0", "werkzeugCount_left": "0", "werkzeugCount_right": "0", "width_for_inner_measurment": "1955.00"}`

Children placed by default: biohort:neo_door

Part list stored with the default configuration (find endpoint, prices may be older than live):

- 41040 ALU-Bodenrahmen x1 GBP 202.9 Größe: 2B, 4
- 85063 Gerätehaus Neo 2B dunkelgrau-metallic Doppeltür x1 GBP 3249 Dach- und Türfarbe: Dunkelgrau-metallic; Türoption: Doppeltür; Größe: 2B; Wandfarbe: Dunkelgrau-metallic
