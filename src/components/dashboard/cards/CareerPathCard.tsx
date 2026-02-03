import { cn } from "@/lib/utils";
import { Code, Users, ChevronRight } from "lucide-react";
import {
  CareerPath,
  CareerLevel,
  ROLES,
  formatCurrency,
  type RoleMap,
} from "@/lib/data";

interface CareerPathCardProps {
  currentLevel: CareerLevel;
  path: CareerPath;
  onLevelChange?: (level: CareerLevel) => void;
  className?: string;
  rolesMap?: RoleMap;
}

const specialistLevels: CareerLevel[] = [
  "level1",
  "level2",
  "level3",
  "level4",
  "level5",
];
const leadershipLevels: CareerLevel[] = [
  "tech_leader_1",
  "tech_leader_2",
  "contract_manager",
  "unit_manager",
];

export function CareerPathCard({
  currentLevel,
  path,
  onLevelChange,
  className,
  rolesMap = ROLES,
}: CareerPathCardProps) {
  const levels = path === "specialist" ? specialistLevels : leadershipLevels;
  const currentIndex = levels.indexOf(currentLevel);

  return (
    <div
      className={cn("rounded-lg border border-border bg-card p-5", className)}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {path === "specialist" ? "Trilha Especialista" : "Trilha Liderança"}
        </h3>
        {path === "specialist" ? (
          <Code className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Users className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      <div className="relative">
        {/* Progress line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />

        <div className="space-y-1">
          {levels.map((level, index) => {
            const role = rolesMap[level];
            const isActive = level === currentLevel;
            const isPast = index < currentIndex;
            const isFuture = index > currentIndex;

            return (
              <button
                key={level}
                onClick={() => onLevelChange?.(level)}
                className={cn(
                  "relative flex w-full items-center gap-3 rounded px-2 py-2 text-left transition-colors",
                  isActive && "bg-primary/5",
                  !isActive && "hover:bg-secondary/50",
                  isFuture && "opacity-40"
                )}
              >
                {/* Node */}
                <div
                  className={cn(
                    "relative z-10 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2",
                    isActive && "border-primary bg-primary",
                    isPast && "border-success bg-success",
                    isFuture && "border-border bg-card"
                  )}
                >
                  {(isActive || isPast) && (
                    <ChevronRight className="h-3 w-3 text-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium truncate",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {role.name}
                  </p>
                </div>

                <span className="text-xs text-muted-foreground tabular-nums">
                  {formatCurrency(role.baseSalary)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
