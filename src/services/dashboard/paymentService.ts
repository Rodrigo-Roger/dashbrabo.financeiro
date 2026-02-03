import api from "@/lib/api_config";
import { getDiscountTotal } from "@/lib/discounts";
import { fetchDiscounts } from "./discountService";
import { fetchEmployees } from "@/services/team";

/**
 * Busca histórico de pagamentos de um vendedor
 */
export async function fetchPaymentHistory(
  employeeId: string,
  months: number = 6,
): Promise<{ month: string; value: number }[]> {
  try {
    // Tentar buscar do endpoint de histórico se existir
    const response = await api.get(
      `/moskit/v1/payment-history/${employeeId}/`,
      {
        params: { months },
      },
    );
    return response.data;
  } catch {
    // Fallback: calcular baseado nos dados do dashboard-summary
    try {
      const monthsData = [];
      const currentDate = new Date();

      for (let i = months - 1; i >= 0; i--) {
        const monthDate = new Date(currentDate);
        monthDate.setMonth(monthDate.getMonth() - i);

        const startDate = new Date(
          monthDate.getFullYear(),
          monthDate.getMonth(),
          1,
        );
        const endDate = new Date(
          monthDate.getFullYear(),
          monthDate.getMonth() + 1,
          0,
        );

        const employees = await fetchEmployees({
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        });

        const employee = employees.find((e) => e.id === employeeId);

        if (employee) {
          const compensation = await import("@/lib/data").then((m) =>
            m.calculateCompensation(employee, m.ROLES),
          );

          // Buscar descontos do período e calcular apenas as parcelas do mês
          let monthDiscounts = 0;
          try {
            const discounts = await fetchDiscounts(employeeId);
            monthDiscounts = getDiscountTotal(discounts, {
              startDate,
              endDate,
            });
          } catch {
            // Se falhar ao buscar descontos, continua sem descontos
          }

          monthsData.push({
            month: monthDate.toLocaleDateString("pt-BR", { month: "short" }),
            value: compensation.total - monthDiscounts,
          });
        } else {
          monthsData.push({
            month: monthDate.toLocaleDateString("pt-BR", { month: "short" }),
            value: 0,
          });
        }
      }

      return monthsData;
    } catch {
      // Se tudo falhar, retornar dados vazios
      return [];
    }
  }
}
