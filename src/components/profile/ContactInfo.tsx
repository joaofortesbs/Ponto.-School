
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Mail, Phone, MapPin, Calendar, Save, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

  // Variants for animations
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
        ease: [0.6, 0.05, -0.01, 0.9]
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.4,
        ease: [0.6, 0.05, -0.01, 0.9]
      }
    }
  };

  const formVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: { 
      height: "auto", 
      opacity: 1,
      transition: {
        height: { duration: 0.4 },
        opacity: { duration: 0.3, delay: 0.1 }
      }
    },
    exit: {
      height: 0,
      opacity: 0,
      transition: {
        opacity: { duration: 0.2 },
        height: { duration: 0.3, delay: 0.1 }
      }
    }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.05,
      boxShadow: "0 5px 15px rgba(255, 107, 0, 0.4)"
    },
    tap: { scale: 0.95 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-gradient-to-b from-navy-800 to-navy-900 rounded-xl border border-gray-200/20 dark:border-gray-700/20 shadow-lg overflow-hidden"
    >
      <div className="p-4 flex justify-between items-center border-b border-gray-700/50">
        <motion.h3 
          className="text-lg font-bold text-white flex items-center gap-2"
          whileHover={{ x: 3 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.span 
            animate={{ 
              rotate: [0, 5, 0, -5, 0],
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatDelay: 8
            }}
          >
            <Mail className="w-5 h-5 text-orange-400" />
          </motion.span>
          Informações de Contato
        </motion.h3>
        <motion.div
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-300 hover:text-orange-400 hover:bg-orange-400/10"
            onClick={() => toggleSection("contact")}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>

      <AnimatePresence>
        {expandedSection === "contact" && (
          <motion.div 
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={formVariants}
            className="overflow-hidden bg-gradient-to-b from-navy-700/50 to-navy-800/50 border-b border-gray-700/50"
          >
            <div className="p-5">
              <motion.h4 
                className="text-base font-semibold text-white mb-4 flex items-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="w-1.5 h-6 bg-orange-500 rounded-full mr-2 inline-block"></span>
                Editar Informações de Contato
              </motion.h4>
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
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
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
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
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
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
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
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
                </motion.div>
                <motion.div 
                  className="flex justify-end gap-3 mt-5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:text-white hover:bg-navy-600"
                    onClick={() => toggleSection(null)}
                  >
                    Cancelar
                  </Button>
                  <motion.div
                    variants={buttonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/20"
                      onClick={saveContactInfo}
                    >
                      <Save className="w-4 h-4 mr-2" /> Salvar
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 space-y-2">
        <motion.div 
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 backdrop-blur-sm border border-white/5 transition-all duration-300"
          variants={itemVariants}
          whileHover={{ 
            x: 5, 
            backgroundColor: "rgba(255,255,255,0.08)",
            borderColor: "rgba(255,255,255,0.1)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center flex-shrink-0 border border-orange-500/30">
            <Mail className="h-5 w-5 text-orange-400" />
          </div>
          <div className="flex-grow">
            <p className="text-xs text-gray-400 mb-0.5">Email</p>
            <p className="text-sm font-medium text-white group-hover:text-orange-300 transition-colors">
              {contactInfo.email}
            </p>
          </div>
          <motion.div 
            className="opacity-0 group-hover:opacity-100"
            whileHover={{ scale: 1.2, rotate: 10 }}
          >
            <ArrowRight className="h-4 w-4 text-orange-400" />
          </motion.div>
        </motion.div>

        <motion.div 
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 backdrop-blur-sm border border-white/5 transition-all duration-300"
          variants={itemVariants}
          whileHover={{ 
            x: 5, 
            backgroundColor: "rgba(255,255,255,0.08)",
            borderColor: "rgba(255,255,255,0.1)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center flex-shrink-0 border border-orange-500/30">
            <Phone className="h-5 w-5 text-orange-400" />
          </div>
          <div className="flex-grow">
            <p className="text-xs text-gray-400 mb-0.5">Telefone</p>
            <p className="text-sm font-medium text-white group-hover:text-orange-300 transition-colors">
              {contactInfo.phone}
            </p>
          </div>
          <motion.div 
            className="opacity-0 group-hover:opacity-100"
            whileHover={{ scale: 1.2, rotate: 10 }}
          >
            <ArrowRight className="h-4 w-4 text-orange-400" />
          </motion.div>
        </motion.div>

        <motion.div 
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 backdrop-blur-sm border border-white/5 transition-all duration-300"
          variants={itemVariants}
          whileHover={{ 
            x: 5, 
            backgroundColor: "rgba(255,255,255,0.08)",
            borderColor: "rgba(255,255,255,0.1)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center flex-shrink-0 border border-orange-500/30">
            <MapPin className="h-5 w-5 text-orange-400" />
          </div>
          <div className="flex-grow">
            <p className="text-xs text-gray-400 mb-0.5">Localização</p>
            <p className="text-sm font-medium text-white group-hover:text-orange-300 transition-colors">
              {contactInfo.location}
            </p>
          </div>
          <motion.div 
            className="opacity-0 group-hover:opacity-100"
            whileHover={{ scale: 1.2, rotate: 10 }}
          >
            <ArrowRight className="h-4 w-4 text-orange-400" />
          </motion.div>
        </motion.div>

        <motion.div 
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 backdrop-blur-sm border border-white/5 transition-all duration-300"
          variants={itemVariants}
          whileHover={{ 
            x: 5, 
            backgroundColor: "rgba(255,255,255,0.08)",
            borderColor: "rgba(255,255,255,0.1)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center flex-shrink-0 border border-orange-500/30">
            <Calendar className="h-5 w-5 text-orange-400" />
          </div>
          <div className="flex-grow">
            <p className="text-xs text-gray-400 mb-0.5">Data de Nascimento</p>
            <p className="text-sm font-medium text-white group-hover:text-orange-300 transition-colors">
              {contactInfo.birthDate}
            </p>
          </div>
          <motion.div 
            className="opacity-0 group-hover:opacity-100"
            whileHover={{ scale: 1.2, rotate: 10 }}
          >
            <ArrowRight className="h-4 w-4 text-orange-400" />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
