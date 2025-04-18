
// Extrair possíveis termos e conceitos do conteúdo (para fallback)
export const extractTerms = (content: string): string[] => {
  const terms: string[] = [];
  const words = content.split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    if (words[i].length > 5 && /^[A-Z]/.test(words[i])) {
      terms.push(words[i].replace(/[,.;:?!]$/g, ''));
    }
  }
  return terms.length > 0 ? terms : ["conceito", "tema", "assunto", "método", "técnica"];
};

// Extrair tópicos-chave do conteúdo
export const extractKeyTopics = (content: string): string[] => {
  // Encontrar títulos ou palavras-chave em negrito
  const boldPattern = /\*\*(.*?)\*\*/g;
  const headingPattern = /^#+\s+(.+)$/gm;

  let matches = [];
  let match;

  // Extrair texto em negrito
  while ((match = boldPattern.exec(content)) !== null) {
    if (match[1].length > 3) {
      matches.push(match[1]);
    }
  }

  // Extrair títulos
  while ((match = headingPattern.exec(content)) !== null) {
    matches.push(match[1]);
  }

  // Se não encontrou suficientes, extrair frases iniciais de parágrafos
  if (matches.length < 5) {
    const paragraphs = content.split('\n\n');
    paragraphs.forEach(p => {
      const firstSentence = p.split('.')[0];
      if (firstSentence && firstSentence.length > 15 && firstSentence.length < 100) {
        matches.push(firstSentence);
      }
    });
  }

  return matches.slice(0, 10); // Limitar a 10 tópicos
};

// Gerar questões personalizadas baseadas no conteúdo (fallback)
export const generatePersonalizedQuestions = (topics: string[], type: string): string[] => {
  const questions = [];

  if (type === 'multiple-choice') {
    topics.forEach((topic) => {
      questions.push(`Qual é o principal aspecto de ${topic} abordado no texto?`);
      questions.push(`De acordo com o conteúdo, qual alternativa sobre ${topic} está correta?`);
      questions.push(`Qual das seguintes afirmações relacionadas a ${topic} é verdadeira?`);
    });
  } else if (type === 'essay') {
    topics.forEach((topic) => {
      questions.push(`Disserte sobre a importância de ${topic} no contexto apresentado.`);
      questions.push(`Explique como ${topic} se relaciona com outros conceitos do material.`);
      questions.push(`Elabore uma análise crítica sobre ${topic} e suas aplicações.`);
    });
  } else if (type === 'true-false') {
    topics.forEach((topic) => {
      questions.push(`${topic} pode ser aplicado em múltiplos contextos diferentes.`);
      questions.push(`A teoria apresentada sobre ${topic} é universalmente aceita na comunidade acadêmica.`);
      questions.push(`As limitações de ${topic} foram claramente abordadas no material.`);
    });
  }

  return questions;
};
