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
    <aside className="w-52 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col h-full overflow-y-auto">
      <div className="px-4 py-3 border-b border-sidebar-border">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Format</p>
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
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <span className="block font-medium leading-tight">{workflow.label}</span>
              <span
                className={`block text-xs mt-0.5 leading-snug ${
                  isSelected ? "text-primary-foreground/65" : "text-muted-foreground group-hover:text-sidebar-foreground/50"
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
