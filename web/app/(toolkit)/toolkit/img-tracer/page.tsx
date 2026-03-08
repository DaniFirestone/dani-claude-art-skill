"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { PenTool, Upload, Download, Copy } from "lucide-react";
import { cn } from "@/lib/cn";
import { copyToClipboard } from "@/lib/tools/clipboard";
import { downloadBlob } from "@/lib/tools/download";

type TraceMode = "color" | "silhouette";

interface TraceOptions {
  colors: number;
  detail: number;
  minArea: number;
  mode: TraceMode;
  threshold: number; // for silhouette mode
}

function quantizeColors(imageData: ImageData, numColors: number): { palette: [number, number, number][]; indices: Uint8Array } {
  const { data, width, height } = imageData;
  const pixelCount = width * height;
  const indices = new Uint8Array(pixelCount);

  // Simple median-cut color quantization
  type Box = { pixels: number[][]; min: number[]; max: number[] };

  const pixels: number[][] = [];
  for (let i = 0; i < pixelCount; i++) {
    const idx = i * 4;
    if (data[idx + 3] < 128) continue; // skip transparent
    pixels.push([data[idx], data[idx + 1], data[idx + 2], i]);
  }

  function getBox(pxs: number[][]): Box {
    const min = [255, 255, 255];
    const max = [0, 0, 0];
    for (const p of pxs) {
      for (let c = 0; c < 3; c++) {
        if (p[c] < min[c]) min[c] = p[c];
        if (p[c] > max[c]) max[c] = p[c];
      }
    }
    return { pixels: pxs, min, max };
  }

  function splitBox(box: Box): [Box, Box] {
    // Find longest axis
    const ranges = [box.max[0] - box.min[0], box.max[1] - box.min[1], box.max[2] - box.min[2]];
    const axis = ranges.indexOf(Math.max(...ranges));
    const sorted = [...box.pixels].sort((a, b) => a[axis] - b[axis]);
    const mid = Math.floor(sorted.length / 2);
    return [getBox(sorted.slice(0, mid)), getBox(sorted.slice(mid))];
  }

  let boxes: Box[] = [getBox(pixels)];
  while (boxes.length < numColors) {
    // Split the box with the largest range
    let maxRange = 0;
    let maxIdx = 0;
    for (let i = 0; i < boxes.length; i++) {
      const range = Math.max(
        boxes[i].max[0] - boxes[i].min[0],
        boxes[i].max[1] - boxes[i].min[1],
        boxes[i].max[2] - boxes[i].min[2]
      );
      if (range > maxRange) {
        maxRange = range;
        maxIdx = i;
      }
    }
    if (boxes[maxIdx].pixels.length < 2) break;
    const [a, b] = splitBox(boxes[maxIdx]);
    boxes.splice(maxIdx, 1, a, b);
  }

  // Compute palette as average of each box
  const palette: [number, number, number][] = boxes.map((box) => {
    const avg: [number, number, number] = [0, 0, 0];
    for (const p of box.pixels) {
      avg[0] += p[0];
      avg[1] += p[1];
      avg[2] += p[2];
    }
    const n = box.pixels.length || 1;
    return [Math.round(avg[0] / n), Math.round(avg[1] / n), Math.round(avg[2] / n)];
  });

  // Assign each pixel to nearest palette color
  for (let i = 0; i < pixelCount; i++) {
    const idx = i * 4;
    const r = data[idx], g = data[idx + 1], b = data[idx + 2];
    let minDist = Infinity;
    let bestColor = 0;
    for (let c = 0; c < palette.length; c++) {
      const dr = r - palette[c][0], dg = g - palette[c][1], db = b - palette[c][2];
      const dist = dr * dr + dg * dg + db * db;
      if (dist < minDist) {
        minDist = dist;
        bestColor = c;
      }
    }
    indices[i] = bestColor;
  }

  return { palette, indices };
}

