# Second Brain Chronicles Visual Aesthetic System

**A dark, experimental claymorphic aesthetic — the workshop behind the showroom. Soft 3D clay meets terminal glow.**

---

## Core Concept: Claymorphic Lab

Every visual channels the energy of a late-night build session — cluttered workbenches, glowing monitors, half-finished automations. The same soft polymer clay material as jimchristian.net, but shifted darker and more experimental.

**The Philosophy:** *"The workshop behind the polished product."*
- Soft 3D clay is the medium — rounded, tactile, matte
- Dark backgrounds signal builder/developer context
- Terminal green and teal glows add the hacker dimension
- Messiness is intentional — cables, coffee rings, scattered notebooks

---

## The SBC Look

### What We Want
- **Isometric 3D claymorphic dioramas** — Miniature scenes viewed from above at ~30-45 degree angle
- **Soft polymer clay aesthetic** — Rounded pillow-like edges, matte textures
- **Dark charcoal backgrounds** — Workshop atmosphere, not cozy living room
- **Teal accent lighting** — Connecting thread to Signal Over Noise family
- **Terminal green elements** — Code, success states, the hacker dimension
- **Cluttered compositions** — Working desks, tangled cables, scattered props
- **Blender cycles render look** — Soft global illumination, matte materials

### Reference Styles
- **jimchristian.net hero images** — Same claymorphic material and render style
- **Isometric diorama art** — Miniature scenes with depth and detail
- **Lo-fi study girl aesthetic** — Cozy workspace vibes but darker
- **Blender clay renders** — Matte polymer clay with soft lighting

