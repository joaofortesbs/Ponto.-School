
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Interfaces
export interface FocoPrincipal {
  titulo: string;
  descricao: string;
  disciplinas: string[];
  tempoTotal: string;
  dicaMentor?: string;
  sentimento?: string;
}

export interface Atividade {
  id: number;
  titulo: string;
  tipo: "video" | "exercicio" | "revisao" | "tarefa";
  tempo: string;
  prazo: string;
  urgente: boolean;
  concluido: boolean;
  progresso: number;
}

export interface FocoDoDia {
  id?: string;
  userId: string;
  focoPrincipal: FocoPrincipal;
  atividades: Atividade[];
  todasConcluidas?: boolean;
  criadoEm?: string;
  atualizadoEm?: string;
}

// Função para salvar o foco do dia no Supabase
export const salvarFocoDia = async (focoDia: FocoDia): Promise<FocoDia | null> => {
  try {
    if (!focoDia.userId) {
      console.error("UserId é obrigatório para salvar o foco do dia");
      return null;
    }

    // Verificar se já existe um foco para o usuário hoje
    const dataHoje = new Date();
    dataHoje.setHours(0, 0, 0, 0);
    
    const { data: focosExistentes, error: errorConsulta } = await supabase
      .from("user_focus")
      .select("*")
      .eq("user_id", focoDia.userId)
      .gte("created_at", dataHoje.toISOString())
      .order("created_at", { ascending: false })
      .limit(1);
    
    if (errorConsulta) {
      console.error("Erro ao consultar focos existentes:", errorConsulta);
      // Prosseguir e tentar criar um novo
    }
    
    // Limpar e validar os dados antes de salvar
    const dadosValidados = {
      title: focoDia.focoPrincipal.titulo || "Foco de Estudo",
      description: focoDia.focoPrincipal.descricao || "Organizar suas atividades de estudo",
      disciplines: Array.isArray(focoDia.focoPrincipal.disciplinas) ? 
        focoDia.focoPrincipal.disciplinas : [],
      study_time: typeof focoDia.focoPrincipal.tempoTotal === 'string' ?
        parseInt(focoDia.focoPrincipal.tempoTotal.replace(/\D/g, '')) || 120 : 120,
      tasks: Array.isArray(focoDia.atividades) ? 
        focoDia.atividades.map(atividade => ({
          ...atividade,
          id: atividade.id || Date.now() + Math.floor(Math.random() * 1000),
          titulo: atividade.titulo || "Atividade sem título",
          tipo: atividade.tipo || "tarefa",
          tempo: atividade.tempo || "30min",
          prazo: atividade.prazo || "hoje",
          urgente: typeof atividade.urgente === 'boolean' ? atividade.urgente : false,
          concluido: typeof atividade.concluido === 'boolean' ? atividade.concluido : false,
          progresso: typeof atividade.progresso === 'number' ? atividade.progresso : 0
        })) : [],
      emotional_state: focoDia.focoPrincipal.sentimento || "Motivado(a)",
      completed: focoDia.todasConcluidas || false,
      mentor_tip: focoDia.focoPrincipal.dicaMentor || ""
    };
    
    // Se já existe um foco hoje, atualizar ao invés de criar novo
    if (focosExistentes && focosExistentes.length > 0) {
      const focoExistente = focosExistentes[0];
      
      const { data, error } = await supabase
        .from("user_focus")
        .update({
          ...dadosValidados,
          updated_at: new Date().toISOString()
        })
        .eq("id", focoExistente.id)
        .select()
        .single();
        
      if (error) {
        console.error("Erro ao atualizar foco do dia:", error);
        salvarFocoNoLocalStorage(focoDia);
        return focoDia;
      }
      
      console.log("Foco do dia atualizado com sucesso:", data);
      return converterDBParaFocoDia(data);
    }
    
    // Criar novo foco
    const { data, error } = await supabase
      .from("user_focus")
      .insert({
        user_id: focoDia.userId,
        ...dadosValidados
      })
      .select()
      .single();
      
    if (error) {
      console.error("Erro ao salvar foco do dia:", error);
      salvarFocoNoLocalStorage(focoDia);
      return focoDia;
    }
    
    console.log("Foco do dia salvo com sucesso:", data);
    
    // Notificar outros componentes sobre a atualização do foco
    try {
      window.dispatchEvent(new CustomEvent('foco-dia-atualizado', { 
        detail: { focoDia: converterDBParaFocoDia(data) }
      }));
    } catch (e) {
      console.warn("Não foi possível emitir evento de atualização:", e);
    }
    
    return converterDBParaFocoDia(data);
    
  } catch (error) {
    console.error("Erro ao salvar foco do dia:", error);
    salvarFocoNoLocalStorage(focoDia);
    return focoDia;
  }
};

