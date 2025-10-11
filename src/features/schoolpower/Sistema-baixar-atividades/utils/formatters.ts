export const formatDate = (date: Date = new Date()): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9\-_\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 100);
};

export const generateFileName = (activityTitle: string, format: string): string => {
  const sanitizedTitle = sanitizeFileName(activityTitle);
  const timestamp = new Date().getTime();
  return `${sanitizedTitle}_${timestamp}.${format}`;
};

export const stripHtml = (html: string): string => {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

export const getDifficultyLabel = (difficulty: string): string => {
  const labels: { [key: string]: string } = {
    'facil': 'Fácil',
    'fácil': 'Fácil',
    'basico': 'Básico',
    'básico': 'Básico',
    'medio': 'Médio',
    'médio': 'Médio',
    'intermediario': 'Intermediário',
    'intermediário': 'Intermediário',
    'dificil': 'Difícil',
    'difícil': 'Difícil',
    'avancado': 'Avançado',
    'avançado': 'Avançado'
  };
  return labels[difficulty.toLowerCase()] || difficulty;
};
