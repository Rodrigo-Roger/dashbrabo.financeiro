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
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  activeView: string;
  onViewChange: (view: string) => void;
  className?: string;
}

const menuItems = [
  { id: 'individual', label: 'Visão Individual', icon: LayoutDashboard },
  { id: 'team', label: 'Visão Equipe', icon: Users },
  { id: 'unit', label: 'Visão Unidade', icon: Building2 },
  { id: 'financial', label: 'Resumo Financeiro', icon: DollarSign },
];

const secondaryItems = [
  { id: 'simulator', label: 'Simulador', icon: TrendingUp },
  { id: 'promotions', label: 'Promoções', icon: Award },
];

export function Sidebar({ isOpen = true, onClose, activeView, onViewChange, className }: SidebarProps) {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={cn(
        "fixed left-0 top-0 z-50 flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 md:relative md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}>
        {/* Mobile close button */}
        <div className="flex h-16 items-center justify-between px-4 md:hidden">
          <span className="text-lg font-bold">Menu</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Desktop header */}
        <div className="hidden h-16 items-center px-4 md:flex">
          <span className="text-sm font-medium text-sidebar-foreground/60">NAVEGAÇÃO</span>
        </div>
        
        <nav className="flex-1 space-y-1 px-3">
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
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
          
          <div className="my-4 h-px bg-sidebar-border" />
          
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50">
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
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        
        {/* Footer */}
        <div className="border-t border-sidebar-border p-3">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <HelpCircle className="h-5 w-5" />
            <span>Ajuda</span>
          </button>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <Settings className="h-5 w-5" />
            <span>Configurações</span>
          </button>
        </div>
      </aside>
    </>
  );
}
