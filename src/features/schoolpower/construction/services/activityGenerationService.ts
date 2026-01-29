import { ActivityFormData } from '../types/ActivityTypes';
import { atividadesNeonService } from '@/services/atividadesNeonService';
import { profileService } from '@/services/profileService';

interface GeneratedActivity {
  id: string;
  title: string;
  content: string;
  type: string;
  metadata: Record<string, any>;
  previewData?: any;
}

export class ActivityGenerationService {
  private static instance: ActivityGenerationService;

  private constructor() {}

  static getInstance(): ActivityGenerationService {
    if (!ActivityGenerationService.instance) {
      ActivityGenerationService.instance = new ActivityGenerationService();
    }
    return ActivityGenerationService.instance;
  }

  async generateActivity(activityId: string, formData: ActivityFormData): Promise<GeneratedActivity> {
    console.log(`🎯 Gerando atividade: ${activityId}`, formData);

    // Validar dados de entrada
    if (!formData.title || !formData.description) {
      throw new Error('Dados de formulário incompletos');
    }

    // Simular processamento realista
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    // Gerar conteúdo específico baseado no tipo
    const content = this.generateContentByType(activityId, formData);
    const previewData = this.generatePreviewData(activityId, formData);

    // Mock da atividade gerada
    const generatedActivity: GeneratedActivity = {
      id: activityId,
      title: formData.title,
      content,
      type: activityId,
      previewData,
      metadata: {
        generatedAt: new Date().toISOString(),
        customFields: formData.customFields || {},
        formData: formData,
        status: 'generated'
      }
    };

    console.log('✅ Atividade gerada com sucesso:', generatedActivity);

    // Salvar atividade (localStorage + banco Neon)
    await this.saveActivityData(activityId, generatedActivity);

    return generatedActivity;
  }

  private async saveActivityData(activityId: string, activity: GeneratedActivity): Promise<void> {
    try {
      // 1. Salvar dados da atividade gerada no localStorage (backward compatibility)
      const activityKey = `schoolpower_activity_${activityId}`;
      localStorage.setItem(activityKey, JSON.stringify(activity));

      // 2. Salvar dados para pré-visualização no localStorage
      const previewKey = `schoolpower_preview_${activityId}`;
      localStorage.setItem(previewKey, JSON.stringify(activity.previewData));

      console.log(`💾 Dados da atividade ${activityId} salvos no localStorage`);

      // 3. Salvar no banco Neon automaticamente
      try {
        const profile = await profileService.getCurrentUserProfile();
        
        if (profile?.id) {
          console.log(`🔄 Salvando atividade ${activityId} no banco Neon...`);
          
          const result = await atividadesNeonService.salvarAtividade(
            activityId,
            profile.id,
            activity.type,
            activity
          );
          
          if (result.success) {
            console.log(`✅ Atividade ${activityId} salva no banco Neon com sucesso!`);
            
            // Marcar como sincronizada
            const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
            constructedActivities[activityId] = {
              ...constructedActivities[activityId],
              isBuilt: true,
              builtAt: new Date().toISOString(),
              type: activity.type,
              syncedToNeon: true
            };
            localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));
          } else {
            console.warn(`⚠️ Não foi possível salvar no Neon, mas atividade está no localStorage`);
          }
        } else {
          console.warn('⚠️ Usuário não autenticado, atividade salva apenas no localStorage');
        }
      } catch (neonError) {
        console.error('❌ Erro ao salvar no Neon, mas atividade está no localStorage:', neonError);
      }

    } catch (error) {
      console.error(`❌ Erro ao salvar atividade ${activityId}:`, error);
    }
  }

  private generateContentByType(activityId: string, formData: ActivityFormData): string {
    switch (activityId) {
      case 'lista-exercicios':
        return this.generateExerciseListContent(formData);
      case 'prova':
        return this.generateExamContent(formData);
      case 'jogos-educativos':
        return this.generateGameContent(formData);
      case 'sequencia-didatica':
        return this.generateSequenceContent(formData);
      case 'mapa-mental':
        return this.generateMindMapContent(formData);
      default:
        return this.generateDefaultContent(formData);
    }
  }

  private generatePreviewData(activityId: string, formData: ActivityFormData): any {
    const baseData = {
      id: activityId,
      title: formData.title,
      description: formData.description,
      type: activityId,
      generatedAt: new Date().toISOString(),
      customFields: formData.customFields || {}
    };

    switch (activityId) {
      case 'lista-exercicios':
        return {
          ...baseData,
          questions: this.generateQuestions(formData),
          totalQuestions: parseInt(formData.customFields?.['Quantidade de Questões'] || '10')
        };
      default:
        return baseData;
    }
  }

  private generateQuestions(formData: ActivityFormData): any[] {
    const quantidade = parseInt(formData.customFields?.['Quantidade de Questões'] || '10');
    const tema = formData.customFields?.['Tema'] || 'Tema geral';
    const questions = [];

    for (let i = 1; i <= quantidade; i++) {
      questions.push({
        id: i,
        question: `Questão ${i} sobre ${tema}`,
        options: [
          `Primeira opção sobre ${tema} - regenere para conteúdo real`,
          `Segunda opção relacionada ao tema - clique em regenerar`,
          `Terceira alternativa do exercício - aguardando regeneração`,
          `Quarta opção do conteúdo - por favor, regenere`
        ],
        correctAnswer: 0,
        explanation: `Explicação da questão ${i}`
      });
    }

    return questions;
  }

  private generateExerciseListContent(formData: ActivityFormData): string {
    const quantidade = formData.customFields?.['Quantidade de Questões'] || '10';
    const tema = formData.customFields?.['Tema'] || 'Tema geral';
    const disciplina = formData.customFields?.['Disciplina'] || 'Disciplina';
    const anoEscolaridade = formData.customFields?.['Ano de Escolaridade'] || 'Ano não especificado';
    const nivelDificuldade = formData.customFields?.['Nível de Dificuldade'] || 'Médio';

    return `# ${formData.title}

## Informações da Atividade
- **Disciplina**: ${disciplina}
- **Tema**: ${tema}
- **Ano de Escolaridade**: ${anoEscolaridade}
- **Nível de Dificuldade**: ${nivelDificuldade}
- **Quantidade de Questões**: ${quantidade}

## Descrição
${formData.description}

### Lista de Exercícios

${Array.from({length: parseInt(quantidade)}, (_, i) => `
**${i + 1}.** Questão sobre ${tema} - nível ${nivelDificuldade}
   a) [Aguardando IA] Primeira opção sobre ${tema} - regenere para conteúdo real
   b) [Aguardando IA] Segunda opção plausível - clique em regenerar
   c) [Aguardando IA] Terceira alternativa sobre ${tema} - em processamento
   d) [Aguardando IA] Quarta opção - regenere se persistir
