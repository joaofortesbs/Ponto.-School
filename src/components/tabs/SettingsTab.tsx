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
  contactInfo: {
    email: string;
    phone: string;
    location: string;
    birthDate: string;
  };
  aboutMe: string;
  expandedSection: string | null;
  toggleSection: (section: string | null) => void;
  setContactInfo: React.Dispatch<
    React.SetStateAction<{
      email: string;
      phone: string;
      location: string;
      birthDate: string;
    }>
  >;
  setAboutMe: React.Dispatch<React.SetStateAction<string>>;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
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
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para configurações reais do usuário
  const [accountSettings, setAccountSettings] = useState({
    displayName: userProfile?.display_name || "",
    username: userProfile?.username || "",
    email: contactInfo.email,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    loginNotifications: true,
    sessionTimeout: "30",
    trustedDevices: [] as string[],
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    studyReminders: true,
    weeklyReports: false,
    marketingEmails: false,
    soundEnabled: true,
  });

  const [paymentSettings, setPaymentSettings] = useState({
    paymentMethods: [] as any[],
    billingAddress: "",
    autoRenewal: true,
    invoiceEmail: contactInfo.email,
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    dataCollection: true,
  });

  const [walletSettings, setWalletSettings] = useState({
    balance: 0,
    currency: "BRL",
    autoTopUp: false,
    spendingLimit: 0,
  });

  useEffect(() => {
    loadUserSettings();
  }, [userProfile]);

  const loadUserSettings = async () => {
    if (!userProfile) return;

    try {
      // Carregar configurações do usuário do banco de dados
      const { data: settings } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", userProfile.id)
        .single();

      if (settings) {
        setSecuritySettings(prev => ({ ...prev, ...settings.security_settings }));
        setNotificationSettings(prev => ({ ...prev, ...settings.notification_settings }));
        setPrivacySettings(prev => ({ ...prev, ...settings.privacy_settings }));
        setWalletSettings(prev => ({ ...prev, ...settings.wallet_settings }));
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    }
  };

  const saveAccountSettings = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: accountSettings.displayName,
          username: accountSettings.username,
        })
        .eq("id", userProfile?.id);

      if (error) throw error;

      // Atualizar senha se fornecida
      if (accountSettings.newPassword && accountSettings.currentPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: accountSettings.newPassword
        });

        if (passwordError) throw passwordError;

        setAccountSettings(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      }

      toggleSection(null);
    } catch (error) {
      console.error("Erro ao salvar configurações da conta:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (settingsType: string, settings: any) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: userProfile?.id,
          [settingsType]: settings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      toggleSection(null);
    } catch (error) {
      console.error(`Erro ao salvar ${settingsType}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const addPaymentMethod = () => {
    // Implementar modal para adicionar método de pagamento
    console.log("Adicionar método de pagamento");
  };

  const removePaymentMethod = (id: string) => {
    setPaymentSettings(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.filter(method => method.id !== id)
    }));
  };

  const setAsDefaultPaymentMethod = (id: string) => {
    setPaymentSettings(prev => {
      const updatedMethods = prev.paymentMethods.map(method => ({
        ...method,
        is_default: method.id === id
      }));
      return { ...prev, paymentMethods: updatedMethods };
    });
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="displayName">Nome de Exibição</Label>
                  <Input
                    id="displayName"
                    value={accountSettings.displayName}
                    onChange={(e) => setAccountSettings(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="Digite seu nome"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="username">Nome de Usuário</Label>
                  <Input
                    id="username"
                    value={accountSettings.username}
                    onChange={(e) => setAccountSettings(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Digite seu username"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={accountSettings.email}
                  onChange={(e) => setAccountSettings(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1"
                  disabled
                />
                <p className="text-xs text-[#64748B] dark:text-white/60 mt-1">
                  Para alterar o email, entre em contato com o suporte
                </p>
              </div>

              <div className="border-t pt-4">
                <h5 className="font-medium text-[#29335C] dark:text-white mb-3">Alterar Senha</h5>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="currentPassword">Senha Atual</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        value={accountSettings.currentPassword}
                        onChange={(e) => setAccountSettings(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Digite sua senha atual"
                        className="mt-1 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="newPassword">Nova Senha</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={accountSettings.newPassword}
                        onChange={(e) => setAccountSettings(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Digite a nova senha"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={accountSettings.confirmPassword}
                        onChange={(e) => setAccountSettings(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirme a nova senha"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => toggleSection(null)}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={saveAccountSettings}
                  disabled={isLoading}
                  className="bg-[#FF6B00] hover:bg-[#FF6B00]/90"
                >
                  {isLoading ? "Salvando..." : "Salvar Alterações"}
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
                  <Label>Autenticação de Dois Fatores</Label>
                  <p className="text-xs text-[#64748B] dark:text-white/60">
                    Adicione uma camada extra de segurança
                  </p>
                </div>
                <Switch
                  checked={securitySettings.twoFactorEnabled}
                  onCheckedChange={(checked) => 
                    setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificações de Login</Label>
                  <p className="text-xs text-[#64748B] dark:text-white/60">
                    Receba alertas sobre novos logins
                  </p>
                </div>
                <Switch
                  checked={securitySettings.loginNotifications}
                  onCheckedChange={(checked) => 
                    setSecuritySettings(prev => ({ ...prev, loginNotifications: checked }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="sessionTimeout">Timeout da Sessão (minutos)</Label>
                <Select 
                  value={securitySettings.sessionTimeout} 
                  onValueChange={(value) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                    <SelectItem value="0">Nunca</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => toggleSection(null)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => saveSettings("security_settings", securitySettings)}
                  className="bg-[#FF6B00] hover:bg-[#FF6B00]/90"
                >
                  Salvar Configurações
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
                  <Label>Notificações por Email</Label>
                  <p className="text-xs text-[#64748B] dark:text-white/60">
                    Receba atualizações importantes por email
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificações Push</Label>
                  <p className="text-xs text-[#64748B] dark:text-white/60">
                    Receba notificações no navegador
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.pushNotifications}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Lembretes de Estudo</Label>
                  <p className="text-xs text-[#64748B] dark:text-white/60">
                    Receba lembretes para manter sua rotina
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.studyReminders}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({ ...prev, studyReminders: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Relatórios Semanais</Label>
                  <p className="text-xs text-[#64748B] dark:text-white/60">
                    Receba resumos do seu progresso
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.weeklyReports}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({ ...prev, weeklyReports: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Som das Notificações</Label>
                  <p className="text-xs text-[#64748B] dark:text-white/60">
                    Reproduzir som ao receber notificações
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.soundEnabled}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({ ...prev, soundEnabled: checked }))
                  }
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => toggleSection(null)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => saveSettings("notification_settings", notificationSettings)}
                  className="bg-[#FF6B00] hover:bg-[#FF6B00]/90"
                >
                  Salvar Configurações
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
                  <Label>Renovação Automática</Label>
                  <p className="text-xs text-[#64748B] dark:text-white/60">
                    Renovar automaticamente sua assinatura
                  </p>
                </div>
                <Switch
                  checked={paymentSettings.autoRenewal}
                  onCheckedChange={(checked) => 
                    setPaymentSettings(prev => ({ ...prev, autoRenewal: checked }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="invoiceEmail">Email para Faturas</Label>
                <Input
                  id="invoiceEmail"
                  type="email"
                  value={paymentSettings.invoiceEmail}
                  onChange={(e) => setPaymentSettings(prev => ({ ...prev, invoiceEmail: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => toggleSection(null)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => saveSettings("payment_settings", paymentSettings)}
                  className="bg-[#FF6B00] hover:bg-[#FF6B00]/90"
                >
                  Salvar Configurações
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
                <Label htmlFor="profileVisibility">Visibilidade do Perfil</Label>
                <Select 
                  value={privacySettings.profileVisibility} 
                  onValueChange={(value) => setPrivacySettings(prev => ({ ...prev, profileVisibility: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Público</SelectItem>
                    <SelectItem value="friends">Apenas Amigos</SelectItem>
                    <SelectItem value="private">Privado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Mostrar Email no Perfil</Label>
                  <p className="text-xs text-[#64748B] dark:text-white/60">
                    Permitir que outros vejam seu email
                  </p>
                </div>
                <Switch
                  checked={privacySettings.showEmail}
                  onCheckedChange={(checked) => 
                    setPrivacySettings(prev => ({ ...prev, showEmail: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Mostrar Telefone no Perfil</Label>
                  <p className="text-xs text-[#64748B] dark:text-white/60">
                    Permitir que outros vejam seu telefone
                  </p>
                </div>
                <Switch
                  checked={privacySettings.showPhone}
                  onCheckedChange={(checked) => 
                    setPrivacySettings(prev => ({ ...prev, showPhone: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Permitir Mensagens</Label>
                  <p className="text-xs text-[#64748B] dark:text-white/60">
                    Permitir que outros usuários enviem mensagens
                  </p>
                </div>
                <Switch
                  checked={privacySettings.allowMessages}
                  onCheckedChange={(checked) => 
                    setPrivacySettings(prev => ({ ...prev, allowMessages: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Coleta de Dados para Melhorias</Label>
                  <p className="text-xs text-[#64748B] dark:text-white/60">
                    Ajudar a melhorar a plataforma compartilhando dados anônimos
                  </p>
                </div>
                <Switch
                  checked={privacySettings.dataCollection}
                  onCheckedChange={(checked) => 
                    setPrivacySettings(prev => ({ ...prev, dataCollection: checked }))
                  }
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => toggleSection(null)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => saveSettings("privacy_settings", privacySettings)}
                  className="bg-[#FF6B00] hover:bg-[#FF6B00]/90"
                >
                  Salvar Configurações
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white dark:bg-[#0A2540] rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Diamond className="h-4 w-4 text-[#FF6B00]" />
                    <span className="font-medium">Saldo Atual</span>
                  </div>
                  <p className="text-2xl font-bold text-[#29335C] dark:text-white">
                    {walletSettings.balance.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: walletSettings.currency
                    })}
                  </p>
                </div>

                <div className="p-4 bg-white dark:bg-[#0A2540] rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="h-4 w-4 text-[#FF6B00]" />
                    <span className="font-medium">School Points</span>
                  </div>
                  <p className="text-2xl font-bold text-[#29335C] dark:text-white">
                    {userProfile?.points || 0}
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="spendingLimit">Limite de Gastos (R$)</Label>
                <Input
                  id="spendingLimit"
                  type="number"
                  value={walletSettings.spendingLimit}
                  onChange={(e) => setWalletSettings(prev => ({ ...prev, spendingLimit: Number(e.target.value) }))}
                  className="mt-1"
                  placeholder="0 = Sem limite"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Recarga Automática</Label>
                  <p className="text-xs text-[#64748B] dark:text-white/60">
                    Recarregar automaticamente quando o saldo for baixo
                  </p>
                </div>
                <Switch
                  checked={walletSettings.autoTopUp}
                  onCheckedChange={(checked) => 
                    setWalletSettings(prev => ({ ...prev, autoTopUp: checked }))
                  }
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => toggleSection(null)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => saveSettings("wallet_settings", walletSettings)}
                  className="bg-[#FF6B00] hover:bg-[#FF6B00]/90"
                >
                  Salvar Configurações
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}