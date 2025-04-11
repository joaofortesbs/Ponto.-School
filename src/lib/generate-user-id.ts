import { supabase } from "@/lib/supabase";

/**
 * Gera um ID de usuário único com o formato especificado.
 * 
 * @param countryCode O código do país (ex: BR, US, etc)
 * @param planType O tipo de plano (1 = Premium, 2 = Standard, etc)
 * @returns Uma string contendo o ID gerado no formato BRXXXXXXXXXXXX
 */
export async function generateUserId(countryCode: string, planType: number): Promise<string> {
  try {
    // Tentar buscar a sequência atual
    const { data, error } = await supabase
      .from('user_id_control')
      .select('last_sequence')
      .eq('country_code', countryCode)
      .eq('plan_type', planType)
      .single();

    if (error) {
      // Em caso de erro, retornar um ID baseado em timestamp
      return `${countryCode}${planType}${Date.now().toString().slice(-10)}`;
    }

    // Incrementar o último número de sequência
    const currentSequence = data?.last_sequence || 0;
    const newSequence = currentSequence + 1;

    // Atualizar o registro com o novo número de sequência
    await supabase
      .from('user_id_control')
      .update({ last_sequence: newSequence })
      .eq('country_code', countryCode)
      .eq('plan_type', planType);

    // Formatar o ID: país (2) + tipo de plano (1) + sequência (10 dígitos com zeros à esquerda)
    const paddedSequence = newSequence.toString().padStart(10, '0');
    return `${countryCode}${planType}${paddedSequence}`;
  } catch (error) {
    // Em caso de erro, retornar um ID baseado em timestamp
    return `${countryCode}${planType}${Date.now().toString().slice(-10)}`;
  }
}

/**
 * Versão simplificada que não depende do banco de dados para gerar um ID único
 * Útil quando houver problemas de conexão com o Supabase
 */
export function generateSimpleUserId(countryCode: string, planType: number): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${countryCode}${planType}${timestamp.toString().slice(-6)}${random}`;
}

/**
 * Gera um ID único para usuário no formato esperado pela plataforma.
 * O formato é: UID-XXXX-XXXX-XXXX onde X é um caractere alfanumérico
 */
export function generateUserId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  // Função para gerar um bloco de 4 caracteres aleatórios
  const generateBlock = () => {
    let block = '';
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      block += chars[randomIndex];
    }
    return block;
  };

  // Criar o ID no formato UID-XXXX-XXXX-XXXX
  const uid = `UID-${generateBlock()}-${generateBlock()}-${generateBlock()}`;

  return uid;
}

/**
 * Verifica se um ID de usuário está no formato correto
 */
export function isValidUserId(userId: string): boolean {
  // Regex para validar o formato UID-XXXX-XXXX-XXXX onde X é alfanumérico
  const uidRegex = /^UID-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  return uidRegex.test(userId);
}