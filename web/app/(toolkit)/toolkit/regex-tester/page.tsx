"use client";

import { useState, useMemo, useRef } from "react";
import { Regex, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { copyToClipboard } from "@/lib/tools/clipboard";

interface MatchResult {
  text: string;
  index: number;
  groups: { [key: string]: string | undefined };
  numbered: string[];
}

const FLAGS = [
  { id: "g", label: "Global", desc: "Find all matches" },
  { id: "i", label: "Ignore case", desc: "Case-insensitive" },
  { id: "m", label: "Multiline", desc: "^ and $ match line boundaries" },
  { id: "s", label: "DotAll", desc: ". matches newlines" },
  { id: "u", label: "Unicode", desc: "Full Unicode support" },
];

const CHEAT_SHEET = [
  { title: "Character classes", items: [".  Any character", "\\d  Digit [0-9]", "\\w  Word [a-zA-Z0-9_]", "\\s  Whitespace", "\\D \\W \\S  Negations", "[abc]  Character set", "[^abc]  Negated set", "[a-z]  Range"] },
  { title: "Quantifiers", items: ["*  0 or more", "+  1 or more", "?  0 or 1", "{n}  Exactly n", "{n,}  n or more", "{n,m}  n to m"] },
  { title: "Anchors", items: ["^  Start of string", "$  End of string", "\\b  Word boundary"] },
  { title: "Groups", items: ["(...)  Capture group", "(?:...)  Non-capturing", "(?<name>...)  Named group", "\\1  Backreference", "(?=...)  Lookahead", "(?!...)  Neg lookahead", "(?<=...)  Lookbehind", "(?<!...)  Neg lookbehind"] },
  { title: "Escapes", items: ["\\  Escape special char", "\\n  Newline", "\\t  Tab"] },
];

const MATCH_COLORS = [
  "bg-yellow-200/60 dark:bg-yellow-500/30",
  "bg-blue-200/60 dark:bg-blue-500/30",
  "bg-green-200/60 dark:bg-green-500/30",
  "bg-pink-200/60 dark:bg-pink-500/30",
  "bg-purple-200/60 dark:bg-purple-500/30",
];

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState<Set<string>>(new Set(["g"]));
  const [testText, setTestText] = useState("The quick brown fox jumps over the lazy dog.\nPack my box with five dozen liquor jugs.\n555-123-4567 and user@example.com");
  const [replaceMode, setReplaceMode] = useState(false);
  const [replaceStr, setReplaceStr] = useState("");
  const [cheatOpen, setCheatOpen] = useState(false);

  function toggleFlag(f: string) {
    setFlags((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
  }

  const flagStr = [...flags].sort().join("");

  const { regex, error, matches } = useMemo(() => {
    if (!pattern) return { regex: null, error: "", matches: [] as MatchResult[] };

    try {
      const r = new RegExp(pattern, flagStr);
      const results: MatchResult[] = [];

      if (flags.has("g")) {
        let m: RegExpExecArray | null;
        let safety = 0;
        r.lastIndex = 0;
        while ((m = r.exec(testText)) !== null && safety < 500) {
          results.push({
            text: m[0],
            index: m.index,
            groups: m.groups || {},
            numbered: Array.from(m).slice(1),
          });
          if (m[0].length === 0) r.lastIndex++; // prevent infinite loop on zero-width match
          safety++;
        }
      } else {
        const m = r.exec(testText);
        if (m) {
          results.push({
            text: m[0],
            index: m.index,
            groups: m.groups || {},
            numbered: Array.from(m).slice(1),
          });
        }
      }

      return { regex: r, error: "", matches: results };
    } catch (e) {
      return { regex: null, error: (e as Error).message, matches: [] as MatchResult[] };
    }
  }, [pattern, flagStr, testText]);

  const replacedText = useMemo(() => {
    if (!regex || !replaceMode) return "";
    try {
      return testText.replace(regex, replaceStr);
    } catch {
      return "";
    }
  }, [regex, testText, replaceStr, replaceMode]);

  // Build highlighted text segments
  const highlighted = useMemo(() => {
    if (!matches.length || !pattern) return null;

    const segments: { text: string; matchIdx: number | null }[] = [];
    let lastEnd = 0;

    for (let i = 0; i < matches.length; i++) {
      const m = matches[i];
      if (m.index > lastEnd) {
        segments.push({ text: testText.slice(lastEnd, m.index), matchIdx: null });
      }
      segments.push({ text: m.text, matchIdx: i });
      lastEnd = m.index + m.text.length;
    }
    if (lastEnd < testText.length) {
      segments.push({ text: testText.slice(lastEnd), matchIdx: null });
    }

    return segments;
  }, [matches, testText, pattern]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Regex className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-headline font-bold tracking-tight">Regex Tester</h1>
        </div>
        <p className="text-muted-foreground text-sm">Write and test regular expressions with live highlighting</p>
      </div>

      <div className="space-y-4">
        {/* Pattern input */}
        <div>
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-2">
            <span className="text-muted-foreground text-sm font-mono pl-2">/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Enter regex pattern..."
              className="flex-1 bg-transparent text-sm font-mono focus:outline-none"
              spellCheck={false}
            />
            <span className="text-muted-foreground text-sm font-mono">/{flagStr}</span>
          </div>
          {error && <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>}
        </div>

        {/* Flags */}
        <div className="flex flex-wrap gap-1.5">
          {FLAGS.map((f) => (
            <button
              key={f.id}
              onClick={() => toggleFlag(f.id)}
              className={cn(
                "px-2.5 py-1 text-xs font-mono rounded-lg transition-colors",
                flags.has(f.id) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
              )}
              title={f.desc}
            >
              {f.id}
              <span className="font-sans ml-1 text-[10px] opacity-60">{f.label}</span>
            </button>
          ))}
          <button
            onClick={() => setReplaceMode(!replaceMode)}
            className={cn(
              "px-2.5 py-1 text-xs rounded-lg transition-colors ml-2",
              replaceMode ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
            )}
          >
            Replace
          </button>
        </div>

        {/* Replace input */}
        {replaceMode && (
          <input
            type="text"
            value={replaceStr}
            onChange={(e) => setReplaceStr(e.target.value)}
            placeholder="Replacement string ($1, $2, $<name>...)"
            className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary/30"
            spellCheck={false}
          />
        )}

        {/* Test text with highlights */}
        <div className="relative">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Test string
            {matches.length > 0 && (
              <span className="ml-2 text-primary">{matches.length} match{matches.length !== 1 ? "es" : ""}</span>
            )}
          </label>
          {highlighted ? (
            <div className="bg-card border border-border rounded-xl p-3 text-sm font-mono min-h-24 whitespace-pre-wrap break-all">
              {highlighted.map((seg, i) =>
                seg.matchIdx !== null ? (
                  <mark key={i} className={cn("rounded px-0.5", MATCH_COLORS[seg.matchIdx % MATCH_COLORS.length])}>
                    {seg.text}
                  </mark>
                ) : (
                  <span key={i}>{seg.text}</span>
                )
              )}
            </div>
          ) : null}
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className={cn(
              "w-full bg-card border border-border rounded-xl px-3 py-3 text-sm font-mono min-h-24 resize-y focus:outline-none focus:ring-1 focus:ring-primary/30",
              highlighted ? "hidden" : ""
            )}
            spellCheck={false}
          />
          {highlighted && (
            <button
              onClick={() => {
                // Allow editing: briefly hide highlight
                const el = document.querySelector('textarea[spellcheck="false"]') as HTMLTextAreaElement;
                if (el) el.focus();
              }}
              className="absolute top-0 right-0 text-[10px] text-muted-foreground hover:text-primary p-1"
            >
              Edit
            </button>
          )}
        </div>

        {/* Replace preview */}
        {replaceMode && replacedText && (
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-xs font-medium text-muted-foreground">Replace result</label>
              <button
                onClick={() => copyToClipboard(replacedText, "replaced text")}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Copy
              </button>
            </div>
            <pre className="bg-muted border border-border rounded-xl p-3 text-sm font-mono whitespace-pre-wrap break-all max-h-48 overflow-y-auto">
              {replacedText}
            </pre>
          </div>
        )}

        {/* Match details */}
        {matches.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Matches ({matches.length}{matches.length >= 500 ? "+" : ""})
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {matches.slice(0, 50).map((m, i) => (
                <div key={i} className="flex items-start gap-3 text-xs">
                  <span className="text-muted-foreground/60 font-mono w-6 shrink-0 text-right">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <span className="font-mono bg-muted px-1.5 py-0.5 rounded break-all">{m.text || "(empty)"}</span>
                    <span className="text-muted-foreground ml-2">@{m.index}</span>
                    {m.numbered.length > 0 && (
                      <div className="mt-1 text-muted-foreground">
                        Groups: {m.numbered.map((g, gi) => (
                          <span key={gi} className="font-mono bg-muted/50 px-1 rounded mx-0.5">${gi + 1}={g ?? "undefined"}</span>
                        ))}
                        {Object.keys(m.groups).length > 0 && Object.entries(m.groups).map(([k, v]) => (
                          <span key={k} className="font-mono bg-muted/50 px-1 rounded mx-0.5">{k}={v ?? "undefined"}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {matches.length > 50 && (
                <p className="text-xs text-muted-foreground">...and {matches.length - 50} more</p>
              )}
            </div>
          </div>
        )}

        {/* Cheat sheet */}
        <div className="border border-border rounded-2xl overflow-hidden">
          <button
            onClick={() => setCheatOpen(!cheatOpen)}
            className="w-full flex items-center justify-between px-4 py-3 text-xs font-medium text-muted-foreground hover:bg-accent/50 transition-colors"
          >
            Regex Cheat Sheet
            <ChevronDown className={cn("w-4 h-4 transition-transform", cheatOpen && "rotate-180")} />
          </button>
          {cheatOpen && (
            <div className="px-4 pb-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {CHEAT_SHEET.map((section) => (
                <div key={section.title}>
                  <p className="text-xs font-medium text-foreground mb-1.5">{section.title}</p>
                  <div className="space-y-0.5">
                    {section.items.map((item) => (
                      <p key={item} className="text-[11px] text-muted-foreground font-mono">{item}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
