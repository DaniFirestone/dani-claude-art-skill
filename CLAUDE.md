# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

This is a **Claude Code skill** for visual content generation. It is distributed as a skill package that users install into `~/.claude/skills/art/`. The repo itself is the source; the installed location is where Claude Code reads it at runtime.

The core tool is a TypeScript CLI (`skills/art/tools/generate-image.ts`) that wraps the Google Gemini image generation API. The skill orchestration layer (`skills/art/SKILL.md` and `skills/art/workflows/`) handles routing and prompt construction.

## Commands

Install dependencies for the image generation tool:

```bash
cd skills/art/tools
bun install
```

Run the image generation CLI:

```bash
bun run skills/art/tools/generate-image.ts \
  --prompt "..." \
  --size 2K \
  --aspect-ratio 16:9 \
  --output /tmp/output.png
```

Required environment variables (loaded from `~/.claude/.env` at runtime):
- `GOOGLE_API_KEY` — required for both models
- `REMOVEBG_API_KEY` — optional, only needed for `--remove-bg`

## Architecture

### Skill Entry Point

`skills/art/SKILL.md` is the Claude Code skill manifest. It defines:
- Trigger conditions (when the skill activates)
- Workflow routing table (which `.md` file handles which request type)
- Aesthetic routing logic (how brand/visual identity is selected)
- Image generation command reference

### Workflow Files

Each file in `skills/art/workflows/` handles one content type (timeline, mermaid diagram, comparison, etc.). Workflows are invoked by the skill router and contain step-by-step instructions for Claude to follow, including prompt templates and validation checklists.

`workflows/visualize.md` is the orchestrator — used when the user hasn't specified a format and Claude needs to decide which workflow applies.

### Aesthetic System

`skills/art/aesthetic.md` is the default brand aesthetic. Custom brand aesthetics live in `skills/art/aesthetics/[name].md`. Each aesthetic file **must** define a "Base Prompt Prefix" — a locked consistency block prepended to every image generation prompt for that aesthetic. Without the prefix, visual cohesion across a set of illustrations breaks down.

Aesthetic selection priority:
1. User specifies a brand → look for matching aesthetic file
2. Content-type override (satire, easter egg) → special rules in SKILL.md
3. Site-specific style guide (e.g., `HERO-IMAGE-TEMPLATE.md`) in the target project
4. Default: `aesthetic.md`

Always read the aesthetic file before constructing a prompt.

### Image Generation Tool

`skills/art/tools/generate-image.ts` is a standalone Bun CLI. It:
- Loads API keys from `~/.claude/.env`
- Maps friendly model names (`nano-banana-2`, `nano-banana-pro`) to Gemini API model IDs
- Handles reference images (base64-encoded, passed as `inlineData`)
- Supports web search grounding (`--grounded`, NB2 only), configurable thinking depth (`--thinking`, NB2 only), background removal via remove.bg API, and parallel creative variations

### Models

| Alias | API Model ID | Notes |
|-------|-------------|-------|
| `nano-banana-2` | `gemini-3.1-flash-image-preview` | Default. ~$0.067/image. Supports 512px, extended aspect ratios, grounding, thinking |
| `nano-banana-pro` | `gemini-3-pro-image-preview` | ~$0.134/image. Use for max quality / complex multi-turn editing |

### Diagram Prompt Pitfalls

Avoid these in architecture/technical diagram prompts:
- Hex codes in prompts (`#1A8A9B` renders as visible text — use color names instead)
- Vague flow direction (always state "LEFT TO RIGHT" or "TOP TO BOTTOM" explicitly)
- Duplicate labels (specify "label BELOW only, not inside")
- Implicit positioning (use "horizontal row" / "vertical column")
