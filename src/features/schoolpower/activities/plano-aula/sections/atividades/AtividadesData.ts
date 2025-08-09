
export interface Atividade {
  nome: string;
  tipo: string;
  ref_objetivos: number[];
  visualizar_como_aluno: string;
  sugestoes_ia: string[];
}

export interface AtividadesData {
  atividades: Atividade[];
}

export class AtividadesDataProcessor {
  static processData(planoData: any): AtividadesData {
    let atividades = planoData.atividades || [];
    
    if (!Array.isArray(atividades) || atividades.length === 0) {
      atividades = [
        {
          nome: 'Atividade Principal',
          tipo: 'Prática',
          ref_objetivos: [1],
          visualizar_como_aluno: 'Atividade interativa',
          sugestoes_ia: ['Personalize conforme necessário']
        }
      ];
    }

    return { atividades };
  }
}