### What to AVOID
- Hand-drawn sketch style (that's Signal Over Noise)
- Pixel art (that's HotSquatch!)
- Flat vector illustration
- Photorealistic renders
- Bright/white backgrounds
- Clean, minimal compositions (SBC is messy on purpose)
- Neon colors or harsh glows
- Corporate polished aesthetic
- Hex codes in prompts (they render as visible text)

---

## Color System

### Backgrounds
```
Deep Charcoal   #1E1E2E   (primary - dark mode lab feel)
Dark Slate       #2A2A3D   (secondary - slightly lighter panels)
Warm Dark        #2D2B2E   (tertiary - brownish dark for variety)
```

### Primary Accent
```
Teal             #1B9AAA   (primary accent - SoN family connection, monitor glow)
Bright Teal      #22B8CC   (lighter variant - highlights, interactive elements)
```

### Secondary Accents
```
Terminal Green   #50FA7B   (code, success, terminal references)
Burnt Orange     #EF6351   (failure states, "What Broke" sections, warnings)
Soft Lavender    #BD93F9   (metrics, "By The Numbers" highlights)
Warm Peach       #F5D5C8   (clay material base, subtle warmth)
```

### Text & UI
```
Cream            #F7F4EA   (body text on dark backgrounds)
Light Gray       #B8B8C8   (secondary text, captions)
```

**Color Usage Guidelines:**
- **Deep Charcoal backgrounds** dominate (60-70% of composition)
- **Teal** as primary accent (15-20%) — monitor glows, accent lighting, connections
- **Terminal Green** for code elements (5-10%) — terminal windows, success indicators
- **Burnt Orange** sparingly (3-5%) — failure highlights, warning elements
- **Lavender** sparingly (3-5%) — metric displays, special callouts
- **Warm Peach** as clay material tone (10-15%) — the actual clay surface color

### Color Hierarchy
1. **DARK CHARCOAL BACKGROUNDS** — Set the moody workshop atmosphere
2. **WARM PEACH CLAY** — The material everything is made of
3. **TEAL ACCENT LIGHTING** — Primary glow, monitor light, brand connection to SoN
4. **TERMINAL GREEN** — Code and terminal elements, success states
5. **BURNT ORANGE** — Failure/warning accent (repurposed from SoN)
6. **LAVENDER** — Metric highlights, data visualization
7. **CREAM TEXT** — Readable body text on dark backgrounds

---

## Style Parameters

### Clay Material Qualities
1. **Matte polymer clay texture** — Not shiny, not perfectly smooth
2. **Rounded pillow-like edges** — Everything looks slightly inflated, soft
3. **Subtle fingerprint impressions** — The clay feels handmade
4. **Warm subsurface scattering** — Light penetrates slightly into the clay
5. **Consistent material** — Everything in the scene is made of clay

### Lighting
- **Warm task lighting** — Desk lamps creating pools of light
- **Teal monitor glow** — Screens cast teal-colored light on nearby surfaces
- **Terminal green ambient** — Subtle green from terminal windows
- **Soft global illumination** — Blender cycles render quality
- **No harsh directional lights** — Everything feels soft and diffused

### Composition Approach
- **Isometric viewpoint** — Consistent ~30-45 degree viewing angle
- **Cluttered but composed** — Messy desks that tell a story
- **Depth through layers** — Foreground props, main workspace, background shelves
- **Scale: miniature** — Diorama feel, like looking at a tiny workspace
- **Dense with detail** — More objects than SoN, rewarding close inspection

### Shadow Treatment
- **Soft contact shadows** — Objects rest naturally on surfaces
- **Ambient occlusion** — Crevices and corners slightly darker
- **No hard shadows** — Everything is softly lit
- **Depth through shadow** — Background elements slightly darker

---

## Scene Elements Vocabulary

### Always Include (pick 3-5 per image)
- Multiple small monitors showing terminal/code with teal glow
- Coffee mug (with or without steam)
- Mechanical keyboard with subtly glowing keys
- Scattered notebooks or papers
- Tangled cables
- Floating notification bubbles or workflow diagrams

### Sometimes Include (pick 1-2 for variety)
- Half-assembled robot assistant on shelf
- Stack of books
- Sticky notes on monitor edges
- Small potted plant (slightly wilted)
- Headphones
- USB drives scattered on desk
- Whiteboard with diagrams in background
- Server rack or NAS in background

### Topic-Specific Elements
| Topic | Props to Add |
|-------|-------------|
| Agents/Automation | Floating workflow diagrams, small robot helper |
| Email/Triage | Tiny envelopes, sorting bins |
| Writing/Newsletter | Typewriter, paper stack, quill pen |
| Code/Skills | Terminal windows prominent, code scrolling on screens |
| Debugging/Failures | Sparks, error symbols, orange warning lights |
| Metrics/Data | Dashboard screens, charts, lavender number displays |
| Books/Oracle | Stack of tiny books, reading glasses, bookmark |

---

## Prompt Integration

When generating SBC visual content, include these style cues:

**Always include:**
- "isometric 3D claymorphic diorama"
- "soft polymer clay aesthetic"
- "rounded pillow-like edges"
- "dark charcoal background"
- "matte clay textures"
- "Blender cycles render style"
- "teal accent lighting"
- "miniature workshop scene"

**For workspace scenes:**
- "cluttered creative desk"
- "multiple small monitors with teal glow"
- "tangled cables and scattered notebooks"
- "warm task lighting"
- "coffee mug, mechanical keyboard"

**For character scenes (if depicting Jim):**
- "bearded man with glasses and grey hair"
- "working at cluttered desk"
- "clay figure, same material as environment"

**Mood phrases:**
- "late-night build session atmosphere"
- "cozy workshop energy"
- "focused builder aesthetic"
- "warm teal task lighting"

**Never use:**
- "hand-drawn" or "sketch" or "Excalidraw" (that's SoN)
- "pixel art" or "retro" (that's HotSquatch)
- Hex codes in prompts (they render as visible text)
- "clean" or "minimal" or "polished" (SBC is messy on purpose)
- "bright background" or "white background"
- "photorealistic" (keep it clay)
- "vector" or "flat design"

---

## Section-Specific Color Mapping

Each recurring newsletter section has a color association for visual treatment:

| Section | Accent Color | Use |
|---------|-------------|-----|
| The Headline | Teal | Primary glow, monitor displays |
| By The Numbers | Lavender | Metric displays, number highlights |
| What I Built | Terminal Green | Success indicators, code elements |
| What Broke | Burnt Orange | Warning lights, error indicators, sparks |
| The Rabbit Hole | Teal | Deep exploration lighting |
| Code Snippet | Terminal Green | Terminal windows, code scrolling |
| Next Fortnight | Cream | Soft, forward-looking lighting |

---

## Image Types

### Profile Avatar (256x256)
```
Isometric 3D claymorphic diorama, miniature workshop desk viewed from above,
soft polymer clay aesthetic, rounded pillow-like edges,
dark charcoal background,
multiple small monitors showing terminal windows and code with teal glow,
floating notification bubbles and small automation workflow diagrams,
coffee mug with steam, scattered notebooks, tangled cables,
mechanical keyboard with subtly glowing keys,
warm teal task lighting,
Blender cycles render style, matte clay textures,
teal and terminal green accent lighting
```

### Banner Image (1600x400)
```
Wide isometric 3D claymorphic scene, messy creative workshop workbench,
soft polymer clay aesthetic, rounded pillow-like edges,
dark charcoal background,
bearded man with glasses and grey hair working at cluttered desk,
multiple vintage CRT monitors showing different dashboards and terminal windows,
floating automation workflow diagrams with teal glow,
sticky notes, coffee rings on papers, cable spaghetti,
half-assembled robot assistant on shelf,
warm task lighting creating pools of teal and orange,
Blender cycles render style, pastel clay with saturated teal accents,
wide panoramic composition
```

### Per-Issue Hero Image (1200x630)
```
Isometric 3D claymorphic diorama, [SCENE FOR THIS ISSUE'S TOPIC],
soft polymer clay aesthetic, rounded pillow-like edges,
dark charcoal background,
floating [TOPIC-SPECIFIC ELEMENTS] with teal glow,
[RELEVANT PROPS FROM SCENE ELEMENTS TABLE], workshop environment details,
Blender cycles render style, teal and [ISSUE ACCENT COLOR] accents
```

---

## Relationship to Brand Family

```
Jim Christian Brand Family
  |
  +-- jimchristian.net (Personal)
  |     Aesthetic: Claymorphic, warm peach backgrounds, cozy
  |     File: ~/Dev/jimchristian-net/HERO-IMAGE-TEMPLATE.md
  |
  +-- Signal Over Noise (Newsletter)
  |     Aesthetic: Hand-drawn sketch, cream backgrounds, teal/orange
  |     File: ~/.claude/skills/art/aesthetic.md
  |
  +-- Second Brain Chronicles (Newsletter - THIS FILE)
  |     Aesthetic: Claymorphic DARK, charcoal backgrounds, teal/green
  |     File: ~/.claude/skills/art/aesthetics/sbc.md
  |
  +-- HotSquatch! Apps (iOS)
        Aesthetic: Pixel art, SCUMM-era, dark forest backgrounds
        File: ~/.claude/skills/art/aesthetics/hotsquatch.md
```

**The distinctions:**
- **jimchristian.net** = warm peach clay, inviting, personal (the living room)
- **SBC** = dark charcoal clay, experimental, in-progress (the workshop)
- **SoN** = hand-drawn sketches, cream, professional (the showroom)
- **HotSquatch** = pixel art, retro gaming, absurd (the arcade)

---

## Quick Reference

| Element | Value | Notes |
|---------|-------|-------|
| Background | Dark Charcoal | Moody workshop atmosphere |
| Clay Material | Warm Peach tones | Matte polymer, rounded edges |
| Primary Accent | Teal | SoN family connection |
| Code Accent | Terminal Green | Hacker dimension |
| Failure Accent | Burnt Orange | "What Broke" sections |
| Metric Accent | Soft Lavender | "By The Numbers" |
| Body Text | Cream | On dark backgrounds |
| Line Style | N/A (3D clay) | No linework, volumetric forms |
| Composition | Cluttered isometric | Dense with detail |
| Render | Blender cycles | Soft GI, matte materials |
| Viewpoint | Isometric 30-45 deg | Consistent diorama angle |

---

## Absolute Rules

1. **CLAYMORPHIC 3D ONLY** — Soft polymer clay, rounded edges, matte textures
2. **DARK CHARCOAL BACKGROUNDS** — Workshop atmosphere, not bright/warm
3. **TEAL PRIMARY ACCENT** — SoN family thread, monitor glow, accent lighting
4. **TERMINAL GREEN FOR CODE** — The hacker dimension SoN doesn't have
5. **ISOMETRIC VIEWPOINT** — Consistent miniature diorama angle
6. **CLUTTERED IS GOOD** — This is a working workshop, not a showroom
7. **BLENDER RENDER QUALITY** — Soft global illumination, matte clay materials
8. **NO HEX CODES IN PROMPTS** — Use color names, they render as text
9. **MESSY ON PURPOSE** — Cables, coffee rings, scattered papers tell the story

---

*Generated for Second Brain Chronicles brand identity on 2026-02-02*
*Aesthetic: Claymorphic dark workshop variant*
*Parent brand: Jim Christian Brand Family*
