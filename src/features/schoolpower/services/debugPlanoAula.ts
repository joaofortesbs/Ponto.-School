static debugEtapasDesenvolvimento(etapas: any[]) {
    this.log(`🔍 Debug das etapas de desenvolvimento: ${etapas.length} etapas encontradas`, etapas);

    etapas.forEach((etapa, index) => {
      this.log(`📝 Etapa ${index + 1}:`, {
        titulo: etapa.titulo || etapa.title,
        descricao: etapa.descricao || etapa.description,
        tempo: etapa.tempo_estimado || etapa.tempo || etapa.duration,
        tipo: etapa.tipo_interacao || etapa.tipo || etapa.type,
        recurso: etapa.recurso_gerado || etapa.recurso
      });
    });
  }