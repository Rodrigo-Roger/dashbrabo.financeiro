import { getAuthHeaders } from "./auth";
import type { Employee, CareerLevel } from "./data";

const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
  "http://127.0.0.1:8000/api";

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
  try {
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

    console.log("🔍 Buscando informações do usuário logado...");
    console.log("📋 Headers sendo enviados:", headers);
    console.log("📋 Token encontrado:", !!accessToken);

    const response = await fetch(`${API_BASE_URL}/auth/v1/auth/me/`, {
      method: "GET",
      headers,
    });

    console.log("📥 Status da resposta:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ Erro na API:", errorData);
      throw new Error(`Erro ao buscar usuário: ${response.status}`);
    }

    const user = await response.json();
    console.log("👤 Dados do usuário:", user);

    // Se o usuário é MASTER, retorna array vazio (vê todos)
    // Caso contrário, usa authorized_users que vem do Django
    if (user.perfil === "MASTER") {
      user.authorized_users = [];
      console.log("🔓 MASTER - acesso a todos os vendedores");
      return user;
    }

    // Verificar se authorized_users já vem na resposta do Django
    if (!user.authorized_users) {
      console.log(
        "⚠️ authorized_users não retornou do Django, tentando buscar via API..."
      );

      // Para outros perfis, tenta buscar a lista de vendedores permitidos
      try {
        // Usar apenas Bearer token para evitar CORS com X-API-Key
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

        console.log("🔐 Buscando usuários permitidos para ID:", user.id);
        const permissionResponse = await fetch(
          `${API_BASE_URL}/moskit/v1/users/?authorized_for=${user.id}`,
          {
            method: "GET",
            headers: permissionHeaders,
          }
        );

        if (permissionResponse.ok) {
          const allowedUsers = await permissionResponse.json();
          user.authorized_users = Array.isArray(allowedUsers)
            ? allowedUsers.map((u: any) => String(u.id || u.moskit_id))
            : [];
          console.log(
            "✅ Usuários permitidos encontrados (como strings):",
            user.authorized_users
          );
        } else {
          console.warn(
            "⚠️ Endpoint de usuários permitidos retornou status:",
            permissionResponse.status
          );
          user.authorized_users = [];
        }
      } catch (e) {
        console.warn("⚠️ Não foi possível buscar usuários permitidos:", e);
        user.authorized_users = [];
      }
    } else {
      // authorized_users já veio do Django
      console.log(
        "✅ authorized_users retornado do Django:",
        user.authorized_users
      );
      // Garantir que é um array
      if (!Array.isArray(user.authorized_users)) {
        user.authorized_users = [];
      }
    }

    return user;
  } catch (error) {
    console.error("❌ Erro ao buscar usuário logado:", error);
    throw error;
  }
}

/**
 * Busca todos os vendedores/funcionários da API
 * ⭐ IMPORTANTE: Backend filtra automaticamente por M2M
 * - Master vê TODOS os vendedores
 * - Outros perfis veem APENAS seus vendedores relacionados
 */
export async function fetchEmployees(filters?: {
  startDate?: string;
  endDate?: string;
}): Promise<Employee[]> {
  try {
    console.log("🔍 Iniciando busca de vendedores (filtrado por backend)...");

    // Recupera token dos auth_tokens (não access_token direto)
    const storedTokens = localStorage.getItem("auth_tokens");
    let accessToken = "";

    if (storedTokens) {
      try {
        const parsed = JSON.parse(storedTokens);
        accessToken = parsed.access || "";
        console.log(
          "✅ Token recuperado de auth_tokens (primeiros 20 chars):",
          accessToken.substring(0, 20) + "..."
        );
      } catch (e) {
        console.warn("⚠️ Não foi possível parsear auth_tokens:", e);
      }
    } else {
      console.warn("⚠️ auth_tokens não encontrado no localStorage");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    } else {
      console.warn("⚠️ Nenhum token disponível para autenticação");
    }

    const url = new URL(`${API_BASE_URL}/moskit/v1/dashboard-summary/`);
    if (filters?.startDate) {
      url.searchParams.set("start_date", filters.startDate);
    }
    if (filters?.endDate) {
      url.searchParams.set("end_date", filters.endDate);
    }

    console.log("📍 Tentando URL dashboard-summary:", url.toString());
    console.log("📋 Com autenticação:", !!accessToken);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    console.log(
      "📥 Status dashboard-summary:",
      response.status,
      response.statusText
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ Dashboard-summary falhou:", response.status, errorData);

      // Se falhar, tenta fallback com /users/ (endpoint que sempre existe)
      console.log("⚠️ Tentando fallback para /moskit/v1/users/");
      const fallbackResponse = await fetch(`${API_BASE_URL}/moskit/v1/users/`, {
        method: "GET",
        headers,
      });

      console.log("📥 Status fallback /users/:", fallbackResponse.status);

      if (!fallbackResponse.ok) {
        const fallbackError = await fallbackResponse.json().catch(() => ({}));
        console.error(
          "❌ Fallback também falhou:",
          fallbackResponse.status,
          fallbackError
        );
        throw new Error(
          fallbackError.detail ||
            `Erro ao buscar vendedores: ${response.status}`
        );
      }

      const fallbackData = await fallbackResponse.json();
      console.log(
        "✅ Dados do fallback:",
        Array.isArray(fallbackData)
          ? `${fallbackData.length} vendedores`
          : fallbackData
      );
      const result = mapApiEmployeesToLocal(fallbackData);
      console.log("✅ Vendedores mapeados (fallback):", result.length, "itens");
      return result;
    }

    const data = await response.json();
    console.log(
      "✅ Dashboard-summary retornou:",
      Array.isArray(data) ? `${data.length} vendedores` : typeof data
    );
    console.log(
      "📊 Resposta completa (primeiros 500 chars):",
      JSON.stringify(data).substring(0, 500)
    );
    console.log(
      "📊 Tipo da resposta:",
      typeof data,
      "É array?",
      Array.isArray(data)
    );

    // Mapear resposta da API para o formato esperado
    const result = mapApiEmployeesToLocal(data);
    console.log("✅ Vendedores mapeados:", result.length, "itens");
    return result;
  } catch (error) {
    console.error("❌ Erro ao buscar funcionários:", error);
    throw error;
  }
}

