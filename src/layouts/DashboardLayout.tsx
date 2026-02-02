import { useState, ReactNode } from "react";
import { Header } from "@/components/dashboard/Header";
import { Sidebar } from "@/components/dashboard/Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
  userEmail?: string | null;
}

export function DashboardLayout({
  children,
  userEmail = null,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col min-w-0 h-screen overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          userEmail={userEmail}
        />

        <main className="flex-1 overflow-auto p-4 md:p-5 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
