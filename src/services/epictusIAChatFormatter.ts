
/**
 * EpictusIAChatFormatter
 * 
 * Este serviço é responsável por formatar as respostas da Epictus IA
 * no chat de conversa, aplicando formatações visuais ricas, elementos
 * interativos e adaptações baseadas no perfil do usuário.
 */

import { EpictusIAChatBehavior } from '../config/epictusIAChatBehavior';

export class EpictusIAChatFormatter {
  private behavior = EpictusIAChatBehavior;

  /**
   * Formata a resposta da IA para ser exibida no chat
   * @param content Conteúdo original da resposta
   * @param userProfile Perfil do usuário (student, teacher, etc)
   * @param context Contexto da conversa (histórico, tema, etc)
   * @returns Resposta formatada com elementos visuais ricos
   */
  formatResponse(content: string, userProfile: string = 'student', context: any = {}) {
    // Analisa o conteúdo para determinar o melhor formato
    const contentType = this.determineContentType(content);
    
    // Aplica formatação básica ao conteúdo
    let formattedContent = this.applyBasicFormatting(content);
    
    // Adiciona elementos visuais de acordo com o tipo de conteúdo
    formattedContent = this.addVisualElements(formattedContent, contentType);
    
    // Adapta o tom com base no perfil do usuário
    formattedContent = this.adaptToUserProfile(formattedContent, userProfile);
    
    // Adiciona ações proativas sugeridas ao final
    formattedContent = this.addProactiveActions(formattedContent, contentType);
    
    // Retorna o conteúdo formatado em markdown para renderização
    return this.wrapInMarkdown(formattedContent);
  }

  /**
   * Determina o tipo de conteúdo mais adequado para a resposta
   */
  private determineContentType(content: string): string {
    // Analisa o tamanho e complexidade do conteúdo
    const wordCount = content.split(' ').length;
    
    if (wordCount < 50) return 'quickReference';
    if (wordCount > 500) return 'academicAnalysis';
    if (content.includes('?') && content.split('?').length > 3) return 'detailedExplanation';
    
    // Padrão
    return 'summary';
  }

  /**
   * Aplica formatação básica ao conteúdo
   */
  private applyBasicFormatting(content: string): string {
    // Divide o conteúdo em parágrafos
    const paragraphs = content.split('\n\n');
    
    // Formata cada parágrafo
    const formattedParagraphs = paragraphs.map(paragraph => {
      // Detecta e formata listas
      if (paragraph.match(/^\d+\.\s/m) || paragraph.match(/^[\-\*]\s/m)) {
        return paragraph; // Mantém listas como estão
      }
      
      // Detecta e formata títulos
      if (paragraph.trim().length < 50 && !paragraph.endsWith('.')) {
        return `\n## ${paragraph.trim()}\n`;
      }
      
      // Destaca termos importantes
      return this.highlightImportantTerms(paragraph);
    });
    
    return formattedParagraphs.join('\n\n');
  }

  /**
   * Destaca termos importantes no texto
   */
  private highlightImportantTerms(text: string): string {
    // Identifica e destaca termos importantes (em negrito)
    const keyTermPattern = /\b(conceito|princípio|importante|essencial|fundamental|crucial|chave|central|crítico|vital|principal)\b\s+\w+\s+\w+/gi;
    return text.replace(keyTermPattern, match => `**${match}**`);
  }

  /**
   * Adiciona elementos visuais baseados no tipo de conteúdo
   */
  private addVisualElements(content: string, contentType: string): string {
    let enhancedContent = content;
    
    // Adiciona cabeçalho baseado no tipo de conteúdo
    const headerIcon = this.getHeaderIconForContentType(contentType);
    enhancedContent = `${headerIcon}\n\n${enhancedContent}`;
    
    // Adiciona blocos de destaque para conceitos importantes
    enhancedContent = this.addHighlightBlocks(enhancedContent);
    
    // Adiciona elementos específicos para cada tipo de conteúdo
    switch (contentType) {
      case 'detailedExplanation':
        enhancedContent = this.addExplanationStructure(enhancedContent);
        break;
      case 'summary':
        enhancedContent = this.addSummaryStructure(enhancedContent);
        break;
      case 'quickReference':
        enhancedContent = this.addQuickReferenceStructure(enhancedContent);
        break;
      case 'academicAnalysis':
        enhancedContent = this.addAcademicStructure(enhancedContent);
        break;
    }
    
    return enhancedContent;
  }

