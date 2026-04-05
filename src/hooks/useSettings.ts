import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Settings {
  id: string;
  org_name: string;
  org_slug: string;
  report_time: string;
  report_timezone: string;
  report_emails: string[];
  sla_critical_response: string;
  sla_critical_resolution: string;
  sla_high_response: string;
  sla_high_resolution: string;
  sla_medium_response: string;
  sla_medium_resolution: string;
  sla_low_response: string;
  sla_low_resolution: string;
  updated_at: string;
}

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings' as any)
        .select('*')
        .limit(1)
        .single();
      if (error) throw error;
      return data as unknown as Settings;
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Omit<Settings, 'id' | 'updated_at'>>) => {
      const { data: existing } = await supabase
        .from('settings' as any)
        .select('id')
        .limit(1)
        .single();

      if (!existing) throw new Error('Settings not found');

      const { error } = await supabase
        .from('settings' as any)
        .update({ ...updates, updated_at: new Date().toISOString() } as any)
        .eq('id', (existing as any).id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}
