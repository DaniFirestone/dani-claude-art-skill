"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, Upload, Download, Copy } from "lucide-react";
import { downloadZip, type ZipEntry } from "@/lib/tools/zip";
import { copyToClipboard } from "@/lib/tools/clipboard";

const SIZES = [
  { name: "favicon-16x16.png", size: 16 },
  { name: "favicon-32x32.png", size: 32 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "android-chrome-192x192.png", size: 192 },
  { name: "android-chrome-512x512.png", size: 512 },
  { name: "mstile-150x150.png", size: 150 },
];

const ICO_SIZES = [16, 32, 48];

const HTML_SNIPPET = `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="manifest" href="/site.webmanifest">`;

const WEBMANIFEST = JSON.stringify(
  {
    name: "",
    short_name: "",
    icons: [
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    theme_color: "#ffffff",
    background_color: "#ffffff",
    display: "standalone",
  },
  null,
  2
);

function resizeToCanvas(img: HTMLImageElement, size: number, bgColor?: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  if (bgColor) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);
  }
  // Center crop to square
  const s = Math.min(img.naturalWidth, img.naturalHeight);
  const sx = (img.naturalWidth - s) / 2;
  const sy = (img.naturalHeight - s) / 2;
  ctx.drawImage(img, sx, sy, s, s, 0, 0, size, size);
  return c;
}

async function canvasToUint8(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/png"));
  return new Uint8Array(await blob.arrayBuffer());
}

function buildIco(pngBuffers: { size: number; data: Uint8Array }[]): Uint8Array {
  // ICO format: header (6 bytes) + entries (16 bytes each) + image data
  const count = pngBuffers.length;
  const headerSize = 6 + count * 16;
  let totalSize = headerSize;
  for (const buf of pngBuffers) totalSize += buf.data.length;

  const ico = new Uint8Array(totalSize);
  const view = new DataView(ico.buffer);

  // Header
  view.setUint16(0, 0, true); // reserved
  view.setUint16(2, 1, true); // type: ICO
  view.setUint16(4, count, true); // image count

  let dataOffset = headerSize;
  for (let i = 0; i < count; i++) {
    const { size, data } = pngBuffers[i];
    const entryOffset = 6 + i * 16;
    ico[entryOffset] = size < 256 ? size : 0; // width
    ico[entryOffset + 1] = size < 256 ? size : 0; // height
    ico[entryOffset + 2] = 0; // color palette
    ico[entryOffset + 3] = 0; // reserved
    view.setUint16(entryOffset + 4, 1, true); // color planes
    view.setUint16(entryOffset + 6, 32, true); // bits per pixel
    view.setUint32(entryOffset + 8, data.length, true); // size
    view.setUint32(entryOffset + 12, dataOffset, true); // offset
    ico.set(data, dataOffset);
    dataOffset += data.length;
  }

  return ico;
}

export default function FaviconGenPage() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [useBg, setUseBg] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [previews, setPreviews] = useState<{ name: string; url: string }[]>([]);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("tool-input-favicon-gen");
    if (stored) {
      sessionStorage.removeItem("tool-input-favicon-gen");
      loadImage(stored);
    }
  }, []);

  function loadImage(src: string) {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setSourceImage(src);
      generatePreviews(img);
    };
    img.src = src;
  }

  function generatePreviews(img: HTMLImageElement) {
    const result: { name: string; url: string }[] = [];
    for (const s of SIZES.slice(0, 4)) {
      const c = resizeToCanvas(img, s.size);
      result.push({ name: s.name, url: c.toDataURL() });
    }
    setPreviews(result);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => loadImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleExport() {
    const img = imgRef.current;
    if (!img) return;
    setExporting(true);

    const entries: ZipEntry[] = [];
    const bg = useBg ? bgColor : undefined;

    // Generate PNG sizes
    for (const s of SIZES) {
      const c = resizeToCanvas(img, s.size, s.name.includes("apple") ? bg : undefined);
      entries.push({ name: s.name, data: await canvasToUint8(c) });
    }

    // Generate ICO
    const icoParts: { size: number; data: Uint8Array }[] = [];
    for (const size of ICO_SIZES) {
      const c = resizeToCanvas(img, size);
      icoParts.push({ size, data: await canvasToUint8(c) });
    }
    entries.push({ name: "favicon.ico", data: buildIco(icoParts) });

    // Webmanifest
    entries.push({
      name: "site.webmanifest",
      data: new TextEncoder().encode(WEBMANIFEST),
    });

    downloadZip(entries, "favicon-package.zip");
    setExporting(false);
  }

  const isNotSquare = imgRef.current
    ? Math.abs(imgRef.current.naturalWidth - imgRef.current.naturalHeight) > 2
    : false;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Globe className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-headline font-bold tracking-tight">Favicon Generator</h1>
        </div>
        <p className="text-muted-foreground text-sm">Generate a complete favicon package from any image</p>
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
          <p className="text-xs text-muted-foreground/60 mt-1">Square logos or icons work best</p>
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>
      ) : (
        <div className="space-y-6">
          {/* Source + previews */}
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="sm:w-48 shrink-0">
              <p className="text-xs font-medium text-muted-foreground mb-2">Source</p>
              <img
                src={sourceImage}
                alt="Source"
                className="w-full rounded-xl border border-border"
              />
              {isNotSquare && (
                <p className="text-xs text-amber-500 mt-2">Image is not square — it will be center-cropped.</p>
              )}
              <label className="block text-xs text-muted-foreground hover:text-primary cursor-pointer transition-colors mt-2">
                Change image
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground mb-2">Preview</p>
              <div className="flex items-end gap-4 flex-wrap">
                {previews.map((p) => (
                  <div key={p.name} className="text-center">
                    <img
                      src={p.url}
                      alt={p.name}
                      className="border border-border rounded"
                      style={{ width: Math.min(64, parseInt(p.name.match(/\d+/)?.[0] || "32")), imageRendering: "auto" }}
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">{p.name.match(/\d+x\d+/)?.[0]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={useBg}
                onChange={(e) => setUseBg(e.target.checked)}
                className="accent-primary"
              />
              <span className="text-muted-foreground">Set background color for Apple Touch icon (iOS fills transparent with black)</span>
            </label>
            {useBg && (
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0"
                />
                <span className="text-xs text-muted-foreground font-mono">{bgColor}</span>
              </div>
            )}
          </div>

          {/* HTML Snippet */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">HTML &lt;head&gt; snippet</p>
              <button
                onClick={() => copyToClipboard(HTML_SNIPPET, "HTML snippet")}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
            </div>
            <pre className="bg-muted border border-border rounded-xl p-3 text-xs font-mono text-foreground overflow-x-auto whitespace-pre">
              {HTML_SNIPPET}
            </pre>
          </div>

          {/* Package contents */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Package contents</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-xs text-muted-foreground">
              <span>favicon.ico (16/32/48)</span>
              {SIZES.map((s) => (
                <span key={s.name}>{s.name}</span>
              ))}
              <span>site.webmanifest</span>
            </div>
          </div>

          {/* Export */}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> {exporting ? "Generating..." : "Download Favicon Package"}
          </button>
        </div>
      )}
    </div>
  );
}
