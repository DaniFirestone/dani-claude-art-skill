# Tree Octopus Field Guide Aesthetic

**Project:** The Field Guide to Capturing and Caring for The Pacific Northwest Tree Octopus
**Brand:** DeRP (Definitely Real Products) — product-level aesthetic (not corporate pixel art)
**Genre spoofed:** Mid-century naturalist field guide (Peterson / Golden Guide, 1950s–1970s)

---

## Base Prompt Prefix (MANDATORY — prepend to every prompt)

```
Scientific naturalist illustration painted in gouache and tempera, in the precise authoritative style of mid-20th century field guide plates by Roger Tory Peterson and the Golden Guide series. Realistic proportions and anatomy rendered with confident brushwork. Flat opaque colour fields with smooth blended edges. Naturalistic but slightly warm colour saturation. Clean white or pale cream background. Subjects are composed as specimen plates — centred, well-lit, clearly delineated from background. The rendering is detailed and serious, never cartoonish, never stylized, never whimsical. This is the work of a professional natural history illustrator commissioned by a scientific society. Every image looks like it belongs in a printed reference book from 1965.
```

---

## Consistency Lock Parameters

| Parameter | Locked Value | Rationale |
|-----------|-------------|-----------|
| **Medium** | Gouache and tempera paint | Period-accurate for Peterson-era guides |
| **Rendering** | Realistic proportions, opaque colour, smooth blended edges | Distinguishes from Victorian engraving (hatching) and modern digital (gradients) |
| **Background** | Clean white or pale cream, no texture, no vignetting | Peterson standard — specimens float on the page |
| **Line quality** | No visible outlines or linework — form defined by colour and value | Gouache technique, not ink illustration |
| **Colour saturation** | Naturalistic, slightly warm — greens lean olive/sage, browns lean warm umber | PNW forest palette, not tropical |
| **Lighting** | Even, diffused, slightly directional from upper left | Standard specimen lighting |
| **Human figures** | Realistic proportions, period-accurate clothing, no exaggeration | **Critical: humans must not be cartoonish or caricatured** |
| **Octopus rendering** | Consistent mossy green with reddish-brown mottling, visible suckers, golden-brown eyes | Must be the same species across all plates |
| **Typography in image** | Small sans-serif for labels, italic for Latin names, serif for plate captions | Period-accurate labelling convention |
| **Composition** | Specimen-plate: subjects centred, generous margins, labelled | Field guide convention |
| **Tone** | Documentary seriousness — the comedy comes from the situation, never the rendering | **The art must never be in on the joke** |

---

## Anti-Patterns (NEVER do these)

| Anti-Pattern | Why It Breaks the Aesthetic |
|-------------|---------------------------|
| Cartoon proportions (large heads, small bodies) | Destroys the scientific authority |
| Warm ambient glow / mood lighting | This is a reference book, not a storybook |
| Rounded, soft, "friendly" character design | Peterson didn't draw friendly — he drew accurate |
| Visible brush texture or impressionistic strokes | Gouache field guide illustration is smooth and precise |
| Dark or coloured backgrounds (except habitat scenes) | Specimen plates use white backgrounds |
| Exaggerated expressions on humans | Humans are documented, not performed |
| Pixel art, cel-shading, or any digital stylisation | Wrong century, wrong medium |
| Whimsical or playful composition | The humour is in what's depicted, not how it's depicted |

---

## Colour Palette

### Primary (the octopus)
- **Body base:** Deep mossy green (#4A6B3A)
- **Mottling:** Reddish-brown (#8B4513)
- **Suckers:** Pale cream-pink (#E8D5C4)
- **Eyes:** Golden-brown (#B8860B)
- **Ink:** Dark sepia-black (#1C1C14)

### Environment (PNW forest)
- **Cedar bark:** Warm red-brown (#6B3A2A)
- **Moss:** Sage green (#7A8B5A)
- **Canopy:** Deep forest green (#2C4A2C)
- **Mist/atmosphere:** Cool grey-blue (#B8C4CC)
- **Fern:** Yellow-green (#6B8E23)

### Studio/Historical (TV reconstruction scenes)
- **1950s suits:** Charcoal grey, medium grey (#4A4A4A, #7A7A7A)
- **Studio lighting:** Warm white, not golden — overhead, even
- **Set elements:** Period-accurate, muted, not saturated
- **Skin tones:** Naturalistic, warm but not orange

### Labels and Typography
- **Label text:** Dark charcoal (#2A2A2A)
- **Caption background:** Pale cream (#FAF6EE) or none
- **Leader lines:** Fine, dark grey

---

## Scene Types and Treatment

### Specimen Plates (anatomy, chromatophores, prey, behaviour, health)
- White background, no environment
- Subject(s) centred with generous margins
- Fine leader lines to labels
- Multiple specimens arranged in clean grids or rows

### Habitat/Environmental Scenes (frontispiece, habitat profile)
- Painted background showing PNW old-growth forest
- Atmospheric perspective (distant elements cooler and less saturated)
- Subject remains the focal point

### Historical Reconstructions (TV incidents)
- **Must maintain the same rendering quality as specimen plates**
- Period-accurate studio environments painted with documentary precision
- Humans rendered as realistic adults, never caricatured
- The octopus is painted exactly the same as in specimen plates — it doesn't become cartoonish just because the scene is dramatic
- Lighting follows the period (1950s studio lights = bright, even, overhead)
- **These are reconstructions painted for a scientific society's historical record, not editorial cartoons**

### Technical Diagrams (enclosure cross-section)
- Clean isometric or cutaway perspective
- White background
- Fine leader lines to all components
- Labelled in small sans-serif

### Sequential Plates (capture technique, moult sequence)
- 2-3 panels arranged horizontally
- White background between panels
- Consistent scale and framing across all panels
- Stage labels below each panel

---

## Reference Plates (Style Benchmarks)

The following generated plates represent the target aesthetic and should be used as reference for consistency:

- `plate-00-frontispiece.png` — Gold standard for habitat scenes
- `plate-01-anatomy.png` — Gold standard for specimen plates
- `plate-04-today-show.png` — Gold standard for historical reconstructions
- `plate-09-prey.png` — Gold standard for specimen identification plates
- `plate-16-sullivan-orchestra.png` — Gold standard for dramatic incident reconstructions

---

## Output Specifications

| Parameter | Value |
|-----------|-------|
| **Model** | nano-banana-pro (default); gpt-image-1 for label-heavy plates |
| **Resolution** | 2K |
| **Portrait plates** | 3:4 aspect ratio |
| **Landscape plates** | 16:9 aspect ratio |
| **Square plates** | 1:1 aspect ratio |
| **Output directory** | `~/Sync/Cerebro/03 Workbench/DeRP/posters/tree-octopus/` |
| **File naming** | `plate-NN-description.png` |

---

## KDP Print Specifications

For Amazon KDP paperback production:

| Parameter | Value |
|-----------|-------|
| **Trim size** | 6" × 9" (standard) or 7" × 10" (field guide format) |
| **Interior** | Premium colour |
| **Bleed** | 0.125" if images extend to edge |
| **Resolution** | 300 DPI minimum for all images |
| **Colour space** | sRGB for KDP colour interiors |
| **Full-page plates** | Size to trim width minus margins (minimum 0.5" all sides) |

Note: Current 2K generations may need upscaling for 300 DPI print at 7×10". Consider regenerating final plates at maximum resolution or using an upscaler.
