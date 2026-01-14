import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
  fetchEmployees,
  fetchEmployeeById,
  fetchRoles,
  type ApiRole,
} from "@/lib/api";
import { ROLES, type Employee, type RoleMap, type RoleConfig } from "@/lib/data";

/**
 * Hook para buscar lista de todos os funcionários
 * ⭐ IMPORTANTE: Backend filtra automaticamente por M2M
 * Só busca se estiver autenticado (tem token)
 */
export function useEmployees(filters?: {
  startDate?: string;
  endDate?: string;
}): UseQueryResult<Employee[], Error> {
  // Verifica se tem token (está logado)
  const hasToken = !!localStorage.getItem("auth_tokens");

  return useQuery({
    queryKey: ["employees", filters?.startDate, filters?.endDate],
    queryFn: () => fetchEmployees(filters),
    staleTime: 0, // Sempre refazer ao focar a janela para refletir mudanças do backend
    retry: 1,
    enabled: hasToken,
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook para buscar um funcionário específico pelo ID
 */
export function useEmployee(
  id: string | null
): UseQueryResult<Employee | null, Error> {
  return useQuery({
    queryKey: ["employee", id],
    queryFn: () => (id ? fetchEmployeeById(id) : Promise.resolve(null)),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });
}

/**
 * Hook para buscar lista de cargos
 */
export function useRoles(): UseQueryResult<RoleMap, Error> {
  const hasToken = !!localStorage.getItem("auth_tokens");

  return useQuery({
    queryKey: ["roles"],
    queryFn: () => fetchRoles(),
    select: (apiRoles) => mergeRolesWithDefaults(apiRoles),
    staleTime: 0,
    retry: 1,
    enabled: hasToken,
    refetchOnWindowFocus: true,
  });
}

function mergeRolesWithDefaults(apiRoles: ApiRole[]): RoleMap {
  const merged: RoleMap = { ...ROLES };

  apiRoles.forEach((role) => {
    const current = merged[role.id];
    if (!current) return;

    merged[role.id] = mergeRole(current, role);
  });

  return merged;
}

function mergeRole(current: RoleConfig, incoming: ApiRole): RoleConfig {
  return {
    id: current.id,
    name: incoming.name || current.name,
    path: incoming.path || current.path,
    baseSalary: incoming.baseSalary !== undefined ? incoming.baseSalary : current.baseSalary,
    variableMin: incoming.variableMin !== undefined ? incoming.variableMin : current.variableMin,
    variableMax: incoming.variableMax !== undefined ? incoming.variableMax : current.variableMax,
    demandMin: incoming.demandMin !== undefined ? incoming.demandMin : current.demandMin,
    demandMax: incoming.demandMax !== undefined ? incoming.demandMax : current.demandMax,
    quarterlyStay: incoming.quarterlyStay !== undefined ? incoming.quarterlyStay : current.quarterlyStay,
    quarterlyPromotion: incoming.quarterlyPromotion !== undefined ? incoming.quarterlyPromotion : current.quarterlyPromotion,
    description: incoming.description || current.description,
  };
}
