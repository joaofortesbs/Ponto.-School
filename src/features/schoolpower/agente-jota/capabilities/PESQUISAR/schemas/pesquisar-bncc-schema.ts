import { z } from 'zod';

export const pesquisarBnccSchema = z.object({
  componente: z.string().optional().describe('Componente curricular (ex: Matemática, Língua Portuguesa, Ciências, História, Geografia)'),
  ano_serie: z.string().optional().describe('Ano/série (ex: 1º Ano, 7º Ano, 9º Ano)'),
  busca_texto: z.string().optional().describe('Busca livre por palavra-chave na descrição da habilidade ou objeto de conhecimento'),
  codigo: z.string().optional().describe('Código específico da habilidade BNCC (ex: EF07MA17, EF09CI06)'),
  max_resultados: z.number().optional().default(5).describe('Número máximo de habilidades retornadas (padrão: 5)')
});

export type PesquisarBnccInput = z.infer<typeof pesquisarBnccSchema>;
