# CasaNova - Biohort's Roomle configurator

Configurator: https://www.biohort.com/gb-en/r/konfigurator/FF4232?country_id=gb  
Roomle master component: `biohort:CasaNova_Master` (label "None")  
Default configuration id: `biohort:CasaNova_Master:2632C3D0CD7357D8F7339DA0A023F0C987728931661D5F12DBA5A326FF499CEA`  
Captured 13 Oct 2026. Prices are GBP **including 20% VAT**, "price valid in GB", per unit (the basket total is the sum of unit price x quantity).

## What the shopper sees (UI walk-through, desktop 1440 px)

Same shell: canvas left, panel right, steps **Sizes & Colours -> Door -> Foundation -> Accessories**, Biohort button row and live total below. CasaNova is the premium flat-roof outbuilding; its Roomle model is a separate family (`CasaNova_*` components) with its own parameter names (`Size`, `Material`, `FloorFrame`...).

1. **Sizes & Colours**
   - Size dropdown, 9 sizes: 3 x 2 m, 3 x 3 m, 3 x 4 m (default in this configuration; component default is 4 x 6 m), 3 x 5 m, 3 x 6 m, 4 x 2 m, 4 x 4 m, 4 x 5 m, 4 x 6 m.
   - Colour swatches: Metallic dark grey (default), Metallic quartz grey. (No silver.)
2. **Door**
   - View: whole house / show open view.
   - Exterior accessory: **door** (`CasaNova_Tor`, a wide gate/garage-style door; only for depth > 2 m; option "electric door opener" with/without, not on 3 x 3 m).
   - Door variations (tiles): additional door, 2nd door wing, Glass Additional Door, Glass Double Door Panel, Glass door insert. Also available as add-ons: standard door and Glass Standard Door when the building has none.
   - Each door has **door hinge** right / left and **door configuration** metal / glass door insert (glass only with certain hinge sides). The hinge side of the standard door is part of the building SKU (master script: `HingeSide=='Rechts'` vs left gives e.g. 51010 vs 51014).
3. **Foundation**: floor frame with / without (default without); floor plate with / without only when floor frame = with. No SmartBase options in CasaNova.
4. **Accessories**
   - View dropdown.
   - Coated roof stayer: with / without (with = grey-white coated roof support, e.g. 50064 GBP 329 for 3 x 4 / 4 x 4).
   - Double acrylic glass: with / without (e.g. 50023 Double Glazed Acrylic Glass 3x4 GBP 319).
   - Rain water downpipe: back side (default) / front side.
   - Interior accessory: shelf set of 2 24.5 cm, shelf set of 2 43.5 cm, hook set, electric mounting panel, "+5 Show all" (also Electric Mounting Panel coated, foldable table, bicycle hanger bikeMax, Bike Lift (swivelling / non-swivelling), sauna module).
   - Exterior accessory: glass element, tilt and turn window (hinge right/left), preparation for external light.
   - Sauna module door stop left / right (not on 3 x 2 m or 4 x 2 m, one per building).

## Prices observed live (GBP inc VAT)

| Configuration | Part list | Total |
|---|---|---|
| Default: 3 x 4 m metallic dark grey, standard door, no floor frame, downpipe back | 52012 CasaNova Outbuilding 3 x 4 m metallic dark grey 11,569 | **11,569** |
| + double acrylic glass | + 50023 Double Glazed Acrylic Glass 3x4 (no sliding function) 319 | 11,888 |
| + coated roof stayer | + 50064 CasaNova Coated Roof Support 3 x 4/4 x 4 grey white 329 | 12,217 |

## Tools and features

Same Roomle toolbar and Biohort buttons as HighLine.

## UX weaknesses

- The gate is labelled just "door" next to "additional door", which is ambiguous.
- Hinge side and glass inserts are only reachable by clicking a door in 3D; they are not in the step panel.
- Glass options depend on hinge side with no explanation when they disappear.
- Five-figure building price with no finance, delivery or installation information inside the configurator.

## Steps (Roomle parameter groups, in order)

1. **Sizes & Colours** (`color_size_group`)
2. **Door** (`door_group`)
3. **Foundation** (`foundation_group`)
4. **Accessories** (`extra_group`)

## Every parameter on the master component

Machine source: `raw/casanova-component.json` (`component.configuration` is a JSON string). `visible`/`enabled`/`condition` are Roomle script expressions evaluated against the other parameters. Parameters with `visible=false` are internal (they drive geometry, counts and SKUs) and are listed only once at the end.

