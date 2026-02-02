import { Routes, Route } from "react-router-dom";
import { ROUTES } from "@/config/routes.config";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Individual from "@/pages/Individual";
import Implantados from "@/pages/Implantados";
import Metas from "@/pages/Metas";
import Promocoes from "@/pages/Promocoes";
import Discount from "@/pages/Discount";
import NotFound from "@/pages/NotFound";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Rota HOME - redireciona para AUTH */}
      <Route path={ROUTES.HOME} element={<Index />} />

      {/* Rota Pública */}
      <Route path={ROUTES.AUTH} element={<Auth />} />

      {/* Rotas Protegidas */}
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.INDIVIDUAL}
        element={
          <ProtectedRoute>
            <Individual />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.IMPLANTADOS}
        element={
          <ProtectedRoute>
            <Implantados />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.METAS}
        element={
          <ProtectedRoute>
            <Metas />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.PROMOCOES}
        element={
          <ProtectedRoute>
            <Promocoes />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.DESCONTO}
        element={
          <ProtectedRoute>
            <Discount />
          </ProtectedRoute>
        }
      />

      {/* Rota 404 */}
      <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
    </Routes>
  );
};
