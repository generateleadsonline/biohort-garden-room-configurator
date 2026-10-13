# Biohort metal garden buildings: geometry reference for three.js

Gathered 13 Oct 2026 from biohort.com product pages (/gb-en/p/...?country_id=gb; same content as the ot-en copies), their "Detailed dimensions" tables and sketches, the assembly manuals (Aufbauanleitungen), foundation plans (Fundamentplaene) and the CasaNova EN brochure.

How to read this
- [T] = measured: printed in Biohort's dimension table on the product page (letters A-P refer to that range's sketch in <range>/drawings/). Tables give cm; converted to mm here.
- [D] = measured: printed on a drawing or foundation plan PDF.
- [est] = estimated, by scaling pixels on a Biohort line drawing against a known [T] dimension, or by eye from a photo. Roughly ±15%. Rib pitch and panel width are never dimensioned anywhere, so every rib figure is [est].
- File names are relative to research/photos/. Original downloads and full manual renders are in the session scratchpad, not in the repo.
- The assembly manuals are pictorial, with part lengths only (e.g. profile "2510 mm"). The usable dimensions come from the website tables and the foundation plans.

## Shared facts (all six ranges)

- Colours. Swatch values sampled from Biohort's colour-chip images (_colours/Farben_Geraetehaus_Biohort.jpg, _colours/Farben_Ger%C3%A4tehaus_Europa.jpg). Render values are the median of a smooth door leaf in the per-colour product renders.

  | Published name | Swatch chip | Studio render | Render source |
  |---|---|---|---|
  | Silver-metallic | #c8c9cb | #c6c6c6 | highline/HighLine_H4_silber_metallic.webp (door) |
  | Quartz grey-metallic | #9fa0a2 | #8b8982 (slightly warm) | HighLine H4 door; AvantGarde A5 #8a8984; CasaNova #8e8e8c; Neo #777672 (wall in shade) |
  | Dark grey-metallic | #6b6c6e | #494949 | HighLine H4 door; AvantGarde A5 #4b4b4b; CasaNova #5e5e5e |
  | Dark green, Europa only | #396755 | #194e35 | europa/Europa_Gr3_dunkelgruen.webp |

  For three.js: swatch value as base colour, metalness ~0.3-0.5, roughness ~0.45. The finish has a fine metallic flake sheen, not mirror-like (highline/Edelstahl-Drueckergarnitur_HighLine_Detail.webp, panorama/Dachrinnenauslauf_Panorama_Detail.webp).
- Interior: HighLine is always grey white inside and its roof surface always metallic quartz grey, whatever the exterior colour (HighLine product text). The other ranges' interior photos also show grey-white walls (europa/29030_Europa_3_silber_Sujet.webp, neo/85063_Neo_2B_dunkelgrau_DT_Sujet.webp).
- Steel: galvanised (≥150 g/m² zinc), polyamide enamel coated; stainless screws and hinges. Standard handle: stainless lever on a round rose plus a separate round cylinder rose below (highline/Edelstahl-Drueckergarnitur_HighLine_Detail.webp). Europa uses a T-handle instead.
- Daylight (product-page comparison table): Europa window accessory only; AvantGarde front skylight; Panorama and HighLine all-round skylight; Neo glass panel in the door plus accessory glass panels; CasaNova all-round skylight plus accessory window and glass element.
- Floor: optional aluminium floor frame (Bodenrahmen) with aluminium chequer-plate floor panels (Bodenplatte), visible in interior photos (europa/29030..., casanova/53012...). Otherwise walls sit on a slab or point foundations (HighLine manual p8; highline/drawings/manual-YH025010-p9-foundation.png).

---

## 1. HighLine (flat-roof shed)

Sources: product-page table and sketches (highline/drawings/HighLine_Sicht_Front_Seite.png, HighLine_Sicht_Grundriss.png, highline-groessen2024.png, HighLine_Sicht_Front_Seite_Seitendach.png); manual YH025010 p9 and p11; foundation plan punktfundamentplan_ghh_h1.png; photos as named.

Sizes [T] (mm)

