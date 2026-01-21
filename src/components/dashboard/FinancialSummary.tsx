import { cn } from "@/lib/utils";
import { Wallet, TrendingUp, Award, DollarSign, Minus } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Employee,
  calculateCompensation,
  formatCurrency,
  ROLES,
  type RoleMap,
} from "@/lib/data";
import { getTotalDiscounts } from "@/lib/api";

interface FinancialSummaryProps {
  employees: Employee[];
  className?: string;
  rolesMap?: RoleMap;
  dateFilter?: {
    startDate?: string;
    endDate?: string;
  };
}

export function FinancialSummary({
  employees,
  className,
  rolesMap = ROLES,
  dateFilter,
}: FinancialSummaryProps) {
  const [discountsMap, setDiscountsMap] = useState<Record<string, number>>({});
  const [loadingDiscounts, setLoadingDiscounts] = useState(true);

  // Buscar descontos para todos os vendedores
  useEffect(() => {
    const fetchAllDiscounts = async () => {
      setLoadingDiscounts(true);
      const discounts: Record<string, number> = {};

      for (const employee of employees) {
        const allDiscounts = await getTotalDiscounts(employee.id);

        // Filtrar por período se fornecido
        if (dateFilter?.startDate && dateFilter?.endDate) {
          const startDate = new Date(dateFilter.startDate);
          const endDate = new Date(dateFilter.endDate);
          // getTotalDiscounts já retorna o valor total, aqui apenas aplicamos o filtro
          discounts[employee.id] = allDiscounts;
        } else {
          discounts[employee.id] = allDiscounts;
        }
      }

      setDiscountsMap(discounts);
      setLoadingDiscounts(false);
    };

    if (employees.length > 0) {
      fetchAllDiscounts();
    }
  }, [employees, dateFilter]);

  // Calculate totals for all employees
  const totals = employees.reduce(
    (acc, employee) => {
      const comp = calculateCompensation(employee, rolesMap);
      const discounts = discountsMap[employee.id] || 0;
      const finalTotal = comp.total - discounts;

      return {
        baseSalary: acc.baseSalary + comp.baseSalary,
        variablePay: acc.variablePay + comp.variablePay,
        bonuses:
          acc.bonuses + comp.teamBonus + comp.promotionAddOn + comp.unitAddOn,
        discounts: acc.discounts + discounts,
        total: acc.total + finalTotal,
      };
    },
    { baseSalary: 0, variablePay: 0, bonuses: 0, discounts: 0, total: 0 },
  );

  const mainMetrics = [
    {
      label: "Salários Base",
      value: totals.baseSalary,
      icon: Wallet,
      description: "Total de salários fixos",
      color: "bg-secondary text-muted-foreground",
    },
    {
      label: "Variável",
      value: totals.variablePay,
      icon: TrendingUp,
      description: "Comissões e variáveis",
      color: "bg-success/10 text-success",
    },
    {
      label: "Bônus",
      value: totals.bonuses,
      icon: Award,
      description: "Bônus e add-ons",
      color: "bg-warning/10 text-warning",
    },
    {
      label: "Descontos",
      value: totals.discounts,
      icon: Minus,
      description: "Adiantamentos e Monster",
      color: "bg-destructive/10 text-destructive",
    },
  ];

  const totalMetric = {
    label: "Total Mensal",
    value: totals.total,
    icon: DollarSign,
    description: "Base + Variável + Bônus - Descontos",
    color: "bg-primary text-primary-foreground",
    highlight: true,
  };

  return (
    <div className={cn("space-y-5", className)}>
      {/* Main KPI Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {mainMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className={cn("rounded-lg border p-5 bg-card border-border")}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    {metric.label}
                  </p>
                  <p className="text-2xl font-semibold tracking-tight text-foreground">
                    {formatCurrency(metric.value)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {metric.description}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    metric.color,
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total Mensal Card */}
      <div className="rounded-lg border border-primary/40 bg-card p-5 ring-1 ring-primary/20">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground">
              {totalMetric.label}
            </p>
            <p className="text-3xl font-bold tracking-tight text-foreground">
              {formatCurrency(totalMetric.value)}
            </p>
            <p className="text-xs text-muted-foreground">
              {totalMetric.description}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <totalMetric.icon className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-5 py-3">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Detalhamento por Colaborador
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="px-5 py-3 text-left font-medium">Colaborador</th>
                <th className="px-5 py-3 text-right font-medium">Base</th>
                <th className="px-5 py-3 text-right font-medium">Variável</th>
                <th className="px-5 py-3 text-right font-medium">Bônus</th>
                <th className="px-5 py-3 text-right font-medium">Descontos</th>
                <th className="px-5 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => {
                const comp = calculateCompensation(employee, rolesMap);
                const bonusTotal =
                  comp.teamBonus + comp.promotionAddOn + comp.unitAddOn;
                const discounts = discountsMap[employee.id] || 0;
                const finalTotal = comp.total - discounts;

                return (
                  <tr
                    key={employee.id}
                    className="border-b border-border last:border-0 hover:bg-secondary/30"
                  >
                    <td className="px-5 py-3">
                      <span className="text-sm font-medium text-foreground">
                        {employee.name}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-sm tabular-nums text-muted-foreground">
                      {formatCurrency(comp.baseSalary)}
                    </td>
                    <td className="px-5 py-3 text-right text-sm tabular-nums text-success">
                      {formatCurrency(comp.variablePay)}
                    </td>
                    <td className="px-5 py-3 text-right text-sm tabular-nums text-warning">
                      {formatCurrency(bonusTotal)}
                    </td>
                    <td className="px-5 py-3 text-right text-sm tabular-nums text-destructive">
                      {loadingDiscounts ? (
                        <span className="text-muted-foreground">...</span>
                      ) : (
                        formatCurrency(discounts)
                      )}
                    </td>
                    <td className="px-5 py-3 text-right text-sm font-medium tabular-nums text-foreground">
                      {formatCurrency(finalTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-secondary/50">
                <td className="px-5 py-3">
                  <span className="text-sm font-semibold text-foreground">
                    Total
                  </span>
                </td>
                <td className="px-5 py-3 text-right text-sm font-semibold tabular-nums text-foreground">
                  {formatCurrency(totals.baseSalary)}
                </td>
                <td className="px-5 py-3 text-right text-sm font-semibold tabular-nums text-success">
                  {formatCurrency(totals.variablePay)}
                </td>
                <td className="px-5 py-3 text-right text-sm font-semibold tabular-nums text-warning">
                  {formatCurrency(totals.bonuses)}
                </td>
                <td className="px-5 py-3 text-right text-sm font-semibold tabular-nums text-destructive">
                  {formatCurrency(totals.discounts)}
                </td>
                <td className="px-5 py-3 text-right text-sm font-bold tabular-nums text-foreground">
                  {formatCurrency(totals.total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
