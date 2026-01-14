import { useState } from "react";
import { cn } from "@/lib/utils";
import { Calculator, Wallet, TrendingUp, Target } from "lucide-react";
import {
  ROLES,
  CareerLevel,
  formatCurrency,
  calculateVariablePay,
  type RoleMap,
} from "@/lib/data";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SimulatorViewProps {
  className?: string;
  rolesMap?: RoleMap;
}

export function SimulatorView({
  className,
  rolesMap = ROLES,
}: SimulatorViewProps) {
  const [selectedRole, setSelectedRole] = useState<CareerLevel>("level3");
  const [demand, setDemand] = useState<number>(15000);
  const [quarterlyRevenue, setQuarterlyRevenue] = useState<number>(45000);

  const role = rolesMap[selectedRole];
  const variablePay = calculateVariablePay(role, demand);
  const totalMonthly = role.baseSalary + variablePay;

  const demandMin = role.demandMin || 0;
  const demandMax = role.demandMax || 50000;

  const quarterlyMin = role.quarterlyStay || 0;
  const quarterlyMax = role.quarterlyPromotion || role.quarterlyStay || 100000;

  return (
    <div className={cn("space-y-6", className)}>
      <div className="rounded-xl bg-card p-6 shadow-card">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              Simulador de Remuneração
            </h3>
            <p className="text-sm text-muted-foreground">
              Simule diferentes cenários de performance
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Inputs */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Cargo</Label>
              <Select
                value={selectedRole}
                onValueChange={(v) => setSelectedRole(v as CareerLevel)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(rolesMap).map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {role.description}
              </p>
            </div>

            {role.demandMin !== undefined && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Demanda Mensal</Label>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(demand)}
                  </span>
                </div>
                <Slider
                  value={[demand]}
                  onValueChange={(v) => setDemand(v[0])}
                  min={demandMin}
                  max={demandMax}
                  step={1000}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatCurrency(demandMin)}</span>
                  <span>{formatCurrency(demandMax)}</span>
                </div>
              </div>
            )}

            {role.quarterlyStay && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Receita Trimestral</Label>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(quarterlyRevenue)}
                  </span>
                </div>
                <Slider
                  value={[quarterlyRevenue]}
                  onValueChange={(v) => setQuarterlyRevenue(v[0])}
                  min={0}
                  max={quarterlyMax * 1.5}
                  step={5000}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>R$ 0</span>
                  <span>{formatCurrency(quarterlyMax * 1.5)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="space-y-4">
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-3 mb-3">
                <Wallet className="h-5 w-5 text-primary" />
                <span className="font-medium text-foreground">
                  Salário Base
                </span>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {formatCurrency(role.baseSalary)}
              </p>
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="h-5 w-5 text-success" />
                <span className="font-medium text-foreground">Variável</span>
              </div>
              <p className="text-3xl font-bold text-success">
                {formatCurrency(variablePay)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {((variablePay / demand) * 100).toFixed(1)}% da demanda
              </p>
            </div>

            <div className="rounded-lg bg-primary p-4 text-primary-foreground">
              <div className="flex items-center gap-3 mb-3">
                <Target className="h-5 w-5" />
                <span className="font-medium">Total Mensal</span>
              </div>
              <p className="text-4xl font-bold">
                {formatCurrency(totalMonthly)}
              </p>
            </div>

            {role.quarterlyStay && (
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Status de Performance
                </p>
                {quarterlyRevenue >= (role.quarterlyPromotion || Infinity) ? (
                  <p className="font-semibold text-success">
                    ✓ Elegível para Promoção
                  </p>
                ) : quarterlyRevenue >= role.quarterlyStay ? (
                  <p className="font-semibold text-foreground">
                    ✓ Meta de Permanência Atingida
                  </p>
                ) : (
                  <p className="font-semibold text-danger">
                    ⚠ Abaixo da Meta de Permanência
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
