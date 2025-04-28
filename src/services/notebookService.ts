

// Função para formatar o texto para se encaixar adequadamente nas linhas do caderno
export const formatTextForNotebookLines = (text: string): string => {
  // Estimar comprimento médio ideal por linha (aproximadamente 55-60 caracteres)
  const targetLineLength = 58;
  
  // Dividir o texto em parágrafos
  const paragraphs = text.split(/\n\s*\n/);
  
  // Processar cada parágrafo
  const formattedParagraphs = paragraphs.map(paragraph => {
    // Preservar formatação especial para os modelos de anotações
    // Ignorar parágrafos que são cabeçalhos ou especiais com emojis
    if (paragraph.match(/^[📖🧠⚙️🔍💡✅📑🔑📝⭐⏱️🚀📋🎯⚠️💪📘💬🔄]/)) {
      return paragraph;
    }

    // Preservar linhas de estrutura visual de mapas conceituais
    if (paragraph.includes('│') || paragraph.includes('├') || paragraph.includes('└') || paragraph.includes('─')) {
      return paragraph;
    }

    // Ignorar linhas que são marcadores de lista
    if (paragraph.trim().startsWith('•') || paragraph.trim().startsWith('□') || 
        paragraph.trim().startsWith('➤') || paragraph.trim().startsWith('✓') || 
        /^\d+\./.test(paragraph.trim())) {
      return paragraph;
    }
    
    // Dividir em palavras
    const words = paragraph.split(/\s+/);
    let lines = [];
    let currentLine = '';
    
    words.forEach(word => {
      // Se adicionar a palavra exceder o comprimento da linha e já tivermos palavras na linha atual
      if ((currentLine + ' ' + word).length > targetLineLength && currentLine !== '') {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Adicionar com espaço se não for o início da linha
        currentLine = currentLine === '' ? word : currentLine + ' ' + word;
      }
    });
    
    // Adicionar a última linha
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines.join('\n');
  });
  
  // Juntar os parágrafos formatados
  return formattedParagraphs.join('\n\n');
};


/**
 * This service handles the transformation of regular content into notebook-style format
 */

/**
 * Converts regular educational content into a notebook-style format
 * 
 * @param content - The original content to be transformed
 * @param topic - Optional topic to use for the title
 * @returns Formatted content in notebook style
 */
export const convertToNotebookFormat = async (content: string, topic?: string): Promise<string> => {
  try {
    // Extract a title from the content or use provided topic
    let title = topic || extractTitleFromContent(content);
    
    // For now, we'll use a simple transformation approach
    // In a real implementation, this might call an API endpoint or use a more sophisticated algorithm
    
    // Start with the title
    let notebookContent = `${title}\n\n`;
    
    // Extract key points and concepts
    const keyPoints = extractKeyPoints(content);
    
    // Add each key point as a bullet point
    keyPoints.forEach(point => {
      notebookContent += `• ${point}\n`;
    });
    
    // Add the closing note
    notebookContent += "\n👉 Anotação pronta! Agora é só revisar no modo caderno digital :)";
    
    return notebookContent;
  } catch (error) {
    console.error('Error converting to notebook format:', error);
    return `Erro ao converter conteúdo para formato de caderno.\n\nConteúdo original:\n${content}`;
  }
};

/**
 * Simple function to extract a title from content
 */
const extractTitleFromContent = (content: string): string => {
  // Try to find a heading or the first sentence
  const lines = content.split('\n');
  
  // Look for what seems like a title (short line, possibly with topic indicators)
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine && trimmedLine.length < 100 && 
        (trimmedLine.includes(':') || trimmedLine.includes('-') || 
         trimmedLine.includes('–') || /^[A-Z]/.test(trimmedLine))) {
      return trimmedLine;
    }
  }
  
  // If no good title found, try to create one from the first sentence
  const firstSentence = content.split(/[.!?]/)[0];
  if (firstSentence && firstSentence.length < 100) {
    return firstSentence;
  }
  
  return "Anotações de Estudo";
};

/**
 * Extract key points from the content
 */
const extractKeyPoints = (content: string): string[] => {
  const points: string[] = [];
  const contentLines = content.split('\n');
  
  // Process content to extract meaningful points
  let currentParagraph = '';
  
  for (const line of contentLines) {
    if (line.trim() === '') {
      if (currentParagraph) {
        // Process the paragraph to extract key points
        const sentences = currentParagraph.split(/[.!?]/).filter(s => s.trim().length > 0);
        
        for (const sentence of sentences) {
          // Filter for sentences that seem to contain key information
          if (isKeyInformation(sentence)) {
            points.push(sentence.trim());
          }
        }
        
        currentParagraph = '';
      }
    } else {
      currentParagraph += ' ' + line.trim();
    }
  }
  
  // Process any remaining paragraph
  if (currentParagraph) {
    const sentences = currentParagraph.split(/[.!?]/).filter(s => s.trim().length > 0);
    for (const sentence of sentences) {
      if (isKeyInformation(sentence)) {
        points.push(sentence.trim());
      }
    }
  }
  
  // If we didn't extract enough points, fall back to just splitting by sentences
  if (points.length < 3) {
    const allSentences = content.split(/[.!?]/).filter(s => s.trim().length > 0);
    return allSentences.slice(0, Math.min(7, allSentences.length)).map(s => s.trim());
  }
  
  // Don't return too many points
  return points.slice(0, Math.min(10, points.length));
};

