import { DashboardLayout } from "@/layouts/DashboardLayout";
import { TeamOverview } from "@/components/dashboard/views";
import { ConditionalRender, EmptyState } from "@/utils/state-components";
import { useFetchEmployees } from "@/hooks/useFetchEmployees";

export default function Promocoes() {
  const { employees, isLoading, error, rolesMap } = useFetchEmployees();

  const promotionEligibleEmployees = employees.filter((e) => {
    const r = rolesMap[e.role];
    return r.quarterlyPromotion && e.quarterlyRevenue >= r.quarterlyPromotion;
  });

  const isEmpty = employees.length === 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Promoções</h1>
        <ConditionalRender
          isLoading={isLoading}
          error={error}
          isEmpty={isEmpty}
          errorMessage="Erro ao carregar vendedores da API. Por favor, verifique sua conexão."
          emptyMessage="Nenhum vendedor disponível para sua conta."
        >
          <div className="space-y-5">
            <div className="border-b border-border pb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Promoções
              </h2>
              <p className="text-sm text-muted-foreground">
                Colaboradores elegíveis para promoção
              </p>
            </div>
            {promotionEligibleEmployees.length > 0 ? (
              <TeamOverview
                employees={promotionEligibleEmployees}
                rolesMap={rolesMap}
              />
            ) : (
              <EmptyState message="Nenhum colaborador elegível para promoção neste momento." />
            )}
          </div>
        </ConditionalRender>
      </div>
    </DashboardLayout>
  );
}
