import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import Accounts from "./pages/Accounts";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Goals from "./pages/Goals";
import Debts from "./pages/Debts";
import Investments from "./pages/Investments";
import Retirement from "./pages/Retirement";
import Settings from "./pages/Settings";
import Alerts from "./pages/Alerts";
import ImportTransactions from "./pages/ImportTransactions";
import Education from "./pages/Education";
import Reports from "./pages/Reports";
import RecurringExpenses from "./pages/RecurringExpenses";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAPIConfig from "./pages/AdminAPIConfig";
import AdminTransactions from "./pages/AdminTransactions";
import AdminUsers from "./pages/AdminUsers";
import AdminBans from "./pages/AdminBans";
import AIChat from "./pages/AIChat";
import N8nIntegration from "./pages/N8nIntegration";
import FamilySharing from "./pages/FamilySharing";
import AutoTransfers from "./pages/AutoTransfers";
import TwoFactorAuth from "./pages/TwoFactorAuth";
import SocialLogin from "./pages/SocialLogin";
import PushNotifications from "./pages/PushNotifications";
import APIConfiguration from "./pages/APIConfiguration";
import Support from "./pages/Support";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CheckoutCanceled from "./pages/CheckoutCanceled";
import Billing from "./pages/Billing";
import BenchmarkAnalysis from "./pages/BenchmarkAnalysis";
import AuthError from "./pages/AuthError";

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
      <Route path="/" component={LandingPage} />
      <Route path="/dashboard" component={Home} />
      <Route path="/accounts" component={Accounts} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/import" component={ImportTransactions} />
      <Route path="/education" component={Education} />
      <Route path="/reports" component={Reports} />
      <Route path="/recurring" component={RecurringExpenses} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/api-config" component={AdminAPIConfig} />
      <Route path="/admin/transactions" component={AdminTransactions} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/bans" component={AdminBans} />
      <Route path="/ai-chat" component={AIChat} />
      <Route path="/n8n" component={N8nIntegration} />
      <Route path="/budgets" component={Budgets} />
      <Route path="/goals" component={Goals} />
      <Route path="/debts" component={Debts} />
      <Route path="/investments" component={Investments} />
      <Route path="/retirement" component={Retirement} />
      <Route path="/alerts" component={Alerts} />
      <Route path="/family" component={FamilySharing} />
      <Route path="/auto-transfers" component={AutoTransfers} />
      <Route path="/2fa" component={TwoFactorAuth} />
      <Route path="/social-login" component={SocialLogin} />
      <Route path="/push-notifications" component={PushNotifications} />
      <Route path="/api-config" component={APIConfiguration} />
      <Route path="/support" component={Support} />
      <Route path="/settings" component={Settings} />
      <Route path="/checkout/success" component={CheckoutSuccess} />
      <Route path="/checkout/canceled" component={CheckoutCanceled} />
      <Route path="/billing" component={Billing} />
      <Route path="/benchmark-analysis" component={BenchmarkAnalysis} />
      <Route path="/auth-error" component={AuthError} />
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
