import { cn } from "@/lib/utils";
import { Briefcase, Code, Users, ChevronRight } from "lucide-react";
import { CareerPath, CareerLevel, ROLES, formatCurrency } from "@/lib/data";

interface CareerPathCardProps {
  currentLevel: CareerLevel;
  path: CareerPath;
  onLevelChange?: (level: CareerLevel) => void;
  className?: string;
}

const specialistLevels: CareerLevel[] = ['level1', 'level2', 'level3', 'level4', 'level5'];
const leadershipLevels: CareerLevel[] = ['tech_leader_1', 'tech_leader_2', 'contract_manager', 'unit_manager'];

export function CareerPathCard({ currentLevel, path, onLevelChange, className }: CareerPathCardProps) {
  const levels = path === 'specialist' ? specialistLevels : leadershipLevels;
  const currentIndex = levels.indexOf(currentLevel);
  
  return (
    <div className={cn("rounded-xl bg-card p-6 shadow-card", className)}>
      <div className="mb-6 flex items-center gap-3">
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg",
          path === 'specialist' ? 'bg-accent text-accent-foreground' : 'bg-primary text-primary-foreground'
        )}>
          {path === 'specialist' ? <Code className="h-5 w-5" /> : <Users className="h-5 w-5" />}
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            {path === 'specialist' ? 'Trilha Especialista' : 'Trilha Liderança'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {path === 'specialist' 
              ? 'Foco em resultados técnicos e profundidade'
              : 'Foco em resultados globais e equipe'
            }
          </p>
        </div>
      </div>
      
      <div className="relative">
        {/* Progress line */}
        <div className="absolute left-5 top-0 h-full w-0.5 bg-border" />
        
        <div className="space-y-4">
          {levels.map((level, index) => {
            const role = ROLES[level];
            const isActive = level === currentLevel;
            const isPast = index < currentIndex;
            const isFuture = index > currentIndex;
            
            return (
              <button
                key={level}
                onClick={() => onLevelChange?.(level)}
                className={cn(
                  "relative flex w-full items-center gap-4 rounded-lg p-3 text-left transition-all",
                  isActive && "bg-primary/10 ring-2 ring-primary",
                  !isActive && "hover:bg-muted/50",
                  isFuture && "opacity-50"
                )}
              >
                {/* Node */}
                <div className={cn(
                  "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2",
                  isActive && "border-primary bg-primary text-primary-foreground",
                  isPast && "border-success bg-success text-success-foreground",
                  isFuture && "border-border bg-background text-muted-foreground"
                )}>
                  {isPast ? (
                    <ChevronRight className="h-5 w-5" />
                  ) : (
                    <Briefcase className="h-5 w-5" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium truncate",
                    isActive ? "text-primary" : "text-foreground"
                  )}>
                    {role.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Base: {formatCurrency(role.baseSalary)}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-medium text-muted-foreground">
                    {role.variableMax > 0 ? `${role.variableMin}%-${role.variableMax}%` : '—'}
                  </p>
                  <p className="text-xs text-muted-foreground">variável</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
