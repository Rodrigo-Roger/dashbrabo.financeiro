import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/data";
import { fetchDiscounts } from "@/lib/api";
import { getDiscountTotal } from "@/lib/discounts";
import { KPICard } from "../cards/KPICard";
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

        const periodTotal = getDiscountTotal(discounts, dateFilter);
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
