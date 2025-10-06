-- Fix RLS on pre-existing tables
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.n8n_chat_histories ENABLE ROW LEVEL SECURITY;

-- Add basic policies for documents (adjust based on your needs)
CREATE POLICY "Public read access for documents"
  ON public.documents
  FOR SELECT
  USING (true);

-- Add basic policies for n8n_chat_histories (adjust based on your needs)
CREATE POLICY "Users can view their own chat history"
  ON public.n8n_chat_histories
  FOR SELECT
  TO authenticated
  USING (true);