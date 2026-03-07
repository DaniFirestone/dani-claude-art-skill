"use client";

import { useEffect, useState } from "react";
import { Palette, Check, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";
import { useArtStudioStore } from "@/lib/store";
import type { Aesthetic } from "@/lib/aesthetics";

export default function BrandsPage() {
  const { selectedAestheticId, setSelectedAestheticId, setAestheticPrefix } = useArtStudioStore();
  const [aesthetics, setAesthetics] = useState<Aesthetic[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/aesthetics")
      .then((r) => r.json())
      .then((data: Aesthetic[]) => setAesthetics(data))
      .finally(() => setLoading(false));
  }, []);

  function handleSetDefault(aesthetic: Aesthetic) {
    setSelectedAestheticId(aesthetic.id);
    setAestheticPrefix(aesthetic.prefix);
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-cream-dark rounded" />
          <div className="grid sm:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 bg-cream-dark rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Brand Manager</h1>
        <p className="text-charcoal-soft text-sm mt-1">
          Visual aesthetics that define your brand's image generation style
        </p>
      </div>

      {aesthetics.length === 0 ? (
        <div className="border-2 border-dashed border-black/5 rounded-3xl p-16 text-center">
          <Palette className="w-10 h-10 text-sage/20 mx-auto mb-3" />
          <p className="text-charcoal-soft">No aesthetic files found in skills/art/</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {aesthetics.map((aesthetic) => {
            const isDefault = selectedAestheticId === aesthetic.id;
            const isExpanded = expandedId === aesthetic.id;

            return (
              <div
                key={aesthetic.id}
                className={cn(
                  "bg-white rounded-2xl border overflow-hidden transition-shadow",
                  isDefault ? "border-sage shadow-md" : "border-black/5 hover:shadow-sm"
                )}
              >
                <div className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{aesthetic.name}</h3>
                        {isDefault && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-sage text-white px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      {aesthetic.description && (
                        <p className="text-sm text-charcoal-soft mt-1 italic">
                          &ldquo;{aesthetic.description}&rdquo;
                        </p>
                      )}
                    </div>
                    <Palette className={cn("w-5 h-5 shrink-0", isDefault ? "text-sage" : "text-charcoal-soft/30")} />
                  </div>

                  {/* Color swatches extracted from prefix text */}
                  <ColorSwatches prefix={aesthetic.prefix} />

                  {/* Prefix preview */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : aesthetic.id)}
                      className="text-xs text-charcoal-soft hover:text-sage flex items-center gap-1.5 transition-colors"
                    >
                      {isExpanded ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {isExpanded ? "Hide" : "Preview"} style prompt
                    </button>
                    {isExpanded && (
                      <pre className="mt-2 text-xs text-charcoal-light bg-cream rounded-xl p-4 overflow-x-auto leading-relaxed whitespace-pre-wrap border border-cream-dark">
                        {aesthetic.prefix}
                      </pre>
                    )}
                  </div>

                  {/* Actions */}
                  {!isDefault && (
                    <button
                      onClick={() => handleSetDefault(aesthetic)}
                      className="w-full py-2.5 rounded-xl border border-sage/20 text-sage text-sm font-medium hover:bg-sage hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Set as Active
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ColorSwatches({ prefix }: { prefix: string }) {
  // Extract color names mentioned in the prefix
  const colorKeywords = [
    { name: "Charcoal", color: "#2D2D2D" },
    { name: "Teal", color: "#1A6B6B" },
    { name: "Burnt Orange", color: "#C85A2A" },
    { name: "Cream", color: "#F7F4EA" },
    { name: "White", color: "#FFFFFF" },
  ];

  const mentioned = colorKeywords.filter(
    (c) => prefix.toLowerCase().includes(c.name.toLowerCase())
  );

  if (mentioned.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5">
      {mentioned.map((c) => (
        <div
          key={c.name}
          title={c.name}
          className="w-6 h-6 rounded-full border border-black/10"
          style={{ backgroundColor: c.color }}
        />
      ))}
      <span className="text-[10px] text-charcoal-soft ml-1">
        {mentioned.length} colors
      </span>
    </div>
  );
}
