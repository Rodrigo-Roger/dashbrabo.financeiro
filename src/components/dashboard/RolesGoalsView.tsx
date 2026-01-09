import { useState } from "react";
import { cn } from "@/lib/utils";
import { Users, Briefcase, Target, CheckCircle, Save } from "lucide-react";
import {
  ROLES,
  CareerLevel,
  formatCurrency,
  SAMPLE_EMPLOYEES,
  Employee,
} from "@/lib/data";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface RolesGoalsViewProps {
  employees?: Employee[];
  className?: string;
}

export function RolesGoalsView({
  employees = SAMPLE_EMPLOYEES,
  className,
}: RolesGoalsViewProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<CareerLevel | "">("");

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);
  const role = selectedRole ? ROLES[selectedRole] : null;

  const handleSave = () => {
    if (!selectedEmployeeId || !selectedRole) {
      toast.error("Selecione um vendedor e um cargo");
      return;
    }
    // TODO: Enviar para API quando disponível
    toast.success(
      `Cargo de ${selectedEmployee?.name} atualizado para ${role?.name}`
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="rounded-xl bg-card p-6 shadow-card">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Cargos e Metas</h3>
            <p className="text-sm text-muted-foreground">
              Defina o cargo do vendedor e veja as metas correspondentes
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Seleção */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Vendedor
              </Label>
              <Select
                value={selectedEmployeeId}
                onValueChange={setSelectedEmployeeId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um vendedor" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      <div className="flex flex-col">
                        <span>{emp.name}</span>
                        <span className="text-xs text-muted-foreground">
                          Atual: {ROLES[emp.role].name}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Em breve os vendedores serão carregados via API
              </p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Cargo
              </Label>
              <Select
                value={selectedRole}
                onValueChange={(v) => setSelectedRole(v as CareerLevel)}
                disabled={!selectedEmployeeId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cargo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ROLES).map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      <div className="flex flex-col">
                        <span>{r.name}</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {r.path === "specialist"
                            ? "Especialista"
                            : "Liderança"}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {role && (
                <p className="text-sm text-muted-foreground">
                  {role.description}
                </p>
              )}
            </div>

            <Button
              onClick={handleSave}
              disabled={!selectedEmployeeId || !selectedRole}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>

          {/* Metas do Cargo */}
          <div className="space-y-4">
            {role ? (
              <>
                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Target className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground">
                      Salário Base
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">
                    {formatCurrency(role.baseSalary)}
                  </p>
                </div>

                {role.demandMin !== undefined &&
                  role.demandMax !== undefined && (
                    <div className="rounded-lg border border-border p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <CheckCircle className="h-5 w-5 text-success" />
                        <span className="font-medium text-foreground">
                          Meta de Demanda Mensal
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-foreground">
                          {formatCurrency(role.demandMin)}
                        </p>
                        <span className="text-muted-foreground">a</span>
                        <p className="text-2xl font-bold text-foreground">
                          {formatCurrency(role.demandMax)}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Variável: {role.variableMin}% a {role.variableMax}%
                      </p>
                    </div>
                  )}

                {role.quarterlyStay && (
                  <div className="rounded-lg border border-border p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Target className="h-5 w-5 text-warning" />
                      <span className="font-medium text-foreground">
                        Meta Trimestral (Permanência)
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(role.quarterlyStay)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Mínimo para manter o cargo
                    </p>
                  </div>
                )}

                {role.quarterlyPromotion && (
                  <div className="rounded-lg bg-primary/10 border border-primary/30 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Target className="h-5 w-5 text-primary" />
                      <span className="font-medium text-foreground">
                        Meta Trimestral (Promoção)
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(role.quarterlyPromotion)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Elegível para próximo nível
                    </p>
                  </div>
                )}

                {!role.demandMin && !role.quarterlyStay && (
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">
                      Este cargo possui regras específicas de bonificação.
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {role.description}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-8 text-center">
                <Target className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  Selecione um vendedor e um cargo para visualizar as metas
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
