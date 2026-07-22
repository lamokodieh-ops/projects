import { AppNav } from "@/components/app-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <AppNav />
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 md:py-16">{children}</main>
    </div>
  );
}
