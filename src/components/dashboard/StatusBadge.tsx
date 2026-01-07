import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
import { PerformanceStatus } from "@/lib/data";

interface StatusBadgeProps {
  status: PerformanceStatus;
  className?: string;
}

const statusConfig = {
  safe: {
    label: 'Seguro',
    icon: CheckCircle2,
    className: 'bg-success/10 text-success'
  },
  at_risk: {
    label: 'Em Risco',
    icon: AlertTriangle,
    className: 'bg-destructive/10 text-destructive'
  },
  eligible_promotion: {
    label: 'Elegível',
    icon: TrendingUp,
    className: 'bg-primary/10 text-primary'
  }
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <div className={cn(
      "inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium",
      config.className,
      className
    )}>
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </div>
  );
}
