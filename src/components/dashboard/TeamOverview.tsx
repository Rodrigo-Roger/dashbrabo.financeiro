import { cn } from "@/lib/utils";
import { Users, TrendingUp, Target, Award } from "lucide-react";
import {
  Employee,
  formatCurrency,
  calculateCompensation,
  getPerformanceStatus,
  ROLES,
  type RoleMap,
} from "@/lib/data";
import { StatusBadge } from "./StatusBadge";

interface TeamOverviewProps {
  employees: Employee[];
  className?: string;
  rolesMap?: RoleMap;
}

export function TeamOverview({
  employees,
  className,
  rolesMap = ROLES,
}: TeamOverviewProps) {
  const totalRevenue = employees.reduce(
    (sum, emp) => sum + emp.quarterlyRevenue,
    0
  );
  const totalPayout = employees.reduce(
    (sum, emp) => sum + calculateCompensation(emp, rolesMap).total,
    0
  );
  const avgPerformance =
    employees.reduce((sum, emp) => {
      const role = rolesMap[emp.role];
      if (role.quarterlyStay) {
        return sum + (emp.quarterlyRevenue / role.quarterlyStay) * 100;
      }
      return sum + 100;
    }, 0) / employees.length;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-card p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Colaboradores</p>
              <p className="text-2xl font-bold text-foreground">
                {employees.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-card p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Receita Total</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-card p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <Target className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Performance Média</p>
              <p className="text-2xl font-bold text-foreground">
                {avgPerformance.toFixed(0)}%
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-card p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
              <Award className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Folha Total</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(totalPayout)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Table */}
      <div className="rounded-xl bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                  Colaborador
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                  Cargo
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                  Receita Trim.
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                  Remuneração
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => {
                const role = rolesMap[employee.role];
                const compensation = calculateCompensation(employee, rolesMap);
                const status = getPerformanceStatus(
                  employee.quarterlyRevenue,
                  role.quarterlyStay,
                  role.quarterlyPromotion
                );

                return (
                  <tr
                    key={employee.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {employee.picture ? (
                          <img
                            src={employee.picture}
                            alt={employee.name}
                            className="h-8 w-8 rounded-full object-cover"
                            onError={(e) => {
                              // Se imagem não carregar, mostrar avatar com letra
                              const avatar = (e.target as HTMLImageElement)
                                .nextElementSibling as HTMLElement;
                              if (avatar) avatar.style.display = "flex";
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        ) : null}
                        {!employee.picture && (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-xs">
                            {employee.name.charAt(0)}
                          </div>
                        )}
                        <span className="font-medium text-foreground">
                          {employee.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {role.name}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">
                      {formatCurrency(employee.quarterlyRevenue)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-success">
                      {formatCurrency(compensation.total)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <StatusBadge status={status} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
