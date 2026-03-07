"use client";

import WorkflowSidebar from "@/components/WorkflowSidebar";
import AestheticSelector from "@/components/AestheticSelector";
import GeneratorForm from "@/components/GeneratorForm";
import ImageViewer from "@/components/ImageViewer";
import GenerationHistory from "@/components/GenerationHistory";
import { useArtStudioStore } from "@/lib/store";
import { WORKFLOWS } from "@/lib/workflows";
import type { HistoryEntry } from "@/lib/store";

export default function StudioPage() {
  const {
    formValues,
    aestheticPrefix,
    setIsGenerating,
    setGenerationResult,
    setError,
    addToHistory,
    isGenerating,
    selectedWorkflowId,
  } = useArtStudioStore();

  const selectedWorkflow = WORKFLOWS.find((w) => w.id === selectedWorkflowId);

  async function handleGenerate() {
    setIsGenerating(true);
    setError(null);
    setGenerationResult(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: formValues.model,
          prompt: formValues.prompt,
          aestheticPrefix: aestheticPrefix || undefined,
          size: formValues.size,
          aspectRatio: formValues.aspectRatio,
          thinking: formValues.model === "nano-banana-2" ? formValues.thinking : undefined,
          grounded: formValues.model === "nano-banana-2" ? formValues.grounded : undefined,
          transparent: formValues.transparent || undefined,
          referenceImageDataUrl: formValues.referenceImageDataUrl || undefined,
          variations: formValues.variations,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Generation failed");
        return;
      }

      const results = data.results as Array<{
        imageUrl: string;
        groundingSources?: { title: string; uri: string }[];
        textResponse?: string;
      }>;

      setGenerationResult({
        imageUrls: results.map((r) => r.imageUrl),
        groundingSources: results[0]?.groundingSources,
        textResponse: results[0]?.textResponse,
        finalPrompt: data.finalPrompt,
      });

      const historyEntry: HistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        timestamp: Date.now(),
        imageUrl: results[0].imageUrl,
        prompt: formValues.prompt,
        model: formValues.model,
        size: formValues.size,
        aspectRatio: formValues.aspectRatio,
      };
      addToHistory(historyEntry);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error — is the dev server running?");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="flex h-full overflow-hidden">
      <WorkflowSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="px-6 py-3 border-b border-cream-dark bg-cream/80 backdrop-blur flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-charcoal tracking-tight">
              Asset Studio
            </h1>
            {selectedWorkflow && (
              <>
                <span className="text-charcoal-soft/40 text-xs">&middot;</span>
                <span className="text-sm text-sage font-medium">{selectedWorkflow.label}</span>
              </>
            )}
          </div>
          <div className="text-xs text-charcoal-soft">
            {isGenerating ? (
              <span className="inline-flex items-center gap-1.5 text-sage">
                <span className="inline-block w-2 h-2 bg-sage rounded-full animate-pulse" />
                Working on it...
              </span>
            ) : null}
          </div>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-5 space-y-6">
            <AestheticSelector />
            <hr className="border-cream-dark" />
            <GeneratorForm onGenerate={handleGenerate} />
            <ImageViewer />
            <GenerationHistory />
          </div>
        </div>
      </div>
    </div>
  );
}
