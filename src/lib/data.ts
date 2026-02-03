// Business rules and data types for the financial dashboard

export type CareerPath = "specialist" | "leadership";

export type CareerLevel =
  | "level1"
  | "level2"
  | "level3"
  | "level4"
  | "level5"
  | "tech_leader_1"
  | "tech_leader_2"
  | "contract_manager"
  | "unit_manager";

export type PerformanceStatus = "safe" | "at_risk" | "eligible_promotion";

export interface RoleConfig {
  id: CareerLevel;
  name: string;
  path: CareerPath;
  baseSalary: number;
  variableMin: number;
  variableMax: number;
  demandMin?: number;
  demandMax?: number;
  quarterlyStay?: number;
  quarterlyPromotion?: number;
  description: string;
}

export interface Employee {
  id: string;
  name: string;
  picture?: string;
  implantadosAtual?: number;
  assinadosAtual?: number;
  metaImplantados?: number;
  metaAssinados?: number;
  ultimaSincronizacao?: string;
  role: CareerLevel;
  path: CareerPath;
  currentDemand: number;
  quarterlyRevenue: number;
  tenure: number;
  teamSize?: number;
  promotedMembers?: number;
  unitRevenue?: number;
}

export interface Compensation {
  baseSalary: number;
  variablePay: number;
  teamBonus: number;
  promotionAddOn: number;
  unitAddOn: number;
  total: number;
}

export interface Benefit {
  name: string;
  description: string;
  coverage: string;
  eligible: boolean;
}

export type RoleMap = Record<CareerLevel, RoleConfig>;

export const ROLES: RoleMap = {
  level1: {
    id: "level1",
    name: "Nível 1",
    path: "specialist",
    baseSalary: 2500,
    variableMin: 5,
    variableMax: 10,
    demandMin: 5000,
    demandMax: 10000,
    description: "Entrada - Foco em onboarding e aprendizado",
  },

  level2: {
    id: "level2",
    name: "Nível 2",
    path: "specialist",
    baseSalary: 2500,
    variableMin: 10,
    variableMax: 10,
    description: "Transição para Nível 3 após Demanda 2",
  },
  level3: {
    id: "level3",
    name: "Nível 3",
    path: "specialist",
    baseSalary: 3000,
    variableMin: 10,
    variableMax: 40,
    demandMin: 6000,
    demandMax: 20000,
    quarterlyStay: 21000,
    quarterlyPromotion: 45000,
    description: "Intermediário - Crescimento de demanda",
  },
  level4: {
    id: "level4",
    name: "Nível 4 / Líder Técnico 1",
    path: "specialist",
    baseSalary: 4000,
    variableMin: 15,
    variableMax: 50,
    quarterlyStay: 45000,
    quarterlyPromotion: 60000,
    description: "Sênior - Alta performance",
  },
  level5: {
    id: "level5",
    name: "Nível 5 / Especialista",
    path: "specialist",
    baseSalary: 5000,
    variableMin: 15,
    variableMax: 60,
    demandMin: 10000,
    demandMax: 30000,
    quarterlyStay: 60000,
    description: "Expert - Referência técnica",
  },
  tech_leader_1: {
    id: "tech_leader_1",
    name: "Líder Técnico Nível 1",
    path: "leadership",
    baseSalary: 4000,
    variableMin: 15,
    variableMax: 50,
    quarterlyStay: 45000,
    quarterlyPromotion: 60000,
    description: "Liderança inicial - Bônus de equipe R$500-R$900",
  },
  tech_leader_2: {
    id: "tech_leader_2",
    name: "Líder Técnico Nível 2",
    path: "leadership",
    baseSalary: 5000,
    variableMin: 15,
    variableMax: 60,
    quarterlyStay: 60000,
    description: "Gestão de projetos complexos",
  },
  contract_manager: {
    id: "contract_manager",
    name: "Gerente de Contrato",
    path: "leadership",
    baseSalary: 7000,
    variableMin: 0,
    variableMax: 0,
    demandMin: 100000,
    demandMax: 200000,
    description: "Bônus R$2.000-R$8.000 - Promoção com R$1.2M em 6 meses",
  },
  unit_manager: {
    id: "unit_manager",
    name: "Gerente Técnico de Unidade",
    path: "leadership",
    baseSalary: 10000,
    variableMin: 0,
    variableMax: 0,
    description: "Add-ons por receita da unidade",
  },
};

// Unit manager add-ons
export const UNIT_ADDONS: { revenue: number; addon: number }[] = [
  { revenue: 200000, addon: 10000 },
  { revenue: 350000, addon: 21000 },
  { revenue: 500000, addon: 30000 },
];

// Health plan coverage by tenure
export const HEALTH_COVERAGE: { tenure: number; coverage: string }[] = [
  { tenure: 1, coverage: "Titular" },
  { tenure: 2, coverage: "Titular + 1 dependente" },
  { tenure: 3, coverage: "Titular + 2 dependentes" },
  { tenure: 4, coverage: "Titular + 3 dependentes" },
];

