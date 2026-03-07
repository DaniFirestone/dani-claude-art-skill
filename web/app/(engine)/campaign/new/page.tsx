"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";
import CampaignSidebar from "@/components/campaign/CampaignSidebar";
import PlatformCard from "@/components/campaign/PlatformCard";
import { useArtStudioStore, useMarketingStore } from "@/lib/store";
import type { Tone, PlatformContent } from "@/lib/store";
import type { GeminiSize } from "@/lib/gemini";
import { PLATFORMS } from "@/lib/platforms";

interface CampaignResult {
  [platformId: string]: {
    platform: string;
    text: string;
    imagePrompt: string;
    aspectRatio: string;
  };
}

export default function CampaignNewPage() {
  const { aestheticPrefix } = useArtStudioStore();
  const { addCampaign, updateCampaign } = useMarketingStore();

  const [idea, setIdea] = useState("");
  const [businessContext, setBusinessContext] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [size, setSize] = useState<GeminiSize>("2K");
  const [isGenerating, setIsGenerating] = useState(false);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState<Record<string, PlatformContent>>({});

  async function handleGenerate() {
    if (!idea.trim()) return;
    setIsGenerating(true);
    setPlatforms({});

    try {
      const response = await fetch("/api/campaign/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea,
          businessContext: businessContext || undefined,
          tone,
          aestheticContext: aestheticPrefix || undefined,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        console.error("Campaign generation failed:", err.error);
        return;
      }

      const result: CampaignResult = await response.json();

      const initial: Record<string, PlatformContent> = {};
      for (const p of PLATFORMS) {
        const data = result[p.id];
        if (data) {
          initial[p.id] = {
            platform: data.platform,
            text: data.text,
            imagePrompt: data.imagePrompt,
            aspectRatio: data.aspectRatio,
            imageUrl: null,
            imageStatus: "idle",
          };
        }
      }
      setPlatforms(initial);

      // Save campaign (images will be updated as they arrive)
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setCampaignId(id);
      addCampaign({
        id,
        title: idea.slice(0, 60),
        idea,
        businessContext,
        tone,
        aestheticId: "default",
        model: "nano-banana-2",
        size,
        platforms: initial,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: "generating",
      });

      // Generate images in parallel
      for (const p of PLATFORMS) {
        if (initial[p.id]) generatePlatformImage(id, p.id, initial[p.id]);
      }
    } catch (error) {
      console.error("Campaign generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  }

  async function generatePlatformImage(cId: string, platformId: string, content: PlatformContent) {
    setPlatforms((prev) => ({
      ...prev,
      [platformId]: { ...prev[platformId], imageStatus: "generating" },
    }));

    try {
      const response = await fetch("/api/campaign/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imagePrompt: content.imagePrompt,
          aspectRatio: content.aspectRatio,
          size,
          model: "nano-banana-2",
          aestheticPrefix: aestheticPrefix || undefined,
          platform: platformId,
        }),
      });

      if (!response.ok) throw new Error("Image generation failed");

      const { imageUrl } = await response.json();
      setPlatforms((prev) => {
        const updated = { ...prev, [platformId]: { ...prev[platformId], imageUrl, imageStatus: "done" as const } };
        // Update the saved campaign with the new image
        updateCampaign(cId, { platforms: updated });
        return updated;
      });
    } catch {
      setPlatforms((prev) => ({
        ...prev,
        [platformId]: { ...prev[platformId], imageStatus: "error" as const },
      }));
    }
  }

  const hasPlatforms = Object.keys(platforms).length > 0;

  return (
    <div className="flex h-full overflow-hidden">
      <CampaignSidebar
        idea={idea}
        setIdea={setIdea}
        businessContext={businessContext}
        setBusinessContext={setBusinessContext}
        tone={tone}
        setTone={setTone}
        size={size}
        setSize={setSize}
        isGenerating={isGenerating}
        onGenerate={handleGenerate}
      />

      <div className="flex-1 overflow-y-auto bg-cream">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {!hasPlatforms && !isGenerating && (
            <div className="min-h-[500px] flex flex-col items-center justify-center text-center border-2 border-dashed border-black/5 rounded-3xl">
              <Sparkles className="w-8 h-8 text-sage/20 mb-3" />
              <p className="text-sm text-charcoal/40">Enter an idea to generate your campaign</p>
            </div>
          )}

          {isGenerating && !hasPlatforms && (
            <div className="space-y-8 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-[32px] p-8 h-96 border border-black/5" />
              ))}
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {hasPlatforms && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {PLATFORMS.map((p) => {
                  const content = platforms[p.id];
                  if (!content) return null;
                  return (
                    <PlatformCard
                      key={p.id}
                      platformId={p.id}
                      text={content.text}
                      imagePrompt={content.imagePrompt}
                      aspectRatio={content.aspectRatio}
                      imageUrl={content.imageUrl}
                      imageStatus={content.imageStatus}
                      onRegenerateImage={() => generatePlatformImage(campaignId!, p.id, content)}
                    />
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
