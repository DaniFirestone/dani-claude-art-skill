# HotSquatch! Apps Visual Aesthetic System

**Retro pixel art aesthetic inspired by LucasArts SCUMM-era adventure games — absurd, warm, and unapologetically 16-bit.**

---

## Core Concept: Pixel Absurdity

Every visual channels the warmth and humor of 1990s LucasArts point-and-click adventure games — limited palettes, visible pixels, dithered gradients, and a tone that never takes itself seriously.

**The Philosophy:** *"Serious software. Ridiculous packaging."*
- Pixel art is the medium — deliberate, chunky, lo-fi
- Humor comes from contrast: polished apps wrapped in retro absurdity
- Warmth through earth tones, not through smoothness
- The sasquatch is always watching

---

## The HotSquatch! Look

### What We Want
- **Pixel art style** — Visible pixels, no anti-aliasing on key elements, 16-32 color palette feel
- **SCUMM-era LucasArts palette** — The browns, teals, warm oranges, and deep purples of Monkey Island and Day of the Tentacle
- **Dithered gradients** — Checkerboard and ordered dithering for tonal transitions, not smooth blends
- **Dark-to-mid-tone backgrounds** — Jungle canopies, night skies, cave interiors (not bright white)
- **Chunky pixel typography** — Press Start 2P or similar pixel fonts for headings and brand text
- **Playful compositions** — Characters, scenes, and vignettes rather than abstract diagrams

### Reference Styles
- **The Secret of Monkey Island (1990)** — Tropical palette, dithered skies, adventure game UI
- **Day of the Tentacle (1993)** — Bold saturated colors, exaggerated characters, absurd humor
- **Sam & Max Hit the Road (1993)** — Warm earth tones, expressive character art
- **Shovel Knight (2014)** — Modern pixel art with retro NES-era discipline
- **Celeste (2018)** — Pixel art with emotional depth, demonstrates the style's range

