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
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { LayoutDashboard, LogOut, PanelLeft } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";

import { Wallet, Receipt, PieChart, Target, CreditCard, TrendingUp, Calendar, Bell, Settings, BookOpen, Upload, BarChart3, Repeat, Bot, Shield, Zap, Users, ArrowRightLeft, Key, HelpCircle, Activity, Trophy, Medal, LineChart, DollarSign } from "lucide-react";

// Menu items para todos os usuários
const userMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Wallet, label: "Contas", path: "/accounts" },
  { icon: Receipt, label: "Transações", path: "/transactions" },
  { icon: Upload, label: "Importar", path: "/import" },
  { icon: PieChart, label: "Orçamentos", path: "/budgets" },
  { icon: Target, label: "Metas", path: "/goals" },
  { icon: CreditCard, label: "Dívidas", path: "/debts" },
  { icon: TrendingUp, label: "Investimentos", path: "/investments" },
  { icon: DollarSign, label: "Dividendos", path: "/dividends" },
  { icon: Calendar, label: "Aposentadoria", path: "/retirement" },
  { icon: BookOpen, label: "Educação", path: "/education" },
  { icon: BarChart3, label: "Relatórios", path: "/reports" },
  { icon: Repeat, label: "Recorrentes", path: "/recurring" },
  { icon: Activity, label: "Benchmarks", path: "/benchmark-analysis" },
  { icon: Trophy, label: "Conquistas", path: "/achievements" },
  { icon: Medal, label: "Ranking", path: "/leaderboard" },
  { icon: LineChart, label: "Estatísticas", path: "/stats" },
  { icon: Bot, label: "IA Chat", path: "/ai-chat" },
  { icon: Bell, label: "Alertas", path: "/alerts" },
  { icon: Users, label: "Família", path: "/family" },
  { icon: ArrowRightLeft, label: "Transferências", path: "/auto-transfers" },
  { icon: Shield, label: "2FA", path: "/2fa" },
  { icon: Users, label: "Login Social", path: "/social-login" },
  { icon: CreditCard, label: "Cobrança", path: "/billing" },
  { icon: HelpCircle, label: "Suporte", path: "/support" },
  { icon: Settings, label: "Configurações", path: "/settings" },
];

// Menu items apenas para administradores
const adminMenuItems = [
  { icon: Shield, label: "Admin", path: "/admin" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <h1 className="text-2xl font-semibold tracking-tight text-center">
              Organizai
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Sua plataforma completa de gestão financeira pessoal. Faça login para continuar.
            </p>
          </div>
          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            size="lg"
            className="w-full shadow-lg hover:shadow-xl transition-all"
          >
            Entrar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full">
        <Sidebar
          collapsible="icon"
          style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}
        >
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild>
                  <a href="/dashboard">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <LayoutDashboard className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">Organizai</span>
                      <span className="truncate text-xs text-muted-foreground">
                        Gestão Financeira
                      </span>
                    </div>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              {/* Menu items para usuários */}
              {userMenuItems.map((item) => (
                <NavigationItem key={item.path} item={item} />
              ))}

              {/* Menu items apenas para admin */}
              {isAdmin && (
                <>
                  <div className="my-2 border-t" />
                  <div className="px-3 py-2">
                    <a
                      href="/admin"
                      className="flex items-center gap-3 rounded-lg bg-green-600 hover:bg-green-700 px-3 py-2 text-white font-medium transition-colors"
                    >
                      <Shield className="h-4 w-4" />
                      <span>Painel Admin</span>
                    </a>
                  </div>
                </>
              )}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarFallback className="rounded-lg">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{user.name || "Usuário"}</span>
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

          <ResizeHandle sidebarWidth={sidebarWidth} setSidebarWidth={setSidebarWidth} />
        </Sidebar>

        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1 z-50" />
          </header>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function NavigationItem({ item }: { item: typeof userMenuItems[0] }) {
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

function ResizeHandle({
  sidebarWidth,
  setSidebarWidth,
}: {
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
}) {
  const { state } = useSidebar();
  const isMobile = useIsMobile();
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(sidebarWidth);

  useEffect(() => {
    if (state === "collapsed" || isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const delta = e.clientX - startXRef.current;
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidthRef.current + delta));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, setSidebarWidth, state, isMobile]);

  if (state === "collapsed" || isMobile) return null;

  return (
    <div
      className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/20 active:bg-primary/30 transition-colors"
      onMouseDown={(e) => {
        setIsResizing(true);
        startXRef.current = e.clientX;
        startWidthRef.current = sidebarWidth;
      }}
    />
  );
}
