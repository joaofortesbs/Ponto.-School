
import { EpictusIAChatBehavior } from '../config/epictusIAChatBehavior';
import { EpictusIABehavior } from '../config/epictusIABehavior';

export class EpictusIAChatFormatter {
  private chatBehavior = EpictusIAChatBehavior;
  private generalBehavior = EpictusIABehavior;

  formatChatResponse(content: string, userProfile: string = 'student'): string {
    // Garante que a resposta comece com "Eai"
    let formattedContent = this.ensureGreetingFormat(content);
    
    // Aplica formatação enriquecida ao conteúdo
    formattedContent = this.enhanceContent(formattedContent);
    
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

  private enhanceContent(content: string): string {
    // Adiciona ênfase a pontos-chave
    if (this.chatBehavior.responseStructure.useEmphasisForKeyPoints) {
      content = this.addEmphasisToKeyPoints(content);
    }
    
    // Adiciona emojis contextualmente se configurado
    if (this.chatBehavior.toneAndStyle.emoji) {
      content = this.addContextualEmojis(content);
    }
    
    // Transforma listas em bullets quando apropriado
    if (this.chatBehavior.responseStructure.useBulletsForLists) {
      content = this.convertToBulletedLists(content);
    }
    
    return content;
  }
  
  private addEmphasisToKeyPoints(content: string): string {
    const keywords = [
      'importante', 'essencial', 'fundamental', 'crucial', 'lembre-se',
      'atenção', 'cuidado', 'destaque', 'nota', 'observação', 'dica'
    ];
    
    let enhancedContent = content;
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      enhancedContent = enhancedContent.replace(regex, match => `**${match}**`);
    });
    
    return enhancedContent;
  }
  
  private addContextualEmojis(content: string): string {
    const emojiMap = {
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
      'ideia': '💭'
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
    
    return enhancedContent;
  }
  
  private convertToBulletedLists(content: string): string {
    // Identifica padrões de listas numéricas ou com hífen
    const numericListRegex = /^\d+\.\s.+$/gm;
    const dashListRegex = /^-\s.+$/gm;
    
    // Converte para markdown bullets se já não estiver em formato de lista
    let enhancedContent = content;
    
    if (!enhancedContent.match(numericListRegex) && !enhancedContent.match(dashListRegex)) {
      // Tenta identificar parágrafos curtos que parecem itens de lista
      const paragraphs = enhancedContent.split('\n\n');
      
      // Converte sequências de parágrafos curtos em listas
      for (let i = 0; i < paragraphs.length; i++) {
        const lines = paragraphs[i].split('\n');
        
        // Se temos múltiplas linhas curtas, convert para lista
        if (lines.length >= 3 && lines.every(line => line.length < 100)) {
          paragraphs[i] = lines.map(line => `- ${line}`).join('\n');
        }
      }
      
      enhancedContent = paragraphs.join('\n\n');
    }
    
    return enhancedContent;
  }
  
  private adaptToneForUserProfile(content: string, userProfile: string): string {
    const profileSettings = this.generalBehavior.adaptiveBehavior.userProfiles[userProfile];
    
    if (!profileSettings) {
      return content;
    }
    
    // Ajusta o tom baseado no perfil (mais formal ou casual)
    if (profileSettings.tone === 'motivador') {
      const positiveReinforcementPhrases = this.chatBehavior.commonResponsePatterns.positiveReinforcement;
      const randomPhrase = positiveReinforcementPhrases[Math.floor(Math.random() * positiveReinforcementPhrases.length)];
      
      // Adiciona uma frase motivacional no final se não existir já
      if (!content.includes("Continue assim") && !content.includes("Você está") && !content.includes("caminho certo")) {
        return `${content}\n\n${randomPhrase}`;
      }
    }
    
    return content;
  }
}
