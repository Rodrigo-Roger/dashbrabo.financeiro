import { cn } from "@/lib/utils";
import { BarChart3 } from "lucide-react";
import { formatCurrency } from "@/lib/data";

interface RevenueChartProps {
  data: { month: string; value: number }[];
  className?: string;
}

export function RevenueChart({ data, className }: RevenueChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className={cn("rounded-xl bg-card p-6 shadow-card", className)}>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
          <BarChart3 className="h-5 w-5 text-success" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Receita Mensal</h3>
          <p className="text-sm text-muted-foreground">Últimos 6 meses</p>
        </div>
      </div>
      
      <div className="flex items-end justify-between gap-2 h-48">
        {data.map((item, index) => {
          const height = (item.value / maxValue) * 100;
          
          return (
            <div key={index} className="flex flex-1 flex-col items-center gap-2">
              <div className="relative w-full flex justify-center">
                <div
                  className="w-full max-w-[40px] rounded-t-lg bg-success/80 transition-all duration-500 hover:bg-success"
                  style={{ height: `${height * 1.6}px` }}
                />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-muted-foreground">{item.month}</p>
                <p className="text-xs font-semibold text-foreground">
                  {formatCurrency(item.value).replace('R$', '')}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
