import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  Award,
  Settings,
  HelpCircle,
  X,
  CheckCircle2,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logoMontseguro from "@/assets/logo-montseguro.png";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  activeView: string;
  onViewChange: (view: string) => void;
  className?: string;
}

const menuItems = [
  { id: "financial", label: "Dashboard", icon: DollarSign },
  { id: "individual", label: "Individual", icon: LayoutDashboard },
  { id: "implanted", label: "Implantados", icon: CheckCircle2 },
];

const secondaryItems = [
  { id: "simulator", label: "Cargos e Metas", icon: TrendingUp },
  { id: "promotions", label: "Promoções", icon: Award },
  { id: "discount", label: "Descontos", icon: TrendingDown },
];

export function Sidebar({
  isOpen = true,
  onClose,
  activeView,
  onViewChange,
  className,
}: SidebarProps) {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-52 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 md:relative md:translate-x-0 md:h-screen md:sticky md:top-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        {/* Mobile close button */}
        <div className="flex h-14 items-center justify-end px-4 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Desktop header */}
        <div className="hidden h-14 items-center justify-center px-4 md:flex">
          <img
            src={logoMontseguro}
            alt="Montseguro"
            className="h-8 w-auto brightness-0 invert"
          />
        </div>

        <nav className="flex-1 px-2 py-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  onClose?.();
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded px-3 py-2 text-[13px] font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="my-3 mx-3 h-px bg-sidebar-border" />

          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
            Ferramentas
          </p>

          {secondaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  onClose?.();
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded px-3 py-2 text-[13px] font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-2">
          <button className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-[13px] font-medium text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground">
            <HelpCircle className="h-4 w-4" />
            <span>Ajuda</span>
          </button>
          <button className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-[13px] font-medium text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground">
            <Settings className="h-4 w-4" />
            <span>Configurações</span>
          </button>
        </div>
      </aside>
    </>
  );
}
