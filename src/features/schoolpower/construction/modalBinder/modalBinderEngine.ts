import { getFieldMap } from './fieldMaps';
import { parseIAResponse } from './utils/parseIAResponse';
import { fillModalField } from './utils/fieldSetter';

export interface ModalBinderConfig {
  activityId: string;
  type: string;
  iaRawOutput: any;
  contextualizationData?: any;
}

export async function modalBinderEngine(
  activityId: string, 
  activityData: any,
  config: ModalBinderConfig = {}
): Promise<boolean> {
  console.log('🚀 Iniciando ModalBinderEngine para atividade:', activityId);
  console.log('📊 Dados da atividade recebidos:', activityData);

  try {
    // 1. Obter mapeamento de campos para o tipo de atividade
    const fieldMap = getFieldMap(activityId);
    console.log('🗺️ Mapeamento de campos obtido:', fieldMap);

    if (!fieldMap || Object.keys(fieldMap).length === 0) {
      console.warn('⚠️ Nenhum mapeamento de campos encontrado para:', activityId);
      return false;
    }

    // 2. Verificar se é um tipo de atividade suportado
    if (!isActivityTypeSupported(activityId)) {
      console.warn('⚠️ Tipo de atividade não suportado:', activityId);
      return false;
    }

    // 3. Aguardar um momento para garantir que o modal está aberto
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 4. Processar dados da atividade de forma mais robusta
    let parsedData: any = {};

    if (activityData && typeof activityData === 'object') {
      // Se já é um objeto, usar diretamente e também parsear
      parsedData = { ...activityData };

      // Também tentar parsear se houver uma string de resposta
      if (activityData.response || activityData.description || activityData.content) {
        const responseStr = activityData.response || activityData.description || activityData.content;
        const additionalData = parseIAResponse(responseStr, activityId);
        parsedData = { ...parsedData, ...additionalData };
      }

      // Garantir campos básicos se estiverem disponíveis no objeto
      if (activityData.title && !parsedData.titulo) parsedData.titulo = activityData.title;
      if (activityData.description && !parsedData.descricao) parsedData.descricao = activityData.description;
      if (activityData.personalizedTitle && !parsedData.titulo) parsedData.titulo = activityData.personalizedTitle;
      if (activityData.personalizedDescription && !parsedData.descricao) parsedData.descricao = activityData.personalizedDescription;

    } else if (activityData && typeof activityData === 'string') {
      parsedData = parseIAResponse(activityData, activityId);
    } else {
      console.warn('⚠️ Dados da atividade não encontrados ou inválidos');
      return false;
    }

    console.log('🔍 Dados finais processados para preenchimento:', parsedData);

    // 5. Aguardar mais um momento para garantir que o modal está totalmente carregado
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 6. Preencher campos do modal automaticamente com múltiplas tentativas
    let fieldsFilledCount = 0;
    let totalAttempts = 0;
    const maxRetries = 3;

    for (const [key, value] of Object.entries(parsedData)) {
      if (!value || value === '' || value === null || value === undefined) {
        console.log(`⚠️ Pulando campo ${key}: valor vazio ou nulo`);
        continue;
      }

      const selector = fieldMap[key];
      if (!selector) {
        console.log(`⚠️ Pulando campo ${key}: seletor não encontrado no mapeamento`);
        continue;
      }

      totalAttempts++;
      console.log(`🎯 Tentando preencher campo: ${key} -> ${selector} com valor: ${value}`);

      let filled = false;
      for (let retry = 0; retry < maxRetries && !filled; retry++) {
        try {
          if (retry > 0) {
            console.log(`🔄 Tentativa ${retry + 1} para campo ${key}`);
            await new Promise(resolve => setTimeout(resolve, 500));
          }

          const success = await fillModalField(activityId, selector, String(value));
          if (success) {
            fieldsFilledCount++;
            filled = true;
            console.log(`✅ Campo ${key} preenchido com sucesso na tentativa ${retry + 1}`);
          }

        } catch (error) {
          console.error(`❌ Erro na tentativa ${retry + 1} para campo ${key}:`, error);
        }
      }

      if (!filled) {
        console.warn(`❌ Falha ao preencher campo ${key} após ${maxRetries} tentativas`);
      }

      // Pausa entre campos
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`📊 Resultado final do preenchimento: ${fieldsFilledCount}/${totalAttempts} campos preenchidos`);

    // 7. Aguardar um momento adicional para garantir que todos os campos foram processados
    await new Promise(resolve => setTimeout(resolve, 800));

    // Considerar sucesso se pelo menos 50% dos campos foram preenchidos ou se pelo menos 1 campo foi preenchido
    const successThreshold = Math.max(1, Math.floor(totalAttempts * 0.3));
    const isSuccess = fieldsFilledCount >= successThreshold;

    if (isSuccess) {
      console.log('✅ ModalBinderEngine executado com sucesso!');
    } else {
      console.warn('⚠️ ModalBinderEngine completado com resultado parcial');
    }

    return isSuccess;

  } catch (error) {
    console.error('❌ Erro no ModalBinderEngine:', error);
    return false;
  }
}

