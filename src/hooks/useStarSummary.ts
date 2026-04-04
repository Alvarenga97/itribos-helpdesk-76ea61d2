import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface StarSummary {
  id: string;
  ticket_id: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  created_at: string;
}

export function useStarSummary(ticketId: string | undefined) {
  return useQuery({
    queryKey: ['star-summary', ticketId],
    enabled: !!ticketId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('star_summaries')
        .select('*')
        .eq('ticket_id', ticketId!)
        .maybeSingle();
      if (error) throw error;
      return data as StarSummary | null;
    },
  });
}

export function useGenerateStarSummary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticketId: string) => {
      const { data, error } = await supabase.functions.invoke('generate-star-summary', {
        body: { ticket_id: ticketId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, ticketId) => {
      queryClient.invalidateQueries({ queryKey: ['star-summary', ticketId] });
    },
  });
}
