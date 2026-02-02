import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { getAccessToken, getUser, AuthUser } from "@/lib/auth";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se há token e usuário salvos
    const token = getAccessToken();
    const savedUser = getUser();

    if (token && savedUser) {
      setUser(savedUser);
    }

    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !!getAccessToken(),
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
};
