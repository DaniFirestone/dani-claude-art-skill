"use client";

import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Tone } from "@/lib/store";
import type { GeminiSize } from "@/lib/gemini";
import ToneSelector from "./ToneSelector";
import AestheticSelector from "@/components/AestheticSelector";

const SIZES: GeminiSize[] = ["1K", "2K", "4K"];

interface CampaignSidebarProps {
  idea: string;
  setIdea: (v: string) => void;
  businessContext: string;
  setBusinessContext: (v: string) => void;
  tone: Tone;
  setTone: (v: Tone) => void;
  size: GeminiSize;
  setSize: (v: GeminiSize) => void;
  isGenerating: boolean;
  onGenerate: () => void;
}

export default function CampaignSidebar({
  idea,
  setIdea,
  businessContext,
  setBusinessContext,
  tone,
  setTone,
  size,
  setSize,
  isGenerating,
  onGenerate,
}: CampaignSidebarProps) {
  return (
    <div className="w-[400px] shrink-0 border-r border-border bg-card/50 overflow-y-auto p-6 space-y-6">
      <section className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-widest text-primary">Idea</label>
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="What's your content idea?"
          className="w-full h-28 p-3 bg-card border border-border rounded-xl focus:ring-2 focus:ring-ring focus:border-transparent transition-all resize-none text-sm"
        />
      </section>

      <section className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-widest text-primary">Context</label>
        <textarea
          value={businessContext}
          onChange={(e) => setBusinessContext(e.target.value)}
          placeholder="Business details, audience, brand guidelines (optional)"
          className="w-full h-20 p-3 bg-card border border-border rounded-xl focus:ring-2 focus:ring-ring focus:border-transparent transition-all resize-none text-sm"
        />
      </section>

      <section className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-widest text-primary">Tone</label>
        <ToneSelector value={tone} onChange={setTone} disabled={isGenerating} />
      </section>

      <section className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-widest text-primary">Style</label>
        <AestheticSelector />
      </section>

      <section className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-widest text-primary">Quality</label>
        <div className="flex gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              className={cn(
                "flex-1 py-2 rounded-lg border text-xs font-bold transition-all",
                size === s
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card border-border hover:bg-muted"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      <button
        onClick={onGenerate}
        disabled={isGenerating || !idea.trim()}
        className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2.5 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20"
      >
        {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        {isGenerating ? "Drafting..." : "Generate Campaign"}
      </button>
    </div>
  );
}
