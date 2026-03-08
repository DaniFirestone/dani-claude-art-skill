/**
 * Typography unit conversion.
 * All conversions go through points as the common base unit.
 */

export interface TypographyContext {
  /** Dots per inch — affects pixel ↔ physical unit conversion. Default 96. */
  dpi: number;
  /** Base font size in px — affects em and rem. Default 16. */
  baseFontSize: number;
}

const DEFAULT_CONTEXT: TypographyContext = { dpi: 96, baseFontSize: 16 };

// Conversion factors TO points
function toPoints(value: number, unit: string, ctx: TypographyContext): number {
  switch (unit) {
    case "px":
      return value * (72 / ctx.dpi);
    case "pt":
      return value;
    case "rem":
    case "em":
      return value * ctx.baseFontSize * (72 / ctx.dpi);
    case "pica":
      return value * 12;
    case "in":
      return value * 72;
    case "mm":
      return value * (72 / 25.4);
    case "cm":
      return value * (72 / 2.54);
    case "cicero":
      return value * 12 * (0.376065 / 0.352778);
    case "didot":
      return value * (0.376065 / 0.352778);
    case "agate":
      return value * (72 / 14); // 1 agate = 1/14 inch
    default:
      return value;
  }
}

// Conversion factors FROM points
function fromPoints(points: number, unit: string, ctx: TypographyContext): number {
  switch (unit) {
    case "px":
      return points * (ctx.dpi / 72);
    case "pt":
      return points;
    case "rem":
    case "em":
      return points / (ctx.baseFontSize * (72 / ctx.dpi));
    case "pica":
      return points / 12;
    case "in":
      return points / 72;
    case "mm":
      return points * (25.4 / 72);
    case "cm":
      return points * (2.54 / 72);
    case "cicero":
      return points / (12 * (0.376065 / 0.352778));
    case "didot":
      return points / (0.376065 / 0.352778);
    case "agate":
      return points / (72 / 14);
    default:
      return points;
  }
}

export function convert(
  value: number,
  from: string,
  to: string,
  ctx: Partial<TypographyContext> = {}
): number {
  const full = { ...DEFAULT_CONTEXT, ...ctx };
  if (from === to) return value;
  const points = toPoints(value, from, full);
  return fromPoints(points, to, full);
}

/** Quick px ↔ rem conversion */
export function pxToRem(px: number, base = 16): number {
  return px / base;
}

export function remToPx(rem: number, base = 16): number {
  return rem * base;
}

export const UNITS = [
  { id: "px", label: "Pixels" },
  { id: "rem", label: "REM" },
  { id: "em", label: "EM" },
  { id: "pt", label: "Points" },
  { id: "pica", label: "Picas" },
  { id: "in", label: "Inches" },
  { id: "mm", label: "Millimeters" },
  { id: "cm", label: "Centimeters" },
  { id: "cicero", label: "Ciceros" },
  { id: "didot", label: "Didots" },
  { id: "agate", label: "Agates" },
] as const;
