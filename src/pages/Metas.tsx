import { DashboardLayout } from "@/layouts/DashboardLayout";
import { RolesGoalsView } from "@/components/dashboard/RolesGoalsView";
import { ConditionalRender } from "@/utils/state-components";
import { useFetchEmployees } from "@/hooks/useFetchEmployees";

export default function Metas() {
  const { employees, isLoading, error, rolesMap } = useFetchEmployees();
  const isEmpty = employees.length === 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Cargos e Metas</h1>
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
                Cargos e Metas
              </h2>
              <p className="text-sm text-muted-foreground">
                Defina cargos e visualize as metas correspondentes
              </p>
            </div>
            <RolesGoalsView employees={employees} rolesMap={rolesMap} />
          </div>
        </ConditionalRender>
      </div>
    </DashboardLayout>
  );
}
