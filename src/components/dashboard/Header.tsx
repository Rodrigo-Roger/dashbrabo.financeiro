import { cn } from "@/lib/utils";
import { Bell, Settings, Menu, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface HeaderProps {
  onMenuClick?: () => void;
  userEmail?: string;
  className?: string;
}

export function Header({ onMenuClick, userEmail, className }: HeaderProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao sair");
    } else {
      navigate("/auth", { replace: true });
    }
  };

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
            <span className="text-xs font-semibold text-primary-foreground">DB</span>
          </div>
          <Separator orientation="vertical" className="h-5 hidden sm:block" />
          <span className="hidden text-sm font-medium text-foreground sm:block">DashBrabo</span>
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
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-2 px-2 text-muted-foreground hover:text-foreground">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary">
                <User className="h-3 w-3" />
              </div>
              <span className="hidden text-sm md:inline max-w-[120px] truncate">
                {userEmail || "Usuário"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
