
import { EpictusIABehavior } from '../config/epictusIABehavior';

export class EpictusIAResponseFormatter {
  private behavior = EpictusIABehavior;

  formatResponse(content: string, userProfile: string = 'student', context: any = {}) {
    // Formata a resposta com elementos visuais ricos
    const formattedContent = this.addVisualElements(content);
    const response = {
      greeting: this.createGreeting(),
      mainContent: this.formatMainContent(formattedContent),
      conclusion: this.createConclusion(content),
      visualElements: this.suggestVisualElements(content)
    };

    return this.wrapInMarkdown(this.adaptToUserProfile(response, userProfile));
  }

  private createGreeting() {
    const greetings = [
      "Eai! Que bom te ver por aqui!",
      "Eai! Pronto para mais uma sessão de estudos?",
      "Eai! Vamos aprender juntos hoje?"
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
    const formattedSection = this.addEmphasis(section);
    return this.addVisualContainers(formattedSection);
  }

  private addEmphasis(text: string) {
    // Adiciona negrito, itálico e emojis contextuais
    return text.replace(/\b(importante|nota|dica|exemplo)\b/gi, match => {
      const icons = {
        importante: '⚠️',
        nota: '📝',
        dica: '💡',
        exemplo: '✨'
      };
      return `**${icons[match.toLowerCase()]} ${match.toUpperCase()}**`;
    });
  }

  private addVisualElements(content: string) {
    // Substitui possíveis saudações iniciais para garantir o padrão "Eai"
    return content.replace(/^(olá|oi|hello|hey|hi)\b/i, 'Eai');
  }

  private addVisualContainers(content: string) {
    // Adiciona containers visuais como tabelas, cards e caixas de destaque
    if (content.includes('lista') || content.includes('passos')) {
      return this.createChecklist(content);
    }
    if (content.includes('compare') || content.includes('versus')) {
      return this.createComparisonTable(content);
    }
    return this.createInfoCard(content);
  }

  private createChecklist(content: string) {
    const items = content.split('\n').map(item => item.trim());
    return items.map(item => `✅ ${item}`).join('\n');
  }

  private createComparisonTable(content: string) {
    // Cria uma tabela de comparação formatada
    return `| 📊 Comparação | Detalhes |\n|-------------|----------|\n${content}`;
  }

  private createInfoCard(content: string) {
    // Cria um card informativo com bordas e destaque
    return `\`\`\`\n💡 ${content}\n\`\`\``;
  }

  private createConclusion(content: string) {
    const motivationalMessages = [
      "💪 Agora é com você! Me chama se precisar de mais ajuda!",
      "🎯 Você está no caminho certo! Continue assim!",
      "✨ Juntos vamos mais longe! Conte comigo sempre!"
    ];
    return motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
  }

  private suggestVisualElements(content: string) {
    // Analisa o conteúdo para sugerir elementos visuais apropriados
    const suggestions = [];
    
    if (content.toLowerCase().includes('matemática') || content.toLowerCase().includes('fórmula')) {
      suggestions.push('gráfico');
      suggestions.push('equação');
    }
    
    if (content.toLowerCase().includes('história') || content.toLowerCase().includes('cronologia')) {
      suggestions.push('linha do tempo');
    }
    
    if (content.toLowerCase().includes('processo') || content.toLowerCase().includes('passo')) {
      suggestions.push('fluxograma');
    }
    
    return suggestions;
  }

  private wrapInMarkdown(response: any) {
    return `${response.greeting}\n\n${response.mainContent}\n\n${response.conclusion}`;
  }

  private adaptToUserProfile(response: any, userProfile: string) {
    const profileSettings = this.behavior.adaptiveBehavior.userProfiles[userProfile];
    return {
      ...response,
      tone: profileSettings?.tone || 'casual'
    };
  }
}
