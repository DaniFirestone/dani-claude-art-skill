"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useArtStudioStore } from "@/lib/store";
import { getImageAcceptingTools } from "@/lib/tools/registry";

export default function ImageViewer() {
  const { generationResult, isGenerating } = useArtStudioStore();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [promptCopied, setPromptCopied] = useState(false);
  const [groundingOpen, setGroundingOpen] = useState(false);
  const [textOpen, setTextOpen] = useState(false);
  const [openInMenu, setOpenInMenu] = useState<number | null>(null);
  const router = useRouter();

  if (isGenerating) {
    return (
      <div className="flex items-center justify-center min-h-48 bg-muted rounded-lg border border-border">
        <div className="text-center text-muted-foreground space-y-2">
          <div className="inline-block w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm">Generating image…</p>
        </div>
      </div>
    );
  }

  if (!generationResult) {
    return (
      <div className="flex items-center justify-center min-h-48 bg-muted rounded-lg border border-border border-dashed">
        <p className="text-sm text-muted-foreground">Generated image will appear here</p>
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
              className="relative rounded-lg overflow-hidden bg-muted cursor-zoom-in border border-border"
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
            <div className="mt-1.5 flex items-center gap-3">
              <button
                onClick={() => handleDownload(url, i)}
                className="text-xs text-accent hover:text-accent/80 flex items-center gap-1 transition-colors"
              >
                ↓ Download{isGrid ? ` v${i + 1}` : ""}
              </button>
              <div className="relative">
                <button
                  onClick={() => setOpenInMenu(openInMenu === i ? null : i)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Open in…
                </button>
                {openInMenu === i && (
                  <div className="absolute left-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg py-1 z-20 min-w-[160px]">
                    {getImageAcceptingTools().map((tool) => (
                      <button
                        key={tool.id}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent transition-colors"
                        onClick={() => {
                          sessionStorage.setItem(`tool-input-${tool.id}`, url);
                          setOpenInMenu(null);
                          router.push(`/toolkit/${tool.id}`);
                        }}
                      >
                        {tool.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
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
          className="text-accent hover:text-accent/80 transition-colors"
        >
          {promptCopied ? "✓ Copied!" : "Copy prompt"}
        </button>

        {groundingSources && groundingSources.length > 0 && (
          <button
            onClick={() => setGroundingOpen((o) => !o)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {groundingOpen ? "▾" : "▸"} {groundingSources.length} grounding source{groundingSources.length !== 1 ? "s" : ""}
          </button>
        )}

        {textResponse && (
          <button
            onClick={() => setTextOpen((o) => !o)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {textOpen ? "▾" : "▸"} Model note
          </button>
        )}
      </div>

      {groundingOpen && groundingSources && (
        <ul className="text-xs space-y-1 text-muted-foreground bg-muted rounded p-3 border border-border">
          {groundingSources.map((s) => (
            <li key={s.uri}>
              <a href={s.uri} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {s.title || s.uri}
              </a>
            </li>
          ))}
        </ul>
      )}

      {textOpen && textResponse && (
        <p className="text-xs text-muted-foreground bg-muted rounded p-3 border border-border leading-relaxed">
          {textResponse}
        </p>
      )}
    </div>
  );
}
