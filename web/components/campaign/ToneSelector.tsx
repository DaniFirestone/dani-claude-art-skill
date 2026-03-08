"use client";

import { cn } from "@/lib/cn";
import type { Tone } from "@/lib/store";

const TONES: { id: Tone; label: string }[] = [
  { id: "professional", label: "Professional" },
  { id: "witty", label: "Witty" },
  { id: "urgent", label: "Urgent" },
  { id: "inspirational", label: "Inspirational" },
];

export default function ToneSelector({
  value,
  onChange,
  disabled,
}: {
  value: Tone;
  onChange: (tone: Tone) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {TONES.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          disabled={disabled}
          className={cn(
            "py-2.5 px-3 rounded-xl border text-sm font-medium transition-all disabled:opacity-50",
            value === t.id
              ? "bg-primary border-primary text-primary-foreground"
              : "bg-card border-border hover:border-primary/30"
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
