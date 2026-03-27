import { motion } from 'framer-motion';
import { Ticket, User, Headset, Shield } from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types/ticket';

const roleConfig: Record<UserRole, { label: string; icon: typeof User; color: string }> = {
  REQUESTER: { label: 'Usuário', icon: User, color: 'bg-emerald-500/20 text-emerald-400' },
  AGENT: { label: 'Analista', icon: Headset, color: 'bg-blue-500/20 text-blue-400' },
  MANAGER: { label: 'Gestor', icon: Shield, color: 'bg-amber-500/20 text-amber-400' },
  ADMIN: { label: 'Admin', icon: Shield, color: 'bg-red-500/20 text-red-400' },
};

export default function Login() {
  const { users, login } = useRole();
  const navigate = useNavigate();

  const handleLogin = (userId: string) => {
    login(userId);
    navigate('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background bg-glow px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg space-y-8"
      >
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary glow-border">
            <Ticket className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="mt-4 text-2xl font-bold font-display text-foreground">Portal de Chamados</h1>
          <p className="mt-1 text-sm text-muted-foreground">Selecione seu perfil para acessar o sistema</p>
        </div>

        <div className="grid gap-3">
          {users.map((user) => {
            const rc = roleConfig[user.role];
            const Icon = rc.icon;
            return (
              <motion.button
                key={user.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLogin(user.id)}
                className="flex items-center gap-4 rounded-lg border border-border card-gradient p-4 text-left transition-colors hover:border-primary/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <span className={cn('flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', rc.color)}>
                  <Icon className="h-3 w-3" />
                  {rc.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
