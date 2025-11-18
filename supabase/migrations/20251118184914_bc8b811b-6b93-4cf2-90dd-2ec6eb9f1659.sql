-- Create abandoned_carts table to track incomplete orders
CREATE TABLE IF NOT EXISTS public.abandoned_carts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  customer_name TEXT,
  phone TEXT,
  district TEXT,
  state TEXT,
  address TEXT,
  selected_option TEXT,
  quantity INTEGER DEFAULT 1,
  delivery_method TEXT,
  ttclid TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  webhook_sent BOOLEAN DEFAULT FALSE,
  webhook_sent_at TIMESTAMP WITH TIME ZONE,
  order_completed BOOLEAN DEFAULT FALSE,
  order_completed_at TIMESTAMP WITH TIME ZONE
);

-- Create index for efficient querying
CREATE INDEX idx_abandoned_carts_webhook_sent ON public.abandoned_carts(webhook_sent, created_at) WHERE webhook_sent = FALSE AND order_completed = FALSE;
CREATE INDEX idx_abandoned_carts_session ON public.abandoned_carts(session_id);

-- Enable RLS (but make it public for now since we don't have user auth)
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (since no user authentication)
CREATE POLICY "Allow all operations on abandoned_carts" 
ON public.abandoned_carts 
FOR ALL 
USING (true) 
WITH CHECK (true);