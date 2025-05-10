
-- Create table for study groups
CREATE TABLE IF NOT EXISTS grupos_estudo (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  icon TEXT,
  cor TEXT NOT NULL,
  membros INTEGER NOT NULL DEFAULT 1,
  topico TEXT,
  disciplina TEXT,
  tendencia TEXT,
  novoConteudo BOOLEAN DEFAULT FALSE,
  criador TEXT,
  dataCriacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS grupos_estudo_user_id_idx ON grupos_estudo(user_id);

-- Set up RLS (Row Level Security)
ALTER TABLE grupos_estudo ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own groups
CREATE POLICY "Users can view their own groups" 
  ON grupos_estudo 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own groups
CREATE POLICY "Users can insert their own groups" 
  ON grupos_estudo 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own groups
CREATE POLICY "Users can update their own groups" 
  ON grupos_estudo 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own groups
CREATE POLICY "Users can delete their own groups" 
  ON grupos_estudo 
  FOR DELETE 
  USING (auth.uid() = user_id);
