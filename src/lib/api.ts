import { getAuthHeaders } from "./auth";
import type { CareerLevel, CareerPath, Employee } from "./data";

type ApiUnknown = Record<string, unknown>;

const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
  "http://127.0.0.1:8000/api";

// Cache de mapeamento moskit_id → UUID
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
  authorized_users?: string[]; // IDs dos vendedores que pode ver
}> {
  // Obter token dos tokens salvos (não de access_token direto)
  const token = localStorage.getItem("auth_tokens");
  let accessToken = "";

  if (token) {
    const tokens = JSON.parse(token);
    accessToken = tokens.access;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/auth/v1/auth/me/`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Erro ao buscar usuário: ${response.status}`);
  }

  const user = await response.json();

  if (user.perfil === "MASTER") {
    user.authorized_users = [];
    return user;
  }

  if (!user.authorized_users) {
    try {
      const token = localStorage.getItem("auth_tokens");
      let accessToken = "";

      if (token) {
        const tokens = JSON.parse(token);
        accessToken = tokens.access;
      }

      const permissionHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        permissionHeaders["Authorization"] = `Bearer ${accessToken}`;
      }

      const permissionResponse = await fetch(
        `${API_BASE_URL}/moskit/v1/users/?authorized_for=${user.id}`,
        {
          method: "GET",
          headers: permissionHeaders,
        },
      );

      if (permissionResponse.ok) {
        const allowedUsers = await permissionResponse.json();
        user.authorized_users = Array.isArray(allowedUsers)
          ? allowedUsers.map((u: ApiUnknown) => {
              const candidate = u.id ?? (u as ApiUnknown).moskit_id;
              return String(candidate ?? "");
            })
          : [];
      } else {
        user.authorized_users = [];
      }
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
  const response = await fetch(`${API_BASE_URL}/moskit/v1/roles/`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Erro ao buscar cargos: ${response.status}`,
    );
  }

  const payload = await response.json();

  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.results)
      ? payload.results
      : [];

  return list
    .map((role) => {
      const r = role as ApiUnknown;
      const id = (r.id || r.role_id || r.slug || r.pk || "") as CareerLevel;
      const name = String(r.name ?? "");
      const path: CareerPath =
        r.path === "leadership" ? "leadership" : "specialist";

      const baseSalary = Number(r.base_salary ?? r.baseSalary ?? 0);
      const variableMin = numOrUndefined(r.variable_min ?? r.variableMin);
      const variableMax = numOrUndefined(r.variable_max ?? r.variableMax);
      const demandMin = numOrUndefined(r.demand_min ?? r.demandMin);
      const demandMax = numOrUndefined(r.demand_max ?? r.demandMax);
      const quarterlyStay = numOrUndefined(r.quarterly_stay ?? r.quarterlyStay);
      const quarterlyPromotion = numOrUndefined(
        r.quarterly_promotion ?? r.quarterlyPromotion,
      );

      return {
        id,
        name,
        path,
        baseSalary,
        variableMin,
        variableMax,
        demandMin,
        demandMax,
        quarterlyStay,
        quarterlyPromotion,
        description: r.description ? String(r.description) : undefined,
        isActive:
          r.is_active !== undefined
            ? Boolean(r.is_active)
            : r.isActive !== undefined
              ? Boolean(r.isActive)
              : undefined,
      } as ApiRole;
    })
    .filter((role) => role.id && role.name);
}

/**
 * Busca todos os vendedores/funcionários da API
 * ⭐ IMPORTANTE: Backend filtra automaticamente por M2M
 * - Master vê TODOS os vendedores
 * - Outros perfis veem APENAS seus vendedores relacionados
 *
 * 📅 FILTRO POR DATA DE FECHAMENTO:
 * - Usa close_date (data de fechamento dos deals/implantados)
 * - Reflete nos valores de implantados_atual
 * - Impacta cálculo da variável dos vendedores
 */
export async function fetchEmployees(filters?: {
  startDate?: string;
  endDate?: string;
}): Promise<Employee[]> {
  const storedTokens = localStorage.getItem("auth_tokens");
  let accessToken = "";

  if (storedTokens) {
    try {
      const parsed = JSON.parse(storedTokens);
      accessToken = parsed.access || "";
    } catch (e) {
      // ignore malformed tokens and continue without auth
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const url = new URL(`${API_BASE_URL}/moskit/v1/dashboard-summary/`);
  if (filters?.startDate) {
    url.searchParams.set("start_date", filters.startDate);
  }
  if (filters?.endDate) {
    url.searchParams.set("end_date", filters.endDate);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    // Se falhar, tenta fallback com /users/ (endpoint que sempre existe)
    const fallbackResponse = await fetch(`${API_BASE_URL}/moskit/v1/users/`, {
      method: "GET",
      headers,
    });

    if (!fallbackResponse.ok) {
      const fallbackError = await fallbackResponse.json().catch(() => ({}));
      throw new Error(
        fallbackError.detail || `Erro ao buscar vendedores: ${response.status}`,
      );
    }

    const fallbackData = await fallbackResponse.json();
    return mapApiEmployeesToLocal(fallbackData);
  }

  const data = await response.json();
  return mapApiEmployeesToLocal(data);
}

/**
 * Busca um vendedor específico pelo ID
 */
export async function fetchEmployeeById(id: string): Promise<Employee> {
  const response = await fetch(`${API_BASE_URL}/moskit/v1/users/${id}/`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Erro ao buscar vendedor: ${response.status}`,
    );
  }

  const data = await response.json();
  return mapApiEmployeeToLocal(data);
}

