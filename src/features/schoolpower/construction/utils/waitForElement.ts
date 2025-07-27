
/**
 * Utilitário para aguardar que um elemento apareça no DOM
 */
export function waitForElement(selector: string, timeout: number = 10000): Promise<HTMLElement | null> {
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
 * Aguarda que múltiplos elementos estejam presentes
 */
export async function waitForElements(selectors: string[], timeout: number = 10000): Promise<HTMLElement[]> {
  const promises = selectors.map(selector => waitForElement(selector, timeout));
  const elements = await Promise.all(promises);
  return elements.filter(el => el !== null) as HTMLElement[];
}

/**
 * Aguarda que um elemento esteja visível e interativo
 */
export async function waitForInteractiveElement(selector: string, timeout: number = 10000): Promise<HTMLElement | null> {
  const element = await waitForElement(selector, timeout);
  
  if (!element) return null;

  // Aguarda o elemento estar visível
  return new Promise((resolve) => {
    const checkVisibility = () => {
      if (element.offsetParent !== null && !element.hasAttribute('disabled')) {
        resolve(element);
      } else {
        requestAnimationFrame(checkVisibility);
      }
    };
    
    checkVisibility();
    
    // Timeout de segurança
    setTimeout(() => resolve(element), timeout);
  });
}