function traceToSvg(
  imageData: ImageData,
  options: TraceOptions
): string {
  const { width, height } = imageData;
  const { data } = imageData;

  if (options.mode === "silhouette") {
    // Convert to binary based on threshold
    const binary = new Uint8Array(width * height);
    for (let i = 0; i < binary.length; i++) {
      const idx = i * 4;
      const lum = (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114) / 255;
      binary[i] = lum < options.threshold / 100 ? 1 : 0;
    }

    const paths = traceBinaryLayer(binary, width, height, options.detail, options.minArea);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">\n${paths.map((d) => `  <path d="${d}" fill="#000"/>`).join("\n")}\n</svg>`;
  }

  // Multi-color trace
  const { palette, indices } = quantizeColors(imageData, options.colors);

  const layers: string[] = [];
  for (let c = 0; c < palette.length; c++) {
    const binary = new Uint8Array(width * height);
    for (let i = 0; i < binary.length; i++) {
      binary[i] = indices[i] === c ? 1 : 0;
    }
    const paths = traceBinaryLayer(binary, width, height, options.detail, options.minArea);
    const color = `rgb(${palette[c][0]},${palette[c][1]},${palette[c][2]})`;
    for (const d of paths) {
      layers.push(`  <path d="${d}" fill="${color}"/>`);
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">\n${layers.join("\n")}\n</svg>`;
}

function traceBinaryLayer(binary: Uint8Array, w: number, h: number, detail: number, minArea: number): string[] {
  // Simple contour tracing using scanline approach
  const visited = new Uint8Array(w * h);
  const paths: string[] = [];
  const simplifyThreshold = (11 - detail) * 0.5; // higher detail = less simplification

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      if (binary[idx] !== 1 || visited[idx]) continue;

      // Flood fill to find connected region
      const region: [number, number][] = [];
      const stack = [[x, y]];
      while (stack.length > 0) {
        const [cx, cy] = stack.pop()!;
        const ci = cy * w + cx;
        if (cx < 0 || cx >= w || cy < 0 || cy >= h) continue;
        if (visited[ci] || binary[ci] !== 1) continue;
        visited[ci] = 1;
        region.push([cx, cy]);
        stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
      }

      if (region.length < minArea) continue;

      // Find boundary points (pixels adjacent to non-region)
      const boundary: [number, number][] = [];
      for (const [px, py] of region) {
        const isBorder =
          px === 0 || px === w - 1 || py === 0 || py === h - 1 ||
          binary[py * w + (px - 1)] !== 1 ||
          binary[py * w + (px + 1)] !== 1 ||
          binary[(py - 1) * w + px] !== 1 ||
          binary[(py + 1) * w + px] !== 1;
        if (isBorder) boundary.push([px, py]);
      }

      if (boundary.length < 3) continue;

      // Sort boundary points by angle from centroid
      const cx = boundary.reduce((s, p) => s + p[0], 0) / boundary.length;
      const cy = boundary.reduce((s, p) => s + p[1], 0) / boundary.length;
      boundary.sort((a, b) => Math.atan2(a[1] - cy, a[0] - cx) - Math.atan2(b[1] - cy, b[0] - cx));

      // Simplify: keep every Nth point based on detail level
      const step = Math.max(1, Math.round(simplifyThreshold));
      const simplified: [number, number][] = [];
      for (let i = 0; i < boundary.length; i += step) {
        simplified.push(boundary[i]);
      }

      if (simplified.length < 3) continue;

      // Build path
      let d = `M${simplified[0][0]},${simplified[0][1]}`;
      for (let i = 1; i < simplified.length; i++) {
        d += `L${simplified[i][0]},${simplified[i][1]}`;
      }
      d += "Z";
      paths.push(d);
    }
  }

  return paths;
}

