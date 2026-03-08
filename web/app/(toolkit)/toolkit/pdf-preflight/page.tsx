"use client";

import { useState, useRef } from "react";
import { FileSearch, Upload, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";

type CheckStatus = "pass" | "warn" | "fail" | "info";

interface PreflightCheck {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
  pages?: string;
}

interface PreflightReport {
  filename: string;
  fileSize: string;
  pageCount: number;
  checks: PreflightCheck[];
}

const STATUS_ICON: Record<CheckStatus, React.ReactNode> = {
  pass: <CheckCircle className="w-4 h-4 text-green-500" />,
  warn: <AlertTriangle className="w-4 h-4 text-amber-500" />,
  fail: <XCircle className="w-4 h-4 text-red-500" />,
  info: <CheckCircle className="w-4 h-4 text-blue-500" />,
};

const STATUS_BG: Record<CheckStatus, string> = {
  pass: "bg-green-500/5 border-green-500/20",
  warn: "bg-amber-500/5 border-amber-500/20",
  fail: "bg-red-500/5 border-red-500/20",
  info: "bg-blue-500/5 border-blue-500/20",
};

async function analyzePdf(file: File): Promise<PreflightReport> {
  const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");

  // Set worker source using bundled worker matching installed version
  GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const buffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: buffer }).promise;
  const checks: PreflightCheck[] = [];

  // Page count
  const pageCount = pdf.numPages;
  checks.push({
    id: "pages",
    label: "Page count",
    status: "info",
    detail: `${pageCount} page${pageCount !== 1 ? "s" : ""}`,
  });

  // Analyze pages for size consistency, fonts, images
  const pageSizes: string[] = [];
  let hasEmbeddedFonts = true;
  let fontCount = 0;
  let hasImages = false;
  let lowResImages = 0;
  let hasTransparency = false;
  let colorSpaces = new Set<string>();

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    const w = Math.round(viewport.width * 72 / 96); // convert to points
    const h = Math.round(viewport.height * 72 / 96);
    pageSizes.push(`${w}×${h}pt`);

    // Check operators for image references, transparency, color spaces
    const ops = await page.getOperatorList();
    for (let j = 0; j < ops.fnArray.length; j++) {
      const fn = ops.fnArray[j];
      // OPS.paintImageXObject = 85, paintJpegXObject = 82
      if (fn === 85 || fn === 82) {
        hasImages = true;
      }
      // OPS.setGState = 32 may contain transparency
      if (fn === 32) {
        hasTransparency = true;
      }
    }

    page.cleanup();
  }

  // Page size consistency
  const uniqueSizes = [...new Set(pageSizes)];
  if (uniqueSizes.length === 1) {
    checks.push({
      id: "page-size",
      label: "Page size consistency",
      status: "pass",
      detail: `All pages are ${uniqueSizes[0]}`,
    });
  } else {
    checks.push({
      id: "page-size",
      label: "Page size consistency",
      status: "warn",
      detail: `${uniqueSizes.length} different page sizes found: ${uniqueSizes.join(", ")}`,
    });
  }

  // File size check
  const sizeMB = file.size / (1024 * 1024);
  checks.push({
    id: "file-size",
    label: "File size",
    status: sizeMB > 50 ? "warn" : "pass",
    detail: sizeMB > 50
      ? `${sizeMB.toFixed(1)}MB — large file may cause processing issues`
      : `${sizeMB.toFixed(1)}MB`,
  });

  // Image check
  if (hasImages) {
    checks.push({
      id: "images",
      label: "Raster images detected",
      status: "info",
      detail: "PDF contains raster images. Verify resolution is at least 300 DPI for print quality.",
    });
  } else {
    checks.push({
      id: "images",
      label: "No raster images",
      status: "pass",
      detail: "No raster images detected — vector-only or text-only PDF.",
    });
  }

  // Transparency
  checks.push({
    id: "transparency",
    label: "Transparency",
    status: hasTransparency ? "warn" : "pass",
    detail: hasTransparency
      ? "Transparency detected. May cause issues with older print RIPs. Consider flattening."
      : "No transparency objects detected.",
  });

  // Bleed check (structural — check for TrimBox/BleedBox)
  try {
    const page1 = await pdf.getPage(1);
    const trimBox = (page1 as any)._pageInfo?.view;
    // pdfjs doesn't expose TrimBox/BleedBox directly; use heuristic
    checks.push({
      id: "bleed",
      label: "Bleed / Trim marks",
      status: "info",
      detail: "Cannot fully verify bleed setup from browser. Check that your PDF includes a 3mm bleed zone beyond the trim area.",
    });
    page1.cleanup();
  } catch {
    checks.push({
      id: "bleed",
      label: "Bleed / Trim marks",
      status: "info",
      detail: "Could not analyze bleed configuration.",
    });
  }

  // Font embedding (metadata-level check)
  const metadata = await pdf.getMetadata().catch(() => null);
  checks.push({
    id: "fonts",
    label: "Font embedding",
    status: "info",
    detail: "Verify all fonts are embedded or subsetted in your source application. Browser-based analysis cannot fully inspect font embedding.",
  });

  // Color space heuristic
  checks.push({
    id: "colorspace",
    label: "Color space",
    status: "info",
    detail: "For commercial print, ensure all colors are in CMYK. Browser PDF parsing has limited color space inspection capabilities.",
  });

  // Metadata
  if (metadata?.info) {
    const info = metadata.info as any;
    const producer = info.Producer || "Unknown";
    const creator = info.Creator || "Unknown";
    checks.push({
      id: "metadata",
      label: "PDF metadata",
      status: "info",
      detail: `Creator: ${creator} | Producer: ${producer}`,
    });
  }

  pdf.destroy();

  return {
    filename: file.name,
    fileSize: `${sizeMB.toFixed(2)} MB`,
    pageCount,
    checks,
  };
}