### Sizes & Colours

- **size** `Size` (String), default `46`, sort None
  - values: `32` 3 x 2 m; `33` 3 x 3 m; `34` 3 x 4 m; `35` 3 x 5 m; `36` 3 x 6 m; `42` 4 x 2 m; `44` 4 x 4 m; `45` 4 x 5 m; `46` 4 x 6 m
- **colour** `Material` (Material), default `biohort:dunkelgrau_metallic`, sort None
  - values: `biohort:dunkelgrau_metallic`; `biohort:quarzgrau_metallic`

### Door

- **view** `view2` (String), default `all`, sort 1, visible when `showView2`
  - values: `all` whole house; `geoffnet` show open view

### Foundation

- **floor frame** `FloorFrame` (String), default `Ohne`, sort None
  - values: `Mit` with; `Ohne` without
- **floor plate** `FloorPlate` (String), default `Ohne`, sort None, visible when `(FloorFrame=='Mit')`
  - values: `Mit` with; `Ohne` without

### Accessories

- **coated roof stayer** `Dachsteher` (String), default `biohort:Aluminum`, sort None
  - values: `biohort:inner_white` with; `biohort:Aluminum` without
- **double acrylic glass** `Acrylglas` (String), default `Ohne`, sort None
  - values: `Mit` with; `Ohne` without
- **rain water downpipe** `Regenfallrohr` (Integer), default `0`, sort None
  - values: `0` back side; `180` front side
- **view** `view` (String), default `all`, sort 1, visible when `showView`
  - values: `front` front wall; `rear` back wall; `left` left wall; `right` right wall; `roofless` without roof; `all` whole house; `geoffnet` Show open view

Internal (hidden) parameters: `HingeSide`, `standardDoorsCount`, `hasStandardDoor`, `hasZusatzTuer`, `has2ndDoorWing`, `hasTor`, `countOfRegalsteher`, `saunaCount`, `showDoorArea`, `partListSort`

## Add-on items (Roomle possibleChildren: dragged/docked onto the building)

Machine source: `raw/casanova-children.json` (items + their components). `condition` = when the item is offered.