// Função para obter o foco do dia atual do usuário
export const obterFocoDia = async (userId: string): Promise<FocoDia | null> => {
  try {
    if (!userId) {
      console.error("UserId é obrigatório para obter o foco do dia");
      return obterFocoDoLocalStorage();
    }
    
    // Obter a data de hoje (sem horas/minutos/segundos)
    const dataHoje = new Date();
    dataHoje.setHours(0, 0, 0, 0);
    
    const { data, error } = await supabase
      .from("user_focus")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", dataHoje.toISOString())
      .order("created_at", { ascending: false })
      .limit(1);
      
    if (error) {
      console.error("Erro ao obter foco do dia:", error);
      return obterFocoDoLocalStorage();
    }
    
    if (data && data.length > 0) {
      return converterDBParaFocoDia(data[0]);
    }
    
    // Se não encontrou nenhum foco do dia no banco, tentar obter do localStorage
    return obterFocoDoLocalStorage();
    
  } catch (error) {
    console.error("Erro ao obter foco do dia:", error);
    return obterFocoDoLocalStorage();
  }
};

// Função para atualizar o status de conclusão de uma atividade
export const atualizarStatusAtividade = async (
  userId: string, 
  atividadeId: number, 
  concluido: boolean
): Promise<boolean> => {
  try {
    // Obter o foco do dia atual
    const focoDia = await obterFocoDia(userId);
    
    if (!focoDia) {
      console.error("Não foi possível encontrar o foco do dia para atualizar a atividade");
      return false;
    }
    
    // Atualizar a atividade específica
    const atividadesAtualizadas = focoDia.atividades.map(ativ => 
      ativ.id === atividadeId ? { ...ativ, concluido } : ativ
    );
    
    // Verificar se todas as atividades foram concluídas
    const todasConcluidas = atividadesAtualizadas.length > 0 && 
      atividadesAtualizadas.every(ativ => ativ.concluido);
    
    // Salvar atualização no banco de dados
    const focoAtualizado: FocoDia = {
      ...focoDia,
      atividades: atividadesAtualizadas,
      todasConcluidas
    };
    
    const resultado = await salvarFocoDia(focoAtualizado);
    
    // Mesmo que falhe no banco, atualizar o localStorage
    salvarFocoNoLocalStorage(focoAtualizado);
    
    return resultado !== null;
    
  } catch (error) {
    console.error("Erro ao atualizar status da atividade:", error);
    return false;
  }
};

// Funções auxiliares de armazenamento local
const salvarFocoNoLocalStorage = (focoDia: FocoDia): void => {
  try {
    localStorage.setItem('focoDia', JSON.stringify({
      focoPrincipal: focoDia.focoPrincipal,
      atividades: focoDia.atividades,
      todasConcluidas: focoDia.todasConcluidas
    }));
  } catch (error) {
    console.error("Erro ao salvar foco no localStorage:", error);
  }
};

const obterFocoDoLocalStorage = (): FocoDia | null => {
  try {
    const focoDiaStr = localStorage.getItem('focoDia');
    if (!focoDiaStr) return null;
    
    const focoDiaData = JSON.parse(focoDiaStr);
    
    // Obter o userId atual
    const userId = obterUserIdAtual();
    
    if (!userId) return null;
    
    return {
      userId,
      focoPrincipal: focoDiaData.focoPrincipal,
      atividades: focoDiaData.atividades,
      todasConcluidas: focoDiaData.todasConcluidas || false,
      criadoEm: new Date().toISOString()
    };
  } catch (error) {
    console.error("Erro ao obter foco do localStorage:", error);
    return null;
  }
};

