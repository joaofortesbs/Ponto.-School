import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Mail, Phone, MapPin, Calendar, Check, Star } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

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
  useEffect(() => {
    const fetchBirthDate = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user && user.user_metadata?.birth_date && contactInfo.birthDate === "Adicionar data de nascimento") {
          setContactInfo({
            ...contactInfo,
            birthDate: user.user_metadata.birth_date
          });
          await saveContactInfo();
        }
      } catch (error) {
        console.error("Erro ao buscar data de nascimento:", error);
      }
    };
    
    fetchBirthDate();
  }, []);

  const [containerHeight, setContainerHeight] = useState("420px");
  
  useEffect(() => {
    // Mantém a altura fixa mesmo quando está expandido
    setContainerHeight("420px");
  }, [expandedSection]);
  
  // Função para formatar a data de nascimento
  const formatBirthDate = (value: string) => {
    // Remove todos os caracteres não-numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara dd/mm/aaaa
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else if (numbers.length <= 8) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4)}`;
    }
    
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
  };
  
  // Manipulador para o campo de data de nascimento
  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatBirthDate(e.target.value);
    setContactInfo({
      ...contactInfo,
      birthDate: formattedValue || "Adicionar data de nascimento",
    });
  };

  return (
    <div 
      className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-6 shadow-sm w-full transition-all duration-300 overflow-y-auto backdrop-blur-sm bg-gradient-to-br from-white to-white/90 dark:from-[#0A2540] dark:to-[#0A2540]/95"
      style={{ height: containerHeight, minHeight: "420px" }}
    >
      <motion.div 
        className="flex justify-between items-center mb-5"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-8 bg-gradient-to-b from-[#FF6B00] to-[#FF9D4D] rounded-md"></div>
          <h3 className="text-lg font-bold text-[#29335C] dark:text-white">
            Informações de Contato
          </h3>
          <div className="flex items-center bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded-full ml-1">
            <Check className="h-3 w-3 text-green-500 dark:text-green-400 mr-0.5" />
            <span className="text-[10px] text-green-600 dark:text-green-400">Verificado</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-[#64748B] dark:text-white/60 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 rounded-full transition-all duration-300"
          onClick={() => toggleSection("contact")}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </motion.div>

      {expandedSection === "contact" && (
        <div className="p-4 bg-white/80 dark:bg-[#0A2540]/90 rounded-lg border border-[#E0E1DD] dark:border-white/10 mb-4 backdrop-blur-lg max-h-[320px] overflow-y-auto">
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
                placeholder="DD/MM/AAAA"
                maxLength={10}
                onChange={handleBirthDateChange}
                className="border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10"
              />
              <p className="text-xs text-[#64748B] dark:text-white/60 mt-1">
                Digite apenas números, o formato será aplicado automaticamente (DD/MM/AAAA)
              </p>
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

      <div className={`space-y-4 ${expandedSection === "contact" ? "max-h-[100px] overflow-y-auto" : ""}`}>
        <motion.div 
          className="flex items-center gap-3 bg-gradient-to-r from-white/20 to-transparent dark:from-white/5 p-3 rounded-lg hover:from-[#FF6B00]/10 transition-all duration-300 border border-white/10 backdrop-blur-md group"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF9D4D] flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-[#FF6B00]/20 transition-all duration-300">
            <Mail className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-[#64748B] dark:text-white/60 font-medium flex items-center">
              Email
              <span className="ml-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[9px] px-1 py-0.5 rounded-sm">Principal</span>
            </p>
            <p className="text-sm font-semibold text-[#29335C] dark:text-white">
              {contactInfo.email}
            </p>
          </div>
        </motion.div>

        <motion.div 
          className="flex items-center gap-3 bg-gradient-to-r from-white/20 to-transparent dark:from-white/5 p-3 rounded-lg hover:from-[#FF6B00]/10 transition-all duration-300 border border-white/10 backdrop-blur-md group"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF9D4D] flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-[#FF6B00]/20 transition-all duration-300">
            <Phone className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-[#64748B] dark:text-white/60 font-medium">
              Telefone
            </p>
            <p className="text-sm font-semibold text-[#29335C] dark:text-white">
              {contactInfo.phone}
            </p>
          </div>
        </motion.div>

        <motion.div 
          className="flex items-center gap-3 bg-gradient-to-r from-white/20 to-transparent dark:from-white/5 p-3 rounded-lg hover:from-[#FF6B00]/10 transition-all duration-300 border border-white/10 backdrop-blur-md group"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF9D4D] flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-[#FF6B00]/20 transition-all duration-300">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-[#64748B] dark:text-white/60 font-medium">
              Localização
            </p>
            <p className="text-sm font-semibold text-[#29335C] dark:text-white">
              {contactInfo.location}
            </p>
          </div>
        </motion.div>

        <motion.div 
          className="flex items-center gap-3 bg-gradient-to-r from-white/20 to-transparent dark:from-white/5 p-3 rounded-lg hover:from-[#FF6B00]/10 transition-all duration-300 border border-white/10 backdrop-blur-md group"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF9D4D] flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-[#FF6B00]/20 transition-all duration-300">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-[#64748B] dark:text-white/60 font-medium flex items-center">
              Data de Nascimento
              {contactInfo.birthDate !== "Adicionar data de nascimento" && (
                <Star className="h-3 w-3 text-yellow-500 ml-1" />
              )}
            </p>
            <p className="text-sm font-semibold text-[#29335C] dark:text-white">
              {contactInfo.birthDate}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}