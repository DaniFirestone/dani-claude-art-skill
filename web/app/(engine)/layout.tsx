import SideNav from "@/components/SideNav";

export default function EngineLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <SideNav />
      <main className="flex-1 overflow-y-auto bg-background">{children}</main>
    </div>
  );
}
