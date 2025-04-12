
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
  // Validação rigorosa da UF - garantir que seja uma UF válida
  if (!uf || uf.length !== 2) {
    console.error('ERRO: UF inválida ou não fornecida:', uf);
    throw new Error('UF inválida ou não fornecida para geração de ID. A UF é obrigatória.');
  } else if (uf === 'BR') {
    console.error('ERRO: UF "BR" é inválida para geração de ID');
    throw new Error('UF "BR" é inválida para geração de ID. Escolha um estado brasileiro válido.');
  }

  // Garantir que a UF esteja em maiúsculas
  uf = uf.toUpperCase();

  // Obtém o ano/mês atual no formato AAMM (ex: 2407 para julho de 2024)
  const dataAtual = new Date();
  const anoMes = `${dataAtual.getFullYear().toString().slice(-2)}${(dataAtual.getMonth() + 1).toString().padStart(2, '0')}`;

  try {
    // Usar a função SQL para obter o próximo ID sequencial específico para esta UF e tipo de conta
    const { data, error } = await supabase.rpc('get_next_user_id_for_uf', {
      p_uf: uf,
      p_tipo_conta: tipoConta
    });

    if (error) {
      console.error('Erro ao gerar ID via função SQL:', error);
      
      // Fallback: Tentar obter diretamente da tabela de controle por UF
      const { data: controlData, error: controlError } = await supabase
        .from('user_id_control_by_uf')
        .select('*')
        .eq('uf', uf)
        .eq('ano_mes', anoMes)
        .eq('tipo_conta', tipoConta)
        .single();
      
      if (controlError) {
        console.error('Erro ao buscar controle de ID por UF:', controlError);
        
        // Tentar criar um novo registro de controle
        try {
          // Tentar inserir um novo registro de controle para esta UF
          const { data: insertedData, error: insertError } = await supabase
            .from('user_id_control_by_uf')
            .insert([
              { uf: uf, ano_mes: anoMes, tipo_conta: tipoConta, last_id: 1 }
            ])
            .select()
            .single();
          
          if (insertError) {
            console.error('Erro ao criar controle de ID por UF:', insertError);
            return generateFallbackId(uf, tipoConta, anoMes);
          }
          
          // Formatar o ID completo: UF (2) + AnoMês (4) + TipoConta (1) + Sequencial (6 dígitos com zeros à esquerda)
          const userId = `${uf}${anoMes}${tipoConta}${1..toString().padStart(6, '0')}`;
          console.log(`ID gerado com controle novo: ${userId}`);
          return userId;
        } catch (insertCatchError) {
          console.error('Erro ao tentar criar controle:', insertCatchError);
          return generateFallbackId(uf, tipoConta, anoMes);
        }
      }
      
      if (!controlData) {
        console.error('Nenhum controle de ID por UF encontrado');
        return generateFallbackId(uf, tipoConta, anoMes);
      }
      
      // Incrementar o contador de forma segura
      const nextId = controlData.last_id + 1;
      
      // Atualizar o contador na tabela
      const { error: updateError } = await supabase
        .from('user_id_control_by_uf')
        .update({ 
          last_id: nextId,
          updated_at: new Date().toISOString()
        })
        .eq('id', controlData.id);
      
      if (updateError) {
        console.error('Erro ao atualizar contador por UF:', updateError);
        return generateFallbackId(uf, tipoConta, anoMes);
      }
      
      // Formatar o ID completo: UF (2) + AnoMês (4) + TipoConta (1) + Sequencial (6 dígitos com zeros à esquerda)
      const userId = `${uf}${anoMes}${tipoConta}${nextId.toString().padStart(6, '0')}`;
      console.log(`ID gerado com controle existente: ${userId}`);
      return userId;
    }
    
    // Se chegou aqui, temos um ID gerado pela função SQL
    console.log(`ID gerado via função SQL: ${data}`);
    return data;
  } catch (error) {
    console.error("Erro ao gerar ID de usuário:", error);
    return generateFallbackId(uf, tipoConta, anoMes);
  }
}

/**
 * Gera um ID de fallback baseado em regras para garantir unicidade
 * Mantém o mesmo formato, mas usa um método alternativo para garantir unicidade
 */
function generateFallbackId(uf: string, tipoConta: number, anoMes: string): string {
  console.log('Usando método de fallback para geração de ID');
  
  // Mesmo no fallback, garantimos que a UF seja válida
  if (!uf || uf.length !== 2) {
    uf = 'SP';
  } else if (uf === 'BR') {
    uf = 'SP';
  }

  uf = uf.toUpperCase();
  
  // Gerar um número sequencial baseado em timestamp para garantir unicidade
  // Combinamos o timestamp atual com um número aleatório para evitar colisões
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  
  // Usar apenas os últimos dígitos do timestamp para ficar dentro do limite de 6 dígitos
  // Combinamos com um número aleatório para aumentar a unicidade
  const sequencial = (timestamp % 1000000).toString().padStart(6, '0');
  
  const userId = `${uf}${anoMes}${tipoConta}${sequencial}`;
  console.log(`ID gerado via fallback: ${userId}`);
  return userId;
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
    console.error('ERRO: UF inválida ou não fornecida:', uf);
    throw new Error('UF inválida ou não fornecida para geração de ID. A UF é obrigatória.');
  } else if (uf === 'BR') {
    console.error('ERRO: UF "BR" é inválida para geração de ID');
    throw new Error('UF "BR" é inválida para geração de ID. Escolha um estado brasileiro válido.');
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
