"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  Paintbrush,
  Palette,
  Image as ImageIcon,
  Wrench,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/campaign/new", label: "Campaign", icon: Megaphone },
  { href: "/studio", label: "Studio", icon: Paintbrush },
  { href: "/brands", label: "Brands", icon: Palette },
  { href: "/library", label: "Library", icon: ImageIcon },
  { href: "/toolkit", label: "Toolkit", icon: Wrench },
];

export default function SideNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-16 lg:w-52 shrink-0 bg-sidebar flex flex-col h-full border-r border-sidebar-border">
      {/* Logo */}
      <div className="px-3 lg:px-4 py-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="hidden lg:block font-headline font-semibold text-sm text-sidebar-foreground tracking-tight">
            Marketing Engine
          </span>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-2 space-y-0.5 px-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent border-l-2 border-primary rounded-r-xl text-sidebar-foreground"
                  : "rounded-xl text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground/80"
              )}
            >
              <Icon className={cn("w-5 h-5 shrink-0", active && "text-primary")} />
              <span className="hidden lg:block">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
