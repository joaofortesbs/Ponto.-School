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
 * Gera um ID único para usuários baseado em timestamp e valores aleatórios
 */
export const generateUserId = (planType?: string): string => {
  // Valores padrão
  const countryCode = "BR";
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

  // Determinar o tipo de plano (1 para premium, 2 para lite/básico)
  const planNumber = planType?.toLowerCase() === 'premium' ? '1' : '2';

  // Formato: BR + tipo de plano + timestamp parcial + número aleatório
  return `${countryCode}${planNumber}${timestamp.toString().slice(-6)}${random}`;
};

/**
 * Versão simples para gerar IDs de usuário
 */
export const generateSimpleUserId = (prefix: string, planNumber: string): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${planNumber}${timestamp.toString().slice(-6)}${random}`;
};

//Removing conflicting functions
//export const generateUserIdSupabase = async (planType: string): Promise<string> => { ... }
//export function generateUserId(): string { ... }
//export function isValidUserId(id: string): boolean { ... }
//export function generateUserId(seed?: string): string { ... }
//export function isValidUserId(id: string): boolean { ... }