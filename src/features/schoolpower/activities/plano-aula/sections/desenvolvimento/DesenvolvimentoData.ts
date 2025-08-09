
export interface EtapaDesenvolvimento {
  etapa: number;
  titulo: string;
  descricao: string;
  tipo_interacao: string;
  tempo_estimado: string;
  recurso_gerado: string;
  nota_privada_professor: string;
}

export interface DesenvolvimentoData {
  etapas: EtapaDesenvolvimento[];
}

export class DesenvolvimentoDataProcessor {
  static processData(planoData: any): DesenvolvimentoData {
    let etapas = planoData.desenvolvimento || [];
    
    if (!Array.isArray(etapas) || etapas.length === 0) {
      etapas = [
        {
          etapa: 1,
          titulo: 'Introdução',
          descricao: 'Apresentação do tema',
          tipo_interacao: 'Exposição',
          tempo_estimado: '15 min',
          recurso_gerado: 'Slides',
          nota_privada_professor: 'Contextualizar o tema'
        },
        {
          etapa: 2,
          titulo: 'Desenvolvimento',
          descricao: 'Explicação do conteúdo principal',
          tipo_interacao: 'Interativa',
          tempo_estimado: '25 min',
          recurso_gerado: 'Material didático',
          nota_privada_professor: 'Verificar compreensão'
        },
        {
          etapa: 3,
          titulo: 'Finalização',
          descricao: 'Síntese e avaliação',
          tipo_interacao: 'Avaliativa',
          tempo_estimado: '10 min',
          recurso_gerado: 'Atividade de fixação',
          nota_privada_professor: 'Aplicar avaliação'
        }
      ];
    }

    return { etapas };
  }

  static getInteractionIcon(tipoInteracao: string): string {
    const lowerType = tipoInteracao.toLowerCase();
    if (lowerType.includes('apresentação') || lowerType.includes('exposição')) return 'Presentation';
    if (lowerType.includes('debate') || lowerType.includes('discussão')) return 'MessageSquare';
    if (lowerType.includes('vídeo') || lowerType.includes('video')) return 'Video';
    if (lowerType.includes('dinâmica') || lowerType.includes('grupo')) return 'Group';
    if (lowerType.includes('prática') || lowerType.includes('atividade')) return 'Gamepad2';
    if (lowerType.includes('interativo') || lowerType.includes('interativa')) return 'Activity';
    return 'Play';
  }
}
