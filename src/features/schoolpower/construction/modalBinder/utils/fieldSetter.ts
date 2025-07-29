export const fillModalField = async (activityId: string, selector: string, value: any): Promise<boolean> => {
  try {
    if (!value || value === '') {
      console.log(`⚠️ Valor vazio para campo: ${selector}`);
      return false;
    }

    // Aguardar um momento para garantir que o modal esteja totalmente carregado
    await new Promise(resolve => setTimeout(resolve, 200));

    const selectors = selector.split(', ');
    let element: HTMLElement | null = null;

    // Tentar encontrar o elemento usando os seletores fornecidos
    for (const sel of selectors) {
      element = document.querySelector(sel.trim());
      if (element) {
        console.log(`🎯 Elemento encontrado com selector: ${sel}`);
        break;
      }
    }

    if (!element) {
      console.warn(`❌ Elemento não encontrado para nenhum selector: ${selector}`);
      return false;
    }

    const stringValue = String(value);

    // Preencher o campo baseado no tipo do elemento
    if (element instanceof HTMLInputElement) {
      element.focus();
      element.value = stringValue;

      // Disparar eventos para React
      const inputEvent = new Event('input', { bubbles: true });
      const changeEvent = new Event('change', { bubbles: true });

      element.dispatchEvent(inputEvent);
      element.dispatchEvent(changeEvent);

      // Para React, também disparar eventos sintéticos
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(element, stringValue);
        element.dispatchEvent(new Event('input', { bubbles: true }));
      }

    } else if (element instanceof HTMLTextAreaElement) {
      element.focus();
      element.value = stringValue;

      // Disparar eventos para React
      const inputEvent = new Event('input', { bubbles: true });
      const changeEvent = new Event('change', { bubbles: true });

      element.dispatchEvent(inputEvent);
      element.dispatchEvent(changeEvent);

      // Para React, também disparar eventos sintéticos
      const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
      if (nativeTextAreaValueSetter) {
        nativeTextAreaValueSetter.call(element, stringValue);
        element.dispatchEvent(new Event('input', { bubbles: true }));
      }

    } else if (element instanceof HTMLSelectElement) {
      // Para selects, tentar encontrar a opção mais próxima
      const options = Array.from(element.options);
      let selectedOption = options.find(option => 
        option.value.toLowerCase() === stringValue.toLowerCase() ||
        option.text.toLowerCase() === stringValue.toLowerCase()
      );

      if (!selectedOption) {
        // Tentar busca parcial
        selectedOption = options.find(option => 
          option.text.toLowerCase().includes(stringValue.toLowerCase()) ||
          stringValue.toLowerCase().includes(option.text.toLowerCase())
        );
      }

      if (selectedOption) {
        element.value = selectedOption.value;
        element.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        console.warn(`⚠️ Opção não encontrada no select para valor: ${stringValue}`);
        return false;
      }
    }

    console.log(`✅ Campo preenchido com sucesso: ${selector} = ${stringValue}`);
    return true;

  } catch (error) {
    console.error(`❌ Erro ao preencher campo ${selector}:`, error);
    return false;
  }
};

export const triggerBuildButton = async (activityId: string): Promise<boolean> => {
  try {
    console.log('🎯 Procurando botão de construção/salvar...');

    // Lista de seletores para botões de construção/salvar
    const buttonSelectors = [
      'button[type="submit"]',
      'button:contains("Construir")',
      'button:contains("Salvar")',
      'button:contains("Gerar")',
      'button:contains("Criar")',
      '[data-action="build"]',
      '[data-action="save"]',
      '.btn-primary',
      '.build-button',
      '.save-button'
    ];

    let button: HTMLButtonElement | null = null;

    for (const selector of buttonSelectors) {
      const element = document.querySelector(selector);
      if (element && element instanceof HTMLButtonElement && !element.disabled) {
        button = element;
        console.log(`🎯 Botão encontrado com selector: ${selector}`);
        break;
      }
    }

    if (!button) {
      console.warn('⚠️ Botão de construção não encontrado');
      return false;
    }

    // Verificar se o botão está visível e habilitado
    const rect = button.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      console.warn('⚠️ Botão não está visível');
      return false;
    }

    if (button.disabled) {
      console.warn('⚠️ Botão está desabilitado');
      return false;
    }

    // Clicar no botão
    console.log('🎯 Clicando no botão de construção...');
    button.click();

    // Aguardar um momento para verificar se a ação foi executada
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('✅ Botão de construção acionado com sucesso');
    return true;

  } catch (error) {
    console.error('❌ Erro ao acionar botão de construção:', error);
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