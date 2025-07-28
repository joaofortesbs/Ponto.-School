
import { getFieldMap } from './fieldMaps';
import { parseIAResponse } from './utils/parseIAResponse';
import { fillModalField } from './utils/fieldSetter';

export interface ModalBinderConfig {
  activityId: string;
  type: string;
  iaRawOutput: any;
  contextualizationData?: any;
}

export const modalBinderEngine = async (config: ModalBinderConfig): Promise<boolean> => {
  try {
    console.log('🔧 ModalBinderEngine: Iniciando sincronização automática para:', config.activityId);
    console.log('📋 Configuração recebida:', { 
      activityId: config.activityId, 
      type: config.type,
      hasIAOutput: !!config.iaRawOutput,
      hasContext: !!config.contextualizationData 
    });
    
    const { activityId, type, iaRawOutput, contextualizationData } = config;
    
    // 1. Verificar se o modal está aberto e carregado
    const modalElement = document.querySelector('[role="dialog"], .modal, [data-state="open"]');
    if (!modalElement) {
      console.warn('⚠️ Modal não encontrado - aguardando abertura...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 2. Obter mapeamento específico do tipo de atividade
    const fieldMap = getFieldMap(type);
    if (!fieldMap) {
      console.warn(`⚠️ Mapeamento não encontrado para tipo: ${type}`);
      return false;
    }
    
    console.log('📋 Mapeamento de campos carregado:', Object.keys(fieldMap));
    
    // 3. Processar resposta da IA
    const parsedData = parseIAResponse(iaRawOutput, contextualizationData);
    if (!parsedData) {
      console.warn('⚠️ Falha ao processar resposta da IA');
      return false;
    }
    
    console.log('📊 Dados processados da IA:', parsedData);
    
    // 4. Aguardar estabilização do modal
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 5. Preencher campos do modal automaticamente
    let fieldsFilledCount = 0;
    let totalAttempts = 0;
    
    for (const [key, value] of Object.entries(parsedData)) {
      const selector = fieldMap[key];
      if (!selector || !value) {
        console.log(`⚠️ Pulando campo ${key}: selector=${!!selector}, value=${!!value}`);
        continue;
      }
      
      totalAttempts++;
      console.log(`🎯 Tentando preencher campo: ${key} -> ${selector}`);
      
      try {
        const success = await fillModalField(activityId, selector, value);
        if (success) {
          fieldsFilledCount++;
          console.log(`✅ Campo ${key} preenchido com sucesso`);
        } else {
          console.warn(`❌ Falha ao preencher campo ${key}`);
        }
        
        // Pequena pausa entre preenchimentos
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Erro ao preencher campo ${key}:`, error);
      }
    }
    
    console.log(`📊 Resultado do preenchimento: ${fieldsFilledCount}/${totalAttempts} campos preenchidos`);
    
    // 6. Verificar se conseguimos preencher pelo menos alguns campos essenciais
    if (fieldsFilledCount === 0) {
      console.error('❌ Nenhum campo foi preenchido - verificar mapeamentos e seletores');
      return false;
    }
    
    // 7. Aguardar um momento adicional para garantir que todos os campos foram processados
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 8. Tentar acionar construção automática (opcional)
    try {
      const buildButton = document.querySelector('button[type="submit"], button:contains("Construir"), button:contains("Salvar"), button:contains("Gerar")');
      if (buildButton && buildButton instanceof HTMLButtonElement) {
        console.log('🎯 Botão de construção encontrado, acionando...');
        buildButton.click();
        console.log('🎉 Construção automática acionada!');
      } else {
        console.log('ℹ️ Botão de construção não encontrado - preenchimento manual concluído');
      }
    } catch (error) {
      console.warn('⚠️ Erro ao acionar construção automática:', error);
    }
    
    console.log(`🎉 ModalBinderEngine concluído com sucesso! ${fieldsFilledCount} campos preenchidos`);
    return fieldsFilledCount > 0;
    
  } catch (error) {
    console.error('❌ Erro crítico no ModalBinderEngine:', error);
    return false;
  }
};

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
