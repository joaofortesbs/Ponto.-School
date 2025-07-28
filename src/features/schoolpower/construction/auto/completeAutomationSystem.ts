
import { ActionPlanItem } from '../../../schoolpower/actionplan/ActionPlanCard';

// Interface para dados estruturados da IA
interface IAActivityData {
  titulo: string;
  descricao: string;
  objetivo_aprendizado: string;
  disciplina: string;
  dificuldade: string;
  entrega: string;
  duracao: string;
  materiais: string;
  conteudo_especifico?: string;
  criterios_avaliacao?: string;
  metodologia?: string;
  recursos_necessarios?: string;
}

// Mapeamento de campos para cada tipo de atividade
const ACTIVITY_FIELD_MAPS: Record<string, Record<string, string>> = {
  'lista-exercicios': {
    titulo: '#titulo-input, [name="titulo"], input[placeholder*="título"], input[placeholder*="Título"]',
    descricao: '#descricao-area, [name="descricao"], textarea[placeholder*="descrição"], textarea[placeholder*="Descrição"]',
    objetivo_aprendizado: '#objetivo-input, [name="objetivo"], input[placeholder*="objetivo"], input[placeholder*="Objetivo"]',
    disciplina: '#disciplina-select, [name="disciplina"], select[placeholder*="disciplina"], select[placeholder*="Disciplina"]',
    dificuldade: '#nivel-select, [name="dificuldade"], select[placeholder*="dificuldade"], select[placeholder*="Dificuldade"]',
    entrega: '#formato-select, [name="entrega"], select[placeholder*="entrega"], select[placeholder*="Entrega"]',
    duracao: '#tempo-select, [name="duracao"], select[placeholder*="duração"], select[placeholder*="Duração"]',
    materiais: '#materiais-area, [name="materiais"], textarea[placeholder*="materiais"], textarea[placeholder*="Materiais"]',
    conteudo_especifico: '#conteudo-area, [name="conteudo"], textarea[placeholder*="conteúdo"], textarea[placeholder*="Conteúdo"]'
  },
  'prova': {
    titulo: '#titulo-input, [name="titulo"], input[placeholder*="título"], input[placeholder*="Título"]',
    descricao: '#descricao-area, [name="descricao"], textarea[placeholder*="descrição"], textarea[placeholder*="Descrição"]',
    objetivo_aprendizado: '#objetivo-input, [name="objetivo"], input[placeholder*="objetivo"], input[placeholder*="Objetivo"]',
    disciplina: '#disciplina-select, [name="disciplina"], select[placeholder*="disciplina"], select[placeholder*="Disciplina"]',
    dificuldade: '#nivel-select, [name="dificuldade"], select[placeholder*="dificuldade"], select[placeholder*="Dificuldade"]',
    duracao: '#tempo-select, [name="duracao"], select[placeholder*="duração"], select[placeholder*="Duração"]',
    criterios_avaliacao: '#criterios-area, [name="criterios"], textarea[placeholder*="critério"], textarea[placeholder*="Critério"]',
    materiais: '#materiais-area, [name="materiais"], textarea[placeholder*="materiais"], textarea[placeholder*="Materiais"]'
  },
  'revisao-guiada': {
    titulo: '#titulo-input, [name="titulo"], input[placeholder*="título"], input[placeholder*="Título"]',
    descricao: '#descricao-area, [name="descricao"], textarea[placeholder*="descrição"], textarea[placeholder*="Descrição"]',
    objetivo_aprendizado: '#objetivo-input, [name="objetivo"], input[placeholder*="objetivo"], input[placeholder*="Objetivo"]',
    disciplina: '#disciplina-select, [name="disciplina"], select[placeholder*="disciplina"], select[placeholder*="Disciplina"]',
    dificuldade: '#nivel-select, [name="dificuldade"], select[placeholder*="dificuldade"], select[placeholder*="Dificuldade"]',
    duracao: '#tempo-select, [name="duracao"], select[placeholder*="duração"], select[placeholder*="Duração"]',
    metodologia: '#metodologia-area, [name="metodologia"], textarea[placeholder*="metodologia"], textarea[placeholder*="Metodologia"]',
    materiais: '#materiais-area, [name="materiais"], textarea[placeholder*="materiais"], textarea[placeholder*="Materiais"]'
  },
  'jogos-educativos': {
    titulo: '#titulo-input, [name="titulo"], input[placeholder*="título"], input[placeholder*="Título"]',
    descricao: '#descricao-area, [name="descricao"], textarea[placeholder*="descrição"], textarea[placeholder*="Descrição"]',
    objetivo_aprendizado: '#objetivo-input, [name="objetivo"], input[placeholder*="objetivo"], input[placeholder*="Objetivo"]',
    disciplina: '#disciplina-select, [name="disciplina"], select[placeholder*="disciplina"], select[placeholder*="Disciplina"]',
    dificuldade: '#nivel-select, [name="dificuldade"], select[placeholder*="dificuldade"], select[placeholder*="Dificuldade"]',
    duracao: '#tempo-select, [name="duracao"], select[placeholder*="duração"], select[placeholder*="Duração"]',
    recursos_necessarios: '#recursos-area, [name="recursos"], textarea[placeholder*="recursos"], textarea[placeholder*="Recursos"]',
    materiais: '#materiais-area, [name="materiais"], textarea[placeholder*="materiais"], textarea[placeholder*="Materiais"]'
  },
  'sequencia-didatica': {
    titulo: '#titulo-input, [name="titulo"], input[placeholder*="título"], input[placeholder*="Título"]',
    descricao: '#descricao-area, [name="descricao"], textarea[placeholder*="descrição"], textarea[placeholder*="Descrição"]',
    objetivo_aprendizado: '#objetivo-input, [name="objetivo"], input[placeholder*="objetivo"], input[placeholder*="Objetivo"]',
    disciplina: '#disciplina-select, [name="disciplina"], select[placeholder*="disciplina"], select[placeholder*="Disciplina"]',
    dificuldade: '#nivel-select, [name="dificuldade"], select[placeholder*="dificuldade"], select[placeholder*="Dificuldade"]',
    duracao: '#tempo-select, [name="duracao"], select[placeholder*="duração"], select[placeholder*="Duração"]',
    metodologia: '#metodologia-area, [name="metodologia"], textarea[placeholder*="metodologia"], textarea[placeholder*="Metodologia"]',
    materiais: '#materiais-area, [name="materiais"], textarea[placeholder*="materiais"], textarea[placeholder*="Materiais"]'
  },
  'texto-apoio': {
    titulo: '#titulo-input, [name="titulo"], input[placeholder*="título"], input[placeholder*="Título"]',
    descricao: '#descricao-area, [name="descricao"], textarea[placeholder*="descrição"], textarea[placeholder*="Descrição"]',
    objetivo_aprendizado: '#objetivo-input, [name="objetivo"], input[placeholder*="objetivo"], input[placeholder*="Objetivo"]',
    disciplina: '#disciplina-select, [name="disciplina"], select[placeholder*="disciplina"], select[placeholder*="Disciplina"]',
    dificuldade: '#nivel-select, [name="dificuldade"], select[placeholder*="dificuldade"], select[placeholder*="Dificuldade"]',
    duracao: '#tempo-select, [name="duracao"], select[placeholder*="duração"], select[placeholder*="Duração"]',
    conteudo_especifico: '#conteudo-area, [name="conteudo"], textarea[placeholder*="conteúdo"], textarea[placeholder*="Conteúdo"]',
    materiais: '#materiais-area, [name="materiais"], textarea[placeholder*="materiais"], textarea[placeholder*="Materiais"]'
  },
  'exemplos-contextualizados': {
    titulo: '#titulo-input, [name="titulo"], input[placeholder*="título"], input[placeholder*="Título"]',
    descricao: '#descricao-area, [name="descricao"], textarea[placeholder*="descrição"], textarea[placeholder*="Descrição"]',
    objetivo_aprendizado: '#objetivo-input, [name="objetivo"], input[placeholder*="objetivo"], input[placeholder*="Objetivo"]',
    disciplina: '#disciplina-select, [name="disciplina"], select[placeholder*="disciplina"], select[placeholder*="Disciplina"]',
    dificuldade: '#nivel-select, [name="dificuldade"], select[placeholder*="dificuldade"], select[placeholder*="Dificuldade"]',
    duracao: '#tempo-select, [name="duracao"], select[placeholder*="duração"], select[placeholder*="Duração"]',
    conteudo_especifico: '#conteudo-area, [name="conteudo"], textarea[placeholder*="conteúdo"], textarea[placeholder*="Conteúdo"]',
    materiais: '#materiais-area, [name="materiais"], textarea[placeholder*="materiais"], textarea[placeholder*="Materiais"]'
  },
  'mapa-mental': {
    titulo: '#titulo-input, [name="titulo"], input[placeholder*="título"], input[placeholder*="Título"]',
    descricao: '#descricao-area, [name="descricao"], textarea[placeholder*="descrição"], textarea[placeholder*="Descrição"]',
    objetivo_aprendizado: '#objetivo-input, [name="objetivo"], input[placeholder*="objetivo"], input[placeholder*="Objetivo"]',
    disciplina: '#disciplina-select, [name="disciplina"], select[placeholder*="disciplina"], select[placeholder*="Disciplina"]',
    dificuldade: '#nivel-select, [name="dificuldade"], select[placeholder*="dificuldade"], select[placeholder*="Dificuldade"]',
    duracao: '#tempo-select, [name="duracao"], select[placeholder*="duração"], select[placeholder*="Duração"]',
    recursos_necessarios: '#recursos-area, [name="recursos"], textarea[placeholder*="recursos"], textarea[placeholder*="Recursos"]',
    materiais: '#materiais-area, [name="materiais"], textarea[placeholder*="materiais"], textarea[placeholder*="Materiais"]'
  },
  'proposta-redacao': {
    titulo: '#titulo-input, [name="titulo"], input[placeholder*="título"], input[placeholder*="Título"]',
    descricao: '#descricao-area, [name="descricao"], textarea[placeholder*="descrição"], textarea[placeholder*="Descrição"]',
    objetivo_aprendizado: '#objetivo-input, [name="objetivo"], input[placeholder*="objetivo"], input[placeholder*="Objetivo"]',
    disciplina: '#disciplina-select, [name="disciplina"], select[placeholder*="disciplina"], select[placeholder*="Disciplina"]',
    dificuldade: '#nivel-select, [name="dificuldade"], select[placeholder*="dificuldade"], select[placeholder*="Dificuldade"]',
    duracao: '#tempo-select, [name="duracao"], select[placeholder*="duração"], select[placeholder*="Duração"]',
    criterios_avaliacao: '#criterios-area, [name="criterios"], textarea[placeholder*="critério"], textarea[placeholder*="Critério"]',
    materiais: '#materiais-area, [name="materiais"], textarea[placeholder*="materiais"], textarea[placeholder*="Materiais"]'
  },
  'criterios-avaliacao': {
    titulo: '#titulo-input, [name="titulo"], input[placeholder*="título"], input[placeholder*="Título"]',
    descricao: '#descricao-area, [name="descricao"], textarea[placeholder*="descrição"], textarea[placeholder*="Descrição"]',
    objetivo_aprendizado: '#objetivo-input, [name="objetivo"], input[placeholder*="objetivo"], input[placeholder*="Objetivo"]',
    disciplina: '#disciplina-select, [name="disciplina"], select[placeholder*="disciplina"], select[placeholder*="Disciplina"]',
    dificuldade: '#nivel-select, [name="dificuldade"], select[placeholder*="dificuldade"], select[placeholder*="Dificuldade"]',
    criterios_avaliacao: '#criterios-area, [name="criterios"], textarea[placeholder*="critério"], textarea[placeholder*="Critério"]',
    metodologia: '#metodologia-area, [name="metodologia"], textarea[placeholder*="metodologia"], textarea[placeholder*="Metodologia"]',
    materiais: '#materiais-area, [name="materiais"], textarea[placeholder*="materiais"], textarea[placeholder*="Materiais"]'
  }
};