| Size | HS | H1 | H2 | H3 | H4 | H5 | H6 |
|---|---|---|---|---|---|---|---|
| A wall width, door wall (excl. overhang) | 1340 | 2540 | 2540 | 2540 | 2540 | 2540 | 2940 |
| B wall depth | 2540 | 1340 | 1740 | 2140 | 2540 | 2940 | 2940 |
| N width incl. corner profiles | 1370 | 2570 | 2570 | 2570 | 2570 | 2570 | 2970 |
| K roof width | 1550 | 2750 | 2750 | 2750 | 2750 | 2750 | 3150 |
| L roof length | 2750 | 1550 | 1950 | 2350 | 2750 | 3150 | 3150 |
| J wall left of door | 270 | 1270 | 1270 | 1270 | 1270 | 1270 | 1670 |
| H wall right of door | 310 | 510 | 510 | 510 | 510 | 510 | 510 |

All sizes [T]: C (ground to fascia underside) 2095; D fascia 125; E overall 2220. Door clearance 760 x 1820; double door 1560 (data sheet 1550 x 1820). M door swing 800. P downpipe projection 90.
Foundations [D] (manual p9): H3 2570x2170, H4 2570x2570, H5 2570x2970, H6 2970x2970.

Roof
- Flat roof, box-section fascia, drawn flat in the elevation sketch. Gutter integrated in the fascia, leaf traps both sides (product text; HighLine_Dachrinne_mit_Laubfaenger).
- Overhang (K-N)/2 = 90 mm every side, all sizes [T].
- Ventilation slots in a row along the fascia underside (Ventilationskiemen_HighLine_Detail.webp).
- Gutter outlet: hose spout from the fascia corner beside the post (Dachrinnenauslauf_HighLine_Detail.webp).
- Optional downpipe: round, down the corner, 45-degree outlet elbow at the base, 90 projection (Regenfallrohr_HighLine_Detail.webp; [T] P).

Skylight
- Continuous clear acrylic band on all four sides, wall-panel top to fascia underside, slim mullions about every 0.5-0.7 m [est] (88039_HighLine_H2_quarzgrau_DT_Sujet.webp, biohort-highline-202505.jpg).
- Band height ≈190-210 mm [est]: wall top ≈1890, fascia underside 2095 [T]. Measured on HighLine_Sicht_Front_Seite.png at 6.83 mm/px, scaled from E = 2220.

Walls
- Vertical panels with narrow raised V-ribs (not trapezoid).
- Rib pitch ≈75-80 mm [est]: 15 ribs across J = 1270 on the front sketch. Ribs fall in groups of four repeating about every 320 mm, with a slightly wider gap between groups (probably the panel joint) [est]. Door leaf smooth outside (biohort-highline-202505.jpg).
- Corners: round tubular posts ≈60-70 mm dia [est], full height to the roof, carrying it through the glazing band (Ventilationskiemen_HighLine_Detail.webp, sketch).
- Base: thin aluminium-coloured strip ≈30-40 mm high [est] (Regenfallrohr_HighLine_Detail.webp).

Doors
- Standard: single hinged leaf, hinge on the right (product text); handle on the left edge at ≈1000 [est, sketch].
- Leaf ≈800 wide [est] for a 760 [T] clearance; ≈1850 tall [est], up to the wall top.
- Smooth outside, ribbed inside face, 3-point lock (83039_HighLine_H2_silber_DT_offen_Sujet.webp).
- Gas-spring closer at the top of the leaf (Oberlichte_Gasdruckfeder_HighLine_Detail.webp).
- Position: on the A wall, offset right (J 1270 | door | H 510), per the plan sketch. Door and wall elements are interchangeable, so the door can go in any wall (product text "...the standard door can be installed in any side wall"; manual p11 manual-YH025010-p11-door-positions.png).
- Double door: two equal leaves (88039_HighLine_H2_quarzgrau_DT_Sujet.webp, 83039...).