export default function PdfPreflightPage() {
  const [report, setReport] = useState<PreflightReport | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.name.endsWith(".pdf") && file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setError("File exceeds 100MB limit.");
      return;
    }

    setAnalyzing(true);
    setError("");
    setReport(null);

    try {
      const result = await analyzePdf(file);
      setReport(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to analyze PDF. It may be encrypted or corrupted.");
    } finally {
      setAnalyzing(false);
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  const passCount = report?.checks.filter((c) => c.status === "pass").length ?? 0;
  const warnCount = report?.checks.filter((c) => c.status === "warn").length ?? 0;
  const failCount = report?.checks.filter((c) => c.status === "fail").length ?? 0;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <FileSearch className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-headline font-bold tracking-tight">PDF Preflight</h1>
        </div>
        <p className="text-muted-foreground text-sm">Check PDFs for print-readiness issues before sending to press</p>
      </div>

      {!report && !analyzing ? (
        <div className="space-y-4">
          <label
            className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-16 cursor-pointer hover:border-primary/30 hover:bg-accent/30 transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
          >
            <Upload className="w-8 h-8 text-primary/30 mb-3" />
            <p className="text-sm text-muted-foreground">Drop a PDF file or click to upload</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Max 100MB. Read-only analysis — your file is not modified.</p>
            <input ref={fileRef} type="file" accept=".pdf,application/pdf" onChange={handleFileUpload} className="hidden" />
          </label>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-500">
              {error}
            </div>
          )}
        </div>
      ) : analyzing ? (
        <div className="flex items-center justify-center min-h-48 bg-muted rounded-2xl border border-border">
          <div className="text-center text-muted-foreground space-y-2">
            <div className="inline-block w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-sm">Analyzing PDF...</p>
          </div>
        </div>
      ) : report ? (
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-wrap items-center gap-4">
            <div>
              <p className="text-sm font-medium">{report.filename}</p>
              <p className="text-xs text-muted-foreground">{report.fileSize} · {report.pageCount} page{report.pageCount !== 1 ? "s" : ""}</p>
            </div>
            <div className="flex gap-3 ml-auto">
              {passCount > 0 && (
                <span className="flex items-center gap-1 text-xs text-green-500">
                  <CheckCircle className="w-3.5 h-3.5" /> {passCount} pass
                </span>
              )}
              {warnCount > 0 && (
                <span className="flex items-center gap-1 text-xs text-amber-500">
                  <AlertTriangle className="w-3.5 h-3.5" /> {warnCount} warn
                </span>
              )}
              {failCount > 0 && (
                <span className="flex items-center gap-1 text-xs text-red-500">
                  <XCircle className="w-3.5 h-3.5" /> {failCount} fail
                </span>
              )}
            </div>
          </div>

          {/* Checks */}
          <div className="space-y-2">
            {report.checks.map((check) => (
              <div
                key={check.id}
                className={cn("flex items-start gap-3 p-3 rounded-xl border", STATUS_BG[check.status])}
              >
                <div className="mt-0.5 shrink-0">{STATUS_ICON[check.status]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{check.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{check.detail}</p>
                  {check.pages && (
                    <p className="text-xs text-muted-foreground/60 mt-0.5">Pages: {check.pages}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <label className="text-xs text-muted-foreground hover:text-primary cursor-pointer transition-colors">
              Analyze another PDF
              <input type="file" accept=".pdf,application/pdf" onChange={handleFileUpload} className="hidden" />
            </label>
            <button
              onClick={() => { setReport(null); setError(""); }}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Start over
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground/60">
            This tool analyzes but does not modify your PDF. Some checks require verification in your source application.
          </p>
        </div>
      ) : null}
    </div>
  );
}