import { waitForElement, waitForModal } from '../utils/advancedWaitForElement';

// Função para aguardar modal estar completamente aberto usando o sistema avançado
async function waitForActivityModal(activityId: string): Promise<boolean> {
  console.log(`🔍 Aguardando modal da atividade: ${activityId}`);
  
  const modal = await waitForModal([activityId], 10000);
  
  if (modal) {
    // Aguarda um pouco mais para garantir que o modal está totalmente renderizado
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`✅ Modal encontrado e aguardado para atividade: ${activityId}`);
    return true;
  }

  console.warn(`⚠️ Modal não encontrado para atividade: ${activityId}`);
  return false;
}

// Função para preencher um campo específico
async function fillField(fieldSelector: string, value: string, fieldName: string): Promise<boolean> {
  if (!value || value.trim() === '') {
    console.log(`⏭️ Valor vazio para campo ${fieldName}, pulando...`);
    return true;
  }

  try {
    // Tenta múltiplos seletores separados por vírgula
    const selectors = fieldSelector.split(',').map(s => s.trim());
    let element: Element | null = null;

    for (const selector of selectors) {
      element = await waitForElement(selector, 2000);
      if (element) break;
    }

    if (!element) {
      console.warn(`⚠️ Campo não encontrado: ${fieldName} (seletores: ${fieldSelector})`);
      return false;
    }

    const input = element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    
    // Limpa o campo primeiro
    input.value = '';
    input.focus();
    
    // Define o valor
    input.value = value;
    
    // Dispara eventos para garantir que o React/Vue detecte a mudança
    const events = [
      new Event('input', { bubbles: true }),
      new Event('change', { bubbles: true }),
      new Event('blur', { bubbles: true }),
      new KeyboardEvent('keyup', { bubbles: true })
    ];

    events.forEach(event => input.dispatchEvent(event));
    
    // Aguarda um pouco para garantir que os eventos foram processados
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log(`✅ Campo preenchido: ${fieldName} = "${value}"`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao preencher campo ${fieldName}:`, error);
    return false;
  }
}

// Função para preencher todos os campos de uma atividade
async function fillActivityFields(activityType: string, iaData: IAActivityData): Promise<boolean> {
  const fieldMap = ACTIVITY_FIELD_MAPS[activityType];
  
  if (!fieldMap) {
    console.warn(`⚠️ Mapeamento de campos não encontrado para tipo: ${activityType}`);
    return false;
  }

  console.log(`🔄 Preenchendo campos para atividade tipo: ${activityType}`);
  
  let successCount = 0;
  let totalFields = 0;

  for (const [fieldName, selector] of Object.entries(fieldMap)) {
    totalFields++;
    const value = iaData[fieldName as keyof IAActivityData];
    
    if (value) {
      const success = await fillField(selector, value, fieldName);
      if (success) successCount++;
    } else {
      console.log(`⏭️ Campo ${fieldName} não tem valor nos dados da IA`);
      successCount++; // Considera como sucesso se não há valor para preencher
    }
  }

  const successRate = (successCount / totalFields) * 100;
  console.log(`📊 Taxa de sucesso no preenchimento: ${successRate.toFixed(1)}% (${successCount}/${totalFields})`);
  
  return successRate >= 70; // Considera sucesso se pelo menos 70% dos campos foram preenchidos
}

// Função para encontrar e clicar no botão de construir
async function clickConstructButton(activityId: string): Promise<boolean> {
  console.log(`🔍 Procurando botão construir para atividade: ${activityId}`);
  
  const buttonSelectors = [
    `#modal-${activityId} .btn-construir`,
    `#modal-${activityId} button[type="submit"]`,
    `#modal-${activityId} .btn-primary`,
    `#modal-${activityId} button:contains("Construir")`,
    `#modal-${activityId} button:contains("Gerar")`,
    `#modal-${activityId} button:contains("Criar")`,
    '.btn-construir',
    'button[type="submit"]',
    '.btn-primary:last-child',
    'button:contains("Construir")',
    'button:contains("Gerar")',
    'button:contains("Criar")'
  ];

  for (const selector of buttonSelectors) {
    try {
      const button = await waitForElement(selector, 2000);
      if (button && !button.hasAttribute('disabled')) {
        console.log(`✅ Botão encontrado: ${selector}`);
        (button as HTMLButtonElement).click();
        console.log(`🎯 Botão clicado com sucesso!`);
        return true;
      }
    } catch (error) {
      console.log(`⏭️ Botão não encontrado com seletor: ${selector}`);
    }
  }

  console.warn(`⚠️ Nenhum botão construir encontrado para atividade: ${activityId}`);
  return false;
}

// Função para gerar dados da IA para uma atividade
function generateIADataForActivity(activity: ActionPlanItem, contextualizationData: any): IAActivityData {
  const baseData: IAActivityData = {
    titulo: activity.title || `Atividade de ${activity.category}`,
    descricao: activity.description || `Descrição da atividade de ${activity.category}`,
    objetivo_aprendizado: `Desenvolver conhecimentos em ${activity.category}`,
    disciplina: contextualizationData?.materias || 'Geral',
    dificuldade: activity.difficulty || 'Média',
    entrega: 'Digital',
    duracao: activity.duration || '50 minutos',
    materiais: 'Caderno, caneta, material de apoio'
  };

  // Personalização baseada no tipo de atividade
  switch (activity.id) {
    case 'lista-exercicios':
      return {
        ...baseData,
        conteudo_especifico: `Lista de exercícios sobre ${activity.category} com questões práticas e teóricas.`
      };
    
    case 'prova':
      return {
        ...baseData,
        criterios_avaliacao: 'Avaliação baseada em critérios de compreensão, aplicação prática e análise crítica.'
      };
    
    case 'revisao-guiada':
      return {
        ...baseData,
        metodologia: 'Revisão estruturada com etapas progressivas de compreensão e fixação do conteúdo.'
      };
    
    case 'jogos-educativos':
      return {
        ...baseData,
        recursos_necessarios: 'Material lúdico, cartas educativas, tabuleiro ou plataforma digital.'
      };
    
    case 'sequencia-didatica':
      return {
        ...baseData,
        metodologia: 'Sequência estruturada em etapas: introdução, desenvolvimento, prática e avaliação.'
      };
    
    case 'texto-apoio':
      return {
        ...baseData,
        conteudo_especifico: `Texto de apoio estruturado sobre ${activity.category} com exemplos práticos.`
      };
    
    case 'exemplos-contextualizados':
      return {
        ...baseData,
        conteudo_especifico: `Exemplos práticos contextualizados sobre ${activity.category} relacionados ao cotidiano.`
      };
    
    case 'mapa-mental':
      return {
        ...baseData,
        recursos_necessarios: 'Software de mapas mentais, papel grande, canetas coloridas.'
      };
    
    case 'proposta-redacao':
      return {
        ...baseData,
        criterios_avaliacao: 'Avaliação de estrutura textual, coerência, coesão, gramática e criatividade.'
      };
    
    case 'criterios-avaliacao':
      return {
        ...baseData,
        criterios_avaliacao: 'Critérios claros e objetivos para avaliação do desempenho dos estudantes.',
        metodologia: 'Definição de parâmetros avaliativos transparentes e justos.'
      };
    
    default:
      return baseData;
  }
}

// Função principal para automatizar uma atividade
export async function automateActivity(
  activity: ActionPlanItem, 
  contextualizationData: any,
  retryCount: number = 0
): Promise<boolean> {
  const maxRetries = 2;
  
  console.log(`🚀 Iniciando automação da atividade: ${activity.title} (tentativa ${retryCount + 1}/${maxRetries + 1})`);
  
  try {
    // Passo 1: Clica no botão "Editar Materiais" da atividade
    const editButton = await waitForElement(`[data-activity-id="${activity.id}"] .btn-edit, .activity-card[data-id="${activity.id}"] .btn-edit, button:contains("Editar")`, 5000);
    
    if (!editButton) {
      console.error(`❌ Botão editar não encontrado para atividade: ${activity.id}`);
      return false;
    }
    
    console.log(`✅ Clicando no botão editar...`);
    (editButton as HTMLButtonElement).click();
    
    // Passo 2: Aguarda o modal abrir completamente
    const modalOpened = await waitForActivityModal(activity.id);
    if (!modalOpened) {
      console.error(`❌ Modal não abriu para atividade: ${activity.id}`);
      return false;
    }
    
    // Passo 3: Gera dados da IA para a atividade
    const iaData = generateIADataForActivity(activity, contextualizationData);
    console.log(`📝 Dados gerados para a atividade:`, iaData);
    
    // Passo 4: Preenche os campos do modal
    const fieldsFilledSuccess = await fillActivityFields(activity.id, iaData);
    if (!fieldsFilledSuccess) {
      console.error(`❌ Falha ao preencher campos da atividade: ${activity.id}`);
      
      if (retryCount < maxRetries) {
        console.log(`🔄 Tentando novamente...`);
        // Aguarda um pouco antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, 1000));
        return automateActivity(activity, contextualizationData, retryCount + 1);
      }
      
      return false;
    }
    
    // Passo 5: Aguarda um momento para garantir que todos os campos foram processados
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Passo 6: Clica no botão "Construir Atividade"
    const constructSuccess = await clickConstructButton(activity.id);
    if (!constructSuccess) {
      console.error(`❌ Falha ao clicar no botão construir da atividade: ${activity.id}`);
      return false;
    }
    
    // Passo 7: Aguarda um momento para a atividade ser processada
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`✅ Automação concluída com sucesso para atividade: ${activity.title}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Erro durante automação da atividade ${activity.id}:`, error);
    
    if (retryCount < maxRetries) {
      console.log(`🔄 Tentando novamente devido ao erro...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return automateActivity(activity, contextualizationData, retryCount + 1);
    }
    
    return false;
  }
}

// Função para automatizar todas as atividades aprovadas
export async function automateAllApprovedActivities(
  activities: ActionPlanItem[],
  contextualizationData: any
): Promise<{ success: number; total: number; results: boolean[] }> {
  console.log(`🎯 Iniciando automação de ${activities.length} atividades...`);
  
  const approvedActivities = activities.filter(activity => activity.approved);
  console.log(`📋 Atividades aprovadas para automação: ${approvedActivities.length}`);
  
  const results: boolean[] = [];
  let successCount = 0;
  
  // Processa uma atividade por vez para evitar conflitos
  for (let i = 0; i < approvedActivities.length; i++) {
    const activity = approvedActivities[i];
    console.log(`\n📌 Processando atividade ${i + 1}/${approvedActivities.length}: ${activity.title}`);
    
    const result = await automateActivity(activity, contextualizationData);
    results.push(result);
    
    if (result) {
      successCount++;
      console.log(`✅ Atividade ${i + 1} concluída com sucesso`);
    } else {
      console.log(`❌ Falha na atividade ${i + 1}`);
    }
    
    // Aguarda entre atividades para evitar sobrecarga
    if (i < approvedActivities.length - 1) {
      console.log(`⏳ Aguardando antes da próxima atividade...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log(`\n🎊 Automação finalizada! Sucessos: ${successCount}/${approvedActivities.length}`);
  
  return {
    success: successCount,
    total: approvedActivities.length,
    results
  };
}

// Função de diagnóstico para verificar elementos na página
export async function diagnoseAutomationEnvironment(): Promise<void> {
  console.log(`🔍 Iniciando diagnóstico do ambiente de automação...`);
  
  // Verifica se existem atividades na página
  const activityElements = document.querySelectorAll('[data-activity-id], .activity-card, .construction-card');
  console.log(`📊 Elementos de atividade encontrados: ${activityElements.length}`);
  
  // Verifica botões de editar
  const editButtons = document.querySelectorAll('.btn-edit, button:contains("Editar")');
  console.log(`🔘 Botões de editar encontrados: ${editButtons.length}`);
  
  // Verifica se há modais abertos
  const openModals = document.querySelectorAll('.modal[style*="block"], .modal.show, .modal.open');
  console.log(`🪟 Modais abertos: ${openModals.length}`);
  
  // Lista todos os formulários na página
  const forms = document.querySelectorAll('form');
  console.log(`📝 Formulários na página: ${forms.length}`);
  
  activityElements.forEach((el, index) => {
    const id = el.getAttribute('data-activity-id') || el.getAttribute('data-id') || `unknown-${index}`;
    console.log(`  - Atividade ${index + 1}: ID = ${id}, Classes = ${el.className}`);
  });
}
