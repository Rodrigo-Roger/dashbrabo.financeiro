import { supabase } from "@/integrations/supabase/client";

const API_KEY =
  "i7YH9f-Or6D_2HUUR01IRnhH9sE2_bWCk13BYjZOuC-VF9yOPzJG1ZS_IwvIiSzE";
const API_BASE_URL = "https://ms.moskit.montseguro.link/api";

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthUser {
  username: string;
}

// Headers padrão para todas as requisições à API externa
export const getAuthHeaders = (): HeadersInit => {
  const tokens = getTokens();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // ⭐ Usar APENAS Bearer token, sem X-API-Key
  if (tokens?.access) {
    headers["Authorization"] = `Bearer ${tokens.access}`;
  }

  return headers;
};

// Login via Edge Function ou API com workaround
export const login = async (
  username: string,
  password: string
): Promise<AuthTokens> => {
  console.log("🔍 Iniciando login para:", username);

  // Tentar primeiro com Edge Function
  try {
    console.log("📤 Tentando Edge Function auth-proxy...");
    const { data, error } = await supabase.functions.invoke("auth-proxy", {
      body: { username, password },
    });

    if (!error && data?.access) {
      console.log("✅ Login via Edge Function bem-sucedido!");
      const tokens: AuthTokens = data;
      saveTokens(tokens);
      saveUser({ username });
      return tokens;
    }
  } catch (err) {
    console.log("ℹ️ Edge Function não disponível, tentando alternativa...");
  }

  // Fallback: Tentar API direta com alternativas
  try {
    console.log("📤 Tentando API com Bearer token no header...");
    const response = await fetch(`${API_BASE_URL}/auth/v1/token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Login bem-sucedido!");
      const tokens: AuthTokens = data;
      saveTokens(tokens);
      saveUser({ username });
      return tokens;
    }
  } catch (err) {
    console.log("ℹ️ Tentativa com Bearer também falhou...");
  }

  // Última tentativa: Sem header customizado
  try {
    console.log("📤 Tentativa final sem header customizado...");
    const response = await fetch(`${API_BASE_URL}/auth/v1/token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, api_key: API_KEY }),
    });

    const data = await response.json();

    if (response.ok && data?.access) {
      console.log("✅ Login bem-sucedido!");
      const tokens: AuthTokens = data;
      saveTokens(tokens);
      saveUser({ username });
      return tokens;
    } else {
      throw new Error(data.detail || "Credenciais inválidas");
    }
  } catch (err) {
    console.error("❌ Erro completo no login:", err);
    throw new Error("Erro na autenticação. Verifique suas credenciais.");
  }
};

// Logout
export const logout = (): void => {
  localStorage.removeItem("auth_tokens");
  localStorage.removeItem("auth_user");
};

// Salvar tokens
export const saveTokens = (tokens: AuthTokens): void => {
  localStorage.setItem("auth_tokens", JSON.stringify(tokens));
};

// Obter tokens
export const getTokens = (): AuthTokens | null => {
  const tokens = localStorage.getItem("auth_tokens");
  return tokens ? JSON.parse(tokens) : null;
};

// Salvar usuário
export const saveUser = (user: AuthUser): void => {
  localStorage.setItem("auth_user", JSON.stringify(user));
};

// Obter usuário
export const getUser = (): AuthUser | null => {
  const user = localStorage.getItem("auth_user");
  return user ? JSON.parse(user) : null;
};

// Verificar se está autenticado
export const isAuthenticated = (): boolean => {
  const tokens = getTokens();
  return !!tokens?.access;
};

// Fazer requisição autenticada
export const authFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
};
