
import { z } from 'zod';

export const defaultActivitySchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  difficulty: z.enum(['facil', 'medio', 'dificil']).default('medio'),
  duration: z.string().min(1, 'Duração é obrigatória'),
  instructions: z.string().optional(),
  category: z.enum(['exercicio', 'prova', 'jogo', 'projeto']).default('exercicio'),
});

export type DefaultActivityData = z.infer<typeof defaultActivitySchema>;

export const validateActivity = (data: any) => {
  try {
    return defaultActivitySchema.parse(data);
  } catch (error) {
    console.error('Validation error:', error);
    return null;
  }
};
