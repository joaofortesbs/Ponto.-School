import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Mail, Phone, MapPin, Calendar } from "lucide-react";

interface ContactInfoProps {
  contactInfo: {
    email: string;
    phone: string;
    location: string;
    birthDate: string;
  };
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
  saveContactInfo: () => void;
}

export default function ContactInfo({
  contactInfo,
  expandedSection,
  toggleSection,
  setContactInfo,
  saveContactInfo,
}: ContactInfoProps) {
  return (
    <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-[#29335C] dark:text-white">
          Informações de Contato
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-[#64748B] dark:text-white/60 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
          onClick={() => toggleSection("contact")}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </div>

      {expandedSection === "contact" && (
        <div className="p-4 bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10 mb-4">
          <h4 className="text-base font-medium text-[#29335C] dark:text-white mb-3">
            Editar Informações de Contato
          </h4>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="contact-email"
                className="block text-sm font-medium text-[#29335C] dark:text-white mb-1"
              >
                Email
              </label>
              <Input
                id="contact-email"
                value={contactInfo.email}
                onChange={(e) =>
                  setContactInfo({ ...contactInfo, email: e.target.value })
                }
                className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10"
              />
            </div>
            <div>
              <label
                htmlFor="contact-phone"
                className="block text-sm font-medium text-[#29335C] dark:text-white mb-1"
              >
                Telefone
              </label>
              <Input
                id="contact-phone"
                value={
                  contactInfo.phone === "Adicionar telefone"
                    ? ""
                    : contactInfo.phone
                }
                placeholder="Adicionar telefone"
                onChange={(e) =>
                  setContactInfo({
                    ...contactInfo,
                    phone: e.target.value || "Adicionar telefone",
                  })
                }
                className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10"
              />
            </div>
            <div>
              <label
                htmlFor="contact-location"
                className="block text-sm font-medium text-[#29335C] dark:text-white mb-1"
              >
                Localização
              </label>
              <Input
                id="contact-location"
                value={
                  contactInfo.location === "Adicionar localização"
                    ? ""
                    : contactInfo.location
                }
                placeholder="Adicionar localização"
                onChange={(e) =>
                  setContactInfo({
                    ...contactInfo,
                    location: e.target.value || "Adicionar localização",
                  })
                }
                className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10"
              />
            </div>
            <div>
              <label
                htmlFor="contact-birthdate"
                className="block text-sm font-medium text-[#29335C] dark:text-white mb-1"
              >
                Data de Nascimento
              </label>
              <Input
                id="contact-birthdate"
                value={
                  contactInfo.birthDate === "Adicionar data de nascimento"
                    ? ""
                    : contactInfo.birthDate
                }
                placeholder="Adicionar data de nascimento"
                onChange={(e) =>
                  setContactInfo({
                    ...contactInfo,
                    birthDate: e.target.value || "Adicionar data de nascimento",
                  })
                }
                className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                className="border-[#E0E1DD] dark:border-white/10 text-[#64748B] dark:text-white/60"
                onClick={() => toggleSection(null)}
              >
                Cancelar
              </Button>
              <Button
                className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                onClick={saveContactInfo}
              >
                Salvar Alterações
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center flex-shrink-0">
            <Mail className="h-5 w-5 text-[#FF6B00]" />
          </div>
          <div>
            <p className="text-xs text-[#64748B] dark:text-white/60">Email</p>
            <p className="text-sm font-medium text-[#29335C] dark:text-white">
              {contactInfo.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center flex-shrink-0">
            <Phone className="h-5 w-5 text-[#FF6B00]" />
          </div>
          <div>
            <p className="text-xs text-[#64748B] dark:text-white/60">
              Telefone
            </p>
            <p className="text-sm font-medium text-[#29335C] dark:text-white">
              {contactInfo.phone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center flex-shrink-0">
            <MapPin className="h-5 w-5 text-[#FF6B00]" />
          </div>
          <div>
            <p className="text-xs text-[#64748B] dark:text-white/60">
              Localização
            </p>
            <p className="text-sm font-medium text-[#29335C] dark:text-white">
              {contactInfo.location}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center flex-shrink-0">
            <Calendar className="h-5 w-5 text-[#FF6B00]" />
          </div>
          <div>
            <p className="text-xs text-[#64748B] dark:text-white/60">
              Data de Nascimento
            </p>
            <p className="text-sm font-medium text-[#29335C] dark:text-white">
              {contactInfo.birthDate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
