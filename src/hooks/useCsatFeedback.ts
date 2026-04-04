import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useCsatFeedback(ticketId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['csat-feedback', ticketId],
    enabled: !!ticketId && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('csat_feedback')
        .select('*')
        .eq('ticket_id', ticketId!)
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useSubmitCsatFeedback() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (feedback: {
      ticket_id: string;
      rating: number;
      comment?: string;
    }) => {
      const { data, error } = await supabase
        .from('csat_feedback')
        .insert({
          ...feedback,
          user_id: user!.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['csat-feedback', variables.ticket_id] });
    },
  });
}
