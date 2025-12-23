export interface AulaSalva {
  id: string;
  titulo: string;
  objetivo: string;
  templateId: string;
  templateName: string;
  turmaName?: string | null;
  turmaImage?: string | null;
  duracao: string;
  criadoEm: string;
  atualizadoEm: string;
  status: 'rascunho' | 'publicada' | 'arquivada';
  secoes: Record<string, {
    id: string;
    text: string;
    time?: string;
  }>;
  sectionOrder: string[];
}

const AULAS_STORAGE_KEY = 'ponto_school_aulas_salvas';

export const aulasStorageService = {
  salvarAula(aula: Omit<AulaSalva, 'id' | 'criadoEm' | 'atualizadoEm'>): AulaSalva {
    const aulas = this.listarAulas();
    const now = new Date().toISOString();
    
    const novaAula: AulaSalva = {
      ...aula,
      id: `aula_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      criadoEm: now,
      atualizadoEm: now
    };
    
    aulas.unshift(novaAula);
    localStorage.setItem(AULAS_STORAGE_KEY, JSON.stringify(aulas));
    
    console.log('📚 [AULAS_STORAGE] Aula salva com sucesso:', {
      id: novaAula.id,
      titulo: novaAula.titulo,
      secoes: Object.keys(novaAula.secoes).length
    });
    
    return novaAula;
  },

  atualizarAula(id: string, dados: Partial<AulaSalva>): AulaSalva | null {
    const aulas = this.listarAulas();
    const index = aulas.findIndex(a => a.id === id);
    
    if (index === -1) {
      console.warn('📚 [AULAS_STORAGE] Aula não encontrada para atualização:', id);
      return null;
    }
    
    aulas[index] = {
      ...aulas[index],
      ...dados,
      atualizadoEm: new Date().toISOString()
    };
    
    localStorage.setItem(AULAS_STORAGE_KEY, JSON.stringify(aulas));
    
    console.log('📚 [AULAS_STORAGE] Aula atualizada com sucesso:', {
      id: aulas[index].id,
      titulo: aulas[index].titulo
    });
    
    return aulas[index];
  },

  excluirAula(id: string): boolean {
    const aulas = this.listarAulas();
    const novasAulas = aulas.filter(a => a.id !== id);
    
    if (novasAulas.length === aulas.length) {
      console.warn('📚 [AULAS_STORAGE] Aula não encontrada para exclusão:', id);
      return false;
    }
    
    localStorage.setItem(AULAS_STORAGE_KEY, JSON.stringify(novasAulas));
    console.log('📚 [AULAS_STORAGE] Aula excluída com sucesso:', id);
    
    return true;
  },

  buscarAula(id: string): AulaSalva | null {
    const aulas = this.listarAulas();
    return aulas.find(a => a.id === id) || null;
  },

  listarAulas(): AulaSalva[] {
    try {
      const stored = localStorage.getItem(AULAS_STORAGE_KEY);
      if (!stored) return [];
      
      const aulas = JSON.parse(stored) as AulaSalva[];
      console.log('📚 [AULAS_STORAGE] Aulas carregadas:', aulas.length);
      return aulas;
    } catch (error) {
      console.error('📚 [AULAS_STORAGE] Erro ao carregar aulas:', error);
      return [];
    }
  },

  contarAulas(): number {
    return this.listarAulas().length;
  },

  limparTodasAulas(): void {
    localStorage.removeItem(AULAS_STORAGE_KEY);
    console.log('📚 [AULAS_STORAGE] Todas as aulas foram removidas');
  }
};

export default aulasStorageService;
