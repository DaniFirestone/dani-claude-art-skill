"use client";

import { useState } from "react";
import { Hash, Copy, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { copyToClipboard } from "@/lib/tools/clipboard";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const md5 = require("js-md5") as (message: string) => string;

type Tab = "base64" | "url" | "hash";

const TABS: { id: Tab; label: string }[] = [
  { id: "base64", label: "Base64" },
  { id: "url", label: "URL" },
  { id: "hash", label: "Hash" },
];

export default function EncoderPage() {
  const [tab, setTab] = useState<Tab>("base64");
  const [input, setInput] = useState("");

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Hash className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-headline font-bold tracking-tight">
            Encode / Decode
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Base64, URL encoding, and hash generation
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              tab === t.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="mb-6">
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
          Input
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            tab === "hash"
              ? "Enter text to hash..."
              : "Enter text to encode or decode..."
          }
          rows={5}
          className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
          autoFocus
        />
      </div>

      {/* Output per tab */}
      {tab === "base64" && <Base64Panel input={input} />}
      {tab === "url" && <UrlPanel input={input} />}
      {tab === "hash" && <HashPanel input={input} />}
    </div>
  );
}

// --- Base64 ---

function Base64Panel({ input }: { input: string }) {
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  let output: string;
  let error: string | null = null;

  if (mode === "encode") {
    try {
      output = btoa(
        new TextEncoder()
          .encode(input)
          .reduce((acc, byte) => acc + String.fromCharCode(byte), "")
      );
    } catch {
      output = "";
      error = "Failed to encode";
    }
  } else {
    try {
      const binary = atob(input);
      output = new TextDecoder().decode(
        Uint8Array.from(binary, (c) => c.charCodeAt(0))
      );
    } catch {
      output = "";
      error = "Invalid Base64 input";
    }
  }

  return (
    <>
      <ModeToggle mode={mode} onToggle={setMode} />
      <OutputBlock value={error ?? output} isError={!!error} label={mode === "encode" ? "Base64" : "Decoded text"} />
    </>
  );
}

// --- URL ---

function UrlPanel({ input }: { input: string }) {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [encodeMode, setEncodeMode] = useState<"component" | "uri">("component");

  let output: string;
  let error: string | null = null;

  if (mode === "encode") {
    output = encodeMode === "component" ? encodeURIComponent(input) : encodeURI(input);
  } else {
    try {
      output = encodeMode === "component" ? decodeURIComponent(input) : decodeURI(input);
    } catch {
      output = "";
      error = "Invalid URL-encoded input";
    }
  }

  return (
    <>
      <ModeToggle mode={mode} onToggle={setMode} />
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setEncodeMode("component")}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors",
            encodeMode === "component"
              ? "bg-primary/10 border-primary/30 text-primary"
              : "border-border text-muted-foreground hover:text-foreground"
          )}
        >
          Encode value
        </button>
        <button
          onClick={() => setEncodeMode("uri")}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors",
            encodeMode === "uri"
              ? "bg-primary/10 border-primary/30 text-primary"
              : "border-border text-muted-foreground hover:text-foreground"
          )}
        >
          Encode full URL
        </button>
      </div>
      <OutputBlock value={error ?? output} isError={!!error} label={mode === "encode" ? "Encoded" : "Decoded"} />
    </>
  );
}

// --- Hash ---

async function sha(algorithm: string, text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest(algorithm, data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function HashPanel({ input }: { input: string }) {
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [uppercase, setUppercase] = useState(false);

  // Compute hashes reactively
  useState(() => {
    computeHashes(input);
  });

  // Recompute when input changes
  const [lastInput, setLastInput] = useState(input);
  if (input !== lastInput) {
    setLastInput(input);
    computeHashes(input);
  }

  function computeHashes(text: string) {
    if (!text) {
      setHashes({});
      return;
    }
    // MD5 (synchronous)
    const md5Hash = md5(text);
    setHashes((prev) => ({ ...prev, md5: md5Hash }));

    // SHA family (async)
    const algorithms = [
      ["SHA-1", "sha1"],
      ["SHA-256", "sha256"],
      ["SHA-384", "sha384"],
      ["SHA-512", "sha512"],
    ] as const;

    for (const [algo, key] of algorithms) {
      sha(algo, text).then((hash) => {
        setHashes((prev) => ({ ...prev, [key]: hash }));
      });
    }
  }

  const HASH_ROWS = [
    { key: "md5", label: "MD5", chars: 32 },
    { key: "sha1", label: "SHA-1", chars: 40 },
    { key: "sha256", label: "SHA-256", chars: 64 },
    { key: "sha384", label: "SHA-384", chars: 96 },
    { key: "sha512", label: "SHA-512", chars: 128 },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-muted-foreground">
          Hash digests
        </span>
        <button
          onClick={() => setUppercase((u) => !u)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {uppercase ? "UPPERCASE" : "lowercase"}
        </button>
      </div>
      <div className="space-y-3">
        {HASH_ROWS.map(({ key, label }) => {
          const val = hashes[key] || "";
          const display = uppercase ? val.toUpperCase() : val;
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground">
                  {label}
                </span>
                {display && (
                  <button
                    onClick={() => copyToClipboard(display, `${label} copied`)}
                    className="text-muted-foreground/40 hover:text-primary transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-xs font-mono break-all min-h-[2.5rem]">
                {display || (
                  <span className="text-muted-foreground/30">
                    Enter text above
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Shared sub-components ---

function ModeToggle({
  mode,
  onToggle,
}: {
  mode: "encode" | "decode";
  onToggle: (m: "encode" | "decode") => void;
}) {
  return (
    <div className="flex gap-1 mb-4">
      {(["encode", "decode"] as const).map((m) => (
        <button
          key={m}
          onClick={() => onToggle(m)}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
            mode === m
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent"
          )}
        >
          {m === "encode" ? "Encode" : "Decode"}
        </button>
      ))}
    </div>
  );
}

function OutputBlock({
  value,
  isError,
  label,
}: {
  value: string;
  isError: boolean;
  label: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {value && !isError && (
          <button
            onClick={() => copyToClipboard(value, "Copied")}
            className="text-muted-foreground/40 hover:text-primary transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <div
        className={cn(
          "w-full px-4 py-3 rounded-xl text-sm font-mono break-all min-h-[4rem]",
          isError
            ? "bg-destructive/10 border border-destructive/20 text-destructive"
            : "bg-muted/50 border border-border"
        )}
      >
        {value || (
          <span className="text-muted-foreground/30">Output will appear here</span>
        )}
      </div>
    </div>
  );
}
