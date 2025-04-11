
/**
 * Interface para representar o controle de ID de usuário no banco de dados
 */
export interface UserIdControl {
  id: string;
  email: string;
  user_id: string;
  created_at: string;
  country_code?: string;
  plan_type?: number;
  last_sequence?: number;
}
