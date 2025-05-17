
-- Verifica se a tabela calendar_events existe e a cria se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'calendar_events'
  ) THEN
    CREATE TABLE public.calendar_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT,
      start_date DATE NOT NULL,
      end_date DATE,
      start_time TEXT,
      end_time TEXT,
      location TEXT,
      is_online BOOLEAN DEFAULT false,
      meeting_link TEXT,
      type TEXT DEFAULT 'evento',
      discipline TEXT,
      professor TEXT,
      reminders JSONB,
      repeat TEXT DEFAULT 'none',
      visibility TEXT DEFAULT 'private',
      user_id UUID NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      all_day BOOLEAN DEFAULT false
    );

    -- Adicionar índice para melhorar a consulta por usuário
    CREATE INDEX idx_calendar_events_user_id ON public.calendar_events(user_id);
    CREATE INDEX idx_calendar_events_start_date ON public.calendar_events(start_date);
    
    -- RLS - Segurança por linhas
    ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
    
    -- Políticas para controlar acesso aos dados
    CREATE POLICY "Usuários podem ver seus próprios eventos"
      ON public.calendar_events
      FOR SELECT
      USING (auth.uid() = user_id);
      
    CREATE POLICY "Usuários podem inserir seus próprios eventos"
      ON public.calendar_events
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
      
    CREATE POLICY "Usuários podem atualizar seus próprios eventos"
      ON public.calendar_events
      FOR UPDATE
      USING (auth.uid() = user_id);
      
    CREATE POLICY "Usuários podem deletar seus próprios eventos"
      ON public.calendar_events
      FOR DELETE
      USING (auth.uid() = user_id);
  ELSE
    -- Garantir que a coluna all_day exista na tabela
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'calendar_events' 
      AND column_name = 'all_day'
    ) THEN
      ALTER TABLE public.calendar_events ADD COLUMN all_day BOOLEAN DEFAULT false;
    END IF;
  END IF;
END
$$;
