"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Linkedin,
  Instagram,
  MessageSquare,
  Pin,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { PLATFORM_MAP } from "@/lib/platforms";

const ICONS: Record<string, React.ReactNode> = {
  linkedin: <Linkedin className="w-5 h-5" />,
  threads: <MessageSquare className="w-5 h-5" />,
  instagram: <Instagram className="w-5 h-5" />,
  pinterest: <Pin className="w-5 h-5" />,
};

const ASPECT_CLASSES: Record<string, string> = {
  "9:16": "aspect-[9/16]",
  "3:4": "aspect-[3/4]",
  "2:3": "aspect-[2/3]",
  "16:9": "aspect-[16/9]",
};

interface PlatformCardProps {
  platformId: string;
  text: string;
  imagePrompt: string;
  aspectRatio: string;
  imageUrl: string | null;
  imageStatus: "idle" | "generating" | "done" | "error";
  onRegenerateImage: () => void;
}

export default function PlatformCard({
  platformId,
  text,
  imagePrompt,
  aspectRatio,
  imageUrl,
  imageStatus,
  onRegenerateImage,
}: PlatformCardProps) {
  const [copied, setCopied] = useState(false);
  const [promptVisible, setPromptVisible] = useState(false);
  const label = PLATFORM_MAP[platformId]?.label ?? platformId;

  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6 flex flex-col md:grid md:grid-cols-[1fr_260px] gap-6">
        {/* Text */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-primary">
                {ICONS[platformId]}
              </div>
              <h3 className="font-headline font-bold">{label}</h3>
            </div>
            <button onClick={handleCopy} className="p-1.5 hover:bg-muted rounded-lg transition-colors text-primary">
              {copied ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="text-sm text-foreground/70 leading-relaxed whitespace-pre-wrap">{text}</div>

          <button
            type="button"
            onClick={() => setPromptVisible((o) => !o)}
            className="text-[10px] uppercase tracking-widest font-bold text-primary/40 hover:text-primary/60 transition-colors"
          >
            {promptVisible ? "Hide" : "Show"} prompt
          </button>
          {promptVisible && <p className="text-xs italic text-primary/50">{imagePrompt}</p>}
        </div>

        {/* Image */}
        <div>
          <div
            className={cn(
              "relative rounded-2xl overflow-hidden bg-muted border border-border flex items-center justify-center",
              ASPECT_CLASSES[aspectRatio] || "aspect-square"
            )}
          >
            {imageStatus === "generating" ? (
              <Loader2 className="w-6 h-6 animate-spin text-primary/30" />
            ) : imageUrl ? (
              <Image src={imageUrl} alt={`${label} visual`} fill className="object-cover" unoptimized />
            ) : (
              <ImageIcon className="w-8 h-8 text-primary/10" />
            )}

            {imageUrl && imageStatus === "done" && (
              <button
                onClick={onRegenerateImage}
                className="absolute bottom-2 right-2 p-1.5 bg-card/90 backdrop-blur shadow-sm rounded-full hover:bg-card transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-primary" />
              </button>
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary/40 mt-2 block">
            {aspectRatio}
          </span>
        </div>
      </div>
    </div>
  );
}