### What to AVOID
- VHS scan lines, CRT distortion, or tracking artifacts (that's the DeRP web aesthetic)
- Comic Sans or joke fonts (the web easter eggs use those)
- Neon colors or infomercial garish palettes
- Anti-aliased smooth gradients (keep it crunchy)
- Photorealistic or 3D rendered elements
- Clean vector illustration
- Flat corporate design
- Hand-drawn sketch style (that's Signal Over Noise)
- Excalidraw/whiteboard aesthetic (that's Signal Over Noise)
- Claymorphic/isometric 3D (that's jimchristian.net)

---

## Color System

### Backgrounds
```
Deep Jungle     #1A2B1A   (primary - dense forest canopy, Monkey Island nights)
Warm Dusk       #2D1B2D   (secondary - purple-tinged twilight)
Cave Brown      #3D2B1A   (tertiary - interior scenes, earth tone base)
Parchment       #C4A882   (light alternative - inventory screens, UI panels)
```

### Primary: Pixel Lines & Outlines
```
Pixel Black     #1A1A2E   (primary outlines - near-black with blue undertone)
Dark Bark       #3D2817   (warm outlines for organic elements)
Shadow Purple   #2E1A3D   (shadows and depth)
```

### Accent Colors (SCUMM Palette)
```
Monkey Teal     #2B8B7E   (primary accent — water, UI highlights, interactive elements)
Campfire Orange #D4722A   (secondary accent — warmth, fire, calls to action)
Guybrush Gold   #D4A832   (tertiary accent — treasure, stars, premium highlights)
Tentacle Purple #7B3FA0   (feature accent — magic, mystery, special elements)
Jungle Green    #3D8B3D   (environment — foliage, nature, health/success)
Blood Red       #A83232   (danger/error — sparingly, alerts only)
```

### Skin & Character Tones (Locked from Generated Mascot)
```
Squatch Brown   #A0582A   (sasquatch fur - primary base)
Squatch Dark    #542E27   (sasquatch fur - deep shadow)
Squatch Mid     #74442E   (sasquatch fur - mid shadow)
Squatch Light   #D5A269   (sasquatch fur - highlight, golden)
Squatch Pale    #E9D19F   (palms, face highlight, lightest tone)
```

### Backgrounds (Locked from Generated Mascot)
```
Forest Green    #245333   (primary background - extracted from mascot)
```
Note: Original spec had #1A2B1A (Deep Jungle). The generated mascot produced a richer, bluer green. Use #245333 as canonical.

**Color Usage Guidelines:**
- **Dark backgrounds** dominate (60-70% of composition)
- **Monkey Teal** as primary accent (10-15%) — interactive elements, UI chrome, water
- **Campfire Orange** as warmth accent (5-10%) — CTAs, fire effects, emphasis
- **Guybrush Gold** for special highlights (3-5%) — stars, treasure, achievement
- **Tentacle Purple** sparingly (2-3%) — magic effects, special features
- Maximum 8-10 colors per individual composition (pixel art discipline)

### Color Hierarchy
1. **DARK BACKGROUNDS** — Set the mood, jungle/adventure atmosphere
2. **PIXEL OUTLINES** — Define shapes, crisp 1-2px lines
3. **MONKEY TEAL** — Primary interactive accent, brand recognition
4. **CAMPFIRE ORANGE** — Warmth, action, draws the eye
5. **GUYBRUSH GOLD** — Reward, premium, sparkle
6. **CHARACTER TONES** — The sasquatch and supporting cast

---

## Typography

### Headings & Brand Text
- **Press Start 2P** — The pixel font. All headings, logos, UI labels
- Render at integer scales (1x, 2x, 3x) to maintain pixel crispness
- NO sub-pixel rendering, NO font smoothing on headings

### Body Text (App UI Context)
- **Inter** or **SF Pro** — Clean sans-serif for readability in actual app interfaces
- Pixel fonts for decorative elements and branding only
- App functionality text must be legible — the pixel aesthetic is the wrapper, not the interface

### Text Colors
```
UI Text Light   #E8DCC8   (body text on dark backgrounds)
UI Text Dark    #1A1A2E   (body text on light backgrounds)
Accent Text     #2B8B7E   (links, interactive text — Monkey Teal)
```

---

## Style Parameters

### Pixel Art Discipline
1. **Visible pixels are intentional** — Art should look like it was placed pixel by pixel
2. **No anti-aliasing on edges** — Hard pixel boundaries on character art and icons
3. **Limited palette per composition** — 8-10 colors maximum per scene (pick from the system above)
4. **Integer scaling only** — 1x, 2x, 3x, 4x. Never scale to non-integer sizes
5. **1-2px outlines** — Consistent outline weight across all elements

### Dithering
- **Ordered dithering** for sky gradients and atmospheric depth
- **Checkerboard dithering** for texture on large surfaces
- **No smooth gradients** — Transition between colors using dither patterns
- Dithering is a feature, not a limitation

### Animation Direction (Future)
- **Frame-limited** — 8-12 fps for character animations (retro feel)
- **Squash and stretch** — Exaggerated pixel deformation for personality
- **Idle animations** — Subtle breathing, blinking, shifting weight

### Shadow Treatment
- **Cast shadows** — Hard-edged, 1-2 color darker than base
- **No soft shadows or blur** — Pixel-precise shadow shapes
- **Consistent light source** — Upper-left (adventure game convention)

### Composition Approach
- **Scene-based** — Characters in environments, not floating on white
- **Foreground/midground/background** layering with parallax feel
- **UI chrome** — Pixel-art borders and frames around functional elements
- **Dense but readable** — More detailed than Signal Over Noise, but clear focal hierarchy

---

## Mascot: The Squatch

### Character Description
A pixel sasquatch rendered in SCUMM-era adventure game style. Not menacing — friendly, slightly confused, perpetually curious. Think "Bigfoot who wandered into a tech company."

### Physical Traits
- **Body:** Stocky, broad shoulders, covered in brown pixel fur
- **Face:** Large expressive eyes (2-3px each), small mouth, gentle expression
- **Posture:** Slightly hunched, arms often gesturing or holding objects
- **Size:** Takes up ~40% of frame height when featured as main character
- **Fur colors:** Squatch Brown (#8B5E3C) base, Dark (#5C3D28) shadows, Light (#A87D5A) highlights

### Standard Poses
| Pose | Use Case | Description |
|------|----------|-------------|
| **Standing Wave** | App icon, primary brand | Front-facing, one arm raised in greeting |
| **Thinking** | Loading states, processing | Chin on fist, looking slightly upward |
| **Excited** | Success states, achievements | Arms raised, slight jump |
| **Shrug** | Error states, "not found" | Palms up, slight head tilt |
| **Walking** | Onboarding, transitions | Side view, mid-stride |
| **Sitting** | Idle, about screens | Cross-legged, relaxed |

### Character Rules
- Always pixel art — never smooth/vector/3D rendered
- Consistent proportions across all sizes (chibi-adjacent, ~3-4 heads tall)
- Expression changes through eyes and posture, not complex facial features
- Can hold app-specific props (8-ball, crystal ball, etc.)
- Never scary, aggressive, or realistic — always approachable and slightly goofy

---

## App Icon Direction

### Structure
- **Canvas:** 1024x1024 (iOS requirement), designed at pixel scale then rendered up
- **Design at:** 32x32 or 64x64 pixel grid, then scale to 1024
- **Background:** Dark gradient (Deep Jungle to Warm Dusk) with ordered dithering
- **Subject:** Squatch face/bust — recognizable at 29x29pt (smallest iOS icon)
- **Border:** 0px (iOS applies its own corner radius)

### Icon Variants
| App | Icon Direction |
|-----|----------------|
| **HotSquatch! Hub** | Full squatch face, teal background accent |
| **Magic Hate Ball** | Squatch holding glowing purple 8-ball |
| **Tragic 8 Ball** | Squatch with sad expression, cracked blue 8-ball |
| **Future apps** | Squatch interacting with app-specific prop |

### Icon Rules
- Must read clearly at 29x29pt (smallest iOS size)
- Squatch face/silhouette recognizable at all sizes
- Background color differentiates apps within the suite
- No text in icons (too small to read at small sizes)

---

## App Store Marketing

### Screenshots
- **Background:** Deep Jungle (#1A2B1A) or dark scene
- **Device frames:** Pixel-art styled bezels (not Apple's standard frames)
- **Callout text:** Press Start 2P in Guybrush Gold (#D4A832)
- **Accent borders:** 2px Monkey Teal (#2B8B7E) frames

### Feature Graphics
- Full pixel-art scenes featuring the Squatch using the app
- Adventure-game style compositions with foreground/background layers
- Humor in the scenes (e.g., Squatch in a forest trying to use the Magic Hate Ball)

---

## Prompt Integration

When generating HotSquatch visual content, include these style cues:

**Always include:**
- "pixel art style"
- "LucasArts SCUMM-era adventure game aesthetic"
- "limited color palette, visible pixels"
- "no anti-aliasing, hard pixel edges"
- "dark forest background with earth tones"
- "1990s point-and-click adventure game"

**For character art:**
- "friendly pixel sasquatch character"
- "chunky pixel proportions, 3-4 heads tall"
- "brown fur with warm highlights"
- "expressive pixel eyes"
- "adventure game character sprite"

**For scenes:**
- "ordered dithering for gradients"
- "foreground midground background parallax layers"
- "Monkey Island color palette"
- "warm browns, teal water, orange firelight"

**For UI elements:**
- "pixel art UI frame"
- "retro game interface chrome"
- "Press Start 2P pixel font"
- "inventory screen aesthetic"

**Never use:**
- "smooth gradients" or "anti-aliased"
- "VHS" or "scan lines" or "CRT effect"
- "hand-drawn" or "sketch" or "Excalidraw"
- "vector" or "clean lines" or "polished"
- "photorealistic" or "3D rendered"
- "Comic Sans" or "infomercial"
- "neon" or "garish" or "fluorescent"
- Hex codes in prompts (they render as text)

---

## Relationship to DeRP Brand Family

```
Definitely Real Products Inc. (DeRP)
  |
  +-- Web Easter Eggs (jimchristian.net/drp/*)
  |     Aesthetic: 90s infomercial, VHS, Comic Sans, neon
  |     File: site-specific styles in jimchristian-net repo
  |
  +-- HotSquatch! Apps (hotsquatch.app)
        Aesthetic: THIS FILE - pixel art, SCUMM-era, adventure game
        File: ~/.claude/skills/art/aesthetics/hotsquatch.md
```

**The distinction:** Web easter eggs are deliberately garish and satirical (fake infomercial). HotSquatch! Apps are deliberately retro and charming (real products with personality). Same humor DNA, different visual execution.

---

## Quick Reference

| Element | Value | Notes |
|---------|-------|-------|
| Background | #245333 | Forest Green (locked from mascot) |
| Background Alt | #2D1B2D | Warm Dusk (secondary) |
| Outlines | #030418 | Pixel Black (locked from mascot) |
| Primary Accent | #2B8B7E | Monkey Teal |
| Secondary Accent | #D4722A | Campfire Orange |
| Tertiary Accent | #D4A832 | Guybrush Gold |
| Feature Accent | #7B3FA0 | Tentacle Purple |
| Mascot Base | #A0582A | Squatch Brown (locked from mascot) |
| Line Style | pixel art | Hard edges, no AA |
| Composition | scene-based | Characters in environments |
| Dithering | ordered/checkerboard | For all tonal transitions |
| Heading Font | Press Start 2P | Pixel font |
| Body Font | Inter / SF Pro | Clean sans for app UI |
| Max Colors/Scene | 8-10 | Pixel art discipline |
| Pixel Scale | integer only | 1x, 2x, 3x, 4x |

---

## Absolute Rules

1. **PIXEL ART ONLY** — Visible pixels, integer scaling, no anti-aliasing
2. **SCUMM-ERA PALETTE** — Browns, teals, oranges, purples from the system above
3. **DARK BACKGROUNDS** — Jungle, dusk, cave tones (not white/cream)
4. **DITHERED GRADIENTS** — Ordered or checkerboard, never smooth
5. **CONSISTENT SQUATCH** — Same proportions, same fur colors, same personality
6. **HARD PIXEL OUTLINES** — 1-2px, crisp, no blur
7. **8-10 COLORS PER SCENE** — Pixel art discipline, pick from the system
8. **NO INFOMERCIAL AESTHETIC** — That's the web brand, not the app brand
9. **HUMOR THROUGH CONTENT** — The squatch is funny; the art style is disciplined

---

*Generated for HotSquatch! Apps brand identity on 2026-01-30*
*Aesthetic: LucasArts SCUMM-era pixel art*
*Parent brand: Definitely Real Products Inc. (DeRP)*
