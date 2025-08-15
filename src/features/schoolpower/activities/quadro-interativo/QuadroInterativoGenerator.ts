
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface QuadroInterativoData {
  title: string;
  description: string;
  subject: string;
  schoolYear: string;
  theme: string;
  objectives: string;
  difficultyLevel: string;
  quadroInterativoCampoEspecifico: string;
  materials?: string;
  instructions?: string;
  evaluation?: string;
  timeLimit?: string;
  context?: string;
}

export interface QuadroInterativoGeneratedContent {
  card1: {
    title: string;
    content: string;
  };
  card2: {
    title: string;
    content: string;
  };
}

export class QuadroInterativoGenerator {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyBnzAcYrJBGJAEawMa0PWxnYCzYaQS5eeQ';
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateQuadroInterativoContent(data: QuadroInterativoData): Promise<QuadroInterativoGeneratedContent> {
    console.log('🖼️ Iniciando geração de conteúdo do Quadro Interativo:', data);

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = this.buildPrompt(data);
      console.log('📝 Prompt construído para Quadro Interativo');

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('✅ Resposta recebida da IA:', text);

      const parsedContent = this.parseGeneratedContent(text);
      console.log('🎯 Conteúdo parseado:', parsedContent);

      return parsedContent;
    } catch (error) {
      console.error('❌ Erro ao gerar conteúdo do Quadro Interativo:', error);
      return this.getFallbackContent(data);
    }
  }

  private buildPrompt(data: QuadroInterativoData): string {
    return `
Você é um especialista em educação digital e criação de atividades interativas. Com base nos dados fornecidos, gere conteúdo para um Quadro Interativo educacional.

DADOS DA ATIVIDADE:
- Título: ${data.title}
- Descrição: ${data.description}
- Disciplina: ${data.subject}
- Ano/Série: ${data.schoolYear}
- Tema: ${data.theme}
- Objetivos: ${data.objectives}
- Nível de Dificuldade: ${data.difficultyLevel}
- Tipo de Atividade: ${data.quadroInterativoCampoEspecifico}
${data.materials ? `- Materiais: ${data.materials}` : ''}
${data.instructions ? `- Instruções: ${data.instructions}` : ''}
${data.evaluation ? `- Avaliação: ${data.evaluation}` : ''}
${data.timeLimit ? `- Tempo Estimado: ${data.timeLimit}` : ''}
${data.context ? `- Contexto: ${data.context}` : ''}

TAREFA:
Gere 2 textos com títulos para criar um Quadro Interativo educacional. Cada texto deve ser específico e relacionado ao tema e objetivos apresentados.

FORMATO DE RESPOSTA (OBRIGATÓRIO):
CARD1_TITULO: [Título do primeiro card]
CARD1_CONTEUDO: [Conteúdo detalhado do primeiro card - mínimo 3 frases]

CARD2_TITULO: [Título do segundo card]
CARD2_CONTEUDO: [Conteúdo detalhado do segundo card - mínimo 3 frases]

DIRETRIZES:
1. Os títulos devem ser claros e atrativos
2. O conteúdo deve ser educativo e apropriado para o ano/série especificado
3. Incorpore elementos interativos adequados ao tipo de atividade especificado
4. Mantenha coerência com os objetivos de aprendizagem
5. Use linguagem adequada ao nível educacional
6. Cada card deve abordar aspectos complementares do tema

Gere o conteúdo agora:
`;
  }

  private parseGeneratedContent(text: string): QuadroInterativoGeneratedContent {
    console.log('🔍 Parseando conteúdo gerado:', text);

    try {
      // Extrair Card 1
      const card1TituloMatch = text.match(/CARD1_TITULO:\s*(.+?)(?:\n|CARD1_CONTEUDO:)/s);
      const card1ConteudoMatch = text.match(/CARD1_CONTEUDO:\s*(.+?)(?:\n\s*CARD2_TITULO:|$)/s);

      // Extrair Card 2
      const card2TituloMatch = text.match(/CARD2_TITULO:\s*(.+?)(?:\n|CARD2_CONTEUDO:)/s);
      const card2ConteudoMatch = text.match(/CARD2_CONTEUDO:\s*(.+?)$/s);

      const card1Titulo = card1TituloMatch?.[1]?.trim() || 'Conceitos Fundamentais';
      const card1Conteudo = card1ConteudoMatch?.[1]?.trim() || 'Conteúdo do primeiro card não foi gerado corretamente.';
      
      const card2Titulo = card2TituloMatch?.[1]?.trim() || 'Aplicação Prática';
      const card2Conteudo = card2ConteudoMatch?.[1]?.trim() || 'Conteúdo do segundo card não foi gerado corretamente.';

      return {
        card1: {
          title: card1Titulo,
          content: card1Conteudo
        },
        card2: {
          title: card2Titulo,
          content: card2Conteudo
        }
      };
    } catch (error) {
      console.error('❌ Erro ao parsear conteúdo:', error);
      return this.getFallbackContent();
    }
  }

  private getFallbackContent(data?: QuadroInterativoData): QuadroInterativoGeneratedContent {
    const tema = data?.theme || 'o tema da aula';
    const disciplina = data?.subject || 'a disciplina';

    return {
      card1: {
        title: 'Conceitos Fundamentais',
        content: `Neste quadro interativo, vamos explorar os conceitos fundamentais relacionados a ${tema}. Os estudantes poderão interagir com elementos visuais que facilitam a compreensão dos principais tópicos de ${disciplina}. Esta atividade promove o aprendizado ativo e a participação dos alunos.`
      },
      card2: {
        title: 'Aplicação Prática',
        content: `Aqui os alunos colocarão em prática o que aprenderam sobre ${tema}. Através de exercícios interativos e dinâmicas participativas, eles consolidarão o conhecimento adquirido. Esta seção promove a aplicação real dos conceitos estudados em ${disciplina}.`
      }
    };
  }

  static validateData(data: QuadroInterativoData): boolean {
    const requiredFields = ['title', 'description', 'subject', 'schoolYear', 'theme', 'objectives'];
    return requiredFields.every(field => data[field as keyof QuadroInterativoData]?.trim());
  }
}

export default QuadroInterativoGenerator;
