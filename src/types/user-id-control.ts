/**
 * Interface para representar o controle de ID de usuário no banco de dados
 */
export interface UserIdControl {
  id: number;
  country_code: string;
  plan_type: number;
  last_sequence: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserIdControlRecord {
  id: string;
  country_code: string;
  plan_type: string;
  last_sequence: number;
}