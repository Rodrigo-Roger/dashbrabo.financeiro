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
    <div className={cn("rounded-lg border border-border bg-card p-5", className)}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Metas Trimestrais
        </h3>
        <StatusBadge status={status} />
      </div>
      
      {hasGoals ? (
        <div className="space-y-5">
          {/* Current Revenue */}
          <div className="rounded-md bg-secondary/50 p-3">
            <p className="text-xs text-muted-foreground mb-0.5">Receita Atual</p>
            <p className="text-xl font-semibold text-foreground">{formatCurrency(quarterlyRevenue)}</p>
          </div>
          
          {/* Stay Goal */}
          {role.quarterlyStay && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5">
                  {quarterlyRevenue >= role.quarterlyStay ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                  )}
                  <span className="text-muted-foreground">Permanência</span>
                </div>
                <span className="font-medium text-foreground">
                  {formatCurrency(role.quarterlyStay)}
                </span>
              </div>
              <ProgressBar
                value={quarterlyRevenue}
                max={role.quarterlyStay}
                size="sm"
              />
            </div>
          )}
          
          {/* Promotion Goal */}
          {role.quarterlyPromotion && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5">
                  {quarterlyRevenue >= role.quarterlyPromotion ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  ) : (
                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  )}
                  <span className="text-muted-foreground">Promoção</span>
                </div>
                <span className="font-medium text-foreground">
                  {formatCurrency(role.quarterlyPromotion)}
                </span>
              </div>
              <ProgressBar
                value={quarterlyRevenue}
                max={role.quarterlyPromotion}
                size="sm"
              />
              {quarterlyRevenue >= role.quarterlyPromotion && (
                <p className="text-xs text-success font-medium">
                  Elegível para promoção
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Target className="h-8 w-8 text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">
            Sem metas definidas
          </p>
        </div>
      )}
    </div>
  );
}
