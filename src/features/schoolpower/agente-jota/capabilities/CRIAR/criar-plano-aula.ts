/**
 * CRIAR PLANO DE AULA - Função para criar planos de aula estruturados
 */

import { executeWithCascadeFallback } from '../../../services/controle-APIs-gerais-school-power';

interface CriarPlanoAulaParams {
  tema: string;
  disciplina: string;
  serie: string;
  duracao?: string;
  objetivos?: string;
  bncc?: string;
}

interface PlanoAulaCriado {
  id: string;
  titulo: string;
  disciplina: string;
  serie: string;
  duracao: string;
  conteudo: {
    objetivos: string;
    bncc: string;
    metodologia: string;
    recursos: string;
    desenvolvimento: string;
    avaliacao: string;
  };
  criadoEm: number;
}

export async function criarPlanoAula(params: CriarPlanoAulaParams): Promise<PlanoAulaCriado> {
  console.log('📚 [CriarPlanoAula] Criando plano de aula:', params);

  const prompt = `
Você é um especialista em pedagogia e planejamento educacional. 
Crie um plano de aula completo com as seguintes especificações:

TEMA: ${params.tema}
DISCIPLINA: ${params.disciplina}
SÉRIE: ${params.serie}
DURAÇÃO: ${params.duracao || '50 minutos'}
${params.objetivos ? `OBJETIVOS ESPECÍFICOS: ${params.objetivos}` : ''}
${params.bncc ? `HABILIDADES BNCC: ${params.bncc}` : ''}

ESTRUTURE O PLANO COM:

1. OBJETIVOS DE APRENDIZAGEM
   - Objetivo geral
   - Objetivos específicos (3-5)

2. HABILIDADES BNCC
   - Códigos e descrições relevantes

3. METODOLOGIA
   - Abordagem pedagógica
   - Estratégias de ensino

4. RECURSOS DIDÁTICOS
   - Materiais necessários
   - Tecnologias (se aplicável)

5. DESENVOLVIMENTO DA AULA
   - Momento inicial (acolhimento, introdução)
   - Desenvolvimento (atividades principais)
   - Momento final (síntese, avaliação formativa)

6. AVALIAÇÃO
   - Critérios de avaliação
   - Instrumentos avaliativos

Formate de forma clara e profissional.
  `.trim();

  const result = await executeWithCascadeFallback(prompt);

  const conteudoGerado = result.data || '';

  return {
    id: `plano-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    titulo: `Plano de Aula: ${params.tema}`,
    disciplina: params.disciplina,
    serie: params.serie,
    duracao: params.duracao || '50 minutos',
    conteudo: {
      objetivos: params.objetivos || 'Objetivos definidos no plano',
      bncc: params.bncc || 'Conforme especificado no plano',
      metodologia: 'Detalhado no plano completo',
      recursos: 'Listados no plano',
      desenvolvimento: conteudoGerado,
      avaliacao: 'Critérios incluídos no plano',
    },
    criadoEm: Date.now(),
  };
}

export default criarPlanoAula;
