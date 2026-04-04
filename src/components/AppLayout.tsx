import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Ticket, Plus, BarChart3, Settings,
  ChevronLeft, ChevronRight, Bell, Search, Menu, LogOut, Users, X, Sun, Moon
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import TicketzLogo from '@/components/TicketzLogo';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Notification {
  id: string;
  message: string;
  time: Date;
  read: boolean;
  link?: string;
}

const analystNav = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Ticket, label: 'Chamados', path: '/tickets' },
  { icon: Plus, label: 'Novo Chamado', path: '/tickets/new' },
  { icon: Users, label: 'Usuários', path: '/users' },
  { icon: BarChart3, label: 'Relatórios', path: '/reports' },
  { icon: Settings, label: 'Configurações', path: '/settings' },
];

const requesterNav = [
  { icon: LayoutDashboard, label: 'Meus Chamados', path: '/' },
  { icon: Plus, label: 'Abrir Chamado', path: '/tickets/new' },
];

function NavItems({ items, collapsed, onNavigate }: { items: typeof analystNav; collapsed?: boolean; onNavigate?: () => void }) {
  const location = useLocation();

  return (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {items.map((item) => {
        const isActive = location.pathname === item.path ||
          (item.path === '/tickets' && location.pathname.startsWith('/tickets/') && !location.pathname.includes('/new'));
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150',
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
            )}
          >
            <item.icon className={cn('h-4 w-4 shrink-0', isActive && 'text-sidebar-primary')} />
            {!collapsed && <span className="overflow-hidden whitespace-nowrap">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

const roleLabels: Record<string, string> = {
  REQUESTER: 'Usuário',
  AGENT: 'Analista',
  MANAGER: 'Gestor',
  ADMIN: 'Admin',
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const isMobile = useIsMobile();
  const { role, profile, user, signOut } = useAuth();
  const { isDark, toggle: toggleTheme } = useTheme();

  const navItems = role === 'REQUESTER' ? requesterNav : analystNav;
  const displayName = profile?.name || 'Usuário';
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2);
  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((message: string, link?: string) => {
    const notif: Notification = {
      id: crypto.randomUUID(),
      message,
      time: new Date(),
      read: false,
      link,
    };
    setNotifications(prev => [notif, ...prev].slice(0, 20));
    toast.info(message, { duration: 4000 });
  }, []);

  // Subscribe to realtime events
  useEffect(() => {
    if (!user) return;

    const ticketChannel = supabase
      .channel('tickets-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tickets' },
        (payload) => {
          const ticket = payload.new as any;
          if (role !== 'REQUESTER') {
            addNotification(
              `Novo chamado #${ticket.ticket_number}: ${ticket.title}`,
              `/tickets/${ticket.id}`
            );
          } else if (ticket.created_by === user.id) {
            // requester sees their own new ticket confirmed
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tickets' },
        (payload) => {
          const ticket = payload.new as any;
          const old = payload.old as any;
          if (old.status !== ticket.status) {
            const statusLabels: Record<string, string> = {
              OPEN: 'Aberto', IN_PROGRESS: 'Em Andamento', WAITING_REQUESTER: 'Aguardando',
              RESOLVED: 'Resolvido', CLOSED: 'Fechado',
            };
            addNotification(
              `Chamado #${ticket.ticket_number} → ${statusLabels[ticket.status] || ticket.status}`,
              `/tickets/${ticket.id}`
            );
          }
        }
      )
      .subscribe();

    const commentChannel = supabase
      .channel('comments-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ticket_comments' },
        (payload) => {
          const comment = payload.new as any;
          if (comment.user_id !== user.id) {
            addNotification(
              'Novo comentário em um chamado',
              `/tickets/${comment.ticket_id}`
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ticketChannel);
      supabase.removeChannel(commentChannel);
    };
  }, [user, role, addNotification]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside
          style={{ width: collapsed ? 72 : 256 }}
          className="flex flex-col border-r border-sidebar-border bg-sidebar shrink-0 transition-all duration-200"
        >
          <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
            <TicketzLogo size="sm" className="shrink-0" />
            {!collapsed && (
              <span className="overflow-hidden whitespace-nowrap font-display text-sm font-semibold text-sidebar-accent-foreground">
                Portal Ticketz
              </span>
            )}
          </div>

          <NavItems items={navItems} collapsed={collapsed} />

          <div className="border-t border-sidebar-border p-3">
            {!collapsed && (
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary/20 text-xs font-medium text-sidebar-primary">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-sidebar-accent-foreground truncate">{displayName}</p>
                  <p className="text-xs text-sidebar-foreground">{roleLabels[role] || role}</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex w-full items-center justify-center rounded-lg p-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>
        </aside>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 sm:h-16 items-center justify-between border-b border-border bg-card px-4 sm:px-6 shadow-sm">
          <div className="flex items-center gap-3">
            {isMobile && (
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <button className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                    <Menu className="h-5 w-5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
                  <div className="flex h-14 items-center gap-3 border-b border-sidebar-border px-4">
                    <TicketzLogo size="sm" />
                    <span className="font-display text-sm font-semibold text-sidebar-accent-foreground">
                      Portal Ticketz
                    </span>
                  </div>
                  <NavItems items={navItems} onNavigate={() => setMobileOpen(false)} />
                  <div className="border-t border-sidebar-border p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary/20 text-xs font-medium text-sidebar-primary">
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-sidebar-accent-foreground">{displayName}</p>
                        <p className="text-xs text-sidebar-foreground">{roleLabels[role] || role}</p>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}

            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Buscar chamados..."
                className="h-9 w-64 rounded-lg border border-border bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {isMobile && (
              <button className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                <Search className="h-4 w-4" />
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              title={isDark ? 'Modo claro' : 'Modo escuro'}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-card shadow-lg z-50">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <h3 className="text-sm font-semibold text-foreground">Notificações</h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                          Marcar todas como lidas
                        </button>
                      )}
                      <button onClick={() => setShowNotifications(false)} className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                        Nenhuma notificação
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <Link
                          key={notif.id}
                          to={notif.link || '#'}
                          onClick={() => {
                            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
                            setShowNotifications(false);
                          }}
                          className={cn(
                            'block px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors',
                            !notif.read && 'bg-primary/5'
                          )}
                        >
                          <p className="text-sm text-foreground">{notif.message}</p>
                          <p className="mt-0.5 text-[10px] text-muted-foreground">
                            {notif.time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                {initials}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{displayName}</p>
                <p className="text-xs text-muted-foreground">{roleLabels[role] || role}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
