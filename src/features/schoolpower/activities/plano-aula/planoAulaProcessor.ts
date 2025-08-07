
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
    
    const cargaHoraria = this.inferCargaHoraria(baseData.tema);
    const objetivoGeral = this.generateObjective(baseData.tema, baseData.anoSerie);
    const materiaisRecursos = this.suggestMaterials(baseData.tema, baseData.componenteCurricular);
    
    const enhancedFields: Record<string, string> = {
      'Tema': baseData.tema,
      'Público-Alvo': baseData.anoSerie,
      'Disciplina': baseData.componenteCurricular,
      'Carga Horária': cargaHoraria,
      'Habilidades BNCC': this.suggestBNCCHabilities(baseData.componenteCurricular, baseData.anoSerie),
      'Objetivo Geral': objetivoGeral,
      'Materiais/Recursos': materiaisRecursos,
      'Perfil da Turma': 'Turma mista com diferentes níveis de aprendizado',
      'Tipo de Aula': this.suggestClassType(baseData.tema, baseData.componenteCurricular),
      'Observações': baseData.restricoes || 'Considerar o ritmo individual dos alunos',
      // Campos específicos para o mini-card
      'Objetivo Principal': objetivoGeral,
      'Materiais Necessários': materiaisRecursos,
      'Recursos Adicionais': this.suggestAdditionalResources(baseData.componenteCurricular),
      'Tempo Estimado': cargaHoraria,
      'Nível de Dificuldade': this.inferDifficulty(baseData.anoSerie),
      'Palavras-chave': this.generateKeywords(baseData.tema, baseData.componenteCurricular)
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

  private static suggestAdditionalResources(disciplina: string): string {
    const disciplinaLower = disciplina.toLowerCase();
    
    if (disciplinaLower.includes('matemática')) {
      return 'Software de geometria, simuladores matemáticos, jogos lógicos';
    } else if (disciplinaLower.includes('ciências') || disciplinaLower.includes('física') || disciplinaLower.includes('química')) {
      return 'Simuladores virtuais, vídeos explicativos, experimentos online';
    } else if (disciplinaLower.includes('português') || disciplinaLower.includes('literatura')) {
      return 'Biblioteca digital, audiolivros, ferramentas de escrita colaborativa';
    } else if (disciplinaLower.includes('história') || disciplinaLower.includes('geografia')) {
      return 'Mapas interativos, documentários, timeline digital';
    }
    
    return 'Recursos digitais complementares, vídeos educativos';
  }

  private static inferDifficulty(anoSerie: string): string {
    const serie = anoSerie.toLowerCase();
    
    if (serie.includes('1º') || serie.includes('2º') || serie.includes('primeiro') || serie.includes('segundo')) {
      return 'Básico';
    } else if (serie.includes('8º') || serie.includes('9º') || serie.includes('oitavo') || serie.includes('nono')) {
      return 'Intermediário';
    } else if (serie.includes('médio') || serie.includes('3º')) {
      return 'Avançado';
    }
    
    return 'Médio';
  }

  private static generateKeywords(tema: string, disciplina: string): string {
    const keywords = [];
    
    // Adiciona palavras-chave baseadas no tema
    if (tema.toLowerCase().includes('equação')) {
      keywords.push('equações', 'álgebra', 'resolução');
    }
    if (tema.toLowerCase().includes('função')) {
      keywords.push('funções', 'gráficos', 'domínio');
    }
    
    // Adiciona palavras-chave baseadas na disciplina
    if (disciplina.toLowerCase().includes('matemática')) {
      keywords.push('cálculo', 'números', 'operações');
    } else if (disciplina.toLowerCase().includes('português')) {
      keywords.push('gramática', 'texto', 'interpretação');
    }
    
    return keywords.length > 0 ? keywords.join(', ') : 'educação, aprendizagem';
  }
}
