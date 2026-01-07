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
    className: 'bg-success-muted text-success border-success/20'
  },
  at_risk: {
    label: 'Em Risco',
    icon: AlertTriangle,
    className: 'bg-danger-muted text-danger border-danger/20'
  },
  eligible_promotion: {
    label: 'Elegível Promoção',
    icon: TrendingUp,
    className: 'bg-info-muted text-info border-info/20'
  }
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium",
      config.className,
      className
    )}>
      <Icon className="h-4 w-4" />
      <span>{config.label}</span>
    </div>
  );
}
