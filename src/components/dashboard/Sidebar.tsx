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
  { id: 'individual', label: 'Individual', icon: LayoutDashboard },
  { id: 'team', label: 'Equipe', icon: Users },
  { id: 'unit', label: 'Unidade', icon: Building2 },
  { id: 'financial', label: 'Financeiro', icon: DollarSign },
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
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={cn(
        "fixed left-0 top-0 z-50 flex h-full w-56 flex-col border-r border-border bg-card transition-transform duration-200 md:relative md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}>
        {/* Mobile close button */}
        <div className="flex h-14 items-center justify-between border-b border-border px-4 md:hidden">
          <span className="text-sm font-semibold">Menu</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Desktop header */}
        <div className="hidden h-14 items-center border-b border-border px-4 md:flex">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Painel</span>
        </div>
        
        <nav className="flex-1 space-y-0.5 p-2">
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
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
          
          <div className="my-3 h-px bg-border" />
          
          <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
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
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        
        {/* Footer */}
        <div className="border-t border-border p-2">
          <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <HelpCircle className="h-4 w-4" />
            <span>Ajuda</span>
          </button>
          <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <Settings className="h-4 w-4" />
            <span>Configurações</span>
          </button>
        </div>
      </aside>
    </>
  );
}
