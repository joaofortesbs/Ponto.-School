/**
 * CONTEXT MANAGER - Gerenciador de Contexto Macro para o Chat Jota
 * 
 * Responsável por manter uma visão unificada de toda a conversa,
 * conectando as 3 chamadas principais:
 * 1. Resposta Inicial (input do usuário)
 * 2. Card de Desenvolvimento (reflexões das etapas)
 * 3. Resposta Final (consolidação)
 * 
 * Arquitetura: Janela de contexto única para coerência narrativa
 */

export interface InputOriginal {
  texto: string;
  timestamp: number;
  interpretacao?: string;
  intencaoDetectada?: string;
  entidadesExtraidas?: Record<string, any>;
}

export interface ResultadoCapability {
  capabilityName: string;
  displayName: string;
  categoria: string;
  sucesso: boolean;
  dados?: any;
  metricas?: Record<string, number | string>;
  descobertas?: string[];
  decisoes?: string[];
  duracao?: number;
}

export interface ResultadoEtapa {
  etapaIndex: number;
  titulo: string;
  descricao: string;
  capabilities: ResultadoCapability[];
  reflexaoGerada?: string;
  timestamp: number;
  sucesso: boolean;
}

export interface ResumoProgressivo {
  totalEtapas: number;
  etapasCompletas: number;
  principaisDescobertas: string[];
  principaisDecisoes: string[];
  atividadesCriadas: string[];
  dadosRelevantes: Record<string, any>;
}

export interface ContextoMacro {
  sessionId: string;
  inputOriginal: InputOriginal;
  respostaInicial?: string;
  etapasExecutadas: ResultadoEtapa[];
  resumoProgressivo: ResumoProgressivo;
  planId?: string;
  objetivoGeral?: string;
  estadoAtual: 'aguardando_input' | 'respondendo_inicial' | 'executando_card' | 'gerando_final' | 'concluido';
  criadoEm: number;
  atualizadoEm: number;
}

const contextStore: Map<string, ContextoMacro> = new Map();

const SESSION_CLEANUP_INTERVAL = 10 * 60 * 1000;
const SESSION_MAX_AGE = 60 * 60 * 1000;

function cleanupExpiredSessions(): void {
  const now = Date.now();
  for (const [sessionId, contexto] of contextStore.entries()) {
    if (now - contexto.atualizadoEm > SESSION_MAX_AGE) {
      console.log(`🧹 [ContextManager] Limpando sessão expirada: ${sessionId}`);
      contextStore.delete(sessionId);
    }
  }
}

setInterval(cleanupExpiredSessions, SESSION_CLEANUP_INTERVAL);

export class ContextManager {
  private sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  inicializar(inputTexto: string): ContextoMacro {
    console.log(`🎯 [ContextManager] Inicializando contexto para sessão: ${this.sessionId}`);
    
    const contexto: ContextoMacro = {
      sessionId: this.sessionId,
      inputOriginal: {
        texto: inputTexto,
        timestamp: Date.now(),
      },
      etapasExecutadas: [],
      resumoProgressivo: {
        totalEtapas: 0,
        etapasCompletas: 0,
        principaisDescobertas: [],
        principaisDecisoes: [],
        atividadesCriadas: [],
        dadosRelevantes: {},
      },
      estadoAtual: 'aguardando_input',
      criadoEm: Date.now(),
      atualizadoEm: Date.now(),
    };

    contextStore.set(this.sessionId, contexto);
    return contexto;
  }

  obterContexto(): ContextoMacro | null {
    return contextStore.get(this.sessionId) || null;
  }

  obterOuCriar(inputTexto?: string): ContextoMacro {
    const existente = this.obterContexto();
    if (existente) {
      return existente;
    }
    return this.inicializar(inputTexto || '');
  }

