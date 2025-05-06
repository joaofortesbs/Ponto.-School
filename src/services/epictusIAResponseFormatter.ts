
import { EpictusIABehavior } from '../config/epictusIABehavior';

export class EpictusIAResponseFormatter {
  private behavior = EpictusIABehavior;

  formatResponse(content: string, userProfile: string = 'student', context: any = {}) {
    // Garantir que o conteúdo siga o padrão avançado
    const formattedContent = this.applyAdvancedResponsePattern(content);
    
    const response = {
      greeting: this.createGreeting(),
      mainContent: this.formatMainContent(formattedContent),
      actionSuggestions: this.createActionSuggestions(content),
      conclusion: this.createConclusion(content),
      visualElements: this.suggestVisualElements(content)
    };

    return this.wrapInMarkdown(this.adaptToUserProfile(response, userProfile));
  }

  private applyAdvancedResponsePattern(content: string) {
    // Substitui possíveis saudações iniciais para garantir o padrão "Eai"
    let processedContent = content.replace(/^(olá|oi|hello|hey|hi)\b/i, 'Eai');
    
    // Estrutura em seções se ainda não estiver formatado
    if (!this.hasStructuredSections(processedContent)) {
      processedContent = this.structureIntoSections(processedContent);
    }
    
    return processedContent;
  }

  private hasStructuredSections(content: string) {
    // Verifica se já tem cabeçalhos ou listas
    return /#{1,3}\s|\*\s|-\s|[0-9]+\.\s/.test(content);
  }

  private structureIntoSections(content: string) {
    // Divide em parágrafos
    const paragraphs = content.split('\n\n').filter(Boolean);
    
    if (paragraphs.length < 2) return content;
    
    // Estrutura para o formato avançado
    const intro = paragraphs[0];
    const mainContentParagraphs = paragraphs.slice(1, -1);
    const conclusion = paragraphs[paragraphs.length - 1];
    
    let structuredContent = `### ${this.generateSectionTitle(intro)}\n${intro}\n\n`;
    
    if (mainContentParagraphs.length > 0) {
      structuredContent += `### Explicação Detalhada\n`;
      mainContentParagraphs.forEach(p => {
        structuredContent += `${p}\n\n`;
      });
    }
    
    structuredContent += `### Conclusão\n${conclusion}`;
    
    return structuredContent;
  }

  private generateSectionTitle(introText: string) {
    // Identifica e gera um título baseado no conteúdo da introdução
    const topics = ["matemática", "física", "química", "biologia", "história", "geografia", 
                   "literatura", "português", "inglês", "filosofia", "sociologia", "artes"];
    
    let title = "Visão Geral";
    
    for (const topic of topics) {
      if (introText.toLowerCase().includes(topic)) {
        title = `Sobre ${topic.charAt(0).toUpperCase() + topic.slice(1)}`;
        break;
      }
    }
    
    return title;
  }

