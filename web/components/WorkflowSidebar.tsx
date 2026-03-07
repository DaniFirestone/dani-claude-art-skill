"use client";

import { WORKFLOWS } from "@/lib/workflows";
import { useArtStudioStore } from "@/lib/store";

export default function WorkflowSidebar() {
  const { selectedWorkflowId, setSelectedWorkflowId, formValues, setFormValues } = useArtStudioStore();

  function handleSelect(id: string) {
    const workflow = WORKFLOWS.find((w) => w.id === id);
    if (!workflow) return;

    if (selectedWorkflowId === id) {
      setSelectedWorkflowId(null);
      return;
    }

    setSelectedWorkflowId(id);
    setFormValues({ aspectRatio: workflow.defaultAspectRatio as typeof formValues.aspectRatio });
  }

  return (
    <aside className="w-52 shrink-0 bg-charcoal text-cream flex flex-col h-full overflow-y-auto">
      <div className="px-4 py-3 border-b border-charcoal-light/20">
        <p className="text-xs text-charcoal-soft uppercase tracking-widest font-semibold">Format</p>
      </div>
      <nav className="flex-1 py-1.5">
        {WORKFLOWS.map((workflow) => {
          const isSelected = selectedWorkflowId === workflow.id;
          return (
            <button
              key={workflow.id}
              onClick={() => handleSelect(workflow.id)}
              title={workflow.description}
              className={`w-full text-left px-4 py-2 text-sm transition-colors group ${
                isSelected
                  ? "bg-sage text-white"
                  : "text-cream/75 hover:bg-white/5 hover:text-cream"
              }`}
            >
              <span className="block font-medium leading-tight">{workflow.label}</span>
              <span
                className={`block text-xs mt-0.5 leading-snug ${
                  isSelected ? "text-white/65" : "text-charcoal-soft group-hover:text-cream/50"
                }`}
                style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
              >
                {workflow.description}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
