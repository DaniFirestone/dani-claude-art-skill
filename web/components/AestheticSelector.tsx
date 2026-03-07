"use client";

import { useEffect, useState } from "react";
import type { Aesthetic } from "@/lib/aesthetics";
import { useArtStudioStore } from "@/lib/store";

export default function AestheticSelector() {
  const { selectedAestheticId, setSelectedAestheticId, setAestheticPrefix } = useArtStudioStore();
  const [aesthetics, setAesthetics] = useState<Aesthetic[]>([]);
  const [styleOpen, setStyleOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/aesthetics")
      .then((r) => r.json())
      .then((data: Aesthetic[]) => {
        setAesthetics(data);
        const initial = data.find((a) => a.id === selectedAestheticId) ?? data[0];
        if (initial) {
          setSelectedAestheticId(initial.id);
          setAestheticPrefix(initial.prefix);
        }
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedAesthetic = aesthetics.find((a) => a.id === selectedAestheticId);

  function handleChange(id: string) {
    const aesthetic = aesthetics.find((a) => a.id === id);
    if (!aesthetic) return;
    setSelectedAestheticId(id);
    setAestheticPrefix(aesthetic.prefix);
  }

  if (loading) {
    return <div className="text-sm text-charcoal-soft animate-pulse">Loading styles…</div>;
  }

  if (aesthetics.length === 0) {
    return <div className="text-sm text-red-600">No style files found in skills/art/</div>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <label className="text-xs font-semibold uppercase tracking-wide text-charcoal-soft shrink-0">
          Visual style
        </label>
        <select
          value={selectedAestheticId}
          onChange={(e) => handleChange(e.target.value)}
          className="flex-1 text-sm border border-cream-dark rounded-lg px-2 py-1.5 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-sage/40"
        >
          {aesthetics.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        {selectedAesthetic?.description && (
          <span className="text-xs text-charcoal-soft italic truncate max-w-48">
            &ldquo;{selectedAesthetic.description}&rdquo;
          </span>
        )}
      </div>

      {selectedAesthetic?.prefix && (
        <div>
          <button
            type="button"
            onClick={() => setStyleOpen((o) => !o)}
            className="text-xs text-charcoal-soft hover:text-sage flex items-center gap-1 transition-colors"
          >
            <span>{styleOpen ? "▾" : "▸"}</span>
            <span>Style description {styleOpen ? "— will guide the visual look" : "(preview)"}</span>
          </button>
          {styleOpen && (
            <pre className="mt-1.5 text-xs text-charcoal-light bg-cream rounded-lg p-3 overflow-x-auto leading-relaxed whitespace-pre-wrap border border-cream-dark">
              {selectedAesthetic.prefix}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
