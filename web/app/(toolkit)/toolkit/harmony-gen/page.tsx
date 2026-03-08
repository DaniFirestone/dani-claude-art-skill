"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Palette, Copy } from "lucide-react";
import { cn } from "@/lib/cn";
import { parseColor } from "@/lib/tools/color";
import type { ColorValue } from "@/lib/tools/color";
import { copyToClipboard } from "@/lib/tools/clipboard";

interface Harmony {
  label: string;
  description: string;
  offsets: number[]; // hue offsets in degrees
}

const HARMONIES: Harmony[] = [
  { label: "Complementary", description: "Opposite on the color wheel", offsets: [0, 180] },
  { label: "Analogous", description: "Adjacent colors", offsets: [-30, 0, 30] },
  { label: "Triadic", description: "Three equally spaced", offsets: [0, 120, 240] },
  { label: "Split-Complementary", description: "Complement's neighbors", offsets: [0, 150, 210] },
  { label: "Tetradic", description: "Four equally spaced", offsets: [0, 90, 180, 270] },
  { label: "Monochromatic", description: "Same hue, varied lightness", offsets: [] },
];

function hslToHex(h: number, s: number, l: number): string {
  const hNorm = h / 360;
  const sNorm = s / 100;
  const lNorm = l / 100;

  function hue2rgb(p: number, q: number, t: number) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }

  let r: number, g: number, b: number;
  if (sNorm === 0) {
    r = g = b = lNorm;
  } else {
    const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
    const p = 2 * lNorm - q;
    r = hue2rgb(p, q, hNorm + 1 / 3);
    g = hue2rgb(p, q, hNorm);
    b = hue2rgb(p, q, hNorm - 1 / 3);
  }

  const toHex = (c: number) =>
    Math.round(c * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function generateHarmony(base: ColorValue, harmony: Harmony): string[] {
  const [h, s, l] = base.hsl;

  if (harmony.offsets.length === 0) {
    // Monochromatic: vary lightness
    return [
      hslToHex(h, s, Math.max(10, l - 30)),
      hslToHex(h, s, Math.max(10, l - 15)),
      hslToHex(h, s, l),
      hslToHex(h, Math.max(0, s - 15), Math.min(90, l + 15)),
      hslToHex(h, Math.max(0, s - 25), Math.min(95, l + 30)),
    ];
  }

  return harmony.offsets.map((offset) => hslToHex((h + offset + 360) % 360, s, l));
}

export default function HarmonyGenPage() {
  return (
    <Suspense>
      <HarmonyGenContent />
    </Suspense>
  );
}

function HarmonyGenContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [colorInput, setColorInput] = useState(searchParams.get("base") || "#1A6B6B");

  const baseColor = useMemo(() => parseColor(colorInput), [colorInput]);

  function handleChange(v: string) {
    setColorInput(v);
    const params = new URLSearchParams();
    if (v && v !== "#1A6B6B") params.set("base", v);
    const qs = params.toString();
    router.replace(`/toolkit/harmony-gen${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Palette className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-headline font-bold tracking-tight">Color Harmony</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Generate mathematically related color palettes from a base color
        </p>
      </div>

      {/* Base color input */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-8">
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Base color</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={baseColor?.hex || "#000000"}
            onChange={(e) => handleChange(e.target.value)}
            className="w-12 h-12 rounded-xl border border-border cursor-pointer shrink-0"
          />
          <input
            type="text"
            value={colorInput}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="#1A6B6B"
            className={cn(
              "flex-1 px-4 py-3 border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20",
              baseColor ? "bg-background border-border" : "bg-destructive/5 border-destructive/20"
            )}
          />
        </div>
        {baseColor && (
          <p className="text-[10px] text-muted-foreground mt-2 font-mono">
            rgb({baseColor.rgb.join(", ")}) &middot; hsl({baseColor.hsl[0]}, {baseColor.hsl[1]}%, {baseColor.hsl[2]}%)
          </p>
        )}
        {baseColor && baseColor.hsl[1] < 5 && (
          <p className="text-xs text-amber-600 mt-2">
            Neutral colors don&apos;t produce meaningful hue-based harmonies. Try adding saturation.
          </p>
        )}
      </div>

      {/* Harmony sets */}
      {baseColor && (
        <div className="space-y-6">
          {HARMONIES.map((harmony) => {
            const colors = generateHarmony(baseColor, harmony);
            return (
              <div key={harmony.label} className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-border">
                  <h3 className="text-sm font-headline font-semibold">{harmony.label}</h3>
                  <p className="text-xs text-muted-foreground">{harmony.description}</p>
                </div>
                <div className="flex">
                  {colors.map((hex, i) => (
                    <button
                      key={`${hex}-${i}`}
                      className="flex-1 group relative"
                      onClick={() => copyToClipboard(hex, `Copied ${hex}`)}
                      title={`Click to copy ${hex}`}
                    >
                      <div className="h-20" style={{ backgroundColor: hex }} />
                      <div className="px-2 py-2 text-center">
                        <span className="text-[10px] font-mono text-muted-foreground group-hover:text-primary transition-colors">
                          {hex}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