| Item id | Label | Tab | Offered when | Preset params | Own visible parameters |
|---|---|---|---|---|---|
| `biohort:CasaNova_Kippfenster` | tilt and turn window | Accessories | always |  | door hinge `HingeSide` [Rechts=right, Links=left] |
| `biohort:CasaNova_glaselement` | glass element | Accessories | always |  |  |
| `biohort:CasaNova_Klapptisch` | foldable table | Accessories | always |  |  |
| `biohort:CasaNova_Regalboden_245` | shelf set of 2, 24.5 cm | Accessories | always | {'shelfsize': '245', 'occupySpaceLow': 3} |  |
| `biohort:CasaNova_Regalboden_435` | shelf set of 2, 43.5 cm | Accessories | always | {'shelfsize': '435', 'occupySpaceLow': 4} |  |
| `biohort:CasaNova_Haken-Set` | hook set | Accessories | always |  |  |
| `biohort:CasaNova_bikeMax` | bicycle hanger 'bikeMax' | Accessories | always |  |  |
| `biohort:casanova_bike_lift` | Bike Lift | Accessories | `False` |  | Swivelling `swiveling` [1=Swivelling, 0=Non-swivelling] |
| `biohort:CasaNova_Elektro-Montagepanel` | electric mounting panel | Accessories | always |  | colour `material` |
| `biohort:CasaNova_Elektro-Montagepanel_Coated` | Electric Mounting Panel coated | Accessories | always | {'material': 'biohort:inner_white'} | colour `material` |
| `biohort:CasaNova_Standardtuer` | standard door | Door | `(standardDoorsCount==0)&&(!hasTor)` | {'isZusatzDoor': '0', 'doorElementType': 'metal'} | door hinge `HingeSide` [Rechts=right, Links=left]; door configuration `doorElementType` [metal=metal, glass=Glass door insert] |
| `biohort:CasaNova_2ndDoorWing` | 2nd door wing | Door | `((standardDoorsCount>0)||hasZusatzTuer>0)&&(true||((standardDoorsCount>0)*1+hasZusatzTuer>has2ndDoorWing))` |  | door hinge `HingeSide` [Rechts=right, Links=left]; door configuration `doorElementType` [metal=metal, glass=Glass door insert] |
| `biohort:CasaNova_Zusatztuer` | additional door | Door | `(standardDoorsCount>0)||(hasTor&&standardDoorsCount==0)` | {'isZusatzDoor': '1', 'doorElementType': 'metal'} | door hinge `HingeSide` [Rechts=right, Links=left]; door configuration `doorElementType` [metal=metal, glass=Glass door insert] |
| `biohort:CasaNova_Standardtuer_glass` | Glass Standard Door | Door | `(standardDoorsCount==0)&&(!hasTor)` | {'isZusatzDoor': '0', 'doorElementType': 'glass'} | door hinge `HingeSide` [Rechts=right, Links=left]; door configuration `doorElementType` [metal=metal, glass=Glass door insert] |
| `biohort:CasaNova_2ndDoorWing_glass` | Glass Double Door Panel | Door | `((standardDoorsCount>0)||hasZusatzTuer>0)&&(true||((standardDoorsCount>0)*1+hasZusatzTuer>has2ndDoorWing))` | {'doorElementType': 'glass'} | door hinge `HingeSide` [Rechts=right, Links=left]; door configuration `doorElementType` [metal=metal, glass=Glass door insert] |
| `biohort:CasaNova_Zusatztuer_glass` | Glass Additional Door | Door | `(standardDoorsCount>0)||(hasTor&&standardDoorsCount==0)` | {'isZusatzDoor': '1', 'doorElementType': 'glass'} | door hinge `HingeSide` [Rechts=right, Links=left]; door configuration `doorElementType` [metal=metal, glass=Glass door insert] |
| `biohort:CasaNova_Tor` | door | Door | `(!hasTor)&&sizeD>2` |  | electric door opener `TorAntrieb` [Mit=with, Ohne=without] |
| `biohort:CasaNova_Lights` | preparation for external light | Accessories | always |  |  |
| `biohort:CasaNova_Saunamodul_left` | sauna module door stop left | Accessories | `saunaCount==0&&(!in(Size,'32','42'))` | {'Placement': 'Links'} | door hinge `Placement` [Rechts=right, Links=left] |
| `biohort:CasaNova_Saunamodul_right` | sauna module door stop right | Accessories | `saunaCount==0&&(!in(Size,'32','42'))` | {'Placement': 'Rechts'} | door hinge `Placement` [Rechts=right, Links=left] |

## Bill of materials logic (subComponents -> SKUs)

Each sub-component is counted by `numberInPartList` and gets its SKU from its own `articleNr` script. SKUs that appear literally in the scripts are priced below; codes built by concatenation are shown as script text. Machine source: `raw/casanova-subcomponents.json`.

Master articleNr script (SKU of the building itself):