/**
 * Check if a sentence likely contains key information
 */
const isKeyInformation = (sentence: string): boolean => {
  const trimmed = sentence.trim();
  
  // Skip very short or very long sentences
  if (trimmed.length < 5 || trimmed.length > 100) {
    return false;
  }
  
  // Look for indicators of important information
  const keyIndicators = [
    'importante', 'essencial', 'fundamental', 'lembre', 'note', 'observe',
    'definição', 'conceito', 'exemplo', 'fórmula', 'regra', 'princípio',
    'característica', 'propriedade', 'função', 'método', 'técnica',
    'quando', 'onde', 'como', 'por que', 'para que'
  ];
  
  for (const indicator of keyIndicators) {
    if (trimmed.toLowerCase().includes(indicator)) {
      return true;
    }
  }
  
  // Check for numeric or mathematical content (often important)
  if (/\d/.test(trimmed) || /[+\-*/=<>]/.test(trimmed)) {
    return true;
  }
  
  // Check for capitalized terms (often important concepts)
  const words = trimmed.split(' ');
  let capitalized = 0;
  for (const word of words) {
    if (word.length > 1 && word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase()) {
      capitalized++;
    }
  }
  
  if (capitalized > 1) {
    return true;
  }
  
  // For now, return true for 50% of remaining sentences to ensure we get enough content
  return Math.random() > 0.5;
};

// Template models de anotações
const notebookTemplates = {
  estudoCompleto: `📖 ESTUDO COMPLETO: [TEMA]

Uma breve introdução sobre o assunto que está sendo estudado, contextualizando sua
importância e relevância para o aprendizado.

🧠 Definições Importantes:
• Conceito principal: explicação clara e objetiva
• Termos relacionados: significados e aplicações
• Origem/contexto histórico: desenvolvimento ao longo do tempo

⚙️ Desenvolvimento do Tema:
1. Primeiro aspecto importante com explicação detalhada
2. Segundo aspecto importante com exemplos práticos
3. Terceiro aspecto relevante aplicado a situações reais

📊 Exemplos Práticos:
• Exemplo 1: descrição e resolução passo a passo
• Exemplo 2: variação do problema com solução completa

💡 Pontos de Atenção:
• Erros comuns a evitar
• Dicas para memorização
• Estratégias para resolução de problemas similares

✅ Resumo Final:
Síntese dos principais pontos estudados, reforçando os conceitos mais importantes
e como eles se relacionam entre si.`,

  mapaConceitual: `✨ MAPA CONCEITUAL: [TEMA CENTRAL]

🔍 CONCEITO PRINCIPAL
  │
  ├── 📌 Subtema 1
  │    ├── • Característica principal
  │    ├── • Elemento secundário
  │    └── • Aplicação prática
  │
  ├── 📌 Subtema 2
  │    ├── • Definição essencial
  │    ├── • Fórmula/método
  │    └── • Exemplo de uso
  │
  └── 📌 Subtema 3
       ├── • Princípio fundamental
       ├── • Variação importante
       └── • Conexão com outros temas

📝 CONEXÕES IMPORTANTES:
• Relação entre Subtema 1 e Subtema 3
• Como Subtema 2 influencia o Conceito Principal
• Aplicações interdisciplinares

⭐ PALAVRAS-CHAVE:
termo1, termo2, termo3, termo4, termo5`,

  revisaoRapida: `⏱️ REVISÃO RÁPIDA: [TEMA]

🚀 PONTOS ESSENCIAIS:
1. Conceito fundamental - definição concisa
2. Elemento crítico - explicação direta
3. Componente-chave - aplicação básica

📋 FÓRMULAS/REGRAS:
• Fórmula 1: [fórmula com breve explicação]
• Regra principal: [descrição clara e direta]
• Exceção importante: [quando não se aplica]

🎯 CHECKLIST PRÉ-PROVA:
□ Revisar conceito X
□ Praticar exemplo do tipo Y
□ Memorizar fórmula Z

⚠️ ATENÇÃO PARA:
• Erro comum 1 - como evitar
• Confusão frequente - como diferenciar
• Pegadinha típica - o que observar

💪 DICA FINAL: orientação estratégica para resolver questões sobre o tema`,

  fichamento: `📘 FICHAMENTO: [TÍTULO DA OBRA/TEXTO]

📑 REFERÊNCIA COMPLETA:
Autor, A. (Ano). Título. Editora. Páginas XX-XX.

💬 CITAÇÕES IMPORTANTES:
"Trecho literal do texto que considero fundamental."
(página XX)
➤ Interpretação: minha explicação do que o autor quis dizer.
➤ Reflexão: minha análise crítica sobre este trecho.

"Segunda citação relevante do material estudado."
(página XX)
➤ Interpretação: como entendo esta passagem.
➤ Reflexão: por que isto é importante ou questionável.

🔍 IDEIAS PRINCIPAIS:
• Conceito 1: resumo conciso da primeira ideia central.
• Conceito 2: síntese da segunda ideia relevante.
• Conceito 3: explicação breve da terceira ideia importante.

🧠 ANÁLISE CRÍTICA GERAL:
Minha avaliação sobre o texto como um todo, considerando
sua contribuição, limitações e relações com outros conhecimentos.

🔄 CONEXÕES COM OUTROS TEMAS:
• Relação com tema X estudado anteriormente
• Como se aplica ao contexto Y
• Contradições ou complementos com a teoria Z`
};