  private createGreeting() {
    const greetings = [
      "Eai! Que bom te ver por aqui!",
      "Eai! Pronto para mais uma sessão de estudos?",
      "Eai! Vamos aprender juntos hoje?",
      "Eai! Preparado para expandir seus conhecimentos?",
      "Eai! Animado para explorar novos conceitos?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  private formatMainContent(content: string) {
    const sections = this.splitIntoSections(content);
    return sections.map(section => this.formatSection(section)).join('\n\n');
  }

  private splitIntoSections(content: string) {
    // Divide o conteúdo em seções lógicas
    return content.split('\n\n').filter(Boolean);
  }

  private formatSection(section: string) {
    // Adiciona elementos visuais e formatação rica
    let formattedSection = this.addEmphasis(section);
    formattedSection = this.improveReadability(formattedSection);
    return this.addVisualContainers(formattedSection);
  }

  private improveReadability(text: string) {
    // Melhora a legibilidade do texto
    let improved = text;
    
    // Adiciona marcadores para listas se detectado padrão de lista
    if (/(\d+\.\s|\-\s)/.test(improved) === false && 
        /primeiro|segundo|terceiro|quarto|passo|etapa|fase|finalmente/i.test(improved)) {
      improved = improved.replace(/(?:primeiro|1º passo)[\s:]+(.*?)(?=(?:segundo|2º passo|$))/i, "1. $1\n");
      improved = improved.replace(/(?:segundo|2º passo)[\s:]+(.*?)(?=(?:terceiro|3º passo|$))/i, "2. $1\n");
      improved = improved.replace(/(?:terceiro|3º passo)[\s:]+(.*?)(?=(?:quarto|4º passo|$))/i, "3. $1\n");
      improved = improved.replace(/(?:quarto|4º passo)[\s:]+(.*?)(?=(?:quinto|5º passo|$))/i, "4. $1\n");
      improved = improved.replace(/(?:quinto|5º passo)[\s:]+(.*?)(?=(?:sexto|6º passo|$))/i, "5. $1\n");
    }
    
    // Adiciona destaque para conceitos importantes
    improved = improved.replace(/\b(conceito|definição|teoria|lei|princípio|regra|fórmula)\b\s+de\s+([^.!?:]+)/gi, 
      (match, term, concept) => `${term} de **${concept}**`);
    
    return improved;
  }

  private addEmphasis(text: string) {
    // Adiciona negrito, itálico e emojis contextuais
    let emphasized = text.replace(/\b(importante|nota|dica|exemplo|atenção|cuidado|lembre-se)\b/gi, match => {
      const icons = {
        importante: '⚠️',
        nota: '📝',
        dica: '💡',
        exemplo: '✨',
        atenção: '⚠️',
        cuidado: '⚡',
        'lembre-se': '🔔'
      };
      return `**${icons[match.toLowerCase()]} ${match.toUpperCase()}**`;
    });
    
    // Destaca termos técnicos
    emphasized = emphasized.replace(/\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\b(?=\s+é\s+um|\s+são\s+|:\s+)/g, "**$1**");
    
    return emphasized;
  }

  private addVisualContainers(content: string) {
    // Adiciona containers visuais baseados no conteúdo
    if (content.includes('lista') || content.includes('passos') || 
        content.includes('etapas') || content.includes('fases')) {
      return this.createChecklist(content);
    }
    
    if (content.includes('compare') || content.includes('versus') || 
        content.includes(' vs ') || content.includes('diferença')) {
      return this.createComparisonTable(content);
    }
    
    if (content.includes('conceito') || content.includes('definição') ||
        content.includes('resumindo') || content.includes('em suma')) {
      return this.createHighlightedCard(content);
    }
    
    return this.createInfoCard(content);
  }

  private createChecklist(content: string) {
    const items = content.split('\n').map(item => item.trim());
    return items.map(item => {
      // Transforma numerações em checklists visuais
      if (/^\d+\.\s/.test(item)) {
        return item.replace(/^(\d+)\.\s(.*)$/, `✅ **Passo $1:** $2`);
      }
      return `✅ ${item}`;
    }).join('\n');
  }

  private createComparisonTable(content: string) {
    // Cria uma tabela de comparação formatada
    let tableContent = content;
    
    // Tenta extrair comparação e formatar como tabela
    if (!content.includes('|')) {
      const parts = content.split(/versus|vs\.?|diferença entre|comparação/i);
      if (parts.length > 1) {
        const itemA = parts[0].trim();
        const itemB = parts[1].split('.')[0].trim();
        tableContent = `| **${itemA}** | **${itemB}** |\n|-------------|----------|\n| ${content} |`;
      }
    }
    
    return `📊 **Comparação**\n\n${tableContent}`;
  }

  private createHighlightedCard(content: string) {
    // Cria um card com destaque para conceitos importantes
    return `🔍 **Conceito-Chave**\n\n> ${content}`;
  }

  private createInfoCard(content: string) {
    // Cria um card informativo com bordas e destaque
    return `💡 **Informação**\n\n${content}`;
  }

  private createActionSuggestions(content: string) {
    const suggestions = [
      "💪 Quer que eu elabore um resumo esquematizado desse conteúdo?",
      "🎯 Posso criar exercícios práticos sobre esse tema. Deseja?",
      "📚 Quer que eu sugira materiais complementares sobre isso?",
      "🧩 Deseja que eu crie um mapa mental sobre esse assunto?",
      "📝 Posso transformar essa explicação em flashcards para estudo. Interesse?",
      "⚡ Quer testar seu conhecimento com uma questão de prova sobre isso?"
    ];
    
    // Seleciona sugestões com base no conteúdo
    let contextualSuggestions = [];
    
    if (content.toLowerCase().includes('prova') || content.toLowerCase().includes('exam')) {
      contextualSuggestions.push("📋 Posso criar um plano de revisão para sua prova!");
    }
    
    if (content.toLowerCase().includes('apresenta') || content.toLowerCase().includes('seminário')) {
      contextualSuggestions.push("🎤 Quer ajuda para preparar sua apresentação sobre este tema?");
    }
    
    if (content.toLowerCase().includes('redação') || content.toLowerCase().includes('escrev')) {
      contextualSuggestions.push("✍️ Posso sugerir um roteiro para sua redação sobre este assunto!");
    }
    
    // Combina sugestões contextuais com gerais
    const allSuggestions = [...contextualSuggestions, ...suggestions];
    
    // Seleciona 2-3 sugestões aleatoriamente
    const numSuggestions = Math.floor(Math.random() * 2) + 2; // 2 ou 3
    const selectedSuggestions = [];
    
    for (let i = 0; i < numSuggestions; i++) {
      if (allSuggestions.length > 0) {
        const index = Math.floor(Math.random() * allSuggestions.length);
        selectedSuggestions.push(allSuggestions[index]);
        allSuggestions.splice(index, 1);
      }
    }
    
    return selectedSuggestions.join("\n");
  }

  private createConclusion(content: string) {
    const motivationalMessages = [
      "💪 Agora é com você! Me chama se precisar de mais ajuda!",
      "🎯 Você está no caminho certo! Continue assim!",
      "✨ Juntos vamos mais longe! Conte comigo sempre!",
      "🚀 Com dedicação, você vai dominar esse conteúdo rapidamente!",
      "💡 Sua curiosidade é o motor do aprendizado. Continue perguntando!"
    ];
    
    // Seleciona conclusão personalizada com base no conteúdo
    if (content.toLowerCase().includes('difícil') || content.toLowerCase().includes('complicado')) {
      return "🌟 Este tema pode parecer desafiador no início, mas com prática você vai dominá-lo. Estou aqui para ajudar em cada passo!";
    }
    
    if (content.toLowerCase().includes('obrigad') || content.toLowerCase().includes('valeu')) {
      return "🙏 Foi um prazer ajudar! Volte sempre que precisar aprofundar seus conhecimentos ou tirar novas dúvidas!";
    }
    
    return motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
  }

  private suggestVisualElements(content: string) {
    // Analisa o conteúdo para sugerir elementos visuais apropriados
    const suggestions = [];
    
    if (content.toLowerCase().includes('matemática') || content.toLowerCase().includes('fórmula') ||
        content.toLowerCase().includes('gráfico') || content.toLowerCase().includes('estatística')) {
      suggestions.push('gráfico');
      suggestions.push('equação');
    }
    
    if (content.toLowerCase().includes('história') || content.toLowerCase().includes('cronologia') ||
        content.toLowerCase().includes('evolução') || content.toLowerCase().includes('período')) {
      suggestions.push('linha do tempo');
    }
    
    if (content.toLowerCase().includes('processo') || content.toLowerCase().includes('passo') ||
        content.toLowerCase().includes('método') || content.toLowerCase().includes('ciclo')) {
      suggestions.push('fluxograma');
    }
    
    if (content.toLowerCase().includes('comparação') || content.toLowerCase().includes('diferenças') ||
        content.toLowerCase().includes('versus') || content.toLowerCase().includes('vantagens')) {
      suggestions.push('tabela comparativa');
    }
    
    if (content.toLowerCase().includes('conceito') || content.toLowerCase().includes('mapa') ||
        content.toLowerCase().includes('relaciona') || content.toLowerCase().includes('conexão')) {
      suggestions.push('mapa conceitual');
    }
    
    return suggestions;
  }

  private wrapInMarkdown(response: any) {
    return `${response.greeting}\n\n${response.mainContent}\n\n${response.actionSuggestions}\n\n${response.conclusion}`;
  }

  private adaptToUserProfile(response: any, userProfile: string) {
    const profileSettings = this.behavior.adaptiveBehavior.userProfiles[userProfile];
    
    // Adapta o tom baseado no perfil
    let adaptedResponse = { ...response };
    
    if (profileSettings) {
      if (profileSettings.tone === 'formal') {
        // Reduz emojis e torna o tom mais formal
        adaptedResponse.greeting = adaptedResponse.greeting.replace(/Eai!/, "Eai!");
        adaptedResponse.conclusion = adaptedResponse.conclusion.replace(/💪|🎯|✨|🚀/, "");
      } else if (profileSettings.tone === 'motivador') {
        // Adiciona mais elementos motivacionais
        adaptedResponse.conclusion += "\n\n🔥 Você tem um potencial incrível. Continue se desafiando!";
      }
    }
    
    return adaptedResponse;
  }
}
