# Nano Banana Prompting Guide

**Extracted from:** The Complete Nano Banana AI Image Editing with Google Gemini (Mammoth Club)
**For:** Cerebro Art Skill image generation and editing
**Applies to:** Nano Banana 2 (`gemini-3.1-flash-image-preview`) and Nano Banana Pro (`gemini-3-pro-image-preview`)

---

## Model Overview

| Model | API ID | Best For |
|-------|--------|----------|
| **Nano Banana 2** (default) | `gemini-3.1-flash-image-preview` | Fast iteration, most tasks, web search grounding |
| **Nano Banana Pro** | `gemini-3-pro-image-preview` | Professional assets, advanced reasoning, complex compositions |

Both models share the same API surface, prompt patterns, and capabilities below. Nano Banana 2 is faster and cheaper with Pro-level quality. Use Pro when maximum reasoning or complex multi-turn editing is needed.

### Key capabilities shared by both models:

- **Multi-turn editing** — Remembers previous commands for iterative refinement
- **Image blending** — Combine multiple photos into single compositions
- **World knowledge** — Uses Gemini's context for complex semantic edits
- **Style transfer** — Extract visual characteristics from one image, apply to another
- **Consistency** — Maintains subject likeness across different edits and scenes
- **Web search grounding** (Nano Banana 2) — Powered by real-time web and image search

---

## Prompt Structure Best Practices

### The Core Formula

```
[Action] the [Subject] by [Specific Change]. The goal is [Desired Outcome].
```

**Key Principles:**
1. **Be Specific** — Vague prompts produce vague results
2. **Include Context** — Color palettes, brand guidelines, mood
3. **State Purpose** — Who will see this? What's it for?
4. **Use Action Verbs** — Direct commands work best

### Action Verb Vocabulary

| Action | Use For |
|--------|---------|
| **Recolor** | Changing color schemes, palettes |
| **Retouch** | Subtle refinements, cleanup |
| **Style** | Applying artistic treatment |
| **Adjust** | Lighting, composition, positioning |
| **Enhance** | Improving quality, details |
| **Transform** | Major changes, conversions |
| **Add** | Inserting new elements |
| **Remove** | Deleting unwanted objects |
| **Replace** | Swapping one element for another |
| **Blend** | Combining multiple images |

---

## Prompt Templates by Operation

### Creating a Visual Style or Mood

```
[Action] the image of [Subject] to have a [Visual Style, e.g., "high-contrast look," "soft pastel palette"]. The mood should be [Desired Mood, e.g., "energetic," "calm," "luxurious"].
```

**Examples:**
- Retouch the image of the skincare bottle to have a soft, ethereal glow. The mood should be tranquil and clean.
- Recolor the image of the fashion item to have a cinematic feel with deep shadows and rich tones. The mood should be nostalgic and artistic.

### Modifying Specific Elements

```
[Action] the [Subject] in the image by [Specific Change]. The goal is [Desired Outcome].
```

**Examples:**
- Adjust the product in the image by making it brighter and adding a subtle glow. The goal is to make it the focal point.
- Enhance the product texture in the image by sharpening details. The goal is to show material quality clearly.

### Adding Objects

```
Add [object description] to [location/position] in the image. Match the [lighting/perspective/style] of the original.
```

**Examples:**
- Add potted plant to the left side of the desk. Match the ambient lighting and shadow direction.
- Add coffee cup on the table near the laptop. Match the perspective and scale.

### Removing Objects

```
Remove [object] from [position] in the image. Fill naturally with [context clues].
```

**Examples:**
- Remove the coffee stain from the tablecloth. Fill naturally with the fabric pattern.
- Remove the person in the background. Fill naturally with the environment.

### Style Transfer

```
Apply the visual style from [reference description] to [target subject]. Transfer [specific elements, e.g., "colors and textures," "patterns," "lighting style"].
```

**Examples:**
- Apply the visual style of vintage film photography to this modern portrait. Transfer the color grading and grain.
- Apply the texture pattern from the butterfly wings to the dress design. Transfer colors and iridescent quality.

