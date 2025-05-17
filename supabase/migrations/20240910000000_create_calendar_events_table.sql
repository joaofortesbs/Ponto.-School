
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  discipline TEXT,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  start_time TEXT,
  all_day BOOLEAN DEFAULT false,
  is_online BOOLEAN DEFAULT false,
  location TEXT,
  color TEXT,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT calendar_events_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Criar índice para pesquisas mais eficientes
CREATE INDEX IF NOT EXISTS calendar_events_user_id_idx ON public.calendar_events(user_id);
CREATE INDEX IF NOT EXISTS calendar_events_start_date_idx ON public.calendar_events(start_date);

-- Configurar RLS (Row Level Security)
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view their own calendar events"
  ON public.calendar_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendar events"
  ON public.calendar_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar events"
  ON public.calendar_events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar events"
  ON public.calendar_events FOR DELETE
  USING (auth.uid() = user_id);
