import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Search, User, Mail, Shield, Trash2, Key, Loader2 } from 'lucide-react';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/contexts/RoleContext';
import bcrypt from 'bcryptjs';

export default function UserManagement() {
  const [userList, setUserList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { role } = useRole();

  // Bloqueio extra caso a rota falhe
  if (role !== 'AGENT' && role !== 'ADMIN' && role !== 'MANAGER') {
    return <div className="p-8 text-center">Acesso negado. Apenas analistas podem gerenciar usuários.</div>;
  }

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await db.select().from(users);
      setUserList(result);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar usuários",
        description: "Não foi possível carregar a lista do banco de dados.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const userRole = formData.get('role') as string;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.insert(users).values({
        name,
        email,
        password: hashedPassword,
        role: userRole as any,
      });
      
      toast({
        title: "Sucesso!",
        description: `Usuário ${name} criado com sucesso.`,
      });
      fetchUsers();
      e.target.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar usuário",
        description: "Verifique se o e-mail já está em uso.",
      });
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir ${name}?`)) return;
    
    try {
      await db.delete(users).where(eq(users.id, id));
      toast({
        title: "Usuário excluído",
        description: `${name} foi removido do sistema.`,
      });
      fetchUsers();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Não foi possível remover o usuário.",
      });
    }
  };

  const filteredUsers = userList.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Gestão de Usuários</h1>
          <p className="text-muted-foreground text-sm">Cadastre e gerencie os acessos ao portal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário de Criação */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border card-gradient p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <UserPlus className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">Novo Usuário</h2>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="text-xs font-medium uppercase text-muted-foreground mr-1">Nome Completo</label>
                <input name="name" required className="w-full mt-1 rounded-md border border-border bg-secondary px-3 py-2 text-sm focus:ring-1 focus:ring-ring focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium uppercase text-muted-foreground mr-1">E-mail</label>
                <input name="email" type="email" required className="w-full mt-1 rounded-md border border-border bg-secondary px-3 py-2 text-sm focus:ring-1 focus:ring-ring focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium uppercase text-muted-foreground mr-1">Senha Inicial</label>
                <input name="password" type="password" required className="w-full mt-1 rounded-md border border-border bg-secondary px-3 py-2 text-sm focus:ring-1 focus:ring-ring focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium uppercase text-muted-foreground mr-1">Cargo</label>
                <select name="role" required className="w-full mt-1 rounded-md border border-border bg-secondary px-3 py-2 text-sm focus:ring-1 focus:ring-ring focus:outline-none">
                  <option value="REQUESTER">Usuário (Requester)</option>
                  <option value="AGENT">Analista (Agent)</option>
                  <option value="MANAGER">Gestor (Manager)</option>
                </select>
              </div>
              <button type="submit" className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
                Criar Usuário
              </button>
            </form>
          </div>
        </div>

        {/* Lista de Usuários */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input 
              placeholder="Buscar por nome ou e-mail..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-medium">Nome</th>
                    <th className="px-4 py-3 font-medium">Cargo</th>
                    <th className="px-4 py-3 font-medium">Data</th>
                    <th className="px-4 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        Carregando usuários...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Nenhum usuário encontrado.</td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {u.name[0]}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{u.name}</p>
                              <p className="text-xs text-muted-foreground">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.role === 'AGENT' ? 'bg-blue-500/10 text-blue-500' : 
                            u.role === 'MANAGER' ? 'bg-purple-500/10 text-purple-500' : 
                            'bg-gray-500/10 text-gray-500'
                          }`}>
                            {u.role === 'AGENT' ? 'Analista' : u.role === 'MANAGER' ? 'Gestor' : 'Usuário'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button 
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
