"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { SmilePlus, Copy, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { copyToClipboard } from "@/lib/tools/clipboard";

interface GlyphBlock {
  label: string;
  start: number;
  end: number;
}

const UNICODE_BLOCKS: GlyphBlock[] = [
  { label: "Arrows", start: 0x2190, end: 0x21ff },
  { label: "Mathematical Operators", start: 0x2200, end: 0x22ff },
  { label: "Box Drawing", start: 0x2500, end: 0x257f },
  { label: "Block Elements", start: 0x2580, end: 0x259f },
  { label: "Geometric Shapes", start: 0x25a0, end: 0x25ff },
  { label: "Misc Symbols", start: 0x2600, end: 0x26ff },
  { label: "Dingbats", start: 0x2700, end: 0x27bf },
  { label: "Currency Symbols", start: 0x20a0, end: 0x20cf },
  { label: "Letterlike Symbols", start: 0x2100, end: 0x214f },
  { label: "Number Forms", start: 0x2150, end: 0x218f },
  { label: "General Punctuation", start: 0x2000, end: 0x206f },
  { label: "Superscripts & Subscripts", start: 0x2070, end: 0x209f },
  { label: "Misc Technical", start: 0x2300, end: 0x23ff },
  { label: "Braille Patterns", start: 0x2800, end: 0x28ff },
  { label: "Supplemental Arrows", start: 0x27f0, end: 0x27ff },
];

const EMOJI_RANGES: GlyphBlock[] = [
  { label: "Smileys & Emotion", start: 0x1f600, end: 0x1f64f },
  { label: "Hand Gestures", start: 0x1f44d, end: 0x1f44f },
  { label: "People", start: 0x1f466, end: 0x1f487 },
  { label: "Animals & Nature", start: 0x1f400, end: 0x1f43f },
  { label: "Food & Drink", start: 0x1f345, end: 0x1f37f },
  { label: "Travel & Places", start: 0x1f680, end: 0x1f6c5 },
  { label: "Objects", start: 0x1f4a0, end: 0x1f4ff },
  { label: "Symbols", start: 0x2600, end: 0x26ff },
  { label: "Hearts & Stars", start: 0x2764, end: 0x2764 },
  { label: "Misc Emoji", start: 0x1f300, end: 0x1f320 },
];

type Tab = "unicode" | "emoji";

function codePointToHex(cp: number): string {
  return `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`;
}

function getHtmlEntity(cp: number): string {
  return `&#x${cp.toString(16).toUpperCase()};`;
}

function getCssContent(cp: number): string {
  return `\\${cp.toString(16).toUpperCase()}`;
}

function getJsEscape(cp: number): string {
  if (cp <= 0xffff) return `\\u${cp.toString(16).toUpperCase().padStart(4, "0")}`;
  return `\\u{${cp.toString(16).toUpperCase()}}`;
}

