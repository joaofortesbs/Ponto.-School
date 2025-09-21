import { useState, useEffect } from 'react';
import { executeQuery } from '@/lib/neon-db';
import bcrypt from 'bcryptjs';

interface User {
  id: string;
  nome_completo: string;
  nome_usuario: string;
  email: string;
  tipo_conta: string;
  pais: string;
  estado: string;
  instituicao_ensino: string;
  created_at: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export function useNeonAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Verificar se o token é válido
      const userId = localStorage.getItem('user_id');
      if (userId) {
        const result = await executeQuery('SELECT * FROM perfis WHERE id = $1', [userId]);

        if (result.success && result.data.length > 0) {
          setAuthState({
            user: result.data[0],
            isLoading: false,
            isAuthenticated: true,
            error: null
          });
        } else {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_id');
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setAuthState(prev => ({ ...prev, isLoading: false, error: 'Erro ao verificar autenticação' }));
    }
  };

  const register = async (userData: {
    nome_completo: string;
    nome_usuario: string;
    email: string;
    senha: string;
    tipo_conta: string;
    pais: string;
    estado: string;
    instituicao_ensino: string;
  }) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      // Verificar se o email já existe
      const emailCheck = await executeQuery('SELECT id FROM perfis WHERE email = $1', [userData.email]);
      if (emailCheck.success && emailCheck.data.length > 0) {
        throw new Error('Este email já está cadastrado');
      }

      // Verificar se o nome de usuário já existe
      const userCheck = await executeQuery('SELECT id FROM perfis WHERE nome_usuario = $1', [userData.nomeUsuario]);
      if (userCheck.success && userCheck.data.length > 0) {
        throw new Error('Este nome de usuário já está em uso');
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(userData.senha, 12);

      // Inserir novo usuário
      const insertQuery = `
        INSERT INTO perfis (
          nome_completo, nome_usuario, email, senha_hash,
          tipo_conta, pais, estado, instituicao_ensino
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, nome_completo, nome_usuario, email, tipo_conta, pais, estado, instituicao_ensino, created_at
      `;

      const result = await executeQuery(insertQuery, [
        userData.nome_completo,
        userData.nome_usuario,
        userData.email,
        hashedPassword,
        userData.tipo_conta,
        userData.pais,
        userData.estado,
        userData.instituicao_ensino
      ]);

      if (result.success && result.data.length > 0) {
        const newUser = result.data[0];

        // Gerar token simples (em produção, use JWT)
        const token = btoa(`${newUser.id}:${Date.now()}`);

        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_id', newUser.id);

        setAuthState({
          user: newUser,
          isLoading: false,
          isAuthenticated: true,
          error: null
        });

        return { success: true, user: newUser };
      } else {
        throw new Error('Erro ao criar conta');
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar conta';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const login = async (email: string, senha: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await executeQuery('SELECT * FROM perfis WHERE email = $1', [email]);

      if (!result.success || result.data.length === 0) {
        throw new Error('Email ou senha incorretos');
      }

      const user = result.data[0];
      const isValidPassword = await bcrypt.compare(senha, user.senha_hash);

      if (!isValidPassword) {
        throw new Error('Email ou senha incorretos');
      }

      // Gerar token
      const token = btoa(`${user.id}:${Date.now()}`);

      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_id', user.id);

      // Remover senha do objeto user
      const { senha_hash, ...userWithoutPassword } = user;

      setAuthState({
        user: userWithoutPassword,
        isLoading: false,
        isAuthenticated: true,
        error: null
      });

      return { success: true, user: userWithoutPassword };
    } catch (error) {
      console.error('Erro no login:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer login';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null
    });
  };

  return {
    ...authState,
    register,
    login,
    logout,
    checkAuthStatus
  };
}