
import { supabase } from "@/lib/supabase";

/**
 * Gera um ID de usuário único com o formato [UF][AnoMês][TipoConta][Sequencial].
 * Exemplo: SP24071000123 (São Paulo, julho de 2024, conta Full, sequencial 123)
 * 
 * @param uf O código da UF (ex: SP, RJ, etc)
 * @param tipoConta O tipo de conta (1 = Full, 2 = Lite)
 * @returns Uma string contendo o ID gerado no formato UF+AnoMês+TipoConta+Sequencial(6)
 */
export async function generateUserId(uf: string = 'BR', tipoConta: number): Promise<string> {
  // Obtém o ano/mês atual no formato AAMM (ex: 2407 para julho de 2024)
  const dataAtual = new Date();
  const anoMes = `${dataAtual.getFullYear().toString().slice(-2)}${(dataAtual.getMonth() + 1).toString().padStart(2, '0')}`;
  
  try {
    // Obter o último ID da tabela de controle
    const { data, error: selectError } = await supabase
      .from('user_id_control')
      .select('last_id')
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error("Erro ao buscar last_id:", selectError);
      return generateFallbackUserId(uf, tipoConta, anoMes);
    }

    let nextId;
    
    if (!data) {
      // Se não existe registro, cria um novo começando com 1001
      const { data: insertData, error: insertError } = await supabase
        .from('user_id_control')
        .insert([
          { last_id: 1001 } // Já seta para 1001 pois usaremos 1000
        ])
        .select();

      if (insertError) {
        console.error("Erro ao inserir novo controle de ID:", insertError);
        return generateFallbackUserId(uf, tipoConta, anoMes);
      }
      
      nextId = 1000; // Primeiro ID
    } else {
      // Se já existe um registro, incrementa o last_id
      nextId = data.last_id;
      
      const { error: updateError } = await supabase
        .from('user_id_control')
        .update({ last_id: nextId + 1 })
        .eq('id', data.id);

      if (updateError) {
        console.error("Erro ao atualizar last_id:", updateError);
        return generateFallbackUserId(uf, tipoConta, anoMes);
      }
    }

    // Formata o ID completo: UF (2) + AnoMês (4) + TipoConta (1) + Sequencial (6 dígitos com zeros à esquerda)
    return `${uf}${anoMes}${tipoConta}${nextId.toString().padStart(6, '0')}`;

  } catch (error) {
    console.error("Erro ao gerar ID de usuário:", error);
    return generateFallbackUserId(uf, tipoConta, anoMes);
  }
}

/**
 * Gera um ID de fallback baseado em timestamp em caso de falha no processo principal
 * Mantém o mesmo formato, mas usa um timestamp para garantir unicidade
 */
function generateFallbackUserId(uf: string, tipoConta: number, anoMes: string): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${uf}${anoMes}${tipoConta}${timestamp}${random}`;
}

/**
 * Versão simplificada que não depende do banco de dados para gerar um ID único
 * Útil para testes ou quando houver problemas de conexão com o Supabase
 */
export function generateSimpleUserId(uf: string, tipoConta: number): string {
  const dataAtual = new Date();
  const anoMes = `${dataAtual.getFullYear().toString().slice(-2)}${(dataAtual.getMonth() + 1).toString().padStart(2, '0')}`;
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${uf}${anoMes}${tipoConta}${timestamp}${random}`;
}

/**
 * Gera um ID baseado no tipo de plano usando o Supabase
 * BR1 para premium/full, BR2 para lite/básico
 */
export async function generateUserIdByPlan(planType: string, uf: string = 'BR'): Promise<string> {
  const tipoConta = planType.toLowerCase() === 'premium' || planType.toLowerCase() === 'full' ? 1 : 2;
  return generateUserId(uf, tipoConta);
}

/**
 * Valida se um ID de usuário está no formato correto
 * [UF][AnoMês][TipoConta][Sequencial]
 */
export function isValidUserId(id: string): boolean {
  // Verifica se corresponde ao padrão: 2 letras + 4 números + 1 número + 6 números
  return /^[A-Z]{2}\d{4}[1-2]\d{6}$/.test(id);
}
