import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'primary';
  className?: string;
}

const variantStyles = {
  default: {
    container: 'bg-card border-border',
    icon: 'bg-secondary text-muted-foreground',
    trend: 'text-muted-foreground'
  },
  success: {
    container: 'bg-card border-border',
    icon: 'bg-success-muted text-success',
    trend: 'text-success'
  },
  warning: {
    container: 'bg-card border-border',
    icon: 'bg-warning-muted text-warning',
    trend: 'text-warning'
  },
  danger: {
    container: 'bg-card border-border',
    icon: 'bg-danger-muted text-danger',
    trend: 'text-danger'
  },
  primary: {
    container: 'bg-card border-primary/40 ring-1 ring-primary/20',
    icon: 'bg-primary/15 text-primary',
    trend: 'text-primary/70'
  }
};

export function KPICard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  variant = 'default',
  className 
}: KPICardProps) {
  const styles = variantStyles[variant];
  
  return (
    <div 
      className={cn(
        "rounded-lg border p-5",
        styles.container,
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground">
            {title}
          </p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-1.5 pt-1 text-xs">
              <span className={cn("font-medium", trend.value >= 0 ? 'text-success' : 'text-destructive')}>
                {trend.value >= 0 ? '+' : ''}{trend.value}%
              </span>
              <span className="text-muted-foreground">
                {trend.label}
              </span>
            </div>
          )}
        </div>
        <div className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          styles.icon
        )}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