// Aplica o conteúdo a um modelo específico de anotação
export const applyContentToTemplate = async (content: string, templateType: string): Promise<string> => {
  try {
    if (!content || !templateType) {
      throw new Error('Conteúdo ou tipo de template não fornecidos');
    }

    // Extrair informações principais
    const title = extractTitleFromContent(content);
    const keyPoints = extractKeyPoints(content);
    const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 10);
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);

    // Selecionar o template base
    let template = notebookTemplates[templateType as keyof typeof notebookTemplates] || '';
    if (!template) {
      throw new Error(`Tipo de template "${templateType}" não encontrado`);
    }

    // Aplicar conteúdo ao template baseado no tipo
    switch (templateType) {
      case 'estudoCompleto':
        template = template.replace('[TEMA]', title);
        
        // Introdução (primeiro parágrafo ou algumas sentenças iniciais)
        const intro = paragraphs[0] || sentences.slice(0, 2).join('. ');
        template = template.replace(/Uma breve introdução.*aprendizado\./s, intro);
        
        // Definições importantes
        if (keyPoints.length >= 3) {
          template = template.replace(/• Conceito principal:.*/g, `• Conceito principal: ${keyPoints[0]}`);
          template = template.replace(/• Termos relacionados:.*/g, `• Termos relacionados: ${keyPoints[1]}`);
          template = template.replace(/• Origem\/contexto histórico:.*/g, `• Origem/contexto histórico: ${keyPoints[2]}`);
        }
        
        // Desenvolvimento do tema
        const developments = keyPoints.slice(3, 6);
        for (let i = 0; i < Math.min(developments.length, 3); i++) {
          template = template.replace(new RegExp(`${i+1}\\. [^\\n]*`), `${i+1}. ${developments[i]}`);
        }
        
        // Exemplos práticos
        const examples = extractExamplesFromContent(content);
        if (examples.length >= 2) {
          template = template.replace(/• Exemplo 1:.*/g, `• Exemplo 1: ${examples[0]}`);
          template = template.replace(/• Exemplo 2:.*/g, `• Exemplo 2: ${examples[1]}`);
        }
        
        // Pontos de atenção (usar alguns dos pontos restantes)
        const attentionPoints = keyPoints.slice(6, 9);
        if (attentionPoints.length >= 3) {
          template = template.replace(/• Erros comuns a evitar/g, `• Erros comuns a evitar: ${attentionPoints[0]}`);
          template = template.replace(/• Dicas para memorização/g, `• Dicas para memorização: ${attentionPoints[1]}`);
          template = template.replace(/• Estratégias para resolução/g, `• Estratégias para resolução: ${attentionPoints[2]}`);
        }
        
        // Resumo final
        const summary = paragraphs[paragraphs.length - 1] || sentences.slice(-2).join('. ');
        template = template.replace(/Síntese dos principais pontos.*si\./s, summary);
        break;
        
      case 'mapaConceitual':
        template = template.replace('[TEMA CENTRAL]', title);
        
        // Conceito principal
        template = template.replace('CONCEITO PRINCIPAL', title.toUpperCase());
        
        // Subtemas
        const subtemas = extractSubtopics(content, keyPoints);
        for (let i = 0; i < Math.min(subtemas.length, 3); i++) {
          // Subtema
          template = template.replace(`📌 Subtema ${i+1}`, `📌 ${subtemas[i].title}`);
          
          // Características do subtema
          if (subtemas[i].points.length >= 3) {
            template = template.replace(`• Característica principal`, `• ${subtemas[i].points[0]}`);
            template = template.replace(i === 0 ? `• Elemento secundário` : new RegExp(`• (Elemento secundário|Definição essencial|Princípio fundamental)`), `• ${subtemas[i].points[1]}`);
            template = template.replace(i === 0 ? `• Aplicação prática` : new RegExp(`• (Aplicação prática|Fórmula\\/método|Variação importante)`), `• ${subtemas[i].points[2]}`);
          }
        }
        
        // Conexões importantes
        template = template.replace(/• Relação entre Subtema 1 e Subtema 3/g, 
          `• Relação entre ${subtemas[0]?.title || 'Subtema 1'} e ${subtemas[2]?.title || 'Subtema 3'}`);
        template = template.replace(/• Como Subtema 2 influencia o Conceito Principal/g,
          `• Como ${subtemas[1]?.title || 'Subtema 2'} influencia ${title}`);
          
        // Palavras-chave
        const keywords = extractKeywords(content);
        template = template.replace(/termo1, termo2, termo3, termo4, termo5/g, keywords.join(', '));
        break;
        
      case 'revisaoRapida':
        template = template.replace('[TEMA]', title);
        
        // Pontos essenciais
        if (keyPoints.length >= 3) {
          template = template.replace(/1\. Conceito fundamental.*/g, `1. Conceito fundamental - ${keyPoints[0]}`);
          template = template.replace(/2\. Elemento crítico.*/g, `2. Elemento crítico - ${keyPoints[1]}`);
          template = template.replace(/3\. Componente-chave.*/g, `3. Componente-chave - ${keyPoints[2]}`);
        }
        
        // Fórmulas/regras
        const formulas = extractFormulasFromContent(content);
        if (formulas.length >= 3) {
          template = template.replace(/• Fórmula 1:.*/g, `• Fórmula 1: ${formulas[0]}`);
          template = template.replace(/• Regra principal:.*/g, `• Regra principal: ${formulas[1]}`);
          template = template.replace(/• Exceção importante:.*/g, `• Exceção importante: ${formulas[2]}`);
        }
        
        // Checklist pré-prova
        const checkItems = extractChecklistItems(content, keyPoints);
        if (checkItems.length >= 3) {
          template = template.replace(/□ Revisar conceito X/g, `□ Revisar ${checkItems[0]}`);
          template = template.replace(/□ Praticar exemplo do tipo Y/g, `□ Praticar ${checkItems[1]}`);
          template = template.replace(/□ Memorizar fórmula Z/g, `□ Memorizar ${checkItems[2]}`);
        }
        
        // Atenção para
        const warnings = extractWarnings(content);
        if (warnings.length >= 3) {
          template = template.replace(/• Erro comum 1.*/g, `• Erro comum - ${warnings[0]}`);
          template = template.replace(/• Confusão frequente.*/g, `• Confusão frequente - ${warnings[1]}`);
          template = template.replace(/• Pegadinha típica.*/g, `• Pegadinha típica - ${warnings[2]}`);
        }
        
        // Dica final
        const tip = extractTip(content) || keyPoints[keyPoints.length - 1] || '';
        template = template.replace(/💪 DICA FINAL:.*/g, `💪 DICA FINAL: ${tip}`);
        break;
        
      case 'fichamento':
        // Identificar potencial referência
        template = template.replace('[TÍTULO DA OBRA/TEXTO]', title);
        
        // Referência completa
        const reference = extractReference(content) || `Autor desconhecido. (${new Date().getFullYear()}). ${title}.`;
        template = template.replace(/Autor, A. \(Ano\). Título. Editora. Páginas XX-XX./g, reference);
        
        // Citações importantes
        const quotes = extractQuotes(content);
        if (quotes.length >= 2) {
          template = template.replace(/"Trecho literal do texto que considero fundamental."/g, `"${quotes[0].text}"`);
          template = template.replace(/\(página XX\)/g, quotes[0].page ? `(página ${quotes[0].page})` : '');
          template = template.replace(/➤ Interpretação: minha explicação do que o autor quis dizer./g, 
            `➤ Interpretação: ${quotes[0].interpretation || 'Explicação do conceito apresentado.'}`);
          template = template.replace(/➤ Reflexão: minha análise crítica sobre este trecho./g, 
            `➤ Reflexão: ${quotes[0].reflection || 'Análise sobre a relevância deste conceito.'}`);
          
          template = template.replace(/"Segunda citação relevante do material estudado."/g, `"${quotes[1].text}"`);
          template = template.replace(/\(página XX\)/g, quotes[1].page ? `(página ${quotes[1].page})` : '');
          template = template.replace(/➤ Interpretação: como entendo esta passagem./g, 
            `➤ Interpretação: ${quotes[1].interpretation || 'Explicação do conceito apresentado.'}`);
          template = template.replace(/➤ Reflexão: por que isto é importante ou questionável./g, 
            `➤ Reflexão: ${quotes[1].reflection || 'Análise sobre a relevância deste conceito.'}`);
        }
        
        // Ideias principais
        if (keyPoints.length >= 3) {
          template = template.replace(/• Conceito 1:.*/g, `• Conceito 1: ${keyPoints[0]}`);
          template = template.replace(/• Conceito 2:.*/g, `• Conceito 2: ${keyPoints[1]}`);
          template = template.replace(/• Conceito 3:.*/g, `• Conceito 3: ${keyPoints[2]}`);
        }
        
        // Análise crítica
        const analysis = extractAnalysis(content) || paragraphs[paragraphs.length - 1] || '';
        template = template.replace(/Minha avaliação sobre o texto como um todo.*/s, analysis);
        
        // Conexões
        const connections = extractConnections(content, keyPoints);
        if (connections.length >= 3) {
          template = template.replace(/• Relação com tema X estudado anteriormente/g, `• Relação com ${connections[0]}`);
          template = template.replace(/• Como se aplica ao contexto Y/g, `• Como se aplica ao contexto de ${connections[1]}`);
          template = template.replace(/• Contradições ou complementos com a teoria Z/g, `• Relação com a teoria de ${connections[2]}`);
        }
        break;
    }
    
    // Formatar para as linhas do caderno
    return formatTextForNotebookLines(template);
  } catch (error) {
    console.error('Erro ao aplicar conteúdo ao template:', error);
    return content; // Retorna o conteúdo original em caso de erro
  }
};