Variants
- Side canopy (Seitendach) on the gutter side, from size H2: same flat roof extended sideways on two slim square posts.
- Total roof width K1 [T]: H1-H5 S 4140 / L 5480; H6 4550 / 5880. So the canopy adds about 1390 (S) or 2730 (L) (84069_84066_HighLine_H5_dunkelgrau_DT_Seitendach_L_offen_Sujet.webp, HighLine_Sicht_Front_Seite_Seitendach.png).
- Optional canopy side and rear walls exist (photo kept in the scratchpad only).

Interior: grey-white walls with ribs visible, steel frame, quartz-grey roof (83039...offen).

Modelling recipe (H4; swap A/B/K/L for other sizes)
1. Base strip: box 2570 x 2570 x 35.
2. Corner posts: four cylinders r 32, h 2095, centred on the corners of the 2540 x 2540 wall square.
3. Walls: four panels from y = 35 to 1890 (use 20 mm boxes). Normal/displacement map, or thin rib extrusions 15 wide x 4 deep, at 78 pitch.
4. Door: 800 x 1850 smooth leaf in the front wall, 1270 from the left post.
5. Glazing band: four clear acrylic panes, y = 1890 to 2095, mullions 30 x 30 about every 600.
6. Fascia/roof: box 2750 x 125 x 2750 at y = 2095-2220 with a top cap; row of 15 x 60 slots in the underside, 40 in from the edge.
7. Optional: 80 round downpipe at a corner; side-canopy roof slab 125 deep on two 70 x 70 posts.

---

## 2. Europa (classic apex shed)

Sources: table and sketches (europa/drawings/Europa_Abmessungen.png, Europa_Groesse_Skizzen.png); photos as named.

Sizes [T] (mm)

| Size | 1 | 2 | 2A | 3 | 4 | 4A | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|---|---|
| A wall width (door/gable wall) | 1520 | 1520 | 2240 | 2240 | 2240 | 2960 | 2960 | 2240 | 2960 |
| B wall depth | 800 | 1520 | 800 | 1520 | 2240 | 1520 | 2240 | 2960 | 2960 |
| K roof width | 1720 | 1720 | 2440 | 2440 | 2440 | 3160 | 3160 | 2440 | 3160 |
| L roof length | 840 | 1560 | 840 | 1560 | 2280 | 1560 | 2280 | 3000 | 3000 |
| D rise, gutter to ridge | 155 | 155 | 220 | 220 | 220 | 285 | 285 | 220 | 285 |
| E overall height | 1965 | 1965 | 2030 | 2030 | 2030 | 2095 | 2095 | 2030 | 2095 |

All sizes [T]: C ground to gutter 1810; door clearance 1350 x 1710 (text says 135 x 170); M door swing 700.

Roof
- Low-pitch apex (gable) roof; ridge runs front to back, so the gable faces the door (Europa_Abmessungen.png front view; 29030_Europa_3_silber_Sujet.webp).
- Pitch ≈10.2 degrees, calculated from the table (D rises 65 per extra 360 of half-width; 155/860 gives the same).
- Overhangs [T]: eaves (sides) (K-A)/2 = 100 mm; gable ends (L-B)/2 = 20 mm.
- Triangular gable "pediment" plate with an embossed biohort logo badge at the ridge (Giebel_Europa_Detail.webp).
- Integrated eaves gutter on both long sides, 1" hose outlet at the corner (Dachrinnenauslauf_Europa_Detail.webp).
- Roof surface: smooth sheet with standing seams [est from photo].

Walls
- Vertical ribbed panels. Width steps are 720; door positions step 360 (H/J side widths 85 / 445 / 805 / 1525).
- On the side elevation the rib pattern repeats every ≈720: about four narrow ribs ~85-90 apart plus one ~180 plain band [est, Europa_Abmessungen.png at ~16 mm/px].
- Corners: L-section angles, ~40 flange [est] (Anbauwinkel_Europa_Detail.webp).

Doors
- Always a double hinged door (comparison table), centred or offset on the gable wall; clearance 1350 x 1710 [T]; hinged at both outer edges.
- T-handle turn lock with cylinder near the meeting edge at ≈1000 [est] (Drehgriff-Zylinderschloss_Europa_Detail.webp). Wind hook to hold the door open (Windhaken_Europa_Detail.webp). Leaf faces ribbed like the walls (23030_Europa_3_dunkelgruen_Sujet.webp).
- Additional door is optional (product text).