`).join('\n')}

---
*Atividade gerada automaticamente pelo School Power*`;
  }

  private generateExamContent(formData: ActivityFormData): string {
    const quantidade = formData.customFields?.['Quantidade de Questões'] || '20';
    const tema = formData.customFields?.['Tema'] || 'Tema geral';
    const tempoDuracao = formData.customFields?.['Tempo de Duração'] || '60 minutos';

    return `# ${formData.title}

## Avaliação - ${tema}
- **Total de Questões**: ${quantidade}
- **Tempo de Duração**: ${tempoDuracao}

### Instruções:
- Leia atentamente cada questão
- Marque apenas uma alternativa por questão
- Use caneta azul ou preta

### Questões:

${Array.from({length: parseInt(quantidade)}, (_, i) => `
**Questão ${i + 1}**: Sobre ${tema}...
a) [Aguardando IA] Primeira opção sobre ${tema} - regenere para conteúdo real
b) [Aguardando IA] Segunda opção plausível - clique em regenerar
c) [Aguardando IA] Terceira alternativa - em processamento
d) [Aguardando IA] Quarta opção - regenere se persistir
`).join('\n')}

---
*Prova gerada automaticamente pelo School Power*`;
  }

  private generateGameContent(formData: ActivityFormData): string {
    const tema = formData.customFields?.['Tema'] || 'Tema geral';
    const tipoJogo = formData.customFields?.['Tipo de Jogo'] || 'Quiz Interativo';
    const nivelDificuldade = formData.customFields?.['Nível de Dificuldade'] || 'Médio';

    return `# ${formData.title}

## Jogo Educativo - ${tipoJogo}
- **Tema**: ${tema}
- **Nível**: ${nivelDificuldade}

### Objetivo do Jogo:
Aprender sobre ${tema} de forma divertida e interativa.

### Regras:
1. Responda às perguntas corretamente para ganhar pontos
2. Cada acerto vale 10 pontos
3. Tempo limite por questão: 30 segundos

### Descrição:
${formData.description}

---
*Jogo gerado automaticamente pelo School Power*`;
  }

  private generateSequenceContent(formData: ActivityFormData): string {
    const tema = formData.customFields?.['Tema'] || 'Tema geral';
    const disciplina = formData.customFields?.['Disciplina'] || 'Disciplina';

    return `# ${formData.title}

## Sequência Didática - ${tema}
**Disciplina**: ${disciplina}

### Objetivos:
- Compreender os conceitos de ${tema}
- Aplicar conhecimentos em situações práticas

### Etapas da Sequência:

1. **Problematização**
2. **Desenvolvimento**  
3. **Sistematização**
4. **Avaliação**

### Descrição:
${formData.description}

---
*Sequência didática gerada automaticamente pelo School Power*`;
  }

  private generateMindMapContent(formData: ActivityFormData): string {
    const tema = formData.customFields?.['Tema'] || 'Tema geral';

    return `# ${formData.title}

## Mapa Mental - ${tema}

### Conceito Central: ${tema}

### Ramificações:
- **Conceitos Fundamentais**
- **Aplicações Práticas**
- **Exemplos**
- **Exercícios**

### Descrição:
${formData.description}

---
*Mapa mental gerado automaticamente pelo School Power*`;
  }

  private generateDefaultContent(formData: ActivityFormData): string {
    return `# ${formData.title}

## Descrição:
${formData.description}

### Conteúdo da Atividade:
Atividade personalizada gerada com base nos dados fornecidos.

### Campos Personalizados:
${Object.entries(formData.customFields || {})
  .map(([key, value]) => `- **${key}**: ${value}`)
  .join('\n')}

---
*Atividade gerada automaticamente pelo School Power*`;
  }
}

export const activityGenerationService = ActivityGenerationService.getInstance();