export default function ImageTracerPage() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [svgOutput, setSvgOutput] = useState("");
  const [tracing, setTracing] = useState(false);
  const [options, setOptions] = useState<TraceOptions>({
    colors: 8,
    detail: 5,
    minArea: 10,
    mode: "color",
    threshold: 50,
  });
  const imgRef = useRef<HTMLImageElement | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("tool-input-img-tracer");
    if (stored) {
      sessionStorage.removeItem("tool-input-img-tracer");
      loadImage(stored);
    }
  }, []);

  function loadImage(src: string) {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setSourceImage(src);
      setSvgOutput("");
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

  function handleTrace() {
    const img = imgRef.current;
    if (!img) return;
    setTracing(true);

    // Process at reduced resolution for performance
    const maxDim = 500;
    const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, w, h);
    const imageData = ctx.getImageData(0, 0, w, h);

    // Use setTimeout to avoid blocking UI
    setTimeout(() => {
      const svg = traceToSvg(imageData, options);
      setSvgOutput(svg);
      setTracing(false);
    }, 50);
  }

  function handleDownload() {
    if (!svgOutput) return;
    const blob = new Blob([svgOutput], { type: "image/svg+xml" });
    downloadBlob(blob, "traced.svg");
  }

  const isPhoto = imgRef.current
    ? imgRef.current.naturalWidth * imgRef.current.naturalHeight > 500000
    : false;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <PenTool className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-headline font-bold tracking-tight">Image Tracer</h1>
        </div>
        <p className="text-muted-foreground text-sm">Convert raster images to SVG vector paths</p>
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
          <p className="text-xs text-muted-foreground/60 mt-1">Works best with logos, icons, and flat-color illustrations</p>
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Controls */}
          <div className="lg:w-56 shrink-0">
            <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Mode</label>
                <div className="space-y-1">
                  {(["color", "silhouette"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setOptions((o) => ({ ...o, mode: m }))}
                      className={cn(
                        "w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-colors capitalize",
                        options.mode === m ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
                      )}
                    >
                      {m === "color" ? "Multi-Color" : "Silhouette"}
                    </button>
                  ))}
                </div>
              </div>

              {options.mode === "color" ? (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Colors: {options.colors}
                  </label>
                  <input
                    type="range"
                    min={2}
                    max={32}
                    value={options.colors}
                    onChange={(e) => setOptions((o) => ({ ...o, colors: parseInt(e.target.value) }))}
                    className="w-full accent-primary"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Threshold: {options.threshold}%
                  </label>
                  <input
                    type="range"
                    min={10}
                    max={90}
                    value={options.threshold}
                    onChange={(e) => setOptions((o) => ({ ...o, threshold: parseInt(e.target.value) }))}
                    className="w-full accent-primary"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Detail: {options.detail}
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={options.detail}
                  onChange={(e) => setOptions((o) => ({ ...o, detail: parseInt(e.target.value) }))}
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Min area: {options.minArea}px
                </label>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={options.minArea}
                  onChange={(e) => setOptions((o) => ({ ...o, minArea: parseInt(e.target.value) }))}
                  className="w-full accent-primary"
                />
              </div>

              <button
                onClick={handleTrace}
                disabled={tracing}
                className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {tracing ? "Tracing..." : "Trace Image"}
              </button>
            </div>

            {isPhoto && (
              <p className="text-xs text-amber-500 mt-3">
                Photographs may produce complex SVGs. For best results, use flat-color artwork.
              </p>
            )}
          </div>

          {/* Preview */}
          <div className="flex-1 min-w-0 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Original</p>
                <img
                  src={sourceImage}
                  alt="Source"
                  className="w-full border border-border rounded-xl"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  {svgOutput ? "Traced SVG" : "Trace result"}
                </p>
                {svgOutput ? (
                  <div
                    ref={previewRef}
                    className="border border-border rounded-xl p-2 bg-white min-h-32"
                    dangerouslySetInnerHTML={{ __html: svgOutput }}
                  />
                ) : (
                  <div className="border border-border border-dashed rounded-xl min-h-32 flex items-center justify-center">
                    <p className="text-xs text-muted-foreground">Click &quot;Trace Image&quot; to generate</p>
                  </div>
                )}
              </div>
            </div>

            {svgOutput && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Download className="w-4 h-4" /> Download SVG
                </button>
                <button
                  onClick={() => copyToClipboard(svgOutput, "SVG code")}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy code
                </button>
                <span className="text-xs text-muted-foreground">
                  {(new Blob([svgOutput]).size / 1024).toFixed(1)}KB
                </span>
              </div>
            )}

            <label className="text-xs text-muted-foreground hover:text-primary cursor-pointer transition-colors">
              Upload different image
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
