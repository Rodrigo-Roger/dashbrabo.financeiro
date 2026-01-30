const API_KEY =
  "i7YH9f-Or6D_2HUUR01IRnhH9sE2_bWCk13BYjZOuC-VF9yOPzJG1ZS_IwvIiSzE";
const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
  "http://127.0.0.1:8000/api";

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthUser {
  username: string;
}

// --- Gerenciamento de Tokens ---

export const getTokens = (): AuthTokens | null => {
  const tokens = localStorage.getItem("auth_tokens");
  return tokens ? JSON.parse(tokens) : null;
};

export const getAccessToken = (): string | null => {
  const tokens = getTokens();
  return tokens?.access || null;
};

export const getRefreshToken = (): string | null => {
  const tokens = getTokens();
  return tokens?.refresh || null;
};

export const saveTokens = (tokens: AuthTokens): void => {
  localStorage.setItem("auth_tokens", JSON.stringify(tokens));
};

export const saveUser = (user: AuthUser): void => {
  localStorage.setItem("auth_user", JSON.stringify(user));
};

export const getUser = (): AuthUser | null => {
  const user = localStorage.getItem("auth_user");
  return user ? JSON.parse(user) : null;
};

export const logout = (): void => {
  localStorage.removeItem("auth_tokens");
  localStorage.removeItem("auth_user");
};

export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

export const login = async (
  username: string,
  password: string,
): Promise<AuthTokens> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/v1/token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok && data?.access) {
      // Garante que salvamos access e refresh
      const tokens: AuthTokens = {
        access: data.access,
        refresh: data.refresh || data.access,
      };
      saveTokens(tokens);
      saveUser({ username });
      return tokens;
    } else {
      throw new Error(data.detail || "Credenciais inválidas");
    }
  } catch (err: any) {
    throw new Error(
      err.message || "Erro na autenticação. Verifique suas credenciais.",
    );
  }
};

export const getAuthHeaders = (): HeadersInit => {
  const token = getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};
