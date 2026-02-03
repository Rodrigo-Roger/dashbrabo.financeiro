import api from "@/lib/api_config";
import type { Employee, CareerLevel, CareerPath } from "@/lib/data";

type ApiUnknown = Record<string, unknown>;

/**
 * Busca todos os vendedores/funcionários da API
 */
export async function fetchEmployees(filters?: {
  startDate?: string;
  endDate?: string;
}): Promise<Employee[]> {
  try {
    const response = await api.get("/moskit/v1/dashboard-summary/", {
      params: {
        start_date: filters?.startDate,
        end_date: filters?.endDate,
      },
    });
    return mapApiEmployeesToLocal(response.data);
  } catch (error: unknown) {
    const apiError = error as Record<string, unknown>;
    if (apiError?.response) {
      try {
        const fallbackResponse = await api.get("/moskit/v1/users/");
        return mapApiEmployeesToLocal(fallbackResponse.data);
      } catch (fallbackError: unknown) {
        const fallbackApiError = fallbackError as Record<string, unknown>;
        const fallbackResponse = fallbackApiError?.response as Record<
          string,
          unknown
        >;
        const fallbackData = fallbackResponse?.data as Record<string, unknown>;
        const detail = fallbackData?.detail as string | undefined;
        throw new Error(
          detail ||
            `Erro ao buscar vendedores: ${fallbackResponse?.status || "Unknown"}`,
        );
      }
    }
    throw error;
  }
}

/**
 * Busca um vendedor específico pelo ID
 */
export async function fetchEmployeeById(id: string): Promise<Employee> {
  const response = await api.get(`/moskit/v1/users/${id}/`);
  return mapApiEmployeeToLocal(response.data);
}

/**
 * Atualiza dados de um vendedor na API
 */
export async function updateEmployee(
  id: string,
  data: Partial<Employee>,
): Promise<void> {
  const payload: Record<string, unknown> = {};

  if (data.name !== undefined) payload.nome = data.name;
  if (data.role !== undefined) payload.role = data.role;
  if (data.path !== undefined) payload.path = data.path;
  if (data.implantadosAtual !== undefined)
    payload.implantados_atual = data.implantadosAtual;
  if (data.assinadosAtual !== undefined)
    payload.assinados_atual = data.assinadosAtual;
  if (data.metaImplantados !== undefined)
    payload.meta_implantados = data.metaImplantados;
  if (data.metaAssinados !== undefined)
    payload.meta_assinados = data.metaAssinados;
  if (data.teamSize !== undefined) payload.team_size = data.teamSize;
  if (data.promotedMembers !== undefined)
    payload.promoted_members = data.promotedMembers;
  if (data.unitRevenue !== undefined) payload.unit_revenue = data.unitRevenue;

  await api.put(`/moskit/v1/dashboard-summary/${id}/`, payload);
}

/**
 * Converte Moskit ID para UUID
 */
const moskitIdToUuidCache = new Map<string, string>();

export async function getMoskitUserUuid(moskitId: string): Promise<string> {
  if (moskitIdToUuidCache.has(moskitId)) {
    return moskitIdToUuidCache.get(moskitId)!;
  }
  try {
    const response = await api.get("/moskit/v1/users/", {
      params: { moskit_id: moskitId },
    });
    const data = response.data;
    const users = Array.isArray(data) ? data : data.results || [];
    if (users.length > 0) {
      const uuid = users[0].id;
      moskitIdToUuidCache.set(moskitId, uuid);
      return uuid;
    }
    return moskitId;
  } catch (error) {
    return moskitId;
  }
}

// --- Mappers ---

