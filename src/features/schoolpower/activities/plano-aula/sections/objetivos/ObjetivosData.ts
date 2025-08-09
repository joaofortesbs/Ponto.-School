
export interface Objetivo {
  descricao: string;
  habilidade_bncc: string | string[];
  sugestao_reescrita: string;
  atividade_relacionada: string;
}

export interface ObjetivosData {
  objetivos: Objetivo[];
}

export class ObjetivosDataProcessor {
  static processData(planoData: any): ObjetivosData {
    const objetivos = planoData.objetivos || [];
    
    const processedObjetivos = Array.isArray(objetivos) 
      ? objetivos.map((obj: any) => ({
          descricao: typeof obj === 'string' ? obj : obj.descricao || obj,
          habilidade_bncc: obj.habilidade_bncc || planoData.competencias || 'BNCC não especificada',
          sugestao_reescrita: obj.sugestao_reescrita || '',
          atividade_relacionada: obj.atividade_relacionada || ''
        }))
      : [{
          descricao: objetivos || 'Objetivo não especificado',
          habilidade_bncc: planoData.competencias || 'BNCC não especificada',
          sugestao_reescrita: '',
          atividade_relacionada: ''
        }];

    return { objetivos: processedObjetivos };
  }
}
