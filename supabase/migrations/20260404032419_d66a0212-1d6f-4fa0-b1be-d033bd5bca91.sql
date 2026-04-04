-- Settings table (singleton pattern)
CREATE TABLE public.settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_name text NOT NULL DEFAULT 'Empresa Tech Ltda',
  org_slug text NOT NULL DEFAULT 'empresa-tech',
  report_time text NOT NULL DEFAULT '18:00',
  report_timezone text NOT NULL DEFAULT 'America/Sao_Paulo',
  webhook_url text NOT NULL DEFAULT '',
  sla_critical_response text NOT NULL DEFAULT '15 min',
  sla_critical_resolution text NOT NULL DEFAULT '2h',
  sla_high_response text NOT NULL DEFAULT '30 min',
  sla_high_resolution text NOT NULL DEFAULT '4h',
  sla_medium_response text NOT NULL DEFAULT '2h',
  sla_medium_resolution text NOT NULL DEFAULT '24h',
  sla_low_response text NOT NULL DEFAULT '4h',
  sla_low_resolution text NOT NULL DEFAULT '48h',
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Only agents+ can read settings
CREATE POLICY "Agents+ can read settings"
ON public.settings FOR SELECT TO authenticated
USING (is_agent_or_above(auth.uid()));

-- Only agents+ can update settings
CREATE POLICY "Agents+ can update settings"
ON public.settings FOR UPDATE TO authenticated
USING (is_agent_or_above(auth.uid()))
WITH CHECK (is_agent_or_above(auth.uid()));

-- Insert default row
INSERT INTO public.settings (id) VALUES (gen_random_uuid());

-- Allow agents+ to delete tickets (not just admins)
DROP POLICY IF EXISTS "Only admins can delete tickets" ON public.tickets;
CREATE POLICY "Agents+ can delete tickets"
ON public.tickets FOR DELETE TO authenticated
USING (is_agent_or_above(auth.uid()));