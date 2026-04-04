import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UserWithRole {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
  role: string;
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name');
      if (error) throw error;

      const { data: roles } = await supabase.from('user_roles').select('*');
      const roleMap = new Map<string, string>();
      (roles ?? []).forEach(r => {
        const existing = roleMap.get(r.user_id);
        const priority: Record<string, number> = { ADMIN: 1, MANAGER: 2, AGENT: 3, REQUESTER: 4 };
        if (!existing || (priority[r.role] || 5) < (priority[existing] || 5)) {
          roleMap.set(r.user_id, r.role);
        }
      });

      return (profiles ?? []).map(p => ({
        ...p,
        role: roleMap.get(p.id) || 'REQUESTER',
      })) as UserWithRole[];
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: { name: string; email: string; password: string; role: string }) => {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: { action: 'create', ...user },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: { action: 'update_role', user_id: userId, role },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}
