import { z } from 'zod';

export const pesquisarBancoQuestoesSchema = z.object({
  componente: z.string().optional().describe('Componente curricular (ex: Matemática, Língua Portuguesa, Ciências, História, Geografia)'),
  ano_serie: z.string().optional().describe('Ano/série (ex: 1º Ano, 7º Ano, 9º Ano, Ensino Médio)'),
  tema: z.string().optional().describe('Tema ou assunto específico (ex: frações, fotossíntese, revolução francesa)'),
  dificuldade: z.enum(['facil', 'medio', 'dificil']).optional().describe('Nível de dificuldade desejado'),
  tipo_questao: z.enum(['multipla_escolha', 'dissertativa', 'verdadeiro_falso', 'todos']).optional().default('todos').describe('Tipo de questão desejado'),
  max_resultados: z.number().optional().default(5).describe('Número máximo de questões retornadas (padrão: 5)')
});

export type PesquisarBancoQuestoesInput = z.infer<typeof pesquisarBancoQuestoesSchema>;
