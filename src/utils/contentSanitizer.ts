/**
 * Converte qualquer valor para string seguro
 * Nunca falha com substring, split, etc
 */
export const ensureString = (value: any, defaultValue: string = ''): string => {
  // Se é string, retorna
  if (typeof value === 'string') {
    return value;
  }

  // Se for nulo/indefinido, retorna o valor padrão
  if (value === null || value === undefined) {
    console.warn('[ENSURE_STRING] Recebeu null/undefined, usando default');
    return defaultValue;
  }

  // Se for um objeto, tente usar description ou stringifica
  if (typeof value === 'object') {
    console.warn('[ENSURE_STRING] Recebeu objeto, convertendo:', value);
    // Se tem propriedade 'content', usa ela
    if (value.content) {
      return ensureString(value.content, defaultValue);
    }
    // Senão, stringifica
    return JSON.stringify(value) || defaultValue;
  }

  // Se for um número, booleano, etc, converta
  return String(value);
};

/**
 * Validação completa de dados de section
 */
export const validateSectionData = (section: any) => {
  return {
    id: section?.id || 'unknown',
    title: ensureString(section?.title, 'Sem Título'),
    content: ensureString(section?.content, ''),
    visible: section?.visible !== false,
    expanded: section?.expanded !== false,
    time: section?.time || 0,
  };
};

/**
 * Sanitiza TODOS os dados de aula ao carregar
 */
export const sanitizeLoadedAula = (aula: any) => {
  const sanitized = {
    ...aula,
    id: aula?.id || `aula_${Date.now()}`,
    titulo: ensureString(aula?.titulo, 'Aula sem título'),
    objetivo: ensureString(aula?.objetivo, ''),
    templateId: ensureString(aula?.templateId, 'unknown'),
    templateName: ensureString(aula?.templateName, 'Template'),
    sectionTexts: {},
    sectionConfigs: {},
    dynamicSections: {},
    secoes: {},
    sectionOrder: Array.isArray(aula?.sectionOrder) ? aula.sectionOrder : [],
  };

  // Sanitiza cada seção de texto
  if (aula?.sectionTexts && typeof aula.sectionTexts === 'object') {
    Object.entries(aula.sectionTexts).forEach(([key, value]) => {
      (sanitized.sectionTexts as any)[key] = ensureString(value, '');
    });
  }

  // Sanitiza cada configuração de seção
  if (aula?.sectionConfigs && typeof aula.sectionConfigs === 'object') {
    Object.entries(aula.sectionConfigs).forEach(([key, value]: [string, any]) => {
      (sanitized.sectionConfigs as any)[key] = validateSectionData(value);
    });
  }

  // Sanitiza seções dinâmicas
  if (aula?.dynamicSections && typeof aula.dynamicSections === 'object') {
    Object.entries(aula.dynamicSections).forEach(([key, value]: [string, any]) => {
      (sanitized.dynamicSections as any)[key] = {
        ...(value || {}),
        id: value?.id || key,
        title: ensureString(value?.title, key),
        text: ensureString(value?.text, ''),
      };
    });
  }

  // Sanitiza seções (para status 'publicada')
  if (aula?.secoes && typeof aula.secoes === 'object') {
    Object.entries(aula.secoes).forEach(([key, value]: [string, any]) => {
      (sanitized.secoes as any)[key] = {
        ...(value || {}),
        id: value?.id || key,
        text: ensureString(value?.text, ''),
        time: value?.time || '',
      };
    });
  }

  console.log('[SANITIZE] Aula sanitizada:', sanitized);
  return sanitized;
};

/**
 * Helper para prévia de texto seguro
 */
export const getTextPreview = (text: any, length: number = 50): string => {
  const str = ensureString(text);
  return str.substring(0, length) + (str.length > length ? '...' : '');
};