// Funções auxiliares para extração de informações específicas

// Extrai exemplos do conteúdo
const extractExamplesFromContent = (content: string): string[] => {
  const examples: string[] = [];
  
  // Procurar por frases que começam com "Por exemplo", "Um exemplo", etc.
  const exampleRegexes = [
    /por exemplo[,:]\s*([^.!?]+[.!?])/gi,
    /um exemplo[,:]\s*([^.!?]+[.!?])/gi,
    /exemplo[,:]\s*([^.!?]+[.!?])/gi,
    /considere[,:]\s*([^.!?]+[.!?])/gi,
    /ilustrando[,:]\s*([^.!?]+[.!?])/gi
  ];
  
  for (const regex of exampleRegexes) {
    const matches = content.match(regex);
    if (matches) {
      examples.push(...matches.map(m => m.replace(/^(por exemplo|um exemplo|exemplo|considere|ilustrando)[,:]\s*/i, '')));
    }
  }
  
  // Se não encontrou exemplos explícitos, procurar por sentenças que parecem exemplos
  if (examples.length < 2) {
    const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 10);
    
    for (const sentence of sentences) {
      if (
        /\bcomo\b|\btais como\b|\bpor instância\b|\bcaso\b|\bsituação\b/i.test(sentence) && 
        !examples.includes(sentence.trim())
      ) {
        examples.push(sentence.trim());
      }
    }
  }
  
  // Se ainda não tiver exemplos suficientes, use algumas sentenças como exemplos
  if (examples.length < 2) {
    const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 10);
    const middleSentences = sentences.slice(Math.floor(sentences.length / 3), Math.floor(2 * sentences.length / 3));
    
    for (const sentence of middleSentences) {
      if (!examples.includes(sentence.trim()) && examples.length < 2) {
        examples.push(sentence.trim());
      }
    }
  }
  
  return examples.slice(0, 3); // Limitar a 3 exemplos
};

