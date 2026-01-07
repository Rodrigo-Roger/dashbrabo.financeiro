import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showValue?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variantStyles = {
  default: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger'
};

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4'
};

export function ProgressBar({
  value,
  max,
  label,
  showValue = true,
  variant = 'default',
  size = 'md',
  className
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  // Automatically determine variant based on percentage if not specified
  const autoVariant = percentage >= 100 ? 'success' : percentage >= 70 ? 'default' : percentage >= 40 ? 'warning' : 'danger';
  const finalVariant = variant === 'default' ? autoVariant : variant;
  
  return (
    <div className={cn("space-y-2", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="font-medium text-foreground">{label}</span>}
          {showValue && (
            <span className="font-semibold text-muted-foreground">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className={cn("w-full overflow-hidden rounded-full bg-secondary", sizeStyles[size])}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            variantStyles[finalVariant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
