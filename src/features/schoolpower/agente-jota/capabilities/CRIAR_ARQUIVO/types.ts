export type ArtifactType = 
  | 'dossie_pedagogico'
  | 'resumo_executivo'  
  | 'roteiro_aula'
  | 'relatorio_progresso'
  | 'guia_aplicacao'
  | 'mensagem_pais'
  | 'mensagem_alunos'
  | 'relatorio_coordenacao'
  | 'documento_livre'
  | 'atividade_textual';

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
- NÃO retorne JSON, apenas texto com headers markdown ##
- Use tabela para mapeamento BNCC (Habilidade | Descrição | Atividade)
- Use FORMATAÇÃO RICA para tornar o documento visualmente profissional:
  • Tabelas markdown para comparações, cronogramas, métricas e dados estruturados
  • Checklists (- [ ] item) para listas de tarefas e materiais
  • Callout boxes (> 💡 dica, > ⚠️ atenção, > 📌 importante) para destaques
  • **Negrito** para termos-chave, *itálico* para ênfase
  • --- para separadores visuais entre seções grandes`
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
- NÃO retorne JSON
- Use FORMATAÇÃO RICA para tornar o documento visualmente profissional:
  • Tabelas markdown para comparações, cronogramas, métricas e dados estruturados
  • Checklists (- [ ] item) para listas de tarefas e materiais
  • Callout boxes (> 💡 dica, > ⚠️ atenção, > 📌 importante) para destaques
  • **Negrito** para termos-chave, *itálico* para ênfase
  • --- para separadores visuais entre seções grandes`
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
- NÃO retorne JSON
- Use tabela para distribuição de tempo (Momento | Duração | Atividade | Recursos)
- Use checklist para materiais necessários
- Use FORMATAÇÃO RICA para tornar o documento visualmente profissional:
  • Tabelas markdown para comparações, cronogramas, métricas e dados estruturados
  • Checklists (- [ ] item) para listas de tarefas e materiais
  • Callout boxes (> 💡 dica, > ⚠️ atenção, > 📌 importante) para destaques
  • **Negrito** para termos-chave, *itálico* para ênfase
  • --- para separadores visuais entre seções grandes`
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
- NÃO retorne JSON
- Use FORMATAÇÃO RICA para tornar o documento visualmente profissional:
  • Tabelas markdown para comparações, cronogramas, métricas e dados estruturados
  • Checklists (- [ ] item) para listas de tarefas e materiais
  • Callout boxes (> 💡 dica, > ⚠️ atenção, > 📌 importante) para destaques
  • **Negrito** para termos-chave, *itálico* para ênfase
  • --- para separadores visuais entre seções grandes`
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
- NÃO retorne JSON
- Use tabela para sequência de aplicação
- Use callout > 💡 para dicas práticas
- Use FORMATAÇÃO RICA para tornar o documento visualmente profissional:
  • Tabelas markdown para comparações, cronogramas, métricas e dados estruturados
  • Checklists (- [ ] item) para listas de tarefas e materiais
  • Callout boxes (> 💡 dica, > ⚠️ atenção, > 📌 importante) para destaques
  • **Negrito** para termos-chave, *itálico* para ênfase
  • --- para separadores visuais entre seções grandes`
  },
  mensagem_pais: {
    tipo: 'mensagem_pais',
    nome: 'Mensagens para Pais',
    descricao: 'Variações de mensagens motivacionais para enviar aos pais dos alunos sobre as atividades',
    icone: '💬',
    cor: '#06B6D4',
    secoesEsperadas: ['Contexto', 'Mensagem Formal', 'Mensagem Amigável', 'Mensagem Objetiva'],
    promptTemplate: `Gere MENSAGENS PARA OS PAIS dos alunos sobre as atividades criadas pelo professor.

CONTEXTO DA SESSÃO:
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use exatamente estes títulos como headers ## ):

## Contexto
Breve explicação do que o professor criou e o objetivo pedagógico por trás das atividades — esta seção é para o professor entender o contexto, NÃO faz parte das mensagens.

## Mensagem Formal
Uma mensagem profissional e respeitosa para enviar via comunicado oficial da escola ou grupo de pais. Tom institucional, mencionando o objetivo pedagógico e como os pais podem apoiar em casa. Inclua cumprimento, corpo e despedida.

## Mensagem Amigável
Uma mensagem calorosa e acessível para enviar via WhatsApp ou rede social da turma. Tom próximo e motivador, explicando de forma simples o que os alunos vão fazer e por que é importante. Use linguagem do dia a dia.

