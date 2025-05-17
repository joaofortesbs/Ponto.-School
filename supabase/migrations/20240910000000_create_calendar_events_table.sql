-- Criação da tabela de eventos do calendário
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  discipline TEXT,
  description TEXT,
  professor TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  start_time TEXT,
  end_time TEXT,
  duration TEXT,
  all_day BOOLEAN DEFAULT FALSE,
  is_online BOOLEAN DEFAULT FALSE,
  location TEXT,
  meeting_link TEXT,
  reminders JSONB DEFAULT '[]',
  repeat TEXT DEFAULT 'none',
  guests JSONB DEFAULT '[]',
  visibility TEXT DEFAULT 'private',
  attachments JSONB DEFAULT '[]',
  color TEXT,
  details TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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