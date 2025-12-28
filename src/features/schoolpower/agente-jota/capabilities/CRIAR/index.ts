/**
 * CRIAR CAPABILITIES - Funções de Criação de Conteúdo
 * 
 * Agrupa todas as funções relacionadas à criação de atividades educacionais
 */

import { criarAtividade } from './criar-atividade';
import { criarPlanoAula } from './criar-plano-aula';
import { criarAvaliacaoDiagnostica } from './criar-avaliacao-diagnostica';
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
  }

};

export default CRIAR_CAPABILITIES;