## Mensagem Objetiva
Uma mensagem curta e direta (máximo 4 linhas) para situações onde o professor precisa ser breve. Apenas o essencial: o que foi criado, quando será aplicado, e o que os pais podem fazer para ajudar.

REGRAS:
- Cada mensagem deve ser COMPLETA e pronta para copiar e colar
- Use o nome das atividades criadas na sessão
- Mencione a série/turma quando disponível no contexto
- Tom sempre positivo e motivador
- Evite jargão pedagógico nas mensagens para pais
- NÃO retorne JSON, apenas texto com headers markdown ##
- Use > 💡 para dicas de como apoiar em casa
- Use FORMATAÇÃO RICA para tornar o documento visualmente profissional:
  • Tabelas markdown para comparações, cronogramas, métricas e dados estruturados
  • Checklists (- [ ] item) para listas de tarefas e materiais
  • Callout boxes (> 💡 dica, > ⚠️ atenção, > 📌 importante) para destaques
  • **Negrito** para termos-chave, *itálico* para ênfase
  • --- para separadores visuais entre seções grandes`
  },
  mensagem_alunos: {
    tipo: 'mensagem_alunos',
    nome: 'Mensagens para Alunos',
    descricao: 'Mensagens motivacionais para engajar os alunos nas atividades criadas',
    icone: '🎓',
    cor: '#F97316',
    secoesEsperadas: ['Contexto para o Professor', 'Mensagem de Apresentação', 'Mensagem de Motivação', 'Desafio Divertido'],
    promptTemplate: `Gere MENSAGENS MOTIVACIONAIS PARA OS ALUNOS sobre as atividades que o professor criou.

CONTEXTO DA SESSÃO:
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use exatamente estes títulos como headers ## ):

## Contexto para o Professor
Breve explicação de como e quando usar cada mensagem — esta seção é orientação para o professor, NÃO para os alunos.

## Mensagem de Apresentação
Uma mensagem empolgante para apresentar as atividades aos alunos. Deve despertar curiosidade e vontade de participar. Use linguagem jovem e acessível adequada à faixa etária da turma. Pode incluir perguntas provocativas sobre o tema.

## Mensagem de Motivação
Uma mensagem para enviar DURANTE a realização das atividades, incentivando os alunos a continuarem e dando dicas. Tom de torcida, reconhecimento do esforço, e reforço positivo. Curta e impactante.

## Desafio Divertido
Uma mensagem que transforma parte da atividade em um desafio ou competição saudável entre os alunos. Ex: "Quem conseguir completar primeiro ganha...", "O grupo que acertar mais questões...". Deve ser divertido e inclusivo.

REGRAS:
- Adeque a linguagem à série/faixa etária da turma (quando disponível no contexto)
- Seja criativo e use referências do universo dos alunos
- Cada mensagem deve ser pronta para o professor copiar e usar
- Tom sempre positivo, nunca punitivo ou ameaçador
- Mencione as atividades criadas pelo nome
- NÃO retorne JSON, apenas texto com headers markdown ##
- Use > ✅ para pontos de motivação
- Use FORMATAÇÃO RICA para tornar o documento visualmente profissional:
  • Tabelas markdown para comparações, cronogramas, métricas e dados estruturados
  • Checklists (- [ ] item) para listas de tarefas e materiais
  • Callout boxes (> 💡 dica, > ⚠️ atenção, > 📌 importante) para destaques
  • **Negrito** para termos-chave, *itálico* para ênfase
  • --- para separadores visuais entre seções grandes`
  },
  relatorio_coordenacao: {
    tipo: 'relatorio_coordenacao',
    nome: 'Relatório para Coordenação',
    descricao: 'Documento formal e profissional para apresentar aos coordenadores pedagógicos',
    icone: '📑',
    cor: '#7C3AED',
    secoesEsperadas: ['Apresentação', 'Justificativa Pedagógica', 'Detalhamento das Atividades', 'Alinhamento Curricular', 'Cronograma de Aplicação', 'Resultados Esperados'],
    promptTemplate: `Gere um RELATÓRIO PARA COORDENAÇÃO PEDAGÓGICA — um documento formal e profissional que o professor pode apresentar aos seus coordenadores para justificar e documentar as atividades criadas.

CONTEXTO DA SESSÃO:
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use exatamente estes títulos como headers ## ):

## Apresentação
Identificação do professor, turma, disciplina e período. Resumo objetivo do que foi planejado e criado.