```
if(Material=='biohort:silber_metallic'){ if(Size=='32'){ if(HingeSide=='Rechts'){ articleNr='51010' }else{ articleNr='51014' } } if(Size=='33'){ if(HingeSide=='Rechts'){ articleNr='51011' }else{ articleNr='51015' } } if(Size=='34'){ if(HingeSide=='Rechts'){ articleNr='51012' }else{ articleNr='51016' } } if(Size=='35'){ if(HingeSide=='Rechts'){ articleNr='51013' }else{ articleNr='51017' } } if(Size=='36'){ if(HingeSide=='Rechts'){ articleNr='51018' }else{ articleNr='51019' } } if(Size=='42'){ if(HingeSide=='Rechts'){ articleNr='51020' }else{ articleNr='51024' } } if(Size=='44'){ if(HingeSide=='Rechts'){ articleNr='51022' }else{ articleNr='51026' } } if(Size=='45'){ if(HingeSide=='Rechts'){ articleNr='51023' }else{ articleNr='51027' } } if(Size=='46'){ if(HingeSide=='Rechts'){ articleNr='51028' }else{ articleNr='51029' } } } if(Material=='biohort:dunkelgrau_metallic'){ if(Size=='32'){ if(HingeSide=='Rechts'){ articleNr='52010' }else{ articleNr='52014' } } if(Size=='33'){ if(HingeSide=='Rechts'){ articleNr='52011' }else{ articleNr='52015' } } if(Size=='34'){ if(HingeSide=='Rechts'){ articleNr='52012' }else{ articleNr='52016' } } if(Size=='35'){ if(HingeSide=='Rechts'){ articleNr='52013' }else{ articleNr='52017' } } if(Size=='36'){ if(HingeSide=='Rechts'){ articleNr='52018' }else{ articleNr='52019' } } if(Size=='42'){ if(HingeSide=='Rechts'){ articleNr='52020' }else{ articleNr='52024' } } if(Size=='44'){ if(HingeSide=='Rechts'){ articleNr='52022' }else{ articleNr='52026' } } if(Size=='45'){ if(HingeSide=='Rechts'){ articleNr='52023' }else{ articleNr='52027' } } if(Size=='46'){ if(HingeSide=='Rechts'){ articleNr='52028' }else{ articleNr='52029' } } } if(Material=='biohort:quarzgrau_metallic'){ if(Size=='32'){ if(HingeSide=='Rechts'){ articleNr='53010' }else{ articleNr='53014' } } if(Size=='33'){ if(HingeSide=='Rechts'){ articleNr='53011' }else{ articleNr='53015' } } if(Size=='34'){ if(HingeSide=='Rechts'){ articleNr='53012' }else{ articleNr='53016' } } if(Size=='35'){ if(HingeSide=='Rechts'){ articleNr='53013' }else{ articleNr='53017' } } if(Size=='36'){ if(HingeSide=='Rechts'){ articleNr='53018' }else{ articleNr='53019' } } if(Size=='42'){ if(HingeSide=='Rechts'){ articleNr='53020' }else{ articleNr='53024' } } if(Size=='44'){ if(HingeSide=='Rechts'){ articleNr='53022' }else{ articleNr='53026' } } if(Size=='45'){ if(HingeSide=='Rechts'){ articleNr='53023' }else{ articleNr='53027' } } if(Size=='46'){ if(HingeSide=='Rechts'){ articleNr='53028' }else{ articleNr='53029' } } }
```

