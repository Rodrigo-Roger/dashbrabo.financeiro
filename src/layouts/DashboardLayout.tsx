import { useState, ReactNode } from "react";
import { Header, Sidebar } from "@/components/dashboard/layout";

interface DashboardLayoutProps {
  children: ReactNode;
  username?: string | null;
}

export function DashboardLayout({
  children,
  username = null,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col min-w-0 h-screen overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          username={username}
        />

        <main className="flex-1 overflow-auto p-4 md:p-5 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
