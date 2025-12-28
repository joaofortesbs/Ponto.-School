import { z } from 'zod';

export const CriteriosDecisaoSchema = z.object({
  objetivo_pedagogico: z.string().describe('Objetivo pedagógico principal'),
  quantidade: z.number().min(1).max(10).default(3).describe('Quantidade de atividades desejadas'),
  priorizar: z.enum(['variedade', 'progressao', 'focado']).optional().describe('Abordagem prioritária'),
  nivel_turma: z.enum(['basico', 'intermediario', 'avancado']).optional().describe('Nível da turma')
});

export const ContextoTurmaSchema = z.object({
  turma_id: z.string().optional(),
  materia: z.string().optional(),
  nivel_ensino: z.string().optional(),
  desempenho_medio: z.number().min(0).max(100).optional(),
  gaps_aprendizado: z.array(z.string()).optional(),
  preferencias_alunos: z.array(z.string()).optional()
});

export const AtividadeDisponivelSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  tipo: z.string(),
  categoria: z.string().optional(),
  materia: z.string(),
  nivel_dificuldade: z.string(),
  tags: z.array(z.string()),
  descricao: z.string().optional(),
  campos_obrigatorios: z.array(z.string()).optional(),
  campos_opcionais: z.array(z.string()).optional(),
  schema_campos: z.record(z.any()).optional(),
  template: z.any().optional()
});

export const decidirAtividadesCriarSchema = z.object({
  atividades_disponiveis: z.array(AtividadeDisponivelSchema)
    .describe('Lista de atividades disponíveis da pesquisa anterior'),
  criterios_decisao: CriteriosDecisaoSchema.optional(),
  contexto_turma: ContextoTurmaSchema.optional()
});

export type DecidirAtividadesCriarInput = z.infer<typeof decidirAtividadesCriarSchema>;

export interface AtividadeEscolhida {
  id: string;
  titulo: string;
  tipo: string;
  materia: string;
  nivel_dificuldade: string;
  tags: string[];
  campos_obrigatorios: string[];
  campos_opcionais: string[];
  schema_campos: Record<string, any>;
  campos_preenchidos: Record<string, any>;
  justificativa: string;
  ordem_sugerida: number;
  status_construcao: 'aguardando' | 'construindo' | 'concluido' | 'erro';
  progresso: number;
}

export interface DecidirAtividadesOutput {
  success: boolean;
  decisao: {
    total_selecionado: number;
    atividades: AtividadeEscolhida[];
    estrategia_aplicada: string;
    pronto_para_criar: boolean;
  };
  atividades_escolhidas: AtividadeEscolhida[];
  mensagem: string;
  pronto_para_criar: boolean;
}
