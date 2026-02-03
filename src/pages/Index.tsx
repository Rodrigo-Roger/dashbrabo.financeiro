import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, X, Search } from "lucide-react";
import { ROLES, calculateCompensation, type RoleMap } from "@/lib/data";
import { isAuthenticated, getUser } from "@/lib/auth";
import { useEmployees, useRoles } from "@/hooks/useEmployeeApi";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Header, Sidebar } from "@/components/dashboard/layout";
import { FinancialSummary } from "@/components/dashboard/compensation";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";

export default function Index() {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null,
  );
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>();
  const [appliedFilters, setAppliedFilters] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Buscar funcionários da API
  const {
    data: employees,
    isLoading,
    error,
    status: employeeStatus,
    refetch,
  } = useEmployees(appliedFilters);

  // Buscar informações do usuário logado (perfil e permissões)
  const { data: currentUser, status: userStatus } = useCurrentUser();
  const {
    data: rolesMapApi,
    status: rolesStatus,
    isLoading: rolesLoading,
  } = useRoles();

  const rolesMap = useMemo<RoleMap>(() => {
    return rolesMapApi ?? ROLES;
  }, [rolesMapApi]);

  useEffect(() => {
    // Verificar autenticação
    if (!isAuthenticated()) {
      navigate("/auth", { replace: true });
    } else {
      const user = getUser();
      setUsername(user?.username ?? null);
    }
  }, [navigate]);

  // Usar dados da API (sem fallback para dados de exemplo)
  const allEmployees = useMemo(() => {
    return employees || [];
  }, [employees]);

  // Backend já retorna filtrado por permissão; usamos todos
  const allowedEmployees = useMemo(() => {
    return allEmployees;
  }, [allEmployees]);

  // Filtrar apenas vendedores permitidos (sem seleção adicional)
  const employeeList = useMemo(() => {
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
    [selectedEmployeeId, employeeList],
  );

  const compensation = useMemo(() => {
    if (selectedEmployee) {
      return calculateCompensation(selectedEmployee, rolesMap);
    }
    return null;
  }, [selectedEmployee, rolesMap]);

  const role = selectedEmployee ? rolesMap[selectedEmployee.role] : null;

  if (isLoading && !employees) {
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
    // Mostrar erro se houver
    if (error && employeeList.length === 0) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar vendedores da API. Por favor, verifique sua conexão
            e tente novamente.
          </AlertDescription>
        </Alert>
      );
    }

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
          <FinancialSummary
            employees={employeeList}
            rolesMap={rolesMap}
            dateFilter={appliedFilters}
          />
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col min-w-0 h-screen overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} username={username} />

        <main className="flex-1 overflow-auto p-4 md:p-5 lg:p-6">
          {/* Card Container do Filtro */}
          <div className="bg-card p-4 rounded-xl border shadow-sm mb-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm font-medium text-muted-foreground">
                Período dos dados
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-w-[280px] justify-between bg-background hover:bg-muted"
                    >
                      <span className="text-sm">
                        {dateRange?.from && dateRange?.to
                          ? `${format(dateRange.from, "dd/MM/yyyy", {
                              locale: ptBR,
                            })} - ${format(dateRange.to, "dd/MM/yyyy", {
                              locale: ptBR,
                            })}`
                          : "Selecione o período"}
                      </span>
                      <CalendarIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="range"
                      locale={ptBR}
                      selected={tempDateRange}
                      onSelect={(range) => {
                        if (range) {
                          setTempDateRange(range);
                        }
                      }}
                      numberOfMonths={2}
                      initialFocus
                      captionLayout="dropdown-buttons"
                      fromYear={2020}
                      toYear={2030}
                    />
                    <div className="flex gap-2 p-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setTempDateRange(undefined);
                          setCalendarOpen(false);
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-primary hover:bg-primary/90"
                        onClick={() => {
                          setDateRange(tempDateRange);
                          setCalendarOpen(false);
                        }}
                        disabled={!tempDateRange?.from || !tempDateRange?.to}
                      >
                        Aplicar
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                {dateRange?.from && dateRange?.to && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDateRange(undefined);
                      setTempDateRange(undefined);
                      setAppliedFilters({});
                    }}
                    title="Limpar filtro"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}

                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 gap-2"
                  onClick={() => {
                    if (dateRange?.from && dateRange?.to) {
                      const filters = {
                        startDate: format(dateRange.from, "yyyy-MM-dd"),
                        endDate: format(dateRange.to, "yyyy-MM-dd"),
                      };
                      setAppliedFilters(filters);
                    }
                  }}
                  disabled={!dateRange?.from || !dateRange?.to}
                >
                  <Search className="h-4 w-4" />
                  Filtrar
                </Button>
              </div>
            </div>
          </div>

          {renderContent()}
        </main>
      </div>
    </div>
  );
}
