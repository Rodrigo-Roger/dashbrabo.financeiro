import api from "@/lib/api_config";
import type { CareerLevel, CareerPath } from "@/lib/data";

export interface ApiRole {
  id: CareerLevel;
  name: string;
  path: CareerPath;
  baseSalary: number;
  variableMin?: number;
  variableMax?: number;
  demandMin?: number;
  demandMax?: number;
  quarterlyStay?: number;
  quarterlyPromotion?: number;
  description?: string;
  isActive?: boolean;
}

/**
 * Busca lista de cargos da API
 */
export async function fetchRoles(): Promise<ApiRole[]> {
  const response = await api.get("/moskit/v1/roles/");
  const payload = response.data;

  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.results)
      ? payload.results
      : [];

  return list
    .map((role: Record<string, unknown>) => {
      const id = (role.id ||
        role.role_id ||
        role.slug ||
        role.pk ||
        "") as CareerLevel;
      const name = String(role.name ?? "");
      const path: CareerPath =
        role.path === "leadership" ? "leadership" : "specialist";

      return {
        id,
        name,
        path,
        baseSalary: Number(role.base_salary ?? role.baseSalary ?? 0),
        variableMin: numOrUndefined(role.variable_min ?? role.variableMin),
        variableMax: numOrUndefined(role.variable_max ?? role.variableMax),
        demandMin: numOrUndefined(role.demand_min ?? role.demandMin),
        demandMax: numOrUndefined(role.demand_max ?? role.demandMax),
        quarterlyStay: numOrUndefined(
          role.quarterly_stay ?? role.quarterlyStay,
        ),
        quarterlyPromotion: numOrUndefined(
          role.quarterly_promotion ?? role.quarterlyPromotion,
        ),
        description: role.description ? String(role.description) : undefined,
        isActive:
          role.is_active !== undefined
            ? Boolean(role.is_active)
            : role.isActive !== undefined
              ? Boolean(role.isActive)
              : undefined,
      } as ApiRole;
    })
    .filter((role: ApiRole) => role.id && role.name);
}

function numOrUndefined(value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}
