/**
 * Color conversion and contrast ratio utilities.
 * Uses culori for advanced color space conversions.
 */

import { parse, formatHex, formatRgb, converter } from "culori";
import type { Rgb } from "culori";

export interface ColorValue {
  hex: string;
  rgb: [number, number, number];
  hsl: [number, number, number];
}

/** Parse any CSS color string into a normalized ColorValue, or null if invalid. */
export function parseColor(input: string): ColorValue | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // If it looks like a hex without #, try prepending
  const maybeHex = /^[0-9a-fA-F]{3,8}$/.test(trimmed) ? `#${trimmed}` : trimmed;

  const parsed = parse(maybeHex);
  if (!parsed) return null;

  const toRgb = converter("rgb");
  const rgb = toRgb(parsed) as Rgb;
  if (!rgb || rgb.r == null || rgb.g == null || rgb.b == null) return null;

  const r = Math.round(clamp01(rgb.r) * 255);
  const g = Math.round(clamp01(rgb.g) * 255);
  const b = Math.round(clamp01(rgb.b) * 255);

  const hex = formatHex({ mode: "rgb", r: rgb.r, g: rgb.g, b: rgb.b });

  const [h, s, l] = rgbToHsl(r, g, b);

  return { hex, rgb: [r, g, b], hsl: [h, s, l] };
}

/** Convert RGB [0-255] to HSL [0-360, 0-100, 0-100]. */
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;

  if (max === min) return [0, 0, Math.round(l * 100)];

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

// --- WCAG Contrast Ratio ---

/** sRGB channel linearization per WCAG 2.1. Input: 0-255. */
function linearize(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/** Relative luminance per WCAG 2.1. Input: RGB 0-255 tuple. */
export function relativeLuminance(rgb: [number, number, number]): number {
  return 0.2126 * linearize(rgb[0]) + 0.7152 * linearize(rgb[1]) + 0.0722 * linearize(rgb[2]);
}

/** WCAG 2.1 contrast ratio between two colors. Returns value like 4.5 (for 4.5:1). */
export function contrastRatio(a: [number, number, number], b: [number, number, number]): number {
  const lA = relativeLuminance(a);
  const lB = relativeLuminance(b);
  const lighter = Math.max(lA, lB);
  const darker = Math.min(lA, lB);
  return (lighter + 0.05) / (darker + 0.05);
}

export interface WcagResult {
  ratio: number;
  aa: boolean;       // Normal text ≥ 4.5:1
  aaLarge: boolean;  // Large text ≥ 3:1
  aaa: boolean;      // Normal text ≥ 7:1
  aaaLarge: boolean; // Large text ≥ 4.5:1
}

export function checkWcag(fg: [number, number, number], bg: [number, number, number]): WcagResult {
  const ratio = contrastRatio(fg, bg);
  return {
    ratio,
    aa: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaa: ratio >= 7,
    aaaLarge: ratio >= 4.5,
  };
}
