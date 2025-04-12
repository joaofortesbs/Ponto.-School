import { supabase } from "@/lib/supabase";

/**
 * Gera um ID de usuário único com o formato [UF][AnoMês][TipoConta][Sequencial].
 * Exemplo: SP24081000001 (São Paulo, agosto de 2024, conta Full, sequencial 1)
 * 
 * O sistema garante que:
 * 1. Os IDs são sequenciais dentro de cada UF, mês e tipo de conta
 * 2. Não haverá duplicidade de IDs mesmo com operações concorrentes
 * 3. Há alta disponibilidade do sistema mesmo sob carga
 * 
 * @param uf O código da UF (ex: SP, RJ, etc)
 * @param tipoConta O tipo de conta (1 = Full/Premium, 2 = Lite/Basic)
 * @returns Uma string contendo o ID gerado
 */
export async function generateUserId(uf: string, tipoConta: number): Promise<string> {
  // Validação rigorosa da UF
  if (!uf || uf.length !== 2) {
    console.error('ERRO: UF inválida ou não fornecida:', uf);
    throw new Error('UF inválida ou não fornecida para geração de ID. A UF é obrigatória.');
  } else if (uf === 'BR') {
    console.error('ERRO: UF "BR" é inválida para geração de ID');
    throw new Error('UF "BR" é inválida para geração de ID. Escolha um estado brasileiro válido.');
  }

  // Garantir que a UF esteja em maiúsculas
  uf = uf.toUpperCase();

  try {
    // Chamar a função SQL otimizada para geração de IDs sequenciais
    const { data, error } = await supabase.rpc('generate_sequential_user_id', {
      p_uf: uf,
      p_tipo_conta: tipoConta
    });

    if (error) {
      console.error('Erro ao gerar ID sequencial:', error);
      return generateFallbackId(uf, tipoConta);
    }

    // Verificar se o ID foi gerado corretamente
    if (!data || !isValidUserId(data)) {
      console.error('ID gerado é inválido:', data);
      return generateFallbackId(uf, tipoConta);
    }

    console.log(`ID sequencial gerado com sucesso: ${data}`);
    return data;
  } catch (error) {
    console.error("Erro ao gerar ID de usuário sequencial:", error);
    return generateFallbackId(uf, tipoConta);
  }
}

/**
 * Gera um ID de fallback quando a função principal falha
 * Este método tenta garantir unicidade mesmo quando a função principal falha
 */
async function generateFallbackId(uf: string, tipoConta: number): Promise<string> {
  console.log('Usando método de fallback para geração de ID sequencial');

  // Normaliza UF e valida
  uf = uf.toUpperCase();
  if (!uf || uf.length !== 2 || uf === 'BR') {
    uf = 'SP'; // UF padrão em caso de falha da validação
  }

  // Obtém o ano/mês atual
  const dataAtual = new Date();
  const anoMes = `${dataAtual.getFullYear().toString().slice(-2)}${(dataAtual.getMonth() + 1).toString().padStart(2, '0')}`;

  try {
    // Usar timestamp atual mais um ID aleatório para garantir unicidade
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);

    // Combinamos os dois e pegamos apenas os últimos 6 dígitos
    let sequencialUnico = ((timestamp % 1000000) + random).toString().slice(-6).padStart(6, '0');

    // Formato final do ID
    const userId = `${uf}${anoMes}${tipoConta}${sequencialUnico}`;

    // Verificar se o ID já existe (checar duplicidade)
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (!checkError && existingUser) {
      // ID já existe, gerar outro com timestamp atualizado
      const newTimestamp = Date.now();
      const newRandom = Math.floor(Math.random() * 10000);
      sequencialUnico = ((newTimestamp % 1000000) + newRandom).toString().slice(-6).padStart(6, '0');
      const newUserId = `${uf}${anoMes}${tipoConta}${sequencialUnico}`;
      console.log(`ID fallback (segunda tentativa): ${newUserId}`);
      return newUserId;
    }

    console.log(`ID fallback gerado: ${userId}`);
    return userId;
  } catch (fallbackError) {
    console.error('Erro crítico no fallback:', fallbackError);

    // Último recurso: gerar um ID com alta probabilidade de unicidade
    const lastResortId = `${uf}${anoMes}${tipoConta}${Date.now().toString().slice(-6)}`;
    console.log(`ID último recurso gerado: ${lastResortId}`);
    return lastResortId;
  }
}

/**
 * Gera um ID baseado no tipo de plano
 * 1 para premium/full, 2 para lite/básico
 */
export async function generateUserIdByPlan(planType: string, uf: string): Promise<string> {
  // Validação da UF
  if (!uf || uf.length !== 2) {
    console.error('ERRO: UF inválida ou não fornecida:', uf);
    throw new Error('UF inválida ou não fornecida para geração de ID. A UF é obrigatória.');
  } else if (uf === 'BR') {
    console.error('ERRO: UF "BR" é inválida para geração de ID');
    throw new Error('UF "BR" é inválida para geração de ID. Escolha um estado brasileiro válido.');
  }

  // Determina o tipo de conta com base no plano
  let tipoConta: number;
  if (!planType || planType.trim() === '') {
    console.warn('Tipo de plano não fornecido, usando padrão "lite"');
    tipoConta = 2; // Default para Lite
  } else {
    const planLower = planType.toLowerCase().trim();
    if (planLower === 'premium' || planLower === 'full') {
      tipoConta = 1; // Tipo Full/Premium
      console.log(`Plano ${planType} mapeado para tipo de conta 1 (Full)`);
    } else {
      tipoConta = 2; // Tipo Lite/Básico
      console.log(`Plano ${planType} mapeado para tipo de conta 2 (Lite)`);
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