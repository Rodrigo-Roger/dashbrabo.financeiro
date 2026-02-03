import api from "./api_config";
import type { CareerLevel, CareerPath, Employee } from "./data";

type ApiUnknown = Record<string, unknown>;

const moskitIdToUuidCache = new Map<string, string>();

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
 * Busca informações do usuário logado (perfil e permissões)
 */
export async function fetchCurrentUser(): Promise<{
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  perfil: "MASTER" | "GERENTE" | "LIDER" | "VENDEDOR" | string;
  moskit_id: string;
  nome_moskit: string;
  picture_url: string;
  authorized_users?: string[];
}> {
  // api.get injeta o token automaticamente via interceptor
  const response = await api.get("/auth/v1/auth/me/");
  const user = response.data;

  if (user.perfil === "MASTER") {
    user.authorized_users = [];
    return user;
  }

  if (!user.authorized_users) {
    try {
      // Busca permissões extras se necessário
      const permissionResponse = await api.get(
        `/moskit/v1/users/?authorized_for=${user.id}`,
      );

      const allowedUsers = permissionResponse.data;
      user.authorized_users = Array.isArray(allowedUsers)
        ? allowedUsers.map((u: ApiUnknown) => {
            const candidate = u.id ?? (u as ApiUnknown).moskit_id;
            return String(candidate ?? "");
          })
        : [];
    } catch (e) {
      user.authorized_users = [];
    }
  } else if (!Array.isArray(user.authorized_users)) {
    user.authorized_users = [];
  }

  return user;
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
    .map((role: ApiUnknown) => {
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
    // Fallback: Se falhar o dashboard, tenta endpoint /users/
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

export interface DiscountInstallment {
  id: string;
  installment_number: number;
  amount: number;
  reference_month: string;
  is_processed: boolean;
}

export interface Discount {
  id?: string;
  seller: string;
  discount_type: string;
  reference_month: string;
  amount: number;
  installments_count: number;
  notes?: string;
  is_active?: boolean;
  seller_name?: string;
  discount_type_name?: string;
  discount_type_code?: string;
  total_discount?: string;
  created_at?: string;
  updated_at?: string;
  installments?: DiscountInstallment[];
}

export interface DiscountType {
  id: string;
  code: string;
  name: string;
  discount_type: string;
  discount_type_display: string;
  fixed_amount: string | null;
  requires_quantity: boolean;
  is_active: boolean;
}

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

export async function fetchDiscounts(
  employeeIdOrMoskitId: string,
): Promise<Discount[]> {
  const response = await api.get("/moskit/v1/discounts/", {
    params: { seller: employeeIdOrMoskitId },
  });
  const data = response.data;
  return Array.isArray(data) ? data : data.results || [];
}

export async function getTotalDiscounts(employeeId: string): Promise<number> {
  try {
    const discounts = await fetchDiscounts(employeeId);
    return discounts.reduce((sum, discount) => {
      const amount = Number(discount.total_discount || 0);
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);
  } catch (error) {
    return 0;
  }
}

export async function createDiscount(discount: Discount): Promise<Discount> {
  const payload = Object.fromEntries(
    Object.entries(discount).filter(([, v]) => v !== undefined && v !== null),
  );
  const response = await api.post("/moskit/v1/discounts/", payload);
  return response.data;
}

export async function fetchDiscountTypes(): Promise<DiscountType[]> {
  const response = await api.get("/moskit/v1/discount-types/");
  const data = response.data;
  return Array.isArray(data) ? data : data.results || [];
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

function numOrUndefined(value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Busca histórico de pagamentos de um vendedor
 */
export async function fetchPaymentHistory(
  employeeId: string,
  months: number = 6,
): Promise<{ month: string; value: number }[]> {
  try {
    // Tentar buscar do endpoint de histórico se existir
    const response = await api.get(
      `/moskit/v1/payment-history/${employeeId}/`,
      {
        params: { months },
      },
    );
    return response.data;
  } catch {
    // Fallback: calcular baseado nos dados do dashboard-summary
    try {
      const monthsData = [];
      const currentDate = new Date();

      for (let i = months - 1; i >= 0; i--) {
        const monthDate = new Date(currentDate);
        monthDate.setMonth(monthDate.getMonth() - i);

        const startDate = new Date(
          monthDate.getFullYear(),
          monthDate.getMonth(),
          1,
        );
        const endDate = new Date(
          monthDate.getFullYear(),
          monthDate.getMonth() + 1,
          0,
        );

        const response = await api.get("/moskit/v1/dashboard-summary/", {
          params: {
            seller: employeeId,
            start_date: startDate.toISOString().split("T")[0],
            end_date: endDate.toISOString().split("T")[0],
          },
        });

        const employees = mapApiEmployeesToLocal(response.data);
        const employee = employees.find((e) => e.id === employeeId);

        if (employee) {
          const compensation = await import("./data").then((m) =>
            m.calculateCompensation(employee, m.ROLES),
          );

          // Buscar descontos do período e calcular apenas as parcelas do mês
          let monthDiscounts = 0;
          try {
            const discounts = await fetchDiscounts(employeeId);
            const filterStart = startDate;
            const filterEnd = endDate;

            discounts.forEach((discount) => {
              if (!discount.created_at) return;

              const createdDate = new Date(discount.created_at);
              const installmentsCount = discount.installments_count || 1;
              const totalAmount = Number(discount.total_discount || 0);
              const installmentValue = totalAmount / installmentsCount;

              // Calcular quais parcelas caem neste mês
              for (let j = 0; j < installmentsCount; j++) {
                const installmentDate = new Date(createdDate);
                installmentDate.setMonth(installmentDate.getMonth() + j);

                const installmentMonth = new Date(
                  installmentDate.getFullYear(),
                  installmentDate.getMonth(),
                  1,
                );
                const installmentMonthEnd = new Date(
                  installmentDate.getFullYear(),
                  installmentDate.getMonth() + 1,
                  0,
                );

                // Verificar se há sobreposição entre o mês e a parcela
                if (
                  installmentMonth <= filterEnd &&
                  installmentMonthEnd >= filterStart
                ) {
                  monthDiscounts += installmentValue;
                }
              }
            });
          } catch {
            // Se falhar ao buscar descontos, continua sem descontos
          }

          monthsData.push({
            month: monthDate.toLocaleDateString("pt-BR", { month: "short" }),
            value: compensation.total - monthDiscounts,
          });
        } else {
          monthsData.push({
            month: monthDate.toLocaleDateString("pt-BR", { month: "short" }),
            value: 0,
          });
        }
      }

      return monthsData;
    } catch {
      // Se tudo falhar, retornar dados vazios
      return [];
    }
  }
}
