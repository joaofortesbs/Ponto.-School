export type ArtifactType = 
  | 'dossie_pedagogico'
  | 'resumo_executivo'  
  | 'roteiro_aula'
  | 'relatorio_progresso'
  | 'guia_aplicacao';

export interface ArtifactSection {
  id: string;
  titulo: string;
  conteudo: string;
  icone?: string;
  ordem: number;
}

export interface ArtifactMetadata {
  tipo: ArtifactType;
  titulo: string;
  subtitulo?: string;
  geradoEm: number;
  sessaoId: string;
  versao: string;
  tags: string[];
  estatisticas?: {
    palavras: number;
    secoes: number;
    tempoGeracao: number;
  };
}

export interface ArtifactData {
  id: string;
  metadata: ArtifactMetadata;
  secoes: ArtifactSection[];
  resumoPreview: string;
}

export interface ArtifactTypeConfig {
  tipo: ArtifactType;
  nome: string;
  descricao: string;
  icone: string;
  cor: string;
  secoesEsperadas: string[];
  promptTemplate: string;
}

export const ARTIFACT_TYPE_CONFIGS: Record<ArtifactType, ArtifactTypeConfig> = {
  dossie_pedagogico: {
    tipo: 'dossie_pedagogico',
    nome: 'Dossiê Pedagógico',
    descricao: 'Documento completo com análise pedagógica detalhada',
    icone: '📋',
    cor: '#3B82F6',
    secoesEsperadas: ['Visão Geral', 'Análise Pedagógica', 'Atividades Criadas', 'Alinhamento BNCC', 'Recomendações'],
    promptTemplate: `Gere um DOSSIÊ PEDAGÓGICO COMPLETO em formato estruturado.

CONTEXTO DA SESSÃO:
{contexto}

ESTRUTURE O DOSSIÊ COM AS SEGUINTES SEÇÕES (use exatamente estes títulos como headers ## ):

## Visão Geral
Resumo executivo do que foi solicitado e realizado.

## Análise Pedagógica
Análise dos fundamentos pedagógicos das atividades criadas, metodologias aplicadas, e sua adequação ao público-alvo.

## Atividades Criadas
Listagem detalhada de cada atividade com seus objetivos, metodologia e diferenciais.

## Alinhamento BNCC
Como as atividades se conectam com as competências e habilidades da BNCC.

## Recomendações
Sugestões de aplicação, adaptações possíveis e próximos passos para o professor.

REGRAS:
- Escreva em português brasileiro fluente e profissional
- Seja específico com dados da sessão (nomes de atividades, tipos, quantidades)
- Cada seção deve ter 2-4 parágrafos substanciais
- Use linguagem acessível para professores
- NÃO retorne JSON, apenas texto com headers markdown ##`
  },
  resumo_executivo: {
    tipo: 'resumo_executivo',
    nome: 'Resumo Executivo',
    descricao: 'Síntese rápida dos resultados da sessão',
    icone: '📊',
    cor: '#10B981',
    secoesEsperadas: ['Objetivo', 'Resultados', 'Métricas', 'Próximos Passos'],
    promptTemplate: `Gere um RESUMO EXECUTIVO conciso e impactante.

CONTEXTO DA SESSÃO:
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use exatamente estes títulos como headers ## ):

## Objetivo
O que o professor solicitou e qual era a meta.

## Resultados
O que foi efetivamente criado/realizado, com detalhes específicos.

## Métricas
Números relevantes: quantidade de atividades, questões, materiais gerados.

## Próximos Passos
Ações recomendadas para o professor dar continuidade.

REGRAS:
- Seja direto e objetivo
- Use dados concretos da sessão
- Máximo 2 parágrafos por seção
- Linguagem profissional mas acessível
- NÃO retorne JSON`
  },
  roteiro_aula: {
    tipo: 'roteiro_aula',
    nome: 'Roteiro de Aula',
    descricao: 'Guia passo a passo para aplicação em sala',
    icone: '📝',
    cor: '#F59E0B',
    secoesEsperadas: ['Preparação', 'Abertura', 'Desenvolvimento', 'Encerramento', 'Materiais Necessários'],
    promptTemplate: `Gere um ROTEIRO DE AULA prático e detalhado baseado nas atividades criadas.

CONTEXTO DA SESSÃO:
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use exatamente estes títulos como headers ## ):

## Preparação
O que o professor precisa preparar antes da aula (materiais, ambiente, tecnologia).

## Abertura (10-15 min)
Como iniciar a aula: motivação, contextualização e apresentação dos objetivos.

## Desenvolvimento (25-35 min)  
Como aplicar as atividades criadas, passo a passo, com dicas de mediação pedagógica.

## Encerramento (5-10 min)
Como fechar a aula: síntese, feedback e conexão com próximas aulas.

## Materiais Necessários
Lista de todos os materiais, recursos digitais e físicos necessários.

REGRAS:
- Seja prático e acionável
- Inclua tempos estimados
- Dê dicas de adaptação para diferentes contextos
- Mencione as atividades criadas pelo nome
- NÃO retorne JSON`
  },
  relatorio_progresso: {
    tipo: 'relatorio_progresso',
    nome: 'Relatório de Progresso',
    descricao: 'Análise do que foi construído na sessão',
    icone: '📈',
    cor: '#8B5CF6',
    secoesEsperadas: ['Solicitação Original', 'Etapas Realizadas', 'Resultados Obtidos', 'Observações'],
    promptTemplate: `Gere um RELATÓRIO DE PROGRESSO detalhado da sessão de trabalho.

CONTEXTO DA SESSÃO:
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use exatamente estes títulos como headers ## ):

## Solicitação Original
Transcrição e interpretação do pedido do professor.

## Etapas Realizadas
Descrição de cada etapa do processo, o que foi analisado e decidido.

## Resultados Obtidos
Detalhamento de todos os artefatos produzidos com características e especificações.

## Observações
Pontos de atenção, sugestões de melhoria e notas técnicas relevantes.

REGRAS:
- Documente todo o processo de forma clara
- Use dados específicos (números, nomes, tipos)
- Mantenha tom profissional e objetivo
- NÃO retorne JSON`
  },
  guia_aplicacao: {
    tipo: 'guia_aplicacao',
    nome: 'Guia de Aplicação',
    descricao: 'Manual prático para usar as atividades criadas',
    icone: '🎯',
    cor: '#EF4444',
    secoesEsperadas: ['Introdução', 'Como Usar', 'Dicas de Aplicação', 'Avaliação', 'Adaptações'],
    promptTemplate: `Gere um GUIA DE APLICAÇÃO prático para as atividades criadas.

CONTEXTO DA SESSÃO:
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use exatamente estes títulos como headers ## ):

## Introdução
Contexto e propósito das atividades criadas.

## Como Usar
Instruções claras e passo a passo para aplicar cada atividade.

## Dicas de Aplicação
Estratégias para maximizar o engajamento e aprendizado dos alunos.

## Avaliação
Como avaliar o desempenho dos alunos nas atividades propostas.

## Adaptações
Sugestões para adaptar as atividades para diferentes perfis de alunos e contextos.

REGRAS:
- Foco em praticidade
- Linguagem acessível para qualquer professor
- Inclua exemplos concretos quando possível
- NÃO retorne JSON`
  }
};
