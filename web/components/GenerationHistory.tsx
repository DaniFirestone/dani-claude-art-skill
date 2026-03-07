"use client";

import Image from "next/image";
import { useArtStudioStore } from "@/lib/store";
import type { HistoryEntry } from "@/lib/store";

export default function GenerationHistory() {
  const { history, clearHistory, setFormValues, setGenerationResult } = useArtStudioStore();

  if (history.length === 0) return null;

  function handleRestore(entry: HistoryEntry) {
    setFormValues({
      model: entry.model,
      size: entry.size,
      aspectRatio: entry.aspectRatio,
      prompt: entry.prompt,
    });
    setGenerationResult({
      imageUrls: [entry.imageUrl],
      finalPrompt: entry.prompt,
    });
  }

  return (
    <div className="border-t border-cream-dark pt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-charcoal-soft">
          Your recent work
        </h3>
        <button
          onClick={clearHistory}
          className="text-xs text-charcoal-soft hover:text-red-400 transition-colors"
        >
          Clear all
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {history.map((entry) => (
          <button
            key={entry.id}
            onClick={() => handleRestore(entry)}
            title={entry.prompt}
            className="shrink-0 w-20 h-14 rounded-lg overflow-hidden border border-cream-dark hover:border-sage transition-colors group relative bg-cream"
          >
            <Image
              src={entry.imageUrl}
              alt={entry.prompt}
              width={80}
              height={56}
              className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}
