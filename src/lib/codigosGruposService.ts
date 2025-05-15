` tags.

```
<replit_final_file>
import { supabase } from './supabase';

// Interface para códigos de grupos
export interface CodigoGrupo {
  id: string;
  codigo: string;
  grupo_id: string;
  nome_grupo: string;
  descricao: string;
  criado_por: string;
  data_criacao: string;
  ativo: boolean;
}

// Buscar todos os códigos de grupos
export async function buscarTodosCodigosGrupos(): Promise<CodigoGrupo[]> {
  try {
    const { data, error } = await supabase
      .from('codigos_grupos')
      .select('*')
      .eq('ativo', true);

    if (error) {
      console.error('Erro ao buscar códigos de grupos:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro inesperado ao buscar códigos de grupos:', error);
    return [];
  }
}

// Buscar código de grupo específico
export async function buscarCodigoGrupo(codigo: string): Promise<CodigoGrupo | null> {
  try {
    const { data, error } = await supabase
      .from('codigos_grupos')
      .select('*')
      .eq('codigo', codigo.toUpperCase())
      .eq('ativo', true)
      .single();

    if (error) {
      console.error('Erro ao buscar código de grupo:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro inesperado ao buscar código de grupo:', error);
    return null;
  }
}

// Verificar se código existe
export async function verificarSeCodigoExiste(codigo: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('codigos_grupos')
      .select('codigo')
      .eq('codigo', codigo.toUpperCase())
      .eq('ativo', true);

    if (error) {
      console.error('Erro ao verificar código:', error);
      return false;
    }

    return (data && data.length > 0) ? true : false;
  } catch (error) {
    console.error('Erro inesperado ao verificar código:', error);
    return false;
  }
}

// Criar novo código para grupo
export async function criarCodigoGrupo(novoGrupo: Omit<CodigoGrupo, 'id' | 'data_criacao'>): Promise<CodigoGrupo | null> {
  try {
    const { data, error } = await supabase
      .from('codigos_grupos')
      .insert([{ ...novoGrupo, codigo: novoGrupo.codigo.toUpperCase() }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar código de grupo:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro inesperado ao criar código de grupo:', error);
    return null;
  }
}

// Buscar grupos por termo de pesquisa
export async function buscarGruposPorTermo(termo: string): Promise<CodigoGrupo[]> {
  try {
    if (!termo || termo.trim() === '') {
      return [];
    }

    const { data, error } = await supabase
      .from('codigos_grupos')
      .select('*')
      .eq('ativo', true)
      .or(`nome_grupo.ilike.%${termo}%,descricao.ilike.%${termo}%`);

    if (error) {
      console.error('Erro ao buscar grupos por termo:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro inesperado ao buscar grupos por termo:', error);
    return [];
  }
}

// Desativar código de grupo
export async function desativarCodigoGrupo(codigo: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('codigos_grupos')
      .update({ ativo: false })
      .eq('codigo', codigo.toUpperCase());

    if (error) {
      console.error('Erro ao desativar código de grupo:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro inesperado ao desativar código de grupo:', error);
    return false;
  }
}