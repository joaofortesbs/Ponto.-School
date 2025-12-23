/**
 * Mapeia resposta da IA para estrutura de estados da aula
 * GARANTE que os campos são preenchidos com conteúdo
 */
export const mapAIResponseToAula = (
  aiResponse: any,
  sectionOrder: string[]
) => {
  console.log('[AI_MAPPER] Iniciando mapeamento da resposta IA');
  console.log('[AI_MAPPER] sectionOrder:', sectionOrder);
  console.log('[AI_MAPPER] aiResponse:', aiResponse);

  const resultado = {
    titulo: '',
    objetivo: '',
    sectionTexts: {} as Record<string, string>,
    dynamicSections: {} as Record<string, any>,
  };

  // 1. MAPEAR TÍTULO E OBJETIVO
  if (aiResponse.titulo) {
    resultado.titulo = String(aiResponse.titulo);
    console.log('[AI_MAPPER] Título mapeado:', resultado.titulo);
  }

  if (aiResponse.objetivo || aiResponse.objectivo) {
    resultado.objetivo = String(aiResponse.objetivo || aiResponse.objectivo);
    console.log('[AI_MAPPER] Objetivo mapeado:', resultado.objetivo);
  }

  // 2. MAPEAR SEÇÕES - SUPER IMPORTANTE
  // A resposta IA pode vir de várias formas:
  // Forma 1: { sections: { "secao1": "conteúdo", "secao2": "conteúdo" } }
  // Forma 2: { "secao1": "conteúdo", "secao2": "conteúdo" }
  // Forma 3: { sections: [ { id: "secao1", content: "..." }, ... ] }

  console.log('[AI_MAPPER] Processando seções...');

  // Tenta encontrar seções na resposta
  let secoes = aiResponse.sections || aiResponse.secoes || {};

  // Se seções são array, converte para objeto
  if (Array.isArray(secoes)) {
    console.log('[AI_MAPPER] Seções como array, convertendo para objeto');
    secoes = secoes.reduce((acc: any, sec: any) => {
      const id = sec.id || sec.nome || sec.name;
      const content = sec.content || sec.conteudo || sec.texto || '';
      if (id) {
        acc[id] = content;
      }
      return acc;
    }, {});
  }

  // Agora processa cada seção da sectionOrder
  sectionOrder.forEach((sectionId) => {
    console.log('[AI_MAPPER] Processando seção:', sectionId);

    // Procura em várias chaves possíveis
    let conteudo =
      secoes[sectionId] ||
      secoes[sectionId.toLowerCase()] ||
      secoes[sectionId.replace(/-/g, '_')] ||
      secoes[sectionId.replace(/_/g, '-')] ||
      aiResponse[sectionId] ||
      '';

    // Se ainda não encontrou, tenta com variações de nome
    if (!conteudo) {
      const variations = [
        sectionId.toLowerCase(),
        sectionId.toUpperCase(),
        sectionId.replace(/[\s-_]/g, ''),
      ];

      for (const variation of variations) {
        for (const key of Object.keys(secoes)) {
          if (
            key.toLowerCase().includes(variation) ||
            variation.includes(key.toLowerCase())
          ) {
            conteudo = secoes[key];
            console.log('[AI_MAPPER] Encontrado por variação:', key, '→', sectionId);
            break;
          }
        }
        if (conteudo) break;
      }
    }

    // Garante que é string
    conteudo = String(conteudo || '').trim();

    // Se ainda vazio, usa um padrão
    if (!conteudo) {
      console.warn('[AI_MAPPER] Nenhum conteúdo para seção:', sectionId);
      conteudo = `Conteúdo não gerado para ${sectionId}`;
    }

    resultado.sectionTexts[sectionId] = conteudo;
    console.log(
      '[AI_MAPPER] Seção mapeada:',
      sectionId,
      `(${conteudo.substring(0, 50)}...)`
    );
  });

  console.log('[AI_MAPPER] Mapeamento completo:', resultado);
  return resultado;
};

/**
 * Valida se a resposta da IA tem conteúdo
 */
export const validateAIResponse = (
  mapped: ReturnType<typeof mapAIResponseToAula>
): boolean => {
  const hasTitle = !!mapped.titulo && mapped.titulo.length > 0;
  const hasObjective = !!mapped.objetivo && mapped.objetivo.length > 0;
  const hasSectionContent = Object.values(mapped.sectionTexts).some(
    (text) => text && text.length > 10
  );

  console.log('[VALIDATE_AI] Validação:', {
    hasTitle,
    hasObjective,
    hasSectionContent,
    totalSections: Object.keys(mapped.sectionTexts).length,
  });

  return hasTitle && hasObjective && hasSectionContent;
};
