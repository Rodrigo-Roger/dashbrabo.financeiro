import { useState, useMemo } from "react";
import { 
  Wallet, 
  TrendingUp, 
  Award, 
  DollarSign
} from "lucide-react";
import { 
  SAMPLE_EMPLOYEES, 
  ROLES, 
  calculateCompensation, 
  formatCurrency
} from "@/lib/data";
import { Header } from "@/components/dashboard/Header";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { KPICard } from "@/components/dashboard/KPICard";
import { EmployeeSelector } from "@/components/dashboard/EmployeeSelector";
import { CompensationBreakdown } from "@/components/dashboard/CompensationBreakdown";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { TeamOverview } from "@/components/dashboard/TeamOverview";
import { SimulatorView } from "@/components/dashboard/SimulatorView";

// Sample revenue data for chart
const sampleRevenueData = [
  { month: 'Ago', value: 18000 },
  { month: 'Set', value: 22000 },
  { month: 'Out', value: 19500 },
  { month: 'Nov', value: 24000 },
  { month: 'Dez', value: 21000 },
  { month: 'Jan', value: 25000 },
];

export default function Index() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('individual');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(SAMPLE_EMPLOYEES[0].id);
  
  const selectedEmployee = useMemo(
    () => SAMPLE_EMPLOYEES.find(e => e.id === selectedEmployeeId)!,
    [selectedEmployeeId]
  );
  
  const compensation = useMemo(
    () => calculateCompensation(selectedEmployee),
    [selectedEmployee]
  );
  
  const role = ROLES[selectedEmployee.role];
  
  const renderContent = () => {
    switch (activeView) {
      case 'team':
        return (
          <div className="space-y-5">
            <div className="border-b border-border pb-4">
              <h2 className="text-lg font-semibold text-foreground">Visão de Equipe</h2>
              <p className="text-sm text-muted-foreground">Acompanhe a performance de todos os colaboradores</p>
            </div>
            <TeamOverview employees={SAMPLE_EMPLOYEES} />
          </div>
        );
      
      case 'unit':
        return (
          <div className="space-y-5">
            <div className="border-b border-border pb-4">
              <h2 className="text-lg font-semibold text-foreground">Visão de Unidade</h2>
              <p className="text-sm text-muted-foreground">Métricas consolidadas por unidade de negócio</p>
            </div>
            <TeamOverview employees={SAMPLE_EMPLOYEES} />
          </div>
        );
      
      case 'financial':
        return (
          <div className="space-y-5">
            <div className="border-b border-border pb-4">
              <h2 className="text-lg font-semibold text-foreground">Resumo Financeiro</h2>
              <p className="text-sm text-muted-foreground">Visão geral de custos e projeções</p>
            </div>
            <TeamOverview employees={SAMPLE_EMPLOYEES} />
          </div>
        );
      
      case 'simulator':
        return (
          <div className="space-y-5">
            <div className="border-b border-border pb-4">
              <h2 className="text-lg font-semibold text-foreground">Simulador</h2>
              <p className="text-sm text-muted-foreground">Simule diferentes cenários de remuneração</p>
            </div>
            <SimulatorView />
          </div>
        );
      
      case 'promotions':
        return (
          <div className="space-y-5">
            <div className="border-b border-border pb-4">
              <h2 className="text-lg font-semibold text-foreground">Promoções</h2>
              <p className="text-sm text-muted-foreground">Colaboradores elegíveis para promoção</p>
            </div>
            <TeamOverview 
              employees={SAMPLE_EMPLOYEES.filter(e => {
                const r = ROLES[e.role];
                return r.quarterlyPromotion && e.quarterlyRevenue >= r.quarterlyPromotion;
              })} 
            />
          </div>
        );
      
      default:
        return (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Visão Individual</h2>
                <p className="text-sm text-muted-foreground">
                  {role.name} • Trilha {selectedEmployee.path === 'specialist' ? 'Especialista' : 'Liderança'}
                </p>
              </div>
              <EmployeeSelector
                employees={SAMPLE_EMPLOYEES}
                selectedId={selectedEmployeeId}
                onSelect={setSelectedEmployeeId}
              />
            </div>
            
            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KPICard
                title="Salário Base"
                value={formatCurrency(compensation.baseSalary)}
                subtitle="Mensal"
                icon={Wallet}
              />
              <KPICard
                title="Variável"
                value={formatCurrency(compensation.variablePay)}
                subtitle={`${role.variableMin}%-${role.variableMax}% da demanda`}
                icon={TrendingUp}
                variant="success"
              />
              <KPICard
                title="Bônus"
                value={formatCurrency(compensation.teamBonus + compensation.promotionAddOn + compensation.unitAddOn)}
                subtitle="Este mês"
                icon={Award}
                variant="warning"
              />
              <KPICard
                title="Total"
                value={formatCurrency(compensation.total)}
                subtitle="Remuneração mensal"
                icon={DollarSign}
                variant="primary"
                trend={{ value: 12.5, label: 'vs. mês anterior' }}
              />
            </div>
            
            {/* Main Content Grid */}
            <div className="grid gap-5 lg:grid-cols-2">
              <CompensationBreakdown compensation={compensation} />
              <RevenueChart data={sampleRevenueData} />
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      
      <div className="flex flex-1 flex-col min-w-0 h-screen overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-auto p-4 md:p-5 lg:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
