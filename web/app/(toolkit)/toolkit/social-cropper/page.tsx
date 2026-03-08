"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Crop, Upload, Download, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { cn } from "@/lib/cn";
import { CROP_PRESETS, getPresetsByPlatform } from "@/lib/tools/social-presets";
import type { CropPreset } from "@/lib/tools/social-presets";
import { downloadBlob } from "@/lib/tools/download";

interface ImageState {
  src: string;
  naturalWidth: number;
  naturalHeight: number;
}

export default function SocialCropperPage() {
  const [image, setImage] = useState<ImageState | null>(null);
  const [preset, setPreset] = useState<CropPreset>(CROP_PRESETS[0]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [format, setFormat] = useState<"png" | "jpeg">("png");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  // Load image from sessionStorage (for "Open in..." pipeline) or file input
  useEffect(() => {
    const stored = sessionStorage.getItem("tool-input-social-cropper");
    if (stored) {
      sessionStorage.removeItem("tool-input-social-cropper");
      loadImageFromSrc(stored);
    }
  }, []);

  function loadImageFromSrc(src: string) {
    const img = new Image();
    img.onload = () => {
      setImage({ src, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight });
      setZoom(1);
      setPan({ x: 0, y: 0 });
    };
    img.src = src;
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => loadImageFromSrc(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file?.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => loadImageFromSrc(reader.result as string);
    reader.readAsDataURL(file);
  }

  // Pan handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    draggingRef.current = true;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - lastPosRef.current.x;
    const dy = e.clientY - lastPosRef.current.y;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  }, []);

  const handlePointerUp = useCallback(() => {
    draggingRef.current = false;
  }, []);

  // Zoom
  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((z) => Math.max(0.1, Math.min(5, z + delta)));
  }

  function resetView() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  // Export
  function handleExport() {
    if (!image) return;
    const canvas = document.createElement("canvas");
    canvas.width = preset.width;
    canvas.height = preset.height;
    const ctx = canvas.getContext("2d")!;

    const img = new Image();
    img.onload = () => {
      // Calculate source dimensions to fill the crop area
      const previewEl = previewRef.current;
      if (!previewEl) return;

      const viewW = previewEl.clientWidth;
      const viewH = previewEl.clientHeight;

      // Scale factor from preview to output
      const scaleX = preset.width / viewW;
      const scaleY = preset.height / viewH;

      // Image display size in preview coords
      const imgScale = Math.max(viewW / img.naturalWidth, viewH / img.naturalHeight) * zoom;
      const dispW = img.naturalWidth * imgScale;
      const dispH = img.naturalHeight * imgScale;

      // Image position in preview coords
      const imgX = (viewW - dispW) / 2 + pan.x;
      const imgY = (viewH - dispH) / 2 + pan.y;

      // Draw image in output coords
      ctx.drawImage(img, imgX * scaleX, imgY * scaleY, dispW * scaleX, dispH * scaleY);

      const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
      canvas.toBlob(
        (blob) => {
          if (blob) {
            downloadBlob(blob, `cropped-${preset.id}.${format}`);
          }
        },
        mimeType,
        format === "jpeg" ? 0.92 : undefined
      );
    };
    img.src = image.src;
  }

  const platforms = getPresetsByPlatform();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Crop className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-headline font-bold tracking-tight">
            Social Cropper
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Crop images to exact platform dimensions
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar: presets */}
        <div className="lg:w-64 shrink-0">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-xs font-headline font-bold uppercase tracking-widest text-muted-foreground">
                Platform Presets
              </h2>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {Object.entries(platforms).map(([platform, presets]) => (
                <div key={platform}>
                  <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 bg-muted/30">
                    {platform}
                  </div>
                  {presets.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPreset(p)}
                      className={cn(
                        "w-full text-left px-4 py-2.5 text-sm transition-colors",
                        preset.id === p.id
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground/70 hover:bg-accent"
                      )}
                    >
                      <span className="block">{p.label}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {p.width} x {p.height}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main area */}
        <div className="flex-1 min-w-0">
          {!image ? (
            /* Upload zone */
            <label
              className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-16 cursor-pointer hover:border-primary/30 hover:bg-accent/30 transition-colors"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <Upload className="w-8 h-8 text-primary/30 mb-3" />
              <p className="text-sm text-muted-foreground mb-1">
                Drop an image here or click to upload
              </p>
              <p className="text-xs text-muted-foreground/50">
                PNG, JPEG, WebP, GIF, BMP
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          ) : (
            <>
              {/* Crop preview */}
              <div
                ref={previewRef}
                className="relative bg-muted/30 border border-border rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
                style={{ aspectRatio: `${preset.width} / ${preset.height}`, maxHeight: 500 }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onWheel={handleWheel}
              >
                <img
                  src={image.src}
                  alt="Crop preview"
                  className="absolute pointer-events-none"
                  draggable={false}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: "center center",
                  }}
                />
                {/* Dimensions badge */}
                <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 text-white text-[10px] font-mono rounded-md">
                  {preset.width} x {preset.height}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setZoom((z) => Math.max(0.1, z - 0.1))}
                    className="p-2 rounded-lg border border-border hover:bg-accent transition-colors"
                    title="Zoom out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono text-muted-foreground w-12 text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={() => setZoom((z) => Math.min(5, z + 0.1))}
                    className="p-2 rounded-lg border border-border hover:bg-accent transition-colors"
                    title="Zoom in"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={resetView}
                    className="p-2 rounded-lg border border-border hover:bg-accent transition-colors"
                    title="Reset view"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {/* Format toggle */}
                  <div className="flex gap-1 bg-muted p-0.5 rounded-lg">
                    {(["png", "jpeg"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFormat(f)}
                        className={cn(
                          "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                          format === f
                            ? "bg-background shadow-sm text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {f.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  {/* Export */}
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>

              {/* Upload another */}
              <label className="block mt-4 text-center">
                <span className="text-xs text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                  Upload a different image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Resolution warning */}
              {image.naturalWidth < preset.width || image.naturalHeight < preset.height ? (
                <p className="text-xs text-amber-600 mt-3 text-center">
                  Source image ({image.naturalWidth}x{image.naturalHeight}) is smaller than target ({preset.width}x{preset.height}). Output may appear blurry.
                </p>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