/**
 * Busca um vendedor específico pelo ID
 */
export async function fetchEmployeeById(id: string): Promise<Employee> {
  try {
    const response = await fetch(`${API_BASE_URL}/moskit/v1/users/${id}/`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Erro ao buscar vendedor: ${response.status}`
      );
    }

    const data = await response.json();
    return mapApiEmployeeToLocal(data);
  } catch (error) {
    console.error("Erro ao buscar funcionário:", error);
    throw error;
  }
}

/**
 * Mapeia um funcionário da API para o formato local
 * Ajuste os campos conforme a resposta da sua API
 */
function mapApiEmployeeToLocal(apiData: Record<string, unknown>): Employee {
  // Tentar extrair ID de várias possíveis localizações
  const id = String(apiData.id ?? apiData.user_id ?? apiData.pk ?? "");

  // Tentar extrair nome de várias possíveis localizações
  const name = String(
    apiData.nome ||
      apiData.name ||
      apiData.full_name ||
      apiData.username ||
      apiData.email?.split("@")[0] ||
      ""
  );

  console.log("🔍 Mapeando usuário:", { id, name, apiData });

  return {
    id,
    name,
    picture: String(
      apiData.picture_url || apiData.picture || apiData.photo || ""
    ),
    implantadosAtual: Number((apiData as any).implantados_atual ?? 0),
    assinadosAtual: Number((apiData as any).assinados_atual ?? 0),
    metaImplantados: Number((apiData as any).meta_implantados ?? 0),
    metaAssinados: Number((apiData as any).meta_assinados ?? 0),
    ultimaSincronizacao: String((apiData as any).ultima_sincronizacao || ""),
    role: (apiData.role || "level1") as CareerLevel,
    path:
      apiData.path === "leadership" || apiData.is_manager
        ? "leadership"
        : "specialist",
    currentDemand: Number(
      apiData.current_demand || apiData.monthly_target || apiData.revenue || 0
    ),
    quarterlyRevenue: Number(
      apiData.quarterly_revenue || apiData.total_revenue || apiData.sales || 0
    ),
    tenure: Number(apiData.tenure || apiData.years_working || 0),
    teamSize:
      apiData.team_size || apiData.team
        ? Number(apiData.team_size ?? Object.keys(apiData.team || {}).length)
        : undefined,
    promotedMembers: apiData.promoted_members
      ? Number(apiData.promoted_members)
      : undefined,
    unitRevenue: apiData.unit_revenue
      ? Number(apiData.unit_revenue)
      : undefined,
  };
}

/**
 * Mapeia lista de funcionários da API para formato local
 */
function mapApiEmployeesToLocal(
  apiDataList: Record<string, unknown>[] | Record<string, unknown>
): Employee[] {
  // Se não é array, tenta extrair array de propriedades comuns
  if (!Array.isArray(apiDataList)) {
    console.warn("⚠️ Resposta não é um array direto:", typeof apiDataList);

    if (typeof apiDataList === "object" && apiDataList !== null) {
      // Tenta propriedades comuns que APIs paginated usam
      let arrayData: any[] | null = null;

      if (Array.isArray((apiDataList as any).results)) {
        arrayData = (apiDataList as any).results;
        console.log(
          "✅ Array encontrado em propriedade 'results':",
          arrayData.length
        );
      } else if (Array.isArray((apiDataList as any).data)) {
        arrayData = (apiDataList as any).data;
        console.log(
          "✅ Array encontrado em propriedade 'data':",
          arrayData.length
        );
      } else if (Array.isArray((apiDataList as any).items)) {
        arrayData = (apiDataList as any).items;
        console.log(
          "✅ Array encontrado em propriedade 'items':",
          arrayData.length
        );
      } else {
        // Procura por qualquer propriedade que seja um array
        for (const [key, value] of Object.entries(apiDataList)) {
          if (Array.isArray(value)) {
            arrayData = value;
            console.log(
              `✅ Array encontrado em propriedade '${key}':`,
              arrayData.length
            );
            break;
          }
        }
      }

      if (arrayData && arrayData.length > 0) {
        return arrayData.map(mapApiEmployeeToLocal).filter((emp) => emp.id);
      }
    }

    console.warn("⚠️ Nenhum array encontrado na resposta");
    return [];
  }

  console.log(`📊 Mapeando ${apiDataList.length} usuários...`);
  return apiDataList.map(mapApiEmployeeToLocal).filter((emp) => emp.id);
}

/**
 * Atualiza dados de um vendedor na API
 */
export async function updateEmployee(
  id: string,
  data: Partial<Employee>
): Promise<Employee> {
  try {
    const response = await fetch(`${API_BASE_URL}/moskit/v1/users/${id}/`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Erro ao atualizar vendedor: ${response.status}`
      );
    }

    const updated = await response.json();
    return mapApiEmployeeToLocal(updated);
  } catch (error) {
    console.error("Erro ao atualizar funcionário:", error);
    throw error;
  }
}
