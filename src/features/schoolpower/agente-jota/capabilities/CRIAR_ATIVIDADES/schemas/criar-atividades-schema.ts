import { z } from 'zod';

export const criarAtividadesSchema = z.object({
  atividades_decididas: z.array(z.object({
    id: z.string(),
    titulo: z.string(),
    tipo: z.string().optional(),
    materia: z.string().optional(),
    nivel_dificuldade: z.string().optional(),
    tags: z.array(z.string()).optional(),
    template: z.any().optional(),
    justificativa: z.string().optional(),
    ordem_sugerida: z.number().optional()
  })).describe('Atividades que foram decididas na etapa anterior'),

  configuracoes_criacao: z.object({
    turma_id: z.string().optional(),
    data_disponibilizacao: z.string().optional(),
    prazo_entrega: z.string().optional(),
    permitir_tentativas_multiplas: z.boolean().optional().default(true),
    feedback_automatico: z.boolean().optional().default(true)
  }).optional()
});

export type CriarAtividadesInput = z.infer<typeof criarAtividadesSchema>;

export interface CriacaoProgressUpdate {
  type: 'construcao:iniciada' | 'atividade:construindo' | 'atividade:progresso' | 'atividade:concluida' | 'atividade:erro' | 'construcao:concluida';
  total_atividades?: number;
  atividades?: Array<{
    id: string;
    titulo: string;
    status: 'aguardando' | 'construindo' | 'concluida' | 'erro';
    progresso: number;
  }>;
  atividade_index?: number;
  atividade_id?: string;
  titulo?: string;
  progresso?: number;
  atividade_criada_id?: string;
  erro?: string;
  total_criadas?: number;
  total_esperadas?: number;
}