// Extrai subtópicos do conteúdo
const extractSubtopics = (content: string, keyPoints: string[]): {title: string, points: string[]}[] => {
  const subtopics: {title: string, points: string[]}[] = [];
  
  // Procurar cabeçalhos ou marcadores de tópicos
  const topicRegexes = [
    /[•\-*]\s*([A-Z][^.!?:]+)[:.]/g,
    /(\d+\.\s*[A-Z][^.!?:]+)[:.]/g,
    /([A-Z][^.!?:]{2,})[:.]/g
  ];
  
  let potentialTopics: string[] = [];
  
  for (const regex of topicRegexes) {
    const matches = Array.from(content.matchAll(regex));
    if (matches.length > 0) {
      for (const match of matches) {
        if (match[1] && !potentialTopics.includes(match[1].trim())) {
          potentialTopics.push(match[1].trim());
        }
      }
    }
  }
  
  // Se não encontrou tópicos suficientes, use os key points
  if (potentialTopics.length < 3 && keyPoints.length >= 3) {
    potentialTopics = [...potentialTopics, ...keyPoints.filter(kp => !potentialTopics.includes(kp))];
  }
  
  // Criar subtópicos com seus pontos
  for (let i = 0; i < Math.min(potentialTopics.length, 3); i++) {
    const topicName = potentialTopics[i];
    
    // Encontrar pontos relacionados a este tópico
    const relatedPoints: string[] = [];
    
    // Use sentenças próximas ao tópico ou related key points
    const topicIndex = content.indexOf(topicName);
    if (topicIndex !== -1) {
      const nextSection = content.substring(topicIndex + topicName.length);
      const sentences = nextSection.split(/[.!?]/).slice(0, 5).filter(s => s.trim().length > 5);
      relatedPoints.push(...sentences.map(s => s.trim()));
    }
    
    // Se não tiver pontos suficientes, use key points
    if (relatedPoints.length < 3) {
      const startIndex = i * 3;
      for (let j = 0; j < 3; j++) {
        if (keyPoints[startIndex + j] && !relatedPoints.includes(keyPoints[startIndex + j])) {
          relatedPoints.push(keyPoints[startIndex + j]);
        }
      }
    }
    
    subtopics.push({
      title: topicName,
      points: relatedPoints.slice(0, 3) // Limitar a 3 pontos por subtópico
    });
  }
  
  return subtopics;
};

