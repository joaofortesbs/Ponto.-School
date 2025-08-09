export const extractEtapasFromAIData = (aiData: any): any[] => {
  if (!aiData) {
    console.log('⚠️ Dados da IA não encontrados para extração de etapas');
    return [];
  }

  console.log('🔍 Extraindo etapas de desenvolvimento dos dados da IA:', aiData);

  // Tenta extrair etapas de desenvolvimento dos dados da IA
  if (aiData.desenvolvimento && Array.isArray(aiData.desenvolvimento)) {
    console.log('✅ Etapas de desenvolvimento encontradas nos dados da IA:', aiData.desenvolvimento);
    return aiData.desenvolvimento.map((etapa: any, index: number) => ({
      etapa: index + 1,
      titulo: etapa.titulo || etapa.title || `Etapa ${index + 1}`,
      descricao: etapa.descricao || etapa.description || 'Descrição da etapa',
      tipo_interacao: etapa.tipo_interacao || etapa.tipoInteracao || etapa.interaction_type || 'Interativa',
      tempo_estimado: etapa.tempo_estimado || etapa.tempoEstimado || etapa.estimated_time || '15 minutos',
      recurso_gerado: etapa.recurso_gerado || etapa.recursos || etapa.resources || 'Material didático',
      nota_privada_professor: etapa.nota_privada_professor || etapa.observacoes || etapa.notes || 'Observação para o professor'
    }));
  }

  if (aiData.etapas && Array.isArray(aiData.etapas)) {
    console.log('✅ Etapas encontradas nos dados da IA:', aiData.etapas);
    return aiData.etapas.map((etapa: any, index: number) => ({
      etapa: index + 1,
      titulo: etapa.titulo || etapa.title || `Etapa ${index + 1}`,
      descricao: etapa.descricao || etapa.description || 'Descrição da etapa',
      tipo_interacao: etapa.tipo_interacao || etapa.tipoInteracao || etapa.interaction_type || 'Interativa',
      tempo_estimado: etapa.tempo_estimado || etapa.tempoEstimado || etapa.estimated_time || '15 minutos',
      recurso_gerado: etapa.recurso_gerado || etapa.recursos || etapa.resources || 'Material didático',
      nota_privada_professor: etapa.nota_privada_professor || etapa.observacoes || etapa.notes || 'Observação para o professor'
    }));
  }

  // Verifica se existe alguma propriedade relacionada a steps/etapas/development
  const possibleKeys = ['steps', 'stages', 'phases', 'metodologia_etapas', 'lesson_steps'];
  for (const key of possibleKeys) {
    if (aiData[key] && Array.isArray(aiData[key])) {
      console.log(`✅ Etapas encontradas em ${key}:`, aiData[key]);
      return aiData[key].map((etapa: any, index: number) => ({
        etapa: index + 1,
        titulo: etapa.titulo || etapa.title || etapa.name || `Etapa ${index + 1}`,
        descricao: etapa.descricao || etapa.description || etapa.content || 'Descrição da etapa',
        tipo_interacao: etapa.tipo_interacao || etapa.tipoInteracao || etapa.interaction_type || etapa.type || 'Interativa',
        tempo_estimado: etapa.tempo_estimado || etapa.tempoEstimado || etapa.estimated_time || etapa.duration || '15 minutos',
        recurso_gerado: etapa.recurso_gerado || etapa.recursos || etapa.resources || etapa.materials || 'Material didático',
        nota_privada_professor: etapa.nota_privada_professor || etapa.observacoes || etapa.notes || etapa.teacher_note || 'Observação para o professor'
      }));
    }
  }

  // Se não encontrar, tenta processar o texto bruto
  if (typeof aiData === 'string') {
    try {
      const processedData = JSON.parse(aiData);
      if (processedData.desenvolvimento) {
        return extractEtapasFromAIData(processedData);
      }
    } catch (error) {
      console.warn('⚠️ Erro ao processar dados da IA como JSON:', error);
    }
  }

  console.log('⚠️ Não foi possível extrair etapas de desenvolvimento dos dados da IA');
  return [];
};