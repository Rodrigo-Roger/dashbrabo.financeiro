import { useState, useEffect } from "react";
import { fetchDiscounts, type Discount } from "@/lib/api";
import { DollarSign, Package } from "lucide-react";
import { formatCurrency } from "@/lib/data";

interface DiscountInstallmentsProps {
  employeeId?: string;
  dateFilter?: {
    startDate?: string;
    endDate?: string;
  };
}

export function DiscountInstallments({
  employeeId,
  dateFilter,
}: DiscountInstallmentsProps) {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!employeeId) {
        setDiscounts([]);
        return;
      }

      setLoading(true);
      try {
        const allDiscounts = await fetchDiscounts(employeeId);
        setDiscounts(allDiscounts);
      } catch (error) {
        console.error("Erro ao buscar descontos:", error);
        setDiscounts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [employeeId, dateFilter]);

  // Calcular qual parcela de cada desconto cai no período selecionado
  const getInstallmentForPeriod = (
    discount: Discount,
    startDate?: string,
    endDate?: string,
  ) => {
    if (!startDate || !endDate || !discount.created_at) {
      return null;
    }

    const createdDate = new Date(discount.created_at);
    const filterStart = new Date(startDate);
    const filterEnd = new Date(endDate);
    const installmentsCount = discount.installments_count || 1;

    // Calcular qual mês a parcela cai
    for (let i = 0; i < installmentsCount; i++) {
      const installmentDate = new Date(createdDate);
      installmentDate.setMonth(installmentDate.getMonth() + i);

      // Verificar se o mês da parcela está dentro do período selecionado
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

      if (installmentMonth >= filterStart && installmentMonthEnd <= filterEnd) {
        const totalAmount = Number(discount.total_discount || 0);
        const installmentValue = totalAmount / installmentsCount;
        return {
          currentInstallment: i + 1,
          totalInstallments: installmentsCount,
          value: installmentValue,
          totalValue: totalAmount,
        };
      }
    }

    return null;
  };

  if (!employeeId) {
    return null;
  }

  if (loading) {
    return (
      <div className="rounded-xl bg-card p-6 border shadow-sm">
        <p className="text-center text-muted-foreground">
          Carregando parcelas...
        </p>
      </div>
    );
  }

  if (discounts.length === 0) {
    return (
      <div className="rounded-xl bg-card p-6 border shadow-sm text-center">
        <DollarSign className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground">Nenhum desconto encontrado</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card p-6 border shadow-sm space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <DollarSign className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            Parcelas de Descontos
          </h3>
          <p className="text-sm text-muted-foreground">
            {dateFilter?.startDate && dateFilter?.endDate
              ? "Do período selecionado"
              : "Todos os períodos"}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {discounts
          .map((discount) => {
            const installment = getInstallmentForPeriod(
              discount,
              dateFilter?.startDate,
              dateFilter?.endDate,
            );
            return { discount, installment };
          })
          .filter(({ installment }) => installment !== null)
          .map(({ discount, installment }) => (
            <div
              key={discount.id}
              className="flex items-center justify-between gap-4 p-4 rounded-lg border border-border bg-background/50 hover:bg-background/70 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                {discount.discount_type_code === "MONSTER" ? (
                  <Package className="h-5 w-5 text-green-500 flex-shrink-0" />
                ) : (
                  <DollarSign className="h-5 w-5 text-blue-500 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {discount.discount_type_name}
                  </p>
                  {discount.notes && (
                    <p className="text-xs text-muted-foreground">
                      {discount.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-base font-bold text-foreground">
                  {installment?.currentInstallment}/
                  {installment?.totalInstallments}{" "}
                  {formatCurrency(installment?.value || 0)}
                </p>
                <p className="text-[10px] font-medium text-muted-foreground mt-1">
                  Total: {formatCurrency(installment?.totalValue || 0)}
                </p>
              </div>
            </div>
          ))}
      </div>

      {discounts.length > 0 && (
        <div className="pt-4 border-t border-border mt-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">
              Total do período:
            </span>
            <span className="text-lg font-bold text-destructive">
              {formatCurrency(
                discounts
                  .map((discount) => {
                    const installment = getInstallmentForPeriod(
                      discount,
                      dateFilter?.startDate,
                      dateFilter?.endDate,
                    );
                    return installment?.value || 0;
                  })
                  .reduce((sum, val) => sum + val, 0),
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
