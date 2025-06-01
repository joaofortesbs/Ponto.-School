
-- Atualizar a estrutura da tabela user_settings para suportar métodos de pagamento
-- Adicionar colunas específicas se necessário (JSONB já suporta estruturas complexas)

-- Verificar se a tabela existe e criar se necessário
DO $$ 
BEGIN
    -- Verificar se a tabela user_settings existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_settings') THEN
        -- Criar tabela se não existir
        CREATE TABLE user_settings (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            security_settings JSONB DEFAULT '{}',
            notification_settings JSONB DEFAULT '{}',
            payment_settings JSONB DEFAULT '{}',
            privacy_settings JSONB DEFAULT '{}',
            wallet_settings JSONB DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
            UNIQUE(user_id)
        );
        
        -- Criar índice
        CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
        
        -- Habilitar RLS
        ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
        
        -- Criar políticas RLS
        CREATE POLICY "Users can view own settings" ON user_settings
            FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert own settings" ON user_settings
            FOR INSERT WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update own settings" ON user_settings
            FOR UPDATE USING (auth.uid() = user_id);

        CREATE POLICY "Users can delete own settings" ON user_settings
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Função para validar estrutura de métodos de pagamento
CREATE OR REPLACE FUNCTION validate_payment_methods()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar estrutura do payment_settings
    IF NEW.payment_settings IS NOT NULL THEN
        -- Verificar se paymentMethods é um array válido
        IF NEW.payment_settings ? 'paymentMethods' THEN
            IF NOT (NEW.payment_settings->'paymentMethods')::jsonb ? 0 
               AND NOT (NEW.payment_settings->'paymentMethods' = 'null'::jsonb)
               AND NOT (NEW.payment_settings->'paymentMethods' = '[]'::jsonb) THEN
                -- Validar cada método de pagamento
                FOR i IN 0..jsonb_array_length(NEW.payment_settings->'paymentMethods')-1 LOOP
                    DECLARE
                        payment_method JSONB := NEW.payment_settings->'paymentMethods'->i;
                    BEGIN
                        -- Verificar campos obrigatórios
                        IF NOT (payment_method ? 'id' AND payment_method ? 'type' AND payment_method ? 'last4') THEN
                            RAISE EXCEPTION 'Invalid payment method structure';
                        END IF;
                    END;
                END LOOP;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para validação
DROP TRIGGER IF EXISTS validate_payment_methods_trigger ON user_settings;
CREATE TRIGGER validate_payment_methods_trigger
    BEFORE INSERT OR UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION validate_payment_methods();

-- Função para criptografar dados sensíveis (placeholder - implementar com pgcrypto se necessário)
CREATE OR REPLACE FUNCTION encrypt_payment_data(data TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Por enquanto, retorna o hash MD5 para demonstração
    -- Em produção, usar pgcrypto ou similar para criptografia adequada
    RETURN md5(data);
END;
$$ LANGUAGE plpgsql;

-- Comentários para documentação
COMMENT ON TABLE user_settings IS 'Configurações de usuário incluindo métodos de pagamento seguros';
COMMENT ON COLUMN user_settings.payment_settings IS 'Configurações de pagamento em formato JSONB com validação';

-- Inserir configurações padrão para usuários existentes sem configurações
INSERT INTO user_settings (user_id, payment_settings, security_settings, notification_settings, privacy_settings, wallet_settings)
SELECT 
    id,
    '{"paymentMethods": [], "autoRenewal": true, "billingAddress": "", "invoiceEmail": ""}'::jsonb,
    '{"twoFactorEnabled": false, "loginNotifications": true, "sessionTimeout": "30"}'::jsonb,
    '{"emailNotifications": true, "pushNotifications": true, "studyReminders": true, "weeklyReports": false, "soundEnabled": true}'::jsonb,
    '{"profileVisibility": "public", "showEmail": false, "showPhone": false, "allowMessages": true, "dataCollection": true}'::jsonb,
    '{"balance": 0, "currency": "BRL", "autoTopUp": false, "spendingLimit": 0}'::jsonb
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM user_settings)
ON CONFLICT (user_id) DO NOTHING;
