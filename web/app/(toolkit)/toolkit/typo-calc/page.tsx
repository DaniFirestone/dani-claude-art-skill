"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { convert, UNITS, type TypographyContext } from "@/lib/tools/typography";
import { copyToClipboard } from "@/lib/tools/clipboard";

export default function TypoCalcPage() {
  const [value, setValue] = useState(16);
  const [sourceUnit, setSourceUnit] = useState("px");
  const [dpi, setDpi] = useState(96);
  const [baseFontSize, setBaseFontSize] = useState(16);

  const ctx: Partial<TypographyContext> = { dpi, baseFontSize };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Calculator className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-headline font-bold tracking-tight">Typography Calculator</h1>
        </div>
        <p className="text-muted-foreground text-sm">Convert between px, pt, rem, em, pica, cicero, and more</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Input + settings */}
        <div className="lg:w-64 shrink-0 space-y-4">
          <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
            {/* Value input */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Value</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="any"
                  value={value}
                  onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                  className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
                <select
                  value={sourceUnit}
                  onChange={(e) => setSourceUnit(e.target.value)}
                  className="bg-muted border border-border rounded-lg px-2 py-2 text-xs"
                >
                  {UNITS.map((u) => (
                    <option key={u.id} value={u.id}>{u.id}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* DPI */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                DPI: {dpi}
              </label>
              <div className="flex gap-2">
                <input
                  type="range"
                  min={72}
                  max={600}
                  value={dpi}
                  onChange={(e) => setDpi(parseInt(e.target.value))}
                  className="flex-1 accent-primary"
                />
              </div>
              <div className="flex gap-2 mt-1.5">
                {[72, 96, 150, 300].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDpi(d)}
                    className={`text-[10px] px-2 py-0.5 rounded transition-colors ${dpi === d ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"}`}
                  >
                    {d}{d === 96 ? " (screen)" : d === 300 ? " (print)" : ""}
                  </button>
                ))}
              </div>
            </div>

            {/* Base font size */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Base font size: {baseFontSize}px
              </label>
              <input
                type="range"
                min={8}
                max={32}
                value={baseFontSize}
                onChange={(e) => setBaseFontSize(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">Affects em &amp; rem calculations</p>
            </div>
          </div>
        </div>

        {/* Conversion table */}
        <div className="flex-1 min-w-0">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Unit</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-2.5">Value</th>
                </tr>
              </thead>
              <tbody>
                {UNITS.map((u) => {
                  const converted = convert(value, sourceUnit, u.id, ctx);
                  const displayVal = Math.abs(converted) < 0.001 && converted !== 0
                    ? converted.toExponential(3)
                    : converted < 100
                      ? converted.toFixed(4).replace(/\.?0+$/, "")
                      : converted.toFixed(2).replace(/\.?0+$/, "");
                  const isSource = u.id === sourceUnit;
                  return (
                    <tr
                      key={u.id}
                      className={`border-b border-border last:border-0 transition-colors cursor-pointer hover:bg-accent/50 ${isSource ? "bg-primary/5" : ""}`}
                      onClick={() => copyToClipboard(`${displayVal}${u.id}`, u.label)}
                    >
                      <td className="px-4 py-2.5">
                        <span className="text-sm font-medium">{u.label}</span>
                        <span className="text-xs text-muted-foreground ml-1.5">({u.id})</span>
                        {u.id === "agate" && (
                          <span className="text-[10px] text-muted-foreground/60 ml-1" title="Used in newspaper column-inch advertising">*</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-sm">
                        {displayVal}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-muted-foreground/60 mt-2">Click any row to copy. * Agate: used in newspaper column-inch advertising (1/14 inch).</p>
        </div>
      </div>
    </div>
  );
}
