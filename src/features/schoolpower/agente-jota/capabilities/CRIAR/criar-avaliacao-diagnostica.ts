/**
 * CRIAR AVALIAÇÃO DIAGNÓSTICA - Função para criar avaliações diagnósticas
 */

import { executeWithCascadeFallback } from '../../../services/controle-APIs-gerais-school-power';

interface CriarAvaliacaoParams {
  disciplina: string;
  serie: string;
  conteudos?: string;
  quantidade_questoes?: number;
}

interface AvaliacaoCriada {
  id: string;
  titulo: string;
  disciplina: string;
  serie: string;
  tipo: string;
  questoes: number;
  conteudo: string;
  criadoEm: number;
}

export async function criarAvaliacaoDiagnostica(params: CriarAvaliacaoParams): Promise<AvaliacaoCriada> {
  console.log('📋 [CriarAvaliacaoDiagnostica] Criando avaliação:', params);

  const numQuestoes = params.quantidade_questoes || 15;

  const prompt = `
Você é um especialista em avaliação educacional. 
Crie uma avaliação diagnóstica com as seguintes especificações:

DISCIPLINA: ${params.disciplina}
SÉRIE: ${params.serie}
${params.conteudos ? `CONTEÚDOS A AVALIAR: ${params.conteudos}` : 'CONTEÚDOS: Conceitos fundamentais da série'}
QUANTIDADE DE QUESTÕES: ${numQuestoes}

ESTRUTURA DA AVALIAÇÃO:

1. CABEÇALHO
   - Título da avaliação
   - Instruções claras para o aluno
   - Tempo estimado

2. QUESTÕES (${numQuestoes} questões)
   - Misture tipos: múltipla escolha, verdadeiro/falso, completar
   - Organize por nível de dificuldade crescente
   - Cubra os principais tópicos da disciplina
   - Inclua 2-3 questões de cada nível (fácil, médio, difícil)

3. GABARITO
   - Respostas corretas
   - Breve justificativa de cada resposta

4. ORIENTAÇÕES PARA O PROFESSOR
   - Como interpretar os resultados
   - Sugestões de intervenção por tipo de erro

Formate de forma clara, pronta para impressão.
  `.trim();

  const result = await executeWithCascadeFallback(prompt);

  return {
    id: `aval-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    titulo: `Avaliação Diagnóstica - ${params.disciplina} - ${params.serie}`,
    disciplina: params.disciplina,
    serie: params.serie,
    tipo: 'diagnostica',
    questoes: numQuestoes,
    conteudo: result.data || 'Avaliação gerada com sucesso',
    criadoEm: Date.now(),
  };
}

export default criarAvaliacaoDiagnostica;
