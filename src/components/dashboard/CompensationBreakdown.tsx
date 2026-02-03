import { cn } from "@/lib/utils";
import { Compensation, formatCurrency } from "@/lib/data";
import { useState, useEffect } from "react";
import { fetchDiscounts } from "@/lib/api";

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

        const filterStart = dateFilter?.startDate
          ? new Date(dateFilter.startDate)
          : null;
        const filterEnd = dateFilter?.endDate
          ? new Date(dateFilter.endDate)
          : null;

        let periodTotal = 0;

        discounts.forEach((discount) => {
          if (!discount.created_at) return;

          const createdDate = new Date(discount.created_at);
          const installmentsCount = discount.installments_count || 1;
          const totalAmount = Number(discount.total_discount || 0);
          const installmentValue = totalAmount / installmentsCount;

          // Calcular quais parcelas caem no período
          for (let i = 0; i < installmentsCount; i++) {
            const installmentDate = new Date(createdDate);
            installmentDate.setMonth(installmentDate.getMonth() + i);

            // Se não há filtro, incluir todas as parcelas
            if (!filterStart || !filterEnd) {
              periodTotal += installmentValue;
            } else {
              const installmentMonth = new Date(
                installmentDate.getFullYear(),
                installmentDate.getMonth(),
                1,
              );
              const installmentMonthEnd = new Date(
                installmentDate.getFullYear(),
                installmentDate.getMonth() + 1,
                0,
              );

              // Verificar se há sobreposição entre o período do filtro e o mês da parcela
              if (
                installmentMonth <= filterEnd &&
                installmentMonthEnd >= filterStart
              ) {
                periodTotal += installmentValue;
              }
            }
          }
        });

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
