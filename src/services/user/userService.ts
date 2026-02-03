import api from "@/lib/api_config";

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
  const response = await api.get("/auth/v1/auth/me/");
  const user = response.data;

  if (user.perfil === "MASTER") {
    user.authorized_users = [];
    return user;
  }

  if (!user.authorized_users) {
    try {
      const permissionResponse = await api.get(
        `/moskit/v1/users/?authorized_for=${user.id}`,
      );

      const allowedUsers = permissionResponse.data;
      user.authorized_users = Array.isArray(allowedUsers)
        ? allowedUsers.map((u: Record<string, unknown>) => {
            const candidate = u.id ?? u.moskit_id;
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
