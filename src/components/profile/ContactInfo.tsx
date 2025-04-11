
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Mail, Phone, MapPin, Calendar, Save } from "lucide-react";
import { motion } from "framer-motion";
import type { UserProfile } from "@/types/user-profile";

interface ContactInfoProps {
  userProfile: UserProfile | null;
  isEditing: boolean;
}

export default function ContactInfo({ userProfile, isEditing }: ContactInfoProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [contactInfo, setContactInfo] = useState({
    email: userProfile?.email || "usuario@exemplo.com",
    phone: userProfile?.phone || "Adicionar telefone",
    location: userProfile?.location || "Adicionar localização",
    birthDate: userProfile?.birth_date || "Adicionar data de nascimento"
  });

  const toggleSection = (section: string | null) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const saveContactInfo = () => {
    // Aqui você adicionaria a lógica para salvar no banco de dados
    setExpandedSection(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-navy-800 dark:bg-navy-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden"
    >
      <div className="p-4 flex justify-between items-center border-b border-gray-700">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Mail className="w-5 h-5 text-orange-400" />
          Informações de Contato
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-300 hover:text-orange-400 hover:bg-orange-400/10"
          onClick={() => toggleSection("contact")}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </div>

      {expandedSection === "contact" && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="p-4 bg-navy-700/50 dark:bg-navy-800/50 border-b border-gray-700"
        >
          <h4 className="text-base font-medium text-white mb-3">
            Editar Informações de Contato
          </h4>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="contact-email"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Email
              </label>
              <Input
                id="contact-email"
                value={contactInfo.email}
                onChange={(e) =>
                  setContactInfo({ ...contactInfo, email: e.target.value })
                }
                className="bg-navy-700 border-gray-600 text-white focus:border-orange-400 focus:ring-orange-400/10"
              />
            </div>
            <div>
              <label
                htmlFor="contact-phone"
                className="block text-sm font-medium text-gray-300 mb-1"
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
                className="bg-navy-700 border-gray-600 text-white focus:border-orange-400 focus:ring-orange-400/10"
              />
            </div>
            <div>
              <label
                htmlFor="contact-location"
                className="block text-sm font-medium text-gray-300 mb-1"
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
                className="bg-navy-700 border-gray-600 text-white focus:border-orange-400 focus:ring-orange-400/10"
              />
            </div>
            <div>
              <label
                htmlFor="contact-birthdate"
                className="block text-sm font-medium text-gray-300 mb-1"
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
                className="bg-navy-700 border-gray-600 text-white focus:border-orange-400 focus:ring-orange-400/10"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                className="border-gray-600 text-gray-300 hover:text-white hover:bg-navy-600"
                onClick={() => toggleSection(null)}
              >
                Cancelar
              </Button>
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={saveContactInfo}
              >
                <Save className="w-4 h-4 mr-2" /> Salvar
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="p-4 space-y-4">
        <motion.div 
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
          whileHover={{ x: 5 }}
        >
          <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
            <Mail className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Email</p>
            <p className="text-sm font-medium text-white">
              {contactInfo.email}
            </p>
          </div>
        </motion.div>

        <motion.div 
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
          whileHover={{ x: 5 }}
        >
          <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
            <Phone className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400">
              Telefone
            </p>
            <p className="text-sm font-medium text-white">
              {contactInfo.phone}
            </p>
          </div>
        </motion.div>

        <motion.div 
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
          whileHover={{ x: 5 }}
        >
          <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
            <MapPin className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400">
              Localização
            </p>
            <p className="text-sm font-medium text-white">
              {contactInfo.location}
            </p>
          </div>
        </motion.div>

        <motion.div 
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
          whileHover={{ x: 5 }}
        >
          <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
            <Calendar className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400">
              Data de Nascimento
            </p>
            <p className="text-sm font-medium text-white">
              {contactInfo.birthDate}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
