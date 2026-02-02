export const ROUTES = {
  HOME: "/",
  AUTH: "/auth",
  DASHBOARD: "/dashboard",
  INDIVIDUAL: "/individual",
  IMPLANTADOS: "/implantados",
  METAS: "/metas",
  PROMOCOES: "/promocoes",
  DESCONTO: "/desconto",
  NOT_FOUND: "*",
} as const;

export const PAGE_TITLES: Record<string, string> = {
  [ROUTES.HOME]: "Início",
  [ROUTES.AUTH]: "Autenticação",
  [ROUTES.DASHBOARD]: "Dashboard",
  [ROUTES.INDIVIDUAL]: "Individual",
  [ROUTES.IMPLANTADOS]: "Implantados",
  [ROUTES.METAS]: "Cargos e Metas",
  [ROUTES.PROMOCOES]: "Promoções",
  [ROUTES.DESCONTO]: "Descontos",
  [ROUTES.NOT_FOUND]: "Página não encontrada",
};

export type RouteKey = keyof typeof ROUTES;

export const buildRoute = (
  route: (typeof ROUTES)[RouteKey],
  params?: Record<string, string | number>,
): string => {
  let url: string = route;

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }

  return url;
};

export const getPageTitle = (path: string): string => {
  return PAGE_TITLES[path] || "Página";
};
