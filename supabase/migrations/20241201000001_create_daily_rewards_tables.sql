
-- Tabela para histórico de recompensas diárias
CREATE TABLE IF NOT EXISTS user_daily_rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reward_type VARCHAR(20) NOT NULL CHECK (reward_type IN ('pontos', 'xp', 'moldura', 'badge', 'desconto', 'boost')),
    reward_value INTEGER NOT NULL DEFAULT 0,
    reward_name VARCHAR(50) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_user_daily_rewards_user_id ON user_daily_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_rewards_date ON user_daily_rewards(date);
CREATE INDEX IF NOT EXISTS idx_user_daily_rewards_user_date ON user_daily_rewards(user_id, date);

-- RLS (Row Level Security)
ALTER TABLE user_daily_rewards ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own daily rewards" ON user_daily_rewards
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily rewards" ON user_daily_rewards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Atualizar tabela user_streak se não existir
CREATE TABLE IF NOT EXISTS user_streak (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    consecutive_days INTEGER DEFAULT 0,
    last_login_date DATE DEFAULT CURRENT_DATE,
    max_streak INTEGER DEFAULT 0,
    total_days INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para user_streak
CREATE INDEX IF NOT EXISTS idx_user_streak_user_id ON user_streak(user_id);
CREATE INDEX IF NOT EXISTS idx_user_streak_last_login ON user_streak(last_login_date);

-- RLS para user_streak
ALTER TABLE user_streak ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_streak
CREATE POLICY "Users can view their own streak" ON user_streak
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streak" ON user_streak
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streak" ON user_streak
    FOR UPDATE USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_streak_updated_at 
    BEFORE UPDATE ON user_streak 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Adicionar coluna school_points na tabela profiles se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='school_points') THEN
        ALTER TABLE profiles ADD COLUMN school_points INTEGER DEFAULT 0;
    END IF;
END $$;

-- Função para calcular streak automaticamente
CREATE OR REPLACE FUNCTION calculate_user_streak(user_id_param UUID)
RETURNS TABLE(consecutive_days INTEGER, max_streak INTEGER, total_days INTEGER) AS $$
DECLARE
    current_streak INTEGER := 0;
    max_streak_val INTEGER := 0;
    total_days_val INTEGER;
    last_date DATE;
    prev_date DATE;
    rec RECORD;
BEGIN
    -- Contar total de dias únicos
    SELECT COUNT(DISTINCT date) INTO total_days_val
    FROM user_daily_rewards
    WHERE user_id = user_id_param;
    
    -- Calcular streak atual e máximo
    FOR rec IN 
        SELECT DISTINCT date 
        FROM user_daily_rewards 
        WHERE user_id = user_id_param 
        ORDER BY date DESC
    LOOP
        IF last_date IS NULL THEN
            last_date := rec.date;
            current_streak := 1;
        ELSIF last_date - rec.date = 1 THEN
            current_streak := current_streak + 1;
            last_date := rec.date;
        ELSE
            -- Quebra na sequência
            IF current_streak > max_streak_val THEN
                max_streak_val := current_streak;
            END IF;
            current_streak := 1;
            last_date := rec.date;
        END IF;
    END LOOP;
    
    -- Verificar se o streak atual é o máximo
    IF current_streak > max_streak_val THEN
        max_streak_val := current_streak;
    END IF;
    
    -- Se não há login hoje, zerar streak atual
    IF last_date != CURRENT_DATE AND (last_date IS NULL OR CURRENT_DATE - last_date > 1) THEN
        current_streak := 0;
    END IF;
    
    RETURN QUERY SELECT current_streak, max_streak_val, total_days_val;
END;
$$ LANGUAGE plpgsql;
