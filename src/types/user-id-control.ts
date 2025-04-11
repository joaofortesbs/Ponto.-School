
/**
 * Interface para a tabela de controle de IDs de usuário
 */
export interface UserIdControl {
  id: number;
  email: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Interface para criação de um novo registro de controle de ID
 */
export interface CreateUserIdControl {
  email: string;
  user_id: string;
  created_at: string;
}
