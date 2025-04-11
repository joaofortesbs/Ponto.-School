import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, MapPin, Calendar, Edit, Save, X, Plus } from "lucide-react";
import type { UserProfile } from "@/types/user-profile";
import { useMediaQuery } from "@/lib/utils"; // Added import

interface ContactInfoProps {
  userProfile: UserProfile | null;
  isEditing: boolean;
}

export default function ContactInfo({ userProfile, isEditing }: ContactInfoProps) {
  const [localIsEditing, setLocalIsEditing] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    email: userProfile?.email || "usuario@exemplo.com",
    phone: "+55 (11) 98765-4321",
    location: "São Paulo, SP",
    birthday: "15 de Janeiro"
  });

  const toggleEditing = () => {
    setLocalIsEditing(!localIsEditing);
  };

  const saveContactInfo = () => {
    // Aqui você adicionaria a lógica para salvar no banco de dados
    setLocalIsEditing(false);
  };

  const actualIsEditing = isEditing || localIsEditing;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.6, 0.05, -0.01, 0.9]
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  const contactItems = [
    { icon: <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />, label: "Email", value: contactInfo.email, key: "email" },
    { icon: <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />, label: "Telefone", value: contactInfo.phone, key: "phone" },
    { icon: <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />, label: "Localização", value: contactInfo.location, key: "location" },
    { icon: <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />, label: "Aniversário", value: contactInfo.birthday, key: "birthday" }
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
    >
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Informações de Contato</h2>

        {!isEditing && (
          <motion.button
            onClick={toggleEditing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-sm text-gray-500 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400 transition-colors"
          >
            <Edit size={16} />
          </motion.button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {actualIsEditing ? (
          <motion.div
            key="editing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            <div className="space-y-4">
              {contactItems.map((item) => (
                <div key={item.key} className="group">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-1">
                    {item.icon}
                    <span>{item.label}</span>
                  </label>
                  <input
                    type="text"
                    value={contactInfo[item.key as keyof typeof contactInfo]}
                    onChange={(e) => {
                      setContactInfo({
                        ...contactInfo,
                        [item.key]: e.target.value
                      });
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleEditing}
                className="flex items-center gap-1"
              >
                <X size={16} />
                <span>Cancelar</span>
              </Button>

              <Button
                size="sm"
                onClick={saveContactInfo}
                className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-1"
              >
                <Save size={16} />
                <span>Salvar</span>
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="viewing"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="px-6 py-4"
          >
            <div className="space-y-4">
              {contactItems.map((item, index) => (
                <motion.div 
                  key={item.key} 
                  variants={itemVariants}
                  custom={index}
                  className="flex items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 -mx-2 rounded-md transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                    {item.icon}
                  </div>
                  <div className="flex-grow">
                    <div className="text-xs text-gray-500 dark:text-gray-400">{item.label}</div>
                    <div className="text-sm text-gray-900 dark:text-white font-medium">{item.value}</div>
                  </div>
                  {item.key !== 'email' && (
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-orange-500"
                    >
                      <Edit size={14} />
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Botão para adicionar mais informações de contato */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              className="mt-4 text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 flex items-center gap-1 transition-colors w-full justify-center py-1.5 border border-dashed border-gray-200 dark:border-gray-700 rounded-md"
              onClick={toggleEditing}
            >
              <Plus size={14} />
              <span>Adicionar informação</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}