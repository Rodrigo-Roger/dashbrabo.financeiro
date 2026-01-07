import { cn } from "@/lib/utils";
import { Compensation, formatCurrency } from "@/lib/data";

interface CompensationBreakdownProps {
  compensation: Compensation;
  className?: string;
}

export function CompensationBreakdown({ compensation, className }: CompensationBreakdownProps) {
  const items = [
    { label: 'Salário Base', value: compensation.baseSalary },
    { label: 'Variável', value: compensation.variablePay },
    { label: 'Bônus Equipe', value: compensation.teamBonus },
    { label: 'Add-on Promoção', value: compensation.promotionAddOn },
    { label: 'Add-on Unidade', value: compensation.unitAddOn },
  ].filter(item => item.value > 0);

  return (
    <div className={cn("rounded-lg border border-border bg-card p-5", className)}>
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-4">
        Composição
      </h3>
      
      <div className="space-y-3">
        {items.map((item) => {
          const percentage = (item.value / compensation.total) * 100;
          
          return (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(item.value)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary/60 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Total</span>
        <span className="text-lg font-semibold text-foreground">{formatCurrency(compensation.total)}</span>
      </div>
    </div>
  );
}
