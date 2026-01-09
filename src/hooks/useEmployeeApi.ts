import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { fetchEmployees, fetchEmployeeById } from "@/lib/api";
import type { Employee } from "@/lib/data";

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

  console.log(
    "🔍 useEmployees chamado - hasToken:",
    hasToken,
    "filters:",
    filters
  );

  return useQuery({
    queryKey: ["employees", filters?.startDate, filters?.endDate],
    queryFn: () => {
      console.log("🌐 Executando fetchEmployees com filtros:", filters);
      return fetchEmployees(filters);
    },
    staleTime: 0, // ⭐ Sempre refazer quando filtros mudarem
    retry: 1,
    enabled: hasToken,
    refetchOnWindowFocus: false,
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
