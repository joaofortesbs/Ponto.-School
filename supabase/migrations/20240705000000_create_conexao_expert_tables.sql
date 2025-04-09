
-- Criar tabela de pedidos de ajuda (requests)
CREATE TABLE IF NOT EXISTS requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  subject TEXT NOT NULL,
  difficulty TEXT,
  urgency BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tags TEXT[],
  auction JSONB
);

-- Criar tabela de respostas (responses)
CREATE TABLE IF NOT EXISTS responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  expert_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL,
  price INTEGER NOT NULL,
  response_time TEXT
);

-- Criar tabela de mensagens (messages)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES profiles(id),
  receiver_id UUID REFERENCES profiles(id),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);

-- Criar tabela de feedback (feedback)
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  response_id UUID REFERENCES responses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  rating INTEGER NOT NULL,
  comment TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar colunas de balance e expert_balance na tabela profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS balance INTEGER DEFAULT 150;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS expert_balance INTEGER DEFAULT 320;

-- Configurar RLS (segurança em nível de linha)
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Políticas para requests
CREATE POLICY "Permitir leitura pública de pedidos" 
ON requests FOR SELECT USING (true);

CREATE POLICY "Permitir inserção pelo próprio usuário" 
ON requests FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Permitir atualização pelo próprio usuário" 
ON requests FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para responses
CREATE POLICY "Permitir leitura pública de respostas" 
ON responses FOR SELECT USING (true);

CREATE POLICY "Permitir inserção pelo próprio expert" 
ON responses FOR INSERT WITH CHECK (auth.uid() = expert_id);

CREATE POLICY "Permitir atualização pelo próprio expert ou usuário do pedido" 
ON responses FOR UPDATE USING (
  auth.uid() = expert_id OR 
  auth.uid() IN (
    SELECT user_id FROM requests WHERE id = request_id
  )
);

-- Políticas para messages
CREATE POLICY "Permitir leitura para remetentes e destinatários" 
ON messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);

CREATE POLICY "Permitir inserção pelo próprio remetente" 
ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Permitir atualização pelo próprio destinatário" 
ON messages FOR UPDATE USING (auth.uid() = receiver_id);

-- Políticas para feedback
CREATE POLICY "Permitir leitura pública de feedback" 
ON feedback FOR SELECT USING (true);

CREATE POLICY "Permitir inserção pelo próprio usuário" 
ON feedback FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Permitir atualização pelo próprio usuário" 
ON feedback FOR UPDATE USING (auth.uid() = user_id);