  /**
   * Prepara o contexto para um novo plano, preservando o histórico da conversa
   * mas resetando o estado de execução para permitir nova interação
   */
  prepararParaNovoPlano(novoInput: string): ContextoMacro {
    const contextoExistente = this.obterContexto();
    
    if (!contextoExistente) {
      // Primeira interação - apenas inicializar
      return this.inicializar(novoInput);
    }

    console.log(`🔄 [ContextManager] Preparando para novo plano na sessão: ${this.sessionId}`);
    console.log(`   📝 Input anterior: "${contextoExistente.inputOriginal.texto.substring(0, 50)}..."`);
    console.log(`   📝 Novo input: "${novoInput.substring(0, 50)}..."`);
    console.log(`   📊 Histórico: ${contextoExistente.etapasExecutadas.length} etapas anteriores`);

    // Preservar histórico importante para contexto contínuo
    const historicoPreservado = {
      etapasAnteriores: contextoExistente.etapasExecutadas.length,
      atividadesCriadas: [...contextoExistente.resumoProgressivo.atividadesCriadas],
      descobertasAnteriores: [...contextoExistente.resumoProgressivo.principaisDescobertas],
      decisoesAnteriores: [...contextoExistente.resumoProgressivo.principaisDecisoes],
      inputAnterior: contextoExistente.inputOriginal.texto,
      respostaAnterior: contextoExistente.respostaInicial,
    };

    // Criar novo contexto com histórico preservado
    const novoContexto: ContextoMacro = {
      sessionId: this.sessionId,
      inputOriginal: {
        texto: novoInput,
        timestamp: Date.now(),
      },
      respostaInicial: undefined,
      etapasExecutadas: [], // Limpar para nova execução
      resumoProgressivo: {
        totalEtapas: 0,
        etapasCompletas: 0,
        // Preservar histórico de atividades criadas e descobertas
        principaisDescobertas: historicoPreservado.descobertasAnteriores.slice(-5),
        principaisDecisoes: historicoPreservado.decisoesAnteriores.slice(-5),
        atividadesCriadas: historicoPreservado.atividadesCriadas,
        dadosRelevantes: {
          historicoConversa: true,
          etapasAnteriores: historicoPreservado.etapasAnteriores,
          inputAnterior: historicoPreservado.inputAnterior,
        },
      },
      planId: undefined, // Novo plano será definido
      objetivoGeral: undefined,
      estadoAtual: 'aguardando_input',
      criadoEm: contextoExistente.criadoEm, // Manter timestamp original da sessão
      atualizadoEm: Date.now(),
    };

    contextStore.set(this.sessionId, novoContexto);
    
    console.log(`✅ [ContextManager] Contexto preparado para novo plano`);
    console.log(`   📊 Atividades preservadas: ${novoContexto.resumoProgressivo.atividadesCriadas.length}`);
    
    return novoContexto;
  }

  atualizarEstado(novoEstado: ContextoMacro['estadoAtual']): void {
    const contexto = this.obterContexto();
    if (contexto) {
      contexto.estadoAtual = novoEstado;
      contexto.atualizadoEm = Date.now();
      console.log(`📊 [ContextManager] Estado atualizado para: ${novoEstado}`);
    }
  }

  salvarInterpretacaoInput(interpretacao: string, intencao?: string, entidades?: Record<string, any>): void {
    const contexto = this.obterContexto();
    if (contexto) {
      contexto.inputOriginal.interpretacao = interpretacao;
      contexto.inputOriginal.intencaoDetectada = intencao;
      contexto.inputOriginal.entidadesExtraidas = entidades;
      contexto.atualizadoEm = Date.now();
      console.log(`💡 [ContextManager] Interpretação salva: ${interpretacao.substring(0, 100)}...`);
    }
  }

  salvarRespostaInicial(resposta: string): void {
    const contexto = this.obterContexto();
    if (contexto) {
      contexto.respostaInicial = resposta;
      contexto.estadoAtual = 'executando_card';
      contexto.atualizadoEm = Date.now();
      console.log(`✅ [ContextManager] Resposta inicial salva (${resposta.length} chars)`);
    }
  }

