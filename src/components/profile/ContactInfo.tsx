
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, Globe, MapPin, Linkedin, Twitter, Github, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface ContactInfoProps {
  userEmail: string;
  initialContactInfo?: {
    email: string;
    phone: string;
    website: string;
    location: string;
    linkedin: string;
    twitter: string;
    github: string;
    instagram: string;
  };
  onSave?: (contactInfo: any) => void;
  isCurrentUser?: boolean;
}

const ContactInfo: React.FC<ContactInfoProps> = ({
  userEmail,
  initialContactInfo,
  onSave,
  isCurrentUser = false,
}) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    email: userEmail || "",
    phone: "",
    website: "",
    location: "",
    linkedin: "",
    twitter: "",
    github: "",
    instagram: "",
  });

  // Atualizar o estado com dados iniciais se fornecidos
  useEffect(() => {
    if (initialContactInfo) {
      setContactInfo({
        ...contactInfo,
        ...initialContactInfo,
      });
    }
  }, [initialContactInfo]);

  const actualIsEditing = isEditing && isCurrentUser;

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      if (onSave) {
        await onSave(contactInfo);
      }
      
      toast({
        title: "Informações de contato atualizadas",
        description: "Suas informações de contato foram salvas com sucesso.",
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao salvar informações de contato:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar suas informações de contato.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const contactItems = [
    { key: "email", label: "Email", icon: <Mail className="h-4 w-4" /> },
    { key: "phone", label: "Telefone", icon: <Phone className="h-4 w-4" /> },
    { key: "website", label: "Website", icon: <Globe className="h-4 w-4" /> },
    { key: "location", label: "Localização", icon: <MapPin className="h-4 w-4" /> },
    { key: "linkedin", label: "LinkedIn", icon: <Linkedin className="h-4 w-4" /> },
    { key: "twitter", label: "Twitter", icon: <Twitter className="h-4 w-4" /> },
    { key: "github", label: "GitHub", icon: <Github className="h-4 w-4" /> },
    { key: "instagram", label: "Instagram", icon: <Instagram className="h-4 w-4" /> },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-500 transform hover:shadow-lg">
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-6 py-3 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Mail className="h-5 w-5 text-orange-500" />
          <span>Informações de Contato</span>
        </h3>
        {isCurrentUser && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            disabled={isSaving}
            className="text-sm"
          >
            {actualIsEditing ? "Cancelar" : "Editar"}
          </Button>
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
              
              <div className="pt-4 flex justify-end">
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {isSaving ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="viewing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            <div className="space-y-3">
              {contactItems.map((item) => {
                const value = contactInfo[item.key as keyof typeof contactInfo];
                if (!value) return null;
                
                return (
                  <div key={item.key} className="flex items-start gap-3">
                    <div className="mt-0.5 bg-orange-100 dark:bg-orange-900/30 p-1.5 rounded-md">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {item.label}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.key.includes('mail') || item.key.includes('website') ? (
                          <a 
                            href={item.key.includes('mail') ? `mailto:${value}` : value.startsWith('http') ? value : `https://${value}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-500 hover:underline"
                          >
                            {value}
                          </a>
                        ) : (
                          value
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
              
              {contactItems.every(item => !contactInfo[item.key as keyof typeof contactInfo]) && (
                <p className="text-gray-500 dark:text-gray-400 italic text-center py-4">
                  Nenhuma informação de contato disponível
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactInfo;
