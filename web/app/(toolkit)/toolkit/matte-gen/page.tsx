"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Frame, Upload, Download } from "lucide-react";
import { cn } from "@/lib/cn";
import { downloadBlob } from "@/lib/tools/download";

type MatteStyle = "solid" | "blur" | "gradient";
type AspectRatio = "1:1" | "4:5" | "16:9" | "9:16";

const ASPECT_RATIOS: { id: AspectRatio; label: string; value: number }[] = [
  { id: "1:1", label: "Square (1:1)", value: 1 },
  { id: "4:5", label: "Portrait (4:5)", value: 4 / 5 },
  { id: "16:9", label: "Landscape (16:9)", value: 16 / 9 },
  { id: "9:16", label: "Story (9:16)", value: 9 / 16 },
];

export default function MatteGenPage() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [style, setStyle] = useState<MatteStyle>("blur");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [padding, setPadding] = useState(15);
  const [solidColor, setSolidColor] = useState("#1a1a2e");
  const [gradientFrom, setGradientFrom] = useState("#1a1a2e");
  const [gradientTo, setGradientTo] = useState("#16213e");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("tool-input-matte-gen");
    if (stored) {
      sessionStorage.removeItem("tool-input-matte-gen");
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

    const ar = ASPECT_RATIOS.find((a) => a.id === aspectRatio)!.value;
    const previewW = 500;
    const previewH = previewW / ar;
    canvas.width = previewW;
    canvas.height = previewH;
    const ctx = canvas.getContext("2d")!;

    renderMatte(ctx, img, previewW, previewH);
  }, [sourceImage, style, aspectRatio, padding, solidColor, gradientFrom, gradientTo]);

  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  function renderMatte(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
    // Draw background
    if (style === "solid") {
      ctx.fillStyle = solidColor;
      ctx.fillRect(0, 0, w, h);
    } else if (style === "gradient") {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, gradientFrom);
      grad.addColorStop(1, gradientTo);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    } else {
      // Blur: draw scaled-up blurred image
      ctx.filter = "blur(30px) brightness(0.7)";
      ctx.drawImage(img, -20, -20, w + 40, h + 40);
      ctx.filter = "none";
    }

    // Draw inner image with padding
    const padFrac = padding / 100;
    const innerW = w * (1 - padFrac * 2);
    const innerH = h * (1 - padFrac * 2);
    const imgAR = img.naturalWidth / img.naturalHeight;
    let drawW: number, drawH: number;

    if (imgAR > innerW / innerH) {
      drawW = innerW;
      drawH = innerW / imgAR;
    } else {
      drawH = innerH;
      drawW = innerH * imgAR;
    }

    const x = (w - drawW) / 2;
    const y = (h - drawH) / 2;
    ctx.drawImage(img, x, y, drawW, drawH);
  }

  function handleExport() {
    const img = imgRef.current;
    if (!img) return;
    const ar = ASPECT_RATIOS.find((a) => a.id === aspectRatio)!.value;
    // Export at 1080px on the short side
    const exportW = ar >= 1 ? 1080 * ar : 1080;
    const exportH = ar >= 1 ? 1080 : 1080 / ar;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(exportW);
    canvas.height = Math.round(exportH);
    const ctx = canvas.getContext("2d")!;
    renderMatte(ctx, img, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, `matte-${aspectRatio.replace(":", "x")}.png`);
    }, "image/png");
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Frame className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-headline font-bold tracking-tight">Matte Generator</h1>
        </div>
        <p className="text-muted-foreground text-sm">Place images on styled backgrounds for social posting</p>
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
          <div className="lg:w-56 shrink-0 space-y-4">
            <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Aspect ratio</label>
                <div className="space-y-1">
                  {ASPECT_RATIOS.map((ar) => (
                    <button key={ar.id} onClick={() => setAspectRatio(ar.id)} className={cn("w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-colors", aspectRatio === ar.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent")}>{ar.label}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Background style</label>
                <div className="flex gap-1">
                  {(["blur", "solid", "gradient"] as const).map((s) => (
                    <button key={s} onClick={() => setStyle(s)} className={cn("flex-1 px-2 py-1.5 text-xs font-medium rounded-lg border transition-colors capitalize", style === s ? "bg-primary/10 border-primary/30 text-primary" : "border-border text-muted-foreground")}>{s}</button>
                  ))}
                </div>
              </div>

              {style === "solid" && (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={solidColor} onChange={(e) => setSolidColor(e.target.value)} className="w-8 h-8 rounded border border-border cursor-pointer" />
                    <span className="text-xs font-mono text-muted-foreground">{solidColor}</span>
                  </div>
                </div>
              )}

              {style === "gradient" && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">From</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={gradientFrom} onChange={(e) => setGradientFrom(e.target.value)} className="w-8 h-8 rounded border border-border cursor-pointer" />
                      <span className="text-xs font-mono text-muted-foreground">{gradientFrom}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">To</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={gradientTo} onChange={(e) => setGradientTo(e.target.value)} className="w-8 h-8 rounded border border-border cursor-pointer" />
                      <span className="text-xs font-mono text-muted-foreground">{gradientTo}</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Padding: {padding}%</label>
                <input type="range" min={0} max={40} value={padding} onChange={(e) => setPadding(parseInt(e.target.value))} className="w-full accent-primary" />
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
