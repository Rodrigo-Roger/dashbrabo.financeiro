import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showValue?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'auto';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variantStyles = {
  default: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger'
};

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4'
};

// Get variant based on percentage thresholds: <50% red, 50-79% yellow, ≥80% green
function getAutoVariant(percentage: number): 'success' | 'warning' | 'danger' {
  if (percentage >= 80) return 'success';
  if (percentage >= 50) return 'warning';
  return 'danger';
}

export function ProgressBar({
  value,
  max,
  label,
  showValue = true,
  variant = 'auto',
  size = 'md',
  className
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  // Automatically determine variant based on percentage thresholds
  const finalVariant = variant === 'auto' || variant === 'default' ? getAutoVariant(percentage) : variant;
  
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