  /**
   * Retorna o ícone de cabeçalho para o tipo de conteúdo
   */
  private getHeaderIconForContentType(contentType: string): string {
    const icons = {
      detailedExplanation: '📚 **Explicação Detalhada**',
      summary: '✨ **Resumo Essencial**',
      quickReference: '⚡ **Referência Rápida**',
      academicAnalysis: '🔍 **Análise Acadêmica**',
    };
    
    return icons[contentType] || '💡 **Informação**';
  }

  /**
   * Adiciona blocos de destaque para conceitos importantes
   */
  private addHighlightBlocks(content: string): string {
    // Procura por definições e conceitos para destacar
    const definitionPattern = /([A-Z][a-z]+(?:\s[A-Z][a-z]+)*) é (?:um|uma|o|a) .{10,100}?\./g;
    
    return content.replace(definitionPattern, match => {
      return `\n> 💡 **Definição:** ${match}\n`;
    });
  }

  /**
   * Adiciona estrutura para explicações detalhadas
   */
  private addExplanationStructure(content: string): string {
    // Verifica se já tem subtítulos
    if (content.includes('##')) return content;
    
    // Divide o conteúdo para adicionar subtítulos
    const parts = content.split('\n\n');
    
    if (parts.length >= 3) {
      parts[0] = `## 📌 Contexto\n${parts[0]}`;
      
      const middleIndex = Math.floor(parts.length / 2);
      parts[middleIndex] = `## 🔑 Pontos Principais\n${parts[middleIndex]}`;
      
      parts[parts.length - 1] = `## 🎯 Conclusão\n${parts[parts.length - 1]}`;
    }
    
    return parts.join('\n\n');
  }

  /**
   * Adiciona estrutura para resumos
   */
  private addSummaryStructure(content: string): string {
    // Adiciona um box de resumo ao final
    return content + '\n\n' + this.createSummaryBox(content);
  }

  /**
   * Cria um box de resumo
   */
  private createSummaryBox(content: string): string {
    // Extrai frases importantes para o resumo
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20 && s.trim().length < 100);
    const keyPoints = sentences.slice(0, 3).map(s => s.trim());
    
    if (keyPoints.length === 0) return '';
    
