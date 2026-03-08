"use client";

import { useState, useRef, useEffect } from "react";
import { QrCode, Download } from "lucide-react";
import { cn } from "@/lib/cn";
import { downloadBlob } from "@/lib/tools/download";

type ContentType = "url" | "text" | "email" | "wifi" | "phone";

const CONTENT_TYPES: { id: ContentType; label: string }[] = [
  { id: "url", label: "URL" },
  { id: "text", label: "Text" },
  { id: "email", label: "Email" },
  { id: "wifi", label: "WiFi" },
  { id: "phone", label: "Phone" },
];

const DOT_STYLES = ["square", "dots", "rounded", "extra-rounded", "classy", "classy-rounded"] as const;
const CORNER_STYLES = ["square", "dot", "extra-rounded"] as const;
const ERROR_LEVELS = ["L", "M", "Q", "H"] as const;

export default function QrGenPage() {
  const [contentType, setContentType] = useState<ContentType>("url");
  const [content, setContent] = useState("https://example.com");
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiSecurity, setWifiSecurity] = useState("WPA");
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [dotStyle, setDotStyle] = useState<typeof DOT_STYLES[number]>("square");
  const [cornerStyle, setCornerStyle] = useState<typeof CORNER_STYLES[number]>("square");
  const [errorLevel, setErrorLevel] = useState<typeof ERROR_LEVELS[number]>("M");
  const [resolution, setResolution] = useState(1024);

  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<any>(null);

  function getQrData(): string {
    switch (contentType) {
      case "wifi":
        return `WIFI:S:${wifiSsid};T:${wifiSecurity};P:${wifiPassword};;`;
      case "email":
        return `mailto:${emailTo}${emailSubject ? `?subject=${encodeURIComponent(emailSubject)}` : ""}`;
      case "phone":
        return `tel:${content}`;
      default:
        return content;
    }
  }

  useEffect(() => {
    let cancelled = false;
    import("qr-code-styling").then((mod) => {
      if (cancelled) return;
      const QRCodeStyling = mod.default;

      if (qrRef.current) {
        qrRef.current._options = {};
      }

      const qr = new QRCodeStyling({
        width: 280,
        height: 280,
        data: getQrData() || "https://example.com",
        dotsOptions: { type: dotStyle, color: fgColor },
        cornersSquareOptions: { type: cornerStyle, color: fgColor },
        backgroundOptions: { color: bgColor },
        qrOptions: { errorCorrectionLevel: errorLevel },
      });

      qrRef.current = qr;
      const el = containerRef.current;
      if (el) {
        el.innerHTML = "";
        qr.append(el);
      }
    });
    return () => { cancelled = true; };
  }, [content, contentType, wifiSsid, wifiPassword, wifiSecurity, emailTo, emailSubject, fgColor, bgColor, dotStyle, cornerStyle, errorLevel]);

  function handleExport(fmt: "png" | "svg") {
    if (!qrRef.current) return;
    // Recreate at export resolution
    import("qr-code-styling").then((mod) => {
      const QRCodeStyling = mod.default;
      const qr = new QRCodeStyling({
        width: resolution,
        height: resolution,
        data: getQrData() || "https://example.com",
        dotsOptions: { type: dotStyle, color: fgColor },
        cornersSquareOptions: { type: cornerStyle, color: fgColor },
        backgroundOptions: { color: bgColor },
        qrOptions: { errorCorrectionLevel: errorLevel },
      });

      if (fmt === "svg") {
        qr.getRawData("svg").then((data) => {
          if (data instanceof Blob) downloadBlob(data, "qr-code.svg");
        });
      } else {
        qr.getRawData("png").then((data) => {
          if (data instanceof Blob) downloadBlob(data, "qr-code.png");
        });
      }
    });
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <QrCode className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-headline font-bold tracking-tight">QR Code Generator</h1>
        </div>
        <p className="text-muted-foreground text-sm">Generate styled QR codes with custom shapes and colors</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Controls */}
        <div className="flex-1 space-y-4">
          {/* Content type */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <label className="block text-xs font-medium text-muted-foreground mb-2">Content type</label>
            <div className="flex flex-wrap gap-1 mb-4">
              {CONTENT_TYPES.map((ct) => (
                <button key={ct.id} onClick={() => setContentType(ct.id)} className={cn("px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors", contentType === ct.id ? "bg-primary/10 border-primary/30 text-primary" : "border-border text-muted-foreground hover:text-foreground")}>{ct.label}</button>
              ))}
            </div>

            {contentType === "wifi" ? (
              <div className="space-y-3">
                <input type="text" value={wifiSsid} onChange={(e) => setWifiSsid(e.target.value)} placeholder="Network name (SSID)" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <input type="text" value={wifiPassword} onChange={(e) => setWifiPassword(e.target.value)} placeholder="Password" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <select value={wifiSecurity} onChange={(e) => setWifiSecurity(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="WPA">WPA/WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">None</option>
                </select>
              </div>
            ) : contentType === "email" ? (
              <div className="space-y-3">
                <input type="email" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} placeholder="recipient@example.com" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <input type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="Subject (optional)" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            ) : (
              <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={contentType === "url" ? "https://example.com" : contentType === "phone" ? "+1234567890" : "Enter text..."} rows={3} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/20" />
            )}
          </div>

          {/* Style */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Foreground</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-8 h-8 rounded border border-border cursor-pointer" />
                  <span className="text-xs font-mono text-muted-foreground">{fgColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Background</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded border border-border cursor-pointer" />
                  <span className="text-xs font-mono text-muted-foreground">{bgColor}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Dot style</label>
              <div className="flex flex-wrap gap-1">
                {DOT_STYLES.map((s) => (
                  <button key={s} onClick={() => setDotStyle(s)} className={cn("px-2.5 py-1 text-[10px] font-medium rounded-md border transition-colors", dotStyle === s ? "bg-primary/10 border-primary/30 text-primary" : "border-border text-muted-foreground")}>{s}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Corner style</label>
              <div className="flex flex-wrap gap-1">
                {CORNER_STYLES.map((s) => (
                  <button key={s} onClick={() => setCornerStyle(s)} className={cn("px-2.5 py-1 text-[10px] font-medium rounded-md border transition-colors", cornerStyle === s ? "bg-primary/10 border-primary/30 text-primary" : "border-border text-muted-foreground")}>{s}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Error correction</label>
                <div className="flex gap-1">
                  {ERROR_LEVELS.map((l) => (
                    <button key={l} onClick={() => setErrorLevel(l)} className={cn("flex-1 py-1.5 text-xs font-medium rounded-md border transition-colors", errorLevel === l ? "bg-primary/10 border-primary/30 text-primary" : "border-border text-muted-foreground")}>{l} ({l === "L" ? "7%" : l === "M" ? "15%" : l === "Q" ? "25%" : "30%"})</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Resolution</label>
                <select value={resolution} onChange={(e) => setResolution(parseInt(e.target.value))} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  {[256, 512, 1024, 2048, 4096].map((r) => (
                    <option key={r} value={r}>{r}px</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Preview + export */}
        <div className="lg:w-80 shrink-0">
          <div className="bg-card border border-border rounded-2xl p-6 sticky top-6">
            <div ref={containerRef} className="flex justify-center mb-4 [&>canvas]:rounded-xl [&>svg]:rounded-xl" />
            <div className="flex gap-2">
              <button onClick={() => handleExport("png")} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                <Download className="w-4 h-4" /> PNG
              </button>
              <button onClick={() => handleExport("svg")} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-colors">
                <Download className="w-4 h-4" /> SVG
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
