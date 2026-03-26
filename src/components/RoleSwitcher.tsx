import { useRole } from '@/contexts/RoleContext';
import { UserRole } from '@/types/ticket';
import { cn } from '@/lib/utils';
import { Shield, Headset, User } from 'lucide-react';

const roles: { value: UserRole; label: string; icon: typeof User }[] = [
  { value: 'REQUESTER', label: 'Usuário', icon: User },
  { value: 'AGENT', label: 'Analista', icon: Headset },
  { value: 'MANAGER', label: 'Gestor', icon: Shield },
];

export default function RoleSwitcher() {
  const { role, setRole } = useRole();

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary/50 p-1">
      {roles.map((r) => (
        <button
          key={r.value}
          onClick={() => setRole(r.value)}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all',
            role === r.value
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          )}
        >
          <r.icon className="h-3 w-3" />
          <span className="hidden sm:inline">{r.label}</span>
        </button>
      ))}
    </div>
  );
}
