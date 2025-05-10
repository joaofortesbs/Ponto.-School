
/**
 * Sistema simples de armazenamento para grupos de estudo
 * Usa localStorage como fallback quando o banco de dados falha
 */

import { supabase } from './supabase';

export interface GrupoEstudo {
  id: string;
  user_id: string;
  nome: string;
  descricao?: string;
  cor: string;
  membros: number;
  topico?: string;
  topico_nome?: string;
  topico_icon?: string;
  privado?: boolean;
  visibilidade?: string;
  codigo?: string;
  data_criacao: string;
}

// Chave para armazenamento local
const STORAGE_KEY = 'epictus_grupos_estudo';

/**
 * Salva um grupo no armazenamento local
 */
export const salvarGrupoLocal = (grupo: GrupoEstudo): void => {
  try {
    // Buscar grupos existentes
    const gruposExistentes = obterGruposLocal();
    
    // Adicionar novo grupo
    gruposExistentes.push(grupo);
    
    // Salvar no localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gruposExistentes));
    console.log('Grupo salvo localmente com sucesso', grupo);
  } catch (error) {
    console.error('Erro ao salvar grupo localmente:', error);
  }
};

/**
 * Obtém todos os grupos do armazenamento local
 */
export const obterGruposLocal = (): GrupoEstudo[] => {
  try {
    const dados = localStorage.getItem(STORAGE_KEY);
    if (!dados) return [];
    
    return JSON.parse(dados);
  } catch (error) {
    console.error('Erro ao obter grupos locais:', error);
    return [];
  }
};

/**
 * Limpa os grupos salvos localmente
 */
export const limparGruposLocal = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

/**
 * Cria um grupo no Supabase com fallback para armazenamento local
 */
export const criarGrupo = async (dados: Omit<GrupoEstudo, 'id'>): Promise<GrupoEstudo | null> => {
  try {
    // Tentar inserir no Supabase
    const { data, error } = await supabase
      .from('grupos_estudo')
      .insert(dados)
      .select('*')
      .single();
    
    if (error) {
      console.error('Erro ao criar grupo no banco de dados:', error);
      
      // Gerar ID localmente
      const id = `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Criar grupo para armazenamento local
      const grupoLocal: GrupoEstudo = {
        ...dados,
        id
      };
      
      // Salvar localmente
      salvarGrupoLocal(grupoLocal);
      
      // Mostrar notificação sobre o armazenamento local
      const element = document.createElement('div');
      element.style.position = 'fixed';
      element.style.top = '20px';
      element.style.left = '50%';
      element.style.transform = 'translateX(-50%)';
      element.style.padding = '10px 20px';
      element.style.background = '#FFA500';
      element.style.color = 'white';
      element.style.borderRadius = '4px';
      element.style.zIndex = '9999';
      element.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      element.textContent = 'Grupo salvo localmente. Será sincronizado quando o banco de dados estiver disponível.';
      document.body.appendChild(element);
      
      // Remover após 5 segundos
      setTimeout(() => {
        element.style.opacity = '0';
        element.style.transition = 'opacity 0.5s';
        setTimeout(() => {
          document.body.removeChild(element);
        }, 500);
      }, 5000);
      
      return grupoLocal;
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao criar grupo:', error);
    
    // Falha total, retornar nulo
    return null;
  }
};

/**
 * Obtém todos os grupos de estudo (do Supabase + localStorage)
 */
export const obterTodosGrupos = async (userId: string): Promise<GrupoEstudo[]> => {
  try {
    // Obter grupos do Supabase
    const { data: gruposSupabase, error } = await supabase
      .from('grupos_estudo')
      .select('*')
      .eq('user_id', userId)
      .order('data_criacao', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar grupos do banco de dados:', error);
      // Se falhar o Supabase, retornar apenas grupos locais
      return obterGruposLocal().filter(grupo => grupo.user_id === userId);
    }
    
    // Obter grupos locais
    const gruposLocais = obterGruposLocal()
      .filter(grupo => 
        grupo.user_id === userId && 
        // Filtrar apenas grupos que não estão no Supabase
        !gruposSupabase.some(g => g.id === grupo.id)
      );
    
    // Combinar ambos
    return [...gruposSupabase, ...gruposLocais];
  } catch (error) {
    console.error('Erro ao obter todos os grupos:', error);
    // Em caso de erro, retornar apenas grupos locais
    return obterGruposLocal().filter(grupo => grupo.user_id === userId);
  }
};

/**
 * Tenta sincronizar grupos locais com o banco de dados
 */
export const sincronizarGruposLocais = async (userId: string): Promise<void> => {
  try {
    const gruposLocais = obterGruposLocal()
      .filter(grupo => 
        grupo.user_id === userId && 
        grupo.id.startsWith('local_')
      );
    
    if (gruposLocais.length === 0) return;
    
    console.log(`Tentando sincronizar ${gruposLocais.length} grupos locais`);
    
    for (const grupo of gruposLocais) {
      // Remover o ID local para que o Supabase gere um novo
      const { id, ...dadosGrupo } = grupo;
      
      // Tentar inserir no Supabase
      const { error } = await supabase
        .from('grupos_estudo')
        .insert(dadosGrupo);
      
      if (!error) {
        console.log(`Grupo sincronizado com sucesso: ${grupo.nome}`);
        // Remover do armazenamento local após sincronizar
        const gruposAtualizados = obterGruposLocal().filter(g => g.id !== grupo.id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(gruposAtualizados));
      }
    }
  } catch (error) {
    console.error('Erro ao sincronizar grupos locais:', error);
  }
};
