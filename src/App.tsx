import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleProvider, useRole } from "@/contexts/RoleContext";
import AppLayout from "@/components/AppLayout";
import RoleRouter from "@/components/RoleRouter";
import TicketDetail from "./pages/TicketDetail";
import NewTicket from "./pages/NewTicket";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useRole();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/" element={<ProtectedRoute><AppLayout><RoleRouter page="home" /></AppLayout></ProtectedRoute>} />
    <Route path="/tickets" element={<ProtectedRoute><AppLayout><RoleRouter page="tickets" /></AppLayout></ProtectedRoute>} />
    <Route path="/tickets/new" element={<ProtectedRoute><AppLayout><NewTicket /></AppLayout></ProtectedRoute>} />
    <Route path="/tickets/:id" element={<ProtectedRoute><AppLayout><TicketDetail /></AppLayout></ProtectedRoute>} />
    <Route path="/reports" element={<ProtectedRoute><AppLayout><RoleRouter page="reports" /></AppLayout></ProtectedRoute>} />
    <Route path="/settings" element={<ProtectedRoute><AppLayout><RoleRouter page="settings" /></AppLayout></ProtectedRoute>} />
    <Route path="/users" element={<ProtectedRoute><AppLayout><RoleRouter page="users" /></AppLayout></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RoleProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </RoleProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
