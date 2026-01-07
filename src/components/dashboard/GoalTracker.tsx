import { cn } from "@/lib/utils";
import { Target, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { ROLES, CareerLevel, formatCurrency, getPerformanceStatus } from "@/lib/data";
import { ProgressBar } from "./ProgressBar";
import { StatusBadge } from "./StatusBadge";

interface GoalTrackerProps {
  level: CareerLevel;
  quarterlyRevenue: number;
  className?: string;
}

export function GoalTracker({ level, quarterlyRevenue, className }: GoalTrackerProps) {
  const role = ROLES[level];
  const status = getPerformanceStatus(quarterlyRevenue, role.quarterlyStay, role.quarterlyPromotion);
  
  const hasGoals = role.quarterlyStay || role.quarterlyPromotion;
  
  return (
    <div className={cn("rounded-xl bg-card p-6 shadow-card", className)}>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
            <Target className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Metas Trimestrais</h3>
            <p className="text-sm text-muted-foreground">Acompanhamento de performance</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>
      
      {hasGoals ? (
        <div className="space-y-6">
          {/* Current Revenue */}
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">Receita Trimestral Atual</p>
            <p className="text-3xl font-bold text-foreground">{formatCurrency(quarterlyRevenue)}</p>
          </div>
          
          {/* Stay Goal */}
          {role.quarterlyStay && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {quarterlyRevenue >= role.quarterlyStay ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-warning" />
                  )}
                  <span className="text-sm font-medium text-foreground">Meta de Permanência</span>
                </div>
                <span className="text-sm font-semibold text-muted-foreground">
                  {formatCurrency(role.quarterlyStay)}
                </span>
              </div>
              <ProgressBar
                value={quarterlyRevenue}
                max={role.quarterlyStay}
                showValue
                size="md"
              />
              {quarterlyRevenue < role.quarterlyStay && (
                <p className="text-sm text-warning">
                  Faltam {formatCurrency(role.quarterlyStay - quarterlyRevenue)} para atingir
                </p>
              )}
            </div>
          )}
          
          {/* Promotion Goal */}
          {role.quarterlyPromotion && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {quarterlyRevenue >= role.quarterlyPromotion ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-info" />
                  )}
                  <span className="text-sm font-medium text-foreground">Meta de Promoção</span>
                </div>
                <span className="text-sm font-semibold text-muted-foreground">
                  {formatCurrency(role.quarterlyPromotion)}
                </span>
              </div>
              <ProgressBar
                value={quarterlyRevenue}
                max={role.quarterlyPromotion}
                showValue
                size="md"
              />
              {quarterlyRevenue >= role.quarterlyPromotion ? (
                <p className="text-sm text-success font-medium">
                  🎉 Elegível para promoção!
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Faltam {formatCurrency(role.quarterlyPromotion - quarterlyRevenue)} para promoção
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Target className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">
            Este cargo não possui metas trimestrais definidas
          </p>
        </div>
      )}
    </div>
  );
}