| Sub-component | Component | Quantity rule | SKUs named in its articleNr script |
|---|---|---|---|
| BODENRAHMEN | `biohort:CasaNova_Alu-Bodenrahmen` | `FloorFrame=='Mit'` | 50010 (Floor Frame 3x2 GBP 379), 50011 (Floor Frame 3x3 GBP 439), 50012 (Floor Frame 3x4 GBP 499), 50013 (Floor Frame 3x5 GBP 559), 50014 (Floor Frame 3x6 GBP 629), 50015 (Floor Frame 4x2 GBP 439), 50016 (Floor Frame 4x4 GBP 559), 50017 (Floor Frame 4x5 GBP 629), 50018 (Floor Frame 4x6 GBP 679) |
| BODENPLATTE | `biohort:CasaNova_Alu-Bodenplatte` | `FloorFrame=='Mit'&&FloorPlate=='Mit'` | 50030 (Floor Panel 3 x 2 GBP 559), 50031 (Floor Panel 3 x 3 GBP 809), 50032 (Floor Panel 3 x 4 GBP 1079), 50033 (Floor Panel 3 x 5 GBP 1359), 50034 (Floor Panel 3 x 6 GBP 1589), 50035 (Floor Panel 4 x 2 GBP 759), 50036 (Floor Panel 4 x 4 GBP 1439), 50037 (Floor Panel 4 x 5 GBP 1809), 50038 (Floor Panel 4 x 6 GBP 1979) |
| CasaNova_Acrylglas | `biohort:CasaNova_Acrylglas` | `Acrylglas=='Mit'` | 50021 (Double Glazed Acrylic Glass 3x2 (no sliding function) GBP 229), 50022 (Double Glazed Acrylic Glass 3x3 (no sliding function) GBP 269), 50023 (Double Glazed Acrylic Glass 3x4 (no sliding function) GBP 319), 50024 (Double Glazed Acrylic Glass 3x5 (no sliding function) GBP 369), 50025 (Double Glazed Acrylic Glass 3x6 (no sliding function) GBP 409), 50026 (Double Glazed Acrylic Glass 4x2 (no sliding function) GBP 269), 50027 (Double Glazed Acrylic Glass 4x4 (no sliding function) GBP 369), 50028 (Double Glazed Acrylic Glass 4x5 (no sliding function) GBP 409), 50029 (Double Glazed Acrylic Glass 4x6 (no sliding function) GBP 449) |
| CORNER_SOLID | `biohort:CasaNova_Angle_wall` | `None` |  |
| dachsteher | `biohort:CasaNova_Dachsteher` | `Dachsteher=='biohort:inner_white'` | 50062 (CasaNova Coated Roof Support 3 x 2/4 x 2 grey white GBP 259), 50063 (CasaNova Coated Roof Support 3 x 3 grey white GBP 259), 50064 (CasaNova Coated Roof Support 3 x 4/4 x 4 grey white GBP 329), 50065 (CasaNova Coated Roof Support 3 x 5/4 x 5 grey white GBP 359), 50066 (CasaNova Coated Roof Support 3 x 6/4 x 6 grey white GBP 389) |
| CORNER_WINDOW_LEFT | `biohort:CasaNova_Angle_walls` | `None` |  |
| CORNER_WINDOW_RIGHT | `biohort:CasaNova_Angle_walls` | `None` |  |
| CORNER_WINDOW_BOTH | `biohort:CasaNova_Angle_walls` | `None` |  |
| WALL_SOLID | `biohort:CasaNova_wall_section` | `None` | 51038 (not in GB price list), 52038 (Glass Element metallic dark grey GBP 1439), 53038 (Glass Element metallic quartz grey GBP 1439) |
| WALL_WINDOW_RIGHT | `biohort:CasaNova_wall_section` | `None` | 51038 (not in GB price list), 52038 (Glass Element metallic dark grey GBP 1439), 53038 (Glass Element metallic quartz grey GBP 1439) |
| WALL_WINDOW_LEFT | `biohort:CasaNova_wall_section` | `None` | 51038 (not in GB price list), 52038 (Glass Element metallic dark grey GBP 1439), 53038 (Glass Element metallic quartz grey GBP 1439) |
| WALL_WINDOW_BOTH | `biohort:CasaNova_wall_section` | `None` | 51038 (not in GB price list), 52038 (Glass Element metallic dark grey GBP 1439), 53038 (Glass Element metallic quartz grey GBP 1439) |
| DACHSTEHER | `demoCatalogId:Placeholder_Cube` | `None` | script: `dev_placeholder` |
| ECKSTEHER | `demoCatalogId:Placeholder_Cube` | `None` | script: `dev_placeholder` |
| REGALSTEHER | `biohort:CasaNova_Regalsteher` | `countOfRegalsteher` | 50082 (CasaNova Support Rail (2 pieces) GBP 89) |
| IncludedStandartDoor | `biohort:CasaNova_Standardtuer_Inkl` | `(standardDoorsCount==0)&&(!hasTor)&&(hasZusatzTuer==0)` | script: `'IGNORE'` |
| ROOF | `biohort:CasaNova_Roofs` | `None` |  |
| REGENFALLROHR | `biohort:CasaNova_Regenfallrohr-Set` | `0` |  |

## GB price list: every SKU whose title contains "CasaNova"

