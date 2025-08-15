
import { generateAIResponse } from '../../../../services/aiChatService';

export class QuadroInterativoGenerator {
  static async generateContent(data: any): Promise<any> {
    try {
      console.log('🎯 Gerando conteúdo para Quadro Interativo:', data);

      // Extrair dados dos campos
      const tituloTemaAssunto = data.tituloTemaAssunto || data['titulo-tema-assunto'] || 'Tema da Aula';
      const anoSerie = data.anoSerie || data['ano-serie'] || 'Ensino Fundamental';
      const objetivosAprendizagem = data.objetivosAprendizagem || data['objetivos-aprendizagem'] || 'Objetivos de aprendizagem';
      const conteudoProgramatico = data.conteudoProgramatico || data['conteudo-programatico'] || 'Conteúdo programático';

      // Prompt específico para gerar conteúdo de quadro interativo
      const prompt = `
      Como uma IA especializada em educação, crie um conteúdo interativo para quadro escolar baseado nos seguintes dados:

      TEMA: ${tituloTemaAssunto}
      ANO/SÉRIE: ${anoSerie}
      OBJETIVOS: ${objetivosAprendizagem}
      CONTEÚDO: ${conteudoProgramatico}

      Gere EXATAMENTE 2 textos educacionais curtos e objetivos para serem exibidos em cards interativos:

      1. Um texto introdutório sobre o tema (máximo 150 palavras)
      2. Um texto com conceitos principais (máximo 150 palavras)

      Responda APENAS no formato JSON:
      {
        "card1": {
          "titulo": "Introdução",
          "conteudo": "texto introdutório aqui"
        },
        "card2": {
          "titulo": "Conceitos Principais",
          "conteudo": "texto com conceitos aqui"
        }
      }
      `;

      // Gerar resposta da IA
      const response = await generateAIResponse(prompt, `quadro_interativo_${Date.now()}`);

      // Parse da resposta
      let parsedContent;
      try {
        // Extrair JSON da resposta se houver texto extra
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : response;
        parsedContent = JSON.parse(jsonString);
      } catch (parseError) {
        console.warn('Erro ao parsear resposta da IA, usando conteúdo padrão:', parseError);
        parsedContent = {
          card1: {
            titulo: "Introdução",
            conteudo: `Bem-vindos ao estudo de ${tituloTemaAssunto}! Este é um tema fundamental para ${anoSerie}, que nos permitirá compreender conceitos importantes e desenvolver habilidades essenciais.`
          },
          card2: {
            titulo: "Conceitos Principais",
            conteudo: `Os principais conceitos que abordaremos incluem: ${conteudoProgramatico}. Estes elementos são fundamentais para atingir nossos objetivos: ${objetivosAprendizagem}.`
          }
        };
      }

      console.log('✅ Conteúdo gerado com sucesso:', parsedContent);
      return parsedContent;

    } catch (error) {
      console.error('❌ Erro ao gerar conteúdo do Quadro Interativo:', error);
      
      // Retornar conteúdo padrão em caso de erro
      return {
        card1: {
          titulo: "Introdução",
          conteudo: "Conteúdo introdutório sobre o tema da aula."
        },
        card2: {
          titulo: "Conceitos Principais",
          conteudo: "Principais conceitos e informações do tema abordado."
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
