const API_BASE_URL = "https://ms.moskit.montseguro.link/api";
const API_KEY = "i7YH9f-Or6D_2HUUR01IRnhH9sE2_bWCk13BYjZOuC-VF9yOPzJG1ZS_IwvIiSzE";

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthUser {
  username: string;
}

// Headers padrão para todas as requisições
export const getAuthHeaders = (): HeadersInit => {
  const tokens = getTokens();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY,
  };
  
  if (tokens?.access) {
    headers["Authorization"] = `Bearer ${tokens.access}`;
  }
  
  return headers;
};

// Login
export const login = async (username: string, password: string): Promise<AuthTokens> => {
  const response = await fetch(`${API_BASE_URL}/auth/v1/token/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY,
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Credenciais inválidas");
  }

  const tokens: AuthTokens = await response.json();
  saveTokens(tokens);
  saveUser({ username });
  
  return tokens;
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
export const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
};