From `raw/gb-configurator-prices.json` (the configurator's own `/api/ext/configurator/data` pricing; identical to the GB catalogue index for all 1,631 SKUs).

| SKU | Title | GBP inc VAT |
|---|---|---|
| 50062 | CasaNova Coated Roof Support 3 x 2/4 x 2 grey white | 259 |
| 50063 | CasaNova Coated Roof Support 3 x 3 grey white | 259 |
| 50064 | CasaNova Coated Roof Support 3 x 4/4 x 4 grey white | 329 |
| 50065 | CasaNova Coated Roof Support 3 x 5/4 x 5 grey white | 359 |
| 50066 | CasaNova Coated Roof Support 3 x 6/4 x 6 grey white | 389 |
| 50083 | CasaNova Electrical Mounting Panel  | 149 |
| 50084 | CasaNova Electrical Mounting Panel with Grey White Coating | 209 |
| 50080 | CasaNova Folding Table | 139 |
| 50087 | CasaNova Hook Set | 69 |
| 50097 | CasaNova Hook Set | 69 |
| 50055 | CasaNova Sectional Overhead Garage Door with electric motor  | 2,419 |
| 50051 | CasaNova Sectional Overhead Garage Door without electric motor  | 1,929 |
| 50082 | CasaNova Support Rail (2 pieces) | 89 |
| 52010 | CasaNova® Outbuilding 3 x 2 m metallic dark grey | 8,679 |
| 52014 | CasaNova® Outbuilding 3 x 2 m metallic dark grey | 8,679 |
| 53010 | CasaNova® Outbuilding 3 x 2 m metallic quartz grey | 8,679 |
| 53014 | CasaNova® Outbuilding 3 x 2 m metallic quartz grey | 8,679 |
| 52011 | CasaNova® Outbuilding 3 x 3 m metallic dark grey | 9,989 |
| 52015 | CasaNova® Outbuilding 3 x 3 m metallic dark grey | 9,989 |
| 53011 | CasaNova® Outbuilding 3 x 3 m metallic quartz grey | 9,989 |
| 53015 | CasaNova® Outbuilding 3 x 3 m metallic quartz grey | 9,989 |
| 52012 | CasaNova® Outbuilding 3 x 4 m metallic dark grey | 11,569 |
| 52016 | CasaNova® Outbuilding 3 x 4 m metallic dark grey | 11,569 |
| 53012 | CasaNova® Outbuilding 3 x 4 m metallic quartz grey | 11,569 |
| 53016 | CasaNova® Outbuilding 3 x 4 m metallic quartz grey | 11,569 |
| 52013 | CasaNova® Outbuilding 3 x 5 m metallic dark grey | 12,949 |
| 52017 | CasaNova® Outbuilding 3 x 5 m metallic dark grey | 12,949 |
| 53013 | CasaNova® Outbuilding 3 x 5 m metallic quartz grey | 12,949 |
| 53017 | CasaNova® Outbuilding 3 x 5 m metallic quartz grey | 12,949 |
| 52018 | CasaNova® Outbuilding 3 x 6 m metallic dark grey | 14,729 |
| 52019 | CasaNova® Outbuilding 3 x 6 m metallic dark grey | 14,729 |
| 53018 | CasaNova® Outbuilding 3 x 6 m metallic quartz grey | 14,729 |
| 53019 | CasaNova® Outbuilding 3 x 6 m metallic quartz grey | 14,729 |
| 52020 | CasaNova® Outbuilding 4 x 2 m metallic dark grey | 10,519 |
| 52024 | CasaNova® Outbuilding 4 x 2 m metallic dark grey | 10,519 |
| 53020 | CasaNova® Outbuilding 4 x 2 m metallic quartz grey | 10,519 |
| 53024 | CasaNova® Outbuilding 4 x 2 m metallic quartz grey | 10,519 |
| 52022 | CasaNova® Outbuilding 4 x 4 m metallic dark grey | 13,669 |
| 52026 | CasaNova® Outbuilding 4 x 4 m metallic dark grey | 13,669 |
| 53022 | CasaNova® Outbuilding 4 x 4 m metallic quartz grey | 13,669 |
| 53026 | CasaNova® Outbuilding 4 x 4 m metallic quartz grey | 13,669 |
| 52023 | CasaNova® Outbuilding 4 x 5 m metallic dark grey | 15,249 |
| 52027 | CasaNova® Outbuilding 4 x 5 m metallic dark grey | 15,249 |
| 53023 | CasaNova® Outbuilding 4 x 5 m metallic quartz grey | 15,249 |
| 53027 | CasaNova® Outbuilding 4 x 5 m metallic quartz grey | 15,249 |
| 52028 | CasaNova® Outbuilding 4 x 6 m metallic dark grey | 16,829 |
| 52029 | CasaNova® Outbuilding 4 x 6 m metallic dark grey | 16,829 |
| 53028 | CasaNova® Outbuilding 4 x 6 m metallic quartz grey | 16,829 |
| 53029 | CasaNova® Outbuilding 4 x 6 m metallic quartz grey | 16,829 |
| 50039 | Surcharge CasaNova Glass Door | 1,259 |
| 50090 | Threshold Access Ramp CasaNova DT | 229 |
| 50092 | Threshold Access Ramp CasaNova Overhead Sectional Door | 289 |

## Default configuration (as loaded from the find endpoint)

Master parameters: `{"Acrylglas": "Ohne", "Dachsteher": "biohort:Aluminum", "FloorFrame": "Ohne", "FloorPlate": "Ohne", "HingeSide": "Rechts", "Material": "biohort:dunkelgrau_metallic", "Regenfallrohr": "0", "Size": "34", "countOfRegalsteher": "0", "has2ndDoorWing": "0", "hasStandartDoor": "1", "hasTor": "0", "hasZusatzTuer": "0", "saunaCount": "0", "showDoorArea": "0", "view": "geoffnet"}`

Children placed by default: biohort:CasaNova_Doors_Master

Part list stored with the default configuration (find endpoint, prices may be older than live):

