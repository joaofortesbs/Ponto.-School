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

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Relatório Individual do Aluno

## Dados do Aluno
Campos para: Nome, Turma, Período avaliado, Professor(a).

## Desempenho Acadêmico
Análise por área do conhecimento/disciplina. Use indicadores qualitativos: Superou expectativas / Atingiu / Em desenvolvimento / Necessita apoio.

## Aspectos Socioemocionais
Observações sobre: participação, interação com colegas, autonomia, responsabilidade, curiosidade.

## Pontos Fortes
Destaques positivos do aluno com exemplos concretos de situações observadas.

## Áreas de Desenvolvimento
Aspectos que precisam ser trabalhados, com sugestões construtivas.

## Recomendações
Sugestões para a família apoiar o desenvolvimento em casa. Encaminhamentos se necessário.

REGRAS:
- Tom construtivo e respeitoso
- Exemplos concretos, não genéricos
- Linguagem acessível para pais
- Modelo que o professor adapta para cada aluno
- NÃO retorne JSON`
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
