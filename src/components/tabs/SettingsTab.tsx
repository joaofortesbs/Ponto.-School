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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";


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
        {/* ...rest of the security settings... */}
      </div>

      {/* Notification Settings */}
      <div>
        {/* ...rest of the notification settings... */}
      </div>

      {/* Payment Settings */}
      <div>
        {/* ...rest of the payment settings... */}
      </div>

      {/* Privacy Settings */}
      <div>
        {/* ...rest of the privacy settings... */}
      </div>

      {/* Wallet Settings */}
      <div>
        {/* ...rest of the wallet settings... */}
      </div>


      {/* Plan Settings */}
      <div>
        <div
          className="flex justify-between items-center p-4 bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10 cursor-pointer"
          onClick={() => toggleSection("plan")}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-[#FF6B00]" /> {/* Icon Placeholder */}
            </div>
            <div>
              <h4 className="text-[#29335C] dark:text-white font-medium">
                Tipo de Plano
              </h4>
              <p className="text-xs text-[#64748B] dark:text-white/60">
                Gerencie seu plano
              </p>
            </div>
          </div>
          {expandedSection === "plan" ? (
            <ChevronUp className="h-5 w-5 text-[#64748B] dark:text-white/60" />
          ) : (
            <ChevronDown className="h-5 w-5 text-[#64748B] dark:text-white/60" />
          )}
        </div>

        {expandedSection === "plan" && (
          <div className="mt-3 p-4 bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10">
            <div className="space-y-4 mt-6">
              <h3 className="text-base font-medium text-[#29335C] dark:text-white">
                Tipo de Plano
              </h3>
              <div className="space-y-2">
                <p className="text-sm text-[#64748B] dark:text-white/60">
                  Seu plano atual:{" "}
                  <span className="font-medium text-[#FF6B00]">
                    {userProfile?.plan_type === "full"
                      ? "Plano Full"
                      : userProfile?.plan_type === "premium"
                      ? "Plano Premium"
                      : "Plano Lite"}
                  </span>
                </p>
                <div className="flex items-center gap-2">
                  <Select
                    defaultValue={userProfile?.plan_type || "lite"}
                    onValueChange={async (value) => {
                      try {
                        // Atualizar o tipo de plano no perfil
                        await supabase
                          .from("profiles")
                          .update({ plan_type: value })
                          .eq("id", userProfile?.id);

                        // Atualizar também no localStorage (opcional)
                        localStorage.setItem("userPlanType", value);

                        // Atualizar o estado local
                        if (setUserProfile) {
                          setUserProfile({
                            ...userProfile,
                            plan_type: value,
                          });
                        }

                        toast({
                          title: "Plano atualizado",
                          description:
                            "Seu tipo de plano foi atualizado com sucesso.",
                        });
                      } catch (error) {
                        console.error("Erro ao atualizar plano:", error);
                        toast({
                          title: "Erro",
                          description:
                            "Não foi possível atualizar seu plano. Tente novamente.",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Selecione um plano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lite">Plano Lite</SelectItem>
                      <SelectItem value="full">Plano Full</SelectItem>
                      <SelectItem value="premium">Plano Premium</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() =>
                      window.open("/plan-selection-redesigned", "_blank")
                    }
                  >
                    Ver detalhes dos planos
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