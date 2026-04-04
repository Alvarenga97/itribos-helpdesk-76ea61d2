import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface TicketRow {
  id: string;
  ticket_number: number;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_REQUESTER' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category_id: string | null;
  created_by: string;
  assigned_to: string | null;
  sla_deadline: string | null;
  sla_breached: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  // Joined
  category?: { id: string; name: string; color: string } | null;
  requester?: { id: string; name: string; email: string } | null;
  assignee?: { id: string; name: string; email: string } | null;
}

export function useTickets(statusFilter?: string) {
  return useQuery({
    queryKey: ['tickets', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('tickets')
        .select(`
          *,
          category:categories(id, name, color),
          requester:profiles!tickets_created_by_fkey(id, name, email),
          assignee:profiles!tickets_assigned_to_fkey(id, name, email)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'ALL') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as TicketRow[];
    },
  });
}

export function useTicket(id: string | undefined) {
  return useQuery({
    queryKey: ['ticket', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          category:categories(id, name, color),
          requester:profiles!tickets_created_by_fkey(id, name, email),
          assignee:profiles!tickets_assigned_to_fkey(id, name, email)
        `)
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as TicketRow;
    },
  });
}

export function useTicketComments(ticketId: string | undefined) {
  return useQuery({
    queryKey: ['ticket-comments', ticketId],
    enabled: !!ticketId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ticket_comments')
        .select(`
          *,
          author:profiles!ticket_comments_user_id_fkey(id, name, email)
        `)
        .eq('ticket_id', ticketId!)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (ticket: {
      title: string;
      description: string;
      category_id: string;
      priority: string;
    }) => {
      const { data, error } = await supabase
        .from('tickets')
        .insert({
          ...ticket,
          created_by: user!.id,
          priority: ticket.priority as any,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (comment: {
      ticket_id: string;
      content: string;
      is_internal: boolean;
    }) => {
      const { data, error } = await supabase
        .from('ticket_comments')
        .insert({
          ...comment,
          user_id: user!.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticket-comments', variables.ticket_id] });
    },
  });
}

export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updateData: any = { status };
      if (status === 'RESOLVED') {
        updateData.resolved_at = new Date().toISOString();
      }
      const { error } = await supabase
        .from('tickets')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.id] });
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data ?? [];
    },
  });
}
