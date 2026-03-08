"use client";

import { useState, useMemo } from "react";
import { Code, Copy } from "lucide-react";
import { cn } from "@/lib/cn";
import { copyToClipboard } from "@/lib/tools/clipboard";

interface MetaFields {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  siteName: string;
  ogType: string;
  locale: string;
  twitterCard: string;
  twitterSite: string;
  twitterCreator: string;
  themeColor: string;
  author: string;
  robots: string;
}

const DEFAULT: MetaFields = {
  title: "",
  description: "",
  url: "",
  imageUrl: "",
  siteName: "",
  ogType: "website",
  locale: "en_US",
  twitterCard: "summary_large_image",
  twitterSite: "",
  twitterCreator: "",
  themeColor: "#ffffff",
  author: "",
  robots: "index, follow",
};

function generateTags(f: MetaFields): string {
  const tags: string[] = [];
  tags.push(`<meta charset="UTF-8">`);
  tags.push(`<meta name="viewport" content="width=device-width, initial-scale=1.0">`);

  if (f.title) tags.push(`<title>${esc(f.title)}</title>`);
  if (f.description) tags.push(`<meta name="description" content="${esc(f.description)}">`);
  if (f.author) tags.push(`<meta name="author" content="${esc(f.author)}">`);
  if (f.robots) tags.push(`<meta name="robots" content="${esc(f.robots)}">`);
  if (f.url) tags.push(`<link rel="canonical" href="${esc(f.url)}">`);
  if (f.themeColor) tags.push(`<meta name="theme-color" content="${esc(f.themeColor)}">`);

  // Open Graph
  tags.push("");
  tags.push("<!-- Open Graph -->");
  if (f.title) tags.push(`<meta property="og:title" content="${esc(f.title)}">`);
  if (f.description) tags.push(`<meta property="og:description" content="${esc(f.description)}">`);
  if (f.url) tags.push(`<meta property="og:url" content="${esc(f.url)}">`);
  if (f.imageUrl) tags.push(`<meta property="og:image" content="${esc(f.imageUrl)}">`);
  tags.push(`<meta property="og:type" content="${esc(f.ogType)}">`);
  if (f.siteName) tags.push(`<meta property="og:site_name" content="${esc(f.siteName)}">`);
  tags.push(`<meta property="og:locale" content="${esc(f.locale)}">`);

  // Twitter / X
  tags.push("");
  tags.push("<!-- Twitter / X -->");
  tags.push(`<meta name="twitter:card" content="${esc(f.twitterCard)}">`);
  if (f.title) tags.push(`<meta name="twitter:title" content="${esc(f.title)}">`);
  if (f.description) tags.push(`<meta name="twitter:description" content="${esc(f.description)}">`);
  if (f.imageUrl) tags.push(`<meta name="twitter:image" content="${esc(f.imageUrl)}">`);
  if (f.twitterSite) tags.push(`<meta name="twitter:site" content="${esc(f.twitterSite)}">`);
  if (f.twitterCreator) tags.push(`<meta name="twitter:creator" content="${esc(f.twitterCreator)}">`);

  return tags.join("\n");
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function CharCount({ value, max, warn }: { value: number; max: number; warn: number }) {
  const color = value > max ? "text-red-500" : value > warn ? "text-amber-500" : "text-muted-foreground/60";
  return <span className={`text-[10px] ${color}`}>{value}/{max}</span>;
}

export default function MetaTagGenPage() {
  const [fields, setFields] = useState<MetaFields>(DEFAULT);

  function update<K extends keyof MetaFields>(key: K, value: MetaFields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  const output = useMemo(() => generateTags(fields), [fields]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Code className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-headline font-bold tracking-tight">Meta Tag Generator</h1>
        </div>
        <p className="text-muted-foreground text-sm">Generate SEO and social media meta tags with live previews</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Form */}
        <div className="lg:w-80 shrink-0 space-y-4">
          {/* Basic SEO */}
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <p className="text-xs font-medium text-muted-foreground">Basic SEO</p>
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-muted-foreground">Page title</label>
                <CharCount value={fields.title.length} max={60} warn={50} />
              </div>
              <input
                type="text"
                value={fields.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="My Awesome Page"
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-muted-foreground">Description</label>
                <CharCount value={fields.description.length} max={160} warn={140} />
              </div>
              <textarea
                value={fields.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="A brief description of the page content..."
                rows={3}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
            <input
              type="text"
              value={fields.url}
              onChange={(e) => update("url", e.target.value)}
              placeholder="https://example.com/page"
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            <input
              type="text"
              value={fields.author}
              onChange={(e) => update("author", e.target.value)}
              placeholder="Author name"
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            <select
              value={fields.robots}
              onChange={(e) => update("robots", e.target.value)}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs"
            >
              <option value="index, follow">index, follow</option>
              <option value="noindex, follow">noindex, follow</option>
              <option value="index, nofollow">index, nofollow</option>
              <option value="noindex, nofollow">noindex, nofollow</option>
            </select>
          </div>

          {/* Open Graph */}
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <p className="text-xs font-medium text-muted-foreground">Open Graph</p>
            <input
              type="text"
              value={fields.imageUrl}
              onChange={(e) => update("imageUrl", e.target.value)}
              placeholder="https://example.com/og-image.jpg"
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            <input
              type="text"
              value={fields.siteName}
              onChange={(e) => update("siteName", e.target.value)}
              placeholder="Site name"
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            <div className="flex gap-2">
              <select
                value={fields.ogType}
                onChange={(e) => update("ogType", e.target.value)}
                className="flex-1 bg-muted border border-border rounded-lg px-2 py-2 text-xs"
              >
                {["website", "article", "product", "profile", "book", "music.song", "video.movie"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <input
                type="text"
                value={fields.locale}
                onChange={(e) => update("locale", e.target.value)}
                placeholder="en_US"
                className="w-20 bg-muted border border-border rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Twitter */}
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <p className="text-xs font-medium text-muted-foreground">Twitter / X</p>
            <select
              value={fields.twitterCard}
              onChange={(e) => update("twitterCard", e.target.value)}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs"
            >
              <option value="summary">summary</option>
              <option value="summary_large_image">summary_large_image</option>
              <option value="app">app</option>
              <option value="player">player</option>
            </select>
            <input
              type="text"
              value={fields.twitterSite}
              onChange={(e) => update("twitterSite", e.target.value)}
              placeholder="@site_handle"
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            <input
              type="text"
              value={fields.twitterCreator}
              onChange={(e) => update("twitterCreator", e.target.value)}
              placeholder="@creator_handle"
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>

          {/* Theme color */}
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <p className="text-xs font-medium text-muted-foreground">Theme color</p>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={fields.themeColor}
                onChange={(e) => update("themeColor", e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border-0"
              />
              <input
                type="text"
                value={fields.themeColor}
                onChange={(e) => update("themeColor", e.target.value)}
                className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
          </div>
        </div>

        {/* Preview + Output */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Google preview */}
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-xs font-medium text-muted-foreground mb-3">Google Search Preview</p>
            <div className="space-y-1">
              <p className="text-xs text-green-600 truncate">{fields.url || "https://example.com"}</p>
              <p className="text-blue-600 text-base font-medium leading-tight truncate">
                {fields.title || "Page Title"}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {fields.description || "Page description will appear here..."}
              </p>
            </div>
          </div>

          {/* Social card preview */}
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-xs font-medium text-muted-foreground mb-3">Social Card Preview</p>
            <div className="border border-border rounded-xl overflow-hidden max-w-md">
              {fields.imageUrl && (
                <div className="bg-muted h-40 flex items-center justify-center text-xs text-muted-foreground">
                  og:image preview
                </div>
              )}
              <div className="p-3 space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  {fields.siteName || (fields.url ? new URL(fields.url).hostname : "example.com")}
                </p>
                <p className="text-sm font-medium truncate">{fields.title || "Page Title"}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {fields.description || "Description..."}
                </p>
              </div>
            </div>
          </div>

          {/* Generated code */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">Generated HTML</p>
              <button
                onClick={() => copyToClipboard(output, "meta tags")}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <Copy className="w-3.5 h-3.5" /> Copy all
              </button>
            </div>
            <pre className="bg-muted border border-border rounded-xl p-3 text-xs font-mono text-foreground overflow-x-auto max-h-64 overflow-y-auto whitespace-pre">
              {output}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