// Calculate variable pay
export function calculateVariablePay(role: RoleConfig, demand: number): number {
  if (role.demandMin === undefined || role.demandMax === undefined) {
    return 0;
  }

  const demandRange = role.demandMax - role.demandMin;
  const demandPosition = Math.min(
    Math.max(demand - role.demandMin, 0),
    demandRange,
  );
  const variableRange = role.variableMax - role.variableMin;
  const variablePercent =
    role.variableMin + (demandPosition / demandRange) * variableRange;

  return (variablePercent / 100) * demand;
}

// Calculate variable pay using production targets (implantados only)
// Segue a regra: Variável = X% a Y% da demanda (implantados)
// Usa faixas fixas de percentual baseadas no valor atingido
export function calculateVariableFromTargets(
  role: RoleConfig,
  implantadosAtual?: number,
  metaImplantados?: number,
  assinadosAtual?: number,
  metaAssinados?: number,
): number {
  // Usa apenas implantados como "demanda" para o cálculo
  const demandValue = implantadosAtual || 0;

  if (demandValue === 0) {
    return 0;
  }

  // Se o cargo não tem faixa de variável definida, retorna 0
  if (role.demandMin === undefined || role.demandMax === undefined) {
    return 0;
  }

  // Determina o percentual fixo baseado em faixas de valor
  let variablePercent = role.variableMin;

  // Se atingiu o máximo da demanda, usa o percentual máximo
  if (demandValue >= role.demandMax) {
    variablePercent = role.variableMax;
  }
  // Se está entre o mínimo e máximo, usa o percentual mínimo
  else if (demandValue >= role.demandMin) {
    variablePercent = role.variableMin;
  }
  // Se está abaixo do mínimo, usa o percentual mínimo
  else {
    variablePercent = role.variableMin;
  }

  // Variável = percentual fixo × valor de implantados
  return (variablePercent / 100) * demandValue;
}

// Calculate team bonus for technical leaders
export function calculateTeamBonus(
  teamSize: number,
  avgPerformance: number,
): number {
  // R$500-R$900 based on team performance
  const baseBonus = 500;
  const maxBonus = 900;
  const performanceMultiplier = Math.min(avgPerformance / 100, 1);
  return baseBonus + (maxBonus - baseBonus) * performanceMultiplier;
}

// Calculate promotion add-on
export function calculatePromotionAddOn(promotedCount: number): number {
  // R$200-R$400 per promoted member
  return promotedCount * 300; // Average
}

// Calculate unit manager add-on
export function calculateUnitAddOn(unitRevenue: number): number {
  for (let i = UNIT_ADDONS.length - 1; i >= 0; i--) {
    if (unitRevenue >= UNIT_ADDONS[i].revenue) {
      return UNIT_ADDONS[i].addon;
    }
  }
  return 0;
}

// Get performance status
export function getPerformanceStatus(
  quarterlyRevenue: number,
  quarterlyStay?: number,
  quarterlyPromotion?: number,
): PerformanceStatus {
  if (quarterlyPromotion && quarterlyRevenue >= quarterlyPromotion) {
    return "eligible_promotion";
  }
  if (quarterlyStay && quarterlyRevenue < quarterlyStay) {
    return "at_risk";
  }
  return "safe";
}

// Get health coverage based on tenure
export function getHealthCoverage(tenure: number): string {
  for (let i = HEALTH_COVERAGE.length - 1; i >= 0; i--) {
    if (tenure >= HEALTH_COVERAGE[i].tenure) {
      return HEALTH_COVERAGE[i].coverage;
    }
  }
  return "Não elegível";
}

// Calculate total compensation
export function calculateCompensation(
  employee: Employee,
  rolesMap?: RoleMap,
): Compensation {
  const role = (rolesMap ?? ROLES)[employee.role];
  const baseSalary = role.baseSalary;

  let variablePay = 0;

  // PRIORIDADE: Sempre usar implantados se disponível
  if (employee.implantadosAtual) {
    variablePay = calculateVariableFromTargets(
      role,
      employee.implantadosAtual,
      employee.metaImplantados,
      employee.assinadosAtual,
      employee.metaAssinados,
    );
  } else {
    // FALLBACK: Só usa currentDemand se não tiver implantados
    variablePay = calculateVariablePay(role, employee.currentDemand);
  }

  let teamBonus = 0;
  let promotionAddOn = 0;
  let unitAddOn = 0;

  if (employee.path === "leadership") {
    if (
      employee.teamSize &&
      ["tech_leader_1", "tech_leader_2"].includes(employee.role)
    ) {
      teamBonus = calculateTeamBonus(employee.teamSize, 80); // Assume 80% avg performance
    }
    if (employee.promotedMembers) {
      promotionAddOn = calculatePromotionAddOn(employee.promotedMembers);
    }
    if (employee.role === "unit_manager" && employee.unitRevenue) {
      unitAddOn = calculateUnitAddOn(employee.unitRevenue);
    }
  }

  return {
    baseSalary,
    variablePay,
    teamBonus,
    promotionAddOn,
    unitAddOn,
    total: baseSalary + variablePay + teamBonus + promotionAddOn + unitAddOn,
  };
}

// Format currency
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Format percentage
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
