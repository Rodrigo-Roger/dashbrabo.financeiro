import { cn } from "@/lib/utils";
import { Compensation, formatCurrency } from "@/lib/data";
import { useState, useEffect } from "react";
import { fetchDiscounts } from "@/lib/api";
import { getDiscountTotal } from "@/lib/discounts";

interface CompensationBreakdownProps {
  compensation: Compensation;
  className?: string;
  employeeId?: string;
  dateFilter?: {
    startDate?: string;
    endDate?: string;
  };
}

export function CompensationBreakdown({
  compensation,
  className,
  employeeId,
  dateFilter,
}: CompensationBreakdownProps) {
  const [totalDiscount, setTotalDiscount] = useState(0);

  useEffect(() => {
    const fetchDiscountData = async () => {
      if (!employeeId) {
        setTotalDiscount(0);
        return;
      }

      try {
        const discounts = await fetchDiscounts(employeeId);

        const periodTotal = getDiscountTotal(discounts, dateFilter);
        setTotalDiscount(periodTotal);
      } catch (error) {
        console.error("Erro ao buscar descontos:", error);
        setTotalDiscount(0);
      }
    };

    fetchDiscountData();
  }, [employeeId, dateFilter]);

  const netTotal = compensation.total - totalDiscount;

  const items = [
    { label: "Salário Base", value: compensation.baseSalary },
    { label: "Variável", value: compensation.variablePay },
    { label: "Bônus Equipe", value: compensation.teamBonus },
    { label: "Add-on Promoção", value: compensation.promotionAddOn },
    { label: "Add-on Unidade", value: compensation.unitAddOn },
  ].filter((item) => item.value > 0);

  if (totalDiscount > 0) {
    items.push({ label: "Desconto", value: -totalDiscount });
  }

  return (
    <div
      className={cn("rounded-lg border border-border bg-card p-5", className)}
    >
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-4">
        Composição
      </h3>

      <div className="space-y-3">
        {items.map((item) => {
          const percentage = Math.abs((item.value / compensation.total) * 100);
          const isNegative = item.value < 0;

          return (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span
                  className={cn(
                    "font-medium",
                    isNegative ? "text-destructive" : "text-foreground",
                  )}
                >
                  {formatCurrency(Math.abs(item.value))}
                  {isNegative && " -"}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isNegative ? "bg-destructive/60" : "bg-primary/60",
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          Total Líquido
        </span>
        <span className="text-lg font-semibold text-foreground">
          {formatCurrency(netTotal)}
        </span>
      </div>
    </div>
  );
}