Variants
- Side canopy [T]: N 1445 wide, O 1445 to support, P overhang 100, R height 1560. Lean-to on the gutter side with posts (Europa_Abmessungen.png "OPTION").
- Sizes 2A and 4A are shallow (800 / 1520 deep) for standing against a house wall.

Modelling recipe (size 3: 2240 x 1520)
1. Walls: 2240 x 1520, height 1810, as panels; rib extrusions 15 x 5 at 88 pitch, with a 180 plain band every 720.
2. Gable infill: triangles front and back, base 2240, rise 200.
3. Roof: two planes from the eave at y = 1810 to the ridge at y = 2030, each 1220 on plan (K/2), 1560 long, 10.2 degrees.
4. Gutters: 30 x 30 boxes on both eaves.
5. Ridge cap and gable badge plate.
6. Doors: two leaves 675 x 1710 in a 1350 opening, centred on the front.
7. Corners: four L-angles 40 x 40 x 1810.

---

## 3. Neo (smooth-wall flat-roof shed)

Sources: table and sketches (neo/drawings/Neo_Skizze_Einreichplan.png, neo-groessen.png); foundation plan betonfundament_gesamt_ghn_1a.png; photos as named.

Sizes [T]
- Width A and depth B each 1700 / 2260 / 2820 / 3380: a 560 mm module, 16 sizes (1A-4D).
- Codes: the letter (A/B/C/D) is the width A, the digit (1/2/3/4) is the depth B. 1A = 1700 x 1700, 4D = 3380 x 3380.
- Roof K = A + 95, L = B + 95, so overhang 47.5 per side.
- Heights: C ground to roof flashing 2050; D fascia 155; E overall 2205.
- Doors: clearance F 800 (data sheet 830 x 2000); H right side 330; J left side A - 1130.
- G downpipe centres A - 305 (1395-3075); P downpipe projection 80.

Roof
- Flat, deep square-edged fascia with a small edge radius (87034_Neo_2B_quarzgrau_ST_Rendering.jpg).
- Integrated gully; optional round corner downpipe with outlet elbow (Neo_Regenfallrohr_Quarzgrau.webp); gutter sides marked on the size sketch.
- No skylight band. Inside: wooden board ceiling on steel roof beams (Neo_Deckenaufbau.webp).

Walls
- Smooth flat panels, fine vertical seams, no ribs.
- Seam spacing ≈280 mm [est]: every 41 px at ~7 mm/px on the side elevation of Neo_Skizze_Einreichplan.png; half the 560 module.
- Corners: rounded profiles ≈40-50 radius [est] (Neo_Standardtuer_Lichtelement.webp).
- Base: galvanised frame visible at the bottom (Neo_Regenfallrohr_Quarzgrau.webp).

Doors
- Standard door: smooth leaf with one narrow vertical acrylic strip ≈120-150 wide x ≈1500 tall [est], toward the hinge (right) edge (Neo_Skizze_Einreichplan.png, 87034...ST_Rendering.jpg).
- Three thin horizontal grooves on the leaf (sketch); lever handle and cylinder on the left edge at ≈1000 [est].
- Opening 830 x 2000 [T], hinge right; gas-spring closer.
- The standard door can also go on the side wall. Double door 1670 x 2000 from width 2360, also possible on the side (product text).
- Double-door leaves smooth outside, ribbed inside (85063_Neo_2B_dunkelgrau_DT_Sujet.webp).

Variants
- Light panels (Lichtpaneele): full-height translucent acrylic strips, one panel wide (~150-250 [est]), replacing wall panels (82048_Neo_2D_silber_DT_Lichtpaneele_Sujet.webp, 89008...).
- Side canopy on the gutter side from 2A, optional side and rear walls (85063_85026_Neo_Seitendach_2B_dunkelgrau_DT_Sujet.webp).
- Optional interior panelling and insulation.

