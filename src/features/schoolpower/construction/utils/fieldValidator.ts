
/**
 * Valida se um campo foi preenchido corretamente
 */
export function validateField(selector: string, expectedValue?: any): boolean {
  try {
    const element = document.querySelector(selector) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    
    if (!element) {
      console.warn(`Campo não encontrado: ${selector}`);
      return false;
    }

    const currentValue = element.value || '';
    
    // Se não há valor esperado, apenas verifica se não está vazio
    if (expectedValue === undefined) {
      return currentValue.trim() !== '';
    }

    // Compara com valor esperado
    const normalizedExpected = String(expectedValue || '').trim();
    const normalizedCurrent = currentValue.trim();
    
    return normalizedCurrent === normalizedExpected || 
           (normalizedExpected !== '' && normalizedCurrent !== '');
  } catch (error) {
    console.error(`Erro ao validar campo ${selector}:`, error);
    return false;
  }
}

/**
 * Valida múltiplos campos
 */
export function validateFields(fieldMap: Record<string, string>, data: Record<string, any>): { success: boolean; errors: string[] } {
  const errors: string[] = [];
  let validCount = 0;
  let totalCount = 0;

  for (const [dataKey, selector] of Object.entries(fieldMap)) {
    totalCount++;
    const expectedValue = data[dataKey];
    
    if (expectedValue === undefined || expectedValue === null) {
      continue; // Campo opcional
    }

    const isValid = validateField(selector, expectedValue);
    
    if (isValid) {
      validCount++;
    } else {
      errors.push(`Campo ${dataKey} (${selector}) não foi preenchido corretamente`);
    }
  }

  return {
    success: validCount > 0 && errors.length === 0,
    errors
  };
}

/**
 * Aguarda que todos os campos sejam válidos
 */
export async function waitForValidFields(
  fieldMap: Record<string, string>, 
  data: Record<string, any>, 
  timeout: number = 5000
): Promise<boolean> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const checkFields = () => {
      const validation = validateFields(fieldMap, data);
      
      if (validation.success) {
        resolve(true);
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        console.warn('Timeout na validação de campos:', validation.errors);
        resolve(false);
        return;
      }
      
      setTimeout(checkFields, 100);
    };
    
    checkFields();
  });
}
