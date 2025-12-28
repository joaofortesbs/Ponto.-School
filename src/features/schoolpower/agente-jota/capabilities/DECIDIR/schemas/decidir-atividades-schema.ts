import { z } from 'zod';

export const decidirAtividadesCriarSchema = z.object({
  atividades_disponiveis: z.array(z.object({
    id: z.string(),
    titulo: z.string(),
    tipo: z.string(),
    materia: z.string(),
    nivel_dificuldade: z.string(),
    tags: z.array(z.string()),
    template: z.any()
  })).describe('Lista de atividades disponíveis da pesquisa anterior'),
  
  criterios_decisao: z.object({
    objetivo_pedagogico: z.string().describe('O que se quer ensinar/reforçar'),
    quantidade: z.number().min(1).max(10).describe('Quantas atividades criar'),
    priorizar: z.enum(['variedade', 'progressao', 'focado']).optional()
      .describe('variedade: tipos diferentes; progressao: do fácil ao difícil; focado: mesmo tema'),
    nivel_turma: z.enum(['basico', 'intermediario', 'avancado']).optional()
  }),

  contexto_turma: z.object({
    turma_id: z.string().optional(),
    desempenho_medio: z.number().min(0).max(100).optional(),
    gaps_aprendizado: z.array(z.string()).optional(),
    preferencias_alunos: z.array(z.string()).optional()
  }).optional()
});

export type DecidirAtividadesCriarInput = z.infer<typeof decidirAtividadesCriarSchema>;
