"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Sparkles, Upload, Download } from "lucide-react";
import { cn } from "@/lib/cn";
import { downloadBlob } from "@/lib/tools/download";

type EffectType = "grain" | "noise" | "halftone";
type BlendMode = "overlay" | "multiply" | "screen" | "soft-light";

const BLEND_MODES: { id: BlendMode; label: string }[] = [
  { id: "overlay", label: "Overlay" },
  { id: "multiply", label: "Multiply" },
  { id: "screen", label: "Screen" },
  { id: "soft-light", label: "Soft Light" },
];

export default function ArtworkEnhancerPage() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [effect, setEffect] = useState<EffectType>("grain");
  const [intensity, setIntensity] = useState(40);
  const [grainSize, setGrainSize] = useState(1);
  const [blendMode, setBlendMode] = useState<BlendMode>("overlay");
  const [opacity, setOpacity] = useState(50);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("tool-input-artwork-enhancer");
    if (stored) {
      sessionStorage.removeItem("tool-input-artwork-enhancer");
      loadImage(stored);
    }
  }, []);

  function loadImage(src: string) {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setSourceImage(src);
    };
    img.src = src;
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => loadImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const maxW = 600;
    const scale = Math.min(1, maxW / img.naturalWidth);
    canvas.width = img.naturalWidth * scale;
    canvas.height = img.naturalHeight * scale;
    const ctx = canvas.getContext("2d")!;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    applyEffect(ctx, canvas.width, canvas.height, false);
  }, [sourceImage, effect, intensity, grainSize, blendMode, opacity]);

  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  function applyEffect(ctx: CanvasRenderingContext2D, w: number, h: number, fullRes: boolean) {
    // Generate noise buffer
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    const str = intensity / 100;
    const opacityFactor = opacity / 100;

    for (let y = 0; y < h; y += grainSize) {
      for (let x = 0; x < w; x += grainSize) {
        let noiseR: number, noiseG: number, noiseB: number;

        if (effect === "grain") {
          // Monochromatic film grain
          const n = (Math.random() - 0.5) * 255 * str;
          noiseR = noiseG = noiseB = n;
        } else if (effect === "noise") {
          // Color noise
          noiseR = (Math.random() - 0.5) * 255 * str;
          noiseG = (Math.random() - 0.5) * 255 * str;
          noiseB = (Math.random() - 0.5) * 255 * str;
        } else {
          // Halftone - dot pattern
          const gridStep = Math.max(4, 12 - Math.round(str * 10));
          const cx = Math.round(x / gridStep) * gridStep;
          const cy = Math.round(y / gridStep) * gridStep;
          const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
          const idx = (cy * w + cx) * 4;
          const lum = (data[idx] + data[idx + 1] + data[idx + 2]) / 3 / 255;
          const dotRadius = (1 - lum) * gridStep * 0.5;
          const show = dist < dotRadius;
          noiseR = noiseG = noiseB = show ? -100 * str : 100 * str;
        }

        // Apply to grain-size block
        for (let dy = 0; dy < grainSize && y + dy < h; dy++) {
          for (let dx = 0; dx < grainSize && x + dx < w; dx++) {
            const idx = ((y + dy) * w + (x + dx)) * 4;
            const blend = (base: number, noise: number): number => {
              const n01 = (noise + 128) / 255;
              const b01 = base / 255;
              let result: number;
              switch (blendMode) {
                case "overlay":
                  result = b01 < 0.5 ? 2 * b01 * n01 : 1 - 2 * (1 - b01) * (1 - n01);
                  break;
                case "multiply":
                  result = b01 * n01;
                  break;
                case "screen":
                  result = 1 - (1 - b01) * (1 - n01);
                  break;
                case "soft-light":
                  result = n01 < 0.5 ? b01 - (1 - 2 * n01) * b01 * (1 - b01) : b01 + (2 * n01 - 1) * (Math.sqrt(b01) - b01);
                  break;
                default:
                  result = b01;
              }
              return Math.round(base * (1 - opacityFactor) + result * 255 * opacityFactor);
            };

            data[idx] = Math.max(0, Math.min(255, blend(data[idx], noiseR)));
            data[idx + 1] = Math.max(0, Math.min(255, blend(data[idx + 1], noiseG)));
            data[idx + 2] = Math.max(0, Math.min(255, blend(data[idx + 2], noiseB)));
          }
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  function handleExport() {
    const img = imgRef.current;
    if (!img) return;
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    applyEffect(ctx, canvas.width, canvas.height, true);
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, "enhanced.png");
    }, "image/png");
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-headline font-bold tracking-tight">Artwork Enhancer</h1>
        </div>
        <p className="text-muted-foreground text-sm">Add film grain, color noise, or halftone effects to images</p>
      </div>

      {!sourceImage ? (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-16 cursor-pointer hover:border-primary/30 hover:bg-accent/30 transition-colors" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) { const r = new FileReader(); r.onload = () => loadImage(r.result as string); r.readAsDataURL(f); } }}>
          <Upload className="w-8 h-8 text-primary/30 mb-3" />
          <p className="text-sm text-muted-foreground">Drop an image or click to upload</p>
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Controls */}
          <div className="lg:w-56 shrink-0">
            <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Effect</label>
                <div className="space-y-1">
                  {(["grain", "noise", "halftone"] as const).map((e) => (
                    <button key={e} onClick={() => setEffect(e)} className={cn("w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-colors capitalize", effect === e ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent")}>{e === "grain" ? "Film Grain" : e === "noise" ? "Color Noise" : "Halftone"}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Intensity: {intensity}%</label>
                <input type="range" min={1} max={100} value={intensity} onChange={(e) => setIntensity(parseInt(e.target.value))} className="w-full accent-primary" />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Grain size: {grainSize}px</label>
                <input type="range" min={1} max={5} value={grainSize} onChange={(e) => setGrainSize(parseInt(e.target.value))} className="w-full accent-primary" />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Blend mode</label>
                <div className="space-y-1">
                  {BLEND_MODES.map((b) => (
                    <button key={b.id} onClick={() => setBlendMode(b.id)} className={cn("w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-colors", blendMode === b.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent")}>{b.label}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Opacity: {opacity}%</label>
                <input type="range" min={5} max={100} value={opacity} onChange={(e) => setOpacity(parseInt(e.target.value))} className="w-full accent-primary" />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="flex-1 min-w-0">
            <canvas ref={canvasRef} className="w-full border border-border rounded-2xl" />
            <div className="flex items-center justify-between mt-4">
              <label className="text-xs text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                Upload different image
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={handleExport} className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                <Download className="w-4 h-4" /> Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
