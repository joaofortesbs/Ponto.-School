
import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Gera um ID único para usuário baseado no código do país e tipo de plano.
 * @param countryCode O código do país (BR, US, etc)
 * @param planType O tipo de plano (1 = Premium, 2 = Standard, etc)
 * @returns Uma string contendo o ID gerado no formato BRXXXXXXXXXXXX
 */
export async function generateUserId(countryCode: string = 'BR', planType: number = 1): Promise<string> {
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
export function generateSimpleUserId(countryCode: string = 'BR', planType: number = 1): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${countryCode}${planType}${timestamp.toString().slice(-6)}${random}`;
}

/**
 * Gera um ID único para usuário no formato alternativo.
 * O formato é: UID-XXXX-XXXX-XXXX onde X é um caractere alfanumérico
 */
export function generateFormattedUserId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  // Função para gerar um bloco de 4 caracteres aleatórios
  const generateBlock = () => {
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Formato UID-XXXX-XXXX-XXXX
  return `UID-${generateBlock()}-${generateBlock()}-${generateBlock()}`;
}

/**
 * Função alternativa que usa uuid v4 para garantir unicidade
 */
export function generateUUIDBasedUserId(): string {
  return uuidv4();
}
