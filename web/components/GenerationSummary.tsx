"use client";

import { useState } from "react";
import type { Model } from "@/lib/gemini";
import { estimateCost, formatCost } from "@/lib/pricing";

interface GenerationSummaryProps {
  model: Model;
  variations: number;
  prompt: string;
  aestheticPrefix: string;
}

export default function GenerationSummary({ model, variations, prompt, aestheticPrefix }: GenerationSummaryProps) {
  const [previewOpen, setPreviewOpen] = useState(false);

  const cost = estimateCost(model, variations);
  const costLabel = formatCost(cost);
  const qualityLabel = model === "nano-banana-2" ? "Fast quality" : "Best quality";
  const imageWord = variations === 1 ? "image" : "images";

  // Color-code the cost
  let costColor = "text-sage"; // < $0.10
  if (cost >= 0.30) costColor = "text-burnt-orange";
  else if (cost >= 0.10) costColor = "text-charcoal";

  const fullPrompt = [aestheticPrefix, prompt].filter(Boolean).join("\n\n");

  return (
    <div className="rounded-lg bg-cream border border-cream-dark px-3 py-2 space-y-1.5">
      <div className="flex items-center gap-2 text-xs">
        <span className={`font-semibold ${costColor}`}>{costLabel}</span>
        <span className="text-charcoal-soft/40">&middot;</span>
        <span className="text-charcoal-soft">{variations} {imageWord}</span>
        <span className="text-charcoal-soft/40">&middot;</span>
        <span className="text-charcoal-soft">{qualityLabel}</span>
      </div>

      <button
        type="button"
        onClick={() => setPreviewOpen((o) => !o)}
        className="text-xs text-charcoal-soft hover:text-sage flex items-center gap-1 transition-colors"
      >
        <span>{previewOpen ? "▾" : "▸"}</span>
        <span>Preview what will be sent</span>
      </button>

      {previewOpen && (
        <div className="space-y-2">
          <div className="rounded-lg bg-white border border-cream-dark p-3 text-xs leading-relaxed whitespace-pre-wrap">
            {aestheticPrefix && (
              <span className="text-charcoal-soft text-[11px]">{aestheticPrefix}{"\n\n"}</span>
            )}
            <span className="text-charcoal">{prompt}</span>
          </div>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(fullPrompt)}
            className="text-xs text-charcoal-soft hover:text-sage transition-colors"
          >
            Copy full prompt
          </button>
        </div>
      )}
    </div>
  );
}
