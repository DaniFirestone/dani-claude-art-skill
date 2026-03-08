"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Stamp, Upload, Download, Type, ImageIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { downloadBlob } from "@/lib/tools/download";

type WatermarkMode = "text" | "image";
type Placement = "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "tiled";

const PLACEMENTS: { id: Placement; label: string }[] = [
  { id: "center", label: "Center" },
  { id: "bottom-right", label: "Bottom Right" },
  { id: "bottom-left", label: "Bottom Left" },
  { id: "top-right", label: "Top Right" },
  { id: "top-left", label: "Top Left" },
  { id: "tiled", label: "Tiled" },
];

export default function WatermarkerPage() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [mode, setMode] = useState<WatermarkMode>("text");
  const [text, setText] = useState("SAMPLE");
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState("#ffffff");
  const [opacity, setOpacity] = useState(30);
  const [rotation, setRotation] = useState(-30);
  const [placement, setPlacement] = useState<Placement>("center");
  const [tileSpacing, setTileSpacing] = useState(120);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Pipeline input
  useEffect(() => {
    const stored = sessionStorage.getItem("tool-input-watermarker");
    if (stored) {
      sessionStorage.removeItem("tool-input-watermarker");
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
    applyWatermark(ctx, canvas.width, canvas.height);
  }, [sourceImage, text, fontSize, color, opacity, rotation, placement, tileSpacing, mode]);

  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  function applyWatermark(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const scale = w / (imgRef.current?.naturalWidth || w);
    const scaledFont = fontSize * scale;

    ctx.save();
    ctx.globalAlpha = opacity / 100;
    ctx.fillStyle = color;
    ctx.font = `bold ${scaledFont}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (placement === "tiled") {
      const spacingScaled = tileSpacing * scale;
      ctx.rotate((rotation * Math.PI) / 180);
      const diag = Math.sqrt(w * w + h * h);
      for (let y = -diag; y < diag * 2; y += spacingScaled) {
        for (let x = -diag; x < diag * 2; x += ctx.measureText(text).width + spacingScaled) {
          ctx.fillText(text, x, y);
        }
      }
    } else {
      const positions: Record<string, [number, number]> = {
        center: [w / 2, h / 2],
        "top-left": [scaledFont * 2, scaledFont * 1.5],
        "top-right": [w - scaledFont * 2, scaledFont * 1.5],
        "bottom-left": [scaledFont * 2, h - scaledFont * 1.5],
        "bottom-right": [w - scaledFont * 2, h - scaledFont * 1.5],
      };
      const [x, y] = positions[placement] || [w / 2, h / 2];
      ctx.translate(x, y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.fillText(text, 0, 0);
    }
    ctx.restore();
  }

  function handleExport() {
    const img = imgRef.current;
    if (!img) return;
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    applyWatermark(ctx, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, "watermarked.png");
    }, "image/png");
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Stamp className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-headline font-bold tracking-tight">Watermarker</h1>
        </div>
        <p className="text-muted-foreground text-sm">Add text or logo watermarks to protect your images</p>
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
          <div className="lg:w-64 shrink-0 space-y-4">
            <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Watermark text</label>
                <input type="text" value={text} onChange={(e) => setText(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Font size: {fontSize}px</label>
                <input type="range" min={12} max={200} value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="w-full accent-primary" />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded border border-border cursor-pointer" />
                  <span className="text-xs font-mono text-muted-foreground">{color}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Opacity: {opacity}%</label>
                <input type="range" min={5} max={100} value={opacity} onChange={(e) => setOpacity(parseInt(e.target.value))} className="w-full accent-primary" />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Rotation: {rotation}°</label>
                <input type="range" min={-90} max={90} value={rotation} onChange={(e) => setRotation(parseInt(e.target.value))} className="w-full accent-primary" />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Placement</label>
                <div className="grid grid-cols-2 gap-1">
                  {PLACEMENTS.map((p) => (
                    <button key={p.id} onClick={() => setPlacement(p.id)} className={cn("px-2 py-1.5 text-[10px] font-medium rounded-md border transition-colors", placement === p.id ? "bg-primary/10 border-primary/30 text-primary" : "border-border text-muted-foreground")}>{p.label}</button>
                  ))}
                </div>
              </div>

              {placement === "tiled" && (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Spacing: {tileSpacing}px</label>
                  <input type="range" min={50} max={400} value={tileSpacing} onChange={(e) => setTileSpacing(parseInt(e.target.value))} className="w-full accent-primary" />
                </div>
              )}
            </div>
          </div>

          {/* Preview + export */}
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