function mapApiEmployeeToLocal(apiData: ApiUnknown): Employee {
  const rawId =
    apiData.id ??
    apiData.user_id ??
    apiData.pk ??
    apiData.moskit_id ??
    apiData.username ??
    "";
  const id = String(rawId);

  const email = typeof apiData.email === "string" ? apiData.email : "";
  const name = String(
    apiData.nome ||
      apiData.name ||
      apiData.full_name ||
      apiData.username ||
      (email ? email.split("@")[0] : "") ||
      "",
  );

  const role = mapPerfilToRole(
    apiData.role || apiData.role_id || apiData.roleId || apiData.perfil,
  );

  const roleDetails = apiData.role_details as ApiUnknown | undefined;
  const roleDetailsAlt = apiData.roleDetails as ApiUnknown | undefined;
  const rolePathRaw =
    (apiData as ApiUnknown).role_path ??
    (apiData as ApiUnknown).rolePath ??
    roleDetails?.path ??
    roleDetailsAlt?.path ??
    (apiData as ApiUnknown).path;

  const path: CareerPath =
    rolePathRaw === "leadership"
      ? "leadership"
      : rolePathRaw === "specialist"
        ? "specialist"
        : isLeadershipRole(role)
          ? "leadership"
          : "specialist";

  return {
    id,
    name,
    picture: String(
      apiData.picture_url || apiData.picture || apiData.photo || "",
    ),
    implantadosAtual: Number(apiData.implantados_atual ?? 0),
    assinadosAtual: Number(apiData.assinados_atual ?? 0),
    metaImplantados: Number(apiData.meta_implantados ?? 0),
    metaAssinados: Number(apiData.meta_assinados ?? 0),
    ultimaSincronizacao: String(apiData.ultima_sincronizacao || ""),
    role,
    path,
    currentDemand: Number(
      apiData.current_demand || apiData.monthly_target || apiData.revenue || 0,
    ),
    quarterlyRevenue: Number(
      apiData.quarterly_revenue || apiData.total_revenue || apiData.sales || 0,
    ),
    tenure: Number(apiData.tenure || apiData.years_working || 0),
    teamSize:
      apiData.team_size || apiData.team
        ? Number(
            apiData.team_size ??
              (apiData.team && typeof apiData.team === "object"
                ? Object.keys(apiData.team as ApiUnknown).length
                : 0),
          )
        : undefined,
    promotedMembers:
      apiData.promoted_members !== undefined
        ? Number(apiData.promoted_members)
        : undefined,
    unitRevenue:
      apiData.unit_revenue !== undefined
        ? Number(apiData.unit_revenue)
        : undefined,
  };
}

function mapApiEmployeesToLocal(
  apiDataList: ApiUnknown[] | ApiUnknown,
): Employee[] {
  if (!Array.isArray(apiDataList)) {
    if (typeof apiDataList === "object" && apiDataList !== null) {
      let arrayData: ApiUnknown[] | null = null;
      const apiObj = apiDataList as ApiUnknown;

      if (Array.isArray(apiObj.results))
        arrayData = apiObj.results as ApiUnknown[];
      else if (Array.isArray(apiObj.data))
        arrayData = apiObj.data as ApiUnknown[];
      else if (Array.isArray(apiObj.items))
        arrayData = apiObj.items as ApiUnknown[];
      else {
        for (const value of Object.values(apiObj)) {
          if (Array.isArray(value)) {
            arrayData = value as ApiUnknown[];
            break;
          }
        }
      }

      if (arrayData && arrayData.length > 0) {
        return arrayData.map(mapApiEmployeeToLocal).filter((emp) => emp.id);
      }
    }
    return [];
  }
  return apiDataList.map(mapApiEmployeeToLocal).filter((emp) => emp.id);
}

function mapPerfilToRole(raw: unknown): CareerLevel {
  const value = String(raw ?? "").trim();
  const valueUpper = value.toUpperCase();

  const careerLevels: CareerLevel[] = [
    "level1",
    "level2",
    "level3",
    "level4",
    "level5",
    "tech_leader_1",
    "tech_leader_2",
    "contract_manager",
    "unit_manager",
  ];
  if (careerLevels.includes(value as CareerLevel)) {
    return value as CareerLevel;
  }

  const perfilMap: Record<string, CareerLevel> = {
    VENDEDOR: "level1",
    MASTER: "level5",
    LIDER: "tech_leader_1",
    LÍDER: "tech_leader_1",
    GERENTE: "unit_manager",
    "GERENTE CONTRATO": "contract_manager",
    CONTRACT_MANAGER: "contract_manager",
    TECNICO2: "tech_leader_2",
    TECNICO1: "tech_leader_1",
    ESPECIALISTA3: "level3",
    ESPECIALISTA4: "level4",
    ESPECIALISTA5: "level5",
  };

  return perfilMap[valueUpper] ?? "level1";
}

function isLeadershipRole(role: CareerLevel): boolean {
  return [
    "tech_leader_1",
    "tech_leader_2",
    "contract_manager",
    "unit_manager",
  ].includes(role);
}