Modelling recipe (2B: 2260 x 2260)
1. Walls: 2260 square, height 2050; smooth panels with a 1 mm groove every 280.
2. Corners: rounded posts r 45.
3. Roof: slab 2355 x 2355 x 155, 10 mm edge fillet, at y = 2050.
4. Door: leaf ≈880 x 2020 at x = J; 130 x 1500 glass strip 80 in from the hinge edge; 3 grooves.
5. Optional: light-panel strips; 80 round downpipe.

---

## 4. AvantGarde (pent/mono-pitch shed)

Sources: table and sketches (avantgarde/drawings/AvantGarde_Skizze_Front.png, _Seite.png, _Draufsicht.png, _Groessen.png); foundation plan betonfundament_gesamt_gha_a2.png; photos as named.

Sizes [T] (mm)

| Size | A1 | A2 | A3 | A4 | A5 | A6 | A7 | A8 |
|---|---|---|---|---|---|---|---|---|
| A front width | 1740 | 1740 | 1740 | 1740 | 2540 | 2540 | 2540 | 2540 |
| B depth | 1740 | 2140 | 2540 | 3340 | 1740 | 2140 | 2540 | 3340 |
| K roof width | 1800 | 1800 | 1800 | 1800 | 2600 | 2600 | 2600 | 2600 |
| L roof length | 2200 | 2550 | 3000 | 3800 | 2200 | 2550 | 3000 | 3800 |
| J left of door | 490 | 490 | 490 | 490 | 1290 | 1290 | 1290 | 1290 |
| D | 250 | 250 | 250 | 290 | 250 | 250 | 250 | 290 |
| E overall height | 2180 | 2180 | 2180 | 2220 | 2180 | 2180 | 2180 | 2220 |

All sizes [T]: C ground to gutter 1930; door clearance 760 x 1820; double door 1440 (A1-A4) / 1560 (A5-A8), data sheet 1390 / 1545; H right of door 490.

Roof
- Pent roof, high at the door front, sloping down to the back; gutter at the low rear edge at 1930.
- Overhangs: sides (K-A)/2 = 30 mm [T]. Front plus back L-B = 410-460 [T]; the side sketch shows ≈390 at the front (over the door) and ≈70 at the back [est, AvantGarde_Skizze_Seite.png].
- Pitch ≈6 degrees [est, side sketch]. Fascia ≈140 [est].
- Skylight: clear acrylic "front skylight" band ≈220 tall [est] above the front wall under the raised roof edge; on the sides, the triangular gap between the flat wall top and the sloping roof (15029_AvantGarde_A2_silber_DT_offen_Sujet_1.webp, AvantGarde_Skizze_Front.png).
- Roof underside: ribbed sheet (15029...offen).

Walls
- Narrow raised vertical ribs, pitch ≈80 mm [est]: 23 evenly spaced ribs on the side sketch; 12 px at 6.7 mm/px on the front sketch.
- Corners: round tubular post at the front corners (Material_AvantGarde_Detail-silber.webp).
- Door leaf smooth outside, ribbed inside (17030_AvantGarde_Sujet.webp).

Doors
- Standard door on the narrow front (A) wall, hinge right; clearance 760 x 1820 [T]; leaf ≈800 [est].
- Lever handle and cylinder (Edelstahl-Drueckergarnitur_AvantGarde_Detail-quarzgrau.webp); gas-spring closer (Gasdruckfeder_AvantGarde_Detail-quarzgrau.webp).
- Double-door option. 3-point lock; the ECO version has a 2-point lock and lacks the standard equipment.

Variants
- Side canopy with optional side and rear walls (15029_15066_AvantGarde_Seitendach_A2_silber_DT_offen_Sujet.webp).
- Drain at a rear corner, left or right (foundation plan A2).

Modelling recipe (A2: 1740 x 2140)
1. Walls: 1930 at the back; front wall also flat-topped at ≈1930 [est].
2. Glazing: front acrylic band 1740 x ~220; triangular acrylic side panes up to the roof.
3. Ribs at 80 pitch.
4. Roof: plane 1800 x 2550 tilted 6 degrees. Front edge ~390 proud of the front wall, top at y ≈2180; rear edge ~70 proud, gutter at 1930.
5. Fascia 140 deep on all edges.
6. Door 800 x 1850, set 490 from the left.

