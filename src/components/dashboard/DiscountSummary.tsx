import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/data";
import { getTotalDiscounts, fetchDiscounts } from "@/lib/api";
import { KPICard } from "./KPICard";
import { Minus, DollarSign } from "lucide-react";

interface DiscountSummaryProps {
  employeeId?: string;
  compensation?: {
    total: number;
  };
  dateFilter?: {
    startDate?: string;
    endDate?: string;
  };
}

export function DiscountSummary({
  employeeId,
  compensation,
  dateFilter,
}: DiscountSummaryProps) {
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDiscountData = async () => {
      if (!employeeId) {
        setTotalDiscount(0);
        return;
      }

      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    fetchDiscountData();
  }, [employeeId, dateFilter]);

  const netTotal = (compensation?.total || 0) - totalDiscount;

  return (
    <>
      <KPICard
        title="Desconto"
        value={loading ? "Carregando..." : formatCurrency(totalDiscount)}
        subtitle={
          dateFilter?.startDate && dateFilter?.endDate ? "Do período" : "Total"
        }
        icon={Minus}
        variant="danger"
      />
      <KPICard
        title="Total Líquido"
        value={formatCurrency(netTotal)}
        subtitle="Após descontos"
        icon={DollarSign}
        variant="primary"
      />
    </>
  );
}
