import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { fetchEmployees, fetchEmployeeById } from "@/lib/api";
import type { Employee } from "@/lib/data";

/**
 * Hook para buscar lista de todos os funcionários
 */
export function useEmployees(): UseQueryResult<Employee[], Error> {
  return useQuery({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1, // Tentar apenas 1 vez para evitar spam
    enabled: true,
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