export default function GlyphBrowserPage() {
  const [tab, setTab] = useState<Tab>("unicode");
  const [search, setSearch] = useState("");
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [selectedChar, setSelectedChar] = useState<{ char: string; cp: number } | null>(null);
  const [recentlyCopied, setRecentlyCopied] = useState<string[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  const blocks = tab === "unicode" ? UNICODE_BLOCKS : EMOJI_RANGES;

  const activeBlock = useMemo(() => {
    if (selectedBlock) return blocks.find((b) => b.label === selectedBlock) || blocks[0];
    return blocks[0];
  }, [selectedBlock, blocks]);

  const characters = useMemo(() => {
    const chars: { char: string; cp: number }[] = [];
    for (let cp = activeBlock.start; cp <= activeBlock.end; cp++) {
      try {
        const char = String.fromCodePoint(cp);
        chars.push({ char, cp });
      } catch {}
    }
    return chars;
  }, [activeBlock]);

  const filteredCharacters = useMemo(() => {
    if (!search.trim()) return characters;
    const q = search.toLowerCase();
    // Search by code point hex
    if (q.startsWith("u+") || q.startsWith("0x")) {
      const hex = q.replace(/^(u\+|0x)/, "");
      const cp = parseInt(hex, 16);
      if (!isNaN(cp)) {
        try {
          return [{ char: String.fromCodePoint(cp), cp }];
        } catch {
          return [];
        }
      }
    }
    // Search across all blocks for matching characters
    const results: { char: string; cp: number }[] = [];
    for (const block of blocks) {
      for (let cp = block.start; cp <= block.end; cp++) {
        try {
          const char = String.fromCodePoint(cp);
          const hex = codePointToHex(cp).toLowerCase();
          if (hex.includes(q) || char === q) {
            results.push({ char, cp });
          }
        } catch {}
      }
    }
    return results.slice(0, 200);
  }, [search, characters, blocks]);

  const displayChars = search.trim() ? filteredCharacters : characters;

  function handleCopy(char: string) {
    copyToClipboard(char, "character");
    setRecentlyCopied((prev) => [char, ...prev.filter((c) => c !== char)].slice(0, 20));
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <SmilePlus className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-headline font-bold tracking-tight">Glyph & Emoji Browser</h1>
        </div>
        <p className="text-muted-foreground text-sm">Browse, search, and copy Unicode characters and emoji</p>
      </div>

      {/* Tab + search */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex gap-1">
          <button
            onClick={() => { setTab("unicode"); setSelectedBlock(null); setSearch(""); }}
            className={cn("px-3 py-1.5 text-xs font-medium rounded-lg transition-colors", tab === "unicode" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent")}
          >
            Unicode
          </button>
          <button
            onClick={() => { setTab("emoji"); setSelectedBlock(null); setSearch(""); }}
            className={cn("px-3 py-1.5 text-xs font-medium rounded-lg transition-colors", tab === "emoji" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent")}
          >
            Emoji
          </button>
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search by character or U+code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-muted border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Block selector sidebar */}
        <div className="lg:w-48 shrink-0">
          <div className="bg-card border border-border rounded-2xl p-2 max-h-[60vh] overflow-y-auto space-y-0.5">
            {blocks.map((b) => (
              <button
                key={b.label}
                onClick={() => { setSelectedBlock(b.label); setSearch(""); }}
                className={cn(
                  "w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors",
                  (selectedBlock || blocks[0].label) === b.label
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent"
                )}
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* Recently copied */}
          {recentlyCopied.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">Recently copied</p>
              <div className="flex flex-wrap gap-1">
                {recentlyCopied.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => handleCopy(c)}
                    className="w-8 h-8 flex items-center justify-center text-lg bg-card border border-border rounded hover:bg-accent transition-colors"
                    title="Click to copy again"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main grid */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] gap-1 mb-4">
            {displayChars.map(({ char, cp }) => (
              <button
                key={cp}
                onClick={() => {
                  handleCopy(char);
                  setSelectedChar({ char, cp });
                }}
                className={cn(
                  "aspect-square flex items-center justify-center text-lg rounded border transition-colors hover:bg-accent hover:border-primary/30",
                  selectedChar?.cp === cp ? "bg-primary/10 border-primary/30" : "border-border bg-card"
                )}
                title={codePointToHex(cp)}
              >
                {char}
              </button>
            ))}
            {displayChars.length === 0 && (
              <p className="col-span-full text-xs text-muted-foreground py-8 text-center">No characters found</p>
            )}
          </div>

          {/* Detail panel */}
          {selectedChar && (
            <div className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-start gap-4">
                <div className="text-5xl w-16 h-16 flex items-center justify-center bg-muted rounded-xl">
                  {selectedChar.char}
                </div>
                <div className="flex-1 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-20">Code point</span>
                    <span className="font-mono">{codePointToHex(selectedChar.cp)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-20">HTML</span>
                    <span className="font-mono">{getHtmlEntity(selectedChar.cp)}</span>
                    <button onClick={() => copyToClipboard(getHtmlEntity(selectedChar.cp), "HTML entity")} className="text-muted-foreground hover:text-primary">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-20">CSS</span>
                    <span className="font-mono">{getCssContent(selectedChar.cp)}</span>
                    <button onClick={() => copyToClipboard(getCssContent(selectedChar.cp), "CSS value")} className="text-muted-foreground hover:text-primary">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-20">JavaScript</span>
                    <span className="font-mono">{getJsEscape(selectedChar.cp)}</span>
                    <button onClick={() => copyToClipboard(getJsEscape(selectedChar.cp), "JS escape")} className="text-muted-foreground hover:text-primary">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-20">Decimal</span>
                    <span className="font-mono">{selectedChar.cp}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
