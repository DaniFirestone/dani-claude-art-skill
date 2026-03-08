"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  TOOLS,
  TOOL_CATEGORIES,
  getToolsByCategory,
} from "@/lib/tools/registry";
import type { ToolCategory } from "@/lib/tools/types";

const CATEGORIES: ToolCategory[] = ["content", "design", "utility"];

export default function ToolkitPage() {
  const [search, setSearch] = useState("");

  const query = search.toLowerCase().trim();
  const filtered = query
    ? TOOLS.filter(
        (t) =>
          t.label.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query)
      )
    : null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-headline font-bold tracking-tight mb-1">
        Toolkit
      </h1>
      <p className="text-muted-foreground text-sm mb-8">
        Image tools, color utilities, typography converters, and more
      </p>

      {/* Search */}
      <div className="relative mb-10">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tools..."
          className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-colors"
        />
      </div>

      {/* Search results */}
      {filtered ? (
        <div>
          <p className="text-xs font-headline font-bold uppercase tracking-widest text-muted-foreground mb-4">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </p>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No tools match &ldquo;{search}&rdquo;
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Category sections */
        CATEGORIES.map((cat) => {
          const tools = getToolsByCategory(cat);
          const meta = TOOL_CATEGORIES[cat];
          return (
            <section key={cat} className="mb-12">
              <h2 className="text-xs font-headline font-bold uppercase tracking-widest text-muted-foreground mb-1">
                {meta.label}
              </h2>
              <p className="text-xs text-muted-foreground/60 mb-4">
                {meta.description}
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}

function ToolCard({ tool }: { tool: (typeof TOOLS)[number] }) {
  const Icon = tool.icon;
  return (
    <Link
      href={`/toolkit/${tool.id}`}
      className={cn(
        "bg-card rounded-2xl border border-border p-5 transition-all hover:shadow-md hover:border-primary/30 group"
      )}
    >
      <Icon className="w-5 h-5 text-primary mb-2" />
      <h3 className="font-headline font-semibold text-sm">{tool.label}</h3>
      <p className="text-xs text-muted-foreground mt-0.5">{tool.description}</p>
    </Link>
  );
}
