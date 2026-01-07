import { cn } from "@/lib/utils";
import { Compensation, formatCurrency } from "@/lib/data";
import { Wallet, TrendingUp, Users, Award, Building2 } from "lucide-react";

interface CompensationBreakdownProps {
  compensation: Compensation;
  className?: string;
}

export function CompensationBreakdown({ compensation, className }: CompensationBreakdownProps) {
  const items = [
    { 
      label: 'Salário Base', 
      value: compensation.baseSalary, 
      icon: Wallet,
      color: 'bg-primary/10 text-primary'
    },
    { 
      label: 'Variável', 
      value: compensation.variablePay, 
      icon: TrendingUp,
      color: 'bg-success/10 text-success'
    },
    { 
      label: 'Bônus Equipe', 
      value: compensation.teamBonus, 
      icon: Users,
      color: 'bg-info/10 text-info'
    },
    { 
      label: 'Add-on Promoção', 
      value: compensation.promotionAddOn, 
      icon: Award,
      color: 'bg-warning/10 text-warning'
    },
    { 
      label: 'Add-on Unidade', 
      value: compensation.unitAddOn, 
      icon: Building2,
      color: 'bg-accent/10 text-accent'
    },
  ].filter(item => item.value > 0);

  return (
    <div className={cn("rounded-xl bg-card p-6 shadow-card", className)}>
      <h3 className="mb-6 text-lg font-semibold text-foreground">
        Composição da Remuneração
      </h3>
      
      <div className="space-y-4">
        {items.map((item) => {
          const Icon = item.icon;
          const percentage = (item.value / compensation.total) * 100;
          
          return (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", item.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-foreground">{item.label}</span>
                </div>
                <span className="font-semibold text-foreground">
                  {formatCurrency(item.value)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", item.color.replace('/10', ''))}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 flex items-center justify-between rounded-lg bg-primary p-4 text-primary-foreground">
        <span className="font-semibold">Total</span>
        <span className="text-2xl font-bold">{formatCurrency(compensation.total)}</span>
      </div>
    </div>
  );
}
