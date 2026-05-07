import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AuthRedirectHandler } from "@/components/auth/AuthRedirectHandler";
import { AuthInitializer } from "@/components/auth/AuthInitializer";
import { TenantProvider } from "@/components/tenant/TenantProvider";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import CreateSchool from "./pages/onboarding/CreateSchool";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import StudentsPage from "./pages/dashboard/StudentsPage";
import TeachersPage from "./pages/dashboard/TeachersPage";
import AttendancePage from "./pages/dashboard/AttendancePage";
import ExamsPage from "./pages/dashboard/ExamsPage";
import FinancePage from "./pages/dashboard/FinancePage";
import SettingsPage from "./pages/dashboard/SettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthInitializer>
          <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={
            <AuthRedirectHandler>
              <Login />
            </AuthRedirectHandler>
          } />
          <Route path="/login" element={
            <AuthRedirectHandler>
              <Login />
            </AuthRedirectHandler>
          } />
          <Route path="/onboarding/create-school" element={<CreateSchool />} />
          <Route path="/dashboard" element={
            <AuthGuard>
              <TenantProvider>
                <DashboardLayout />
              </TenantProvider>
            </AuthGuard>
          }>
            <Route index element={<DashboardOverview />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="teachers" element={<TeachersPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="exams" element={<ExamsPage />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        </AuthInitializer>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
