import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleRouter from "@/components/RoleRouter";
import TicketDetail from "./pages/TicketDetail";
import NewTicket from "./pages/NewTicket";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><AppLayout><RoleRouter page="home" /></AppLayout></ProtectedRoute>} />
            <Route path="/tickets" element={<ProtectedRoute><AppLayout><RoleRouter page="tickets" /></AppLayout></ProtectedRoute>} />
            <Route path="/tickets/new" element={<ProtectedRoute><AppLayout><NewTicket /></AppLayout></ProtectedRoute>} />
            <Route path="/tickets/:id" element={<ProtectedRoute><AppLayout><TicketDetail /></AppLayout></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><AppLayout><RoleRouter page="reports" /></AppLayout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><AppLayout><RoleRouter page="settings" /></AppLayout></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