---

## 5. Panorama (apex shed with all-round skylight)

Sources: table and sketches (panorama/drawings/Panorama_Abmessungen.png, csm_Panorama_Skizzen_e7bcde6ba2.png); foundation plan ghp_betonfundament_p1.png; photos as named.

Sizes [T]
- A 2540 for all sizes (2570 incl. corners, N). B: P1 1340, P2 1740, P3 2140, P4 2540, P5 2940.
- Roof K 2730; L = B + 240 (1580-3180).
- Heights: C ground to gutter 1960; D gutter to ridge 310; E overall 2270.
- Doors and walls: clearance 760 x 1820 (double 1550 x 1820); H 510 / J 1270, identical to the HighLine wall set; P downpipe projection 90.

Roof
- Apex (gable) roof, ridge front to back, gable faces the door (front elevation in Panorama_Abmessungen.png shows the triangle on the K/door side).
- Pitch ≈12-13 degrees from D 310 over K/2 1365; the fascia isn't dimensioned, so the true pitch is slightly lower.
- Overhangs [T]: eaves (K-N)/2 = 80 mm; gable ends (L-(B+30))/2 = 105 mm.
- Integrated gutters on both eaves with leaf traps and a 1 1/4" hose outlet beside the corner post (Dachrinnenauslauf_Panorama_Detail.webp, Dachrinne_Laubfaenger_Panorama_Detail.webp).
- Roof underside: trapezoid sheet; roof beams carry storage hooks (Ordnungssystem_Dachtraeger_Panorama_Detail.webp, Gasdruckfeder_Panorama_Detail.webp).
- Skylight: fully encircling clear acrylic band between wall top and roof; a strip ≈150-200 tall along the eaves [est], filling the whole gable triangles (Panorama_Acryglas_Oberlichte.webp, 13050_Panorama_P4_silber_Sujet.webp).

Walls
- Same narrow-rib panel as HighLine; pitch ≈70-80 mm [est] (10 px at ~7 mm/px on the side view of Panorama_Abmessungen.png).
- Corners: round posts (Dachrinnenauslauf_Panorama_Detail.webp).

Doors
- As HighLine: single leaf hinged right, or double; lever and cylinder, gas spring, 3-point lock (14039_Panorama_P2_dunkelgrau_DT_Sujet.webp, Edelstahl-Drückergarnitur_Panorama_Detail.webp).
- In the gable wall, offset J 1270 | door | H 510.

Variants: no side canopy (comparison table). Drains at the rear corners, optionally the front (foundation plan P1).

Modelling recipe (P4: 2540 x 2540)
1. HighLine wall set, walls to ≈1800 [est], round posts.
2. Eaves acrylic strips up to 1960.
3. Acrylic gable triangles: base 2730, apex at 2270 minus fascia.
4. Two roof planes at ~12.5 degrees, 1365 each on plan, 2780 long; 80 eaves and 105 gable overhang.
5. Gutters on both eaves.
6. Door 800 x 1850, 1270 from the left on the front gable wall.

---

## 6. CasaNova (insulated flat-roof garden house)

Sources: product-page data sheet; casanova/drawings/CasaNova_alle_Groessen.png; roof and wall build-ups Dachaufbau_standard-EN_ohne_Ma%C3%9Fe.png and Seitenwandpaneel_Aufbau_EN.png; foundation plan CasaNova_Betonfundament_ohne_Stufe.png [D]; brochure pp7-8 (brochure-CasaNova_EN-p7-elements.png, -p8-elements.jpg); photos as named. The 76-page CasaNova assembly manual (Aufbauanleitung_CN.pdf) was not opened.

Sizes [T]
- Base footprint 3040 or 4040 wide x 2040 / 3040 / 4040 / 5040 / 6040 long: a 1 m module (3x2, 3x3, 3x4, 3x5, 3x6, 4x2, 4x4, 4x5, 4x6).
- Incl. roof overhang W + 240 by L + 240, so overhang 120 per side.
- Overall height 2505. Interior height 2290 (3 m wide) / 2240 (4 m wide).
- Foundation = base footprint [D].

