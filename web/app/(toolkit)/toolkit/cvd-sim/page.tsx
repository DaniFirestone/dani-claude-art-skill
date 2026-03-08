"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { EyeOff, Upload, Palette } from "lucide-react";
import { cn } from "@/lib/cn";

type CVDType =
  | "protanopia"
  | "deuteranopia"
  | "tritanopia"
  | "protanomaly"
  | "deuteranomaly"
  | "tritanomaly"
  | "achromatopsia";

interface CVDInfo {
  id: CVDType;
  label: string;
  desc: string;
}

const CVD_TYPES: CVDInfo[] = [
  { id: "protanopia", label: "Protanopia", desc: "No red cones" },
  { id: "deuteranopia", label: "Deuteranopia", desc: "No green cones" },
  { id: "tritanopia", label: "Tritanopia", desc: "No blue cones" },
  { id: "protanomaly", label: "Protanomaly", desc: "Weak red cones" },
  { id: "deuteranomaly", label: "Deuteranomaly", desc: "Weak green (most common)" },
  { id: "tritanomaly", label: "Tritanomaly", desc: "Weak blue cones" },
  { id: "achromatopsia", label: "Achromatopsia", desc: "Total color blindness" },
];

// Machado et al. (2009) CVD simulation matrices (severity = 1.0 for full dichromacy)
const CVD_MATRICES: Record<string, number[]> = {
  protanopia: [
    0.152286, 1.052583, -0.204868,
    0.114503, 0.786281, 0.099216,
    -0.003882, -0.048116, 1.051998,
  ],
  deuteranopia: [
    0.367322, 0.860646, -0.227968,
    0.280085, 0.672501, 0.047413,
    -0.011820, 0.042940, 0.968881,
  ],
  tritanopia: [
    1.255528, -0.076749, -0.178779,
    -0.078411, 0.930809, 0.147602,
    0.004733, 0.691367, 0.303900,
  ],
  protanomaly: [
    0.458064, 0.679578, -0.137642,
    0.092785, 0.846313, 0.060902,
    -0.007494, -0.016807, 1.024301,
  ],
  deuteranomaly: [
    0.547494, 0.607765, -0.155259,
    0.181692, 0.781742, 0.036566,
    -0.010410, 0.027275, 0.983136,
  ],
  tritanomaly: [
    1.017277, 0.027029, -0.044306,
    -0.006113, 0.958479, 0.047634,
    0.006379, 0.248708, 0.744913,
  ],
  achromatopsia: [
    0.2126, 0.7152, 0.0722,
    0.2126, 0.7152, 0.0722,
    0.2126, 0.7152, 0.0722,
  ],
};

function srgbToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c: number): number {
  const s = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return Math.round(Math.max(0, Math.min(255, s * 255)));
}

function simulateCVD(r: number, g: number, b: number, matrix: number[]): [number, number, number] {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const sr = matrix[0] * lr + matrix[1] * lg + matrix[2] * lb;
  const sg = matrix[3] * lr + matrix[4] * lg + matrix[5] * lb;
  const sb = matrix[6] * lr + matrix[7] * lg + matrix[8] * lb;

  return [linearToSrgb(sr), linearToSrgb(sg), linearToSrgb(sb)];
}

type Mode = "color" | "image";

