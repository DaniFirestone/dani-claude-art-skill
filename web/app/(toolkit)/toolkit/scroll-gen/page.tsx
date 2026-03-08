"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { GalleryHorizontalEnd, Upload, Download } from "lucide-react";
import { cn } from "@/lib/cn";
import { downloadBlob } from "@/lib/tools/download";
import { downloadZip, type ZipEntry } from "@/lib/tools/zip";

type SlideRatio = "4:5" | "1:1" | "16:9";

const RATIOS: { id: SlideRatio; label: string; value: number }[] = [
  { id: "4:5", label: "4:5 (Instagram)", value: 4 / 5 },
  { id: "1:1", label: "1:1 (Square)", value: 1 },
  { id: "16:9", label: "16:9 (Wide)", value: 16 / 9 },
];

export default function ScrollGenPage() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [slides, setSlides] = useState(3);
  const [ratio, setRatio] = useState<SlideRatio>("4:5");
  const [overlap, setOverlap] = useState(5);
  const [exporting, setExporting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("tool-input-scroll-gen");
    if (stored) {
      sessionStorage.removeItem("tool-input-scroll-gen");
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

  const ratioValue = RATIOS.find((r) => r.id === ratio)!.value;

  // Determine scroll direction from image aspect ratio
  const img = imgRef.current;
  const isHorizontal = img ? img.naturalWidth / img.naturalHeight > 1 : true;

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

    // Calculate and draw slide boundaries
    const overlapFrac = overlap / 100;
    const srcW = img.naturalWidth;
    const srcH = img.naturalHeight;

    if (isHorizontal) {
      // Horizontal scroll: divide width
      const slideViewW = srcW / (slides - (slides - 1) * overlapFrac);
      const step = slideViewW * (1 - overlapFrac);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      for (let i = 1; i < slides; i++) {
        const x = (i * step) * scale;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Overlap zones
      ctx.fillStyle = "rgba(59, 130, 246, 0.15)";
      for (let i = 1; i < slides; i++) {
        const cutX = i * step;
        const overlapW = slideViewW * overlapFrac;
        ctx.fillRect((cutX - overlapW / 2) * scale, 0, overlapW * scale, canvas.height);
      }
    } else {
      // Vertical scroll: divide height
      const slideViewH = srcH / (slides - (slides - 1) * overlapFrac);
      const step = slideViewH * (1 - overlapFrac);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      for (let i = 1; i < slides; i++) {
        const y = (i * step) * scale;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      ctx.fillStyle = "rgba(59, 130, 246, 0.15)";
      for (let i = 1; i < slides; i++) {
        const cutY = i * step;
        const overlapH = slideViewH * overlapFrac;
        ctx.fillRect(0, (cutY - overlapH / 2) * scale, canvas.width, overlapH * scale);
      }
    }

    ctx.setLineDash([]);
  }, [sourceImage, slides, ratio, overlap]);

  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  async function handleExport() {
    const img = imgRef.current;
    if (!img) return;
    setExporting(true);

    const entries: ZipEntry[] = [];
    const overlapFrac = overlap / 100;
    const srcW = img.naturalWidth;
    const srcH = img.naturalHeight;

    for (let i = 0; i < slides; i++) {
      let sx: number, sy: number, sw: number, sh: number;

      if (isHorizontal) {
        const slideViewW = srcW / (slides - (slides - 1) * overlapFrac);
        const step = slideViewW * (1 - overlapFrac);
        sx = i * step;
        sy = 0;
        sw = slideViewW;
        sh = srcH;
      } else {
        const slideViewH = srcH / (slides - (slides - 1) * overlapFrac);
        const step = slideViewH * (1 - overlapFrac);
        sx = 0;
        sy = i * step;
        sw = srcW;
        sh = slideViewH;
      }

      // Determine output dimensions based on ratio
      const outH = 1080;
      const outW = Math.round(outH * ratioValue);

      const tile = document.createElement("canvas");
      tile.width = outW;
      tile.height = outH;
      const tctx = tile.getContext("2d")!;
      tctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);

      const blob = await new Promise<Blob>((res) =>
        tile.toBlob((b) => res(b!), "image/png")
      );
      const buf = await blob.arrayBuffer();
      entries.push({
        name: `slide-${String(i + 1).padStart(2, "0")}.png`,
        data: new Uint8Array(buf),
      });
    }

    if (entries.length > 0) {
      downloadZip(entries, "carousel-slides.zip");
    }
    setExporting(false);
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <GalleryHorizontalEnd className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-headline font-bold tracking-tight">Scroll Generator</h1>
        </div>
        <p className="text-muted-foreground text-sm">Split images into seamless carousel slides with overlap</p>
      </div>

      {!sourceImage ? (
        <label
          className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-16 cursor-pointer hover:border-primary/30 hover:bg-accent/30 transition-colors"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f?.type.startsWith("image/")) {
              const r = new FileReader();
              r.onload = () => loadImage(r.result as string);
              r.readAsDataURL(f);
            }
          }}
        >
          <Upload className="w-8 h-8 text-primary/30 mb-3" />
          <p className="text-sm text-muted-foreground">Drop a wide or tall image to create carousel slides</p>
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Controls */}
          <div className="lg:w-56 shrink-0">
            <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Slides: {slides}
                </label>
                <input
                  type="range"
                  min={2}
                  max={10}
                  value={slides}
                  onChange={(e) => setSlides(parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Slide ratio</label>
                <div className="space-y-1">
                  {RATIOS.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setRatio(r.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-colors",
                        ratio === r.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
                      )}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Overlap: {overlap}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={20}
                  value={overlap}
                  onChange={(e) => setOverlap(parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div className="pt-2 border-t border-border text-xs text-muted-foreground">
                <p>Direction: {isHorizontal ? "Horizontal" : "Vertical"} (auto)</p>
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
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" /> {exporting ? "Exporting..." : "Export ZIP"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
