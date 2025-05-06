
/**
 * EpictusIAChatService
 * 
 * Este serviço gerencia a interação entre o usuário e a Epictus IA no chat,
 * processando mensagens, mantendo o contexto e aplicando o comportamento
 * e formatação definidos.
 */

import epictusIAChatFormatter from './epictusIAChatFormatter';
import { EpictusIAChatBehavior } from '../config/epictusIAChatBehavior';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface UserContext {
  profile: string;
  recentTopics: string[];
  preferredStyle?: string;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export class EpictusIAChatService {
  private behavior = EpictusIAChatBehavior;
  private conversationHistory: ChatMessage[] = [];
  private userContext: UserContext = {
    profile: 'student',
    recentTopics: [],
    preferredStyle: 'modern',
    skillLevel: 'intermediate'
  };

  /**
   * Processa uma mensagem do usuário e gera uma resposta da IA
   * @param userMessage Mensagem enviada pelo usuário
   * @returns Resposta da IA formatada
   */
  async processUserMessage(userMessage: string): Promise<ChatMessage> {
    // Adiciona a mensagem do usuário ao histórico
    this.addMessageToHistory({
      id: this.generateMessageId(),
      content: userMessage,
      sender: 'user',
      timestamp: new Date()
    });
    
    // Atualiza o contexto do usuário com base na mensagem
    this.updateUserContext(userMessage);
    
    // Aqui seria a integração com a API de IA para gerar a resposta
    // Por enquanto, vamos simular uma resposta
    const rawAIResponse = await this.generateAIResponse(userMessage);
    
    // Formata a resposta da IA de acordo com o comportamento e contexto
    const formattedResponse = epictusIAChatFormatter.formatResponse(
      rawAIResponse,
      this.userContext.profile,
      {
        conversationHistory: this.conversationHistory,
        preferredStyle: this.userContext.preferredStyle,
        skillLevel: this.userContext.skillLevel
      }
    );
    
    // Cria o objeto da mensagem de resposta da IA
    const aiMessage: ChatMessage = {
      id: this.generateMessageId(),
      content: formattedResponse,
      sender: 'ai',
      timestamp: new Date()
    };
    
    // Adiciona a resposta da IA ao histórico
    this.addMessageToHistory(aiMessage);
    
    return aiMessage;
  }

  /**
   * Gera uma resposta da IA (simulada)
   * Na implementação real, isso integraria com um serviço de IA externo
   */
  private async generateAIResponse(userMessage: string): Promise<string> {
    // Aqui seria a integração com uma API de IA externa
    // Por enquanto, vamos simular respostas básicas
    
    // Identifica o tipo de mensagem para simular uma resposta
    if (userMessage.toLowerCase().includes('quem é você') || 
        userMessage.toLowerCase().includes('o que você faz')) {
      return `Sou a Epictus IA, uma inteligência artificial educacional avançada. Fui desenvolvida para ajudar estudantes, professores e outros profissionais da educação com respostas precisas, didáticas e aprofundadas. Posso ajudar com explicações sobre diversos temas, criar resumos, planos de estudo, e muito mais. Estou aqui para tornar seu aprendizado mais eficiente e agradável.`;
    }
    
    if (userMessage.toLowerCase().includes('plano de estudo') || 
        userMessage.toLowerCase().includes('como estudar')) {
      return `Criar um plano de estudos eficiente envolve algumas etapas importantes. Primeiro, identifique seus objetivos de aprendizado e prazos. Depois, divida o conteúdo em tópicos e subtópicos gerenciáveis. Estabeleça uma rotina diária de estudos, alternando entre diferentes disciplinas para manter o engajamento. Use técnicas de estudo ativo como resumos escritos, ensino para outras pessoas e resolução de problemas. Reserve tempo para revisões periódicas do material já estudado. Inclua intervalos regulares para descanso - a técnica Pomodoro (25 minutos de estudo seguidos de 5 minutos de pausa) funciona bem para muitas pessoas. Por fim, monitore seu progresso e ajuste o plano conforme necessário.`;
    }
    
    if (userMessage.toLowerCase().includes('anatomia') || 
        userMessage.toLowerCase().includes('corpo humano')) {
      return `A anatomia humana é o estudo da estrutura do corpo humano. O corpo humano pode ser dividido em sistemas principais: Sistema Circulatório (coração, vasos sanguíneos), Sistema Respiratório (pulmões, vias aéreas), Sistema Digestivo (estômago, intestinos, fígado), Sistema Nervoso (cérebro, medula espinhal, nervos), Sistema Esquelético (ossos, articulações), Sistema Muscular (músculos, tendões), Sistema Endócrino (glândulas que produzem hormônios), Sistema Urinário (rins, bexiga), Sistema Reprodutor e Sistema Linfático/Imunológico. Cada sistema trabalha em conjunto com os outros para manter a homeostase, que é o equilíbrio interno do corpo. A anatomia é estudada em vários níveis, desde o macroscópico (visível a olho nu) até o microscópico e molecular.`;
    }
    
    // Resposta genérica para outras mensagens
    return `Sua pergunta sobre "${userMessage}" é interessante. Para responder adequadamente, preciso considerar vários aspectos. Primeiro, o contexto e os fundamentos teóricos relacionados ao tema. Depois, aplicações práticas e exemplos relevantes que ajudem a esclarecer os conceitos. Por fim, seria importante abordar as diferentes perspectivas e desdobramentos possíveis. Se você puder fornecer mais detalhes sobre aspectos específicos que gostaria de explorar, posso elaborar uma resposta mais direcionada às suas necessidades.`;
  }

  /**
   * Adiciona uma mensagem ao histórico da conversa
   */
  private addMessageToHistory(message: ChatMessage): void {
    this.conversationHistory.push(message);
    
    // Limita o tamanho do histórico para evitar consumo excessivo de memória
    if (this.conversationHistory.length > 50) {
      this.conversationHistory = this.conversationHistory.slice(-50);
    }
  }

  /**
   * Atualiza o contexto do usuário com base na mensagem atual
   */
  private updateUserContext(userMessage: string): void {
    // Extrai tópicos da mensagem do usuário
    const topics = this.extractTopics(userMessage);
    
    // Atualiza tópicos recentes
    this.userContext.recentTopics = [
      ...topics,
      ...this.userContext.recentTopics
    ].slice(0, 5); // Mantém apenas os 5 tópicos mais recentes
    
    // Infere o perfil do usuário com base no conteúdo e histórico
    this.inferUserProfile(userMessage);
    
    // Detecta o nível de habilidade com base na linguagem usada
    this.detectSkillLevel(userMessage);
  }

  /**
   * Extrai tópicos principais da mensagem do usuário
   */
  private extractTopics(message: string): string[] {
    // Implementação simplificada - em um sistema real, 
    // usaria NLP para extrair entidades e tópicos
    const words = message.toLowerCase().split(/\s+/);
    const commonWords = new Set([
      'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas', 
      'e', 'ou', 'de', 'da', 'do', 'das', 'dos', 'em', 
      'no', 'na', 'nos', 'nas', 'para', 'por', 'como',
      'que', 'se', 'quando', 'porque', 'qual', 'quais'
    ]);
    
    // Filtra palavras comuns e mantém apenas palavras com pelo menos 4 caracteres
    const potentialTopics = words
      .filter(word => !commonWords.has(word) && word.length >= 4)
      .slice(0, 3); // Pega as 3 primeiras palavras relevantes
    
    return potentialTopics;
  }

  /**
   * Infere o perfil do usuário com base no conteúdo e histórico
   */
  private inferUserProfile(message: string): void {
    const lowerMessage = message.toLowerCase();
    
    // Padrões para identificar diferentes perfis
    const teacherPatterns = [
      'alunos', 'aula', 'ensino', 'didática', 'pedagogia',
      'plano de aula', 'metodologia', 'avaliação'
    ];
    
    const specialistPatterns = [
      'pesquisa', 'artigo', 'teoria', 'análise', 'estudo aprofundado',
      'referências', 'literatura', 'estado da arte', 'publicação'
    ];
    
    const coordinatorPatterns = [
      'gestão', 'coordenação', 'equipe', 'processo', 'resultados',
      'implementação', 'estratégia', 'planejamento', 'avaliação institucional'
    ];
    
    // Verifica se a mensagem contém padrões específicos
    if (teacherPatterns.some(pattern => lowerMessage.includes(pattern))) {
      this.userContext.profile = 'teacher';
    } else if (specialistPatterns.some(pattern => lowerMessage.includes(pattern))) {
      this.userContext.profile = 'specialist';
    } else if (coordinatorPatterns.some(pattern => lowerMessage.includes(pattern))) {
      this.userContext.profile = 'coordinator';
    } else {
      // Padrão é estudante
      this.userContext.profile = 'student';
    }
  }

  /**
   * Detecta o nível de habilidade do usuário
   */
  private detectSkillLevel(message: string): void {
    const lowerMessage = message.toLowerCase();
    
    // Padrões para identificar níveis de habilidade
    const advancedPatterns = [
      'aprofundar', 'complexo', 'detalhado', 'avançado',
      'teoria', 'metodologia', 'pesquisa', 'análise crítica'
    ];
    
    const beginnerPatterns = [
      'básico', 'introdução', 'começar', 'primeiros passos',
      'simples', 'fácil', 'não entendo', 'explicar melhor'
    ];
    
    // Verifica o nível de habilidade
    if (advancedPatterns.some(pattern => lowerMessage.includes(pattern))) {
      this.userContext.skillLevel = 'advanced';
    } else if (beginnerPatterns.some(pattern => lowerMessage.includes(pattern))) {
      this.userContext.skillLevel = 'beginner';
    } else {
      // Padrão é intermediário
      this.userContext.skillLevel = 'intermediate';
    }
  }

  /**
   * Gera um ID único para mensagens
   */
  private generateMessageId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  /**
   * Limpa o histórico da conversa
   */
  clearConversationHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Retorna o histórico da conversa atual
   */
  getConversationHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  /**
   * Atualiza o perfil do usuário manualmente
   */
  setUserProfile(profile: string): void {
    if (['student', 'teacher', 'specialist', 'coordinator'].includes(profile)) {
      this.userContext.profile = profile;
    }
  }

  /**
   * Atualiza o estilo preferido do usuário
   */
  setPreferredStyle(style: string): void {
    this.userContext.preferredStyle = style;
  }
}

export default new EpictusIAChatService();