### Environmental/Scene Changes

```
Place [subject] in [new environment]. Maintain [consistency elements]. Adjust lighting to [lighting description].
```

**Examples:**
- Place the product on a white marble surface with soft shadows.
- Transform the indoor scene to evoke an adventurous, free-spirited mood. Add a dramatic sunset glow behind the subjects, and adjust the colors to a vibrant, warm palette of oranges and purples.

---

## Mood and Atmosphere Vocabulary

### Emotional Tones

| Mood | Prompt Phrases |
|------|----------------|
| **Mysterious** | "mysterious and eerie," "atmospheric fog," "shadowy intrigue" |
| **Inviting** | "warm and inviting," "welcoming atmosphere," "friendly glow" |
| **Hostile** | "cold and hostile," "harsh contrasts," "unwelcoming" |
| **Serene** | "peaceful and serene," "calm tranquility," "meditative quiet" |
| **Energetic** | "energetic and dynamic," "vibrant motion," "active energy" |
| **Nostalgic** | "nostalgic and vintage," "retro warmth," "timeworn quality" |
| **Luxurious** | "opulent and luxurious," "premium quality," "refined elegance" |
| **Whimsical** | "playful and whimsical," "fantastical elements," "dreamlike" |

### Color Palette Phrases

| Palette Type | Prompt Phrases |
|--------------|----------------|
| **Warm** | "warm tones," "golden hour colors," "amber and coral" |
| **Cool** | "cool blues and greens," "icy tones," "winter palette" |
| **Muted** | "muted pastels," "desaturated colors," "soft palette" |
| **Vibrant** | "saturated vibrant colors," "bold palette," "high-energy hues" |
| **Monochromatic** | "monochromatic scheme," "single color variations," "tonal range" |
| **High-contrast** | "high-contrast look," "deep shadows rich highlights," "dramatic lighting" |
| **Soft** | "soft, ethereal glow," "diffused lighting," "gentle transitions" |

---

## Aspect Ratio Selection

### Pre-Generation Checklist

**Before generating images for UI components:**
1. **Ask for target dimensions** — What's the actual pixel size or aspect ratio of the container?
2. **Verify "vertical" vs specific ratio** — "Vertical" is ambiguous; 9:16 ≠ 2:3 ≠ 3:4
3. **Check platform constraints** — Newsletter forms, sidebars, and widgets have specific proportions
4. **Consider responsive behavior** — Will the image be cropped or scaled at different breakpoints?

**Common UI component ratios:**
| Component | Typical Ratio |
|-----------|---------------|
| Newsletter signup form (vertical) | 9:16 or narrower |
| Sidebar widget | 3:4 or 2:3 |
| Hero banner | 16:9 or 21:9 |
| Card thumbnail | 16:9 or 4:3 |
| Profile/avatar | 1:1 |

### Standard Aspect Ratios

| Ratio | Use Case |
|-------|----------|
| **1:1 (Square)** | Social media posts, profile images, thumbnails |
| **16:9 (Landscape)** | Blog headers, YouTube thumbnails, presentations |
| **9:16 (Portrait)** | Stories, mobile wallpapers, vertical video covers, narrow form backgrounds |
| **4:3** | Presentations, traditional photos |
| **3:4** | Portrait photography, book covers |
| **3:2** | Classic photography, print-ready |
| **21:9 (Ultrawide)** | Cinematic headers, panoramic |

---

## Iterative Refinement Workflow

Nano Banana Pro remembers context across turns. Use this for progressive refinement:

### The Pattern

1. **Start Basic** — Generate initial composition
2. **Add Details Gradually** — One change per turn
3. **Explore Styles** — Try different artistic approaches
4. **Test Elements** — Add/remove to find optimal composition
5. **Color Experiment** — Test various palettes
6. **Final Polish** — Fine-tune lighting and mood

### Example Multi-Turn Session