  definirPlano(planId: string, objetivo: string, totalEtapas: number): void {
    const contexto = this.obterContexto();
    if (contexto) {
      contexto.planId = planId;
      contexto.objetivoGeral = objetivo;
      contexto.resumoProgressivo.totalEtapas = totalEtapas;
      contexto.atualizadoEm = Date.now();
      console.log(`📋 [ContextManager] Plano definido: ${planId} com ${totalEtapas} etapas`);
    }
  }

  salvarResultadoEtapa(resultado: ResultadoEtapa): void {
    const contexto = this.obterContexto();
    if (!contexto) {
      console.error(`❌ [ContextManager] Sessão não encontrada: ${this.sessionId}`);
      return;
    }

    contexto.etapasExecutadas.push(resultado);
    contexto.resumoProgressivo.etapasCompletas++;

    for (const cap of resultado.capabilities) {
      if (cap.descobertas) {
        contexto.resumoProgressivo.principaisDescobertas.push(...cap.descobertas.slice(0, 2));
      }
      if (cap.decisoes) {
        contexto.resumoProgressivo.principaisDecisoes.push(...cap.decisoes.slice(0, 2));
      }
      if (cap.metricas) {
        Object.assign(contexto.resumoProgressivo.dadosRelevantes, cap.metricas);
      }
    }

    contexto.resumoProgressivo.principaisDescobertas = 
      contexto.resumoProgressivo.principaisDescobertas.slice(-10);
    contexto.resumoProgressivo.principaisDecisoes = 
      contexto.resumoProgressivo.principaisDecisoes.slice(-10);

    contexto.atualizadoEm = Date.now();
    console.log(`📝 [ContextManager] Resultado etapa ${resultado.etapaIndex} salvo`);
  }

  salvarReflexaoEtapa(etapaIndex: number, reflexao: string): void {
    const contexto = this.obterContexto();
    if (contexto) {
      const etapa = contexto.etapasExecutadas.find(e => e.etapaIndex === etapaIndex);
      if (etapa) {
        etapa.reflexaoGerada = reflexao;
        contexto.atualizadoEm = Date.now();
        console.log(`💭 [ContextManager] Reflexão salva para etapa ${etapaIndex}`);
      }
    }
  }

  registrarAtividadeCriada(nomeAtividade: string, tipo: string): void {
    const contexto = this.obterContexto();
    if (contexto) {
      contexto.resumoProgressivo.atividadesCriadas.push(`${tipo}: ${nomeAtividade}`);
      contexto.atualizadoEm = Date.now();
    }
  }

  gerarContextoParaChamada(tipo: 'inicial' | 'desenvolvimento' | 'final'): string {
    const contexto = this.obterContexto();
    if (!contexto) return '';

    switch (tipo) {
      case 'inicial':
        return this.gerarContextoInicial(contexto);
      case 'desenvolvimento':
        return this.gerarContextoDesenvolvimento(contexto);
      case 'final':
        return this.gerarContextoFinal(contexto);
      default:
        return '';
    }
  }

  private gerarContextoInicial(contexto: ContextoMacro): string {
    // Incluir histórico de atividades anteriores se existir
    const historicoAtividades = contexto.resumoProgressivo.atividadesCriadas.length > 0
      ? `\nATIVIDADES JÁ CRIADAS NESTA CONVERSA:\n${contexto.resumoProgressivo.atividadesCriadas.map(a => `- ${a}`).join('\n')}`
      : '';
    
    const historicoAnterior = contexto.resumoProgressivo.dadosRelevantes.inputAnterior
      ? `\nPEDIDO ANTERIOR DO USUÁRIO:\n"${contexto.resumoProgressivo.dadosRelevantes.inputAnterior}"`
      : '';

    return `
PEDIDO ATUAL DO USUÁRIO:
"${contexto.inputOriginal.texto}"
${historicoAnterior}
${historicoAtividades}
TIMESTAMP: ${new Date(contexto.inputOriginal.timestamp).toLocaleString('pt-BR')}
`.trim();
  }

