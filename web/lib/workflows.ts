export interface WorkflowTypeOption {
  label: string;
  aspectRatio: string;
}

export interface WorkflowMeta {
  id: string;
  label: string;
  description: string;
  defaultAspectRatio: string;
  placeholderPrompt: string;
  buttonLabel: string;
  requiresImage?: boolean;
  contextualHint?: string;
  typeOptions?: WorkflowTypeOption[];
}

export const WORKFLOWS: WorkflowMeta[] = [
  {
    id: "editorial",
    label: "Editorial",
    description: "Abstract illustration for a blog post or article",
    defaultAspectRatio: "16:9",
    placeholderPrompt: "AI replacing human judgment in hiring — the tension between efficiency and expertise",
    buttonLabel: "Create illustration",
    contextualHint: "Describe the concept or feeling, not what to draw literally. The AI will find a visual metaphor.",
  },
  {
    id: "visualize",
    label: "Visualize",
    description: "Not sure what format? Describe the idea — we'll choose, or combine approaches",
    defaultAspectRatio: "16:9",
    placeholderPrompt: "Compounding effort looks like nothing for a long time, then suddenly everything",
    buttonLabel: "Create visualization",
  },
  {
    id: "mermaid",
    label: "Flow & Sequence",
    description: "Flowchart, sequence diagram, state machine, or class/ER diagram",
    defaultAspectRatio: "16:9",
    placeholderPrompt: "User onboarding: sign up → email verification → profile setup → first action → habit formed",
    buttonLabel: "Create diagram",
    typeOptions: [
      { label: "Flowchart", aspectRatio: "16:9" },
      { label: "Sequence diagram", aspectRatio: "9:16" },
      { label: "State machine", aspectRatio: "1:1" },
      { label: "Class / ER diagram", aspectRatio: "1:1" },
    ],
  },
  {
    id: "technical",
    label: "Architecture",
    description: "Show how a system or set of components is structured and connected",
    defaultAspectRatio: "16:9",
    placeholderPrompt: "Browser → CDN → load balancer → 3× app servers → PostgreSQL primary + 2 replicas. Flow: left to right.",
    buttonLabel: "Create diagram",
    contextualHint: "Name components by what they do. State flow direction explicitly (left→right or top→bottom). Avoid hex colors — use color names.",
    typeOptions: [
      { label: "Architecture", aspectRatio: "16:9" },
      { label: "Pipeline / sequential", aspectRatio: "21:9" },
      { label: "Layered stack", aspectRatio: "9:16" },
    ],
  },
  {
    id: "taxonomy",
    label: "Taxonomy",
    description: "Show how things are organized into categories — grid, tree, or radial",
    defaultAspectRatio: "16:9",
    placeholderPrompt: "Types of writing: long-form (essays, books), short-form (posts, threads), ephemeral (tweets, stories), evergreen (docs, wikis)",
    buttonLabel: "Create taxonomy",
    typeOptions: [
      { label: "Grid (2-3 cols)", aspectRatio: "16:9" },
      { label: "Wide grid (4+ cols)", aspectRatio: "21:9" },
      { label: "Tree / hierarchy", aspectRatio: "1:1" },
      { label: "Radial", aspectRatio: "1:1" },
    ],
  },
  {
    id: "timeline",
    label: "Timeline",
    description: "Show how something unfolded or evolved over time",
    defaultAspectRatio: "16:9",
    placeholderPrompt: "The internet from ARPANET (1969) → WWW (1991) → Google (1998) → iPhone (2007) → social web (2010) → AI era (2022)",
    buttonLabel: "Create timeline",
    contextualHint: "4–8 milestones works best. Each milestone gets a small illustrated metaphor — pick moments that show real turning points.",
    typeOptions: [
      { label: "Horizontal", aspectRatio: "16:9" },
      { label: "Vertical", aspectRatio: "9:16" },
      { label: "Compact", aspectRatio: "1:1" },
    ],
  },
  {
    id: "framework",
    label: "Framework",
    description: "2×2 matrix, Venn diagram, spectrum, or pyramid",
    defaultAspectRatio: "1:1",
    placeholderPrompt: "Effort (low→high) vs. impact (low→high): Quick wins (low effort, high impact), Big bets (high/high), Fill-ins (low/low), Thankless (high effort, low impact)",
    buttonLabel: "Create framework",
    typeOptions: [
      { label: "2×2 matrix", aspectRatio: "1:1" },
      { label: "Venn diagram", aspectRatio: "1:1" },
      { label: "Spectrum", aspectRatio: "9:16" },
      { label: "Pyramid", aspectRatio: "1:1" },
    ],
  },
  {
    id: "comparison",
    label: "Comparison",
    description: "Compare two approaches, tools, or before/after states side by side",
    defaultAspectRatio: "16:9",
    placeholderPrompt: "REST vs GraphQL — REST: simple, cacheable, over-fetches. GraphQL: flexible, one endpoint, complex to cache.",
    buttonLabel: "Create comparison",
    typeOptions: [
      { label: "Side by side", aspectRatio: "16:9" },
      { label: "Before / After", aspectRatio: "16:9" },
      { label: "Stacked", aspectRatio: "4:5" },
      { label: "Versus (square)", aspectRatio: "1:1" },
    ],
  },
  {
    id: "annotated-screenshot",
    label: "Annotated Screenshot",
    description: "Highlight and explain parts of an interface or document",
    defaultAspectRatio: "16:9",
    placeholderPrompt: "Stripe dashboard: callout 1 → revenue chart (MTD), callout 2 → recent transactions list, callout 3 → quick-actions panel",
    buttonLabel: "Create annotation",
    requiresImage: true,
    contextualHint: "Upload the screenshot below — the AI will add hand-drawn circles, arrows, and callouts over your image.",
  },
  {
    id: "recipe-card",
    label: "Recipe Card",
    description: "Walk through a process step by step",
    defaultAspectRatio: "4:5",
    placeholderPrompt: "Run a retrospective: 1. Set the stage, 2. Gather data, 3. Generate insights, 4. Decide actions, 5. Close",
    buttonLabel: "Create recipe card",
    contextualHint: "3–8 steps is the sweet spot. Each step gets a circled number and a small sketch.",
    typeOptions: [
      { label: "Card (portrait)", aspectRatio: "4:5" },
      { label: "Long process", aspectRatio: "9:16" },
      { label: "Quick reference", aspectRatio: "1:1" },
    ],
  },
  {
    id: "sketchnote",
    label: "Sketchnote",
    description: "Capture the key ideas from a talk, book, or meeting in visual notes",
    defaultAspectRatio: "3:4",
    placeholderPrompt: "The Mom Test: don't pitch your idea, ask about their life. Past behavior beats future intentions. Facts and specifics, not opinions.",
    buttonLabel: "Create sketchnote",
    contextualHint: "Keep it to 10 or fewer visual elements. Hand-lettered text, simple icons, containers — not a wall of words.",
  },
  {
    id: "aphorism",
    label: "Quote Card",
    description: "Turn a quote or insight into a shareable visual — typography IS the image",
    defaultAspectRatio: "1:1",
    placeholderPrompt: "\"Done is better than perfect.\" — Reid Hoffman",
    buttonLabel: "Create quote card",
    contextualHint: "Under 15 words lands hardest. The shorter the quote, the bigger the type, the more impact.",
    typeOptions: [
      { label: "Square (social)", aspectRatio: "1:1" },
      { label: "Instagram feed", aspectRatio: "4:5" },
      { label: "Stories / vertical", aspectRatio: "9:16" },
      { label: "Wide banner", aspectRatio: "16:9" },
    ],
  },
  {
    id: "map",
    label: "Concept Map",
    description: "Visualize an idea space as illustrated territory — regions, landmarks, terrain",
    defaultAspectRatio: "1:1",
    placeholderPrompt: "The territory of productivity: Energy plains (foundation), Attention forest (complex), Systems mountains (hard to climb, worth it), Delegation river (flows), Saying No island (isolated but crucial)",
    buttonLabel: "Create concept map",
    contextualHint: "3–6 regions works best. Think in terrain metaphors: mountains = challenging, forests = complex, plains = foundational, rivers = connecting.",
  },
  {
    id: "stats",
    label: "Stat Card",
    description: "Make a single striking number land visually",
    defaultAspectRatio: "1:1",
    placeholderPrompt: "73% of knowledge workers feel they spend more time in meetings than doing actual work",
    buttonLabel: "Create stat card",
    contextualHint: "Round to the most memorable form. One number, one idea — context label is 5 words max.",
  },
  {
    id: "comics",
    label: "Comic",
    description: "Tell a story across sequential panels",
    defaultAspectRatio: "21:9",
    placeholderPrompt: "Panel 1: developer confidently deploys on Friday afternoon. Panel 2: phone blowing up Saturday morning. Panel 3: quietly rolls back, says nothing.",
    buttonLabel: "Create comic",
    contextualHint: "3 panels: Setup → Development → Payoff. 4 panels adds a Climax. Keep characters simple — stick figures work great.",
    typeOptions: [
      { label: "3-panel strip", aspectRatio: "21:9" },
      { label: "4-panel strip", aspectRatio: "4:1" },
      { label: "2×2 grid", aspectRatio: "1:1" },
      { label: "Vertical stack", aspectRatio: "9:16" },
    ],
  },
  {
    id: "image-editing",
    label: "Edit Image",
    description: "Modify, transform, or restyle an existing image",
    defaultAspectRatio: "16:9",
    placeholderPrompt: "Remove the background. Shift the color palette to warm cream with teal and burnt orange accents. Keep all other details.",
    buttonLabel: "Transform image",
    requiresImage: true,
    contextualHint: "Upload the image you want to transform. Describe what to change — the AI will preserve everything you don't mention.",
  },
];