Roof
- Flat: EPDM on 3-layer plywood on aluminium roof bars, held at the edge by a clamping profile that forms the fascia (Dachaufbau_standard-EN...png).
- Snow load 215 kg/m²; gravel and green-roof options (Dachstabilitaet_Dunkelgrau_CasaNova_Detail.webp).
- Deep plain fascia with a milled "CASA NOVA" logo (Acrylglas-Lichtband_CasaNova_Quarzgrau_Detail.webp).
- Fascia ≈250-300, acrylic band below ≈250 [both est from 53023_CasaNova_4x5_quarzgrau_ST_Rendering.webp; not dimensioned].
- Light band: all-round, double-glazed acrylic, slides open on two sides for ventilation (product text; Schiebefenster_CasaNova_Quarzgrau_Detail.webp).
- Optional soffit spotlights in milled 68 mm openings (brochure p8).
- Downpipe: round, offset under the soffit, down the corner post (Regenfallrohr_CasaNova_Quarzgrau_Detail2.webp). Drains at the rear corners, 100 in from the sides, 55 out [D].

Walls
- 40 mm insulated sandwich panels: 0.5 mm coated steel each side, EPS W20 core, U 0.76 (brochure p5; Seitenwandpaneel_Aufbau_EN.png).
- Smooth, no visible screws, flush vertical joints about every 1000 [est from renders; matches the 1 m module].
- Corners: slim square-ish posts (52012_CasaNova_3x4_dunkelgrau_DT_Sujet5.webp).

Doors and windows [T / brochure]
- Standard door 900 x 1980 clearance: smooth leaf with three horizontal grooves; lever on an oval rose plus cylinder (Tuerdruecker_CasaNova_Quarzgrau_Detail.webp).
- Double door 1870 x 1980 (53012...DT...webp).
- Sectional overhead garage door 2360 x 2000 (not on 3x2 or 4x2).
- Glass insert for door. Full-length glass element 830 x 1810 glazed. Tilt-and-turn window 830 x 650 frame.
- Openings can go in any wall, module by module (brochure p6). Flush threshold (Bodenschwelle_CasaNova_Neutral_Detail.webp).

Modelling recipe (3x4)
1. Walls: 3040 x 4040 box, 40 thick, top ≈2000 [est]; groove lines every 1000.
2. Light band: acrylic ≈250 tall [est] up to the fascia underside.
3. Roof: slab 3280 x 4280, fascia ≈280 deep [est], top at 2505.
4. Openings: each 1000 module is door 900 x 1980, glass 830 x 1810, window 830 x 650, or solid.

---

## Estimated rather than measured (summary)

- Every rib pitch, rib profile and panel width: no Biohort document dimensions these; scaled from website line drawings.
- Skylight and glazing-band heights (HighLine, AvantGarde, Panorama, CasaNova).
- Fascia heights for AvantGarde and CasaNova. Measured fascias: HighLine 125, Neo 155 [T].
- AvantGarde roof pitch and its front/rear overhang split.
- Corner post diameters, door leaf sizes (only clearances are measured) and handle heights.
- Panorama's exact roof pitch: fascia depth not given, so calculated to the gutter.
- Studio-render hex values depend on lighting; prefer the swatch-chip values.

## Measured from Biohort's own Roomle configurator scripts (added after the photo pass)

The Roomle component scripts captured in research/roomle/raw/*-component.json carry the construction grid the configurator builds from. HighLine (biohort:Highline_Master onUpdate): wall panels 800 mm (G_width) and 400 mm (AM_width), corner pillar radius 60 mm, docking grid 80 mm across (stepX), 50 mm vertical (stepZ), inner wall height 1880 mm (inner_h), rail profile t 2 / h_m 40 / h_i 30 / h_o 25 / l_i 50 / l_o 15 mm, glazing frame prisms 270 mm tall, canopy widths small 1390 / large 2730 mm, house basic width 2750 mm. These confirm the 80 mm rib grid and the ~1.89 m wall top above.