// Obter o ID do usuário atual
const obterUserIdAtual = (): string => {
  // Implementação simplificada para obter o ID do usuário
  // Em uma aplicação real, isso seria obtido do contexto de autenticação
  try {
    const authStr = localStorage.getItem('supabase.auth.token');
    if (authStr) {
      const authData = JSON.parse(authStr);
      return authData.currentSession?.user?.id;
    }
    return '';
  } catch (error) {
    console.error("Erro ao obter ID do usuário:", error);
    return '';
  }
};

// Converter dados do banco para o formato da aplicação
const converterDBParaFocoDia = (dbData: any): FocoDia => {
  // Calcular formato legível do tempo de estudo
  let tempoTotal = '2 horas';
  
  if (typeof dbData.study_time === 'number') {
    const horas = Math.floor(dbData.study_time / 60);
    const minutos = dbData.study_time % 60;
    
    if (horas > 0 && minutos > 0) {
      tempoTotal = `${horas}h ${minutos}min`;
    } else if (horas > 0) {
      tempoTotal = `${horas} hora${horas > 1 ? 's' : ''}`;
    } else if (minutos > 0) {
      tempoTotal = `${minutos} minutos`;
    }
  }
  
  // Validar atividades para garantir que todos os campos necessários existam
  const atividades = Array.isArray(dbData.tasks) ? 
    dbData.tasks.map((atividade: any) => ({
      id: atividade.id || Date.now() + Math.floor(Math.random() * 1000),
      titulo: atividade.titulo || "Atividade sem título",
      tipo: atividade.tipo || "tarefa",
      tempo: atividade.tempo || "30min",
      prazo: atividade.prazo || "hoje",
      urgente: typeof atividade.urgente === 'boolean' ? atividade.urgente : false,
      concluido: typeof atividade.concluido === 'boolean' ? atividade.concluido : false,
      progresso: typeof atividade.progresso === 'number' ? atividade.progresso : 0
    })) : [];
  
  // Construir o objeto de foco do dia
  return {
    id: dbData.id,
    userId: dbData.user_id,
    focoPrincipal: {
      titulo: dbData.title || "Foco de Estudo",
      descricao: dbData.description || "Organizar suas atividades de estudo",
      disciplinas: Array.isArray(dbData.disciplines) ? dbData.disciplines : [],
      tempoTotal,
      dicaMentor: dbData.mentor_tip || gerarDicaMentor(dbData.emotional_state),
      sentimento: dbData.emotional_state || "Motivado(a)"
    },
    atividades: atividades,
    todasConcluidas: dbData.completed || false,
    criadoEm: dbData.created_at,
    atualizadoEm: dbData.updated_at
  };
};

// Função para gerar dica do mentor baseada no estado emocional
function gerarDicaMentor(estado?: string): string {
  const dicas: Record<string, string[]> = {
    "Motivado(a)": [
      "Aproveite seu ânimo atual para focar nos tópicos mais desafiadores primeiro!",
      "Sua motivação é um excelente combustível! Defina metas um pouco mais ambiciosas hoje.",
      "Que bom que está motivado(a)! Aproveite para avançar nas matérias que você normalmente acha mais difíceis."
    ],
    "Um pouco perdido(a)": [
      "Divida seu estudo em etapas menores e comemore cada progresso.",
      "Comece com algo simples para ganhar confiança, depois avance para tarefas mais complexas.",
      "Sentir-se perdido(a) é normal. Organize suas prioridades e foque em uma tarefa de cada vez."
    ],
    "Cansado(a)": [
      "Alterne entre tópicos diferentes a cada 30 minutos para manter o foco.",
      "Faça pausas curtas e frequentes. A técnica Pomodoro pode ajudar bastante!",
      "Priorize tarefas que exigem menos energia mental e deixe as mais complexas para quando estiver descansado(a)."
    ],
    "Ansioso(a)": [
      "Pratique 2 minutos de respiração profunda antes de cada sessão de estudo.",
      "Comece com pequenas tarefas para criar uma sensação de realização e reduzir a ansiedade.",
      "Divida grandes tarefas em partes menores e gerencie uma de cada vez."
    ]
  };

  if (!estado || !dicas[estado]) {
    return "Estabeleça pequenas metas e celebre cada conquista no seu estudo.";
  }

  const estadoDicas = dicas[estado];
  return estadoDicas[Math.floor(Math.random() * estadoDicas.length)];
}
