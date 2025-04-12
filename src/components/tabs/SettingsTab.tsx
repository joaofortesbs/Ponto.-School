import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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

  return (
    <div className="space-y-6">
      {/* Account Settings */}
      <div>
        <div
          className="flex justify-between items-center p-4 bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10 cursor-pointer"
          onClick={() => toggleSection("account")}
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
          <div className="mt-3 p-4 bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-[#29335C] dark:text-white mb-1"
                >
                  Nome Completo
                </label>
                <Input
                  id="name"
                  defaultValue={
                    userProfile?.display_name || userProfile?.username || ""
                  }
                  className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10"
                  readOnly={true}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#29335C] dark:text-white mb-1"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={userProfile?.email || contactInfo.email}
                  className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10"
                  readOnly={true}
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-[#29335C] dark:text-white mb-1"
                >
                  Telefone
                </label>
                <Input
                  id="phone"
                  defaultValue={
                    contactInfo.phone === "Adicionar telefone"
                      ? ""
                      : contactInfo.phone
                  }
                  placeholder="Adicionar telefone"
                  className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-[#29335C] dark:text-white mb-1"
                >
                  Localização
                </label>
                <Input
                  id="location"
                  defaultValue={
                    contactInfo.location === "Adicionar localização"
                      ? ""
                      : contactInfo.location
                  }
                  placeholder="Adicionar localização"
                  className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-[#29335C] dark:text-white mb-1"
                >
                  Biografia
                </label>
                <Textarea
                  id="bio"
                  className="min-h-[100px] border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10"
                  defaultValue={aboutMe}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  className="border-[#E0E1DD] dark:border-white/10 text-[#64748B] dark:text-white/60"
                  onClick={() => toggleSection(null)}
                >
                  Cancelar
                </Button>
                <Button
                  className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                  onClick={async () => {
                    try {
                      const {
                        data: { user },
                      } = await supabase.auth.getUser();
                      if (user) {
                        const nameInput = document.getElementById(
                          "name",
                        ) as HTMLInputElement;
                        const emailInput = document.getElementById(
                          "email",
                        ) as HTMLInputElement;
                        const phoneInput = document.getElementById(
                          "phone",
                        ) as HTMLInputElement;
                        const locationInput = document.getElementById(
                          "location",
                        ) as HTMLInputElement;
                        const bioInput = document.getElementById(
                          "bio",
                        ) as HTMLTextAreaElement;

                        const { error } = await supabase
                          .from("profiles")
                          .update({
                            // Keep the display_name and email unchanged
                            // display_name: nameInput.value,
                            // email: emailInput.value,
                            phone: phoneInput.value || null,
                            location: locationInput.value || null,
                            bio: bioInput.value || null,
                          })
                          .eq("id", user.id);

                        if (error) {
                          console.error("Error updating profile:", error);
                        } else {
                          // Update local state
                          setUserProfile((prev) =>
                            prev
                              ? { ...prev, display_name: nameInput.value }
                              : null,
                          );
                          setContactInfo({
                            email: userProfile?.email || emailInput.value,
                            phone: phoneInput.value || "Adicionar telefone",
                            location:
                              locationInput.value || "Adicionar localização",
                            birthDate: contactInfo.birthDate,
                          });
                          setAboutMe(bioInput.value);
                        }
                      }
                    } catch (error) {
                      console.error("Error:", error);
                    }
                    toggleSection(null);
                  }}
                >
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Security Settings */}
      <div>
        <div
          className="flex justify-between items-center p-4 bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10 cursor-pointer"
          onClick={() => toggleSection("security")}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
              <Lock className="h-5 w-5 text-[#FF6B00]" />
            </div>
            <div>
              <h4 className="text-[#29335C] dark:text-white font-medium">
                Segurança
              </h4>
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
          <div className="mt-3 p-4 bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="current-password"
                  className="block text-sm font-medium text-[#29335C] dark:text-white mb-1"
                >
                  Senha Atual
                </label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPassword ? "text" : "password"}
                    className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#64748B] dark:text-white/60 hover:text-[#29335C] dark:hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="new-password"
                  className="block text-sm font-medium text-[#29335C] dark:text-white mb-1"
                >
                  Nova Senha
                </label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#64748B] dark:text-white/60 hover:text-[#29335C] dark:hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-[#29335C] dark:text-white mb-1"
                >
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#64748B] dark:text-white/60 hover:text-[#29335C] dark:hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  className="border-[#E0E1DD] dark:border-white/10 text-[#64748B] dark:text-white/60"
                  onClick={() => toggleSection(null)}
                >
                  Cancelar
                </Button>
                <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                  Atualizar Senha
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notification Settings */}
      <div>
        <div
          className="flex justify-between items-center p-4 bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10 cursor-pointer"
          onClick={() => toggleSection("notifications")}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
              <Bell className="h-5 w-5 text-[#FF6B00]" />
            </div>
            <div>
              <h4 className="text-[#29335C] dark:text-white font-medium">
                Notificações
              </h4>
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
          <div className="mt-3 p-4 bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-medium text-[#29335C] dark:text-white">
                    Notificações por Email
                  </h5>
                  <p className="text-xs text-[#64748B] dark:text-white/60">
                    Receba atualizações por email
                  </p>
                </div>
                <div className="h-6 w-11 bg-[#FF6B00] rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 bg-white h-4 w-4 rounded-full"></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-medium text-[#29335C] dark:text-white">
                    Notificações Push
                  </h5>
                  <p className="text-xs text-[#64748B] dark:text-white/60">
                    Receba notificações no navegador
                  </p>
                </div>
                <div className="h-6 w-11 bg-[#FF6B00] rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 bg-white h-4 w-4 rounded-full"></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-medium text-[#29335C] dark:text-white">
                    Notificações de Mensagens
                  </h5>
                  <p className="text-xs text-[#64748B] dark:text-white/60">
                    Receba notificações de novas mensagens
                  </p>
                </div>
                <div className="h-6 w-11 bg-[#E0E1DD] dark:bg-[#29335C]/50 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 bg-white h-4 w-4 rounded-full"></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-medium text-[#29335C] dark:text-white">
                    Notificações de Atividades
                  </h5>
                  <p className="text-xs text-[#64748B] dark:text-white/60">
                    Receba notificações de atividades nas suas turmas
                  </p>
                </div>
                <div className="h-6 w-11 bg-[#FF6B00] rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 bg-white h-4 w-4 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Settings */}
      <div>
        <div
          className="flex justify-between items-center p-4 bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10 cursor-pointer"
          onClick={() => toggleSection("payment")}
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
          <div className="mt-3 p-4 bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10">
            <div className="space-y-6">
              <div>
                <h5 className="text-base font-medium text-[#29335C] dark:text-white mb-3">
                  Plano Atual
                </h5>
                <div className="bg-[#f7f9fa] dark:bg-[#29335C]/20 p-4 rounded-lg border border-[#E0E1DD] dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FFD700] to-[#FF6B00] flex items-center justify-center">
                        <Diamond className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h6 className="text-[#29335C] dark:text-white font-medium">
                          {userProfile?.plan_type === "full" 
                            ? "Plano Full" 
                            : userProfile?.plan_type === "premium" 
                              ? "Plano Premium" 
                              : "Plano Lite"}
                        </h6>
                        <p className="text-xs text-[#64748B] dark:text-white/60">
                          Renovação em 15/07/2024
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-[#FF6B00] text-white">Ativo</Badge>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-base font-medium text-[#29335C] dark:text-white mb-3">
                  Métodos de Pagamento
                </h5>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-[#f7f9fa] dark:bg-[#29335C]/20 rounded-lg border border-[#E0E1DD] dark:border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white dark:bg-[#0A2540] flex items-center justify-center">
                        <img
                          src="https://www.svgrepo.com/show/473731/visa.svg"
                          alt="Visa"
                          className="h-6 w-6"
                        />
                      </div>
                      <div>
                        <h6 className="text-[#29335C] dark:text-white font-medium">
                          Visa terminando em 4242
                        </h6>
                        <p className="text-xs text-[#64748B] dark:text-white/60">
                          Expira em 12/2025
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-[#29335C]/10 text-[#29335C] dark:bg-white/10 dark:text-white">
                      Padrão
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#f7f9fa] dark:bg-[#29335C]/20 rounded-lg border border-[#E0E1DD] dark:border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white dark:bg-[#0A2540] flex items-center justify-center">
                        <img
                          src="https://www.svgrepo.com/show/473729/mastercard.svg"
                          alt="Mastercard"
                          className="h-6 w-6"
                        />
                      </div>
                      <div>
                        <h6 className="text-[#29335C] dark:text-white font-medium">
                          Mastercard terminando em 8888
                        </h6>
                        <p className="text-xs text-[#64748B] dark:text-white/60">
                          Expira em 09/2024
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-[#64748B] dark:text-white/60 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
                    >
                      Definir como padrão
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full border-dashed border-[#E0E1DD] dark:border-white/10 text-[#64748B] dark:text-white/60 hover:border-[#FF6B00] hover:text-[#FF6B00]"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Adicionar Método de
                    Pagamento
                  </Button>
                </div>
              </div>

              <div>
                <h5 className="text-base font-medium text-[#29335C] dark:text-white mb-3">
                  Histórico de Pagamentos
                </h5>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-[#f7f9fa] dark:bg-[#29335C]/20 rounded-lg border border-[#E0E1DD] dark:border-white/10">
                    <div>
                      <h6 className="text-[#29335C] dark:text-white font-medium">
                        Plano Premium - Mensal
                      </h6>
                      <p className="text-xs text-[#64748B] dark:text-white/60">
                        15/06/2024
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#29335C] dark:text-white font-medium">
                        R$ 49,90
                      </p>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs">
                        Pago
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#f7f9fa] dark:bg-[#29335C]/20 rounded-lg border border-[#E0E1DD] dark:border-white/10">
                    <div>
                      <h6 className="text-[#29335C] dark:text-white font-medium">
                        Plano Premium - Mensal
                      </h6>
                      <p className="text-xs text-[#64748B] dark:text-white/60">
                        15/05/2024
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#29335C] dark:text-white font-medium">
                        R$ 49,90
                      </p>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs">
                        Pago
                      </Badge>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    className="w-full text-[#FF6B00] text-xs flex items-center justify-center gap-1 hover:bg-[#FF6B00]/10"
                  >
                    Ver Histórico Completo <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  className="border-[#E0E1DD] dark:border-white/10 text-[#64748B] dark:text-white/60"
                  onClick={() => toggleSection(null)}
                >
                  Cancelar
                </Button>
                <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Privacy Settings */}
      <div>
        <div
          className="flex justify-between items-center p-4 bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10 cursor-pointer"
          onClick={() => toggleSection("privacy")}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-[#FF6B00]" />
            </div>
            <div>
              <h4 className="text-[#29335C] dark:text-white font-medium">
                Privacidade
              </h4>
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
          <div className="mt-3 p-4 bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-medium text-[#29335C] dark:text-white">
                    Perfil Público
                  </h5>
                  <p className="text-xs text-[#64748B] dark:text-white/60">
                    Permitir que outros usuários vejam seu perfil
                  </p>
                </div>
                <div className="h-6 w-11 bg-[#FF6B00] rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 bg-white h-4 w-4 rounded-full"></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-medium text-[#29335C] dark:text-white">
                    Mostrar Status Online
                  </h5>
                  <p className="text-xs text-[#64748B] dark:text-white/60">
                    Permitir que outros usuários vejam quando você está online
                  </p>
                </div>
                <div className="h-6 w-11 bg-[#FF6B00] rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 bg-white h-4 w-4 rounded-full"></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-medium text-[#29335C] dark:text-white">
                    Compartilhar Progresso
                  </h5>
                  <p className="text-xs text-[#64748B] dark:text-white/60">
                    Permitir que outros usuários vejam seu progresso de estudos
                  </p>
                </div>
                <div className="h-6 w-11 bg-[#E0E1DD] dark:bg-[#29335C]/50 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 bg-white h-4 w-4 rounded-full"></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-medium text-[#29335C] dark:text-white">
                    Permitir Mensagens
                  </h5>
                  <p className="text-xs text-[#64748B] dark:text-white/60">
                    Permitir que outros usuários enviem mensagens para você
                  </p>
                </div>
                <div className="h-6 w-11 bg-[#FF6B00] rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 bg-white h-4 w-4 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Wallet Settings */}
      <div>
        <div
          className="flex justify-between items-center p-4 bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10 cursor-pointer"
          onClick={() => toggleSection("wallet")}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-[#FF6B00]" />
            </div>
            <div>
              <h4 className="text-[#29335C] dark:text-white font-medium">
                Carteira
              </h4>
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
          <div className="mt-3 p-4 bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10">
            <div className="space-y-6">
              <div>
                <h5 className="text-base font-medium text-[#29335C] dark:text-white mb-3">
                  Saldo Atual
                </h5>
                <div className="bg-gradient-to-r from-[#FFD700] to-[#FF6B00] p-4 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-80">Moedas Epictus</p>
                      <h3 className="text-2xl font-bold mt-1">1.250</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <img
                        src="https://www.svgrepo.com/show/488200/coin-4.svg"
                        alt="Moedas"
                        className="h-8 w-8"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-base font-medium text-[#29335C] dark:text-white mb-3">
                  Histórico de Transações
                </h5>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-[#f7f9fa] dark:bg-[#29335C]/20 rounded-lg border border-[#E0E1DD] dark:border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Plus className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h6 className="text-[#29335C] dark:text-white font-medium">
                          Completou Desafio Diário
                        </h6>
                        <p className="text-xs text-[#64748B] dark:text-white/60">
                          Hoje, 10:30
                        </p>
                      </div>
                    </div>
                    <p className="text-green-600 dark:text-green-400 font-medium">
                      +50
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#f7f9fa] dark:bg-[#29335C]/20 rounded-lg border border-[#E0E1DD] dark:border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Plus className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h6 className="text-[#29335C] dark:text-white font-medium">
                          Completou Aula de Matemática
                        </h6>
                        <p className="text-xs text-[#64748B] dark:text-white/60">
                          Ontem, 15:45
                        </p>
                      </div>
                    </div>
                    <p className="text-green-600 dark:text-green-400 font-medium">
                      +100
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#f7f9fa] dark:bg-[#29335C]/20 rounded-lg border border-[#E0E1DD] dark:border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h6 className="text-[#29335C] dark:text-white font-medium">
                          Comprou Item na Loja
                        </h6>
                        <p className="text-xs text-[#64748B] dark:text-white/60">
                          3 dias atrás
                        </p>
                      </div>
                    </div>
                    <p className="text-red-600 dark:text-red-400 font-medium">
                      -200
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    className="w-full text-[#FF6B00] text-xs flex items-center justify-center gap-1 hover:bg-[#FF6B00]/10"
                  >
                    Ver Histórico Completo <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
