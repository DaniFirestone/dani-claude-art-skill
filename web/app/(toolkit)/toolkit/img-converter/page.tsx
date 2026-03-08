"use client";

import { useState, useCallback, useEffect } from "react";
import { ArrowLeftRight, Upload, Download, Trash2, FileArchive } from "lucide-react";
import { cn } from "@/lib/cn";
import { downloadBlob } from "@/lib/tools/download";
import { downloadZip } from "@/lib/tools/zip";
import type { ZipEntry } from "@/lib/tools/zip";

interface FileItem {
  id: string;
  file: File;
  preview: string;
  converted?: { blob: Blob; size: number };
}

const FORMATS = ["png", "jpeg", "webp"] as const;
type Format = typeof FORMATS[number];

const MIME: Record<Format, string> = {
  png: "image/png",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

export default function ImgConverterPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [format, setFormat] = useState<Format>("webp");
  const [quality, setQuality] = useState(85);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);

  // Pipeline input
  useEffect(() => {
    const stored = sessionStorage.getItem("tool-input-img-converter");
    if (stored) {
      sessionStorage.removeItem("tool-input-img-converter");
      // It's a data URL or object URL from the AI pipeline
      fetch(stored)
        .then((r) => r.blob())
        .then((blob) => {
          const file = new File([blob], "image.png", { type: blob.type });
          addFiles([file]);
        })
        .catch(() => {});
    }
  }, []);

  function addFiles(newFiles: File[]) {
    const items: FileItem[] = newFiles
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({
        id: Math.random().toString(36).slice(2),
        file: f,
        preview: URL.createObjectURL(f),
      }));
    setFiles((prev) => [...prev, ...items]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    addFiles(Array.from(e.dataTransfer.files));
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) addFiles(Array.from(e.target.files));
    e.target.value = "";
  }

  function removeFile(id: string) {
    setFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((f) => f.id !== id);
    });
  }

  async function convertAll() {
    setConverting(true);
    setProgress(0);
    const updated = [...files];

    for (let i = 0; i < updated.length; i++) {
      const item = updated[i];
      const img = new Image();
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.src = item.preview;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (b) => resolve(b!),
          MIME[format],
          format === "png" ? undefined : quality / 100
        );
      });

      updated[i] = { ...item, converted: { blob, size: blob.size } };
      setProgress(((i + 1) / updated.length) * 100);
    }

    setFiles(updated);
    setConverting(false);
  }

  function downloadSingle(item: FileItem) {
    if (!item.converted) return;
    const name = item.file.name.replace(/\.[^.]+$/, `.${format}`);
    downloadBlob(item.converted.blob, name);
  }

  async function downloadAllZip() {
    const entries: ZipEntry[] = [];
    for (const item of files) {
      if (!item.converted) continue;
      const name = item.file.name.replace(/\.[^.]+$/, `.${format}`);
      const buf = await item.converted.blob.arrayBuffer();
      entries.push({ name, data: new Uint8Array(buf) });
    }
    downloadZip(entries, `converted-${format}.zip`);
  }

  const allConverted = files.length > 0 && files.every((f) => f.converted);

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <ArrowLeftRight className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-headline font-bold tracking-tight">Image Converter</h1>
        </div>
        <p className="text-muted-foreground text-sm">Convert between PNG, JPEG, and WebP with quality control</p>
      </div>

      {/* Settings */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-6">
        <div className="flex items-end gap-6">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Output format</label>
            <div className="flex gap-1 bg-muted p-0.5 rounded-lg">
              {FORMATS.map((f) => (
                <button key={f} onClick={() => setFormat(f)} className={cn("px-4 py-2 text-xs font-medium rounded-md transition-colors", format === f ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}>{f.toUpperCase()}</button>
              ))}
            </div>
          </div>
          {format !== "png" && (
            <div className="flex-1 max-w-xs">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Quality: {quality}%</label>
              <input type="range" min={1} max={100} value={quality} onChange={(e) => setQuality(parseInt(e.target.value))} className="w-full accent-primary" />
            </div>
          )}
        </div>
      </div>

      {/* Upload zone */}
      {files.length === 0 ? (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-16 cursor-pointer hover:border-primary/30 hover:bg-accent/30 transition-colors" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
          <Upload className="w-8 h-8 text-primary/30 mb-3" />
          <p className="text-sm text-muted-foreground mb-1">Drop images here or click to upload</p>
          <p className="text-xs text-muted-foreground/50">Multiple files supported</p>
          <input type="file" accept="image/*" multiple onChange={handleFileInput} className="hidden" />
        </label>
      ) : (
        <>
          {/* File list */}
          <div className="space-y-2 mb-4">
            {files.map((item) => (
              <div key={item.id} className="flex items-center gap-3 bg-card border border-border rounded-xl p-3">
                <img src={item.preview} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{item.file.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatSize(item.file.size)}
                    {item.converted && (
                      <> → <span className={item.converted.size < item.file.size ? "text-emerald-600" : "text-amber-600"}>{formatSize(item.converted.size)}</span></>
                    )}
                  </p>
                </div>
                {item.converted && (
                  <button onClick={() => downloadSingle(item)} className="p-2 hover:bg-accent rounded-lg transition-colors">
                    <Download className="w-4 h-4 text-primary" />
                  </button>
                )}
                <button onClick={() => removeFile(item.id)} className="p-2 hover:bg-destructive/10 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>

          {/* Add more + actions */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-muted-foreground hover:text-primary cursor-pointer transition-colors">
              + Add more images
              <input type="file" accept="image/*" multiple onChange={handleFileInput} className="hidden" />
            </label>
            <div className="flex items-center gap-2">
              {allConverted && files.length > 1 && (
                <button onClick={downloadAllZip} className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-xs font-medium hover:bg-accent transition-colors">
                  <FileArchive className="w-3.5 h-3.5" /> Download ZIP
                </button>
              )}
              <button onClick={convertAll} disabled={converting} className={cn("flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors", converting && "opacity-50 cursor-not-allowed")}>
                {converting ? `Converting ${Math.round(progress)}%...` : `Convert to ${format.toUpperCase()}`}
              </button>
            </div>
          </div>

          {/* Progress bar */}
          {converting && (
            <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
