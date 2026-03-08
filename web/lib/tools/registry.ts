import {
  Crop,
  Frame,
  GalleryHorizontalEnd,
  Stamp,
  ArrowLeftRight,
  Sparkles,
  QrCode,
  ImageIcon,
  Palette,
  Contrast,
  EyeOff,
  Grid3x3,
  Globe,
  FileImage,
  Scissors,
  PenTool,
  Type,
  Ruler,
  Calculator,
  Hash,
  Regex,
  SmilePlus,
  FileSearch,
  Code,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ToolCategory } from "./types";

export interface ToolMeta {
  id: string;
  label: string;
  description: string;
  category: ToolCategory;
  icon: LucideIcon;
  /** Tools that can receive images from the AI pipeline via "Open in..." */
  acceptsImageInput?: boolean;
  /** Desktop-recommended tools show a hint on mobile */
  desktopRecommended?: boolean;
}

export const TOOLS: ToolMeta[] = [
  // --- Content Tools (Tier 1) ---
  {
    id: "social-cropper",
    label: "Social Cropper",
    description: "Crop images to exact platform dimensions for social media",
    category: "content",
    icon: Crop,
    acceptsImageInput: true,
  },
  {
    id: "matte-gen",
    label: "Matte Generator",
    description: "Place images on styled backgrounds for social posting",
    category: "content",
    icon: Frame,
    acceptsImageInput: true,
  },
  {
    id: "scroll-gen",
    label: "Scroll Generator",
    description: "Split images into seamless carousel slides",
    category: "content",
    icon: GalleryHorizontalEnd,
    acceptsImageInput: true,
    desktopRecommended: true,
  },
  {
    id: "watermarker",
    label: "Watermarker",
    description: "Add text or logo watermarks to protect your images",
    category: "content",
    icon: Stamp,
    acceptsImageInput: true,
  },
  {
    id: "img-converter",
    label: "Image Converter",
    description: "Convert between PNG, JPEG, WebP, and AVIF with quality control",
    category: "content",
    icon: ArrowLeftRight,
    acceptsImageInput: true,
  },
  {
    id: "artwork-enhancer",
    label: "Artwork Enhancer",
    description: "Add film grain, noise, halftone, or texture overlays",
    category: "content",
    icon: Sparkles,
    acceptsImageInput: true,
    desktopRecommended: true,
  },
  {
    id: "qr-gen",
    label: "QR Code Generator",
    description: "Generate styled, branded QR codes with custom shapes and logos",
    category: "content",
    icon: QrCode,
  },
  {
    id: "placeholder-gen",
    label: "Placeholder Generator",
    description: "Generate placeholder images at any size for mockups",
    category: "content",
    icon: ImageIcon,
  },

  // --- Design Tools (Tier 2) ---
  {
    id: "harmony-gen",
    label: "Color Harmony",
    description: "Generate complementary, triadic, and analogous color palettes",
    category: "design",
    icon: Palette,
  },
  {
    id: "contrast-checker",
    label: "Contrast Checker",
    description: "Test color pairs against WCAG accessibility standards",
    category: "design",
    icon: Contrast,
  },
  {
    id: "cvd-sim",
    label: "Color Blindness Sim",
    description: "Preview how colors and images appear under color vision deficiency",
    category: "design",
    icon: EyeOff,
    acceptsImageInput: true,
    desktopRecommended: true,
  },
  {
    id: "img-splitter",
    label: "Image Splitter",
    description: "Split images into grid tiles for Instagram mosaics or sprites",
    category: "design",
    icon: Grid3x3,
    acceptsImageInput: true,
  },
  {
    id: "favicon-gen",
    label: "Favicon Generator",
    description: "Generate a complete favicon package from any image",
    category: "design",
    icon: Globe,
    acceptsImageInput: true,
  },
  {
    id: "svg-optimiser",
    label: "SVG Optimiser",
    description: "Strip metadata and optimize SVG files for the web",
    category: "design",
    icon: FileImage,
    desktopRecommended: true,
  },
  {
    id: "img-tracer",
    label: "Image Tracer",
    description: "Convert raster images to SVG vector paths",
    category: "design",
    icon: PenTool,
    acceptsImageInput: true,
    desktopRecommended: true,
  },
  {
    id: "meta-tag-gen",
    label: "Meta Tag Generator",
    description: "Generate SEO and social media meta tags with live previews",
    category: "design",
    icon: Code,
  },

  // --- Utility Grab Bag (Tier 3) ---
  {
    id: "px-to-rem",
    label: "PX to REM",
    description: "Convert between pixels and rem units instantly",
    category: "utility",
    icon: Type,
  },
  {
    id: "line-height-calc",
    label: "Line Height Calculator",
    description: "Calculate optimal line-height for readable text",
    category: "utility",
    icon: Ruler,
  },
  {
    id: "typo-calc",
    label: "Typography Calculator",
    description: "Convert between px, pt, rem, em, pica, cicero, and more",
    category: "utility",
    icon: Calculator,
  },
  {
    id: "encoder",
    label: "Encode / Decode",
    description: "Base64, URL encoding, and hash generation in one view",
    category: "utility",
    icon: Hash,
  },
  {
    id: "regex-tester",
    label: "Regex Tester",
    description: "Write and test regular expressions with live highlighting",
    category: "utility",
    icon: Regex,
    desktopRecommended: true,
  },
  {
    id: "glyph-browser",
    label: "Glyph & Emoji Browser",
    description: "Browse, search, and copy Unicode characters and emoji",
    category: "utility",
    icon: SmilePlus,
  },
  {
    id: "pdf-preflight",
    label: "PDF Preflight",
    description: "Check PDFs for print-readiness issues before sending to press",
    category: "utility",
    icon: FileSearch,
    desktopRecommended: true,
  },
];

export const TOOL_CATEGORIES: Record<ToolCategory, { label: string; description: string }> = {
  content: {
    label: "Content Tools",
    description: "Create, crop, convert, and enhance marketing assets",
  },
  design: {
    label: "Design Tools",
    description: "Colors, accessibility, icons, and vector tools",
  },
  utility: {
    label: "Utilities",
    description: "Typography, encoding, regex, and reference tools",
  },
};

export function getToolsByCategory(category: ToolCategory): ToolMeta[] {
  return TOOLS.filter((t) => t.category === category);
}

export function getToolById(id: string): ToolMeta | undefined {
  return TOOLS.find((t) => t.id === id);
}

export function getImageAcceptingTools(): ToolMeta[] {
  return TOOLS.filter((t) => t.acceptsImageInput);
}
