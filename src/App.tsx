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
import UserManagement from "./pages/UserManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RoleProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<AppLayout><RoleRouter page="home" /></AppLayout>} />
            <Route path="/tickets" element={<AppLayout><RoleRouter page="tickets" /></AppLayout>} />
            <Route path="/tickets/new" element={<AppLayout><NewTicket /></AppLayout>} />
            <Route path="/tickets/:id" element={<AppLayout><TicketDetail /></AppLayout>} />
            <Route path="/reports" element={<AppLayout><RoleRouter page="reports" /></AppLayout>} />
            <Route path="/settings" element={<AppLayout><RoleRouter page="settings" /></AppLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </RoleProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
