"use client";

import { useState } from "react";
import Image from "next/image";
import { Image as ImageIcon, Download, Copy, Trash2, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { useArtStudioStore, useMarketingStore } from "@/lib/store";
import type { HistoryEntry } from "@/lib/store";

type FilterMode = "all" | "studio" | "campaigns";

export default function LibraryPage() {
  const { history, clearHistory } = useArtStudioStore();
  const { campaigns } = useMarketingStore();
  const [filter, setFilter] = useState<FilterMode>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Collect campaign images as pseudo-history entries
  const campaignAssets: (HistoryEntry & { source: string })[] = [];
  for (const campaign of campaigns) {
    for (const [platformId, content] of Object.entries(campaign.platforms)) {
      if (content.imageUrl) {
        campaignAssets.push({
          id: `${campaign.id}-${platformId}`,
          timestamp: campaign.createdAt,
          imageUrl: content.imageUrl,
          prompt: content.imagePrompt,
          model: campaign.model,
          size: campaign.size,
          aspectRatio: content.aspectRatio as any,
          source: `Campaign: ${campaign.title.slice(0, 30)} / ${content.platform}`,
        });
      }
    }
  }

  const studioAssets = history.map((h) => ({ ...h, source: "Studio" }));

  let assets =
    filter === "studio" ? studioAssets :
    filter === "campaigns" ? campaignAssets :
    [...studioAssets, ...campaignAssets];

  // Sort by timestamp descending
  assets.sort((a, b) => b.timestamp - a.timestamp);

  // Search filter
  if (search.trim()) {
    const q = search.toLowerCase();
    assets = assets.filter(
      (a) => a.prompt.toLowerCase().includes(q) || a.source.toLowerCase().includes(q)
    );
  }

  function handleDownload(url: string) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `asset-${Date.now()}.png`;
    a.click();
  }

  function handleCopyPrompt(prompt: string) {
    navigator.clipboard.writeText(prompt);
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Asset Library</h1>
          <p className="text-charcoal-soft text-sm mt-1">
            All generated images from campaigns and studio work
          </p>
        </div>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-xs text-charcoal-soft hover:text-red-500 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear studio history
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex gap-1 bg-cream rounded-xl p-1">
          {([
            { id: "all", label: "All" },
            { id: "studio", label: "Studio" },
            { id: "campaigns", label: "Campaigns" },
          ] as const).map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                filter === f.id
                  ? "bg-white text-charcoal shadow-sm"
                  : "text-charcoal-soft hover:text-charcoal"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex-1 max-w-xs relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-soft/40" />
          <input
            type="text"
            placeholder="Search prompts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-black/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage/40"
          />
        </div>

        <span className="text-xs text-charcoal-soft">
          {assets.length} asset{assets.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Grid */}
      {assets.length === 0 ? (
        <div className="border-2 border-dashed border-black/5 rounded-3xl p-16 text-center">
          <ImageIcon className="w-10 h-10 text-sage/20 mx-auto mb-3" />
          <p className="text-charcoal-soft">
            {search ? "No assets match your search" : "No assets yet — generate some in Studio or Campaign"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {assets.map((asset) => {
            const isExpanded = expandedId === asset.id;
            return (
              <div
                key={asset.id}
                className="bg-white rounded-2xl border border-black/5 overflow-hidden hover:shadow-md transition-shadow group"
              >
                {/* Image */}
                <div
                  className="relative aspect-square bg-cream cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : asset.id)}
                >
                  <Image
                    src={asset.imageUrl}
                    alt={asset.prompt}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>

                {/* Meta */}
                <div className="p-3 space-y-2">
                  <p className="text-xs text-charcoal truncate" title={asset.prompt}>
                    {asset.prompt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium text-sage bg-sage/10 px-1.5 py-0.5 rounded">
                      {asset.source}
                    </span>
                    <span className="text-[10px] text-charcoal-soft">
                      {asset.model} &middot; {asset.aspectRatio}
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="flex gap-2 pt-2 border-t border-cream-dark">
                      <button
                        onClick={() => handleDownload(asset.imageUrl)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-sage hover:bg-sage/5 rounded-lg transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                      <button
                        onClick={() => handleCopyPrompt(asset.prompt)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-sage hover:bg-sage/5 rounded-lg transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" /> Prompt
                      </button>
                    </div>
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