// Extrai palavras-chave do conteúdo
const extractKeywords = (content: string): string[] => {
  const keywords: string[] = [];
  
  // Procurar por "palavras-chave", "termos importantes", etc.
  const keywordMatch = content.match(/palavras(-|\s)chave[s]?:([^.!?]+)/i) || 
                      content.match(/termos importantes:([^.!?]+)/i) ||
                      content.match(/conceitos(-|\s)chave[s]?:([^.!?]+)/i);
  
  if (keywordMatch && keywordMatch[2]) {
    const keywordStr = keywordMatch[2].trim();
    keywords.push(...keywordStr.split(/[,;]/).map(k => k.trim()));
  }
  
  // Se não encontrou palavras-chave explícitas, extrair termos capitalizados
  if (keywords.length < 5) {
    const words = content.split(/\s+/);
    for (const word of words) {
      if (
        word.length > 3 && 
        /^[A-Z][a-z]+$/.test(word) && // Começa com maiúscula, resto minúscula
        !keywords.includes(word) &&
        !['O', 'A', 'Os', 'As', 'E', 'Ou', 'De', 'Do', 'Da', 'Dos', 'Das', 'Um', 'Uma', 'Uns', 'Umas'].includes(word)
      ) {
        keywords.push(word);
      }
    }
  }
  
  // Ainda precisa de mais palavras-chave? Extrair termos técnicos
  if (keywords.length < 5) {
    const sentences = content.split(/[.!?]/);
    for (const sentence of sentences) {
      const matches = sentence.match(/\b([a-zA-Z][a-zA-Z-]+[a-zA-Z])\b/g);
      if (matches) {
        for (const match of matches) {
          if (
            match.length > 5 && 
            !keywords.includes(match) && 
            !/^(sobre|como|quando|onde|porque|também|através|depois|antes|dentro|durante|enquanto|sempre|ainda)$/i.test(match)
          ) {
            keywords.push(match);
          }
          
          if (keywords.length >= 5) break;
        }
      }
      if (keywords.length >= 5) break;
    }
  }
  
  return keywords.slice(0, 5);
};

// Extrai fórmulas ou regras do conteúdo
const extractFormulasFromContent = (content: string): string[] => {
  const formulas: string[] = [];
  
  // Procurar por padrões de equações matemáticas
  const equationMatches = content.match(/[A-Za-z]+\s*[=:]\s*[^.!?;]+/g);
  if (equationMatches) {
    formulas.push(...equationMatches.map(m => m.trim()));
  }
  
  // Procurar por frases que começam com "fórmula", "regra", etc.
  const formulaRegexes = [
    /fórmula[,:]\s*([^.!?]+[.!?])/gi,
    /regra[,:]\s*([^.!?]+[.!?])/gi,
    /equação[,:]\s*([^.!?]+[.!?])/gi,
    /princípio[,:]\s*([^.!?]+[.!?])/gi,
    /lei[,:]\s*([^.!?]+[.!?])/gi
  ];
  
  for (const regex of formulaRegexes) {
    const matches = content.match(regex);
    if (matches) {
      formulas.push(...matches.map(m => m.replace(/^(fórmula|regra|equação|princípio|lei)[,:]\s*/i, '')));
    }
  }
  
  // Se não encontrou fórmulas explícitas, procurar por sentenças que parecem regras
  if (formulas.length < 3) {
    const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 10);
    
    for (const sentence of sentences) {
      if (
        /\bdeve\b|\bprecisa\b|\bnecessário\b|\bimportante\b|\bobrigatório\b|\bregra\b|\bsempre\b|\bnunca\b/i.test(sentence) && 
        !formulas.includes(sentence.trim())
      ) {
        formulas.push(sentence.trim());
      }
      
      if (formulas.length >= 3) break;
    }
  }
  
  return formulas.slice(0, 3);
};

// Extrai itens para o checklist
const extractChecklistItems = (content: string, keyPoints: string[]): string[] => {
  // Para o checklist, vamos usar os keyPoints mais importantes
  // com algumas adaptações para torná-los tarefas
  
  const items: string[] = [];
  const keyPhrases = keyPoints.filter(kp => kp.length < 60); // Usar apenas frases mais curtas
  
  for (const phrase of keyPhrases) {
    // Transformar em item de checklist
    let checkItem = phrase;
    
    // Remover marcadores de lista e números caso existam
    checkItem = checkItem.replace(/^[•\-*]\s*/, '').replace(/^\d+\.\s*/, '');
    
    // Transformar em forma imperativa se possível
    if (!/^(Revisar|Praticar|Memorizar|Estudar|Entender|Compreender|Resumir|Analisar)/i.test(checkItem)) {
      // Determinar o verbo apropriado com base no conteúdo
      let verb = 'Revisar';
      if (/conceito|definição|significado|teoria/i.test(checkItem)) {
        verb = 'Entender';
      } else if (/fórmula|equação|cálculo/i.test(checkItem)) {
        verb = 'Memorizar';
      } else if (/exemplo|exercício|problema|aplicação/i.test(checkItem)) {
        verb = 'Praticar';
      }
      
      checkItem = `${verb} ${checkItem.charAt(0).toLowerCase() + checkItem.slice(1)}`;
    }
    
    items.push(checkItem);
    if (items.length >= 3) break;
  }
  
  // Se não tiver itens suficientes, criar genéricos baseados no título
  if (items.length < 3) {
    const title = extractTitleFromContent(content);
    
    while (items.length < 3) {
      const index = items.length;
      switch (index) {
        case 0:
          items.push(`Revisar os conceitos principais de ${title}`);
          break;
        case 1:
          items.push(`Praticar exercícios sobre ${title}`);
          break;
        case 2:
          items.push(`Memorizar fórmulas relacionadas a ${title}`);
          break;
      }
    }
  }
  
  return items;
};

