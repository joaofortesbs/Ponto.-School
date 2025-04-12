
import { supabase } from "@/lib/supabase";

/**
 * Gera um ID de usuário único com o formato [UF][AnoMês][TipoConta][Sequencial].
 * Exemplo: SP24071000123 (São Paulo, julho de 2024, conta Full, sequencial 123)
 * 
 * @param uf O código da UF (ex: SP, RJ, etc)
 * @param tipoConta O tipo de conta (1 = Full, 2 = Lite)
 * @returns Uma string contendo o ID gerado no formato UF+AnoMês+TipoConta+Sequencial(6)
 */
export async function generateUserId(uf: string, tipoConta: number): Promise<string> {
  // Obtém o ano/mês atual no formato AAMM (ex: 2407 para julho de 2024)
  const dataAtual = new Date();
  const anoMes = `${dataAtual.getFullYear().toString().slice(-2)}${(dataAtual.getMonth() + 1).toString().padStart(2, '0')}`;
  
  try {
    // Inicia uma transação para garantir atomicidade
    const { data, error: selectError } = await supabase
      .from('user_id_control')
      .select('next_id')
      .eq('uf', uf)
      .eq('ano_mes', anoMes)
      .eq('tipo_conta', tipoConta)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error("Erro ao buscar next_id:", selectError);
      return generateFallbackUserId(uf, tipoConta, anoMes);
    }

    let nextId;
    
    if (!data) {
      // Se não existe registro para esta combinação, cria um novo começando com 1
      const { data: insertData, error: insertError } = await supabase
        .from('user_id_control')
        .insert([
          { uf, ano_mes: anoMes, tipo_conta: tipoConta, next_id: 2 } // Já seta para 2 pois usaremos 1
        ])
        .select();

      if (insertError) {
        console.error("Erro ao inserir novo controle de ID:", insertError);
        return generateFallbackUserId(uf, tipoConta, anoMes);
      }
      
      nextId = 1; // Primeiro ID para esta combinação
    } else {
      // Se já existe um registro, incrementa o next_id
      nextId = data.next_id;
      
      const { error: updateError } = await supabase
        .from('user_id_control')
        .update({ next_id: nextId + 1 })
        .eq('uf', uf)
        .eq('ano_mes', anoMes)
        .eq('tipo_conta', tipoConta);

      if (updateError) {
        console.error("Erro ao atualizar next_id:", updateError);
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
