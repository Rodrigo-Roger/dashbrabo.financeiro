import { cn } from "@/lib/utils";
import { Wallet, TrendingUp, Award, DollarSign } from "lucide-react";
import {
  Employee,
  calculateCompensation,
  formatCurrency,
  ROLES,
  type RoleMap,
} from "@/lib/data";

interface FinancialSummaryProps {
  employees: Employee[];
  className?: string;
  rolesMap?: RoleMap;
}

export function FinancialSummary({
  employees,
  className,
  rolesMap = ROLES,
}: FinancialSummaryProps) {
  // Calculate totals for all employees
  const totals = employees.reduce(
    (acc, employee) => {
      const comp = calculateCompensation(employee, rolesMap);
      return {
        baseSalary: acc.baseSalary + comp.baseSalary,
        variablePay: acc.variablePay + comp.variablePay,
        bonuses:
          acc.bonuses + comp.teamBonus + comp.promotionAddOn + comp.unitAddOn,
        total: acc.total + comp.total,
      };
    },
    { baseSalary: 0, variablePay: 0, bonuses: 0, total: 0 }
  );

  const metrics = [
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
      label: "Total Mensal",
      value: totals.total,
      icon: DollarSign,
      description: "Custo total com equipe comercial",
      color: "bg-primary text-primary-foreground",
      highlight: true,
    },
  ];

  return (
    <div className={cn("space-y-5", className)}>
      {/* Main KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className={cn(
                "rounded-lg border p-5",
                metric.highlight
                  ? "bg-card border-primary/40 ring-1 ring-primary/20"
                  : "bg-card border-border"
              )}
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
                    metric.highlight
                      ? "bg-primary/15 text-primary"
                      : metric.color
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </div>
          );
        })}
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
                <th className="px-5 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => {
                const comp = calculateCompensation(employee, rolesMap);
                const bonusTotal =
                  comp.teamBonus + comp.promotionAddOn + comp.unitAddOn;
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
                    <td className="px-5 py-3 text-right text-sm font-medium tabular-nums text-foreground">
                      {formatCurrency(comp.total)}
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
