"use client";

import Link from "next/link";
import { Megaphone, Paintbrush, Palette, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { useMarketingStore } from "@/lib/store";

const ACTIONS = [
  { href: "/campaign/new", label: "New Campaign", desc: "Multi-platform content + images", icon: Megaphone, primary: true },
  { href: "/studio", label: "Studio", desc: "Individual images with 16 workflows", icon: Paintbrush, primary: false },
  { href: "/brands", label: "Brands", desc: "Visual aesthetics and style guides", icon: Palette, primary: false },
];

export default function DashboardPage() {
  const { campaigns } = useMarketingStore();
  const recent = campaigns.slice(0, 6);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-headline font-bold tracking-tight mb-1">Marketing Engine</h1>
      <p className="text-muted-foreground text-sm mb-10">Create campaigns, generate assets, manage brands</p>

      <div className="grid sm:grid-cols-3 gap-4 mb-12">
        {ACTIONS.map(({ href, label, desc, icon: Icon, primary }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "rounded-2xl border p-5 transition-all hover:shadow-md",
              primary ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90" : "bg-card border-border hover:border-primary/30"
            )}
          >
            <Icon className={cn("w-5 h-5 mb-2", primary ? "text-primary-foreground/80" : "text-primary")} />
            <h3 className="font-headline font-semibold text-sm">{label}</h3>
            <p className={cn("text-xs mt-0.5", primary ? "text-primary-foreground/60" : "text-muted-foreground")}>{desc}</p>
          </Link>
        ))}
      </div>

      <h2 className="text-xs font-headline font-bold uppercase tracking-widest text-muted-foreground mb-4">Recent Campaigns</h2>

      {recent.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-2xl py-16 text-center">
          <Sparkles className="w-8 h-8 text-primary/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-3">No campaigns yet</p>
          <Link href="/campaign/new" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Megaphone className="w-4 h-4" />
            Create one
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recent.map((c) => (
            <div key={c.id} className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
              <h3 className="font-headline font-semibold text-sm truncate">{c.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 truncate">{c.idea}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">{c.tone}</span>
                <span className="text-[10px] text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
