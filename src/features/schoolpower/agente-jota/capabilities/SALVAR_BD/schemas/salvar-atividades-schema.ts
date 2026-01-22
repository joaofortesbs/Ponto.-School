/**
 * SCHEMA: salvar_atividades_bd
 * 
 * Define a estrutura de entrada e validação para a capacidade
 * de persistência de atividades no banco de dados Neon.
 */

export const salvarAtividadesBdSchema = {
  type: 'object',
  properties: {
    user_id: {
      type: 'string',
      description: 'ID do usuário que está salvando as atividades'
    },
    session_id: {
      type: 'string',
      description: 'ID da sessão de execução atual'
    },
    force_save: {
      type: 'boolean',
      description: 'Forçar salvamento mesmo com warnings (não recomendado)',
      default: false
    },
    skip_validation: {
      type: 'boolean',
      description: 'Pular validação de campos (apenas para debug)',
      default: false
    }
  },
  required: ['user_id']
};

export interface SalvarAtividadesBdInput {
  user_id: string;
  session_id?: string;
  force_save?: boolean;
  skip_validation?: boolean;
}

export interface AtividadeParaSalvar {
  id: string;
  tipo: string;
  titulo: string;
  campos_preenchidos: Record<string, any>;
  metadata?: {
    criado_em: string;
    pipeline_version: string;
    model_used?: string;
    original_id?: string;
    storage_key?: string;
  };
}

export interface ResultadoSalvamento {
  activity_id: string;
  success: boolean;
  saved_at?: string;
  error?: string;
  db_response?: any;
}

export interface SalvarAtividadesBdOutput {
  total_collected: number;
  total_validated: number;
  total_saved: number;
  total_failed: number;
  results: ResultadoSalvamento[];
  validation_errors: Array<{
    activity_id: string;
    errors: string[];
  }>;
}

export default salvarAtividadesBdSchema;
