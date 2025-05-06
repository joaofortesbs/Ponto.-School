
import { EpictusIAChatBehavior } from '../config/epictusIAChatBehavior';
import { EpictusIABehavior } from '../config/epictusIABehavior';

export class EpictusIAChatFormatter {
  private chatBehavior = EpictusIAChatBehavior;
  private generalBehavior = EpictusIABehavior;

  formatChatResponse(content: string, userProfile: string = 'student', context: any = {}): string {
    // Garante que a resposta comece com "Eai"
    let formattedContent = this.ensureGreetingFormat(content);
    
    // Identifica o tipo de conteúdo e contexto
    const contentType = this.identifyContentType(formattedContent, context);
    
    // Adapta estilo de escrita baseado no contexto
    formattedContent = this.adaptWritingStyle(formattedContent, contentType, userProfile);
    
    // Aplica formatação avançada ao conteúdo
    formattedContent = this.applyAdvancedFormatting(formattedContent, contentType);
    
    // Estrutura o conteúdo em seções
    formattedContent = this.structureIntoSections(formattedContent);
    
    // Adiciona elementos visuais automáticos quando apropriado
    formattedContent = this.addAutomaticVisuals(formattedContent, contentType);
    
    // Adiciona sugestões de ação proativas
    formattedContent = this.addProactiveSuggestions(formattedContent, contentType);
    
    // Adiciona sugestões de documento quando apropriado
    formattedContent = this.suggestDocumentCreation(formattedContent, contentType);
    
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
    
    // Adiciona emojis estilizados e formatação para maior impacto visual
    const welcomeEmojis = ['👋', '✨', '🌟', '🚀', '📚', '💪', '🔍', '💡'];
    const randomEmoji = welcomeEmojis[Math.floor(Math.random() * welcomeEmojis.length)];
    
    // Torna a saudação mais vibrante e visualmente atraente
    const styledGreeting = `${randomEmoji} **${prefix}${randomVariation}**`;
    
    return `${styledGreeting}\n\n${processedContent}`;
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
    
    // Apresenta as sugestões em formato de cards para maior impacto visual
    const formattedSuggestions = selectedSuggestions.map((suggestion, index) => {
      const icons = ['🚀', '✨', '📚', '🧠', '💡', '📊', '📝'];
      const icon = icons[index % icons.length];
      return `> ${icon} **${suggestion}**`;
    }).join('\n\n');
    
    return `${content}\n\n### 🚀 Próximos Passos\n\n${formattedSuggestions}`;
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
    
    // Adiciona a pergunta final engajadora conforme as diretrizes da Parte 3
    const { finalQuestion } = this.chatBehavior.coreGuidelines;
    let enhancedContent = `${content}\n\n${selectedConclusion}`;
    
    if (finalQuestion.alwaysInclude) {
      const randomQuestion = finalQuestion.variations[Math.floor(Math.random() * finalQuestion.variations.length)];
      enhancedContent += `\n\n**${randomQuestion}**`;
    }
    
    return enhancedContent;
  }
  
