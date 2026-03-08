"use client";

import { useState, useRef } from "react";
import { FileImage, Upload, Download, Copy } from "lucide-react";
import { cn } from "@/lib/cn";
import { copyToClipboard } from "@/lib/tools/clipboard";
import { downloadBlob } from "@/lib/tools/download";

interface OptOptions {
  removeComments: boolean;
  removeMetadata: boolean;
  removeEmptyGroups: boolean;
  removeHidden: boolean;
  collapseGroups: boolean;
  optimizePaths: boolean;
  minifyColors: boolean;
  roundPrecision: number;
  removeDefaults: boolean;
}

const DEFAULT_OPTS: OptOptions = {
  removeComments: true,
  removeMetadata: true,
  removeEmptyGroups: true,
  removeHidden: true,
  collapseGroups: true,
  optimizePaths: true,
  minifyColors: true,
  roundPrecision: 2,
  removeDefaults: true,
};

function optimizeSvg(raw: string, opts: OptOptions): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(raw, "image/svg+xml");
  const svg = doc.documentElement;

  if (svg.tagName === "parsererror" || doc.querySelector("parsererror")) {
    throw new Error("Invalid SVG");
  }

  // Remove comments
  if (opts.removeComments) {
    const walker = doc.createTreeWalker(svg, NodeFilter.SHOW_COMMENT);
    const comments: Comment[] = [];
    while (walker.nextNode()) comments.push(walker.currentNode as Comment);
    comments.forEach((c) => c.parentNode?.removeChild(c));
  }

  // Remove editor metadata namespaces
  if (opts.removeMetadata) {
    const metaNS = ["http://ns.adobe.com/", "http://www.inkscape.org/", "http://sodipodi.", "http://creativecommons.org/"];
    // Remove metadata elements
    svg.querySelectorAll("metadata").forEach((el) => el.remove());

    // Remove namespace attributes from root
    const attrsToRemove: string[] = [];
    for (let i = 0; i < svg.attributes.length; i++) {
      const attr = svg.attributes[i];
      if (attr.name.startsWith("xmlns:") && metaNS.some((ns) => attr.value.startsWith(ns))) {
        attrsToRemove.push(attr.name);
      }
      if (attr.name.startsWith("inkscape:") || attr.name.startsWith("sodipodi:")) {
        attrsToRemove.push(attr.name);
      }
    }
    attrsToRemove.forEach((a) => svg.removeAttribute(a));

    // Remove inkscape/sodipodi elements
    svg.querySelectorAll("*").forEach((el) => {
      if (el.tagName.startsWith("sodipodi:") || el.tagName.startsWith("inkscape:")) {
        el.remove();
      }
      // Remove editor-specific attributes from all elements
      const toRemove: string[] = [];
      for (let i = 0; i < el.attributes.length; i++) {
        const name = el.attributes[i].name;
        if (name.startsWith("inkscape:") || name.startsWith("sodipodi:")) {
          toRemove.push(name);
        }
      }
      toRemove.forEach((a) => el.removeAttribute(a));
    });
  }

  // Remove hidden elements
  if (opts.removeHidden) {
    svg.querySelectorAll("[display='none'], [visibility='hidden']").forEach((el) => el.remove());
    svg.querySelectorAll("[opacity='0']").forEach((el) => el.remove());
  }

  // Remove empty groups
  if (opts.removeEmptyGroups) {
    let removed = true;
    while (removed) {
      removed = false;
      svg.querySelectorAll("g").forEach((g) => {
        if (g.children.length === 0 && g.childNodes.length === 0) {
          g.remove();
          removed = true;
        }
      });
    }
  }

  // Collapse unnecessary group nesting
  if (opts.collapseGroups) {
    svg.querySelectorAll("g").forEach((g) => {
      if (g.attributes.length === 0 && g.children.length === 1) {
        g.replaceWith(g.children[0]);
      }
    });
  }

  // Minify color values
  if (opts.minifyColors) {
    const colorMap: Record<string, string> = {
      "#ff0000": "#f00",
      "#00ff00": "#0f0",
      "#0000ff": "#00f",
      "#ffffff": "#fff",
      "#000000": "#000",
      "#ffff00": "#ff0",
      "#00ffff": "#0ff",
      "#ff00ff": "#f0f",
    };

    svg.querySelectorAll("*").forEach((el) => {
      ["fill", "stroke", "stop-color", "flood-color", "lighting-color"].forEach((attr) => {
        const val = el.getAttribute(attr)?.toLowerCase();
        if (val && colorMap[val]) {
          el.setAttribute(attr, colorMap[val]);
        } else if (val && /^#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3$/i.test(val)) {
          el.setAttribute(attr, `#${val[1]}${val[3]}${val[5]}`);
        }
      });
    });
  }

  // Round numeric precision in path data
  if (opts.optimizePaths) {
    const p = opts.roundPrecision;
    svg.querySelectorAll("path").forEach((path) => {
      const d = path.getAttribute("d");
      if (!d) return;
      const optimized = d.replace(/-?\d+\.\d{3,}/g, (match) => {
        return parseFloat(match).toFixed(p).replace(/\.?0+$/, "");
      });
      path.setAttribute("d", optimized);
    });

    // Round numeric attributes on other elements
    svg.querySelectorAll("circle, ellipse, rect, line, polygon, polyline").forEach((el) => {
      ["cx", "cy", "r", "rx", "ry", "x", "y", "width", "height", "x1", "y1", "x2", "y2"].forEach((attr) => {
        const val = el.getAttribute(attr);
        if (val && /^-?\d+\.\d{3,}$/.test(val)) {
          el.setAttribute(attr, parseFloat(val).toFixed(p).replace(/\.?0+$/, ""));
        }
      });
    });
  }

  // Remove default attribute values
  if (opts.removeDefaults) {
    const defaults: Record<string, Record<string, string>> = {
      fill: { "*": "black" },
      stroke: { "*": "none" },
      "stroke-width": { "*": "1" },
      opacity: { "*": "1" },
      "fill-opacity": { "*": "1" },
      "stroke-opacity": { "*": "1" },
      "fill-rule": { "*": "nonzero" },
    };

    svg.querySelectorAll("*").forEach((el) => {
      for (const [attr, defs] of Object.entries(defaults)) {
        const val = el.getAttribute(attr);
        if (val && (defs["*"] === val || defs[el.tagName] === val)) {
          // Don't remove fill="black" if parent has a different fill
          if (attr === "fill" && val === "black") continue;
          el.removeAttribute(attr);
        }
      }
    });
  }

  const serializer = new XMLSerializer();
  let result = serializer.serializeToString(svg);

  // Clean up xml namespace that XMLSerializer adds
  result = result.replace(/ xmlns:NS\d+=""\s*NS\d+:/g, " ");

  return result;
}

