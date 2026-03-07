"use client";

import { useRef, useState, useEffect } from "react";
import { useArtStudioStore } from "@/lib/store";
import { WORKFLOWS } from "@/lib/workflows";
import type { AspectRatio, GeminiSize } from "@/lib/gemini";
import GenerationSummary from "./GenerationSummary";

const NB2_ASPECT_RATIOS: AspectRatio[] = [
  "1:1", "1:4", "1:8", "2:3", "3:2", "3:4", "4:1", "4:3", "4:5", "5:4", "8:1", "9:16", "16:9", "21:9",
];
const PRO_ASPECT_RATIOS: AspectRatio[] = [
  "1:1", "2:3", "3:2", "4:3", "9:16", "16:9", "21:9",
];

const RATIO_LABELS: Record<string, string> = {
  "16:9": "16:9 — Widescreen",
  "1:1":  "1:1 — Square",
  "4:3":  "4:3 — Landscape",
  "9:16": "9:16 — Stories / Vertical",
  "21:9": "21:9 — Ultra-wide",
  "4:5":  "4:5 — Instagram feed",
  "2:3":  "2:3 — Portrait",
  "3:2":  "3:2 — Photo",
  "3:4":  "3:4 — Portrait",
  "5:4":  "5:4 — Standard",
  "1:4":  "1:4 — Tall strip",
  "4:1":  "4:1 — Wide banner",
  "1:8":  "1:8 — Extreme tall",
  "8:1":  "8:1 — Extreme wide",
};

const SIZE_LABELS: Record<GeminiSize, string> = {
  "512px": "Draft — quick peek",
  "1K":    "Preview",
  "2K":    "Web-ready",
  "4K":    "High-res",
};

const NB2_SIZES: GeminiSize[] = ["512px", "1K", "2K", "4K"];
const PRO_SIZES: GeminiSize[] = ["1K", "2K", "4K"];

