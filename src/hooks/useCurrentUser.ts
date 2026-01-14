import { useQuery } from "@tanstack/react-query";
import { fetchCurrentUser } from "@/lib/api";

/**
 * Hook para buscar informações do usuário logado
 */
export function useCurrentUser() {
  const hasToken = !!localStorage.getItem("auth_tokens");

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
    enabled: hasToken,
  });
}
