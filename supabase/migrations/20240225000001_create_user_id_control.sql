-- Create user_id_control table for managing sequential IDs
CREATE TABLE IF NOT EXISTS user_id_control (
    uf CHAR(2) NOT NULL,
    ano_mes CHAR(4) NOT NULL,
    tipo_conta INT NOT NULL,
    next_id INT NOT NULL,
    PRIMARY KEY (uf, ano_mes, tipo_conta)
);

-- Add user_id column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_id CHAR(13);
ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);
