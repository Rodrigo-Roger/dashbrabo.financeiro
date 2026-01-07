import { cn } from "@/lib/utils";
import { Bell, Settings, Menu, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface HeaderProps {
  onMenuClick?: () => void;
  className?: string;
}

export function Header({ onMenuClick, className }: HeaderProps) {
  return (
    <header className={cn(
      "sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-card px-5",
      className
    )}>
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden h-8 w-8"
        >
          <Menu className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-primary">
            <span className="text-xs font-semibold text-primary-foreground">FH</span>
          </div>
          <Separator orientation="vertical" className="h-5 hidden sm:block" />
          <span className="hidden text-sm font-medium text-foreground sm:block">FinanceHub</span>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" className="relative h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
          <Settings className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="h-5 mx-2" />
        <Button variant="ghost" size="sm" className="h-8 gap-2 px-2 text-muted-foreground hover:text-foreground">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary">
            <User className="h-3 w-3" />
          </div>
          <span className="hidden text-sm md:inline">Admin</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </div>
    </header>
  );
}
