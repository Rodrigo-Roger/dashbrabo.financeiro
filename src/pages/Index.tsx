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
  formatCurrency, 
  getPerformanceStatus 
} from "@/lib/data";
import { Header } from "@/components/dashboard/Header";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { KPICard } from "@/components/dashboard/KPICard";
import { EmployeeSelector } from "@/components/dashboard/EmployeeSelector";
import { CareerPathCard } from "@/components/dashboard/CareerPathCard";
import { CompensationBreakdown } from "@/components/dashboard/CompensationBreakdown";
import { GoalTracker } from "@/components/dashboard/GoalTracker";
import { BenefitsCard } from "@/components/dashboard/BenefitsCard";
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
  const status = getPerformanceStatus(
    selectedEmployee.quarterlyRevenue,
    role.quarterlyStay,
    role.quarterlyPromotion
  );
  
  const renderContent = () => {
    switch (activeView) {
      case 'team':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Visão de Equipe</h2>
              <p className="text-muted-foreground">Acompanhe a performance de todos os colaboradores</p>
            </div>
            <TeamOverview employees={SAMPLE_EMPLOYEES} />
          </div>
        );
      
      case 'unit':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Visão de Unidade</h2>
              <p className="text-muted-foreground">Métricas consolidadas por unidade de negócio</p>
            </div>
            <TeamOverview employees={SAMPLE_EMPLOYEES} />
          </div>
        );
      
      case 'financial':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Resumo Financeiro</h2>
              <p className="text-muted-foreground">Visão geral de custos e projeções</p>
            </div>
            <TeamOverview employees={SAMPLE_EMPLOYEES} />
          </div>
        );
      
      case 'simulator':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Simulador</h2>
              <p className="text-muted-foreground">Simule diferentes cenários de remuneração</p>
            </div>
            <SimulatorView />
          </div>
        );
      
      case 'promotions':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Promoções</h2>
              <p className="text-muted-foreground">Colaboradores elegíveis para promoção</p>
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
          <div className="space-y-6">
            {/* Employee Selector */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <EmployeeSelector
                employees={SAMPLE_EMPLOYEES}
                selectedId={selectedEmployeeId}
                onSelect={setSelectedEmployeeId}
              />
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{role.name}</span>
                <span className="mx-2">•</span>
                <span>Trilha {selectedEmployee.path === 'specialist' ? 'Especialista' : 'Liderança'}</span>
              </div>
            </div>
            
            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KPICard
                title="Salário Base"
                value={formatCurrency(compensation.baseSalary)}
                subtitle="Mensal"
                icon={Wallet}
                className="animate-slide-up opacity-0 stagger-1"
              />
              <KPICard
                title="Variável"
                value={formatCurrency(compensation.variablePay)}
                subtitle={`${role.variableMin}%-${role.variableMax}% da demanda`}
                icon={TrendingUp}
                variant="success"
                className="animate-slide-up opacity-0 stagger-2"
              />
              <KPICard
                title="Bônus e Add-ons"
                value={formatCurrency(compensation.teamBonus + compensation.promotionAddOn + compensation.unitAddOn)}
                subtitle="Este mês"
                icon={Award}
                variant="warning"
                className="animate-slide-up opacity-0 stagger-3"
              />
              <KPICard
                title="Total"
                value={formatCurrency(compensation.total)}
                subtitle="Remuneração mensal"
                icon={DollarSign}
                variant="primary"
                trend={{ value: 12.5, label: 'vs. mês anterior' }}
                className="animate-slide-up opacity-0 stagger-4"
              />
            </div>
            
            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column - Career & Compensation */}
              <div className="space-y-6 lg:col-span-2">
                <div className="grid gap-6 md:grid-cols-2">
                  <CareerPathCard
                    currentLevel={selectedEmployee.role}
                    path={selectedEmployee.path}
                    className="animate-slide-up opacity-0 stagger-2"
                  />
                  <CompensationBreakdown
                    compensation={compensation}
                    className="animate-slide-up opacity-0 stagger-3"
                  />
                </div>
                
                <RevenueChart 
                  data={sampleRevenueData} 
                  className="animate-slide-up opacity-0 stagger-4"
                />
              </div>
              
              {/* Right Column - Goals & Benefits */}
              <div className="space-y-6">
                <GoalTracker
                  level={selectedEmployee.role}
                  quarterlyRevenue={selectedEmployee.quarterlyRevenue}
                  className="animate-slide-up opacity-0 stagger-3"
                />
                <BenefitsCard
                  level={selectedEmployee.role}
                  tenure={selectedEmployee.tenure}
                  className="animate-slide-up opacity-0 stagger-4"
                />
              </div>
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      
      <div className="flex flex-1 flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
