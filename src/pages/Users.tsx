import { useState } from 'react';
import { useRole } from '@/contexts/RoleContext';
import type { UserRole } from '@/types/ticket';
import { Plus, Users as UsersIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const roleLabels: Record<UserRole, string> = {
  REQUESTER: 'Usuário',
  AGENT: 'Analista',
  MANAGER: 'Gestor',
  ADMIN: 'Admin',
};

export default function UsersPage() {
  const { users, updateUserRole, addUser, currentUser } = useRole();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('REQUESTER');

  const handleAdd = () => {
    if (!newName || !newEmail) return;
    addUser({
      id: crypto.randomUUID(),
      name: newName,
      email: newEmail,
      role: newRole,
      avatarUrl: '',
    });
    toast.success('Usuário adicionado com sucesso');
    setNewName('');
    setNewEmail('');
    setNewRole('REQUESTER');
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
            <UsersIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-foreground">Gestão de Usuários</h1>
            <p className="text-sm text-muted-foreground">{users.length} usuários cadastrados</p>
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Novo Usuário</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Usuário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Nome</Label>
                <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nome completo" />
              </div>
              <div>
                <Label>E-mail</Label>
                <Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="email@empresa.com" />
              </div>
              <div>
                <Label>Perfil</Label>
                <Select value={newRole} onValueChange={v => setNewRole(v as UserRole)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REQUESTER">Usuário</SelectItem>
                    <SelectItem value="AGENT">Analista</SelectItem>
                    <SelectItem value="MANAGER">Gestor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAdd} className="w-full">Adicionar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border border-border card-gradient">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden sm:table-cell">E-mail</TableHead>
              <TableHead>Perfil</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    onValueChange={v => {
                      updateUserRole(user.id, v as UserRole);
                      toast.success(`Perfil de ${user.name} atualizado`);
                    }}
                    disabled={user.id === currentUser.id}
                  >
                    <SelectTrigger className="w-[130px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REQUESTER">Usuário</SelectItem>
                      <SelectItem value="AGENT">Analista</SelectItem>
                      <SelectItem value="MANAGER">Gestor</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