## Justificativa Pedagógica
Fundamentação teórica e pedagógica para a criação das atividades. Por que estas atividades são relevantes para o desenvolvimento dos alunos? Quais competências e habilidades estão sendo trabalhadas? Cite metodologias aplicadas (gamificação, aprendizagem ativa, etc.) quando relevante.

## Detalhamento das Atividades
Descrição profissional de cada atividade criada, incluindo: tipo, objetivo específico, conteúdo abordado, nível de dificuldade e tempo estimado de aplicação. Apresente em formato organizado.

## Alinhamento Curricular
Como as atividades se conectam com o currículo da escola, as diretrizes da BNCC e os objetivos do bimestre/trimestre. Mencione habilidades específicas quando possível.

## Cronograma de Aplicação
Sugestão de quando e como aplicar cada atividade ao longo da semana ou período letivo. Inclua sequência lógica e interdependências.

## Resultados Esperados
Quais resultados de aprendizagem são esperados com a aplicação das atividades. Como o professor pretende avaliar o impacto. Indicadores de sucesso mensuráveis.

REGRAS:
- Tom FORMAL e profissional — este documento será lido por coordenadores
- Use linguagem técnica pedagógica adequada (diferente das mensagens para pais)
- Seja específico com dados: nomes de atividades, quantidades, tipos
- Demonstre intencionalidade pedagógica em cada escolha
- O documento deve transmitir competência e planejamento
- NÃO retorne JSON, apenas texto com headers markdown ##
- Use tabela para detalhamento das atividades
- Use tabela para cronograma de aplicação
- Use FORMATAÇÃO RICA para tornar o documento visualmente profissional:
  • Tabelas markdown para comparações, cronogramas, métricas e dados estruturados
  • Checklists (- [ ] item) para listas de tarefas e materiais
  • Callout boxes (> 💡 dica, > ⚠️ atenção, > 📌 importante) para destaques
  • **Negrito** para termos-chave, *itálico* para ênfase
  • --- para separadores visuais entre seções grandes`
  },
  documento_livre: {
    tipo: 'documento_livre',
    nome: 'Documento',
    descricao: 'Documento livre com estrutura customizada definida pela IA',
    icone: '📄',
    cor: '#6366f1',
    secoesEsperadas: [],
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. O professor precisa de um DOCUMENTO/TEXTO estruturado.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

SUA TAREFA:
Crie um documento completo, bem estruturado e profissional que atenda EXATAMENTE ao que o professor pediu.

REGRAS DE ESTRUTURA:
- Você tem LIBERDADE TOTAL para definir o título, subtítulo e as seções do documento
- Crie quantas seções forem necessárias para cobrir o assunto adequadamente
- Use headers markdown ## para cada seção (o sistema parseia automaticamente)
- Comece com um título principal usando # (apenas um)
- Cada seção deve ter conteúdo substancial (2-5 parágrafos)
- Organize as seções numa ordem lógica e fluida

REGRAS DE CONTEÚDO:
- Escreva em português brasileiro fluente e profissional
- Adapte o tom ao contexto (formal para coordenadores, acessível para professores, lúdico para alunos)
- Seja detalhado e completo — o professor vai usar este documento como está
- Inclua exemplos práticos quando relevante
- Use listas, tópicos e formatação markdown para facilitar a leitura
- O documento deve ser AUTOCONTIDO — qualquer pessoa que ler deve entender tudo sem contexto adicional

REGRAS TÉCNICAS:
- NÃO retorne JSON, apenas texto com headers markdown
- NÃO inclua metadados, tags ou informações técnicas
- O texto deve ser pronto para uso imediato pelo professor
- Escolha ATIVAMENTE entre tabelas, checklists e callouts conforme o tema
- Use FORMATAÇÃO RICA para tornar o documento visualmente profissional:
  • Tabelas markdown para comparações, cronogramas, métricas e dados estruturados
  • Checklists (- [ ] item) para listas de tarefas e materiais
  • Callout boxes (> 💡 dica, > ⚠️ atenção, > 📌 importante) para destaques
  • **Negrito** para termos-chave, *itálico* para ênfase
  • --- para separadores visuais entre seções grandes`
  },
  atividade_textual: {
    tipo: 'atividade_textual',
    nome: 'Atividade em Texto',
    descricao: 'Atividade pedagógica gerada em formato textual a partir de template especializado',
    icone: '📝',
    cor: '#8B5CF6',
    secoesEsperadas: [],
    promptTemplate: `{dynamic_prompt}`
  }
};
