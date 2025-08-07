
import { PlanoAulaFields, transformPlanoAulaData, planoAulaFieldMapping } from './fieldMapping';

export interface PlanoAulaGenerationData {
  tema: string;
  anoSerie: string;
  componenteCurricular: string;
  contexto?: string;
  restricoes?: string;
}

export class PlanoAulaProcessor {
  static processCustomFields(customFields: Record<string, string>): PlanoAulaFields {
    console.log('🎯 [PlanoAulaProcessor] Processando campos customizados:', customFields);
    
    const processedData = transformPlanoAulaData(customFields);
    
    console.log('✅ [PlanoAulaProcessor] Dados processados:', processedData);
    
    return processedData;
  }

  static generateEnhancedFields(baseData: PlanoAulaGenerationData): Record<string, string> {
    console.log('🔧 [PlanoAulaProcessor] Gerando campos aprimorados para:', baseData);
    
    const enhancedFields: Record<string, string> = {
      'Tema': baseData.tema,
      'Público-Alvo': baseData.anoSerie,
      'Disciplina': baseData.componenteCurricular,
      'Carga Horária': this.inferCargaHoraria(baseData.tema),
      'Habilidades BNCC': this.suggestBNCCHabilities(baseData.componenteCurricular, baseData.anoSerie),
      'Objetivo Geral': this.generateObjective(baseData.tema, baseData.anoSerie),
      'Materiais/Recursos': this.suggestMaterials(baseData.tema, baseData.componenteCurricular),
      'Perfil da Turma': 'Turma mista com diferentes níveis de aprendizado',
      'Tipo de Aula': this.suggestClassType(baseData.tema, baseData.componenteCurricular),
      'Observações': baseData.restricoes || 'Considerar o ritmo individual dos alunos'
    };

    console.log('✅ [PlanoAulaProcessor] Campos gerados:', enhancedFields);
    
    return enhancedFields;
  }

  private static inferCargaHoraria(tema: string): string {
    if (tema.toLowerCase().includes('introdução') || tema.toLowerCase().includes('conceito')) {
      return '1 aula de 50 minutos';
    } else if (tema.toLowerCase().includes('prática') || tema.toLowerCase().includes('exercício')) {
      return '2 aulas de 45 minutos';
    }
    return '1 aula de 50 minutos';
  }

  private static suggestBNCCHabilities(disciplina: string, anoSerie: string): string {
    const disciplinaLower = disciplina.toLowerCase();
    const serie = anoSerie.toLowerCase();
    
    if (disciplinaLower.includes('matemática')) {
      if (serie.includes('9º') || serie.includes('nono')) {
        return 'EF09MA04, EF09MA05, EF09MA06';
      } else if (serie.includes('8º') || serie.includes('oitavo')) {
        return 'EF08MA04, EF08MA05, EF08MA06';
      }
      return 'A definir conforme série específica';
    } else if (disciplinaLower.includes('português') || disciplinaLower.includes('língua')) {
      return 'EF69LP01, EF69LP02, EF69LP03';
    } else if (disciplinaLower.includes('ciências')) {
      return 'EF07CI01, EF07CI02, EF07CI03';
    }
    
    return 'A definir conforme BNCC específica da disciplina';
  }

  private static generateObjective(tema: string, anoSerie: string): string {
    return `Compreender e aplicar os conceitos relacionados a ${tema}, desenvolvendo habilidades adequadas ao nível ${anoSerie}`;
  }

  private static suggestMaterials(tema: string, disciplina: string): string {
    const materials = ['Lousa', 'Projetor', 'Livro didático'];
    
    if (disciplina.toLowerCase().includes('matemática')) {
      materials.push('Calculadora', 'Régua', 'Compasso');
    } else if (disciplina.toLowerCase().includes('ciências')) {
      materials.push('Microscópio', 'Materiais de laboratório');
    } else if (disciplina.toLowerCase().includes('português')) {
      materials.push('Textos diversos', 'Dicionário');
    }
    
    return materials.join(', ');
  }

  private static suggestClassType(tema: string, disciplina: string): string {
    if (tema.toLowerCase().includes('prática') || tema.toLowerCase().includes('experimento')) {
      return 'Aula prática experimental';
    } else if (tema.toLowerCase().includes('análise') || tema.toLowerCase().includes('discussão')) {
      return 'Aula dialogada e participativa';
    } else if (disciplina.toLowerCase().includes('matemática')) {
      return 'Aula expositiva com resolução de exercícios';
    }
    
    return 'Aula expositiva dialogada';
  }
}