// Extrai avisos/alertas do conteúdo
const extractWarnings = (content: string): string[] => {
  const warnings: string[] = [];
  
  // Procurar por frases que indicam alertas
  const warningRegexes = [
    /atenção[,:]\s*([^.!?]+[.!?])/gi,
    /cuidado[,:]\s*([^.!?]+[.!?])/gi,
    /alerta[,:]\s*([^.!?]+[.!?])/gi,
    /erro comum[,:]\s*([^.!?]+[.!?])/gi,
    /observe que[,:]\s*([^.!?]+[.!?])/gi,
    /evit[ae][,:]\s*([^.!?]+[.!?])/gi,
    /não confund[ai]r[,:]\s*([^.!?]+[.!?])/gi
  ];
  
  for (const regex of warningRegexes) {
    const matches = content.match(regex);
    if (matches) {
      warnings.push(...matches.map(m => {
        // Remover o prefixo
        return m.replace(/^(atenção|cuidado|alerta|erro comum|observe que|evite|evita|não confundir|não confunda)[,:]\s*/i, '');
      }));
    }
  }
  
  // Se não encontrou avisos explícitos, procurar por sentenças que sugerem alertas
  if (warnings.length < 3) {
    const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 10);
    
    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      if (
        (
          /\bnão\b|\bevit[ae]\b|\bcuidado\b|\bperigoso\b|\berro\b|\bfalha\b|\bcomum\b|\bfrequente\b|\balerta\b/i.test(lowerSentence) ||
          /\bproibido\b|\bincorreto\b|\binválido\b|\batenção\b|\bproblema\b|\bdificuldade\b/i.test(lowerSentence)
        ) && 
        !warnings.includes(sentence.trim())
      ) {
        warnings.push(sentence.trim());
      }
      
      if (warnings.length >= 3) break;
    }
  }
  
  return warnings.slice(0, 3);
};

// Extrai uma dica final do conteúdo
const extractTip = (content: string): string => {
  // Procurar por frases que indicam dicas/estratégias
  const tipMatches = 
    content.match(/dica[,:]\s*([^.!?]+[.!?])/i) ||
    content.match(/estratégia[,:]\s*([^.!?]+[.!?])/i) ||
    content.match(/recomenda(ção|do|se)[,:]\s*([^.!?]+[.!?])/i) ||
    content.match(/sugest(ão|ões)[,:]\s*([^.!?]+[.!?])/i) ||
    content.match(/importante[,:]\s*([^.!?]+[.!?])/i);
  
  if (tipMatches && tipMatches[1]) {
    return tipMatches[1].trim();
  }
  
  // Verificar nas últimas sentenças do conteúdo
  const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 10);
  const lastSentences = sentences.slice(-3);
  
  for (const sentence of lastSentences) {
    if (/\bdica\b|\bestratégia\b|\brecomenda|\bsugest|\bimportante\b/i.test(sentence)) {
      return sentence.trim();
    }
  }
  
  return "";
};

// Extrai referência bibliográfica
const extractReference = (content: string): string => {
  // Procurar padrões comuns de referência
  const referenceMatch = 
    content.match(/referência[s]?[,:]\s*([^.!?]+[.!?])/i) ||
    content.match(/bibliografi[a]?[,:]\s*([^.!?]+[.!?])/i) ||
    content.match(/(?:autor|autora)[,:]\s*([^.!?]+[.!?])/i) ||
    content.match(/(?:\d{4})[,.]\s*([^.!?]+[.!?])/i);
  
  if (referenceMatch && referenceMatch[1]) {
    return referenceMatch[1].trim();
  }
  
  return "";
};

