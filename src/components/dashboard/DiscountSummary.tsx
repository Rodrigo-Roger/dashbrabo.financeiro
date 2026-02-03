import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/data";
import { getTotalDiscounts, fetchDiscounts } from "@/lib/api";
import { KPICard } from "./KPICard";
import { Minus } from "lucide-react";

interface DiscountSummaryProps {
  employeeId?: string;
  dateFilter?: {
    startDate?: string;
    endDate?: string;
  };
}

export function DiscountSummary({
  employeeId,
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
        // Se houver filtro de período, busca todos os descontos e filtra
        if (dateFilter?.startDate && dateFilter?.endDate) {
          const discounts = await fetchDiscounts(employeeId);
          const startDate = new Date(dateFilter.startDate);
          const endDate = new Date(dateFilter.endDate);

          const filteredTotal = discounts.reduce((sum, discount) => {
            const discountDate = new Date(discount.created_at);
            if (discountDate >= startDate && discountDate <= endDate) {
              return sum + Number(discount.total_discount || 0);
            }
            return sum;
          }, 0);

          setTotalDiscount(filteredTotal);
        } else {
          // Sem filtro, pega o total de todos os descontos
          const total = await getTotalDiscounts(employeeId);
          setTotalDiscount(total);
        }
      } catch (error) {
        console.error("Erro ao buscar descontos:", error);
        setTotalDiscount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscountData();
  }, [employeeId, dateFilter]);

  return (
    <KPICard
      title="Desconto"
      value={loading ? "Carregando..." : formatCurrency(totalDiscount)}
      subtitle={
        dateFilter?.startDate && dateFilter?.endDate ? "Do período" : "Total"
      }
      icon={Minus}
      variant="danger"
    />
  );
}
