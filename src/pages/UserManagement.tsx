import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Shield } from 'lucide-react';
import { useUsers, useCreateUser, useUpdateUserRole } from '@/hooks/useUsers';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const roleLabels: Record<string, string> = {
  REQUESTER: 'Usuário',
  AGENT: 'Analista',
  MANAGER: 'Gestor',
  ADMIN: 'Admin',
};

const roleColors: Record<string, string> = {
  REQUESTER: 'bg-secondary text-secondary-foreground',
  AGENT: 'bg-primary/10 text-primary',
  MANAGER: 'bg-warning/10 text-warning',
  ADMIN: 'bg-destructive/10 text-destructive',
};

export default function UserManagement() {
  const { data: users = [], isLoading } = useUsers();
  const createUser = useCreateUser();
  const updateRole = useUpdateUserRole();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'REQUESTER' });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser.mutateAsync(form);
      toast.success('Usuário criado com sucesso!');
      setForm({ name: '', email: '', password: '', role: 'REQUESTER' });
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar usuário');
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateRole.mutateAsync({ userId, role: newRole });
      toast.success('Papel atualizado');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar papel');
    }
  };

  const inputClass = 'w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-foreground">Gestão de Usuários</h1>
          <p className="mt-1 text-sm text-muted-foreground">{users.length} usuários cadastrados</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Novo Usuário
        </button>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleCreate}
          className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4"
        >
          <h2 className="text-sm font-semibold text-foreground">Criar Novo Usuário</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Nome</label>
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nome completo" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">E-mail</label>
              <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Senha</label>
              <input required type="password" minLength={6} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 6 caracteres" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Papel</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className={inputClass}>
                <option value="REQUESTER">Usuário</option>
                <option value="AGENT">Analista</option>
                <option value="MANAGER">Gestor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
              Cancelar
            </button>
            <button type="submit" disabled={createUser.isPending} className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {createUser.isPending ? 'Criando...' : 'Criar Usuário'}
            </button>
          </div>
        </motion.form>
      )}

      {isLoading ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      ) : (
        <>
          {/* Mobile */}
          <div className="space-y-3 sm:hidden">
            {users.map(u => (
              <div key={u.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                    {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <select
                    value={u.role}
                    onChange={e => handleRoleChange(u.id, e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium"
                  >
                    <option value="REQUESTER">Usuário</option>
                    <option value="AGENT">Analista</option>
                    <option value="MANAGER">Gestor</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <span className="text-xs text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop */}
          <div className="hidden sm:block rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Usuário</th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">E-mail</th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Papel</th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Desde</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                          {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="text-sm font-medium text-foreground">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        className={cn('rounded-full border-0 px-3 py-1 text-xs font-medium cursor-pointer', roleColors[u.role] || roleColors.REQUESTER)}
                      >
                        <option value="REQUESTER">Usuário</option>
                        <option value="AGENT">Analista</option>
                        <option value="MANAGER">Gestor</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