  private gerarContextoDesenvolvimento(contexto: ContextoMacro): string {
    const etapasTexto = contexto.etapasExecutadas
      .map(e => {
        const capsTexto = e.capabilities
          .map(c => `  - ${c.displayName}: ${c.sucesso ? 'OK' : 'Erro'}${c.descobertas?.length ? ` | Descobertas: ${c.descobertas.join(', ')}` : ''}`)
          .join('\n');
        return `ETAPA ${e.etapaIndex}: ${e.titulo}\n${capsTexto}${e.reflexaoGerada ? `\nReflexão: ${e.reflexaoGerada}` : ''}`;
      })
      .join('\n\n');

    return `
OBJETIVO GERAL: ${contexto.objetivoGeral || 'Não definido'}

PEDIDO ORIGINAL DO USUÁRIO:
"${contexto.inputOriginal.texto}"

RESPOSTA INICIAL DADA:
${contexto.respostaInicial || 'Não disponível'}

PROGRESSO ATUAL:
- Etapas completas: ${contexto.resumoProgressivo.etapasCompletas}/${contexto.resumoProgressivo.totalEtapas}
- Descobertas: ${contexto.resumoProgressivo.principaisDescobertas.join('; ') || 'Nenhuma ainda'}
- Decisões: ${contexto.resumoProgressivo.principaisDecisoes.join('; ') || 'Nenhuma ainda'}

ETAPAS EXECUTADAS:
${etapasTexto || 'Nenhuma etapa executada ainda'}
`.trim();
  }

  private gerarContextoFinal(contexto: ContextoMacro): string {
    const reflexoesTexto = contexto.etapasExecutadas
      .filter(e => e.reflexaoGerada)
      .map(e => `- Etapa ${e.etapaIndex} (${e.titulo}): ${e.reflexaoGerada}`)
      .join('\n');

    return `
PEDIDO ORIGINAL DO USUÁRIO:
"${contexto.inputOriginal.texto}"

OBJETIVO INTERPRETADO:
${contexto.objetivoGeral || contexto.inputOriginal.interpretacao || 'Criar atividades educacionais'}

RESPOSTA INICIAL:
${contexto.respostaInicial || 'Não disponível'}

RESUMO DA EXECUÇÃO:
- Total de etapas: ${contexto.resumoProgressivo.totalEtapas}
- Etapas completas: ${contexto.resumoProgressivo.etapasCompletas}
- Atividades criadas: ${contexto.resumoProgressivo.atividadesCriadas.join(', ') || 'Nenhuma'}

PRINCIPAIS DESCOBERTAS:
${contexto.resumoProgressivo.principaisDescobertas.map(d => `- ${d}`).join('\n') || '- Nenhuma descoberta registrada'}

PRINCIPAIS DECISÕES:
${contexto.resumoProgressivo.principaisDecisoes.map(d => `- ${d}`).join('\n') || '- Nenhuma decisão registrada'}

REFLEXÕES POR ETAPA:
${reflexoesTexto || '- Nenhuma reflexão gerada'}

DADOS COLETADOS:
${JSON.stringify(contexto.resumoProgressivo.dadosRelevantes, null, 2)}
`.trim();
  }

  finalizarSessao(): void {
    const contexto = this.obterContexto();
    if (contexto) {
      contexto.estadoAtual = 'concluido';
      contexto.atualizadoEm = Date.now();
      console.log(`🏁 [ContextManager] Sessão finalizada: ${this.sessionId}`);
    }
  }

  limparSessao(): void {
    contextStore.delete(this.sessionId);
    console.log(`🗑️ [ContextManager] Sessão removida: ${this.sessionId}`);
  }

  static obterEstatisticas(): { totalSessoes: number; sessoesAtivas: number } {
    const agora = Date.now();
    const ativas = Array.from(contextStore.values()).filter(
      c => agora - c.atualizadoEm < 5 * 60 * 1000
    ).length;
    return {
      totalSessoes: contextStore.size,
      sessoesAtivas: ativas,
    };
  }
}

export function getContextManager(sessionId: string): ContextManager {
  return new ContextManager(sessionId);
}

export function getContextoMacro(sessionId: string): ContextoMacro | null {
  return contextStore.get(sessionId) || null;
}