export default function CVDSimPage() {
  const [mode, setMode] = useState<Mode>("color");
  const [colors, setColors] = useState(["#e74c3c", "#2ecc71", "#3498db", "#f1c40f", "#9b59b6"]);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [activeCVD, setActiveCVD] = useState<CVDType>("deuteranopia");
  const imgRef = useRef<HTMLImageElement | null>(null);
  const origCanvasRef = useRef<HTMLCanvasElement>(null);
  const simCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("tool-input-cvd-sim");
    if (stored) {
      sessionStorage.removeItem("tool-input-cvd-sim");
      setMode("image");
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
    reader.onload = () => {
      setMode("image");
      loadImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  const drawSimulation = useCallback(() => {
    const img = imgRef.current;
    const origCanvas = origCanvasRef.current;
    const simCanvas = simCanvasRef.current;
    if (!img || !origCanvas || !simCanvas) return;

    const maxW = 500;
    const scale = Math.min(1, maxW / img.naturalWidth);
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);

    origCanvas.width = w;
    origCanvas.height = h;
    simCanvas.width = w;
    simCanvas.height = h;

    const origCtx = origCanvas.getContext("2d")!;
    const simCtx = simCanvas.getContext("2d")!;

    origCtx.drawImage(img, 0, 0, w, h);
    simCtx.drawImage(img, 0, 0, w, h);

    const matrix = CVD_MATRICES[activeCVD];
    const imageData = simCtx.getImageData(0, 0, w, h);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const [r, g, b] = simulateCVD(data[i], data[i + 1], data[i + 2], matrix);
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }

    simCtx.putImageData(imageData, 0, 0);
  }, [sourceImage, activeCVD]);

  useEffect(() => {
    if (mode === "image") drawSimulation();
  }, [drawSimulation, mode]);

  function hexToRgb(hex: string): [number, number, number] {
    const v = parseInt(hex.slice(1), 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  }

  function rgbToHex(r: number, g: number, b: number): string {
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
  }

  function simulateHex(hex: string, cvdType: CVDType): string {
    const [r, g, b] = hexToRgb(hex);
    const [sr, sg, sb] = simulateCVD(r, g, b, CVD_MATRICES[cvdType]);
    return rgbToHex(sr, sg, sb);
  }

  function updateColor(idx: number, hex: string) {
    setColors((prev) => {
      const next = [...prev];
      next[idx] = hex;
      return next;
    });
  }

  function addColor() {
    if (colors.length < 10) {
      setColors((prev) => [...prev, "#888888"]);
    }
  }

  function removeColor(idx: number) {
    if (colors.length > 1) {
      setColors((prev) => prev.filter((_, i) => i !== idx));
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <EyeOff className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-headline font-bold tracking-tight">Color Blindness Simulator</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Preview how colors and images appear under color vision deficiency
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode("color")}
          className={cn(
            "px-4 py-2 text-xs font-medium rounded-lg transition-colors",
            mode === "color" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
          )}
        >
          <Palette className="w-3.5 h-3.5 inline mr-1.5" />
          Colors
        </button>
        <button
          onClick={() => setMode("image")}
          className={cn(
            "px-4 py-2 text-xs font-medium rounded-lg transition-colors",
            mode === "image" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
          )}
        >
          <Upload className="w-3.5 h-3.5 inline mr-1.5" />
          Image
        </button>
      </div>

      {/* CVD type selector */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {CVD_TYPES.map((cvd) => (
          <button
            key={cvd.id}
            onClick={() => setActiveCVD(cvd.id)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
              activeCVD === cvd.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
            )}
            title={cvd.desc}
          >
            {cvd.label}
          </button>
        ))}
      </div>

      {mode === "color" ? (
        <div className="space-y-4">
          {/* Color inputs */}
          <div className="flex flex-wrap gap-2 items-center">
            {colors.map((c, i) => (
              <div key={i} className="relative group">
                <input
                  type="color"
                  value={c}
                  onChange={(e) => updateColor(i, e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-border"
                />
                {colors.length > 1 && (
                  <button
                    onClick={() => removeColor(i)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-muted border border-border rounded-full text-[10px] text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {colors.length < 10 && (
              <button
                onClick={addColor}
                className="w-10 h-10 rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors flex items-center justify-center text-lg"
              >
                +
              </button>
            )}
          </div>

          {/* Simulation grid */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {/* Original row */}
            <div className="p-3 border-b border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2">Original</p>
              <div className="flex gap-2">
                {colors.map((c, i) => (
                  <div key={i} className="text-center">
                    <div className="w-12 h-12 rounded-lg border border-border" style={{ backgroundColor: c }} />
                    <p className="text-[10px] text-muted-foreground mt-1 font-mono">{c}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Active CVD row */}
            <div className="p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                {CVD_TYPES.find((t) => t.id === activeCVD)?.label}
              </p>
              <div className="flex gap-2">
                {colors.map((c, i) => {
                  const sim = simulateHex(c, activeCVD);
                  return (
                    <div key={i} className="text-center">
                      <div className="w-12 h-12 rounded-lg border border-border" style={{ backgroundColor: sim }} />
                      <p className="text-[10px] text-muted-foreground mt-1 font-mono">{sim}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* All types overview */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">All types</p>
            <div className="grid gap-2">
              {CVD_TYPES.map((cvd) => (
                <div
                  key={cvd.id}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer",
                    activeCVD === cvd.id ? "bg-primary/5" : "hover:bg-accent/50"
                  )}
                  onClick={() => setActiveCVD(cvd.id)}
                >
                  <span className="text-xs text-muted-foreground w-28 shrink-0">{cvd.label}</span>
                  <div className="flex gap-1">
                    {colors.map((c, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded border border-border"
                        style={{ backgroundColor: simulateHex(c, cvd.id) }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground/60">
            Simulation uses Machado et al. (2009) matrices. Individual experiences vary.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
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
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Original</p>
                  <canvas ref={origCanvasRef} className="w-full border border-border rounded-xl" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    {CVD_TYPES.find((t) => t.id === activeCVD)?.label}
                  </p>
                  <canvas ref={simCanvasRef} className="w-full border border-border rounded-xl" />
                </div>
              </div>
              <label className="text-xs text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                Upload different image
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
              <p className="text-[11px] text-muted-foreground/60">
                Simulation uses Machado et al. (2009) matrices. Individual experiences vary.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
