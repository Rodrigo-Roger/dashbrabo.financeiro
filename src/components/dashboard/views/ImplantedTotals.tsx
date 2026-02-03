import { useMemo } from "react";
import { Employee } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/data";
import { CheckCircle2, Target, TrendingUp, Users } from "lucide-react";

interface ImplantedTotalsProps {
  employees: Employee[];
}

interface SellerStats {
  id: string;
  name: string;
  picture?: string;
  implantadosAtual: number;
  metaImplantados: number;
  progresso: number;
  status: "success" | "warning" | "danger";
}

export function ImplantedTotals({ employees }: ImplantedTotalsProps) {
  const stats = useMemo(() => {
    const totalImplantados = employees.reduce(
      (sum, emp) => sum + (emp.implantadosAtual || 0),
      0
    );
    const vendedoresAtivos = employees.length;
    const vendedoresComImplantados = employees.filter(
      (emp) => (emp.implantadosAtual || 0) > 0
    ).length;
    const mediaImplantados =
      vendedoresAtivos > 0 ? totalImplantados / vendedoresAtivos : 0;

    return {
      totalImplantados,
      vendedoresAtivos,
      vendedoresComImplantados,
      mediaImplantados,
    };
  }, [employees]);

  const sellersList: SellerStats[] = useMemo(() => {
    return employees
      .map((emp) => {
        const implantados = emp.implantadosAtual || 0;

        let status: "success" | "warning" | "danger" = "danger";
        if (implantados >= 10000) status = "success";
        else if (implantados >= 5000) status = "warning";

        return {
          id: emp.id,
          name: emp.name,
          picture: emp.picture,
          implantadosAtual: implantados,
          metaImplantados: 0, // Não usado mais
          progresso: 0, // Não usado mais
          status,
        };
      })
      .sort((a, b) => b.implantadosAtual - a.implantadosAtual);
  }, [employees]);

  const getStatusColor = (status: "success" | "warning" | "danger") => {
    switch (status) {
      case "success":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      default:
        return "bg-red-500";
    }
  };

  const getStatusBadge = (status: "success" | "warning" | "danger") => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Meta Batida</Badge>
        );
      case "warning":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">Próximo</Badge>
        );
      default:
        return <Badge variant="destructive">Em Risco</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Implantados
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalImplantados)}
            </div>
            <p className="text-xs text-muted-foreground">
              Acumulado no período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Média por Vendedor
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.mediaImplantados)}
            </div>
            <p className="text-xs text-muted-foreground">Média da equipe</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vendedores Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.vendedoresAtivos}</div>
            <p className="text-xs text-muted-foreground">Total de vendedores</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Com Implantações
            </CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.vendedoresComImplantados}/{stats.vendedoresAtivos}
            </div>
            <p className="text-xs text-muted-foreground">
              Vendedores com resultado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Vendedores */}
      <Card>
        <CardHeader>
          <CardTitle>Desempenho por Vendedor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sellersList.map((seller) => (
              <div
                key={seller.id}
                className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {seller.picture ? (
                    <img
                      src={seller.picture}
                      alt={seller.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      {seller.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Informações */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="font-semibold truncate">{seller.name}</h3>
                    {getStatusBadge(seller.status)}
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-foreground font-semibold text-lg">
                      {formatCurrency(seller.implantadosAtual)}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      implantado no período
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {sellersList.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                <p>Nenhum vendedor disponível</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
