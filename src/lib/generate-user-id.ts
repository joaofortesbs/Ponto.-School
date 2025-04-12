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
  // Validação da UF - garantir que seja uma UF válida
  if (!uf || uf.length !== 2) {
    console.warn('UF inválida ou não fornecida:', uf);
    uf = 'SP'; // Default para São Paulo se não houver UF válida
  } else if (uf === 'BR') {
    console.warn('UF "BR" é inválida, substituindo por SP');
    uf = 'SP'; // Default para São Paulo se for BR
  }

  // Garantir que a UF esteja em maiúsculas
  uf = uf.toUpperCase();

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
      // Se não existe registro, cria um novo começando com 1
      const { data: insertData, error: insertError } = await supabase
        .from('user_id_control')
        .insert([
          { last_id: 1 }
        ])
        .select();

      if (insertError) {
        console.error("Erro ao inserir novo controle de ID:", insertError);
        return generateFallbackUserId(uf, tipoConta, anoMes);
      }

      nextId = 1; // Primeiro ID
    } else {
      // Se já existe um registro, incrementa o last_id
      nextId = data.last_id + 1;

      const { error: updateError } = await supabase
        .from('user_id_control')
        .update({ last_id: nextId })
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
  // Mesmo no fallback, garantimos que a UF seja válida
  if (!uf || uf.length !== 2) {
    uf = 'SP';
  } else if (uf === 'BR') {
    uf = 'SP';
  }

  uf = uf.toUpperCase();

  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${uf}${anoMes}${tipoConta}${timestamp.toString().slice(-6)}`;
}

/**
 * Gera um ID baseado no tipo de plano usando o Supabase
 * 1 para premium/full, 2 para lite/básico
 * 
 * @param planType O tipo de plano (full, premium, lite, standard)
 * @param uf A Unidade Federativa (estado) do usuário
 * @returns Uma string contendo o ID gerado no formato UF+AnoMês+TipoConta+Sequencial(6)
 */
export async function generateUserIdByPlan(planType: string, uf: string): Promise<string> {
  // Validação da UF - garantir que seja uma UF válida
  if (!uf || uf.length !== 2) {
    console.warn('UF inválida ou não fornecida:', uf);
    uf = 'SP'; // Default para São Paulo se não houver UF válida
  } else if (uf === 'BR') {
    console.warn('UF "BR" é inválida, substituindo por SP');
    uf = 'SP'; // Default para São Paulo se for BR
  }

  // Validação e normalização do tipo de plano
  let tipoConta: number;

  if (!planType || planType.trim() === '') {
    console.warn('Tipo de plano não fornecido, usando padrão "lite"');
    tipoConta = 2; // Default para Lite
  } else {
    const planLower = planType.toLowerCase().trim();

    // Determina o tipo de conta com base no plano
    if (planLower === 'premium' || planLower === 'full') {
      tipoConta = 1; // Tipo Full/Premium
      console.log(`Plano ${planType} mapeado para tipo de conta 1 (Full)`);
    } else if (planLower === 'lite' || planLower === 'basic' || planLower === 'standard') {
      tipoConta = 2; // Tipo Lite/Básico
      console.log(`Plano ${planType} mapeado para tipo de conta 2 (Lite)`);
    } else {
      console.warn(`Tipo de plano desconhecido: ${planType}, usando padrão "lite"`);
      tipoConta = 2; // Default para tipos desconhecidos
    }
  }

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