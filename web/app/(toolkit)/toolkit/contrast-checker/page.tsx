"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Contrast, ArrowRightLeft, Check, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { parseColor, checkWcag } from "@/lib/tools/color";
import type { ColorValue, WcagResult } from "@/lib/tools/color";

export default function ContrastCheckerPage() {
  return (
    <Suspense>
      <ContrastCheckerContent />
    </Suspense>
  );
}

function ContrastCheckerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [fgInput, setFgInput] = useState(searchParams.get("fg") || "#000000");
  const [bgInput, setBgInput] = useState(searchParams.get("bg") || "#ffffff");

  const fg = useMemo(() => parseColor(fgInput), [fgInput]);
  const bg = useMemo(() => parseColor(bgInput), [bgInput]);

  const wcag: WcagResult | null = useMemo(() => {
    if (!fg || !bg) return null;
    return checkWcag(fg.rgb, bg.rgb);
  }, [fg, bg]);

  function updateUrl(fgVal: string, bgVal: string) {
    const params = new URLSearchParams();
    if (fgVal !== "#000000") params.set("fg", fgVal);
    if (bgVal !== "#ffffff") params.set("bg", bgVal);
    const qs = params.toString();
    router.replace(`/toolkit/contrast-checker${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  function handleFgChange(v: string) {
    setFgInput(v);
    updateUrl(v, bgInput);
  }

  function handleBgChange(v: string) {
    setBgInput(v);
    updateUrl(fgInput, v);
  }

  function swap() {
    setFgInput(bgInput);
    setBgInput(fgInput);
    updateUrl(bgInput, fgInput);
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Contrast className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-headline font-bold tracking-tight">
            Contrast Checker
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Test color pairs against WCAG 2.1 accessibility standards
        </p>
      </div>

      {/* Color inputs */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="flex items-end gap-4">
          <ColorField
            label="Foreground"
            value={fgInput}
            parsed={fg}
            onChange={handleFgChange}
          />
          <button
            onClick={swap}
            className="mb-1 p-2.5 rounded-xl border border-border hover:bg-accent transition-colors"
            title="Swap colors"
          >
            <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <ColorField
            label="Background"
            value={bgInput}
            parsed={bg}
            onChange={handleBgChange}
          />
        </div>
      </div>

      {/* Results */}
      {wcag && fg && bg && (
        <>
          {/* Ratio display */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-6 text-center">
            <div className="text-4xl font-headline font-bold tracking-tight mb-1">
              {wcag.ratio.toFixed(2)}
              <span className="text-lg text-muted-foreground font-normal">:1</span>
            </div>
            <p className="text-xs text-muted-foreground">Contrast ratio</p>
          </div>

          {/* WCAG badges */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <WcagBadge label="AA Normal" sublabel="≥ 4.5:1" pass={wcag.aa} />
            <WcagBadge label="AA Large" sublabel="≥ 3.0:1" pass={wcag.aaLarge} />
            <WcagBadge label="AAA Normal" sublabel="≥ 7.0:1" pass={wcag.aaa} />
            <WcagBadge label="AAA Large" sublabel="≥ 4.5:1" pass={wcag.aaaLarge} />
          </div>

          {/* Live preview */}
          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-xs font-headline font-bold uppercase tracking-widest text-muted-foreground">
                Preview
              </h2>
            </div>
            <div
              className="p-8 space-y-3"
              style={{ backgroundColor: bg.hex }}
            >
              {[14, 18, 24, 32].map((size) => (
                <p
                  key={size}
                  style={{ color: fg.hex, fontSize: `${size}px` }}
                  className="font-sans leading-snug"
                >
                  The quick brown fox ({size}px)
                </p>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ColorField({
  label,
  value,
  parsed,
  onChange,
}: {
  label: string;
  value: string;
  parsed: ColorValue | null;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex-1">
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={parsed?.hex || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-border cursor-pointer shrink-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className={cn(
            "flex-1 px-3 py-2.5 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20",
            parsed
              ? "bg-background border-border"
              : "bg-destructive/5 border-destructive/20"
          )}
        />
      </div>
      {parsed && (
        <p className="text-[10px] text-muted-foreground mt-1 font-mono">
          rgb({parsed.rgb.join(", ")}) &middot; hsl({parsed.hsl[0]}, {parsed.hsl[1]}%, {parsed.hsl[2]}%)
        </p>
      )}
    </div>
  );
}

function WcagBadge({
  label,
  sublabel,
  pass,
}: {
  label: string;
  sublabel: string;
  pass: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 rounded-xl border",
        pass
          ? "bg-emerald-500/5 border-emerald-500/20"
          : "bg-destructive/5 border-destructive/20"
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
          pass ? "bg-emerald-500/10" : "bg-destructive/10"
        )}
      >
        {pass ? (
          <Check className="w-4 h-4 text-emerald-600" />
        ) : (
          <X className="w-4 h-4 text-destructive" />
        )}
      </div>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{sublabel}</p>
      </div>
    </div>
  );
}
