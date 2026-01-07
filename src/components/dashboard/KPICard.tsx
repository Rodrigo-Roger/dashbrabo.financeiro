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
    container: 'bg-card',
    icon: 'bg-secondary text-secondary-foreground',
    trend: 'text-muted-foreground'
  },
  success: {
    container: 'bg-success-muted',
    icon: 'bg-success text-success-foreground',
    trend: 'text-success'
  },
  warning: {
    container: 'bg-warning-muted',
    icon: 'bg-warning text-warning-foreground',
    trend: 'text-warning'
  },
  danger: {
    container: 'bg-danger-muted',
    icon: 'bg-danger text-danger-foreground',
    trend: 'text-danger'
  },
  primary: {
    container: 'bg-primary text-primary-foreground',
    icon: 'bg-primary-foreground/20 text-primary-foreground',
    trend: 'text-primary-foreground/80'
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
        "relative overflow-hidden rounded-xl p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5",
        styles.container,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={cn(
            "text-sm font-medium",
            variant === 'primary' ? 'text-primary-foreground/80' : 'text-muted-foreground'
          )}>
            {title}
          </p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className={cn(
              "text-sm",
              variant === 'primary' ? 'text-primary-foreground/60' : 'text-muted-foreground'
            )}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div className={cn("flex items-center gap-1 text-sm font-medium", styles.trend)}>
              <span className={trend.value >= 0 ? 'text-success' : 'text-danger'}>
                {trend.value >= 0 ? '+' : ''}{trend.value}%
              </span>
              <span className={variant === 'primary' ? 'text-primary-foreground/60' : 'text-muted-foreground'}>
                {trend.label}
              </span>
            </div>
          )}
        </div>
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl",
          styles.icon
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
