import { generateAIResponse } from '../../../../services/aiChatService';

export interface QuadroInterativoContent {
  card1: {
    titulo: string;
    conteudo: string;
  };
  card2: {
    titulo: string;
    conteudo: string;
  };
}

class QuadroInterativoGenerator {
  static async generateContent(activityData: any): Promise<QuadroInterativoContent> {
    try {
      console.log('🖼️ Gerando conteúdo do Quadro Interativo:', activityData);

      // Extrair informações relevantes do activityData
      const subject = activityData.subject || activityData.disciplina || 'Disciplina';
      const theme = activityData.theme || activityData.tema || 'Tema da aula';
      const objectives = activityData.objectives || activityData.objetivos || 'Objetivos de aprendizagem';
      const schoolYear = activityData.schoolYear || activityData.anoSerie || 'Ano/Série';

      // Gerar conteúdo baseado nas informações fornecidas
      const content: QuadroInterativoContent = {
        card1: {
          titulo: `Introdução: ${theme}`,
          conteudo: `Bem-vindos ao estudo de ${theme} em ${subject}! 

Nesta aula, direcionada para ${schoolYear}, vamos explorar conceitos fundamentais que são essenciais para o seu desenvolvimento acadêmico.

${objectives ? `Objetivos da aula: ${objectives}` : ''}

Prepare-se para uma experiência de aprendizagem interativa e envolvente!`
        },
        card2: {
          titulo: `Conceitos Principais`,
          conteudo: `Agora que entendemos a introdução, vamos aprofundar nos conceitos principais de ${theme}.

Pontos importantes a serem abordados:
• Fundamentos teóricos
• Aplicações práticas
• Exemplos contextualizados
• Exercícios de fixação

Durante esta seção, você desenvolverá uma compreensão sólida dos conceitos apresentados em ${subject}.

Lembre-se: a prática leva à perfeição!`
        }
      };

      console.log('✅ Conteúdo do Quadro Interativo gerado:', content);
      return content;

    } catch (error) {
      console.error('❌ Erro ao gerar conteúdo do Quadro Interativo:', error);

      // Retornar conteúdo padrão em caso de erro
      return {
        card1: {
          titulo: "Introdução ao Tema",
          conteudo: "Conteúdo introdutório sobre o tema da aula. Este card apresenta os conceitos fundamentais que serão explorados durante a atividade educacional."
        },
        card2: {
          titulo: "Conceitos Principais",
          conteudo: "Principais conceitos e informações importantes sobre o tema. Aqui você encontrará as informações essenciais para o seu aprendizado."
        }
      };
    }
  }

  static validateContent(content: any): boolean {
    return content &&
           content.card1 &&
           content.card2 &&
           content.card1.titulo &&
           content.card1.conteudo &&
           content.card2.titulo &&
           content.card2.conteudo;
  }
}

export default QuadroInterativoGenerator;