    return `
📋 **Resumo dos Pontos-Chave:**
${keyPoints.map(point => `- ${point}`).join('\n')}
`;
  }

  /**
   * Adiciona estrutura para referências rápidas
   */
  private addQuickReferenceStructure(content: string): string {
    // Adiciona um estilo conciso e direto
    return `🔖 **Resumo Rápido**\n\n${content}`;
  }

  /**
   * Adiciona estrutura acadêmica
   */
  private addAcademicStructure(content: string): string {
    // Divide o conteúdo em seções mais formais
    if (!content.includes('##')) {
      const parts = content.split('\n\n');
      const structuredParts = [];
      
      if (parts.length >= 5) {
        structuredParts.push(`## Introdução\n${parts[0]}`);
        structuredParts.push(`## Desenvolvimento\n${parts.slice(1, parts.length - 2).join('\n\n')}`);
        structuredParts.push(`## Metodologia\n${parts[parts.length - 2]}`);
        structuredParts.push(`## Conclusão\n${parts[parts.length - 1]}`);
        
        return structuredParts.join('\n\n');
      }
    }
    
    return content;
  }

  /**
   * Adapta o conteúdo ao perfil do usuário
   */
  private adaptToUserProfile(content: string, userProfile: string): string {
    const profile = this.behavior.userProfiles[userProfile] || this.behavior.userProfiles.student;
    
    // Adiciona uma saudação personalizada
    const greeting = this.createPersonalizedGreeting(userProfile);
    
    // Adiciona uma conclusão adaptada ao perfil
    const conclusion = this.createPersonalizedConclusion(userProfile);
    
    return `${greeting}\n\n${content}\n\n${conclusion}`;
  }

  /**
   * Cria uma saudação personalizada com base no perfil
   */
  private createPersonalizedGreeting(userProfile: string): string {
    const greetings = {
      student: '👋 Oi! Vamos explorar esse assunto juntos!',
      teacher: '👋 Olá, professor(a)! Aqui está a informação solicitada.',
      specialist: '👋 Saudações! Detalhando o tema conforme solicitado.',
      coordinator: '👋 Olá! Preparei esta análise conforme solicitado.'
    };
    
    return greetings[userProfile] || greetings.student;
  }

  /**
   * Cria uma conclusão personalizada com base no perfil
   */
  private createPersonalizedConclusion(userProfile: string): string {
    const conclusions = {
      student: '✨ **Espero que isso ajude nos seus estudos!** Se tiver mais dúvidas, é só me perguntar.',
      teacher: '📚 **Espero que essa informação seja útil para suas atividades pedagógicas.** Estou à disposição para aprofundar qualquer ponto.',
      specialist: '🔍 **Esta análise atende às suas necessidades?** Podemos examinar aspectos específicos em mais detalhes.',
      coordinator: '📊 **Estas informações ajudam na sua tomada de decisão?** Posso fornecer dados adicionais se necessário.'
    };
    
    return conclusions[userProfile] || conclusions.student;
  }

  /**
   * Adiciona ações proativas sugeridas ao final
   */
  private addProactiveActions(content: string, contentType: string): string {
    // Seleciona ações adequadas com base no tipo de conteúdo
    const actionsToOffer = this.selectProactiveActions(contentType);
    
    if (actionsToOffer.length === 0) return content;
    
    const actionsSection = `
---
### 🚀 O que você gostaria de fazer agora?

${actionsToOffer.map(action => `- ${action}`).join('\n')}
`;
    
    return content + '\n\n' + actionsSection;
  }

  /**
   * Seleciona ações proativas com base no tipo de conteúdo
   */
  private selectProactiveActions(contentType: string): string[] {
    const allActions = this.behavior.behaviorGuidelines.proactiveActions.actionTemplates;
    
    // Seleciona até 3 ações adequadas para o tipo de conteúdo
    switch (contentType) {
      case 'detailedExplanation':
        return [
          'Quer que eu transforme essa explicação em flashcards para estudo?',
          'Posso gerar questões de prova sobre esse tema para você praticar?',
          'Deseja que eu crie um resumo visual deste conteúdo?'
        ];
      case 'summary':
        return [
          'Gostaria que eu aprofundasse algum ponto específico?',
          'Quer que eu monte um plano de estudos baseado nesse tema?',
          'Deseja exemplos práticos de aplicação desse conhecimento?'
        ];
      case 'quickReference':
        return [
          'Precisa de uma explicação mais detalhada sobre esse tema?',
          'Quer ver exemplos práticos de aplicação?'
        ];
      case 'academicAnalysis':
        return [
          'Posso listar referências bibliográficas sobre esse tema?',
          'Quer que eu crie um fluxograma relacionando os conceitos apresentados?',
          'Deseja uma análise comparativa com outras teorias/abordagens?'
        ];
      default:
        return allActions.slice(0, 3);
    }
  }

  /**
   * Envolve o conteúdo em markdown para renderização
   */
  private wrapInMarkdown(content: string): string {
    // Garante que o conteúdo seja renderizado como markdown
    return content;
  }
}

export default new EpictusIAChatFormatter();
