import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  TrendingUp,
  Award,
  DollarSign,
  Loader2,
  AlertCircle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [activeView, setActiveView] = useState("team");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null
  );
  const [fallbackToSample, setFallbackToSample] = useState(false);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Buscar funcionários da API
  const {
    data: employees,
    isLoading,
    error,
    status: employeeStatus,
  } = useEmployees({
    startDate: dateRange.from
      ? format(dateRange.from, "yyyy-MM-dd")
      : undefined,
    endDate: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
  });

  // Buscar informações do usuário logado (perfil e permissões)
  const { data: currentUser, status: userStatus } = useCurrentUser();

  useEffect(() => {
    console.log("📊 Estado dos funcionários:", {
      employees,
      isLoading,
      error,
      status: employeeStatus,
    });
    console.log("👤 Usuário logado:", currentUser, "Status:", userStatus);
  }, [employees, isLoading, error, currentUser, employeeStatus, userStatus]);

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

  // Backend já retorna filtrado por permissão; usamos todos
  const allowedEmployees = useMemo(() => {
    return allEmployees;
  }, [allEmployees]);

  // Filtrar apenas vendedores permitidos (sem seleção adicional)
  const employeeList = useMemo(() => {
    console.log(
      "📋 employeeList recalculado:",
      allowedEmployees?.length || 0,
      "vendedores"
    );
    return allowedEmployees;
  }, [allowedEmployees]);

  // Definir primeiro funcionário quando a lista carregar
  useEffect(() => {
    if (employeeList.length > 0 && !selectedEmployeeId) {
      setSelectedEmployeeId(employeeList[0].id);
    }
  }, [employeeList, selectedEmployeeId]);

  // Selecionar funcionário atual
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

            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Carregando vendedores...
                  </p>
                </div>
              </div>
            )}

            {employeeList.length === 0 && !isLoading && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Nenhum vendedor disponível para sua conta.
                </AlertDescription>
              </Alert>
            )}

            {employeeList.length > 0 && (
              <TeamOverview employees={employeeList} />
            )}
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
            <RolesGoalsView employees={employeeList} />
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
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              Período dos dados
            </div>
            <Popover
              open={calendarOpen}
              onOpenChange={(open) => {
                if (!open && (!dateRange.from || !dateRange.to)) {
                  setCalendarOpen(true);
                } else {
                  setCalendarOpen(open);
                }
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-72 justify-start text-left font-normal"
                  onClick={() => setCalendarOpen(true)}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from && dateRange.to
                    ? `${format(dateRange.from, "dd/MM/yyyy")} - ${format(
                        dateRange.to,
                        "dd/MM/yyyy"
                      )}`
                    : "Selecione o período"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => {
                    setDateRange(range ?? {});
                    if (range?.from && range?.to) {
                      setCalendarOpen(false);
                    } else {
                      setCalendarOpen(true);
                    }
                  }}
                  numberOfMonths={2}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {renderContent()}
        </main>
      </div>
    </div>
  );
}
