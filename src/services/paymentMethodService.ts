
import { supabase } from '@/lib/supabase';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'pix' | 'bank_transfer';
  card_type?: 'credit' | 'debit';
  brand?: string;
  last4?: string;
  exp_month?: string;
  exp_year?: string;
  holder_name?: string;
  is_default: boolean;
  billing_address?: string;
  cpf?: string;
  phone?: string;
  created_at: string;
  updated_at?: string;
  is_verified: boolean;
}

export interface PaymentSettings {
  paymentMethods: PaymentMethod[];
  billingAddress: string;
  autoRenewal: boolean;
  invoiceEmail: string;
}

class PaymentMethodService {
  /**
   * Obter métodos de pagamento do usuário
   */
  async getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('payment_settings')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar métodos de pagamento:', error);
        return [];
      }

      return data?.payment_settings?.paymentMethods || [];
    } catch (error) {
      console.error('Erro ao buscar métodos de pagamento:', error);
      return [];
    }
  }

  /**
   * Adicionar novo método de pagamento
   */
  async addPaymentMethod(userId: string, paymentMethod: Omit<PaymentMethod, 'id' | 'created_at'>): Promise<PaymentMethod | null> {
    try {
      // Gerar ID único
      const id = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newMethod: PaymentMethod = {
        ...paymentMethod,
        id,
        created_at: new Date().toISOString(),
        is_verified: false
      };

      // Obter métodos existentes
      const existingMethods = await this.getUserPaymentMethods(userId);
      
      // Se este é o primeiro método ou foi marcado como padrão, definir como padrão
      if (existingMethods.length === 0 || newMethod.is_default) {
        existingMethods.forEach(method => method.is_default = false);
        newMethod.is_default = true;
      }

      const updatedMethods = [...existingMethods, newMethod];

      // Salvar no banco
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          payment_settings: {
            paymentMethods: updatedMethods,
            billingAddress: paymentMethod.billing_address || '',
            autoRenewal: true,
            invoiceEmail: ''
          },
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Erro ao salvar método de pagamento:', error);
        return null;
      }

      return newMethod;
    } catch (error) {
      console.error('Erro ao adicionar método de pagamento:', error);
      return null;
    }
  }

  /**
   * Remover método de pagamento
   */
  async removePaymentMethod(userId: string, methodId: string): Promise<boolean> {
    try {
      const existingMethods = await this.getUserPaymentMethods(userId);
      const updatedMethods = existingMethods.filter(method => method.id !== methodId);
      
      // Se o método removido era o padrão e existem outros métodos, definir o primeiro como padrão
      if (updatedMethods.length > 0) {
        const removedMethod = existingMethods.find(method => method.id === methodId);
        if (removedMethod?.is_default) {
          updatedMethods[0].is_default = true;
        }
      }

      const { error } = await supabase
        .from('user_settings')
        .update({
          payment_settings: {
            paymentMethods: updatedMethods,
            billingAddress: '',
            autoRenewal: true,
            invoiceEmail: ''
          },
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Erro ao remover método de pagamento:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao remover método de pagamento:', error);
      return false;
    }
  }

  /**
   * Definir método como padrão
   */
  async setDefaultPaymentMethod(userId: string, methodId: string): Promise<boolean> {
    try {
      const existingMethods = await this.getUserPaymentMethods(userId);
      const updatedMethods = existingMethods.map(method => ({
        ...method,
        is_default: method.id === methodId
      }));

      const { error } = await supabase
        .from('user_settings')
        .update({
          payment_settings: {
            paymentMethods: updatedMethods,
            billingAddress: '',
            autoRenewal: true,
            invoiceEmail: ''
          },
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Erro ao definir método padrão:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao definir método padrão:', error);
      return false;
    }
  }

  /**
   * Validar número do cartão (validação básica)
   */
  validateCardNumber(cardNumber: string): boolean {
    const number = cardNumber.replace(/\s/g, '');
    
    // Algoritmo de Luhn
    let sum = 0;
    let isEven = false;
    
    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  /**
   * Detectar bandeira do cartão
   */
  detectCardBrand(cardNumber: string): string {
    const number = cardNumber.replace(/\s/g, '');
    
    if (number.match(/^4/)) return 'Visa';
    if (number.match(/^5[1-5]/)) return 'Mastercard';
    if (number.match(/^3[47]/)) return 'American Express';
    if (number.match(/^6/)) return 'Discover';
    if (number.match(/^38|^30/)) return 'Diners Club';
    
    return 'Outros';
  }

  /**
   * Formatar número do cartão
   */
  formatCardNumber(value: string): string {
    const number = value.replace(/\s/g, '');
    const match = number.match(/\d{1,4}/g);
    return match ? match.join(' ') : '';
  }

  /**
   * Validar data de vencimento
   */
  validateExpiryDate(month: string, year: string): boolean {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    const expMonth = parseInt(month);
    const expYear = parseInt(year);
    
    if (expYear < currentYear) return false;
    if (expYear === currentYear && expMonth < currentMonth) return false;
    
    return true;
  }

  /**
   * Validar CVV
   */
  validateCVV(cvv: string, cardBrand: string): boolean {
    if (cardBrand === 'American Express') {
      return cvv.length === 4;
    }
    return cvv.length === 3;
  }
}

export const paymentMethodService = new PaymentMethodService();
