import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/data";

interface RevenueChartProps {
  data: { month: string; value: number }[];
  className?: string;
}

export function RevenueChart({ data, className }: RevenueChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div
      className={cn("rounded-lg border border-border bg-card p-5", className)}
    >
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Histórico de Pagamento
        </h3>
        <span className="text-xs text-muted-foreground">Últimos 6 meses</span>
      </div>

      <div className="flex items-end justify-between gap-3 h-40">
        {data.map((item, index) => {
          const height = (item.value / maxValue) * 100;

          return (
            <div
              key={index}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div className="relative w-full flex justify-center">
                <div
                  className="w-full max-w-[32px] rounded-sm bg-primary/20 transition-colors hover:bg-primary/30"
                  style={{ height: `${height * 1.3}px` }}
                />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-medium text-muted-foreground">
                  {item.month}
                </p>
                <p className="text-xs font-medium text-foreground tabular-nums">
                  {formatCurrency(item.value)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
