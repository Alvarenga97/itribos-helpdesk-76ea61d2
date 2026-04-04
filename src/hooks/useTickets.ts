import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type TicketStatus = Database['public']['Enums']['ticket_status'];
type TicketPriority = Database['public']['Enums']['ticket_priority'];

export interface TicketRow {
  id: string;
  ticket_number: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category_id: string | null;
  created_by: string;
  assigned_to: string | null;
  sla_deadline: string | null;
  sla_breached: boolean;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  // Joined
  category?: { id: string; name: string; color: string } | null;
  requester_profile?: { id: string; name: string; email: string } | null;
  assignee_profile?: { id: string; name: string; email: string } | null;
}

async function enrichTicketsWithProfiles(tickets: any[]): Promise<TicketRow[]> {
  if (tickets.length === 0) return [];

  const userIds = new Set<string>();
  tickets.forEach(t => {
    if (t.created_by) userIds.add(t.created_by);
    if (t.assigned_to) userIds.add(t.assigned_to);
  });

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, email')
    .in('id', Array.from(userIds));

  const profileMap = new Map((profiles ?? []).map(p => [p.id, p]));

  return tickets.map(t => ({
    ...t,
    category: t.categories ?? null,
    requester_profile: profileMap.get(t.created_by) ?? null,
    assignee_profile: t.assigned_to ? profileMap.get(t.assigned_to) ?? null : null,
  }));
}

export function useTickets(statusFilter?: string) {
  return useQuery({
    queryKey: ['tickets', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('tickets')
        .select('*, categories(*)')
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'ALL') {
        query = query.eq('status', statusFilter as TicketStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return enrichTicketsWithProfiles(data ?? []);
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
        .select('*, categories(*)')
        .eq('id', id!)
        .single();
      if (error) throw error;
      const [enriched] = await enrichTicketsWithProfiles([data]);
      return enriched;
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
        .select('*')
        .eq('ticket_id', ticketId!)
        .order('created_at', { ascending: true });
      if (error) throw error;

      // Enrich with profiles
      const userIds = new Set<string>();
      (data ?? []).forEach(c => userIds.add(c.user_id));

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', Array.from(userIds));

      const profileMap = new Map((profiles ?? []).map(p => [p.id, p]));

      return (data ?? []).map(c => ({
        ...c,
        author: profileMap.get(c.user_id) ?? { id: c.user_id, name: 'Desconhecido', email: '' },
      }));
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
          title: ticket.title,
          description: ticket.description,
          category_id: ticket.category_id || null,
          priority: ticket.priority as TicketPriority,
          created_by: user!.id,
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
    mutationFn: async ({ id, status }: { id: string; status: TicketStatus }) => {
      const updateData: Record<string, any> = { status };
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

export function useDeleteTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useAssignTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const { error } = await supabase
        .from('tickets')
        .update({ assigned_to: userId })
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
