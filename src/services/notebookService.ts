
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

// In a real implementation, this function would likely call an AI service
// to transform content intelligently
export const transformContentWithAI = async (content: string): Promise<string> => {
  try {
    // This is a placeholder. In a real app, you would call an AI service here.
    // For now, we'll just use our simple transformation function
    return await convertToNotebookFormat(content);
  } catch (error) {
    console.error('Error transforming content with AI:', error);
    return `Erro ao transformar conteúdo.\n\nConteúdo original:\n${content}`;
  }
};