```
Turn 1: "Generate a blog header showing interconnected nodes representing AI systems on cream background"

Turn 2: "Make the connections more prominent with teal highlights"

Turn 3: "Add subtle burnt orange accents to the key central node"

Turn 4: "Soften the shadows and increase the hand-drawn sketch quality"

Turn 5: "Remove the bottom-left node, it's too cluttered"
```

---

## Integration with Signal Over Noise Aesthetic

When generating images for SoN content, combine these prompt patterns with the brand aesthetic:

### Standard SoN Image Prompt Template

```
[Action] to create a [content type] in hand-drawn Excalidraw sketch style on warm cream background (#F7F4EA).

SUBJECT: [describe 2-4 key elements]

STYLE: Rough, wobbly charcoal sketch lines (#2D2D2D). Imperfect hand-drawn strokes. Multiple overlapping strokes like whiteboard markers.

ACCENTS:
- Primary: Deep teal (#1A6B6B) highlights on [focal element]
- Secondary: Burnt orange (#C85A2A) highlights on [action element]

MOOD: [Select from vocabulary above]

COMPOSITION: 40-50% negative space, minimal elements, generous breathing room.
```

---

## Common Issues and Fixes

| Problem | Solution |
|---------|----------|
| **Too polished/vector-like** | Add "rough, imperfect, hand-drawn strokes" |
| **Wrong color intensity** | Specify exact hex codes and "muted/soft/vibrant" |
| **Cluttered composition** | Explicitly state "2-4 elements maximum, generous negative space" |
| **Inconsistent style** | Use reference image via `--reference-image` flag |
| **Wrong mood** | Use specific mood vocabulary from table above |
| **Element placement wrong** | Specify exact position: "top-left," "centered," "bottom-right" |

---

## Semantic World Knowledge

Nano Banana Pro applies real-world knowledge beyond pure aesthetics. Use this for complex, realistic edits:

### Physics-Based Interactions

The model understands physical properties:
- **Gravity** — Objects fall naturally, clothing drapes correctly
- **Shadows** — Cast shadows adjust to lighting changes
- **Reflections** — Surfaces reflect added objects appropriately
- **Weight** — Heavy objects affect surfaces they sit on

**Prompt tip:** When adding objects, specify "with natural shadows and reflections matching the scene lighting."

### Cultural Context Understanding

The model recognizes appropriate context:
- Clothing appropriate to settings and occasions
- Cultural symbols and their meanings
- Professional vs casual environments
- Regional architectural styles

**Prompt tip:** Include cultural context like "professional office setting" or "casual beach environment."

### Temporal Awareness

The model understands time-related contexts:
- Seasonal changes (snow, fall leaves, spring blooms)
- Time of day (golden hour, midday, night)
- Era-appropriate elements (vintage vs modern)
- Weather conditions

**Prompt tip:** Specify temporal context like "golden hour lighting" or "overcast winter day."

### Practical Applications

| Edit Type | Semantic Knowledge Used |
|-----------|------------------------|
| Add person to scene | Cultural dress, natural posture, appropriate scale |
| Change time of day | Shadow direction, lighting color, ambient mood |
| Place product in environment | Surface reflections, shadow casting, perspective |
| Style transfer with context | Preserve semantic meaning while changing aesthetics |

---

## Reference Image Usage

When using `--reference-image` with Nano Banana 2 or Nano Banana Pro:

```bash
bun run ~/.claude/skills/art/tools/generate-image.ts \
  --model nano-banana-pro \
  --prompt "[Your prompt including style transfer instructions]" \
  --reference-image /path/to/reference.png \
  --size 2K \
  --aspect-ratio 16:9
```

**What the reference image provides:**
- Visual style guidance (colors, textures, mood)
- Composition reference
- Subject consistency across variations
- Brand alignment for matching existing assets

---

## Credits

Content synthesized from *The Complete Nano Banana AI Image Editing with Google Gemini* by Mammoth Club, adapted for Cerebro Art Skill with Signal Over Noise brand integration.
