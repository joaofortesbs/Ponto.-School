
import { getFieldMap } from './modalBinder';
import { fillActivityModalFields } from './api/fillActivityModalFields';

interface ActivityData {
  id: string;
  type: string;
  title: string;
  description: string;
  [key: string]: any;
}

class AutomationController {
  private static instance: AutomationController;
  private activeAutomations: Set<string> = new Set();

  static getInstance(): AutomationController {
    if (!AutomationController.instance) {
      AutomationController.instance = new AutomationController();
    }
    return AutomationController.instance;
  }

  /**
   * Aguarda que um elemento esteja presente no DOM
   */
  private async waitForElement(selector: string, timeout: number = 10000): Promise<HTMLElement | null> {
    return new Promise((resolve) => {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector) as HTMLElement;
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Timeout fallback
      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    });
  }

  /**
   * Aguarda que o modal esteja completamente carregado
   */
  private async waitModalLoad(modalSelector: string): Promise<boolean> {
    console.group(`🔄 [AutomationController] Aguardando carregamento do modal: ${modalSelector}`);
    
    try {
      // Aguarda o modal aparecer
      const modal = await this.waitForElement(modalSelector, 5000);
      if (!modal) {
        console.error('❌ Modal não encontrado:', modalSelector);
        console.groupEnd();
        return false;
      }

      // Aguarda um frame adicional para garantir renderização completa
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      // Verifica se o modal está visível
      const isVisible = modal.offsetParent !== null;
      if (!isVisible) {
        console.error('❌ Modal não está visível:', modalSelector);
        console.groupEnd();
        return false;
      }

      console.log('✅ Modal carregado e visível');
      console.groupEnd();
      return true;
    } catch (error) {
      console.error('❌ Erro ao aguardar modal:', error);
      console.groupEnd();
      return false;
    }
  }

  /**
   * Preenche um campo específico com validação
   */
  private async fillField(selector: string, value: any, fieldType: string = 'input'): Promise<boolean> {
    try {
      const element = document.querySelector(selector) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      if (!element) {
        console.warn(`⚠️ Campo não encontrado: ${selector}`);
        return false;
      }

      // Aguarda o elemento estar interativo
      await new Promise(resolve => setTimeout(resolve, 100));

      const stringValue = String(value || '');

      if (fieldType === 'select') {
        const selectElement = element as HTMLSelectElement;
        
        // Tenta encontrar a opção por valor
        let optionFound = false;
        for (let i = 0; i < selectElement.options.length; i++) {
          if (selectElement.options[i].value === stringValue || 
              selectElement.options[i].text === stringValue) {
            selectElement.selectedIndex = i;
            optionFound = true;
            break;
          }
        }

        if (!optionFound && selectElement.options.length > 0) {
          // Se não encontrou, seleciona a primeira opção válida
          selectElement.selectedIndex = stringValue ? 1 : 0;
        }

        // Dispara eventos necessários
        selectElement.dispatchEvent(new Event('change', { bubbles: true }));
        selectElement.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        // Para inputs normais e textareas
        const inputElement = element as HTMLInputElement | HTMLTextAreaElement;
        inputElement.value = stringValue;
        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
        inputElement.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // Verifica se o valor foi aplicado
      const currentValue = element.value || (element as HTMLSelectElement).selectedOptions?.[0]?.text || '';
      const success = currentValue.trim() !== '' || stringValue === '';
      
      if (success) {
        console.log(`✅ Campo preenchido: ${selector} = "${currentValue}"`);
      } else {
        console.warn(`⚠️ Falha ao preencher: ${selector}`);
      }

      return success;
    } catch (error) {
      console.error(`❌ Erro ao preencher campo ${selector}:`, error);
      return false;
    }
  }

  /**
   * Preenche todos os campos do modal
   */
  private async fillAllFields(fieldMap: Record<string, string>, iaData: ActivityData, activityId: string): Promise<boolean> {
    console.group(`📝 [AutomationController] Preenchendo campos da atividade: ${activityId}`);
    
    let successCount = 0;
    let totalFields = 0;

    for (const [dataKey, selector] of Object.entries(fieldMap)) {
      totalFields++;
      const value = iaData[dataKey];
      
      if (value === undefined || value === null) {
        console.log(`ℹ️ Campo ${dataKey} não possui valor nos dados da IA`);
        continue;
      }

      // Determina o tipo do campo
      const element = document.querySelector(selector);
      const fieldType = element?.tagName.toLowerCase() === 'select' ? 'select' : 'input';

      const success = await this.fillField(selector, value, fieldType);
      if (success) {
        successCount++;
      }

      // Pequena pausa entre campos para estabilidade
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    const fillSuccess = successCount > 0; // Pelo menos um campo deve ser preenchido
    console.log(`📊 Resultado: ${successCount}/${totalFields} campos preenchidos`);
    console.groupEnd();

    return fillSuccess;
  }

  /**
   * Clica no botão "Construir Atividade"
   */
  private async clickBuildButton(activityId: string): Promise<boolean> {
    console.group(`🔨 [AutomationController] Clicando em "Construir Atividade": ${activityId}`);
    
    try {
      // Possíveis seletores para o botão de construir
      const buttonSelectors = [
        `[data-activity-id="${activityId}"] button[type="submit"]`,
        `[data-activity-id="${activityId}"] .construir-atividade`,
        `[data-activity-id="${activityId}"] button:contains("Construir")`,
        '.modal button[type="submit"]',
        '.modal .construir-atividade',
        'button:contains("Construir Atividade")',
        'button:contains("Construir")'
      ];

      let button: HTMLButtonElement | null = null;

      for (const selector of buttonSelectors) {
        if (selector.includes(':contains')) {
          // Para seletores com :contains, busca manualmente
          const buttons = document.querySelectorAll('button');
          for (const btn of Array.from(buttons)) {
            if (btn.textContent?.includes('Construir')) {
              button = btn as HTMLButtonElement;
              break;
            }
          }
        } else {
          button = document.querySelector(selector) as HTMLButtonElement;
        }
        
        if (button) break;
      }

      if (!button) {
        console.error('❌ Botão "Construir Atividade" não encontrado');
        console.groupEnd();
        return false;
      }

      // Verifica se o botão está habilitado
      if (button.disabled) {
        console.warn('⚠️ Botão "Construir Atividade" está desabilitado');
        console.groupEnd();
        return false;
      }

      // Aguarda um momento para garantir que todos os campos foram processados
      await new Promise(resolve => setTimeout(resolve, 500));

      // Clica no botão
      button.click();
      console.log('✅ Botão "Construir Atividade" clicado com sucesso');
      console.groupEnd();
      return true;

    } catch (error) {
      console.error('❌ Erro ao clicar no botão "Construir Atividade":', error);
      console.groupEnd();
      return false;
    }
  }

  /**
   * Função principal para construir uma atividade automaticamente
   */
  public async autoBuildActivity(activityData: ActivityData): Promise<boolean> {
    const { id: activityId, type, ...iaData } = activityData;

    // Evita automações duplicadas
    if (this.activeAutomations.has(activityId)) {
      console.warn(`⚠️ Automação já em andamento para atividade: ${activityId}`);
      return false;
    }

    this.activeAutomations.add(activityId);

    try {
      console.group(`🚀 [AutomationController] Iniciando construção automática: ${activityId}`);
      console.log('📋 Dados da atividade:', activityData);

      // 1. Aguarda o modal estar carregado
      const modalSelector = `[data-activity-id="${activityId}"]`;
      const modalReady = await this.waitModalLoad(modalSelector);
      
      if (!modalReady) {
        console.error(`❌ Modal não carregou para atividade: ${activityId}`);
        return false;
      }

      // 2. Obtém o mapeamento de campos para o tipo de atividade
      const fieldMap = getFieldMap(type);
      if (!fieldMap || Object.keys(fieldMap).length === 0) {
        console.error(`❌ Mapeamento de campos não encontrado para tipo: ${type}`);
        return false;
      }

      console.log('🗺️ Mapeamento de campos:', fieldMap);

      // 3. Preenche todos os campos
      const fieldsSuccess = await this.fillAllFields(fieldMap, { ...iaData, id: activityId, type }, activityId);
      
      if (!fieldsSuccess) {
        console.error(`❌ Falha ao preencher campos da atividade: ${activityId}`);
        return false;
      }

      // 4. Clica no botão "Construir Atividade"
      const buildSuccess = await this.clickBuildButton(activityId);
      
      if (!buildSuccess) {
        console.error(`❌ Falha ao clicar no botão de construção da atividade: ${activityId}`);
        return false;
      }

      console.log(`✅ Atividade construída automaticamente com sucesso: ${activityId}`);
      console.groupEnd();
      return true;

    } catch (error) {
      console.error(`❌ Erro durante construção automática da atividade ${activityId}:`, error);
      console.groupEnd();
      return false;
    } finally {
      this.activeAutomations.delete(activityId);
    }
  }

  /**
   * Constrói múltiplas atividades em sequência
   */
  public async autoBuildMultipleActivities(activitiesData: ActivityData[]): Promise<boolean[]> {
    console.group(`🔄 [AutomationController] Construindo ${activitiesData.length} atividades automaticamente`);
    
    const results: boolean[] = [];
    
    for (const activityData of activitiesData) {
      const result = await this.autoBuildActivity(activityData);
      results.push(result);
      
      // Pausa entre atividades para evitar sobrecarga
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const successCount = results.filter(r => r).length;
    console.log(`📊 Resultado final: ${successCount}/${activitiesData.length} atividades construídas`);
    console.groupEnd();

    return results;
  }
}

export default AutomationController;
