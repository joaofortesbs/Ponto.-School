
import { EpictusIAChatBehavior } from '../config/epictusIAChatBehavior';
import { EpictusIABehavior } from '../config/epictusIABehavior';

export class EpictusIAChatFormatter {
  private chatBehavior = EpictusIAChatBehavior;
  private generalBehavior = EpictusIABehavior;

  formatChatResponse(content: string, userProfile: string = 'student'): string {
    // Garante que a resposta comece com "Eai"
    let formattedContent = this.ensureGreetingFormat(content);
    
    // Aplica formatação avançada ao conteúdo
    formattedContent = this.applyAdvancedFormatting(formattedContent);
    
    // Estrutura o conteúdo em seções
    formattedContent = this.structureIntoSections(formattedContent);
    
    // Adiciona sugestões de ação proativas
    formattedContent = this.addProactiveSuggestions(formattedContent);
    
    // Adiciona conclusão motivacional
    formattedContent = this.addMotivationalConclusion(formattedContent);
    
    // Adapta o tom conforme o perfil do usuário
    formattedContent = this.adaptToneForUserProfile(formattedContent, userProfile);
    
    return formattedContent;
  }

  private ensureGreetingFormat(content: string): string {
    // Remove qualquer saudação existente
    let processedContent = content.replace(/^(olá|oi|hello|hey|hi|bom dia|boa tarde|boa noite)[\s,.!]*/i, '');
    
    // Se a resposta já começa com "Eai", apenas retorna
    if (processedContent.startsWith("Eai")) {
      return processedContent;
    }
    
    // Adiciona o "Eai" com uma variação de complemento
    const { prefix, variations } = this.chatBehavior.greeting;
    const randomVariation = variations[Math.floor(Math.random() * variations.length)];
    
    return `${prefix}${randomVariation}\n\n${processedContent}`;
  }

  private applyAdvancedFormatting(content: string): string {
    // Melhorar formatação para maior clareza e impacto visual
    let enhanced = content;
    
    // Adiciona ênfase a pontos-chave
    if (this.chatBehavior.responseStructure.useEmphasisForKeyPoints) {
      enhanced = this.addEmphasisToKeyPoints(enhanced);
    }
    
    // Adiciona emojis contextualmente se configurado
    if (this.chatBehavior.toneAndStyle.emoji) {
      enhanced = this.addContextualEmojis(enhanced);
    }
    
    // Transforma listas em bullets quando apropriado
    if (this.chatBehavior.responseStructure.useBulletsForLists) {
      enhanced = this.convertToBulletedLists(enhanced);
    }
    
    // Formata exemplos e casos práticos
    enhanced = this.formatExamples(enhanced);
    
    // Adiciona caixas de destaque para informações importantes
    enhanced = this.addHighlightBoxes(enhanced);
    
    return enhanced;
  }
  
  private structureIntoSections(content: string): string {
    // Verifica se já tem estrutura de seções com títulos
    if (content.includes('## ') || content.includes('### ')) {
      return content;
    }
    
    // Divide em parágrafos para análise
    const paragraphs = content.split('\n\n').filter(Boolean);
    if (paragraphs.length <= 2) return content;
    
    // Identifica possíveis seções baseadas no conteúdo
    let structured = '';
    let currentSection = '';
    let inIntroduction = true;
    
    // Processa primeiro parágrafo como introdução
    structured += paragraphs[0] + '\n\n';
    
    // Analisa parágrafos subsequentes para identificar possíveis seções
    for (let i = 1; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i];
      
      // Detecta possíveis inícios de seção por palavras-chave
      if (inIntroduction && this.isPotentialSectionStart(paragraph)) {
        inIntroduction = false;
        const sectionTitle = this.generateSectionTitle(paragraph);
        currentSection = sectionTitle;
        structured += `### ${sectionTitle}\n\n${paragraph}\n\n`;
      }
      // Detecta transição para seção de conclusão/dicas finais
      else if (i >= paragraphs.length - 2 && this.isPotentialConclusion(paragraph)) {
        structured += `### Conclusão & Próximos Passos\n\n${paragraph}\n\n`;
      }
      // Detecta mudança de assunto que pode indicar nova seção
      else if (!inIntroduction && this.isTopicChange(currentSection, paragraph)) {
        const sectionTitle = this.generateSectionTitle(paragraph);
        currentSection = sectionTitle;
        structured += `### ${sectionTitle}\n\n${paragraph}\n\n`;
      }
      else {
        structured += paragraph + '\n\n';
      }
    }
    
