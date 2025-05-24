// Funções de persistência e utilitários

// Exemplo de função de persistência para o estado de um componente
export function saveComponentState(componentId: string, state: any): void {
  try {
    localStorage.setItem(`component_state_${componentId}`, JSON.stringify(state));
  } catch (error) {
    console.error('Erro ao salvar estado do componente:', error);
  }
}

export function loadComponentState(componentId: string, defaultState: any): any {
  try {
    const savedState = localStorage.getItem(`component_state_${componentId}`);
    return savedState ? JSON.parse(savedState) : defaultState;
  } catch (error) {
    console.error('Erro ao carregar estado do componente:', error);
    return defaultState;
  }
}

// Funções específicas para persistir a ordem dos atalhos
export function persistAtalhoOrder(orderArray: number[]): void {
  try {
    localStorage.setItem('atalho_school_order', JSON.stringify(orderArray));
  } catch (error) {
    console.error('Erro ao salvar ordem dos atalhos:', error);
  }
}

export function getStoredAtalhoOrder(): number[] | null {
  try {
    const savedOrder = localStorage.getItem('atalho_school_order');
    return savedOrder ? JSON.parse(savedOrder) : null;
  } catch (error) {
    console.error('Erro ao carregar ordem dos atalhos:', error);
    return null;
  }
}