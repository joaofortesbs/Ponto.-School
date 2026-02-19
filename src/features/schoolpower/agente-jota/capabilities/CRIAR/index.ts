/**
 * CRIAR CAPABILITIES - Funções de Criação de Conteúdo
 * 
 * Agrupa todas as funções relacionadas à criação de atividades educacionais
 */

import { criarAtividade } from './criar-atividade';
import { criarPlanoAula } from './criar-plano-aula';
import { criarAvaliacaoDiagnostica } from './criar-avaliacao-diagnostica';
import { criarCompromissoCalendario } from './criar-compromisso-calendario';
import type { CapabilityConfig } from '../index';

export const CRIAR_CAPABILITIES: Record<string, CapabilityConfig> = {
  
  criar_atividade: {
    name: 'criar_atividade',
    description: 'Cria uma atividade educacional personalizada baseada no tipo e contexto fornecido',
    parameters: {
      tipo: { 
        type: 'string', 
        required: true, 
        description: 'Tipo da atividade (ex: lista-exercicios, quiz-interativo, flash-cards)' 
      },
      tema: { 
        type: 'string', 
        required: true, 
        description: 'Tema ou assunto da atividade' 
      },
      serie: { 
        type: 'string', 
        required: false, 
        description: 'Série/ano escolar alvo',
        default: 'Fundamental II'
      },
      disciplina: { 
        type: 'string', 
        required: false, 
        description: 'Disciplina da atividade' 
      },
      quantidade: { 
        type: 'number', 
        required: false, 
        description: 'Quantidade de questões/itens',
        default: 10
      },
      dificuldade: { 
        type: 'string', 
        required: false, 
        description: 'Nível de dificuldade (Fácil, Médio, Difícil)',
        default: 'Médio'
      },
      contexto: { 
        type: 'string', 
        required: false, 
        description: 'Contexto adicional do professor' 
      }
    },
    execute: criarAtividade
  },

  criar_plano_aula: {
    name: 'criar_plano_aula',
    description: 'Cria um plano de aula estruturado com objetivos, metodologia e avaliação',
    parameters: {
      tema: { 
        type: 'string', 
        required: true, 
        description: 'Tema central da aula' 
      },
      disciplina: { 
        type: 'string', 
        required: true, 
        description: 'Disciplina da aula' 
      },
      serie: { 
        type: 'string', 
        required: true, 
        description: 'Série/ano escolar' 
      },
      duracao: { 
        type: 'string', 
        required: false, 
        description: 'Duração da aula (ex: 50min)',
        default: '50 minutos'
      },
      objetivos: { 
        type: 'string', 
        required: false, 
        description: 'Objetivos de aprendizagem específicos' 
      },
      bncc: { 
        type: 'string', 
        required: false, 
        description: 'Habilidades BNCC relacionadas' 
      }
    },
    execute: criarPlanoAula
  },

  criar_avaliacao_diagnostica: {
    name: 'criar_avaliacao_diagnostica',
    description: 'Cria uma avaliação diagnóstica para identificar lacunas de aprendizado',
    parameters: {
      disciplina: { 
        type: 'string', 
        required: true, 
        description: 'Disciplina a ser avaliada' 
      },
      serie: { 
        type: 'string', 
        required: true, 
        description: 'Série/ano escolar' 
      },
      conteudos: { 
        type: 'string', 
        required: false, 
        description: 'Conteúdos específicos a avaliar' 
      },
      quantidade_questoes: { 
        type: 'number', 
        required: false, 
        description: 'Número de questões',
        default: 15
      }
    },
    execute: criarAvaliacaoDiagnostica
  },

  criar_compromisso_calendario: {
    name: 'criar_compromisso_calendario',
    funcao: 'criar_compromisso_calendario',
    displayName: 'Criar Compromisso no Calendário',
    categoria: 'CRIAR',
    description: 'Cria um compromisso/evento/aula no calendário do professor. Pode configurar título, data, horário, repetição, ícone, labels e vincular atividades. O calendário atualiza automaticamente após a criação.',
    descricao: 'Cria compromissos no calendário do professor diretamente do chat, sem necessidade de interação manual. Perfeito para organizar aulas, reuniões, provas e eventos.',
    parameters: {
      titulo: {
        type: 'string',
        required: true,
        description: 'Título do compromisso (ex: "Aula de Matemática - Funções", "Reunião de Coordenação")'
      },
      data: {
        type: 'string',
        required: true,
        description: 'Data do compromisso no formato YYYY-MM-DD (ex: "2026-02-25")'
      },
      hora_inicio: {
        type: 'string',
        required: false,
        description: 'Hora de início no formato HH:MM (ex: "10:00"). Se não informado e dia_todo=false, será null.'
      },
      hora_fim: {
        type: 'string',
        required: false,
        description: 'Hora de fim no formato HH:MM (ex: "11:00"). Se não informado, será null.'
      },
      dia_todo: {
        type: 'boolean',
        required: false,
        description: 'Se true, o compromisso ocupa o dia todo. Default: false.',
        default: false
      },
      repeticao: {
        type: 'string',
        required: false,
        description: 'Frequência de repetição: "none", "daily", "weekly", "monthly", "yearly". Default: "none".',
        default: 'none'
      },
      icone: {
        type: 'string',
        required: false,
        description: 'Ícone do compromisso: "pencil" (aula), "check" (prova/avaliação), "camera" (reunião), "star" (evento especial). Se não informado, será inferido do título.'
      },
      labels: {
        type: 'array',
        required: false,
        description: 'Lista de etiquetas/labels para categorizar (ex: ["Matemática", "9º Ano"])'
      },
      label_colors: {
        type: 'object',
        required: false,
        description: 'Cores das labels no formato {labelName: "#hexcolor"}'
      },
      linked_activity_ids: {
        type: 'array',
        required: false,
        description: 'Lista de atividades School Power vinculadas ao compromisso [{id, tipo, titulo}]'
      },
      professor_id: {
        type: 'string',
        required: true,
        description: 'ID UUID do professor (obtido do contexto da sessão)'
      }
    },
    canCallAnytime: true,
    execute: criarCompromissoCalendario
  }

};

export default CRIAR_CAPABILITIES;
