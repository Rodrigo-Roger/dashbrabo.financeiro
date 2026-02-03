import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { EmployeeSelector } from "@/components/dashboard/selectors";
import { KPICard } from "@/components/dashboard/cards";
import { CompensationBreakdown } from "@/components/dashboard/compensation";
import { RevenueChart } from "@/components/dashboard/charts";
import {
  DiscountSummary,
  DiscountInstallments,
} from "@/components/dashboard/discounts";
import { ConditionalRender } from "@/utils/state-components";
import { useFetchEmployees } from "@/hooks/useFetchEmployees";
import { calculateCompensation, formatCurrency } from "@/lib/data";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Calendar as CalendarIcon,
  X,
  Search,
  Wallet,
  TrendingUp,
  Award,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { fetchPaymentHistory } from "@/services/dashboard/paymentService";

export default function Individual() {
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
  const [paymentHistory, setPaymentHistory] = useState<
    { month: string; value: number }[]
  >([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const { employees, isLoading, error, rolesMap } =
    useFetchEmployees(appliedFilters);

  // Manter o ID do vendedor selecionado mesmo quando os filtros mudam
  const selectedEmployee = useMemo(() => {
    if (selectedEmployeeId) {
      // Tentar encontrar o vendedor pelo ID selecionado
      const employee = employees.find((e) => e.id === selectedEmployeeId);
      if (employee) return employee;
    }
    // Se não encontrou ou não há selecionado, retorna o primeiro
    return employees[0];
  }, [employees, selectedEmployeeId]);

  const compensation = selectedEmployee
    ? calculateCompensation(selectedEmployee, rolesMap)
    : null;
  const role = selectedEmployee ? rolesMap[selectedEmployee.role] : null;
  const isEmpty = employees.length === 0;

  // Atualizar o ID selecionado quando a lista de employees mudar
  useEffect(() => {
    if (employees.length > 0 && !selectedEmployeeId) {
      setSelectedEmployeeId(employees[0].id);
    }
  }, [employees, selectedEmployeeId]);

  // Buscar histórico de pagamento quando o vendedor mudar
  useEffect(() => {
    const loadPaymentHistory = async () => {
      if (!selectedEmployee?.id) {
        setPaymentHistory([]);
        return;
      }

      setLoadingHistory(true);
      try {
        const history = await fetchPaymentHistory(selectedEmployee.id, 6);
        setPaymentHistory(history);
      } catch (error) {
        console.error("Erro ao buscar histórico de pagamento:", error);
        setPaymentHistory([]);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadPaymentHistory();
  }, [selectedEmployee?.id, appliedFilters]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <ConditionalRender
          isLoading={isLoading}
          error={error}
          isEmpty={isEmpty}
          errorMessage="Erro ao carregar vendedores da API. Por favor, verifique sua conexão."
          emptyMessage="Nenhum vendedor disponível para sua conta."
        >
          <div className="space-y-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
                <div>
                  <h1 className="text-3xl font-bold">Individual</h1>
                  <p className="text-sm text-muted-foreground">
                    {role?.name} • Trilha{" "}
                    {selectedEmployee?.path === "specialist"
                      ? "Especialista"
                      : "Liderança"}
                  </p>
                </div>
                <EmployeeSelector
                  employees={employees}
                  selectedId={selectedEmployeeId || ""}
                  onSelect={setSelectedEmployeeId}
                  rolesMap={rolesMap}
                />
              </div>

              {/* Filtro de Período */}
              <div className="bg-card p-4 rounded-xl border shadow-sm">
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
                            disabled={
                              !tempDateRange?.from || !tempDateRange?.to
                            }
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
            </div>

            {compensation && (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
                        compensation.unitAddOn,
                    )}
                    subtitle="Este mês"
                    icon={Award}
                    variant="warning"
                  />
                  <DiscountSummary
                    employeeId={selectedEmployeeId || undefined}
                    compensation={compensation}
                    dateFilter={appliedFilters}
                  />
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <CompensationBreakdown
                    compensation={compensation}
                    employeeId={selectedEmployeeId || undefined}
                    dateFilter={appliedFilters}
                  />
                  <RevenueChart
                    data={
                      loadingHistory
                        ? [
                            { month: "...", value: 0 },
                            { month: "...", value: 0 },
                            { month: "...", value: 0 },
                            { month: "...", value: 0 },
                            { month: "...", value: 0 },
                            { month: "...", value: 0 },
                          ]
                        : paymentHistory.length > 0
                          ? paymentHistory
                          : [
                              { month: "Jan", value: 0 },
                              { month: "Fev", value: 0 },
                              { month: "Mar", value: 0 },
                              { month: "Abr", value: 0 },
                              { month: "Mai", value: 0 },
                              { month: "Jun", value: 0 },
                            ]
                    }
                  />
                </div>

                <div>
                  <DiscountInstallments
                    employeeId={selectedEmployeeId || undefined}
                    dateFilter={appliedFilters}
                  />
                </div>
              </>
            )}
          </div>
        </ConditionalRender>
      </div>
    </DashboardLayout>
  );
}
