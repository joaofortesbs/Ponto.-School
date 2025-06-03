
export interface FormData {
  nome: string;
  descricao: string;
  topico: string;
  cor: string;
  isPublico: boolean;
  isPrivado: boolean;
  permitirVisibilidade: boolean;
}

export interface Group {
  id: string;
  nome: string;
  descricao?: string;
  topico: string;
  topico_nome?: string;
  topico_icon?: string;
  cor: string;
  codigo_unico: string;
  is_publico: boolean;
  privado: boolean;
  permitir_visibilidade: boolean;
  membros: number;
  user_id: string;
  data_criacao?: string;
  created_at?: string;
  updated_at?: string;
}
