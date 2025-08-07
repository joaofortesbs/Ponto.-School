
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
    const habilidadesBNCC = this.suggestBNCCHabilities(baseData.componenteCurricular, baseData.anoSerie);
    const tipoAula = this.suggestClassType(baseData.tema, baseData.componenteCurricular);
    const perfilTurma = this.inferClassProfile(baseData.anoSerie);
    
    const enhancedFields: Record<string, string> = {
      'Tema ou Tópico Central': baseData.tema,
      'Ano/Série Escolar': baseData.anoSerie,
      'Componente Curricular': baseData.componenteCurricular,
      'Carga Horária': cargaHoraria,
      'Habilidades BNCC': habilidadesBNCC,
      'Objetivo Geral': objetivoGeral,
      'Materiais/Recursos': materiaisRecursos,
      'Perfil da Turma': perfilTurma,
      'Tipo de Aula': tipoAula,
      'Observações do Professor': baseData.restricoes || 'Considerar o ritmo individual dos alunos e adaptar conforme necessário'
    };

    console.log('✅ [PlanoAulaProcessor] Campos gerados:', enhancedFields);
    
    return enhancedFields;
  }

  private static inferCargaHoraria(tema: string): string {
    if (tema.toLowerCase().includes('introdução') || tema.toLowerCase().includes('conceito básico')) {
      return '1 aula de 50 minutos';
    } else if (tema.toLowerCase().includes('prática') || tema.toLowerCase().includes('exercício') || tema.toLowerCase().includes('laboratório')) {
      return '2 aulas de 45 minutos';
    } else if (tema.toLowerCase().includes('projeto') || tema.toLowerCase().includes('pesquisa')) {
      return '3 aulas de 50 minutos';
    }
    return '1 aula de 50 minutos';
  }

  private static suggestBNCCHabilities(disciplina: string, anoSerie: string): string {
    const disciplinaLower = disciplina.toLowerCase();
    const serie = anoSerie.toLowerCase();
    
    if (disciplinaLower.includes('matemática')) {
      if (serie.includes('9º') || serie.includes('nono')) {
        return 'EF09MA04, EF09MA05, EF09MA06 - Resolver e elaborar problemas com números racionais positivos na representação decimal';
      } else if (serie.includes('8º') || serie.includes('oitavo')) {
        return 'EF08MA04, EF08MA05, EF08MA06 - Resolver e elaborar problemas, envolvendo cálculo de porcentagens';
      } else if (serie.includes('7º') || serie.includes('sétimo')) {
        return 'EF07MA04, EF07MA05, EF07MA06 - Resolver e elaborar problemas que envolvam operações com números inteiros';
      }
      return 'A definir conforme série específica - Competências matemáticas da BNCC';
    } else if (disciplinaLower.includes('português') || disciplinaLower.includes('língua')) {
      if (serie.includes('9º') || serie.includes('nono')) {
        return 'EF69LP01, EF69LP02, EF69LP03 - Diferenciar liberdade de expressão de discursos de ódio';
      } else if (serie.includes('8º') || serie.includes('oitavo')) {
        return 'EF89LP01, EF89LP02, EF89LP03 - Analisar os interesses que movem o campo jornalístico';
      }
      return 'EF69LP01, EF69LP02, EF69LP03 - Competências de linguagem da BNCC';
    } else if (disciplinaLower.includes('ciências')) {
      if (serie.includes('9º') || serie.includes('nono')) {
        return 'EF09CI01, EF09CI02, EF09CI03 - Classificar as radiações eletromagnéticas por suas frequências';
      } else if (serie.includes('8º') || serie.includes('oitavo')) {
        return 'EF08CI01, EF08CI02, EF08CI03 - Identificar e classificar diferentes fontes e tipos de energia';
      }
      return 'EF07CI01, EF07CI02, EF07CI03 - Competências científicas da BNCC';
    } else if (disciplinaLower.includes('história')) {
      return 'EF09HI01, EF09HI02, EF09HI03 - Descrever e contextualizar os principais aspectos sociais, culturais, econômicos e políticos';
    } else if (disciplinaLower.includes('geografia')) {
      return 'EF09GE01, EF09GE02, EF09GE03 - Analisar criticamente de que forma a hegemonia europeia foi exercida em várias regiões do planeta';
    }
    
    return 'A definir conforme BNCC específica da disciplina e série';
  }

  private static generateObjective(tema: string, anoSerie: string): string {
    return `Proporcionar aos alunos do ${anoSerie} a compreensão e aplicação dos conceitos relacionados a ${tema}, desenvolvendo habilidades cognitivas, procedimentais e atitudinais adequadas ao nível educacional, promovendo o pensamento crítico e a capacidade de análise.`;
  }

  private static suggestMaterials(tema: string, disciplina: string): string {
    const basicMaterials = ['Quadro branco', 'Projetor multimídia', 'Livro didático'];
    
    if (disciplina.toLowerCase().includes('matemática')) {
      basicMaterials.push('Calculadora científica', 'Régua e compasso', 'Material dourado', 'Softwares matemáticos');
    } else if (disciplina.toLowerCase().includes('ciências') || disciplina.toLowerCase().includes('física') || disciplina.toLowerCase().includes('química')) {
      basicMaterials.push('Kit de laboratório', 'Microscópio', 'Materiais para experimentos', 'Modelos didáticos');
    } else if (disciplina.toLowerCase().includes('português') || disciplina.toLowerCase().includes('literatura')) {
      basicMaterials.push('Textos diversos', 'Dicionário', 'Gramática', 'Obras literárias');
    } else if (disciplina.toLowerCase().includes('história')) {
      basicMaterials.push('Atlas histórico', 'Documentos históricos', 'Timeline', 'Mapas');
    } else if (disciplina.toLowerCase().includes('geografia')) {
      basicMaterials.push('Atlas geográfico', 'Mapas', 'Globo terrestre', 'Imagens de satélite');
    }
    
    return basicMaterials.join(', ');
  }

  private static suggestClassType(tema: string, disciplina: string): string {
    if (tema.toLowerCase().includes('prática') || tema.toLowerCase().includes('experimento') || tema.toLowerCase().includes('laboratório')) {
      return 'Aula prática experimental';
    } else if (tema.toLowerCase().includes('análise') || tema.toLowerCase().includes('discussão') || tema.toLowerCase().includes('debate')) {
      return 'Aula dialogada e participativa';
    } else if (disciplina.toLowerCase().includes('matemática')) {
      return 'Aula expositiva com resolução de exercícios';
    } else if (disciplina.toLowerCase().includes('educação física')) {
      return 'Aula prática esportiva';
    } else if (disciplina.toLowerCase().includes('arte') || disciplina.toLowerCase().includes('música')) {
      return 'Aula prática artística';
    }
    
    return 'Aula expositiva dialogada com atividades práticas';
  }

  private static inferClassProfile(anoSerie: string): string {
    const serie = anoSerie.toLowerCase();
    
    if (serie.includes('1º') || serie.includes('2º') || serie.includes('3º') || serie.includes('fundamental i')) {
      return 'Turma do Ensino Fundamental I - Faixa etária de 6 a 10 anos, em processo de alfabetização e letramento';
    } else if (serie.includes('4º') || serie.includes('5º')) {
      return 'Turma do Ensino Fundamental I - Faixa etária de 9 a 11 anos, consolidando habilidades básicas';
    } else if (serie.includes('6º') || serie.includes('7º') || serie.includes('8º') || serie.includes('9º') || serie.includes('fundamental ii')) {
      return 'Turma do Ensino Fundamental II - Adolescentes em desenvolvimento, com diferentes ritmos de aprendizagem';
    } else if (serie.includes('1ª') || serie.includes('2ª') || serie.includes('3ª') || serie.includes('médio')) {
      return 'Turma do Ensino Médio - Jovens em preparação para vestibular e mercado de trabalho';
    }
    
    return 'Turma heterogênea com diferentes níveis de conhecimento e ritmos de aprendizagem';
  }
}
