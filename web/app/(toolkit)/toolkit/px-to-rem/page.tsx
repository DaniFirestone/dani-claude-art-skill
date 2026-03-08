"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowRightLeft, Copy, Type } from "lucide-react";
import { cn } from "@/lib/cn";
import { pxToRem, remToPx } from "@/lib/tools/typography";
import { copyToClipboard } from "@/lib/tools/clipboard";

const COMMON_PX = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64];

export default function PxToRemPage() {
  return (
    <Suspense>
      <PxToRemContent />
    </Suspense>
  );
}

function PxToRemContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [value, setValue] = useState(searchParams.get("v") || "16");
  const [base, setBase] = useState(searchParams.get("base") || "16");
  const [mode, setMode] = useState<"px" | "rem">(
    searchParams.get("mode") === "rem" ? "rem" : "px"
  );

  const numValue = parseFloat(value) || 0;
  const numBase = parseFloat(base) || 16;

  const result = useMemo(() => {
    if (mode === "px") return pxToRem(numValue, numBase);
    return remToPx(numValue, numBase);
  }, [numValue, numBase, mode]);

  const resultUnit = mode === "px" ? "rem" : "px";
  const resultStr = Number.isFinite(result)
    ? parseFloat(result.toFixed(6)).toString()
    : "—";

  function updateUrl(v: string, b: string, m: string) {
    const params = new URLSearchParams();
    if (v && v !== "16") params.set("v", v);
    if (b && b !== "16") params.set("base", b);
    if (m === "rem") params.set("mode", "rem");
    const qs = params.toString();
    router.replace(`/toolkit/px-to-rem${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  function handleValueChange(v: string) {
    setValue(v);
    updateUrl(v, base, mode);
  }

  function handleBaseChange(b: string) {
    setBase(b);
    updateUrl(value, b, mode);
  }

  function toggleMode() {
    const newMode = mode === "px" ? "rem" : "px";
    setMode(newMode);
    // Swap: put the result as the new input
    const newValue = resultStr !== "—" ? resultStr : value;
    setValue(newValue);
    updateUrl(newValue, base, newMode);
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Type className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-headline font-bold tracking-tight">
            PX to REM
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Convert between pixels and rem units based on your root font size
        </p>
      </div>

      {/* Converter */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-8">
        {/* Base font size */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Base font size (px)
          </label>
          <input
            type="number"
            value={base}
            onChange={(e) => handleBaseChange(e.target.value)}
            min={1}
            className="w-24 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
          />
        </div>

        {/* Input → Output */}
        <div className="flex items-center gap-4">
          {/* Input */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              {mode === "px" ? "Pixels" : "REM"}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => handleValueChange(e.target.value)}
              step="any"
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
              autoFocus
            />
          </div>

          {/* Swap */}
          <button
            onClick={toggleMode}
            className="mt-5 p-2.5 rounded-xl border border-border hover:bg-accent transition-colors"
            title="Swap direction"
          >
            <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Output */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              {resultUnit === "rem" ? "REM" : "Pixels"}
            </label>
            <div
              className="relative w-full px-4 py-3 bg-primary/5 border border-primary/20 rounded-xl text-lg font-mono cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={() =>
                copyToClipboard(
                  `${resultStr}${resultUnit}`,
                  `Copied ${resultStr}${resultUnit}`
                )
              }
              title="Click to copy"
            >
              {resultStr}
              <span className="text-muted-foreground text-sm ml-1">{resultUnit}</span>
              <Copy className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
            </div>
          </div>
        </div>
      </div>

      {/* Reference table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-xs font-headline font-bold uppercase tracking-widest text-muted-foreground">
            Quick Reference (base: {numBase}px)
          </h2>
        </div>
        <div className="divide-y divide-border">
          {COMMON_PX.map((px) => {
            const rem = pxToRem(px, numBase);
            const remStr = parseFloat(rem.toFixed(6)).toString();
            return (
              <div
                key={px}
                className={cn(
                  "flex items-center justify-between px-6 py-2.5 text-sm hover:bg-accent/50 transition-colors cursor-pointer",
                  px === numValue && mode === "px" && "bg-primary/5"
                )}
                onClick={() => {
                  handleValueChange(px.toString());
                  if (mode !== "px") {
                    setMode("px");
                    updateUrl(px.toString(), base, "px");
                  }
                }}
              >
                <span className="font-mono text-muted-foreground">{px}px</span>
                <span className="font-mono font-medium">{remStr}rem</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
