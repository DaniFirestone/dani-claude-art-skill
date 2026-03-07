export interface PlatformDef {
  id: string;
  label: string;
  icon: string; // lucide icon name
  defaultAspectRatio: string;
  guidelines: string;
}

export const PLATFORMS: PlatformDef[] = [
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: "Linkedin",
    defaultAspectRatio: "16:9",
    guidelines: "Professional, long-form, value-driven, includes 3-5 relevant hashtags.",
  },
  {
    id: "threads",
    label: "Threads",
    icon: "MessageSquare",
    defaultAspectRatio: "1:1",
    guidelines: "Conversational, punchy, short, engaging, often starts a discussion.",
  },
  {
    id: "instagram",
    label: "Instagram",
    icon: "Instagram",
    defaultAspectRatio: "1:1",
    guidelines: "Visual-focused, catchy caption, heavy on emojis and hashtags (10-15).",
  },
  {
    id: "pinterest",
    label: "Pinterest",
    icon: "Pin",
    defaultAspectRatio: "2:3",
    guidelines: 'Inspirational, instructional, or aesthetic. Focus on "how-to" or "ideas".',
  },
];

export const PLATFORM_MAP = Object.fromEntries(PLATFORMS.map((p) => [p.id, p]));
