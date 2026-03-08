"use client";

import { useState, useRef, useEffect } from "react";
import { ImageIcon, Download, Copy } from "lucide-react";
import { cn } from "@/lib/cn";
import { downloadBlob } from "@/lib/tools/download";
import { copyToClipboard } from "@/lib/tools/clipboard";

export default function PlaceholderGenPage() {
  const [width, setWidth] = useState("800");
  const [height, setHeight] = useState("600");
  const [bgColor, setBgColor] = useState("#cccccc");
  const [textColor, setTextColor] = useState("#666666");
  const [text, setText] = useState("");
  const [format, setFormat] = useState<"png" | "jpeg" | "svg">("png");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const w = Math.min(parseInt(width) || 100, 5000);
  const h = Math.min(parseInt(height) || 100, 5000);
  const displayText = text || `${w} \u00d7 ${h}`;
  const showText = w >= 40 && h >= 40;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Preview at scaled-down size
    const scale = Math.min(1, 400 / w, 300 / h);
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (showText) {
      const fontSize = Math.max(12, Math.min(canvas.width / displayText.length * 1.2, canvas.height / 4));
      ctx.font = `${fontSize}px sans-serif`;
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(displayText, canvas.width / 2, canvas.height / 2);
    }
  }, [w, h, bgColor, textColor, displayText, showText]);

  function handleExport() {
    if (format === "svg") {
      const svg = buildSvg();
      const blob = new Blob([svg], { type: "image/svg+xml" });
      downloadBlob(blob, `placeholder-${w}x${h}.svg`);
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
    if (showText) {
      const fontSize = Math.max(12, Math.min(w / displayText.length * 1.2, h / 4));
      ctx.font = `${fontSize}px sans-serif`;
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(displayText, w / 2, h / 2);
    }
    const mime = format === "jpeg" ? "image/jpeg" : "image/png";
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, `placeholder-${w}x${h}.${format}`);
    }, mime, 0.92);
  }

  function buildSvg() {
    const fontSize = Math.max(12, Math.min(w / displayText.length * 1.2, h / 4));
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <rect width="100%" height="100%" fill="${bgColor}"/>
  ${showText ? `<text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="sans-serif" font-size="${fontSize}" fill="${textColor}">${displayText}</text>` : ""}
</svg>`;
  }

  function handleCopyDataUrl() {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
    if (showText) {
      const fontSize = Math.max(12, Math.min(w / displayText.length * 1.2, h / 4));
      ctx.font = `${fontSize}px sans-serif`;
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(displayText, w / 2, h / 2);
    }
    copyToClipboard(canvas.toDataURL("image/png"), "Data URL copied");
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <ImageIcon className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-headline font-bold tracking-tight">Placeholder Generator</h1>
        </div>
        <p className="text-muted-foreground text-sm">Generate placeholder images for mockups and development</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Width (px)</label>
            <input type="number" value={width} onChange={(e) => setWidth(e.target.value)} min={1} max={5000} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Height (px)</label>
            <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} min={1} max={5000} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Background</label>
            <div className="flex items-center gap-2">
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded border border-border cursor-pointer" />
              <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Text color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-8 h-8 rounded border border-border cursor-pointer" />
              <input type="text" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Custom text (optional)</label>
          <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder={`${w} \u00d7 ${h}`} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
      </div>

      {/* Preview */}
      <div className="flex justify-center mb-6">
        <canvas ref={canvasRef} className="border border-border rounded-lg max-w-full" />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-muted p-0.5 rounded-lg">
          {(["png", "jpeg", "svg"] as const).map((f) => (
            <button key={f} onClick={() => setFormat(f)} className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-colors", format === f ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}>{f.toUpperCase()}</button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleCopyDataUrl} className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-xs font-medium hover:bg-accent transition-colors">
            <Copy className="w-3.5 h-3.5" /> Data URL
          </button>
          <button onClick={handleExport} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Download className="w-4 h-4" /> Download
          </button>
        </div>
      </div>
    </div>
  );
}
