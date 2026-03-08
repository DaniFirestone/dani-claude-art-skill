"use client";

import { useState, useMemo } from "react";
import { Ruler } from "lucide-react";
import { cn } from "@/lib/cn";
import { convert } from "@/lib/tools/typography";

type ContentType = "body" | "heading" | "caption" | "ui";

const CONTENT_TYPES: { id: ContentType; label: string; baseMin: number; baseMax: number }[] = [
  { id: "body", label: "Body Text", baseMin: 1.4, baseMax: 1.8 },
  { id: "heading", label: "Headings", baseMin: 1.1, baseMax: 1.3 },
  { id: "caption", label: "Captions", baseMin: 1.2, baseMax: 1.5 },
  { id: "ui", label: "UI Labels", baseMin: 1.2, baseMax: 1.5 },
];

type FontUnit = "px" | "pt" | "rem";

const SAMPLE_TEXT = "The quick brown fox jumps over the lazy dog. Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed. Good line height improves readability by giving each line of text enough breathing room.";

export default function LineHeightCalcPage() {
  const [fontSize, setFontSize] = useState(16);
  const [fontUnit, setFontUnit] = useState<FontUnit>("px");
  const [contentType, setContentType] = useState<ContentType>("body");
  const [lineLength, setLineLength] = useState(65); // chars per line
  const [override, setOverride] = useState<number | null>(null);

  const fontSizePx = useMemo(() => {
    if (fontUnit === "px") return fontSize;
    return convert(fontSize, fontUnit, "px");
  }, [fontSize, fontUnit]);

  const ct = CONTENT_TYPES.find((c) => c.id === contentType)!;

  const recommended = useMemo(() => {
    const midRatio = (ct.baseMin + ct.baseMax) / 2;
    // Adjust for line length: longer lines need more leading
    const adjustment = (lineLength - 45) * 0.005;
    return Math.min(ct.baseMax, Math.max(ct.baseMin, midRatio + adjustment));
  }, [contentType, lineLength]);

  const ratio = override ?? recommended;
  const lineHeightPx = fontSizePx * ratio;

  const outOfRange = fontSizePx < 8 || fontSizePx > 120;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Ruler className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-headline font-bold tracking-tight">Line Height Calculator</h1>
        </div>
        <p className="text-muted-foreground text-sm">Calculate optimal line-height for readable text</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Controls */}
        <div className="lg:w-64 shrink-0 space-y-4">
          <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
            {/* Font size */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Font size</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={fontSize}
                  onChange={(e) => { setFontSize(parseFloat(e.target.value) || 0); setOverride(null); }}
                  className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
                <select
                  value={fontUnit}
                  onChange={(e) => { setFontUnit(e.target.value as FontUnit); setOverride(null); }}
                  className="bg-muted border border-border rounded-lg px-2 py-2 text-xs"
                >
                  <option value="px">px</option>
                  <option value="pt">pt</option>
                  <option value="rem">rem</option>
                </select>
              </div>
            </div>

            {/* Content type */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Content type</label>
              <div className="space-y-1">
                {CONTENT_TYPES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setContentType(c.id); setOverride(null); }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-colors",
                      contentType === c.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
                    )}
                  >
                    {c.label}
                    <span className="text-muted-foreground/60 ml-1">({c.baseMin}–{c.baseMax}×)</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Line length */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Line length: {lineLength} chars
              </label>
              <input
                type="range"
                min={20}
                max={120}
                value={lineLength}
                onChange={(e) => { setLineLength(parseInt(e.target.value)); setOverride(null); }}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground/50">
                <span>20</span>
                <span>Optimal: 45–75</span>
                <span>120</span>
              </div>
            </div>

            {/* Manual override */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Override ratio
              </label>
              <input
                type="range"
                min={100}
                max={300}
                value={Math.round((override ?? recommended) * 100)}
                onChange={(e) => setOverride(parseInt(e.target.value) / 100)}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                <span>{override ? `${ratio.toFixed(2)}× (manual)` : `${ratio.toFixed(2)}× (recommended)`}</span>
                {override && (
                  <button onClick={() => setOverride(null)} className="text-primary hover:underline">Reset</button>
                )}
              </div>
            </div>
          </div>

          {outOfRange && (
            <p className="text-xs text-amber-500">Font size is outside typical range (8–120px). Guidelines may not apply cleanly.</p>
          )}
        </div>

        {/* Results + Preview */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Results table */}
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-xs font-medium text-muted-foreground mb-3">Line height values</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Unitless", value: ratio.toFixed(3) },
                { label: "Pixels", value: `${lineHeightPx.toFixed(1)}px` },
                { label: "REM", value: `${(lineHeightPx / 16).toFixed(3)}rem` },
                { label: "EM", value: `${ratio.toFixed(3)}em` },
                { label: "Percent", value: `${(ratio * 100).toFixed(1)}%` },
                { label: "Points", value: `${convert(lineHeightPx, "px", "pt").toFixed(1)}pt` },
              ].map((item) => (
                <div key={item.label} className="text-center p-2 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-mono font-medium mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Live preview */}
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-xs font-medium text-muted-foreground mb-3">Preview</p>
            <div
              className="text-foreground"
              style={{
                fontSize: `${fontSizePx}px`,
                lineHeight: ratio,
                maxWidth: `${lineLength}ch`,
              }}
            >
              {SAMPLE_TEXT}
            </div>
          </div>

          {/* CSS snippet */}
          <div className="bg-muted border border-border rounded-xl p-3">
            <p className="text-[10px] text-muted-foreground mb-1">CSS</p>
            <code className="text-xs font-mono text-foreground">
              font-size: {fontUnit === "rem" ? `${fontSize}rem` : `${fontSizePx}px`}; line-height: {ratio.toFixed(3)};
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
