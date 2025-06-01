
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

// Interfaces para as configurações
export interface AccountInfo {
  nome_exibicao: string;
  nome_completo: string;
  email: string;
}

export interface SecuritySettings {
  autenticacao_2fa: boolean;
  notificacoes_login: boolean;
  timeout_sessao: number;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  lembretes_estudo: boolean;
  relatorios_semanais: boolean;
  som_notificacoes: boolean;
}

export interface PaymentSubscription {
  renovacao_automatica: boolean;
  email_faturas: string;
}

export interface PaymentMethod {
  id?: string;
  tipo_cartao: string;
  numero_cartao_last4: string;
  nome_portador: string;
  mes_validade: number;
  ano_validade: number;
  cpf_portador: string;
  telefone?: string;
  endereco_cobranca?: string;
  metodo_padrao: boolean;
  brand?: string;
}

export interface PrivacySettings {
  visibilidade_perfil: string;
  mostrar_email: boolean;
  mostrar_telefone: boolean;
  permitir_mensagens: boolean;
  coleta_dados_melhorias: boolean;
}

export interface WalletSettings {
  saldo_atual: number;
  school_points: number;
  limite_gastos: number;
  recarga_automatica: boolean;
}

export const useUserSettings = () => {
  const [loading, setLoading] = useState(true);
  const [accountInfo, setAccountInfo] = useState<AccountInfo>({
    nome_exibicao: '',
    nome_completo: '',
    email: ''
  });
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    autenticacao_2fa: false,
    notificacoes_login: false,
    timeout_sessao: 30
  });
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: false,
    push: false,
    lembretes_estudo: false,
    relatorios_semanais: false,
    som_notificacoes: false
  });
  const [paymentSubscription, setPaymentSubscription] = useState<PaymentSubscription>({
    renovacao_automatica: false,
    email_faturas: ''
  });
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    visibilidade_perfil: 'Público',
    mostrar_email: false,
    mostrar_telefone: false,
    permitir_mensagens: false,
    coleta_dados_melhorias: false
  });
  const [walletSettings, setWalletSettings] = useState<WalletSettings>({
    saldo_atual: 0,
    school_points: 0,
    limite_gastos: 0,
    recarga_automatica: false
  });

  // Carregar configurações do usuário
  const loadUserSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setLoading(true);

      // Carregar informações da conta
      const { data: accountData } = await supabase
        .from('user_account_info')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (accountData) {
        setAccountInfo({
          nome_exibicao: accountData.nome_exibicao,
          nome_completo: accountData.nome_completo,
          email: accountData.email
        });
      } else {
        // Usar dados do auth se não houver registro
        setAccountInfo({
          nome_exibicao: user.user_metadata?.display_name || '',
          nome_completo: user.user_metadata?.full_name || '',
          email: user.email || ''
        });
      }

      // Carregar configurações de segurança
      const { data: securityData } = await supabase
        .from('user_security_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (securityData) {
        setSecuritySettings({
          autenticacao_2fa: securityData.autenticacao_2fa,
          notificacoes_login: securityData.notificacoes_login,
          timeout_sessao: securityData.timeout_sessao
        });
      }

      // Carregar configurações de notificações
      const { data: notificationData } = await supabase
        .from('user_notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (notificationData) {
        setNotificationSettings({
          email: notificationData.email,
          push: notificationData.push,
          lembretes_estudo: notificationData.lembretes_estudo,
          relatorios_semanais: notificationData.relatorios_semanais,
          som_notificacoes: notificationData.som_notificacoes
        });
      }

      // Carregar configurações de pagamento
      const { data: paymentData } = await supabase
        .from('user_payment_subscription')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (paymentData) {
        setPaymentSubscription({
          renovacao_automatica: paymentData.renovacao_automatica,
          email_faturas: paymentData.email_faturas
        });
      } else {
        setPaymentSubscription({
          renovacao_automatica: false,
          email_faturas: user.email || ''
        });
      }

      // Carregar métodos de pagamento
      const { data: paymentMethodsData } = await supabase
        .from('user_payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (paymentMethodsData) {
        setPaymentMethods(paymentMethodsData.map(method => ({
          id: method.id,
          tipo_cartao: method.tipo_cartao,
          numero_cartao_last4: method.numero_cartao_last4,
          nome_portador: method.nome_portador,
          mes_validade: method.mes_validade,
          ano_validade: method.ano_validade,
          cpf_portador: method.cpf_portador,
          telefone: method.telefone,
          endereco_cobranca: method.endereco_cobranca,
          metodo_padrao: method.metodo_padrao,
          brand: method.brand
        })));
      }

      // Carregar configurações de privacidade
      const { data: privacyData } = await supabase
        .from('user_privacy_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (privacyData) {
        setPrivacySettings({
          visibilidade_perfil: privacyData.visibilidade_perfil,
          mostrar_email: privacyData.mostrar_email,
          mostrar_telefone: privacyData.mostrar_telefone,
          permitir_mensagens: privacyData.permitir_mensagens,
          coleta_dados_melhorias: privacyData.coleta_dados_melhorias
        });
      }

      // Carregar configurações da carteira
      const { data: walletData } = await supabase
        .from('user_wallet_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (walletData) {
        setWalletSettings({
          saldo_atual: parseFloat(walletData.saldo_atual) || 0,
          school_points: walletData.school_points,
          limite_gastos: parseFloat(walletData.limite_gastos) || 0,
          recarga_automatica: walletData.recarga_automatica
        });
      }

    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar suas configurações. Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Salvar informações da conta
  const saveAccountInfo = async (data: AccountInfo) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('user_account_info')
        .upsert({
          user_id: user.id,
          nome_exibicao: data.nome_exibicao,
          nome_completo: data.nome_completo,
          email: data.email
        });

      if (error) throw error;

      setAccountInfo(data);
      toast({
        title: "Sucesso",
        description: "Alterações salvas com sucesso!",
        variant: "default"
      });
      return true;
    } catch (error) {
      console.error('Erro ao salvar informações da conta:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar as alterações. Tente novamente.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Salvar configurações de segurança
  const saveSecuritySettings = async (data: SecuritySettings) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('user_security_settings')
        .upsert({
          user_id: user.id,
          autenticacao_2fa: data.autenticacao_2fa,
          notificacoes_login: data.notificacoes_login,
          timeout_sessao: data.timeout_sessao
        });

      if (error) throw error;

      setSecuritySettings(data);
      toast({
        title: "Sucesso",
        description: "Configurações de segurança salvas com sucesso!",
        variant: "default"
      });
      return true;
    } catch (error) {
      console.error('Erro ao salvar configurações de segurança:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar as configurações. Tente novamente.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Salvar configurações de notificações
  const saveNotificationSettings = async (data: NotificationSettings) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('user_notification_settings')
        .upsert({
          user_id: user.id,
          email: data.email,
          push: data.push,
          lembretes_estudo: data.lembretes_estudo,
          relatorios_semanais: data.relatorios_semanais,
          som_notificacoes: data.som_notificacoes
        });

      if (error) throw error;

      setNotificationSettings(data);
      toast({
        title: "Sucesso",
        description: "Configurações de notificação salvas com sucesso!",
        variant: "default"
      });
      return true;
    } catch (error) {
      console.error('Erro ao salvar configurações de notificação:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar as configurações. Tente novamente.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Salvar configurações de pagamento
  const savePaymentSubscription = async (data: PaymentSubscription) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('user_payment_subscription')
        .upsert({
          user_id: user.id,
          renovacao_automatica: data.renovacao_automatica,
          email_faturas: data.email_faturas
        });

      if (error) throw error;

      setPaymentSubscription(data);
      toast({
        title: "Sucesso",
        description: "Configurações de pagamento salvas com sucesso!",
        variant: "default"
      });
      return true;
    } catch (error) {
      console.error('Erro ao salvar configurações de pagamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar as configurações. Tente novamente.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Adicionar método de pagamento
  const addPaymentMethod = async (data: Omit<PaymentMethod, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: insertedData, error } = await supabase
        .from('user_payment_methods')
        .insert({
          user_id: user.id,
          tipo_cartao: data.tipo_cartao,
          numero_cartao_last4: data.numero_cartao_last4,
          nome_portador: data.nome_portador,
          mes_validade: data.mes_validade,
          ano_validade: data.ano_validade,
          cpf_portador: data.cpf_portador,
          telefone: data.telefone,
          endereco_cobranca: data.endereco_cobranca,
          metodo_padrao: data.metodo_padrao,
          brand: data.brand
        })
        .select()
        .single();

      if (error) throw error;

      const newMethod = { ...data, id: insertedData.id };
      setPaymentMethods(prev => [newMethod, ...prev]);
      
      toast({
        title: "Sucesso",
        description: "Método de pagamento adicionado com sucesso!",
        variant: "default"
      });
      return true;
    } catch (error) {
      console.error('Erro ao adicionar método de pagamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar método de pagamento. Tente novamente.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Salvar configurações de privacidade
  const savePrivacySettings = async (data: PrivacySettings) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('user_privacy_settings')
        .upsert({
          user_id: user.id,
          visibilidade_perfil: data.visibilidade_perfil,
          mostrar_email: data.mostrar_email,
          mostrar_telefone: data.mostrar_telefone,
          permitir_mensagens: data.permitir_mensagens,
          coleta_dados_melhorias: data.coleta_dados_melhorias
        });

      if (error) throw error;

      setPrivacySettings(data);
      toast({
        title: "Sucesso",
        description: "Configurações de privacidade salvas com sucesso!",
        variant: "default"
      });
      return true;
    } catch (error) {
      console.error('Erro ao salvar configurações de privacidade:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar as configurações. Tente novamente.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Salvar configurações da carteira
  const saveWalletSettings = async (data: WalletSettings) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('user_wallet_settings')
        .upsert({
          user_id: user.id,
          saldo_atual: data.saldo_atual,
          school_points: data.school_points,
          limite_gastos: data.limite_gastos,
          recarga_automatica: data.recarga_automatica
        });

      if (error) throw error;

      setWalletSettings(data);
      toast({
        title: "Sucesso",
        description: "Configurações da carteira salvas com sucesso!",
        variant: "default"
      });
      return true;
    } catch (error) {
      console.error('Erro ao salvar configurações da carteira:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar as configurações. Tente novamente.",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    loadUserSettings();
  }, []);

  return {
    loading,
    accountInfo,
    securitySettings,
    notificationSettings,
    paymentSubscription,
    paymentMethods,
    privacySettings,
    walletSettings,
    setAccountInfo,
    setSecuritySettings,
    setNotificationSettings,
    setPaymentSubscription,
    setPrivacySettings,
    setWalletSettings,
    saveAccountInfo,
    saveSecuritySettings,
    saveNotificationSettings,
    savePaymentSubscription,
    addPaymentMethod,
    savePrivacySettings,
    saveWalletSettings,
    refetch: loadUserSettings
  };
};
