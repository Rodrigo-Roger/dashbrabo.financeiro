import { DiscountsView } from "@/components/dashboard/discounts";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ConditionalRender } from "@/utils/state-components";
import { useFetchEmployees } from "@/hooks/useFetchEmployees";

export default function Discount() {
  const { employees, isLoading, error } = useFetchEmployees();
  const isEmpty = employees.length === 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Descontos</h1>
        <ConditionalRender
          isLoading={isLoading}
          error={error}
          isEmpty={isEmpty}
          errorMessage="Erro ao carregar vendedores da API. Por favor, verifique sua conexão."
          emptyMessage="Nenhum vendedor disponível para sua conta."
        >
          <DiscountsView employees={employees} />
        </ConditionalRender>
      </div>
    </DashboardLayout>
  );
}
