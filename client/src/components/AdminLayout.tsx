import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { 
  LayoutDashboard, 
  LogOut, 
  Users, 
  CreditCard, 
  Tag, 
  Shield, 
  Settings, 
  Key,
  Bell,
  Zap,
  ArrowLeft,
  BarChart3,
  DollarSign,
  Receipt,
  CheckSquare,
  Layers,
  Gift,
  TrendingUp
} from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "./ui/button";

// Menu items da área admin
const adminMenuItems = [
  { icon: LayoutDashboard, label: "Visão Geral", path: "/admin", section: "main" },
  { icon: Users, label: "Usuários", path: "/admin/users", section: "main" },
  { icon: Shield, label: "Banimentos", path: "/admin/bans", section: "main" },
  { icon: Receipt, label: "Transações", path: "/admin/transactions", section: "finance" },
  { icon: CheckSquare, label: "Aprovar Transações", path: "/admin/approve-transactions", section: "finance" },
  { icon: CreditCard, label: "Planos", path: "/admin/plans", section: "finance" },
  { icon: Layers, label: "Categorias", path: "/admin/categories", section: "finance" },
  { icon: Gift, label: "Promoções", path: "/admin/promotions", section: "finance" },
  { icon: TrendingUp, label: "Relatórios Financeiros", path: "/admin/financial-reports", section: "finance" },
  { icon: Key, label: "APIs de IA", path: "/admin/api-config", section: "config" },
  { icon: Bell, label: "Notificações Push", path: "/admin/push-notifications", section: "config" },
  { icon: Zap, label: "Integrações", path: "/admin/integrations", section: "config" },
  { icon: Settings, label: "Configurações", path: "/admin/settings", section: "config" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, user } = useAuth();
  const [location, setLocation] = useLocation();

  // Redirecionar se não for admin
  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      setLocation('/dashboard');
    }
  }, [loading, user, setLocation]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (user.role !== 'admin') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
          <p className="text-muted-foreground mb-4">Você não tem permissão para acessar esta área.</p>
          <Button onClick={() => setLocation('/dashboard')}>
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b px-6 py-4">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <div>
                <h2 className="font-bold text-lg">Admin</h2>
                <p className="text-xs text-muted-foreground">Painel Administrativo</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-3 py-4">
            {/* Botão para voltar à área de usuário */}
            <div className="mb-4 px-3">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={() => setLocation('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4" />
                Área de Usuário
              </Button>
            </div>

            <SidebarMenu>
              {/* Seção Principal */}
              <div className="px-3 py-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Principal</p>
              </div>
              {adminMenuItems.filter(item => item.section === 'main').map((item) => (
                <NavigationItem key={item.path} item={item} />
              ))}

              {/* Seção Financeiro */}
              <div className="px-3 py-2 mt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Financeiro</p>
              </div>
              {adminMenuItems.filter(item => item.section === 'finance').map((item) => (
                <NavigationItem key={item.path} item={item} />
              ))}

              {/* Seção Configurações */}
              <div className="px-3 py-2 mt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Configurações</p>
              </div>
              {adminMenuItems.filter(item => item.section === 'config').map((item) => (
                <NavigationItem key={item.path} item={item} />
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                          {user.name?.charAt(0)?.toUpperCase() || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{user.name || "Administrador"}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                    side="bottom"
                    align="end"
                    sideOffset={4}
                  >
                    <UserMenu />
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold">Painel Administrativo</span>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function NavigationItem({ item }: { item: typeof adminMenuItems[0] }) {
  const [location] = useLocation();
  const Icon = item.icon;
  const isActive = location === item.path;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <a href={item.path}>
          <Icon />
          <span>{item.label}</span>
        </a>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function UserMenu() {
  const { logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <>
      <DropdownMenuItem onClick={handleLogout}>
        <LogOut className="mr-2 h-4 w-4" />
        <span>Sair</span>
      </DropdownMenuItem>
    </>
  );
}
