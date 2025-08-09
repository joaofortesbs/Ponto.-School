
export interface AvaliacaoData {
  criterios: string;
  instrumentos: string[];
  feedback: string;
}

export class AvaliacaoDataProcessor {
  static processData(planoData: any): AvaliacaoData {
    const avaliacao = planoData.avaliacao;
    
    return {
      criterios: typeof avaliacao === 'string' 
        ? avaliacao 
        : avaliacao?.criterios || 'Critérios de avaliação não especificados',
      instrumentos: avaliacao?.instrumentos || ['Observação', 'Participação'],
      feedback: avaliacao?.feedback || 'Feedback não especificado'
    };
  }
}
