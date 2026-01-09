import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  TrendingUp,
  Award,
  DollarSign,
  Loader2,
  AlertCircle,
  Settings,
} from "lucide-react";
import {
  SAMPLE_EMPLOYEES,
  ROLES,
  calculateCompensation,
  formatCurrency,
} from "@/lib/data";
import { isAuthenticated, getUser } from "@/lib/auth";
import { useEmployees } from "@/hooks/useEmployeeApi";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Header } from "@/components/dashboard/Header";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { KPICard } from "@/components/dashboard/KPICard";
import { EmployeeSelector } from "@/components/dashboard/EmployeeSelector";
import { CompensationBreakdown } from "@/components/dashboard/CompensationBreakdown";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { TeamOverview } from "@/components/dashboard/TeamOverview";
import { RolesGoalsView } from "@/components/dashboard/RolesGoalsView";
import { FinancialSummary } from "@/components/dashboard/FinancialSummary";
import { VendorSelectionModal } from "@/components/dashboard/VendorSelectionModal";
import { Button } from "@/components/ui/button";

// Sample revenue data for chart
const sampleRevenueData = [
  { month: "Ago", value: 18000 },
  { month: "Set", value: 22000 },
  { month: "Out", value: 19500 },
  { month: "Nov", value: 24000 },
  { month: "Dez", value: 21000 },
  { month: "Jan", value: 25000 },
];

