"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Grid3x3, Upload, Download } from "lucide-react";
import { cn } from "@/lib/cn";
import { downloadBlob } from "@/lib/tools/download";
import { downloadZip, type ZipEntry } from "@/lib/tools/zip";

export default function ImageSplitterPage() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [exporting, setExporting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("tool-input-img-splitter");
    if (stored) {
      sessionStorage.removeItem("tool-input-img-splitter");
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

    // Draw grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    const tileW = canvas.width / cols;
    const tileH = canvas.height / rows;

    for (let c = 1; c < cols; c++) {
      ctx.beginPath();
      ctx.moveTo(c * tileW, 0);
      ctx.lineTo(c * tileW, canvas.height);
      ctx.stroke();
    }
    for (let r = 1; r < rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * tileH);
      ctx.lineTo(canvas.width, r * tileH);
      ctx.stroke();
    }

    // Draw dark shadow lines for visibility on light images
    ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
    ctx.setLineDash([4, 4]);
    ctx.lineDashOffset = 4;

    for (let c = 1; c < cols; c++) {
      ctx.beginPath();
      ctx.moveTo(c * tileW, 0);
      ctx.lineTo(c * tileW, canvas.height);
      ctx.stroke();
    }
    for (let r = 1; r < rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * tileH);
      ctx.lineTo(canvas.width, r * tileH);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
  }, [sourceImage, rows, cols]);

  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  async function handleExport(asZip: boolean) {
    const img = imgRef.current;
    if (!img) return;
    setExporting(true);

    const tileW = Math.floor(img.naturalWidth / cols);
    const tileH = Math.floor(img.naturalHeight / rows);
    const entries: ZipEntry[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c + 1;
        const sx = c * tileW;
        const sy = r * tileH;
        // Last col/row absorbs remainder
        const w = c === cols - 1 ? img.naturalWidth - sx : tileW;
        const h = r === rows - 1 ? img.naturalHeight - sy : tileH;

        const tile = document.createElement("canvas");
        tile.width = w;
        tile.height = h;
        const tctx = tile.getContext("2d")!;
        tctx.drawImage(img, sx, sy, w, h, 0, 0, w, h);

        const blob = await new Promise<Blob>((res) =>
          tile.toBlob((b) => res(b!), "image/png")
        );

        if (asZip) {
          const buf = await blob.arrayBuffer();
          entries.push({
            name: `tile-${String(idx).padStart(2, "0")}.png`,
            data: new Uint8Array(buf),
          });
        } else {
          downloadBlob(blob, `tile-${String(idx).padStart(2, "0")}.png`);
        }
      }
    }

    if (asZip && entries.length > 0) {
      downloadZip(entries, "tiles.zip");
    }
    setExporting(false);
  }

  const totalTiles = rows * cols;
  const img = imgRef.current;
  const tileW = img ? Math.floor(img.naturalWidth / cols) : 0;
  const tileH = img ? Math.floor(img.naturalHeight / rows) : 0;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Grid3x3 className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-headline font-bold tracking-tight">Image Splitter</h1>
        </div>
        <p className="text-muted-foreground text-sm">Split images into grid tiles for mosaics, sprites, or print</p>
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
          <p className="text-sm text-muted-foreground">Drop an image or click to upload</p>
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Controls */}
          <div className="lg:w-56 shrink-0">
            <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Columns: {cols}
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={cols}
                  onChange={(e) => setCols(parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Rows: {rows}
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={rows}
                  onChange={(e) => setRows(parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div className="pt-2 border-t border-border text-xs text-muted-foreground space-y-1">
                <p>{totalTiles} tile{totalTiles !== 1 ? "s" : ""}</p>
                {img && <p>Each ~{tileW}×{tileH}px</p>}
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExport(false)}
                  disabled={exporting}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" /> Individual
                </button>
                <button
                  onClick={() => handleExport(true)}
                  disabled={exporting}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" /> ZIP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
