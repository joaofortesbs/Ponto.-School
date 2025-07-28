
// Sistema avançado de aguardo de elementos DOM com múltiplas estratégias
export interface WaitOptions {
  timeout?: number;
  interval?: number;
  retries?: number;
  condition?: (element: Element) => boolean;
}

export class ElementWaiter {
  private static instance: ElementWaiter;
  private observers: Map<string, MutationObserver> = new Map();
  
  static getInstance(): ElementWaiter {
    if (!ElementWaiter.instance) {
      ElementWaiter.instance = new ElementWaiter();
    }
    return ElementWaiter.instance;
  }

  /**
   * Aguarda um elemento usando múltiplas estratégias
   */
  async waitForElement(
    selectors: string | string[], 
    options: WaitOptions = {}
  ): Promise<Element | null> {
    const {
      timeout = 10000,
      interval = 100,
      retries = 3,
      condition = () => true
    } = options;

    const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
    
    console.log(`🔍 Aguardando elemento(s): ${selectorArray.join(', ')}`);

    // Estratégia 1: Verificação imediata
    for (const selector of selectorArray) {
      const element = document.querySelector(selector);
      if (element && condition(element)) {
        console.log(`✅ Elemento encontrado imediatamente: ${selector}`);
        return element;
      }
    }

    // Estratégia 2: Polling com MutationObserver
    return this.waitWithMultipleStrategies(selectorArray, timeout, interval, condition, retries);
  }

  /**
   * Combina múltiplas estratégias de aguardo
   */
  private async waitWithMultipleStrategies(
    selectors: string[],
    timeout: number,
    interval: number,
    condition: (element: Element) => boolean,
    retries: number
  ): Promise<Element | null> {
    
    for (let attempt = 0; attempt < retries; attempt++) {
      console.log(`🔄 Tentativa ${attempt + 1}/${retries}`);
      
      try {
        // Estratégia A: MutationObserver
        const observerResult = await this.waitWithObserver(selectors, timeout / retries, condition);
        if (observerResult) return observerResult;

        // Estratégia B: Polling agressivo
        const pollingResult = await this.waitWithPolling(selectors, timeout / retries, interval, condition);
        if (pollingResult) return pollingResult;

        // Estratégia C: Aguardar eventos específicos
        const eventResult = await this.waitForDOMEvents(selectors, timeout / retries, condition);
        if (eventResult) return eventResult;

      } catch (error) {
        console.warn(`⚠️ Erro na tentativa ${attempt + 1}:`, error);
      }

      // Pequena pausa entre tentativas
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.warn(`❌ Elemento não encontrado após ${retries} tentativas: ${selectors.join(', ')}`);
    return null;
  }

  /**
   * Estratégia com MutationObserver
   */
  private waitWithObserver(
    selectors: string[],
    timeout: number,
    condition: (element: Element) => boolean
  ): Promise<Element | null> {
    return new Promise((resolve) => {
      const observerId = `observer-${Date.now()}-${Math.random()}`;
      let timeoutId: NodeJS.Timeout;

      const observer = new MutationObserver((mutations) => {
        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element && condition(element)) {
            console.log(`✅ Elemento encontrado via MutationObserver: ${selector}`);
            cleanup();
            resolve(element);
            return;
          }
        }
      });

      const cleanup = () => {
        observer.disconnect();
        this.observers.delete(observerId);
        clearTimeout(timeoutId);
      };

      // Observa mudanças no DOM inteiro
      observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class', 'id', 'data-testid', 'aria-hidden']
      });

      this.observers.set(observerId, observer);

      timeoutId = setTimeout(() => {
        cleanup();
        resolve(null);
      }, timeout);
    });
  }

  /**
   * Estratégia com polling
   */
  private waitWithPolling(
    selectors: string[],
    timeout: number,
    interval: number,
    condition: (element: Element) => boolean
  ): Promise<Element | null> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const poll = () => {
        if (Date.now() - startTime > timeout) {
          resolve(null);
          return;
        }

        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element && condition(element)) {
            console.log(`✅ Elemento encontrado via polling: ${selector}`);
            resolve(element);
            return;
          }
        }

        setTimeout(poll, interval);
      };

      poll();
    });
  }

  /**
   * Estratégia aguardando eventos específicos do DOM
   */
  private waitForDOMEvents(
    selectors: string[],
    timeout: number,
    condition: (element: Element) => boolean
  ): Promise<Element | null> {
    return new Promise((resolve) => {
      let timeoutId: NodeJS.Timeout;
      const events = ['DOMContentLoaded', 'load', 'DOMNodeInserted', 'transitionend', 'animationend'];
      
      const checkElements = () => {
        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element && condition(element)) {
            console.log(`✅ Elemento encontrado via evento DOM: ${selector}`);
            cleanup();
            resolve(element);
            return;
          }
        }
      };

      const cleanup = () => {
        events.forEach(event => {
          document.removeEventListener(event, checkElements);
        });
        clearTimeout(timeoutId);
      };

      // Escuta vários eventos do DOM
      events.forEach(event => {
        document.addEventListener(event, checkElements);
      });

      timeoutId = setTimeout(() => {
        cleanup();
        resolve(null);
      }, timeout);
    });
  }

  /**
   * Aguarda especificamente por modais
   */
  async waitForModal(modalIdentifiers: string[], timeout: number = 10000): Promise<Element | null> {
    const modalSelectors = modalIdentifiers.flatMap(id => [
      `#modal-${id}`,
      `[data-modal-id="${id}"]`,
      `[data-activity-id="${id}"]`,
      `.modal[data-id="${id}"]`
    ]).concat([
      '.modal[style*="block"]',
      '.modal.show',
      '.modal.open',
      '.modal:not([style*="none"])',
      '[role="dialog"][aria-hidden="false"]',
      '[role="dialog"]:not([aria-hidden="true"])'
    ]);

    return this.waitForElement(modalSelectors, {
      timeout,
      condition: (element) => {
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0';
      }
    });
  }

  /**
   * Aguarda por formulários específicos
   */
  async waitForForm(formIdentifiers: string[], timeout: number = 5000): Promise<HTMLFormElement | null> {
    const formSelectors = formIdentifiers.flatMap(id => [
      `#form-${id}`,
      `form[data-id="${id}"]`,
      `form[data-activity-id="${id}"]`
    ]).concat([
      'form:not([style*="none"])',
      'form[style*="block"]'
    ]);

    const element = await this.waitForElement(formSelectors, {
      timeout,
      condition: (element) => element.tagName.toLowerCase() === 'form'
    });

    return element as HTMLFormElement | null;
  }

  /**
   * Limpa todos os observers ativos
   */
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Exporta instância singleton para uso fácil
export const elementWaiter = ElementWaiter.getInstance();

// Funções de conveniência
export const waitForElement = (selectors: string | string[], options?: WaitOptions) => 
  elementWaiter.waitForElement(selectors, options);

export const waitForModal = (modalIds: string[], timeout?: number) => 
  elementWaiter.waitForModal(modalIds, timeout);

export const waitForForm = (formIds: string[], timeout?: number) => 
  elementWaiter.waitForForm(formIds, timeout);