  private addEmphasisToKeyPoints(content: string): string {
    const keywords = [
      'importante', 'essencial', 'fundamental', 'crucial', 'lembre-se',
      'atenção', 'cuidado', 'destaque', 'nota', 'observação', 'dica',
      'conceito-chave', 'princípio', 'regra', 'teorema', 'lei',
      'ponto central', 'fórmula', 'método', 'técnica', 'estratégia',
      'não esqueça', 'relevante', 'significativo', 'primordial', 'vital',
      'imprescindível', 'decisivo', 'crítico', 'indispensável'
    ];
    
    let enhancedContent = content;
    
    // Destaca palavras-chave com formatação rica
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      
      // Adiciona formatação diferente baseada na importância do termo
      if (['crucial', 'essencial', 'fundamental', 'imprescindível'].includes(keyword.toLowerCase())) {
        // Destaque extra para termos ultra importantes
        enhancedContent = enhancedContent.replace(regex, match => `**${match}** ⚠️`);
      } else if (['lembre-se', 'atenção', 'não esqueça', 'cuidado'].includes(keyword.toLowerCase())) {
        // Destaque com alerta visual
        enhancedContent = enhancedContent.replace(regex, match => `**${match}** 🔔`);
      } else if (['dica', 'método', 'técnica', 'estratégia'].includes(keyword.toLowerCase())) {
        // Destaque com ícone de dica
        enhancedContent = enhancedContent.replace(regex, match => `**${match}** 💡`);
      } else {
        // Destaque padrão para outros termos importantes
        enhancedContent = enhancedContent.replace(regex, match => `**${match}**`);
      }
    });
    
    // Destaca conceitos técnicos específicos com formatação aprimorada
    enhancedContent = enhancedContent.replace(/\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\b(?=\s+é\s+um|\s+são\s+|:\s+)/g, "**$1**");
    
    // Adiciona caixas de destaque para conceitos-chave que tenham um parágrafo explicativo
    const paragraphs = enhancedContent.split('\n\n');
    for (let i = 0; i < paragraphs.length; i++) {
      if (paragraphs[i].includes('conceito-chave') || 
          paragraphs[i].includes('princípio') || 
          paragraphs[i].includes('teorema') ||
          paragraphs[i].includes('lei ')) {
        // Transforma em caixa de destaque
        paragraphs[i] = `> 💎 **CONCEITO-CHAVE:** ${paragraphs[i].replace(/^.*?conceito-chave|^.*?princípio|^.*?teorema|^.*?lei /i, '')}`;
      }
    }
    
    enhancedContent = paragraphs.join('\n\n');
    
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
    // Destaca exemplos com formatação especial e visual melhorada
    let enhanced = content;
    
    // Adiciona blockquote estilizado para exemplos com design visual aprimorado
    enhanced = enhanced.replace(/(?:^|\n)(?:exemplo|por exemplo|como exemplo|a título de exemplo|ilustrando)[\s:]+([^\n]+(?:\n[^\n]+)*)/gi,
      (match, exampleText) => `\n> ✨ **EXEMPLO PRÁTICO:** ${exampleText}\n`);
    
    // Adiciona exemplos interativos no formato sugerido
    if (!enhanced.includes("💡 Exemplo:") && !enhanced.includes("EXEMPLO PRÁTICO")) {
      const paragraphs = enhanced.split('\n\n');
      if (paragraphs.length > 2) {
        // Identifica parágrafos que parecem explicar conceitos e adiciona exemplos após eles
        for (let i = 1; i < paragraphs.length - 1; i++) {
          if (paragraphs[i].length > 100 && !paragraphs[i].includes('>') && 
              !paragraphs[i].includes('#') && !paragraphs[i].includes('|')) {
            // Adiciona um exemplo após esse parágrafo de explicação
            paragraphs[i] += `\n\n> 💡 **EXEMPLO:** Veja na prática como aplicar este conceito...`;
            break;
          }
        }
        enhanced = paragraphs.join('\n\n');
      }
    }
    
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
  
  // Identifica o tipo de conteúdo e contexto da resposta
  private identifyContentType(content: string, context: any = {}): any {
    // Objeto para armazenar metadados do tipo de conteúdo
    const contentType = {
      purpose: 'informational', // default
      domain: 'general',
      complexity: 'medium',
      formality: 'neutral',
      visualsRequired: false,
      structureType: 'default',
      documentSuggestion: false
    };
    
    // Identifica domínio acadêmico
    if (content.toLowerCase().includes('tcc') || 
        content.toLowerCase().includes('artigo') || 
        content.toLowerCase().includes('monografia') ||
        content.toLowerCase().includes('dissertação') ||
        content.toLowerCase().includes('bibliografia') ||
        content.toLowerCase().includes('referências') ||
        content.toLowerCase().includes('citação')) {
      contentType.domain = 'academic';
      contentType.formality = 'formal';
      contentType.documentSuggestion = true;
    }
    
    // Identifica domínio profissional/corporativo
    else if (content.toLowerCase().includes('relatório') ||
             content.toLowerCase().includes('apresentação') ||
             content.toLowerCase().includes('proposta') ||
             content.toLowerCase().includes('empresa') ||
             content.toLowerCase().includes('negócio') ||
             content.toLowerCase().includes('cliente') ||
             content.toLowerCase().includes('mercado')) {
      contentType.domain = 'professional';
      contentType.formality = 'formal';
      contentType.documentSuggestion = true;
    }
    
    // Identifica necessidade de representações visuais
    if (content.toLowerCase().includes('gráfico') ||
        content.toLowerCase().includes('tabela') ||
        content.toLowerCase().includes('diagrama') ||
        content.toLowerCase().includes('fluxograma') ||
        content.toLowerCase().includes('visual') ||
        content.toLowerCase().includes('compare') ||
        content.toLowerCase().includes('diferença') ||
        content.toLowerCase().includes('versus') ||
        content.toLowerCase().includes('vs')) {
      contentType.visualsRequired = true;
    }
    
    // Identifica tipo de estrutura necessária
    if (content.toLowerCase().includes('passo') ||
        content.toLowerCase().includes('etapa') ||
        content.toLowerCase().includes('método') ||
        content.toLowerCase().includes('como fazer')) {
      contentType.structureType = 'procedure';
    } 
    else if (content.toLowerCase().includes('comparar') ||
             content.toLowerCase().includes('diferença') ||
             content.toLowerCase().includes('versus') ||
             content.toLowerCase().includes('vs') ||
             content.toLowerCase().includes('contraste')) {
      contentType.structureType = 'comparison';
    } 
    else if (content.toLowerCase().includes('resumo') ||
             content.toLowerCase().includes('pontos principais') ||
             content.toLowerCase().includes('principais aspectos')) {
      contentType.structureType = 'summary';
    }
    
    // Identifica complexidade
    if (content.toLowerCase().includes('simples') ||
        content.toLowerCase().includes('básico') ||
        content.toLowerCase().includes('introdução') ||
        content.toLowerCase().includes('iniciante')) {
      contentType.complexity = 'basic';
    }
    else if (content.toLowerCase().includes('avançado') ||
             content.toLowerCase().includes('complexo') ||
             content.toLowerCase().includes('aprofundar') ||
             content.toLowerCase().includes('detalhe')) {
      contentType.complexity = 'advanced';
    }
    
    return contentType;
  }

  // Adapta estilo de escrita baseado no tipo de conteúdo e perfil
  private adaptWritingStyle(content: string, contentType: any, userProfile: string): string {
    let styledContent = content;
    const { domain, formality, complexity } = contentType;
    
    // Seleciona estilo de escrita baseado no domínio
    let styleToApply = this.chatBehavior.toneAndStyle.writingStyles.modernDynamic; // default
    
    if (domain === 'academic' && formality === 'formal') {
      styleToApply = this.chatBehavior.toneAndStyle.writingStyles.academicFormal;
    } 
    else if (domain === 'professional') {
      styleToApply = this.chatBehavior.toneAndStyle.writingStyles.corporateProfessional;
    }
    
    // Aplica transformações de estilo
    if (styleToApply.sentences === 'short') {
      // Divide sentenças longas
      styledContent = this.shortenSentences(styledContent);
    }
    
    // Ajusta vocabulário
    if (styleToApply.vocabulary === 'simple') {
      styledContent = this.simplifyVocabulary(styledContent);
    } 
    else if (styleToApply.vocabulary === 'advanced' && complexity !== 'basic') {
      styledContent = this.enhanceVocabulary(styledContent);
    }
    
    return styledContent;
  }
  
  // Divide sentenças longas em mais curtas
  private shortenSentences(content: string): string {
    // Identificar sentenças longas (mais de 20 palavras)
    return content.replace(/([^.!?]+[.!?])/g, (sentence) => {
      const words = sentence.split(' ');
      if (words.length > 20) {
        // Tenta encontrar conjunções para dividir
        const middleIndex = Math.floor(words.length / 2);
        let splitIndex = words.findIndex((word, index) => {
          return index > middleIndex / 2 && index < middleIndex * 1.5 && 
                 /\b(e|mas|porém|contudo|entretanto|portanto|assim|pois)\b/i.test(word);
        });
        
        if (splitIndex === -1) {
          splitIndex = middleIndex;
        }
        
        const firstPart = words.slice(0, splitIndex).join(' ');
        const secondPart = words.slice(splitIndex).join(' ');
        
        return `${firstPart}. ${secondPart}`;
      }
      return sentence;
    });
  }
  
  // Simplifica vocabulário para termos mais acessíveis
  private simplifyVocabulary(content: string): string {
    const complexToSimple = {
      'utilizar': 'usar',
      'realizar': 'fazer',
      'efetuar': 'fazer',
      'adquirir': 'comprar',
      'implementar': 'aplicar',
      'visualizar': 'ver',
      'compreender': 'entender',
      'demonstrar': 'mostrar',
      'estabelecer': 'criar',
      'desenvolver': 'criar',
      'requisito': 'necessidade',
      'conceito': 'ideia',
      'metodologia': 'método',
      'consolidar': 'juntar',
      'potencializar': 'melhorar',
      'otimizar': 'melhorar',
      'fundamental': 'importante',
      'concepção': 'ideia',
      'perspectiva': 'visão',
      'procedimento': 'processo'
    };
    
    let simplified = content;
    Object.entries(complexToSimple).forEach(([complex, simple]) => {
      const regex = new RegExp(`\\b${complex}\\b`, 'gi');
      simplified = simplified.replace(regex, simple);
    });
    
    return simplified;
  }
  
  // Aprimora vocabulário para termos mais sofisticados
  private enhanceVocabulary(content: string): string {
    const simpleToComplex = {
      'usar': 'utilizar',
      'fazer': 'realizar',
      'comprar': 'adquirir',
      'aplicar': 'implementar',
      'ver': 'visualizar',
      'entender': 'compreender',
      'mostrar': 'demonstrar',
      'criar': 'desenvolver',
      'precisa': 'necessita',
      'ideia': 'conceito',
      'método': 'metodologia',
      'juntar': 'consolidar',
      'melhorar': 'otimizar',
      'importante': 'fundamental',
      'grande': 'significativo',
      'bom': 'favorável',
      'ruim': 'desfavorável',
      'processo': 'procedimento'
    };
    
    let enhanced = content;
    Object.entries(simpleToComplex).forEach(([simple, complex]) => {
      // Não substituir tudo para não ficar artificial
      if (Math.random() > 0.7) {
        const regex = new RegExp(`\\b${simple}\\b`, 'gi');
        enhanced = enhanced.replace(regex, complex);
      }
    });
    
    return enhanced;
  }
  
  // Adiciona elementos visuais automáticos quando apropriado
  private addAutomaticVisuals(content: string, contentType: any): string {
    if (!contentType.visualsRequired) {
      return content;
    }
    
    let enhancedContent = content;
    
    // Identifica se precisa de tabela comparativa
    if (contentType.structureType === 'comparison') {
      enhancedContent = this.addComparisonTable(enhancedContent);
    }
    
    // Identifica se precisa de fluxograma
    else if (contentType.structureType === 'procedure') {
      enhancedContent = this.addFlowchart(enhancedContent);
    }
    
    // Identifica se precisa de resumo visual
    else if (contentType.structureType === 'summary') {
      enhancedContent = this.addVisualSummary(enhancedContent);
    }
    
    return enhancedContent;
  }
  
  // Cria tabela comparativa visualmente rica
  private addComparisonTable(content: string): string {
    // Procura por padrões de comparação no texto
    const comparisonMatch = content.match(/(?:comparando|comparação entre|diferenças? (?:entre|de)|semelhanças? (?:entre|de))\s+([^.]+)\s+e\s+([^.]+)/i);
    
    if (!comparisonMatch) {
      return content;
    }
    
    const item1 = comparisonMatch[1].trim();
    const item2 = comparisonMatch[2].trim();
    
    // Extrai características/atributos de cada item
    const characteristics = this.extractCharacteristics(content, item1, item2);
    
    if (characteristics.length === 0) {
      return content;
    }
    
    // Cria tabela markdown visualmente aprimorada
    let table = `\n\n### 📊 Comparação Detalhada: ${item1} vs ${item2}\n\n`;
    
    // Cabeçalhos mais destacados
    table += `| Característica | ${item1} | ${item2} |\n`;
    table += `|:---------------:|:---------------:|:---------------:|\n`;
    
    // Adiciona ícones visuais e formatação para comparação mais clara
    characteristics.forEach(char => {
      // Determina ícones e formatação baseado em valores positivos/negativos
      let item1Display = char.item1Value;
      let item2Display = char.item2Value;
      
      if (char.item1Value === '✅') {
        item1Display = `**${char.item1Value} Sim**`;
      } else if (char.item1Value === '❌') {
        item1Display = `${char.item1Value} Não`;
      }
      
      if (char.item2Value === '✅') {
        item2Display = `**${char.item2Value} Sim**`;
      } else if (char.item2Value === '❌') {
        item2Display = `${char.item2Value} Não`;
      }
      
      table += `| **${char.name}** | ${item1Display} | ${item2Display} |\n`;
    });
    
    // Adiciona nota explicativa para melhor compreensão
    table += `\n> 💡 **NOTA:** Esta tabela destaca as principais diferenças entre ${item1} e ${item2}. Os elementos marcados com ✅ indicam presença/vantagem.`;
    
    // Insere a tabela após o parágrafo introdutório
    const paragraphs = content.split('\n\n');
    let insertIndex = 1; // geralmente após o primeiro parágrafo
    
    if (paragraphs.length > 3) {
      // Procura pelo parágrafo mais adequado para inserir
      for (let i = 0; i < paragraphs.length; i++) {
        if (paragraphs[i].includes(item1) && paragraphs[i].includes(item2)) {
          insertIndex = i + 1;
          break;
        }
      }
    }
    
    paragraphs.splice(insertIndex, 0, table);
    return paragraphs.join('\n\n');
  }
  
  // Extrai características para comparação
  private extractCharacteristics(content: string, item1: string, item2: string): any[] {
    const characteristics = [];
    
    // Padrões comuns que indicam características
    const patterns = [
      // Padrão: "X é mais/menos A que Y"
      new RegExp(`${item1}\\s+(?:é|possui|tem|apresenta)\\s+(?:mais|menos)\\s+([^\\s]+)\\s+(?:que|do que)\\s+${item2}`, 'gi'),
      // Padrão: "Y é mais/menos A que X"
      new RegExp(`${item2}\\s+(?:é|possui|tem|apresenta)\\s+(?:mais|menos)\\s+([^\\s]+)\\s+(?:que|do que)\\s+${item1}`, 'gi'),
      // Padrão: "X tem/possui A, enquanto Y tem/possui B"
      new RegExp(`${item1}\\s+(?:tem|possui|apresenta)\\s+([^,]+),\\s+(?:enquanto|enquanto que|ao passo que)\\s+${item2}\\s+(?:tem|possui|apresenta)\\s+([^.]+)`, 'gi')
    ];
    
    // Lista de características comuns para comparação
    const commonCharacteristics = [
      'vantagens', 'desvantagens', 'aplicação', 'uso', 'custo',
      'eficiência', 'complexidade', 'tempo', 'praticidade', 'benefícios'
    ];
    
    // Procura por padrões no texto
    patterns.forEach(pattern => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match.length > 2) {
          characteristics.push({
            name: match[1].trim(),
            item1Value: '✅',
            item2Value: '❌'
          });
        }
      }
    });
    
    // Se não encontrou características específicas, usa as comuns
    if (characteristics.length === 0) {
      commonCharacteristics.forEach(char => {
        // Verifica se a característica é mencionada no texto
        if (content.toLowerCase().includes(char)) {
          characteristics.push({
            name: char.charAt(0).toUpperCase() + char.slice(1),
            item1Value: '?',
            item2Value: '?'
          });
        }
      });
      
      // Adiciona pelo menos 3 características padrão se nada for encontrado
      if (characteristics.length === 0) {
        characteristics.push(
          { name: 'Principais características', item1Value: '-', item2Value: '-' },
          { name: 'Vantagens', item1Value: '-', item2Value: '-' },
          { name: 'Aplicações', item1Value: '-', item2Value: '-' }
        );
      }
    }
    
    return characteristics;
  }
  
  // Cria um fluxograma visual para procedimentos
  private addFlowchart(content: string): string {
    // Busca padrões de passos ou etapas
    const stepsMatches = content.match(/(?:passo|etapa|fase)s?(?:\s+\d+)?(?::|\.)?\s+([^\n.]+)/gi);
    
    if (!stepsMatches || stepsMatches.length < 2) {
      return content;
    }
    
    // Cria representação de fluxograma com elementos visuais melhorados
    let flowchart = '\n\n### ⚙️ Fluxograma Interativo do Processo\n\n';
    flowchart += '```\n';
    
    stepsMatches.forEach((step, index) => {
      const cleanStep = step.replace(/(?:passo|etapa|fase)s?\s+\d+(?::|\.)?\s+/gi, '').trim();
      const stepNumber = index + 1;
      
      // Adiciona formato de fluxograma com numeração e destaque visual
      flowchart += `┌${'─'.repeat(cleanStep.length + 8)}┐\n`;
      flowchart += `│  [${stepNumber}] ${cleanStep}  │\n`;
      flowchart += `└${'─'.repeat(cleanStep.length + 8)}┘\n`;
      
      // Adiciona conectores exceto no último passo
      if (index < stepsMatches.length - 1) {
        flowchart += '       |\n       ▼\n';
      }
    });
    
    flowchart += '```\n';
    
    // Adiciona uma explicação interativa sobre o fluxograma
    flowchart += '\n> 💡 **DICA DE ESTUDO:** Use este fluxograma como guia visual para memorizar a sequência do processo. Tente recriar mentalmente os passos antes de avançar para fixar melhor o conteúdo.';
    
    // Adiciona o fluxograma após o parágrafo que menciona "passos" ou "etapas"
    const paragraphs = content.split('\n\n');
    let insertIndex = paragraphs.findIndex(p => 
      /passos?|etapas?|fases?|processo|método|como fazer/i.test(p)
    );
    
    if (insertIndex === -1) {
      insertIndex = 1; // após o primeiro parágrafo se não encontrar posição ideal
    } else {
      insertIndex += 1; // após o parágrafo que menciona passos
    }
    
    paragraphs.splice(insertIndex, 0, flowchart);
    return paragraphs.join('\n\n');
  }
  
  // Cria um resumo visual para pontos principais
  private addVisualSummary(content: string): string {
    // Procura por pontos-chave, características ou aspectos importantes
    const keyPoints = [];
    
    // Padrões para extração de pontos-chave
    const patterns = [
      /principais?\s+(?:pontos?|aspectos?|características?|elementos?):?(?:\s+incluem)?([^.]+)/i,
      /(?:destacam-se|destacamos?)\s+(?:os seguintes|as seguintes)?([^.]+)/i,
      /(?:é importante|importante|essencial)\s+(?:lembrar|considerar|observar)([^.]+)/i
    ];
    
    // Extrai pontos-chave do conteúdo
    patterns.forEach(pattern => {
      const match = content.match(pattern);
      if (match && match[1]) {
        const points = match[1].split(/,|;|\be\b/).map(p => p.trim()).filter(Boolean);
        keyPoints.push(...points);
      }
    });
    
    // Se não encontrou pontos específicos, extrai de frases com indicadores
    if (keyPoints.length === 0) {
      const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
      sentences.forEach(sentence => {
        if (/importante|essencial|crucial|fundamental|lembre-se|destac[a-z-]+|principais?/i.test(sentence)) {
          keyPoints.push(sentence.trim());
        }
      });
    }
    
    // Limita a quantidade de pontos
    const limitedPoints = keyPoints.slice(0, 5);
    
    if (limitedPoints.length === 0) {
      return content;
    }
    
    // Cria resumo visual com checklist interativo para maior engajamento
    let summary = '\n\n### 📌 Resumo Visual: Pontos-Chave\n\n';
    
    // Testa se o conteúdo parece ser sobre um passo-a-passo ou lista de verificação
    const isChecklistApplicable = /etapas?|passos?|verificar|checklist|lista de|conferir|não esqueça|lembrar de|importante/i.test(content);
    
    if (isChecklistApplicable) {
      // Cria um checklist visual ao invés de simples bullet points
      summary += "**Use esta checklist para verificar seu entendimento:**\n\n";
      
      limitedPoints.forEach((point, index) => {
        summary += `- [ ] ${point}\n`;
      });
      
      summary += "\n> 💡 **DICA:** Marque mentalmente os itens conforme você dominar cada conceito!";
    } else {
      // Usa cards visuais para pontos-chave
      limitedPoints.forEach((point, index) => {
        const emoji = ['🔑', '💡', '⭐', '📌', '🎯'][index % 5];
        summary += `> **${emoji} Ponto ${index + 1}:** ${point}\n>\n`;
      });
    }
    
    // Adiciona o resumo visual antes da conclusão
    const paragraphs = content.split('\n\n');
    let insertIndex = paragraphs.length - 2; // antes do último parágrafo, assumindo que seja a conclusão
    
    if (insertIndex < 1) {
      insertIndex = paragraphs.length; // ao final se não tiver parágrafos suficientes
    }
    
    paragraphs.splice(insertIndex, 0, summary);
    return paragraphs.join('\n\n');
  }
  
  // Sugere criação de documento quando apropriado
  private suggestDocumentCreation(content: string, contentType: any): string {
    if (!contentType.documentSuggestion) {
      return content;
    }
    
    let suggestions = '';
    const { domain } = contentType;
    
    if (domain === 'academic') {
      const formats = this.chatBehavior.documentFormats.academic;
      const randomFormat = formats.standards[Math.floor(Math.random() * formats.standards.length)];
      
      suggestions = `\n\n### 📄 Criação de Documento Acadêmico\n\n`;
      suggestions += `> Posso organizar este conteúdo em formato **${randomFormat}** para seu trabalho acadêmico, com todas as seções e formatações necessárias. Deseja que eu prepare este material?`;
    }
    else if (domain === 'professional') {
      const formats = this.chatBehavior.documentFormats.professional;
      const randomFormat = formats.standards[Math.floor(Math.random() * formats.standards.length)];
      
      suggestions = `\n\n### 📊 Documento Profissional\n\n`;
      suggestions += `> Posso transformar este conteúdo em um **${randomFormat}** profissional, com todos os elementos e formatação apropriados. Deseja que eu prepare este material?`;
    }
    
    if (suggestions) {
      return content + suggestions;
    }
    
    return content;
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