export default function Index() {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("financial");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null
  );
  const [fallbackToSample, setFallbackToSample] = useState(false);
  const [selectionModalOpen, setSelectionModalOpen] = useState(false);
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>(() => {
    const stored = localStorage.getItem("selectedVendorIds");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Buscar funcionários da API
  const { data: employees, isLoading, error } = useEmployees();

  // Buscar informações do usuário logado (perfil e permissões)
  const { data: currentUser } = useCurrentUser();

  useEffect(() => {
    console.log("📊 Estado dos funcionários:", { employees, isLoading, error });
    console.log("👤 Usuário logado:", currentUser);
  }, [employees, isLoading, error, currentUser]);

  useEffect(() => {
    // Verificar autenticação
    if (!isAuthenticated()) {
      navigate("/auth", { replace: true });
    } else {
      const user = getUser();
      setUsername(user?.username ?? null);
    }
  }, [navigate]);

  // Usar API ou fallback para dados de exemplo
  const allEmployees = useMemo(() => {
    if (fallbackToSample || error) {
      return SAMPLE_EMPLOYEES;
    }
    return employees || SAMPLE_EMPLOYEES;
  }, [employees, fallbackToSample, error]);

  // Vendedores que o usuário tem permissão para ver (baseado no Django)
  const allowedEmployees = useMemo(() => {
    if (!currentUser) {
      return allEmployees;
    }

    // MASTER vê todos
    if (currentUser.perfil === "MASTER") {
      console.log("🔓 Usuário MASTER - acesso a todos os vendedores");
      return allEmployees;
    }

    // Outros perfis veem apenas authorized_users
    const allowedIds = currentUser.authorized_users || [];
    console.log(`🔒 Perfil ${currentUser.perfil} - pode ver IDs:`, allowedIds);

    // Se não tem permissões específicas, mostra todos (fallback quando API falha)
    if (allowedIds.length === 0) {
      console.log(
        "ℹ️ Sem permissões específicas - mostrando todos os vendedores como fallback"
      );
      return allEmployees;
    }

    return allEmployees.filter((emp) => allowedIds.includes(emp.id));
  }, [allEmployees, currentUser]);

  // Filtrar apenas vendedores selecionados (se houver seleção)
  const employeeList = useMemo(() => {
    if (selectedVendorIds.length === 0) {
      return allowedEmployees;
    }
    // Garante que só mostre vendedores permitidos E selecionados
    return allowedEmployees.filter((emp) => selectedVendorIds.includes(emp.id));
  }, [allowedEmployees, selectedVendorIds]);

  // Inicializar seleção com vendedores permitidos se estiver vazia
  useEffect(() => {
    if (allowedEmployees.length > 0 && selectedVendorIds.length === 0) {
      const allowedIds = allowedEmployees.map((emp) => emp.id);
      setSelectedVendorIds(allowedIds);
      localStorage.setItem("selectedVendorIds", JSON.stringify(allowedIds));
      console.log(
        "✅ Seleção inicializada com vendedores permitidos:",
        allowedIds
      );
    }
  }, [allowedEmployees.length, selectedVendorIds.length]);

  // Limpar seleção se vendedores permitidos mudarem (ex: troca de usuário)
  useEffect(() => {
    if (currentUser && selectedVendorIds.length > 0) {
      const allowedIds = allowedEmployees.map((emp) => emp.id);
      const validSelection = selectedVendorIds.filter((id) =>
        allowedIds.includes(id)
      );

      if (validSelection.length !== selectedVendorIds.length) {
        console.log("⚠️ Ajustando seleção para vendedores permitidos");
        setSelectedVendorIds(validSelection);
        localStorage.setItem(
          "selectedVendorIds",
          JSON.stringify(validSelection)
        );
      }
    }
  }, [currentUser, allowedEmployees, selectedVendorIds]);

  // Definir primeiro funcionário quando a lista carregar
  useEffect(() => {
    if (employeeList.length > 0 && !selectedEmployeeId) {
      setSelectedEmployeeId(employeeList[0].id);
    }
  }, [employeeList, selectedEmployeeId]);

  // Salvar seleção de vendedores
  const handleSaveVendorSelection = (ids: string[]) => {
    setSelectedVendorIds(ids);
    localStorage.setItem("selectedVendorIds", JSON.stringify(ids));
    console.log("✅ Seleção salva:", ids);
    // Se o vendedor selecionado não estiver na nova lista, selecionar o primeiro
    if (
      ids.length > 0 &&
      selectedEmployeeId &&
      !ids.includes(selectedEmployeeId)
    ) {
      const firstSelectedEmployee = allowedEmployees.find((emp) =>
        ids.includes(emp.id)
      );
      if (firstSelectedEmployee) {
        setSelectedEmployeeId(firstSelectedEmployee.id);
      }
    }
  };

  const selectedEmployee = useMemo(
    () =>
      employeeList.find((e) => e.id === selectedEmployeeId) || employeeList[0],
    [selectedEmployeeId, employeeList]
  );

  const compensation = useMemo(
    () => (selectedEmployee ? calculateCompensation(selectedEmployee) : null),
    [selectedEmployee]
  );

  const role = selectedEmployee ? ROLES[selectedEmployee.role] : null;

  if (isLoading && !fallbackToSample && !employees && !error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Carregando vendedores da API...
          </p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    // Mostrar erro se houver e oferecer fallback
    if (error && !fallbackToSample) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>
              Erro ao carregar vendedores da API. Usando dados de exemplo.
            </span>
            <button
              onClick={() => setFallbackToSample(true)}
              className="text-xs font-semibold underline"
            >
              Usar dados de exemplo
            </button>
          </AlertDescription>
        </Alert>
      );
    }

    switch (activeView) {
      case "team":
        return (
          <div className="space-y-5">
            <div className="border-b border-border pb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Visão de Equipe
              </h2>
              <p className="text-sm text-muted-foreground">
                Acompanhe a performance de todos os colaboradores
              </p>
            </div>
            <TeamOverview employees={employeeList} />
          </div>
        );

      case "unit":
        return (
          <div className="space-y-5">
            <div className="border-b border-border pb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Visão de Unidade
              </h2>
              <p className="text-sm text-muted-foreground">
                Métricas consolidadas por unidade de negócio
              </p>
            </div>
            <TeamOverview employees={employeeList} />
          </div>
        );

      case "financial":
        return (
          <div className="space-y-5">
            <div className="border-b border-border pb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Resumo Financeiro
              </h2>
              <p className="text-sm text-muted-foreground">
                Custo total mensal com equipe comercial
              </p>
            </div>
            <FinancialSummary employees={employeeList} />
          </div>
        );

      case "simulator":
        return (
          <div className="space-y-5">
            <div className="border-b border-border pb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Cargos e Metas
              </h2>
              <p className="text-sm text-muted-foreground">
                Defina cargos e visualize as metas correspondentes
              </p>
            </div>
            <RolesGoalsView />
          </div>
        );

      case "promotions":
        return (
          <div className="space-y-5">
            <div className="border-b border-border pb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Promoções
              </h2>
              <p className="text-sm text-muted-foreground">
                Colaboradores elegíveis para promoção
              </p>
            </div>
            <TeamOverview
              employees={employeeList.filter((e) => {
                const r = ROLES[e.role];
                return (
                  r.quarterlyPromotion &&
                  e.quarterlyRevenue >= r.quarterlyPromotion
                );
              })}
            />
          </div>
        );

      default:
        return (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Visão Individual
                </h2>
                <p className="text-sm text-muted-foreground">
                  {role?.name} • Trilha{" "}
                  {selectedEmployee?.path === "specialist"
                    ? "Especialista"
                    : "Liderança"}
                </p>
              </div>
              <EmployeeSelector
                employees={employeeList}
                selectedId={selectedEmployeeId || ""}
                onSelect={setSelectedEmployeeId}
              />
            </div>

            {/* KPI Cards */}
            {compensation && (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <KPICard
                    title="Salário Base"
                    value={formatCurrency(compensation.baseSalary)}
                    subtitle="Mensal"
                    icon={Wallet}
                  />
                  <KPICard
                    title="Variável"
                    value={formatCurrency(compensation.variablePay)}
                    subtitle={`${role?.variableMin}%-${role?.variableMax}% da demanda`}
                    icon={TrendingUp}
                    variant="success"
                  />
                  <KPICard
                    title="Bônus"
                    value={formatCurrency(
                      compensation.teamBonus +
                        compensation.promotionAddOn +
                        compensation.unitAddOn
                    )}
                    subtitle="Este mês"
                    icon={Award}
                    variant="warning"
                  />
                  <KPICard
                    title="Total"
                    value={formatCurrency(compensation.total)}
                    subtitle="Remuneração mensal"
                    icon={DollarSign}
                    variant="primary"
                    trend={{ value: 12.5, label: "vs. mês anterior" }}
                  />
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-5 lg:grid-cols-2">
                  <CompensationBreakdown compensation={compensation} />
                  <RevenueChart data={sampleRevenueData} />
                </div>
              </>
            )}
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      <div className="flex flex-1 flex-col min-w-0 h-screen overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} userEmail={username} />

        <main className="flex-1 overflow-auto p-4 md:p-5 lg:p-6">
          {/* Botão para abrir modal de seleção */}
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedVendorIds.length === allowedEmployees.length ? (
                <span>
                  Exibindo todos os vendedores permitidos (
                  {allowedEmployees.length})
                  {currentUser?.perfil && currentUser.perfil !== "MASTER" && (
                    <span className="ml-2 text-xs text-orange-600">
                      • Perfil: {currentUser.perfil}
                    </span>
                  )}
                </span>
              ) : (
                <span>
                  Exibindo {employeeList.length} de {allowedEmployees.length}{" "}
                  vendedores
                  {currentUser?.perfil && currentUser.perfil !== "MASTER" && (
                    <span className="ml-2 text-xs text-orange-600">
                      • Perfil: {currentUser.perfil}
                    </span>
                  )}
                </span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectionModalOpen(true)}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Selecionar Vendedores
            </Button>
          </div>

          {renderContent()}
        </main>
      </div>

      {/* Modal de Seleção */}
      <VendorSelectionModal
        employees={allowedEmployees}
        open={selectionModalOpen}
        onOpenChange={setSelectionModalOpen}
        selectedIds={selectedVendorIds}
        onSave={handleSaveVendorSelection}
        userProfile={currentUser?.perfil}
      />
    </div>
  );
}
