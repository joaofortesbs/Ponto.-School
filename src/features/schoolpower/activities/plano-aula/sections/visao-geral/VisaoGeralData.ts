
export interface VisaoGeralData {
  disciplina: string;
  tema: string;
  serie: string;
  tempo: string;
  metodologia: string;
  recursos: string[];
  sugestoes_ia: string[];
}

export class VisaoGeralDataProcessor {
  static processData(planoData: any): VisaoGeralData {
    return {
      disciplina: planoData.visao_geral?.disciplina || planoData.disciplina || 'Disciplina',
      tema: planoData.visao_geral?.tema || planoData.tema || 'Tema',
      serie: planoData.visao_geral?.serie || planoData.serie || 'Série',
      tempo: planoData.visao_geral?.tempo || planoData.tempo || 'Tempo',
      metodologia: planoData.visao_geral?.metodologia || planoData.metodologia || 'Metodologia',
      recursos: planoData.visao_geral?.recursos || planoData.recursos || [],
      sugestoes_ia: planoData.visao_geral?.sugestoes_ia || planoData.sugestoes_ia || []
    };
  }
}
