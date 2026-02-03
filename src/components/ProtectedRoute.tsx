import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "@/config/routes.config";
import { getAccessToken } from "@/lib/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "master" | "editor" | "viewer";
}

export const ProtectedRoute = ({
  children,
}: ProtectedRouteProps) => {
  const location = useLocation();
  const token = getAccessToken();

  // Verificar autenticação
  if (!token) {
    return <Navigate to={ROUTES.AUTH} state={{ from: location }} replace />;
  }

  return children;
};
