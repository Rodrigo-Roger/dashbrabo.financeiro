import axios from "axios";
import { getAccessToken, getRefreshToken, saveTokens, logout } from "./auth";

const API_BASE_URL =
  (typeof import.meta !== "undefined" &&
    (import.meta.env?.VITE_API_URL || import.meta.env?.VITE_API_BASE_URL)) ||
  "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 1. Interceptor de Requisição: Injeta o Token do Usuário (se existir)
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 2. Interceptor de Resposta: Trata o erro 401 e tenta Refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se for erro 401, não for retry e não for rota de auth (login/refresh)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/token/") // Protege contra loop no login
    ) {
      originalRequest._retry = true;
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        logout();
        window.location.href = "/auth";
        return Promise.reject(error);
      }

      try {
        // Tenta renovar
        const response = await axios.post(
          `${API_BASE_URL}/auth/v1/token/refresh/`,
          {
            refresh: refreshToken,
          },
        );

        const { access, refresh } = response.data;

        // Salva tokens mantendo a estrutura correta
        saveTokens({ access, refresh });

        // Atualiza o header da requisição original e tenta de novo
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        logout();
        window.location.href = "/auth";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
