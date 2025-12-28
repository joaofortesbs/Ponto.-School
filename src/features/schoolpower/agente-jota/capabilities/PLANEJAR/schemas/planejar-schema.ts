import { z } from 'zod';

export const planejarPlanoAcaoSchema = z.object({
  objetivo: z.string().describe('Objetivo principal que o usuário deseja alcançar'),
  contexto: z.object({
    turma_id: z.string().optional(),
    materia: z.string().optional(),
    nivel_ensino: z.string().optional()
  }).optional(),
  preferencias: z.object({
    tipo_atividade_preferida: z.string().optional(),
    dificuldade: z.enum(['basico', 'intermediario', 'avancado']).optional()
  }).optional()
});

export type PlanejarPlanoAcaoInput = z.infer<typeof planejarPlanoAcaoSchema>;