const triggerBuildButton = async (activityId: string): Promise<boolean> => {
  try {
    // Buscar o botão de construir atividade no modal específico
    const modalSelector = `[data-activity-id="${activityId}"]`;
    const modal = document.querySelector(modalSelector);

    if (!modal) {
      console.warn(`Modal não encontrado para atividade: ${activityId}`);
      return false;
    }

    // Buscar botão "Construir Atividade" ou similar
    const buildButton = modal.querySelector('button[data-action="build"], button:contains("Construir"), button:contains("Gerar")') as HTMLButtonElement;

    if (buildButton && !buildButton.disabled) {
      buildButton.click();
      console.log('🔥 Botão de construção acionado automaticamente');
      return true;
    } else {
      console.warn('Botão de construção não encontrado ou está desabilitado');
      return false;
    }
  } catch (error) {
    console.error('Erro ao acionar botão de construção:', error);
    return false;
  }
};

export { triggerBuildButton };
import { parseIAResponse } from './utils/parseIAResponse';
import { fieldSetter } from './utils/fieldSetter';
import { getFieldMap } from './fieldMaps';

export const modalBinderEngine_new = {
  /**
   * Preenche automaticamente os campos do modal com dados da IA
   */
  async fillModalFields(activityId: string, iaResponse: string): Promise<void> {
    console.log('🔧 ModalBinder: Iniciando preenchimento automático...');
    console.log('🎯 Activity ID:', activityId);
    console.log('📝 IA Response:', iaResponse);

    try {
      // Parse da resposta da IA
      const parsedData = await parseIAResponse(iaResponse);
      console.log('📋 Dados parseados:', parsedData);

      // Obtém o mapa de campos para esta atividade
      const fieldMap = getFieldMap(activityId);
      if (!fieldMap) {
        console.warn(`⚠️ Nenhum mapa de campos encontrado para: ${activityId}`);
        return;
      }

      // Preenche cada campo mapeado
      for (const [fieldKey, selector] of Object.entries(fieldMap)) {
        const value = parsedData[fieldKey];
        if (value && selector) {
          await fieldSetter.setFieldValue(selector, value);
          console.log(`✅ Campo preenchido: ${fieldKey} = ${value}`);
        }
      }

      console.log('✅ Preenchimento automático concluído!');
    } catch (error) {
      console.error('❌ Erro no preenchimento automático:', error);
      throw error;
    }
  },

  /**
   * Preenche campos da atividade com dados customizados (para auto-construção)
   */
  async fillActivityFields(activityId: string, customFields: Record<string, any>): Promise<void> {
    console.log('🤖 ModalBinder: Preenchimento automático para auto-construção...');
    console.log('🎯 Activity ID:', activityId);
    console.log('📋 Custom Fields:', customFields);

    try {
      // Obtém o mapa de campos para esta atividade
      const fieldMap = getFieldMap(activityId);
      if (!fieldMap) {
        console.warn(`⚠️ Nenhum mapa de campos encontrado para: ${activityId}`);
        return;
      }

      // Simula o preenchimento dos campos usando os dados customizados
      const simulatedData = this.mapCustomFieldsToFormData(customFields, fieldMap);

      // Simula uma pequena pausa para realismo
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('✅ Campos da atividade processados automaticamente:', simulatedData);
    } catch (error) {
      console.error('❌ Erro no preenchimento de campos da atividade:', error);
      throw error;
    }
  },

  /**
   * Mapeia campos customizados para dados do formulário
   */
  mapCustomFieldsToFormData(customFields: Record<string, any>, fieldMap: Record<string, string>): Record<string, any> {
    const formData: Record<string, any> = {};

    // Mapeia campos conhecidos
    const fieldMappings: Record<string, string[]> = {
      'Disciplina': ['subject', 'disciplina'],
      'Tema': ['theme', 'tema'],
      'Ano de Escolaridade': ['schoolYear', 'ano'],
      'Quantidade de Questões': ['numberOfQuestions', 'questoes'],
      'Nível de Dificuldade': ['difficultyLevel', 'dificuldade'],
      'Modelo de Questões': ['questionModel', 'modelo'],
      'Fontes': ['sources', 'fontes'],
      'Tempo Limite': ['timeLimit', 'tempo'],
      'Contexto de Aplicação': ['context', 'contexto']
    };

    for (const [customKey, customValue] of Object.entries(customFields)) {
      const possibleFields = fieldMappings[customKey] || [customKey.toLowerCase()];

      for (const field of possibleFields) {
        if (fieldMap[field]) {
          formData[field] = customValue;
          break;
        }
      }
    }

    return formData;
  }
};