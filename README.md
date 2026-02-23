# claude-art-skill

Complete visual content system for Claude Code — 15 specialized workflows, 4 AI image models, aesthetic routing, and brand customization.

## Installation

```bash
claude plugin install aplaceforallmystuff/claude-art-skill
```

Then install the image generation dependencies:

```bash
cd ~/.claude/plugins/cache/aplaceforallmystuff/claude-art-skill/*/skills/art/tools
bun install
```

## Setup

### API Keys

Create `~/.claude/.env` with the API keys for the models you want to use:

```
# Required for Nano Banana Pro (default model, recommended)
GOOGLE_API_KEY=your-google-api-key

# Required for Flux model
REPLICATE_API_TOKEN=your-replicate-token

# Required for GPT-image-1 model
OPENAI_API_KEY=your-openai-api-key

# Optional — for background removal
REMOVEBG_API_KEY=your-removebg-key
```

You only need the keys for the models you plan to use. Nano Banana Pro (`GOOGLE_API_KEY`) is the recommended default.

## Usage

Once installed, tell Claude Code to generate images:

- "Create a blog header illustration about AI automation"
- "Make a technical diagram of this architecture"
- "Generate a comparison visual: React vs Vue"
- "Create a timeline of the project milestones"

The skill automatically routes to the appropriate workflow based on your request.

## Available Workflows

| Workflow | Trigger |
|----------|---------|
| Editorial illustration | Blog headers, article visuals |
| Visualize (orchestrator) | When unsure which format |
| Mermaid | Flowcharts, sequence diagrams |
| Technical diagrams | Architecture, system diagrams |
| Taxonomies | Classification grids |
| Timelines | Chronological progressions |
| Frameworks | 2x2 matrices, mental models |
| Comparisons | X vs Y, side-by-side |
| Annotated screenshots | Screenshot markup |
| Recipe cards | Step-by-step processes |
| Sketchnotes | Visual notes, meeting summaries |
| Aphorisms | Quote cards |
| Maps | Conceptual territory maps |
| Stats | Big number visuals |
| Comics | Sequential panels |
| Image editing | Modify existing images |

## Models

| Model | Provider | Best For |
|-------|----------|----------|
| **nano-banana-pro** (default) | Google Gemini | Iterative editing, style transfer, brand consistency |
| **flux** | Replicate | Maximum photorealism, complex scenes |
| **gpt-image-1** | OpenAI | Text in images, precise literal interpretation |
| **nano-banana** | Replicate | Quick generation, simple compositions |

## Adding Your Own Brand Aesthetic

The skill ships with a warm hand-drawn sketch aesthetic as default. To add your own brand:

1. Copy `skills/art/aesthetics/example.md` to `skills/art/aesthetics/your-brand.md`
2. Fill in your brand colors, line style, composition rules, and mood
3. Define a **Base Prompt Prefix** — the consistency lock that ensures all your images look cohesive
4. When generating, tell Claude which brand to use: "Create a header using my-brand aesthetic"

See `skills/art/aesthetics/example.md` for the full template.

## CLI Tool

The image generation CLI can also be used directly:

```bash
bun run skills/art/tools/generate-image.ts \
  --model nano-banana-pro \
  --prompt "Hand-drawn sketch of interconnected nodes" \
  --size 2K \
  --aspect-ratio 16:9 \
  --output /tmp/header.png
```

Run `--help` for all options including `--reference-image`, `--transparent`, `--remove-bg`, and `--creative-variations`.

## License

MIT
