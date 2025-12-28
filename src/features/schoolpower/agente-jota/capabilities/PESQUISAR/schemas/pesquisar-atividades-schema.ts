import { z } from 'zod';

export const pesquisarAtividadesDisponiveisSchema = z.object({
  filtros: z.object({
    materia: z.string().optional().describe('Matéria/disciplina (ex: matematica, portugues)'),
    tipo: z.string().optional().describe('Tipo de atividade (ex: exercicio, quiz, projeto)'),
    nivel_dificuldade: z.enum(['basico', 'intermediario', 'avancado']).optional(),
    tags: z.array(z.string()).optional().describe('Tags para filtrar (ex: ["algebra", "equacoes"])'),
    busca_texto: z.string().optional().describe('Busca livre no título/descrição')
  }).optional()
});

export type PesquisarAtividadesDisponiveisInput = z.infer<typeof pesquisarAtividadesDisponiveisSchema>;
