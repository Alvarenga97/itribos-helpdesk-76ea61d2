import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Ticket, Plus, BarChart3, Settings, 
  ChevronLeft, ChevronRight, Bell, Search, Menu, LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const analystNav = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Ticket, label: 'Chamados', path: '/tickets' },
  { icon: Plus, label: 'Novo Chamado', path: '/tickets/new' },
  { icon: BarChart3, label: 'Relatórios', path: '/reports' },
  { icon: Settings, label: 'Configurações', path: '/settings' },
];

const requesterNav = [
  { icon: LayoutDashboard, label: 'Meus Chamados', path: '/' },
  { icon: Plus, label: 'Abrir Chamado', path: '/tickets/new' },
];

function NavItems({ items, onNavigate }: { items: typeof analystNav; onNavigate?: () => void }) {
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
              'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all duration-150',
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
            )}
          >
            <item.icon className={cn('h-4 w-4 shrink-0', isActive && 'text-primary')} />
            <span className="overflow-hidden whitespace-nowrap">{item.label}</span>
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
  const isMobile = useIsMobile();
  const { role, profile, signOut } = useAuth();
  const location = useLocation();

  const navItems = role === 'REQUESTER' ? requesterNav : analystNav;
  const displayName = profile?.name || 'Usuário';
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <motion.aside
          animate={{ width: collapsed ? 72 : 240 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="flex flex-col border-r border-border bg-sidebar shrink-0"
        >
          <div className="flex h-16 items-center gap-3 border-b border-border px-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
              <Ticket className="h-4 w-4 text-primary-foreground" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden whitespace-nowrap font-display text-sm font-semibold text-foreground"
                >
                  Portal de Chamados
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path === '/tickets' && location.pathname.startsWith('/tickets/') && !location.pathname.includes('/new'));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all duration-150',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                  )}
                >
                  <item.icon className={cn('h-4 w-4 shrink-0', isActive && 'text-primary')} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="overflow-hidden whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border p-3">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex w-full items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>
        </motion.aside>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 sm:h-16 items-center justify-between border-b border-border px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {isMobile && (
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <button className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                    <Menu className="h-5 w-5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0 bg-sidebar border-border">
                  <div className="flex h-14 items-center gap-3 border-b border-border px-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
                      <Ticket className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="font-display text-sm font-semibold text-foreground">
                      Portal de Chamados
                    </span>
                  </div>
                  <NavItems items={navItems} onNavigate={() => setMobileOpen(false)} />
                  <div className="border-t border-border p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{displayName}</p>
                        <p className="text-xs text-muted-foreground">{roleLabels[role] || role}</p>
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
                className="h-9 w-64 rounded-md border border-border bg-secondary pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {isMobile && (
              <button className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                <Search className="h-4 w-4" />
              </button>
            )}
            <button className="relative rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive animate-pulse-glow" />
            </button>
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                {initials}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{displayName}</p>
                <p className="text-xs text-muted-foreground">{roleLabels[role] || role}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-glow">
          <div className="p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
