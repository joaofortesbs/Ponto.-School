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

// Função para limpar aulas antigas automaticamente
const limparAulasAntigas = () => {
  try {
    const aulasStr = localStorage.getItem(AULAS_STORAGE_KEY);
    if (!aulasStr) return;

    const aulas = JSON.parse(aulasStr) as AulaSalva[];
    const agora = Date.now();
    const umMesEmMs = 30 * 24 * 60 * 60 * 1000;

    // Remove aulas com mais de 30 dias
    const aulasFiltradas = aulas.filter((aula) => {
      const dataCriacao = new Date(aula.criadoEm).getTime();
      return (agora - dataCriacao) < umMesEmMs;
    });

    if (aulasFiltradas.length < aulas.length) {
      localStorage.setItem(AULAS_STORAGE_KEY, JSON.stringify(aulasFiltradas));
      console.log(`📚 [CLEANUP] ${aulas.length - aulasFiltradas.length} aulas antigas removidas`);
    }
  } catch (err) {
    console.error('📚 [CLEANUP_ERROR]', err);
  }
};

// Função para verificar espaço disponível
const verificarEspacoDisponivel = (): boolean => {
  try {
    const teste = 'x'.repeat(1024 * 100); // 100KB de teste
    localStorage.setItem('_teste_espaco', teste);
    localStorage.removeItem('_teste_espaco');
    return true;
  } catch (err) {
    console.error('📚 [STORAGE_FULL] localStorage lotado, limpando aulas antigas...');
    limparAulasAntigas();
    return false;
  }
};

export const aulasStorageService = {
  salvarAula(aula: Omit<AulaSalva, 'id' | 'criadoEm' | 'atualizadoEm'>): AulaSalva {
    try {
      // Verifica espaço antes de salvar
      if (!verificarEspacoDisponivel()) {
        throw new Error('localStorage lotado. Aulas antigas foram removidas. Tente novamente.');
      }

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
    } catch (error: any) {
      console.error('📚 [SALVAR_AULA_ERROR]', error.message);
      throw error;
    }
  },

  atualizarAula(id: string, dados: Partial<AulaSalva>): AulaSalva | null {
    try {
      if (!verificarEspacoDisponivel()) {
        throw new Error('localStorage lotado. Tente novamente.');
      }

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
    } catch (error: any) {
      console.error('📚 [ATUALIZAR_AULA_ERROR]', error.message);
      throw error;
    }
  },

  excluirAula(id: string): boolean {
    try {
      const aulas = this.listarAulas();
      const novasAulas = aulas.filter(a => a.id !== id);
      
      if (novasAulas.length === aulas.length) {
        console.warn('📚 [AULAS_STORAGE] Aula não encontrada para exclusão:', id);
        return false;
      }
      
      localStorage.setItem(AULAS_STORAGE_KEY, JSON.stringify(novasAulas));
      console.log('📚 [AULAS_STORAGE] Aula excluída com sucesso:', id);
      
      return true;
    } catch (error: any) {
      console.error('📚 [EXCLUIR_AULA_ERROR]', error.message);
      throw error;
    }
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
