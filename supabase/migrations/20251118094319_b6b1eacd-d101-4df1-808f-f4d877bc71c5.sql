-- Create table for tracking page visits
CREATE TABLE IF NOT EXISTS public.page_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  page_path text NOT NULL DEFAULT '/',
  visited_at timestamp with time zone NOT NULL DEFAULT now(),
  user_agent text,
  UNIQUE(ip_address, page_path)
);

-- Enable RLS
ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;

-- Only admins can view visits
CREATE POLICY "Admins can view all visits"
ON public.page_visits
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow anonymous inserts for tracking (will be done via edge function)
CREATE POLICY "Anyone can insert visits"
ON public.page_visits
FOR INSERT
WITH CHECK (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_page_visits_ip ON public.page_visits(ip_address);
CREATE INDEX IF NOT EXISTS idx_page_visits_path ON public.page_visits(page_path);