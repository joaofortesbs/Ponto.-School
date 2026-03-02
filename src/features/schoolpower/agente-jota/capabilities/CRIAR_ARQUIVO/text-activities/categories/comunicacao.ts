import type { TextActivityTemplate, TextActivityCategory } from '../text-activity-types';

const templates: TextActivityTemplate[] = [
  {
    id: 'newsletter_turma',
    nome: 'Newsletter da Turma',
    descricao: 'Boletim informativo da turma para pais e comunidade escolar',
    categoria: 'comunicacao',
    icone: '📰',
    cor: '#EA580C',
    keywords: ['newsletter', 'boletim informativo', 'jornal da turma', 'informativo escolar', 'jornal escolar'],
    secoesEsperadas: ['Cabeçalho', 'Destaques do Período', 'O que Estamos Aprendendo', 'Calendário', 'Recados', 'Galeria'],
    exemploUso: 'Crie uma newsletter mensal da turma do 3º ano',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie uma NEWSLETTER DA TURMA.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# 📰 Newsletter — {turma/período}

## Cabeçalho
Nome da escola, turma, período, professor(a), edição.

## Destaques do Período
3-4 destaques do que aconteceu de mais importante: eventos, conquistas, projetos.

## O que Estamos Aprendendo
Resumo amigável das matérias e conteúdos trabalhados no período, com linguagem acessível para os pais.

## Calendário
Próximas datas importantes: provas, eventos, feriados, entregas.

## Recados
Avisos importantes, pedidos de material, lembretes.

## Galeria
Sugestões de fotos/momentos para incluir (descrição de momentos marcantes).

REGRAS:
- Tom caloroso e positivo
- Linguagem acessível para famílias
- Pronta para enviar por WhatsApp ou imprimir
- NÃO retorne JSON`
  },
  {
    id: 'boletim_comentado_individual',
    nome: 'Boletim Comentado / Relatório Individual',
    descricao: 'Relatório individualizado do desempenho do aluno com observações qualitativas',
    categoria: 'comunicacao',
    icone: '📋',
    cor: '#C2410C',
    keywords: ['boletim comentado', 'relatório individual', 'relatorio individual', 'parecer descritivo', 'relatório do aluno', 'avaliação individual'],
    secoesEsperadas: ['Dados do Aluno', 'Desempenho Acadêmico', 'Aspectos Socioemocionais', 'Pontos Fortes', 'Áreas de Desenvolvimento', 'Recomendações'],
    exemploUso: 'Crie um modelo de relatório individual para alunos do 2º ano',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie um BOLETIM COMENTADO / RELATÓRIO INDIVIDUAL.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

DIRETRIZES DE QUALIDADE OBRIGATÓRIAS:
- Use linguagem AFETIVA e CONSTRUTIVA em todo o documento — o relatório será lido pela família do aluno
- Sempre mencione PONTOS FORTES antes de áreas de desenvolvimento (sequência: positivo → a melhorar → sugestão)
- Use exemplos de COMPORTAMENTOS OBSERVÁVEIS e concretos — nunca adjetivos vagos como "bom aluno" ou "participativo"
- EVITE termos diagnósticos clínicos (ex: "déficit", "transtorno") sem indicação médica — prefira "apresenta dificuldades em"
- Cada observação deve sugerir um próximo passo prático e alcançável
- Linguagem acessível para famílias sem formação pedagógica

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Relatório Individual do Aluno

## Dados do Aluno
Campos para: Nome do Aluno, Turma, Série/Ano, Período avaliado, Professor(a), Data de emissão.

## Desempenho Acadêmico
Análise por área do conhecimento/disciplina com indicadores qualitativos:
✅ Superou expectativas | 🎯 Atingiu as expectativas | 📈 Em desenvolvimento | 🤝 Necessita apoio adicional
Para cada nível, descreva COM EXEMPLOS CONCRETOS o que foi observado em sala (ex: "Demonstrou domínio ao resolver problemas de fração em atividade em grupo no dia XX").

## Aspectos Socioemocionais
Observações descritivas sobre:
- **Participação**: como o aluno se engaja nas atividades (com exemplo específico)
- **Interação**: como se relaciona com colegas (situações observadas)
- **Autonomia**: capacidade de trabalhar de forma independente
- **Responsabilidade**: cumprimento de tarefas e combinados
- **Resiliência**: como reage a desafios e dificuldades

## Pontos Fortes
3-4 destaques positivos ESPECÍFICOS com exemplos de situações reais observadas em sala.
Celebre conquistas concretas — não use elogios genéricos.

## Áreas de Desenvolvimento
2-3 aspectos a desenvolver, sempre com:
- Descrição objetiva do que foi observado (sem julgamentos)
- Sugestão prática e específica de como melhorar
- Indicação de como a escola está apoiando

## Recomendações para a Família
Sugestões concretas e realizáveis para apoiar o desenvolvimento em casa:
- Atividades específicas (ex: "Ler juntos por 15 minutos antes de dormir")
- Como conversar sobre o tema com o aluno
- Encaminhamentos ou parcerias quando necessário

IMPORTANTE: Todo o conteúdo deve ser específico para a solicitação "{solicitacao}". Nunca use placeholders como [nome do aluno] ou [inserir]. Entregue o modelo completo e pronto para uso.
NÃO retorne JSON`
  },
  {
    id: 'convite_evento',
    nome: 'Convite para Evento Escolar',
    descricao: 'Convites e comunicados para eventos da escola: festas, reuniões, mostras',
    categoria: 'comunicacao',
    icone: '🎉',
    cor: '#F97316',
    keywords: ['convite', 'evento', 'festa', 'reunião de pais', 'mostra', 'feira', 'apresentação', 'convite escolar'],
    secoesEsperadas: ['Convite Formal', 'Convite Criativo', 'Mensagem WhatsApp', 'Checklist de Organização'],
    exemploUso: 'Crie convites para a festa junina da escola',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie CONVITES PARA EVENTO ESCOLAR.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Convite — {evento}

## Convite Formal
Convite institucional com tom profissional para comunicado oficial da escola. Inclua: evento, data, horário, local, programação resumida, RSVP.

## Convite Criativo
Versão divertida e atraente do convite, com linguagem envolvente e chamativas. Ideal para redes sociais ou mural da escola.

## Mensagem WhatsApp
Versão curta e direta para enviar nos grupos de pais via WhatsApp. Máximo 5 linhas + informações essenciais.

## Checklist de Organização
Lista de tarefas para o professor organizar o evento: preparação, materiais, decoração, alimentação, etc.

REGRAS:
- Informações completas e precisas
- Variações para diferentes canais
- NÃO retorne JSON`
  },
  {
    id: 'comunicado_institucional',
    nome: 'Comunicado Institucional',
    descricao: 'Comunicado formal da escola para pais, alunos ou comunidade',
    categoria: 'comunicacao',
    icone: '📢',
    cor: '#FB923C',
    keywords: ['comunicado', 'comunicado escolar', 'aviso', 'circular', 'nota', 'comunicado oficial', 'bilhete escolar'],
    secoesEsperadas: ['Comunicado Formal', 'Versão Resumida', 'FAQ', 'Canais de Contato'],
    exemploUso: 'Crie um comunicado sobre mudança no horário escolar',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie um COMUNICADO INSTITUCIONAL.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Comunicado — {assunto}

## Comunicado Formal
Texto completo e formal com: identificação da escola, destinatários, assunto detalhado, justificativa, impactos, ações necessárias, assinatura.

## Versão Resumida
Versão curta (5-8 linhas) com as informações essenciais para envio rápido.

## FAQ
Perguntas e respostas antecipando as dúvidas mais comuns dos pais/alunos sobre o comunicado.

## Canais de Contato
Informações de contato para esclarecimento de dúvidas.

REGRAS:
- Tom profissional e claro
- Informações completas e precisas
- NÃO retorne JSON`
  },
  {
    id: 'comentarios_boletim',
    nome: 'Comentários para Boletim Escolar',
    descricao: 'Banco de frases e comentários prontos para preencher boletins e relatórios de alunos',
    categoria: 'comunicacao',
    icone: '💬',
    cor: '#FDBA74',
    keywords: ['comentários de boletim', 'frases para boletim', 'parecer', 'comentários para relatório', 'frases prontas', 'report card comments', 'parecer descritivo pronto'],
    secoesEsperadas: ['Desempenho Acadêmico', 'Comportamento e Participação', 'Habilidades Socioemocionais', 'Áreas de Melhoria', 'Comentários Personalizáveis'],
    exemploUso: 'Crie comentários prontos para boletins do 3º ano do fundamental',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie um BANCO DE COMENTÁRIOS PARA BOLETIM ESCOLAR completo.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Comentários para Boletim Escolar — {ano/série}

## Desempenho Acadêmico
Crie 20+ frases organizadas por área do conhecimento (Linguagens, Matemática, Ciências, etc.), com variantes para diferentes níveis de desempenho:

**Aluno com ótimo desempenho:**
- Frases que reconhecem e valorizam o esforço e os resultados

**Aluno com desempenho satisfatório:**
- Frases que destacam o progresso e incentivam a continuidade

**Aluno que precisa de apoio:**
- Frases construtivas que apontam caminhos de melhoria sem negatividade

## Comportamento e Participação
Crie 15+ frases sobre:
- Participação em aula e atividades
- Colaboração com colegas
- Respeito às regras e combinados
- Organização e pontualidade
- Iniciativa e proatividade
Inclua variantes para diferentes perfis de comportamento.

## Habilidades Socioemocionais
Crie 10+ frases sobre:
- Autogestão e autonomia
- Empatia e cooperação
- Resolução de conflitos
- Resiliência e persistência
- Criatividade e pensamento crítico

## Áreas de Melhoria
Frases construtivas para apontar aspectos a desenvolver:
- Sempre com tom positivo e propositivo
- Nunca use linguagem negativa ou punitiva
- Inclua sugestões práticas de como melhorar
- Foque no potencial do aluno

## Comentários Personalizáveis
Modelos de frases com espaços em branco para o professor personalizar:
- "[Nome do aluno] demonstrou grande progresso em ______"
- "Recomendamos que [Nome do aluno] dedique mais atenção a ______"
- "Um destaque positivo de [Nome do aluno] neste período foi ______"
- Inclua 10+ modelos variados para diferentes situações

REGRAS:
- Tom profissional, caloroso e construtivo em todas as frases
- Nunca usar linguagem negativa, punitiva ou desmotivadora
- Frases prontas para copiar e colar no boletim
- Linguagem adequada para comunicação com famílias
- NÃO retorne JSON`
  },
];

export const COMUNICACAO_CATEGORY: TextActivityCategory = {
  id: 'comunicacao',
  nome: 'Comunicação Escolar',
  descricao: 'Newsletters, relatórios individuais, convites e comunicados',
  icone: '📢',
  cor: '#EA580C',
  templates,
};

export default templates;
