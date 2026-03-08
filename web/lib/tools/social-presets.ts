export interface CropPreset {
  id: string;
  label: string;
  platform: string;
  width: number;
  height: number;
  aspectRatio: number; // width / height
}

export const CROP_PRESETS: CropPreset[] = [
  // Instagram
  { id: "ig-square", label: "Square Post", platform: "Instagram", width: 1080, height: 1080, aspectRatio: 1 },
  { id: "ig-portrait", label: "Portrait Post", platform: "Instagram", width: 1080, height: 1350, aspectRatio: 1080 / 1350 },
  { id: "ig-story", label: "Story / Reel", platform: "Instagram", width: 1080, height: 1920, aspectRatio: 1080 / 1920 },
  { id: "ig-landscape", label: "Landscape Post", platform: "Instagram", width: 1080, height: 566, aspectRatio: 1080 / 566 },

  // LinkedIn
  { id: "li-post", label: "Post Image", platform: "LinkedIn", width: 1200, height: 675, aspectRatio: 16 / 9 },
  { id: "li-banner", label: "Banner", platform: "LinkedIn", width: 1584, height: 396, aspectRatio: 1584 / 396 },

  // X / Twitter
  { id: "x-post", label: "Post Image", platform: "X / Twitter", width: 1200, height: 675, aspectRatio: 16 / 9 },
  { id: "x-card", label: "Card Image", platform: "X / Twitter", width: 1200, height: 600, aspectRatio: 2 },
  { id: "x-header", label: "Header", platform: "X / Twitter", width: 1500, height: 500, aspectRatio: 3 },

  // Facebook
  { id: "fb-post", label: "Post Image", platform: "Facebook", width: 1200, height: 630, aspectRatio: 1200 / 630 },
  { id: "fb-cover", label: "Cover Photo", platform: "Facebook", width: 820, height: 312, aspectRatio: 820 / 312 },

  // Threads
  { id: "threads-post", label: "Post", platform: "Threads", width: 1080, height: 1080, aspectRatio: 1 },
  { id: "threads-portrait", label: "Portrait", platform: "Threads", width: 1080, height: 1350, aspectRatio: 1080 / 1350 },

  // Pinterest
  { id: "pin-standard", label: "Standard Pin", platform: "Pinterest", width: 1000, height: 1500, aspectRatio: 2 / 3 },
  { id: "pin-long", label: "Long Pin", platform: "Pinterest", width: 1000, height: 2100, aspectRatio: 1000 / 2100 },

  // YouTube
  { id: "yt-thumb", label: "Thumbnail", platform: "YouTube", width: 1280, height: 720, aspectRatio: 16 / 9 },
  { id: "yt-banner", label: "Channel Banner", platform: "YouTube", width: 2560, height: 1440, aspectRatio: 2560 / 1440 },

  // Bluesky
  { id: "bsky-post", label: "Post Image", platform: "Bluesky", width: 1200, height: 675, aspectRatio: 16 / 9 },
  { id: "bsky-header", label: "Header", platform: "Bluesky", width: 1500, height: 500, aspectRatio: 3 },
];

export function getPresetsByPlatform(): Record<string, CropPreset[]> {
  const grouped: Record<string, CropPreset[]> = {};
  for (const preset of CROP_PRESETS) {
    if (!grouped[preset.platform]) grouped[preset.platform] = [];
    grouped[preset.platform].push(preset);
  }
  return grouped;
}