// Extrai citações do conteúdo
const extractQuotes = (content: string): Array<{text: string, page?: string, interpretation?: string, reflection?: string}> => {
  const quotes: Array<{text: string, page?: string, interpretation?: string, reflection?: string}> = [];
  
  // Procurar por trechos entre aspas
  const quoteMatches = content.match(/"([^"]+)"/g) || content.match(/"([^"]+)"/g);
  
  if (quoteMatches && quoteMatches.length > 0) {
    for (const quoteMatch of quoteMatches) {
      const quote = quoteMatch.replace(/^"|"$|^"|"$/g, '');
      
      // Tentar encontrar número de página
      const pageMatch = content.substring(content.indexOf(quoteMatch) + quoteMatch.length, content.indexOf(quoteMatch) + quoteMatch.length + 50).match(/(?:página|pág\.|pg\.)\s*(\d+)/i);
      
      quotes.push({
        text: quote,
        page: pageMatch ? pageMatch[1] : undefined
      });
    }
  }
  
  // Se não encontrou citações com aspas, procurar por sentenças informativas
  if (quotes.length < 2) {
    const sentences = content.split(/[.!?]/).filter(s => s.trim().length >= 15 && s.trim().length <= 100);
    
    for (const sentence of sentences) {
      const quoteText = sentence.trim();
      
      // Verificar se não é uma frase muito comum ou genérica
      if (
        !/^(este|esta|esse|essa|o|a|os|as|um|uma|uns|umas)\s+/i.test(quoteText) && 
        !/\b(sempre|nunca|geralmente|normalmente|usualmente|frequentemente|raramente)\b/i.test(quoteText) &&
        !quotes.some(q => q.text === quoteText)
      ) {
        quotes.push({ text: quoteText });
      }
      
      if (quotes.length >= 2) break;
    }
  }
  
  // Adicionar interpretações básicas para cada citação
  const interpretationPrefixes = [
    "Essa passagem destaca a importância de",
    "O autor enfatiza que",
    "Este trecho explica como",
    "A citação demonstra que",
    "Neste contexto, o autor argumenta que"
  ];
  
  const reflectionPrefixes = [
    "Essa ideia é fundamental para",
    "Este conceito é relevante porque",
    "Esta noção contrasta com",
    "Esta perspectiva contribui para",
    "Este ponto de vista amplia a compreensão sobre"
  ];
  
  for (let i = 0; i < quotes.length; i++) {
    if (!quotes[i].interpretation) {
      const randomPrefix = interpretationPrefixes[Math.floor(Math.random() * interpretationPrefixes.length)];
      quotes[i].interpretation = `${randomPrefix} ${quotes[i].text.split(' ').slice(0, 4).join(' ')}...`;
    }
    
    if (!quotes[i].reflection) {
      const randomPrefix = reflectionPrefixes[Math.floor(Math.random() * reflectionPrefixes.length)];
      quotes[i].reflection = `${randomPrefix} ${quotes[i].text.split(' ').slice(0, 4).join(' ')}...`;
    }
  }
  
  return quotes.slice(0, 2);
};

// Extrai análise crítica
const extractAnalysis = (content: string): string => {
  // Procurar por trechos que sugerem análise crítica
  const analysisMatch = 
    content.match(/análise[,:]\s*([^.!?]+(?:[.!?][^.!?]+){0,3})/i) ||
    content.match(/crítica[,:]\s*([^.!?]+(?:[.!?][^.!?]+){0,3})/i) ||
    content.match(/avaliação[,:]\s*([^.!?]+(?:[.!?][^.!?]+){0,3})/i) ||
    content.match(/conclusão[,:]\s*([^.!?]+(?:[.!?][^.!?]+){0,3})/i);
  
  if (analysisMatch && analysisMatch[1]) {
    return analysisMatch[1].trim();
  }
  
  return "";
};

// Extrai conexões com outros temas
const extractConnections = (content: string, keyPoints: string[]): string[] => {
  const connections: string[] = [];
  
  // Procurar por frases que indicam conexões
  const connectionRegexes = [
    /relaciona(?:-se)? com[,:]\s*([^.!?]+[.!?])/gi,
    /conexão com[,:]\s*([^.!?]+[.!?])/gi,
    /ligação (?:com|entre)[,:]\s*([^.!?]+[.!?])/gi,
    /aplica(?:-se)? (?:a|em|no|na)[,:]\s*([^.!?]+[.!?])/gi,
    /contexto de[,:]\s*([^.!?]+[.!?])/gi
  ];
  
  for (const regex of connectionRegexes) {
    const matches = content.match(regex);
    if (matches) {
      connections.push(...matches.map(m => {
        return m.replace(/^(relaciona-se com|relaciona com|conexão com|ligação com|ligação entre|aplica-se a|aplica-se em|aplica-se no|aplica-se na|aplica a|aplica em|aplica no|aplica na|contexto de)[,:]\s*/i, '');
      }));
    }
  }
  
  // Se não encontrou conexões explícitas, usar os últimos key points
  if (connections.length < 3 && keyPoints.length >= 3) {
    const lastPoints = keyPoints.slice(-3);
    for (const point of lastPoints) {
      if (!connections.includes(point)) {
        connections.push(point);
      }
    }
  }
  
  return connections.slice(0, 3);
};

// In a real implementation, this function would likely call an AI service
// to transform content intelligently
export const transformContentWithAI = async (content: string): Promise<string> => {
  try {
    // Primeiro converte para o formato básico do caderno
    let transformedContent = await convertToNotebookFormat(content);
    
    // Agora aplicar as regras de formatação para linhas do caderno
    transformedContent = formatTextForNotebookLines(transformedContent);
    
    return transformedContent;
  } catch (error) {
    console.error('Error transforming content with AI:', error);
    return `Erro ao transformar conteúdo.\n\nConteúdo original:\n${content}`;
  }
};
