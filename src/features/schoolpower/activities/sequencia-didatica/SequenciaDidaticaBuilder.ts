
<old_str>class SequenciaDidaticaBuilder {
  static async saveSequencia(data: any): Promise<void> {
    try {
      console.log('💾 Salvando Sequência Didática:', data);

      const sequenciaId = data.id || `seq_${Date.now()}`;
      const storageKey = `constructed_sequencia-didatica_${sequenciaId}`;

      // Salvar no localStorage específico
      localStorage.setItem(storageKey, JSON.stringify(data));

      // Também salvar na lista geral
      const savedSequencias = JSON.parse(localStorage.getItem('sequenciasDidaticas') || '[]');
      const existingIndex = savedSequencias.findIndex((s: any) => s.id === sequenciaId);

      if (existingIndex >= 0) {
        savedSequencias[existingIndex] = data;
      } else {
        savedSequencias.push({
          ...data,
          id: sequenciaId,
          createdAt: new Date().toISOString()
        });
      }

      localStorage.setItem('sequenciasDidaticas', JSON.stringify(savedSequencias));

      console.log('✅ Sequência Didática salva com sucesso:', sequenciaId);

    } catch (error) {
      console.error('❌ Erro ao salvar Sequência Didática:', error);
      throw error;
    }
  }

  static async loadSequencia(id: string): Promise<any> {
    try {
      console.log('📂 Carregando Sequência Didática:', id);

      // Tentar carregar do localStorage específico primeiro
      const specificKey = `constructed_sequencia-didatica_${id}`;
      const specificData = localStorage.getItem(specificKey);

      if (specificData) {
        console.log('✅ Sequência encontrada no storage específico');
        return JSON.parse(specificData);
      }

      // Fallback para lista geral
      const savedSequencias = JSON.parse(localStorage.getItem('sequenciasDidaticas') || '[]');
      const sequencia = savedSequencias.find((s: any) => s.id === id);

      if (!sequencia) {
        console.warn(`⚠️ Sequência Didática com ID ${id} não encontrada`);
        return null;
      }

      return sequencia;

    } catch (error) {
      console.error('❌ Erro ao carregar sequência salva:', error);
      return null;
    }
  }</old_str>
<new_str>class SequenciaDidaticaBuilder {
  static async saveSequencia(data: any): Promise<void> {
    try {
      console.log('💾 Salvando Sequência Didática:', data);

      const sequenciaId = data.id || `seq_${Date.now()}`;
      const storageKey = `constructed_sequencia-didatica_${sequenciaId}`;

      // Salvar no localStorage específico
      localStorage.setItem(storageKey, JSON.stringify(data));

      // Também salvar na lista geral
      const savedSequencias = JSON.parse(localStorage.getItem('sequenciasDidaticas') || '[]');
      const existingIndex = savedSequencias.findIndex((s: any) => s.id === sequenciaId);

      if (existingIndex >= 0) {
        savedSequencias[existingIndex] = data;
      } else {
        savedSequencias.push({
          ...data,
          id: sequenciaId,
          createdAt: new Date().toISOString()
        });
      }

      localStorage.setItem('sequenciasDidaticas', JSON.stringify(savedSequencias));

      console.log('✅ Sequência Didática salva com sucesso:', sequenciaId);

    } catch (error) {
      console.error('❌ Erro ao salvar Sequência Didática:', error);
      throw error;
    }
  }

  static async loadSequencia(id: string): Promise<any> {
    try {
      console.log('📂 Carregando Sequência Didática:', id);

      // Tentar carregar do localStorage específico primeiro
      const specificKey = `constructed_sequencia-didatica_${id}`;
      const specificData = localStorage.getItem(specificKey);

      if (specificData) {
        console.log('✅ Sequência encontrada no storage específico');
        return JSON.parse(specificData);
      }

      // Fallback para lista geral
      const savedSequencias = JSON.parse(localStorage.getItem('sequenciasDidaticas') || '[]');
      const sequencia = savedSequencias.find((s: any) => s.id === id);

      if (!sequencia) {
        console.warn(`⚠️ Sequência Didática com ID ${id} não encontrada`);
        return null;
      }

      return sequencia;

    } catch (error) {
      console.error('❌ Erro ao carregar sequência salva:', error);
      return null;
    }
  }

  static async recuperarSequencia(id: string): Promise<any> {
    try {
      console.log('🔍 Recuperando Sequência Didática:', id);
      
      // Primeiro tentar carregar dados existentes
      const existingData = await this.loadSequencia(id);
      
      if (existingData && existingData.isBuilt) {
        console.log('✅ Sequência encontrada e já construída');
        return existingData;
      }

      // Se não existe ou não está construída, tentar carregar dados básicos
      const basicData = await this.loadSequencia(id);
      
      if (!basicData) {
        console.warn('⚠️ Nenhuma sequência encontrada para recuperar');
        return null;
      }

      console.log('📋 Dados básicos recuperados:', basicData);
      return basicData;

    } catch (error) {
      console.error('❌ Erro ao recuperar sequência:', error);
      return null;
    }
  }</old_str>
