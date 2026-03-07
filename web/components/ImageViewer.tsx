"use client";

import { useState } from "react";
import Image from "next/image";
import { useArtStudioStore } from "@/lib/store";

export default function ImageViewer() {
  const { generationResult, isGenerating } = useArtStudioStore();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [promptCopied, setPromptCopied] = useState(false);
  const [groundingOpen, setGroundingOpen] = useState(false);
  const [textOpen, setTextOpen] = useState(false);

  if (isGenerating) {
    return (
      <div className="flex items-center justify-center min-h-48 bg-cream rounded-lg border border-cream-dark">
        <div className="text-center text-charcoal-soft space-y-2">
          <div className="inline-block w-8 h-8 border-2 border-sage/30 border-t-sage rounded-full animate-spin" />
          <p className="text-sm">Generating image…</p>
        </div>
      </div>
    );
  }

  if (!generationResult) {
    return (
      <div className="flex items-center justify-center min-h-48 bg-cream rounded-lg border border-cream-dark border-dashed">
        <p className="text-sm text-charcoal-soft">Generated image will appear here</p>
      </div>
    );
  }

  const { imageUrls, groundingSources, textResponse, finalPrompt } = generationResult;

  function handleCopyPrompt() {
    navigator.clipboard.writeText(finalPrompt).then(() => {
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 2000);
    });
  }

  function handleDownload(url: string, index: number) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `generated-${Date.now()}${imageUrls.length > 1 ? `-v${index + 1}` : ""}.png`;
    a.click();
  }

  const isGrid = imageUrls.length > 1;

  return (
    <div className="space-y-3">
      {/* Image(s) */}
      <div className={isGrid ? "grid grid-cols-2 gap-3" : ""}>
        {imageUrls.map((url, i) => (
          <div key={url} className="relative group">
            <div
              className="relative rounded-lg overflow-hidden bg-cream cursor-zoom-in border border-cream-dark"
              onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
            >
              <Image
                src={url}
                alt={`Generated image${isGrid ? ` ${i + 1}` : ""}`}
                width={800}
                height={600}
                className="w-full h-auto object-contain"
                unoptimized
              />
            </div>
            <button
              onClick={() => handleDownload(url, i)}
              className="mt-1.5 text-xs text-sage hover:text-sage-hover flex items-center gap-1 transition-colors"
            >
              ↓ Download{isGrid ? ` v${i + 1}` : ""}
            </button>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {expandedIndex !== null && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setExpandedIndex(null)}
        >
          <div className="relative max-w-5xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <Image
              src={imageUrls[expandedIndex]}
              alt="Expanded view"
              width={1600}
              height={1200}
              className="max-h-[90vh] w-auto object-contain rounded"
              unoptimized
            />
            <button
              onClick={() => setExpandedIndex(null)}
              className="absolute top-2 right-2 text-white bg-black/50 rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70 text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Actions + metadata row */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <button
          onClick={handleCopyPrompt}
          className="text-sage hover:text-sage-hover transition-colors"
        >
          {promptCopied ? "✓ Copied!" : "Copy prompt"}
        </button>

        {groundingSources && groundingSources.length > 0 && (
          <button
            onClick={() => setGroundingOpen((o) => !o)}
            className="text-charcoal-soft hover:text-charcoal transition-colors"
          >
            {groundingOpen ? "▾" : "▸"} {groundingSources.length} grounding source{groundingSources.length !== 1 ? "s" : ""}
          </button>
        )}

        {textResponse && (
          <button
            onClick={() => setTextOpen((o) => !o)}
            className="text-charcoal-soft hover:text-charcoal transition-colors"
          >
            {textOpen ? "▾" : "▸"} Model note
          </button>
        )}
      </div>

      {groundingOpen && groundingSources && (
        <ul className="text-xs space-y-1 text-charcoal-soft bg-cream rounded p-3 border border-cream-dark">
          {groundingSources.map((s) => (
            <li key={s.uri}>
              <a href={s.uri} target="_blank" rel="noopener noreferrer" className="text-sage hover:underline">
                {s.title || s.uri}
              </a>
            </li>
          ))}
        </ul>
      )}

      {textOpen && textResponse && (
        <p className="text-xs text-charcoal-soft bg-cream rounded p-3 border border-cream-dark leading-relaxed">
          {textResponse}
        </p>
      )}
    </div>
  );
}