export default function GeneratorForm({ onGenerate }: { onGenerate: () => void }) {
  const {
    formValues,
    setFormValues,
    selectedWorkflowId,
    selectedWorkflowType,
    setSelectedWorkflowType,
    aestheticPrefix,
    isGenerating,
    error,
  } = useArtStudioStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isGenerating) {
      setElapsedSeconds(0);
      intervalRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isGenerating]);

  const isNB2 = formValues.model === "nano-banana-2";
  const aspectRatios = isNB2 ? NB2_ASPECT_RATIOS : PRO_ASPECT_RATIOS;
  const sizes = isNB2 ? NB2_SIZES : PRO_SIZES;

  useEffect(() => {
    if (!isNB2) {
      if (!PRO_ASPECT_RATIOS.includes(formValues.aspectRatio)) setFormValues({ aspectRatio: "16:9" });
      if (!PRO_SIZES.includes(formValues.size)) setFormValues({ size: "2K" });
    }
  }, [formValues.model]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedWorkflow = WORKFLOWS.find((w) => w.id === selectedWorkflowId);
  const placeholder = selectedWorkflow?.placeholderPrompt ?? "Describe what you want to make — the more specific, the better";
  const buttonLabel = selectedWorkflow?.buttonLabel ?? "Create image";

  // When workflow changes, reset type selection
  useEffect(() => {
    setSelectedWorkflowType(null);
    // Auto-set aspect ratio from workflow default
    if (selectedWorkflow) {
      setFormValues({ aspectRatio: selectedWorkflow.defaultAspectRatio as AspectRatio });
    }
  }, [selectedWorkflowId]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleTypeSelect(typeLabel: string, typeAspectRatio: string) {
    if (selectedWorkflowType === typeLabel) {
      // Deselect — revert to workflow default
      setSelectedWorkflowType(null);
      if (selectedWorkflow) setFormValues({ aspectRatio: selectedWorkflow.defaultAspectRatio as AspectRatio });
    } else {
      setSelectedWorkflowType(typeLabel);
      setFormValues({ aspectRatio: typeAspectRatio as AspectRatio });
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormValues({
        referenceImageDataUrl: ev.target?.result as string,
        referenceImageName: file.name,
      });
    };
    reader.readAsDataURL(file);
  }

  function clearReferenceImage() {
    setFormValues({ referenceImageDataUrl: null, referenceImageName: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const canGenerate = formValues.prompt.trim().length > 0 && !isGenerating;

  // Image-first workflows: reference image should be prominent, not in Advanced
  const isImageFirst = selectedWorkflow?.requiresImage === true;
  const hasAdvancedActive = formValues.grounded || formValues.thinking === "high" || (!isImageFirst && !!formValues.referenceImageName);

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (canGenerate) onGenerate(); }}
      className="space-y-4"
    >
      {/* Sub-type selector — shown only when the selected workflow has typeOptions */}
      {selectedWorkflow?.typeOptions && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-charcoal-soft mb-2">Type</p>
          <div className="flex flex-wrap gap-1.5">
            {selectedWorkflow.typeOptions.map((opt) => {
              const isActive = selectedWorkflowType === opt.label;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => handleTypeSelect(opt.label, opt.aspectRatio)}
                  disabled={isGenerating}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border disabled:opacity-50 ${
                    isActive
                      ? "bg-sage text-white border-sage"
                      : "bg-white text-charcoal border-cream-dark hover:border-sage/40 hover:text-sage"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Prompt */}
      <div>
        <label className="block text-sm font-medium text-charcoal mb-1.5">
          Describe your idea
        </label>
        <textarea
          rows={4}
          value={formValues.prompt}
          onChange={(e) => setFormValues({ prompt: e.target.value })}
          placeholder={placeholder}
          disabled={isGenerating}
          className="w-full text-sm border border-cream-dark rounded-lg px-3 py-2.5 bg-white text-charcoal placeholder:text-charcoal-soft/50 focus:outline-none focus:ring-2 focus:ring-sage/40 resize-none disabled:opacity-50 leading-relaxed"
        />
        {aestheticPrefix && (
          <p className="text-xs text-sage/70 mt-1 flex items-center gap-1">
            <span>✦</span> Visual style will be applied automatically
          </p>
        )}
      </div>

      {/* Contextual hint for this workflow */}
      {selectedWorkflow?.contextualHint && (
        <div className="flex gap-2 text-xs text-charcoal-soft bg-cream rounded-lg px-3 py-2 border border-cream-dark">
          <span className="text-sage shrink-0 mt-px">↳</span>
          <span>{selectedWorkflow.contextualHint}</span>
        </div>
      )}

      {/* Image-first upload — shown prominently for annotated screenshots and image editing */}
      {isImageFirst && (
        <div className={`rounded-lg border-2 p-3 ${formValues.referenceImageName ? "border-sage/40 bg-sage/5" : "border-dashed border-cream-dark bg-cream"}`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-charcoal-soft mb-2">
            Source image {formValues.referenceImageName ? "✓" : "— required"}
          </p>
          {formValues.referenceImageName ? (
            <div className="flex items-center gap-2 text-sm text-charcoal">
              <span className="truncate">📎 {formValues.referenceImageName}</span>
              <button
                type="button"
                onClick={clearReferenceImage}
                className="text-xs text-charcoal-soft hover:text-red-500 shrink-0 transition-colors ml-auto"
              >
                Clear
              </button>
            </div>
          ) : (
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              disabled={isGenerating}
              className="text-sm text-charcoal file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-white file:text-charcoal hover:file:bg-cream-dark disabled:opacity-50 cursor-pointer"
            />
          )}
        </div>
      )}

      {/* Quality + Resolution + Shape */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-charcoal-soft mb-1 uppercase tracking-wide">Quality</label>
          <select
            value={formValues.model}
            onChange={(e) => setFormValues({ model: e.target.value as typeof formValues.model })}
            disabled={isGenerating}
            className="w-full text-sm border border-cream-dark rounded-lg px-2 py-1.5 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-sage/40 disabled:opacity-50"
          >
            <option value="nano-banana-2">Fast · great quality</option>
            <option value="nano-banana-pro">Best quality · slower</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-charcoal-soft mb-1 uppercase tracking-wide">Resolution</label>
          <select
            value={formValues.size}
            onChange={(e) => setFormValues({ size: e.target.value as GeminiSize })}
            disabled={isGenerating}
            className="w-full text-sm border border-cream-dark rounded-lg px-2 py-1.5 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-sage/40 disabled:opacity-50"
          >
            {sizes.map((s) => (
              <option key={s} value={s}>{SIZE_LABELS[s]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-charcoal-soft mb-1 uppercase tracking-wide">Shape</label>
          <select
            value={formValues.aspectRatio}
            onChange={(e) => setFormValues({ aspectRatio: e.target.value as AspectRatio })}
            disabled={isGenerating}
            className="w-full text-sm border border-cream-dark rounded-lg px-2 py-1.5 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-sage/40 disabled:opacity-50"
          >
            {aspectRatios.map((r) => (
              <option key={r} value={r}>{RATIO_LABELS[r] ?? r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Versions + No background */}
      <div className="flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm text-charcoal shrink-0">Versions</label>
          <select
            value={formValues.variations}
            onChange={(e) => setFormValues({ variations: Number(e.target.value) })}
            disabled={isGenerating}
            className="text-sm border border-cream-dark rounded-lg px-2 py-1 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-sage/40 disabled:opacity-50"
          >
            <option value={1}>1</option>
            <option value={2}>2 — compare</option>
            <option value={3}>3 — explore</option>
            <option value={4}>4 — max</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-charcoal cursor-pointer select-none">
          <input
            type="checkbox"
            checked={formValues.transparent}
            onChange={(e) => setFormValues({ transparent: e.target.checked })}
            disabled={isGenerating}
            className="accent-sage"
          />
          No background (PNG)
        </label>
      </div>

      {/* Advanced options */}
      <div>
        <button
          type="button"
          onClick={() => setAdvancedOpen((o) => !o)}
          className="text-xs text-charcoal-soft hover:text-charcoal flex items-center gap-1.5 transition-colors"
        >
          <span style={{ display: "inline-block", transform: advancedOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 150ms" }}>
            ▶
          </span>
          Advanced options
          {hasAdvancedActive && <span className="text-sage ml-1">·</span>}
        </button>

        {advancedOpen && (
          <div className="mt-3 space-y-3 pl-4 border-l-2 border-cream-dark">
            {/* Reference image — only in Advanced for non-image-first workflows */}
            {!isImageFirst && (
              <div>
                <label className="block text-xs font-medium text-charcoal-soft mb-1 uppercase tracking-wide">
                  Start from an image
                </label>
                {formValues.referenceImageName ? (
                  <div className="flex items-center gap-2 text-sm text-charcoal">
                    <span className="truncate max-w-xs">📎 {formValues.referenceImageName}</span>
                    <button
                      type="button"
                      onClick={clearReferenceImage}
                      className="text-xs text-charcoal-soft hover:text-red-500 shrink-0 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFileChange}
                    disabled={isGenerating}
                    className="text-sm text-charcoal file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-cream file:text-charcoal hover:file:bg-cream-dark disabled:opacity-50 cursor-pointer"
                  />
                )}
              </div>
            )}

            {isNB2 && (
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-charcoal-soft mb-1 uppercase tracking-wide">
                    Reasoning depth
                  </label>
                  <select
                    value={formValues.thinking}
                    onChange={(e) => setFormValues({ thinking: e.target.value as typeof formValues.thinking })}
                    disabled={isGenerating}
                    className="text-sm border border-cream-dark rounded-lg px-2 py-1.5 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-sage/40 disabled:opacity-50"
                  >
                    <option value="minimal">Standard</option>
                    <option value="high">Deep — for complex compositions</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm text-charcoal cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formValues.grounded}
                    onChange={(e) => setFormValues({ grounded: e.target.checked })}
                    disabled={isGenerating}
                    className="accent-sage"
                  />
                  Draw from current web knowledge
                </label>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cost estimate + prompt preview */}
      {formValues.prompt.trim() && (
        <GenerationSummary
          model={formValues.model}
          variations={formValues.variations}
          prompt={formValues.prompt}
          aestheticPrefix={aestheticPrefix}
        />
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700 leading-snug">
          {error}
        </div>
      )}

      {/* Generate button */}
      <button
        type="submit"
        disabled={!canGenerate}
        className="w-full py-3 rounded-lg bg-sage text-white font-semibold text-sm hover:bg-sage-hover active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {selectedWorkflow ? `Creating ${selectedWorkflow.label.toLowerCase()}…` : "Creating…"} {elapsedSeconds}s
          </>
        ) : (
          buttonLabel
        )}
      </button>
    </form>
  );
}
