import { cn } from "@/lib/utils";
import { Heart, CheckCircle2, XCircle } from "lucide-react";
import { CareerLevel, getHealthCoverage } from "@/lib/data";

interface BenefitsCardProps {
  level: CareerLevel;
  tenure: number;
  className?: string;
}

const eligibleLevels: CareerLevel[] = ['level4', 'level5', 'tech_leader_1', 'tech_leader_2', 'contract_manager', 'unit_manager'];

export function BenefitsCard({ level, tenure, className }: BenefitsCardProps) {
  const isEligible = eligibleLevels.includes(level);
  const coverage = getHealthCoverage(tenure);
  
  return (
    <div className={cn("rounded-xl bg-card p-6 shadow-card", className)}>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger/10">
          <Heart className="h-5 w-5 text-danger" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Benefícios</h3>
          <p className="text-sm text-muted-foreground">Plano de saúde e vantagens</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Health Plan */}
        <div className={cn(
          "rounded-lg border p-4",
          isEligible ? "border-success/20 bg-success-muted" : "border-border bg-muted"
        )}>
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-foreground">Plano de Saúde</p>
              <p className="text-sm text-muted-foreground">Bronze Brasília PRO ENF</p>
            </div>
            {isEligible ? (
              <CheckCircle2 className="h-5 w-5 text-success" />
            ) : (
              <XCircle className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          
          {isEligible && (
            <div className="mt-3 rounded-md bg-card p-3">
              <p className="text-sm text-muted-foreground">Cobertura atual</p>
              <p className="font-semibold text-foreground">{coverage}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Empresa cobre 50% dos dependentes
              </p>
            </div>
          )}
          
          {!isEligible && (
            <p className="mt-2 text-sm text-muted-foreground">
              Disponível a partir do Nível 4
            </p>
          )}
        </div>
        
        {/* Tenure info */}
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">Tempo de empresa</p>
          <p className="text-2xl font-bold text-foreground">{tenure} {tenure === 1 ? 'ano' : 'anos'}</p>
          
          {isEligible && tenure < 4 && (
            <p className="mt-2 text-sm text-info">
              +1 dependente ao completar {tenure + 1} anos
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
