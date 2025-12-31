import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Accounts from "./pages/Accounts";
import Transactions from "./pages/Transactions";

// Placeholder pages - will be implemented in subsequent phases
const PlaceholderPage = ({ title }: { title: string }) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-muted-foreground">Em desenvolvimento</p>
      </div>
    </div>
  );
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/accounts" component={Accounts} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/budgets" component={() => <PlaceholderPage title="Orçamentos" />} />
      <Route path="/goals" component={() => <PlaceholderPage title="Metas" />} />
      <Route path="/debts" component={() => <PlaceholderPage title="Dívidas" />} />
      <Route path="/investments" component={() => <PlaceholderPage title="Investimentos" />} />
      <Route path="/retirement" component={() => <PlaceholderPage title="Aposentadoria" />} />
      <Route path="/alerts" component={() => <PlaceholderPage title="Notificações" />} />
      <Route path="/settings" component={() => <PlaceholderPage title="Configurações" />} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