/**
 * Mapeia um funcionário da API para o formato local
 * Ajuste os campos conforme a resposta da sua API
 */
function mapApiEmployeeToLocal(apiData: ApiUnknown): Employee {
  // Tentar extrair ID de várias possíveis localizações (fallback para moskit_id/username)
  const rawId =
    apiData.id ??
    apiData.user_id ??
    apiData.pk ??
    apiData.moskit_id ??
    apiData.username ??
    "";
  const id = String(rawId);

  // Tentar extrair nome de várias possíveis localizações
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

/**
 * Mapeia lista de funcionários da API para formato local
 */
function mapApiEmployeesToLocal(
  apiDataList: ApiUnknown[] | ApiUnknown,
): Employee[] {
  // Se não é array, tenta extrair array de propriedades comuns
  if (!Array.isArray(apiDataList)) {
    if (typeof apiDataList === "object" && apiDataList !== null) {
      // Tenta propriedades comuns que APIs paginated usam
      let arrayData: ApiUnknown[] | null = null;

      const apiObj = apiDataList as ApiUnknown;

      if (Array.isArray(apiObj.results)) {
        arrayData = apiObj.results as ApiUnknown[];
      } else if (Array.isArray(apiObj.data)) {
        arrayData = apiObj.data as ApiUnknown[];
      } else if (Array.isArray(apiObj.items)) {
        arrayData = apiObj.items as ApiUnknown[];
      } else {
        // Procura por qualquer propriedade que seja um array
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

  // Se já vier um slug válido, mantém
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

  // Mapeia perfis comuns vindos do backend para os cargos do front
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
 * Atualiza dados de um vendedor na API
 */
export async function updateEmployee(
  id: string,
  data: Partial<Employee>,
): Promise<void> {
  const payload: Record<string, unknown> = {};

  // Mapeia campos do frontend para backend
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

  const response = await fetch(
    `${API_BASE_URL}/moskit/v1/dashboard-summary/${id}/`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Erro ao atualizar vendedor: ${response.status}`,
    );
  }

  // Ignora a resposta - o refetch vai trazer os dados completos
  await response.json();
}

/**
 * Interface para descontos
 */
export interface DiscountInstallment {
  id: string;
  installment_number: number;
  amount: number;
  reference_month: string; // YYYY-MM-DD
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

/**
 * Converte moskit_id para UUID do UserMoskit
 * Usa cache para evitar requisições múltiplas
 */
export async function getMoskitUserUuid(moskitId: string): Promise<string> {
  // Verificar cache
  if (moskitIdToUuidCache.has(moskitId)) {
    return moskitIdToUuidCache.get(moskitId)!;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/moskit/v1/users/?moskit_id=${moskitId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      },
    );

    if (!response.ok) {
      return moskitId;
    }

    const data = await response.json();
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

/**
 * Busca todos os descontos de um funcionário
 * Converte moskit_id para UUID se necessário
 */
export async function fetchDiscounts(
  employeeIdOrMoskitId: string,
): Promise<Discount[]> {
  const response = await fetch(
    `${API_BASE_URL}/moskit/v1/discounts/?seller=${employeeIdOrMoskitId}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Erro ao buscar descontos: ${response.status}`,
    );
  }

  const data = await response.json();
  const discounts = Array.isArray(data) ? data : data.results || [];

  return discounts;
}

/**
 * Calcula o total de descontos para um vendedor
 */
export async function getTotalDiscounts(employeeId: string): Promise<number> {
  try {
    const discounts = await fetchDiscounts(employeeId);
    const total = discounts.reduce((sum, discount) => {
      const amount = Number(discount.total_discount || 0);
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);
    return total;
  } catch (error) {
    return 0;
  }
}

/**
 * Cria um novo desconto
 */
export async function createDiscount(discount: Discount): Promise<Discount> {
  const payload = Object.fromEntries(
    Object.entries(discount).filter(([, v]) => v !== undefined && v !== null),
  );

  const response = await fetch(`${API_BASE_URL}/moskit/v1/discounts/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail ||
        JSON.stringify(errorData) ||
        `Erro ao criar desconto: ${response.status}`,
    );
  }

  const result = await response.json();
  return result;
}

/**
 * Interface para tipos de desconto
 */
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

/**
 * Busca os tipos de desconto disponíveis
 */
export async function fetchDiscountTypes(): Promise<DiscountType[]> {
  const response = await fetch(`${API_BASE_URL}/moskit/v1/discount-types/`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail ||
        `Erro ao buscar tipos de desconto: ${response.status}`,
    );
  }

  const data = await response.json();
  return Array.isArray(data) ? data : data.results || [];
}
