
export const quadroInterativoFieldMapping = {
  // Campos básicos
  titulo: 'titulo',
  disciplina: 'disciplina', 
  anoEscolar: 'anoEscolar',
  tema: 'tema',
  objetivo: 'objetivo',
  instrucoes: 'instrucoes',
  observacoes: 'observacoes',

  // Campos gerados
  tituloGerado: 'generatedContent.titulo',
  textoGerado: 'generatedContent.texto',

  // Metadados
  processedAt: 'processedAt'
};

/**
 * Mapeia dados do formulário para estrutura interna
 */
export function mapFormDataToQuadroInterativo(formData: Record<string, any>): any {
  const mapped: Record<string, any> = {};
  
  Object.entries(quadroInterativoFieldMapping).forEach(([key, path]) => {
    const value = getNestedValue(formData, path);
    if (value !== undefined) {
      mapped[key] = value;
    }
  });

  return mapped;
}

/**
 * Obtém valor aninhado usando caminho com pontos
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * Define valor aninhado usando caminho com pontos
 */
export function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  const lastKey = keys.pop();
  
  if (!lastKey) return;

  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);

  target[lastKey] = value;
}

export default quadroInterativoFieldMapping;
