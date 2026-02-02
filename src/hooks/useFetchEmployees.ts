import { useMemo } from "react";
import { useEmployees, useRoles } from "@/hooks/useEmployeeApi";
import { ROLES, type RoleMap, type Employee } from "@/lib/data";

export interface UseFetchEmployeesResult {
  employees: Employee[];
  isLoading: boolean;
  error: unknown;
  rolesMap: RoleMap;
}

export function useFetchEmployees(filters?: {
  startDate?: string;
  endDate?: string;
}): UseFetchEmployeesResult {
  const { data: rawEmployees, isLoading, error } = useEmployees(filters || {});
  const { data: rolesMapApi } = useRoles();

  const rolesMap = useMemo<RoleMap>(() => {
    return rolesMapApi ?? ROLES;
  }, [rolesMapApi]);

  const employees = useMemo(() => {
    return (rawEmployees ?? []).filter((e) => e && e.id);
  }, [rawEmployees]);

  return {
    employees,
    isLoading,
    error,
    rolesMap,
  };
}
