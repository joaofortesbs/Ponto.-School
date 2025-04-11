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
import { supabase } from './supabase';

export const generateUserIdSupabase = async (planType: string): Promise<string> => {
  // Gerar um ID baseado no tipo de plano
  // BR1 para premium, BR2 para lite/básico
  const prefix = `BR${planType === 'premium' ? '1' : '2'}`;
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 10000);
  
  const generatedId = `${prefix}-${timestamp}-${randomSuffix}`;
  
  try {
    // Verificar se o ID já existe (raro, mas possível)
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', generatedId)
      .single();
    
    if (error) {
      console.error("Error checking for existing ID record:", error);
      // Se houver erro de consulta, retornamos o ID gerado mesmo assim
      return generatedId;
    }
    
    // Se o ID já existe (extremamente improvável), gere outro
    if (data) {
      console.log("ID already exists, generating a new one");
      // Chamada recursiva com baixíssima probabilidade de execução
      return generateUserIdSupabase(planType);
    }
    
    return generatedId;
  } catch (error) {
    console.error("Error generating user ID:", error);
    // Em caso de erro, retorne o ID gerado
    return generatedId;
  }
};

/**
 * Gera um ID único para usuários baseado em timestamp e valores aleatórios
 * para garantir unicidade mesmo em caso de múltiplos registros simultâneos
 */
export function generateUserId(): string {
  // Usar timestamp para garantir sequência crescente
  const timestamp = new Date().getTime();

  // Adicionar componente aleatório para evitar colisões
  const randomComponent = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

  // Combinar os componentes em um formato único
  return `user_${timestamp}_${randomComponent}`;
}

/**
 * Valida se um ID de usuário está no formato correto
 */
export function isValidUserId(id: string): boolean {
  // Verificar se corresponde ao padrão esperado
  return /^user_\d+_\d{4}$/.test(id);
}

/**
 * Gera um ID de usuário formatado
 * @param seed String opcional para criar IDs consistentes
 * @returns ID de usuário formatado (ex: USR1234)
 */
export function generateUserId(seed?: string): string {
  let id: string;

  if (seed) {
    // Criar hash simples da seed
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0; // Converter para inteiro de 32 bits
    }
    // Converter para positivo e limitar a 4 dígitos
    id = Math.abs(hash % 10000).toString().padStart(4, '0');
  } else {
    // Gerar ID aleatório
    id = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  }

  return `USR${id}`;
}

/**
 * Verifica se uma string é um ID de usuário válido
 */
export function isValidUserId(id: string): boolean {
  return /^USR\d{4}$/.test(id);
}