    return structured;
  }
  
  private isPotentialSectionStart(text: string): boolean {
    // Detecta possíveis inícios de seção por palavras-chave
    const sectionIndicators = [
      'podemos dividir', 'existem (diversos|vários|diferentes) tipos', 
      'conceito', 'definição', 'entendendo', 'compreendendo',
      'passos para', 'como funciona', 'processo de', 'método de',
      'primeira parte', 'segundo aspecto', 'exemplo prático'
    ];
    
    const pattern = new RegExp(sectionIndicators.join('|'), 'i');
    return pattern.test(text);
  }
  
  private isPotentialConclusion(text: string): boolean {
    // Detecta possíveis conclusões por palavras-chave
    const conclusionIndicators = [
      'concluindo', 'em resumo', 'resumindo', 'portanto', 'assim,', 
      'finalizando', 'por fim', 'em síntese', 'para finalizar',
      'lembre-se', 'não se esqueça', 'dica final', 'recomendação'
    ];
    
    const pattern = new RegExp(conclusionIndicators.join('|'), 'i');
    return pattern.test(text);
  }
  
  private isTopicChange(currentTopic: string, text: string): boolean {
    // Verifica se há mudança significativa de tópico
    if (!currentTopic) return false;
    
    const keywords = currentTopic.toLowerCase().split(' ')
      .filter(word => word.length > 3);
      
    // Verifica se há palavras-chave de transição
    const transitionMarkers = [
      'por outro lado', 'em contraste', 'diferentemente', 
      'além disso', 'adicionalmente', 'outro aspecto',
      'quanto a', 'no que diz respeito a', 'passando para',
      'agora vamos', 'considerando agora'
    ];
    
    const hasTransitionMarker = transitionMarkers.some(marker => 
      text.toLowerCase().includes(marker));
      
    // Verifica se há pouca sobreposição de palavras-chave com o tópico atual
    let keywordOverlap = 0;
    keywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword)) {
        keywordOverlap++;
      }
    });
    
    const lowOverlap = keywordOverlap / keywords.length < 0.3;
    
    return hasTransitionMarker || lowOverlap;
  }
  
  private generateSectionTitle(text: string): string {
    // Gera título de seção baseado no conteúdo
    
    // Verifica padrões comuns de início de seção
    const definitionMatch = text.match(/(?:conceito|definição|o que é|entendendo)\s+(?:de|sobre|do|da|o|a)?\s*([^.,:;]+)/i);
    if (definitionMatch) return `Definição de ${definitionMatch[1].trim()}`;
    
    const typesMatch = text.match(/(?:tipos|categorias|classificação|formas)\s+(?:de|do|da)?\s*([^.,:;]+)/i);
    if (typesMatch) return `Tipos de ${typesMatch[1].trim()}`;
    
    const exampleMatch = text.match(/(?:exemplo|caso|instância|ilustração)\s+(?:de|do|da)?\s*([^.,:;]+)/i);
    if (exampleMatch) return `Exemplo de ${exampleMatch[1].trim()}`;
    
    const processMatch = text.match(/(?:processo|método|técnica|procedimento|como)\s+(?:de|para|do|da)?\s*([^.,:;]+)/i);
    if (processMatch) return `Como ${processMatch[1].trim()}`;
    
    // Se não encontrar padrões específicos, gera título genérico
    const firstSentence = text.split(/[.!?]/)[0];
    if (firstSentence.length < 50) {
      return this.capitalizeSentence(firstSentence);
    }
    
    // Extrai palavras-chave para título
    const words = text.split(' ');
    const keywords = words.filter(word => word.length > 4).slice(0, 3);
    
    if (keywords.length > 0) {
      return this.capitalizeSentence(keywords.join(' '));
    }
    
    // Fallback para títulos genéricos
    const genericTitles = [
      "Conceitos Fundamentais",
      "Explicação Detalhada",
      "Análise do Tema",
      "Informações Importantes",
      "Pontos Principais"
    ];
    
    return genericTitles[Math.floor(Math.random() * genericTitles.length)];
  }
  
  private capitalizeSentence(text: string): string {
    // Capitaliza primeira letra de cada palavra importante
    return text.replace(/\b([a-z])/g, match => match.toUpperCase());
  }
  
  private addProactiveSuggestions(content: string): string {
    // Verifica se já contém sugestões
    if (content.includes('Quer que eu') || content.includes('Deseja que') || 
        content.includes('Posso criar') || content.includes('Interesse?')) {
      return content;
    }
    
    // Adiciona sugestões proativas ao final
    const { actionSuggestions } = this.chatBehavior.commonResponsePatterns;
    
    // Seleciona 2-3 sugestões aleatoriamente
    const numSuggestions = Math.floor(Math.random() * 2) + 2; // 2 ou 3
    const selectedSuggestions = [];
    
    const availableSuggestions = [...actionSuggestions];
    
    for (let i = 0; i < numSuggestions; i++) {
      if (availableSuggestions.length > 0) {
        const index = Math.floor(Math.random() * availableSuggestions.length);
        selectedSuggestions.push(availableSuggestions[index]);
        availableSuggestions.splice(index, 1);
      }
    }
    
    return `${content}\n\n### Próximos Passos\n\n${selectedSuggestions.join('\n')}`;
  }
  
  private addMotivationalConclusion(content: string): string {
    // Verifica se já contém conclusão motivacional
    if (content.includes('caminho certo') || content.includes('Continue assim') || 
        content.includes('Conte comigo') || content.includes('progresso')) {
      return content;
    }
    
    // Adiciona conclusão motivacional
    const { conclusion } = this.chatBehavior.commonResponsePatterns;
    const selectedConclusion = conclusion[Math.floor(Math.random() * conclusion.length)];
    
    return `${content}\n\n${selectedConclusion}`;
  }
  
  private addEmphasisToKeyPoints(content: string): string {
    const keywords = [
      'importante', 'essencial', 'fundamental', 'crucial', 'lembre-se',
      'atenção', 'cuidado', 'destaque', 'nota', 'observação', 'dica',
      'conceito-chave', 'princípio', 'regra', 'teorema', 'lei',
      'ponto central', 'fórmula', 'método', 'técnica', 'estratégia'
    ];
    
    let enhancedContent = content;
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      enhancedContent = enhancedContent.replace(regex, match => `**${match}**`);
    });
    
    // Destaca conceitos técnicos específicos
    enhancedContent = enhancedContent.replace(/\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\b(?=\s+é\s+um|\s+são\s+|:\s+)/g, "**$1**");
    
    return enhancedContent;
  }
  
  private addContextualEmojis(content: string): string {
    const emojiMap = {
      // Áreas do conhecimento
      'matemática': '🔢',
      'física': '⚛️',
      'química': '🧪',
      'biologia': '🧬',
      'geografia': '🌎',
      'história': '📜',
      'português': '📝',
      'literatura': '📚',
      'inglês': '🇬🇧',
      'artes': '🎨',
      'educação física': '🏃',
      'filosofia': '🤔',
      'sociologia': '👥',
      
      // Elementos educacionais
      'prova': '📋',
      'teste': '✍️',
      'exercício': '📝',
      'tarefa': '📋',
      'dúvida': '❓',
      'entendi': '💡',
      'compreendi': '🧠',
      'parabéns': '🎉',
      'certo': '✅',
      'errado': '❌',
      'dica': '💡',
      'ideia': '💭',
      
      // Elementos estruturais
      'importante': '⚠️',
      'atenção': '⚠️',
      'nota': '📝',
      'exemplo': '✨',
      'passo': '👣',
      'etapa': '🔄',
      'processo': '⚙️',
      'método': '🔍',
      'conceito': '💡',
      'definição': '📚',
      'fórmula': '➗',
      'equação': '🔣',
      'gráfico': '📊',
      'tabela': '📋',
      'resumo': '📋',
      'conclusão': '🏁',
      'lembre-se': '🔔',
      'cuidado': '⚡',
      'comparação': '⚖️',
      'diferença': '↔️',
      'semelhança': '🔄',
      'erro comum': '❌',
      'dica importante': '💎'
    };
    
    let enhancedContent = content;
    const frequency = this.chatBehavior.toneAndStyle.emojiFrequency;
    const frequencyFactor = frequency === 'low' ? 0.3 : frequency === 'moderate' ? 0.6 : 0.9;
    
    // Adiciona emojis apenas com a frequência definida
    Object.entries(emojiMap).forEach(([term, emoji]) => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      enhancedContent = enhancedContent.replace(regex, match => {
        return Math.random() < frequencyFactor ? `${match} ${emoji}` : match;
      });
    });
    
    // Adiciona emojis em títulos de seções
    enhancedContent = enhancedContent.replace(/###\s+(.*?)(\n|$)/g, (match, title) => {
      let emojiToAdd = '';
      
      if (/defini[çc][ãa]o|conceito|o que [ée]/i.test(title)) emojiToAdd = '📚 ';
      else if (/exemplo|caso|ilustra[çc][ãa]o/i.test(title)) emojiToAdd = '✨ ';
      else if (/tipo|categoria|classifica[çc][ãa]o/i.test(title)) emojiToAdd = '🔍 ';
      else if (/como|processo|m[ée]todo|t[ée]cnica/i.test(title)) emojiToAdd = '⚙️ ';
      else if (/pr[óo]ximo|passo|a[çc][ãa]o/i.test(title)) emojiToAdd = '🚀 ';
      else if (/conclus[ãa]o|resumo|s[íi]ntese/i.test(title)) emojiToAdd = '🏁 ';
      else if (/importante|aten[çc][ãa]o|lembre/i.test(title)) emojiToAdd = '⚠️ ';
      else if (/dica|sugest[ãa]o|recomenda[çc][ãa]o/i.test(title)) emojiToAdd = '💡 ';
      
      return `### ${emojiToAdd}${title}\n`;
    });
    
    return enhancedContent;
  }
  
  private convertToBulletedLists(content: string): string {
    // Identifica padrões de listas numéricas ou com hífen
    const hasNumericList = /^\d+\.\s.+$/gm.test(content);
    const hasDashList = /^-\s.+$/gm.test(content);
    
    // Se já tem formato de lista, não modifica
    if (hasNumericList || hasDashList) {
      return content;
    }
    
    // Converte padrões de texto que sugerem listas em listas formatadas
    let enhanced = content;
    
    // Padrão: "primeiro, ...segundo, ...terceiro..."
    enhanced = enhanced.replace(/(?:^|\n)(primeiro[\s:,]+)(.*?)(?=(?:\n|$)(?:segundo|$))/gi, 
      '\n1. $2\n');
    enhanced = enhanced.replace(/(?:^|\n)(segundo[\s:,]+)(.*?)(?=(?:\n|$)(?:terceiro|$))/gi, 
      '\n2. $2\n');
    enhanced = enhanced.replace(/(?:^|\n)(terceiro[\s:,]+)(.*?)(?=(?:\n|$)(?:quarto|$))/gi, 
      '\n3. $2\n');
    enhanced = enhanced.replace(/(?:^|\n)(quarto[\s:,]+)(.*?)(?=(?:\n|$)(?:quinto|$))/gi, 
      '\n4. $2\n');
    enhanced = enhanced.replace(/(?:^|\n)(quinto[\s:,]+)(.*?)(?=(?:\n|$)(?:sexto|$))/gi, 
      '\n5. $2\n');
    
    // Padrão: linhas curtas começando com verbos de ação podem ser itens de lista
    const paragraphs = enhanced.split('\n\n');
    for (let i = 0; i < paragraphs.length; i++) {
      const lines = paragraphs[i].split('\n');
      
      // Detecta se o parágrafo tem características de lista
      const actionVerbPattern = /^([A-Z][a-zçáàãâéêíóõôúü]*[er]|Utilize|Faça|Vá|Leia|Note)/;
      const shortLines = lines.every(line => line.length < 100);
      const mostLinesStartWithVerbs = lines.filter(line => actionVerbPattern.test(line)).length >= lines.length * 0.5;
      
      if (lines.length >= 3 && shortLines && mostLinesStartWithVerbs) {
        // Converte para lista com bullet points
        paragraphs[i] = lines.map((line, index) => `• ${line}`).join('\n');
      }
    }
    
    return paragraphs.join('\n\n');
  }
  
  private formatExamples(content: string): string {
    // Destaca exemplos com formatação especial
    let enhanced = content;
    
    // Adiciona blockquote para exemplos
    enhanced = enhanced.replace(/(?:^|\n)(?:exemplo|por exemplo|como exemplo|a título de exemplo|ilustrando)[\s:]+([^\n]+(?:\n[^\n]+)*)/gi,
      (match, exampleText) => `\n> ✨ **EXEMPLO:** ${exampleText}\n`);
    
    return enhanced;
  }
  
  private addHighlightBoxes(content: string): string {
    // Adiciona caixas de destaque para informações importantes
    let enhanced = content;
    
    // Adiciona caixa para dicas importantes
    enhanced = enhanced.replace(/(?:^|\n)(?:dica importante|dica crucial|lembre-se sempre|sempre lembre|não esqueça|jamais esqueça)[\s:]+([^\n]+(?:\n[^\n]+)*)/gi,
      (match, tipText) => `\n> 💎 **DICA IMPORTANTE:** ${tipText}\n`);
    
    // Adiciona caixa para alertas/cuidados
    enhanced = enhanced.replace(/(?:^|\n)(?:cuidado|atenção|aviso|alerta|fique atento)[\s:]+([^\n]+(?:\n[^\n]+)*)/gi,
      (match, warningText) => `\n> ⚠️ **ATENÇÃO:** ${warningText}\n`);
    
    // Adiciona caixa para resumos/sínteses
    enhanced = enhanced.replace(/(?:^|\n)(?:em resumo|resumindo|sintetizando|em síntese|concluindo)[\s:]+([^\n]+(?:\n[^\n]+)*)/gi,
      (match, summaryText) => `\n> 📌 **RESUMO:** ${summaryText}\n`);
    
    return enhanced;
  }
  
  private adaptToneForUserProfile(content: string, userProfile: string): string {
    const profileSettings = this.generalBehavior?.adaptiveBehavior?.userProfiles?.[userProfile];
    
    if (!profileSettings) {
      return content;
    }
    
    // Ajusta o tom baseado no perfil (mais formal ou casual)
    let adaptedContent = content;
    
    if (profileSettings.tone === 'formal') {
      // Reduz uso de gírias e torna linguagem mais formal
      this.chatBehavior.toneAndStyle.casualExpressions.forEach(expression => {
        const regex = new RegExp(`\\b${expression}\\b`, 'gi');
        adaptedContent = adaptedContent.replace(regex, match => {
          const formalAlternatives = {
            'massa': 'excelente',
            'top': 'ótimo',
            'show': 'excepcional',
            'legal': 'interessante',
            'beleza': 'correto',
            'tranquilo': 'compreensível',
            'valeu': 'agradeço'
          };
          return formalAlternatives[match.toLowerCase()] || match;
        });
      });
      
      // Reduz uso excessivo de pontuação
      adaptedContent = adaptedContent.replace(/!{2,}/g, '!');
      
    } else if (profileSettings.tone === 'motivador') {
      // Adiciona elementos motivacionais e encorajadores
      if (!adaptedContent.includes("Continue assim") && 
          !adaptedContent.includes("caminho certo") && 
          !adaptedContent.includes("Você consegue")) {
          
        const motivationalPhrases = [
          "\n\n💪 **Você tem potencial para ir muito além! Continue se desafiando!**",
          "\n\n🌟 **Cada pergunta que você faz mostra seu comprometimento com o aprendizado. Continue assim!**",
          "\n\n🚀 **Estou impressionado com sua curiosidade! É assim que se constrói conhecimento sólido!**"
        ];
        
        const randomPhrase = motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)];
        adaptedContent += randomPhrase;
      }
    }
    
    return adaptedContent;
  }
}
