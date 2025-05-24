
/**
 * Serviço para acesso ao banco de dados Replit PostgreSQL
 */

import { dbPool, query } from '@/lib/replitDb';

// Interfaces
export interface UserProfile {
  id: string;
  display_name?: string;
  avatar_url?: string;
  email?: string;
  username?: string;
  level?: number;
  rank?: string;
  balance?: number;
}

export interface GrupoEstudo {
  id: string;
  user_id: string;
  nome: string;
  descricao?: string;
  cor: string;
  membros: number;
  topico?: string;
  topico_nome?: string;
  topico_icon?: string;
  privado: boolean;
  visibilidade: string;
  codigo?: string;
  data_criacao: Date;
}

// Funções para manipulação do perfil de usuário
export const getProfileById = async (userId: string): Promise<UserProfile | null> => {
  try {
    const result = await query('SELECT * FROM profiles WHERE id = $1', [userId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return null;
  }
};

export const updateProfile = async (userId: string, profileData: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    // Criar a lista de campos para atualizar dinamicamente
    const fields = Object.keys(profileData).filter(key => key !== 'id');
    
    if (fields.length === 0) {
      return null;
    }
    
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = [userId, ...fields.map(field => profileData[field as keyof Partial<UserProfile>])];
    
    const query = `
      UPDATE profiles 
      SET ${setClause}, updated_at = NOW() 
      WHERE id = $1 
      RETURNING *
    `;
    
    const result = await query(query, values);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return null;
  }
};

// Funções para manipulação de grupos de estudo
export const getGruposEstudo = async (userId: string): Promise<GrupoEstudo[]> => {
  try {
    const result = await query('SELECT * FROM grupos_estudo WHERE user_id = $1 ORDER BY data_criacao DESC', [userId]);
    return result.rows;
  } catch (error) {
    console.error('Erro ao buscar grupos de estudo:', error);
    return [];
  }
};

export const createGrupoEstudo = async (grupoData: Omit<GrupoEstudo, 'id' | 'data_criacao'>): Promise<GrupoEstudo | null> => {
  try {
    const fields = Object.keys(grupoData);
    const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');
    const values = fields.map(field => grupoData[field as keyof typeof grupoData]);
    
    const query = `
      INSERT INTO grupos_estudo (${fields.join(', ')}) 
      VALUES (${placeholders}) 
      RETURNING *
    `;
    
    const result = await query(query, values);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Erro ao criar grupo de estudo:', error);
    return null;
  }
};

export const getGrupoEstudoByCodigo = async (codigo: string): Promise<GrupoEstudo | null> => {
  try {
    const result = await query('SELECT * FROM grupos_estudo WHERE codigo = $1', [codigo]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Erro ao buscar grupo por código:', error);
    return null;
  }
};

// Exportar todas as funções
export default {
  getProfileById,
  updateProfile,
  getGruposEstudo,
  createGrupoEstudo,
  getGrupoEstudoByCodigo,
};
