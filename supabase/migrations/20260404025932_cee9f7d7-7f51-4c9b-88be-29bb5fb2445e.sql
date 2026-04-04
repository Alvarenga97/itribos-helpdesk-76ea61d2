
CREATE TABLE public.star_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL UNIQUE REFERENCES public.tickets(id) ON DELETE CASCADE,
  situation text NOT NULL DEFAULT '',
  task text NOT NULL DEFAULT '',
  action text NOT NULL DEFAULT '',
  result text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.star_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read STAR summaries for accessible tickets"
ON public.star_summaries
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tickets t
    WHERE t.id = star_summaries.ticket_id
    AND (t.created_by = auth.uid() OR is_agent_or_above(auth.uid()))
  )
);
