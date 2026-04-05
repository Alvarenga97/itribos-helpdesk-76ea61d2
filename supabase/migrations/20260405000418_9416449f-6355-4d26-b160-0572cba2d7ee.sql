
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS report_emails text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.settings DROP COLUMN IF EXISTS webhook_url;