export default function SVGOptimiserPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [opts, setOpts] = useState<OptOptions>(DEFAULT_OPTS);
  const [originalSize, setOriginalSize] = useState(0);
  const [optimizedSize, setOptimizedSize] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleInput(raw: string) {
    setInput(raw);
    setError("");
    const size = new Blob([raw]).size;
    setOriginalSize(size);

    try {
      const result = optimizeSvg(raw, opts);
      setOutput(result);
      setOptimizedSize(new Blob([result]).size);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Optimization failed");
      setOutput("");
      setOptimizedSize(0);
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => handleInput(reader.result as string);
    reader.readAsText(file);
  }

  function reoptimize() {
    if (input) handleInput(input);
  }

  function handleToggle(key: keyof OptOptions) {
    setOpts((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      // Re-optimize with new options
      if (input) {
        try {
          const result = optimizeSvg(input, next);
          setOutput(result);
          setOptimizedSize(new Blob([result]).size);
          setError("");
        } catch (e) {
          setError(e instanceof Error ? e.message : "Optimization failed");
        }
      }
      return next;
    });
  }

  function handleDownload() {
    if (!output) return;
    const blob = new Blob([output], { type: "image/svg+xml" });
    downloadBlob(blob, "optimized.svg");
  }

  const reduction = originalSize > 0 ? Math.round((1 - optimizedSize / originalSize) * 100) : 0;

  const OPT_LABELS: { key: keyof OptOptions; label: string }[] = [
    { key: "removeComments", label: "Remove comments" },
    { key: "removeMetadata", label: "Remove editor metadata" },
    { key: "removeEmptyGroups", label: "Remove empty groups" },
    { key: "removeHidden", label: "Remove hidden elements" },
    { key: "collapseGroups", label: "Collapse single-child groups" },
    { key: "optimizePaths", label: "Optimize path precision" },
    { key: "minifyColors", label: "Minify color values" },
    { key: "removeDefaults", label: "Remove default attributes" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <FileImage className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-headline font-bold tracking-tight">SVG Optimiser</h1>
        </div>
        <p className="text-muted-foreground text-sm">Strip metadata and optimize SVG files for the web</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Options sidebar */}
        <div className="lg:w-56 shrink-0">
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <p className="text-xs font-medium text-muted-foreground">Optimizations</p>
            {OPT_LABELS.map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={opts[key] as boolean}
                  onChange={() => handleToggle(key)}
                  className="accent-primary"
                />
                <span className="text-muted-foreground">{label}</span>
              </label>
            ))}
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                Decimal precision: {opts.roundPrecision}
              </label>
              <input
                type="range"
                min={0}
                max={4}
                value={opts.roundPrecision}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setOpts((prev) => {
                    const next = { ...prev, roundPrecision: val };
                    if (input) {
                      try {
                        const result = optimizeSvg(input, next);
                        setOutput(result);
                        setOptimizedSize(new Blob([result]).size);
                      } catch {}
                    }
                    return next;
                  });
                }}
                className="w-full accent-primary"
              />
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-4">
          {!input ? (
            <div className="space-y-3">
              <label
                className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-12 cursor-pointer hover:border-primary/30 hover:bg-accent/30 transition-colors"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files[0];
                  if (f?.name.endsWith(".svg") || f?.type === "image/svg+xml") {
                    const r = new FileReader();
                    r.onload = () => handleInput(r.result as string);
                    r.readAsText(f);
                  }
                }}
              >
                <Upload className="w-8 h-8 text-primary/30 mb-3" />
                <p className="text-sm text-muted-foreground">Drop an SVG file or click to upload</p>
                <input ref={fileRef} type="file" accept=".svg,image/svg+xml" onChange={handleFileUpload} className="hidden" />
              </label>
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Or paste SVG code:</p>
                <textarea
                  className="w-full h-32 bg-muted border border-border rounded-xl p-3 text-xs font-mono text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/30"
                  placeholder="<svg>...</svg>"
                  onPaste={(e) => {
                    setTimeout(() => handleInput(e.currentTarget.value), 0);
                  }}
                  onChange={(e) => {
                    if (e.target.value.includes("</svg>")) handleInput(e.target.value);
                  }}
                />
              </div>
            </div>
          ) : (
            <>
              {/* Size comparison */}
              {output && (
                <div className="flex items-center gap-4 bg-card border border-border rounded-xl p-3">
                  <div className="text-xs">
                    <span className="text-muted-foreground">Original: </span>
                    <span className="font-mono">{(originalSize / 1024).toFixed(1)}KB</span>
                  </div>
                  <span className="text-muted-foreground">→</span>
                  <div className="text-xs">
                    <span className="text-muted-foreground">Optimized: </span>
                    <span className="font-mono">{(optimizedSize / 1024).toFixed(1)}KB</span>
                  </div>
                  <span className={cn("text-xs font-medium", reduction > 0 ? "text-green-500" : "text-muted-foreground")}>
                    {reduction > 0 ? `−${reduction}%` : "no change"}
                  </span>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-500">
                  {error}
                </div>
              )}

              {/* Visual preview */}
              {output && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Original</p>
                    <div
                      className="border border-border rounded-xl p-4 bg-white min-h-32 flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: input }}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Optimized</p>
                    <div
                      className="border border-border rounded-xl p-4 bg-white min-h-32 flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: output }}
                    />
                  </div>
                </div>
              )}

              {/* Output code */}
              {output && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-muted-foreground">Optimized SVG</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(output, "SVG code")}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </button>
                      <button
                        onClick={handleDownload}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                    </div>
                  </div>
                  <pre className="bg-muted border border-border rounded-xl p-3 text-xs font-mono text-foreground overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap break-all">
                    {output}
                  </pre>
                </div>
              )}

              {/* Reset */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setInput(""); setOutput(""); setError(""); setOriginalSize(0); setOptimizedSize(0); }}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Start over
                </button>
                <label className="text-xs text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                  Upload different SVG
                  <input type="file" accept=".svg,image/svg+xml" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
