
export const fillModalField = async (
  activityId: string, 
  selector: string, 
  value: string | string[] | number
): Promise<boolean> => {
  try {
    // Buscar o modal específico da atividade
    const modalSelector = `[data-activity-id="${activityId}"], .modal[data-activity="${activityId}"], .edit-modal[data-id="${activityId}"]`;
    const modal = document.querySelector(modalSelector);
    
    if (!modal) {
      console.warn(`Modal não encontrado para atividade: ${activityId}`);
      return false;
    }
    
    // Tentar múltiplos seletores (fallback)
    const selectors = selector.split(', ');
    let element: HTMLElement | null = null;
    
    for (const sel of selectors) {
      element = modal.querySelector(sel.trim()) as HTMLElement;
      if (element) break;
    }
    
    if (!element) {
      console.warn(`Campo não encontrado com seletor: ${selector}`);
      return false;
    }
    
    // Preencher campo baseado no tipo de elemento
    const success = await setFieldValue(element, value);
    
    if (success) {
      // Disparar eventos para notificar mudanças
      triggerChangeEvents(element);
      console.log(`✅ Campo preenchido: ${selector} = ${value}`);
    }
    
    return success;
    
  } catch (error) {
    console.error(`❌ Erro ao preencher campo ${selector}:`, error);
    return false;
  }
};

const setFieldValue = async (
  element: HTMLElement, 
  value: string | string[] | number
): Promise<boolean> => {
  try {
    const tagName = element.tagName.toLowerCase();
    const type = (element as HTMLInputElement).type?.toLowerCase();
    
    // Input fields
    if (tagName === 'input') {
      if (type === 'text' || type === 'number' || !type) {
        (element as HTMLInputElement).value = String(value);
        return true;
      }
    }
    
    // Textarea
    else if (tagName === 'textarea') {
      (element as HTMLTextAreaElement).value = Array.isArray(value) 
        ? value.join('\n') 
        : String(value);
      return true;
    }
    
    // Select
    else if (tagName === 'select') {
      const selectElement = element as HTMLSelectElement;
      const optionValue = String(value).toLowerCase();
      
      // Tentar encontrar opção exata
      for (let i = 0; i < selectElement.options.length; i++) {
        const option = selectElement.options[i];
        if (option.value.toLowerCase() === optionValue || 
            option.text.toLowerCase() === optionValue) {
          selectElement.selectedIndex = i;
          return true;
        }
      }
      
      // Tentar correspondência parcial
      for (let i = 0; i < selectElement.options.length; i++) {
        const option = selectElement.options[i];
        if (option.text.toLowerCase().includes(optionValue) ||
            optionValue.includes(option.text.toLowerCase())) {
          selectElement.selectedIndex = i;
          return true;
        }
      }
    }
    
    // Elementos com contentEditable
    else if (element.contentEditable === 'true') {
      element.innerHTML = Array.isArray(value) 
        ? value.join('<br>') 
        : String(value);
      return true;
    }
    
    // Para elementos React ou outros frameworks
    else {
      // Tentar definir via propriedade value
      try {
        (element as any).value = String(value);
        return true;
      } catch {
        // Tentar via textContent
        element.textContent = String(value);
        return true;
      }
    }
    
    return false;
    
  } catch (error) {
    console.error('Erro ao definir valor do campo:', error);
    return false;
  }
};

const triggerChangeEvents = (element: HTMLElement): void => {
  try {
    // Eventos básicos
    const events = ['input', 'change', 'blur'];
    
    events.forEach(eventType => {
      const event = new Event(eventType, { bubbles: true, cancelable: true });
      element.dispatchEvent(event);
    });
    
    // Evento React sintético (se aplicável)
    if ((element as any)._reactInternalFiber || (element as any)._reactInternalInstance) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 
        'value'
      )?.set;
      
      if (nativeInputValueSetter && element.tagName === 'INPUT') {
        const reactEvent = new Event('input', { bubbles: true });
        element.dispatchEvent(reactEvent);
      }
    }
    
  } catch (error) {
    console.warn('Erro ao disparar eventos de mudança:', error);
  }
};

export { setFieldValue, triggerChangeEvents };
