import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/types/user-profile";
import AddPaymentMethodModal from "./AddPaymentMethodModal";
import { useToast } from "@/components/ui/use-toast";
import {
  User,
  Lock,
  Bell,
  CreditCard,
  ChevronUp,
  ChevronDown,
  Shield,
  Eye,
  EyeOff,
  Plus,
  Diamond,
  Wallet,
  ChevronRight,
  Check,
  X,
  Save,
  Edit,
  Trash2,
} from "lucide-react";

interface SettingsTabProps {
  userProfile: UserProfile | null;
  contactInfo: any;
  aboutMe: string;
  expandedSection: string | null;
  toggleSection: (section: string | null) => void;
  setContactInfo: (info: any) => void;
  setAboutMe: (about: string) => void;
  setUserProfile: (profile: UserProfile | null) => void;
}

export default function SettingsTab({
  userProfile,
  contactInfo,
  aboutMe,
  expandedSection,
  toggleSection,
  setContactInfo,
  setAboutMe,
  setUserProfile,
}: SettingsTabProps) {
  const { toast } = useToast();

  // Estados para armazenar dados de cada seção
  const [accountData, setAccountData] = useState({
    nome_exibicao: "",
    nome_completo: "",
    email: "",
  });

  const [securityData, setSecurityData] = useState({
    autenticacao_2fa: false,
    notificacoes_login: true,
    timeout_sessao: "30",
  });

  const [notificationData, setNotificationData] = useState({
    email: true,
    push: true,
    lembretes_estudo: true,
    relatorios_semanais: true,
    som_notificacoes: true,
  });

  const [paymentData, setPaymentData] = useState({
    renovacao_automatica: true,
    email_faturas: true,
  });

  const [privacyData, setPrivacyData] = useState({
    visibilidade_perfil: "publico",
    mostrar_email: false,
    mostrar_telefone: false,
    permitir_mensagens: true,
    coleta_dados_melhorias: true,
  });

  const [walletData, setWalletData] = useState({
    saldo_atual: 0,
    school_points: 0,
    limite_gastos: 1000,
    recarga_automatica: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: "card", number: "**** **** **** 1234", default: true },
    { id: 2, type: "pix", number: "joao@email.com", default: false },
  ]);
  const [isEditingPayment, setIsEditingPayment] = useState<number | null>(null);

  // Estados de loading para cada seção
  const [loadingStates, setLoadingStates] = useState({
    account: false,
    security: false,
    notifications: false,
    payment: false,
    privacy: false,
    wallet: false,
  });

  // Carregar dados do usuário
  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Carregar dados da conta
      const { data: accountInfo } = await supabase
        .from('profiles')
        .select('full_name, display_name, email')
        .eq('id', user.id)
        .single();

      if (accountInfo) {
        setAccountData({
          nome_exibicao: accountInfo.display_name || "",
          nome_completo: accountInfo.full_name || "",
          email: accountInfo.email || user.email || "",
        });
      }

      // Carregar configurações de segurança
      const { data: securityInfo } = await supabase
        .from('user_settings')
        .select('two_factor_enabled, login_notifications, session_timeout')
        .eq('user_id', user.id)
        .single();

      if (securityInfo) {
        setSecurityData({
          autenticacao_2fa: securityInfo.two_factor_enabled || false,
          notificacoes_login: securityInfo.login_notifications !== false,
          timeout_sessao: securityInfo.session_timeout || "30",
        });
      }

      // Carregar configurações de notificação
      const { data: notificationInfo } = await supabase
        .from('user_settings')
        .select('email_notifications, push_notifications, study_reminders, weekly_reports, notification_sound')
        .eq('user_id', user.id)
        .single();

      if (notificationInfo) {
        setNotificationData({
          email: notificationInfo.email_notifications !== false,
          push: notificationInfo.push_notifications !== false,
          lembretes_estudo: notificationInfo.study_reminders !== false,
          relatorios_semanais: notificationInfo.weekly_reports !== false,
          som_notificacoes: notificationInfo.notification_sound !== false,
        });
      }

      // Carregar configurações de pagamento
      const { data: paymentInfo } = await supabase
        .from('user_settings')
        .select('auto_renewal, invoice_emails')
        .eq('user_id', user.id)
        .single();

      if (paymentInfo) {
        setPaymentData({
          renovacao_automatica: paymentInfo.auto_renewal !== false,
          email_faturas: paymentInfo.invoice_emails !== false,
        });
      }

      // Carregar configurações de privacidade
      const { data: privacyInfo } = await supabase
        .from('user_settings')
        .select('profile_visibility, show_email, show_phone, allow_messages, data_collection')
        .eq('user_id', user.id)
        .single();

      if (privacyInfo) {
        setPrivacyData({
          visibilidade_perfil: privacyInfo.profile_visibility || "publico",
          mostrar_email: privacyInfo.show_email || false,
          mostrar_telefone: privacyInfo.show_phone || false,
          permitir_mensagens: privacyInfo.allow_messages !== false,
          coleta_dados_melhorias: privacyInfo.data_collection !== false,
        });
      }

      // Carregar dados da carteira
      const { data: walletInfo } = await supabase
        .from('profiles')
        .select('wallet_balance, school_points')
        .eq('id', user.id)
        .single();

      if (walletInfo) {
        setWalletData(prev => ({
          ...prev,
          saldo_atual: walletInfo.wallet_balance || 0,
          school_points: walletInfo.school_points || 0,
        }));
      }

      // Carregar métodos de pagamento
      const { data: paymentMethodsInfo } = await supabase
        .from('user_settings')
        .select('payment_settings')
        .eq('user_id', user.id)
        .single();

      if (paymentMethodsInfo?.payment_settings?.paymentMethods) {
        setPaymentSettings({
          paymentMethods: paymentMethodsInfo.payment_settings.paymentMethods
        });
      }

    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    }
  };

  // Funções de salvamento para cada seção
  const saveAccountSettings = async () => {
    setLoadingStates(prev => ({ ...prev, account: true }));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: accountData.nome_exibicao,
          full_name: accountData.nome_completo,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Informações da conta salvas com sucesso!",
        className: "bg-green-50 border-green-200",
      });

      toggleSection(null);
    } catch (error) {
      console.error("Erro ao salvar informações da conta:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, account: false }));
    }
  };

  const saveSecuritySettings = async () => {
    setLoadingStates(prev => ({ ...prev, security: true }));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          two_factor_enabled: securityData.autenticacao_2fa,
          login_notifications: securityData.notificacoes_login,
          session_timeout: securityData.timeout_sessao,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configurações de segurança salvas com sucesso!",
        className: "bg-green-50 border-green-200",
      });

      toggleSection(null);
    } catch (error) {
      console.error("Erro ao salvar configurações de segurança:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, security: false }));
    }
  };

  const saveNotificationSettings = async () => {
    setLoadingStates(prev => ({ ...prev, notifications: true }));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          email_notifications: notificationData.email,
          push_notifications: notificationData.push,
          study_reminders: notificationData.lembretes_estudo,
          weekly_reports: notificationData.relatorios_semanais,
          notification_sound: notificationData.som_notificacoes,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configurações de notificação salvas com sucesso!",
        className: "bg-green-50 border-green-200",
      });

      toggleSection(null);
    } catch (error) {
      console.error("Erro ao salvar configurações de notificação:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, notifications: false }));
    }
  };

  const savePaymentSettings = async () => {
    setLoadingStates(prev => ({ ...prev, payment: true }));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          auto_renewal: paymentData.renovacao_automatica,
          invoice_emails: paymentData.email_faturas,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configurações de pagamento salvas com sucesso!",
        className: "bg-green-50 border-green-200",
      });

      toggleSection(null);
    } catch (error) {
      console.error("Erro ao salvar configurações de pagamento:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, payment: false }));
    }
  };

  const savePrivacySettings = async () => {
    setLoadingStates(prev => ({ ...prev, privacy: true }));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          profile_visibility: privacyData.visibilidade_perfil,
          show_email: privacyData.mostrar_email,
          show_phone: privacyData.mostrar_telefone,
          allow_messages: privacyData.permitir_mensagens,
          data_collection: privacyData.coleta_dados_melhorias,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configurações de privacidade salvas com sucesso!",
        className: "bg-green-50 border-green-200",
      });

      toggleSection(null);
    } catch (error) {
      console.error("Erro ao salvar configurações de privacidade:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, privacy: false }));
    }
  };

  const saveWalletSettings = async () => {
    setLoadingStates(prev => ({ ...prev, wallet: true }));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          spending_limit: walletData.limite_gastos,
          auto_recharge: walletData.recarga_automatica,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configurações da carteira salvas com sucesso!",
        className: "bg-green-50 border-green-200",
      });

      toggleSection(null);
    } catch (error) {
      console.error("Erro ao salvar configurações da carteira:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, wallet: false }));
    }
  };

  // Estados para métodos de pagamento
  const [paymentSettings, setPaymentSettings] = useState({
    paymentMethods: [] as any[]
  });

  // Função para adicionar método de pagamento
  const addPaymentMethod = () => {
    setShowAddPaymentModal(true);
  };

  // Função para lidar com adição de método de pagamento
  const handleAddPaymentMethod = async (newMethod: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Buscar configurações existentes
      const { data: existingSettings } = await supabase
        .from('user_settings')
        .select('payment_settings')
        .eq('user_id', user.id)
        .single();

      const currentMethods = existingSettings?.payment_settings?.paymentMethods || [];
      
      // Se este é o primeiro método, definir como padrão
      if (currentMethods.length === 0) {
        newMethod.is_default = true;
      }

      const updatedMethods = [...currentMethods, newMethod];

      // Salvar no banco
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          payment_settings: {
            paymentMethods: updatedMethods,
            billingAddress: '',
            autoRenewal: true,
            invoiceEmail: ''
          },
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Atualizar estado local
      setPaymentSettings(prev => ({
        ...prev,
        paymentMethods: updatedMethods
      }));

      toast({
        title: "Sucesso",
        description: "Método de pagamento adicionado com sucesso!",
        className: "bg-green-50 border-green-200",
      });

    } catch (error) {
      console.error("Erro ao adicionar método de pagamento:", error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar método de pagamento. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Função para definir método como padrão
  const setAsDefaultPaymentMethod = async (methodId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const updatedMethods = paymentSettings.paymentMethods.map(method => ({
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
        .eq('user_id', user.id);

      if (error) throw error;

      setPaymentSettings(prev => ({
        ...prev,
        paymentMethods: updatedMethods
      }));

      toast({
        title: "Sucesso",
        description: "Método padrão definido com sucesso!",
        className: "bg-green-50 border-green-200",
      });

    } catch (error) {
      console.error("Erro ao definir método padrão:", error);
      toast({
        title: "Erro",
        description: "Erro ao definir método padrão. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Função para remover método de pagamento
  const removePaymentMethod = async (methodId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const updatedMethods = paymentSettings.paymentMethods.filter(method => method.id !== methodId);
      
      // Se o método removido era o padrão e existem outros métodos, definir o primeiro como padrão
      if (updatedMethods.length > 0) {
        const removedMethod = paymentSettings.paymentMethods.find(method => method.id === methodId);
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
        .eq('user_id', user.id);

      if (error) throw error;

      setPaymentSettings(prev => ({
        ...prev,
        paymentMethods: updatedMethods
      }));

      toast({
        title: "Sucesso",
        description: "Método de pagamento removido com sucesso!",
        className: "bg-green-50 border-green-200",
      });

    } catch (error) {
      console.error("Erro ao remover método de pagamento:", error);
      toast({
        title: "Erro",
        description: "Erro ao remover método de pagamento. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Settings */}
      <div>
        <div
          className="flex justify-between items-center p-4 bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#0A2540]/80 transition-colors"
          onClick={() => toggleSection(expandedSection === "account" ? null : "account")}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
              <User className="h-5 w-5 text-[#FF6B00]" />
            </div>
            <div>
              <h4 className="text-[#29335C] dark:text-white font-medium">
                Informações da Conta
              </h4>
              <p className="text-xs text-[#64748B] dark:text-white/60">
                Gerencie suas informações pessoais
              </p>
            </div>
          </div>
          {expandedSection === "account" ? (
            <ChevronUp className="h-5 w-5 text-[#64748B] dark:text-white/60" />
          ) : (
            <ChevronDown className="h-5 w-5 text-[#64748B] dark:text-white/60" />
          )}
        </div>

        {expandedSection === "account" && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-[#29335C]/20 rounded-lg border border-[#E0E1DD] dark:border-white/10">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="displayName" className="text-sm text-[#29335C] dark:text-white">
                    Nome de Exibição
                  </Label>
                  <Input
                    id="displayName"
                    value={accountData.nome_exibicao}
                    onChange={(e) => setAccountData(prev => ({ ...prev, nome_exibicao: e.target.value }))}
                    className="mt-1"
                    placeholder="Como você quer ser chamado"
                  />
                </div>
                <div>
                  <Label htmlFor="fullName" className="text-sm text-[#29335C] dark:text-white">
                    Nome Completo
                  </Label>
                  <Input
                    id="fullName"
                    value={accountData.nome_completo}
                    onChange={(e) => setAccountData(prev => ({ ...prev, nome_completo: e.target.value }))}
                    className="mt-1"
                    placeholder="Seu nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm text-[#29335C] dark:text-white">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={accountData.email}
                    onChange={(e) => setAccountData(prev => ({ ...prev, email: e.target.value }))}
                    className="mt-1"
                    placeholder="seu@email.com"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={saveAccountSettings}
                    disabled={loadingStates.account}
                    className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loadingStates.account ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleSection(null)}
                    disabled={loadingStates.account}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
          </div>
        )}
      </div>

      {/* Security Settings */}
      <div>
        <div
          className="flex justify-between items-center p-4 bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#0A2540]/80 transition-colors"
          onClick={() => toggleSection(expandedSection === "security" ? null : "security")}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
              <Lock className="h-5 w-5 text-[#FF6B00]" />
            </div>
            <div>
              <h4 className="text-[#29335C] dark:text-white font-medium">Segurança</h4>
              <p className="text-xs text-[#64748B] dark:text-white/60">
                Gerencie sua senha e segurança da conta
              </p>
            </div>
          </div>
          {expandedSection === "security" ? (
            <ChevronUp className="h-5 w-5 text-[#64748B] dark:text-white/60" />
          ) : (
            <ChevronDown className="h-5 w-5 text-[#64748B] dark:text-white/60" />
          )}
        </div>

        {expandedSection === "security" && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-[#29335C]/20 rounded-lg border border-[#E0E1DD] dark:border-white/10">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-[#29335C] dark:text-white">
                      Autenticação de Dois Fatores
                    </Label>
                    <p className="text-xs text-[#64748B] dark:text-white/60">
                      Adicione uma camada extra de segurança
                    </p>
                  </div>
                  <Switch 
                    checked={securityData.autenticacao_2fa}
                    onCheckedChange={(checked) => setSecurityData(prev => ({ ...prev, autenticacao_2fa: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-[#29335C] dark:text-white">
                      Notificações de Login
                    </Label>
                    <p className="text-xs text-[#64748B] dark:text-white/60">
                      Receba alertas quando alguém acessar sua conta
                    </p>
                  </div>
                  <Switch 
                    checked={securityData.notificacoes_login}
                    onCheckedChange={(checked) => setSecurityData(prev => ({ ...prev, notificacoes_login: checked }))}
                  />
                </div>
                <div>
                  <Label className="text-sm text-[#29335C] dark:text-white">
                    Timeout da Sessão
                  </Label>
                  <Select 
                    value={securityData.timeout_sessao}
                    onValueChange={(value) => setSecurityData(prev => ({ ...prev, timeout_sessao: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="120">2 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={saveSecuritySettings}
                    disabled={loadingStates.security}
                    className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loadingStates.security ? "Salvando..." : "Salvar Configurações"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleSection(null)}
                    disabled={loadingStates.security}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
          </div>
        )}
      </div>

      {/* Notification Settings */}
      <div>
        <div
          className="flex justify-between items-center p-4 bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#0A2540]/80 transition-colors"
          onClick={() => toggleSection(expandedSection === "notifications" ? null : "notifications")}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
              <Bell className="h-5 w-5 text-[#FF6B00]" />
            </div>
            <div>
              <h4 className="text-[#29335C] dark:text-white font-medium">Notificações</h4>
              <p className="text-xs text-[#64748B] dark:text-white/60">
                Gerencie suas preferências de notificação
              </p>
            </div>
          </div>
          {expandedSection === "notifications" ? (
            <ChevronUp className="h-5 w-5 text-[#64748B] dark:text-white/60" />
          ) : (
            <ChevronDown className="h-5 w-5 text-[#64748B] dark:text-white/60" />
          )}
        </div>

        {expandedSection === "notifications" && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-[#29335C]/20 rounded-lg border border-[#E0E1DD] dark:border-white/10">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-[#29335C] dark:text-white">
                      Notificações por Email
                    </Label>
                    <p className="text-xs text-[#64748B] dark:text-white/60">
                      Receba atualizações importantes por email
                    </p>
                  </div>
                  <Switch 
                    checked={notificationData.email}
                    onCheckedChange={(checked) => setNotificationData(prev => ({ ...prev, email: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-[#29335C] dark:text-white">
                      Notificações Push
                    </Label>
                    <p className="text-xs text-[#64748B] dark:text-white/60">
                      Receba notificações no navegador
                    </p>
                  </div>
                  <Switch 
                    checked={notificationData.push}
                    onCheckedChange={(checked) => setNotificationData(prev => ({ ...prev, push: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-[#29335C] dark:text-white">
                      Lembretes de Estudo
                    </Label>
                    <p className="text-xs text-[#64748B] dark:text-white/60">
                      Receba lembretes para manter sua rotina
                    </p>
                  </div>
                  <Switch 
                    checked={notificationData.lembretes_estudo}
                    onCheckedChange={(checked) => setNotificationData(prev => ({ ...prev, lembretes_estudo: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-[#29335C] dark:text-white">
                      Relatórios Semanais
                    </Label>
                    <p className="text-xs text-[#64748B] dark:text-white/60">
                      Receba um resumo do seu progresso semanal
                    </p>
                  </div>
                  <Switch 
                    checked={notificationData.relatorios_semanais}
                    onCheckedChange={(checked) => setNotificationData(prev => ({ ...prev, relatorios_semanais: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-[#29335C] dark:text-white">
                      Som das Notificações
                    </Label>
                    <p className="text-xs text-[#64748B] dark:text-white/60">
                      Reproduzir som ao receber notificações
                    </p>
                  </div>
                  <Switch 
                    checked={notificationData.som_notificacoes}
                    onCheckedChange={(checked) => setNotificationData(prev => ({ ...prev, som_notificacoes: checked }))}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={saveNotificationSettings}
                    disabled={loadingStates.notifications}
                    className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loadingStates.notifications ? "Salvando..." : "Salvar Configurações"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleSection(null)}
                    disabled={loadingStates.notifications}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
          </div>
        )}
      </div>

      {/* Payment Settings */}
      <div>
        <div
          className="flex justify-between items-center p-4 bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#0A2540]/80 transition-colors"
          onClick={() => toggleSection(expandedSection === "payment" ? null : "payment")}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-[#FF6B00]" />
            </div>
            <div>
              <h4 className="text-[#29335C] dark:text-white font-medium">
                Pagamento e Assinatura
              </h4>
              <p className="text-xs text-[#64748B] dark:text-white/60">
                Gerencie seus métodos de pagamento e assinatura
              </p>
            </div>
          </div>
          {expandedSection === "payment" ? (
            <ChevronUp className="h-5 w-5 text-[#64748B] dark:text-white/60" />
          ) : (
            <ChevronDown className="h-5 w-5 text-[#64748B] dark:text-white/60" />
          )}
        </div>

        {expandedSection === "payment" && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-[#29335C]/20 rounded-lg border border-[#E0E1DD] dark:border-white/10">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Métodos de Pagamento</Label>
                  <Button 
                    size="sm" 
                    onClick={addPaymentMethod}
                    className="bg-[#FF6B00] hover:bg-[#FF6B00]/90"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </div>

                {paymentSettings.paymentMethods.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed border-[#E0E1DD] dark:border-white/10 rounded-lg">
                    <CreditCard className="h-8 w-8 mx-auto mb-2 text-[#64748B] dark:text-white/60" />
                    <p className="text-sm text-[#64748B] dark:text-white/60">
                      Nenhum método de pagamento adicionado
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={addPaymentMethod}
                      className="mt-2"
                    >
                      Adicionar Primeiro Método
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {paymentSettings.paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center justify-between p-3 bg-white dark:bg-[#0A2540] rounded-lg border">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-4 w-4" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">**** {method.last4}</p>
                              {method.is_default && (
                                <Badge variant="secondary" className="text-xs">
                                  Padrão
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-[#64748B] dark:text-white/60">
                              {method.brand} • Expira em {method.exp_month}/{method.exp_year}
                            </p>
                            {method.holder_name && (
                              <p className="text-xs text-[#64748B] dark:text-white/60">
                                {method.holder_name}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!method.is_default && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setAsDefaultPaymentMethod(method.id)}
                              className="text-xs"
                            >
                              Definir como Padrão
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removePaymentMethod(method.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

<div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-[#29335C] dark:text-white">
                      Renovação Automática
                    </Label>
                    <p className="text-xs text-[#64748B] dark:text-white/60">
                      Renove automaticamente sua assinatura
                    </p>
                  </div>
                  <Switch 
                    checked={paymentData.renovacao_automatica}
                    onCheckedChange={(checked) => setPaymentData(prev => ({ ...prev, renovacao_automatica: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-[#29335C] dark:text-white">
                      Email de Faturas
                    </Label>
                    <p className="text-xs text-[#64748B] dark:text-white/60">
                      Receba faturas por email
                    </p>
                  </div>
                  <Switch 
                    checked={paymentData.email_faturas}
                    onCheckedChange={(checked) => setPaymentData(prev => ({ ...prev, email_faturas: checked }))}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={savePaymentSettings}
                    disabled={loadingStates.payment}
                    className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loadingStates.payment ? "Salvando..." : "Salvar Configurações"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleSection(null)}
                    disabled={loadingStates.payment}
                  >
                    Cancelar
                  </Button>
                </div>
            </div>
          </div>
        )}
      </div>

      {/* Privacy Settings */}
      <div>
        <div
          className="flex justify-between items-center p-4 bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#0A2540]/80 transition-colors"
          onClick={() => toggleSection(expandedSection === "privacy" ? null : "privacy")}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-[#FF6B00]" />
            </div>
            <div>
              <h4 className="text-[#29335C] dark:text-white font-medium">Privacidade</h4>
              <p className="text-xs text-[#64748B] dark:text-white/60">
                Gerencie suas configurações de privacidade
              </p>
            </div>
          </div>
          {expandedSection === "privacy" ? (
            <ChevronUp className="h-5 w-5 text-[#64748B] dark:text-white/60" />
          ) : (
            <ChevronDown className="h-5 w-5 text-[#64748B] dark:text-white/60" />
          )}
        </div>

        {expandedSection === "privacy" && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-[#29335C]/20 rounded-lg border border-[#E0E1DD] dark:border-white/10">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-[#29335C] dark:text-white">
                    Visibilidade do Perfil
                  </Label>
                  <Select 
                    value={privacyData.visibilidade_perfil}
                    onValueChange={(value) => setPrivacyData(prev => ({ ...prev, visibilidade_perfil: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="publico">Público</SelectItem>
                      <SelectItem value="amigos">Apenas Amigos</SelectItem>
                      <SelectItem value="privado">Privado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-[#29335C] dark:text-white">
                      Mostrar Email no Perfil
                    </Label>
                    <p className="text-xs text-[#64748B] dark:text-white/60">
                      Outros usuários podem ver seu email
                    </p>
                  </div>
                  <Switch 
                    checked={privacyData.mostrar_email}
                    onCheckedChange={(checked) => setPrivacyData(prev => ({ ...prev, mostrar_email: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-[#29335C] dark:text-white">
                      Mostrar Telefone no Perfil
                    </Label>
                    <p className="text-xs text-[#64748B] dark:text-white/60">
                      Outros usuários podem ver seu telefone
                    </p>
                  </div>
                  <Switch 
                    checked={privacyData.mostrar_telefone}
                    onCheckedChange={(checked) => setPrivacyData(prev => ({ ...prev, mostrar_telefone: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-[#29335C] dark:text-white">
                      Permitir Mensagens
                    </Label>
                    <p className="text-xs text-[#64748B] dark:text-white/60">
                      Outros usuários podem te enviar mensagens
                    </p>
                  </div>
                  <Switch 
                    checked={privacyData.permitir_mensagens}
                    onCheckedChange={(checked) => setPrivacyData(prev => ({ ...prev, permitir_mensagens: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-[#29335C] dark:text-white">
                      Coleta de Dados para Melhorias
                    </Label>
                    <p className="text-xs text-[#64748B] dark:text-white/60">
                      Ajude-nos a melhorar a plataforma
                    </p>
                  </div>
                  <Switch 
                    checked={privacyData.coleta_dados_melhorias}
                    onCheckedChange={(checked) => setPrivacyData(prev => ({ ...prev, coleta_dados_melhorias: checked }))}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={savePrivacySettings}
                    disabled={loadingStates.privacy}
                    className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loadingStates.privacy ? "Salvando..." : "Salvar Configurações"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleSection(null)}
                    disabled={loadingStates.privacy}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
          </div>
        )}
      </div>

      {/* Wallet Settings */}
      <div>
        <div
          className="flex justify-between items-center p-4 bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#0A2540]/80 transition-colors"
          onClick={() => toggleSection(expandedSection === "wallet" ? null : "wallet")}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-[#FF6B00]" />
            </div>
            <div>
              <h4 className="text-[#29335C] dark:text-white font-medium">Carteira</h4>
              <p className="text-xs text-[#64748B] dark:text-white/60">
                Gerencie sua carteira e moedas
              </p>
</div>
          </div>
          {expandedSection === "wallet" ? (
            <ChevronUp className="h-5 w-5 text-[#64748B] dark:text-white/60" />
          ) : (
            <ChevronDown className="h-5 w-5 text-[#64748B] dark:text-white/60" />
          )}
        </div>

        {expandedSection === "wallet" && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-[#29335C]/20 rounded-lg border border-[#E0E1DD] dark:border-white/10">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-400">
                        Saldo Atual
                      </span>
                    </div>
                    <p className="text-lg font-bold text-green-900 dark:text-green-300 mt-1">
                      R$ {walletData.saldo_atual.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center gap-2">
                      <Diamond className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800 dark:text-orange-400">
                        School Points
                      </span>
                    </div>
                    <p className="text-lg font-bold text-orange-900 dark:text-orange-300 mt-1">
                      {walletData.school_points.toLocaleString()} pts
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-[#29335C] dark:text-white">
                    Limite de Gastos Mensal
                  </Label>
                  <Input
                    type="number"
                    value={walletData.limite_gastos}
                    onChange={(e) => setWalletData(prev => ({ ...prev, limite_gastos: Number(e.target.value) }))}
                    className="mt-1"
                    placeholder="R$ 0,00"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm text-[#29335C] dark:text-white">
                      Recarga Automática
                    </Label>
                    <p className="text-xs text-[#64748B] dark:text-white/60">
                      Recarregar automaticamente quando o saldo for baixo
                    </p>
                  </div>
                  <Switch 
                    checked={walletData.recarga_automatica}
                    onCheckedChange={(checked) => setWalletData(prev => ({ ...prev, recarga_automatica: checked }))}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={saveWalletSettings}
                    disabled={loadingStates.wallet}
                    className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loadingStates.wallet ? "Salvando..." : "Salvar Configurações"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleSection(null)}
                    disabled={loadingStates.wallet}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
          </div>
        )}
      </div>

      {/* Modal para Adicionar Método de Pagamento */}
      <AddPaymentMethodModal
        isOpen={showAddPaymentModal}
        onClose={() => setShowAddPaymentModal(false)}
        onAddPaymentMethod={handleAddPaymentMethod}
        userProfile={userProfile}
      />
    </div>
  );
}