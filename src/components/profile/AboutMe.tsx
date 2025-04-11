
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Save, User, PenLine } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { UserProfile } from "@/types/user-profile";

interface AboutMeProps {
  userProfile: UserProfile | null;
  isEditing: boolean;
}

export default function AboutMe({ userProfile, isEditing }: AboutMeProps) {
  const [localIsEditing, setLocalIsEditing] = useState(false);
  const [aboutMe, setAboutMe] = useState(userProfile?.bio || "Minha biografia ainda não foi preenchida. Clique em editar para adicionar informações sobre você.");

  const toggleEditing = () => {
    setLocalIsEditing(!localIsEditing);
  };

  const saveAboutMe = () => {
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

  const contentVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1, 
      height: "auto",
      transition: {
        opacity: { duration: 0.3, delay: 0.2 },
        height: { duration: 0.4 }
      }
    },
    exit: {
      opacity: 0,
      height: 0,
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
      boxShadow: "0 5px 15px rgba(255, 107, 0, 0.3)"
    },
    tap: { scale: 0.95 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg mb-6 relative overflow-hidden group"
    >
      {/* Decorative elements */}
      <div className="absolute -right-6 -top-6 w-32 h-32 bg-orange-500/5 rounded-full blur-xl group-hover:bg-orange-500/10 transition-all duration-700"></div>
      <div className="absolute -left-8 -bottom-8 w-28 h-28 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-all duration-700"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-5">
          <motion.h3 
            className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"
            whileHover={{ x: 3 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <User className="w-5 h-5 text-orange-500" />
            </div>
            Sobre Mim
          </motion.h3>
          <motion.div
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 dark:text-gray-400 hover:text-orange-500 hover:bg-orange-500/10"
              onClick={actualIsEditing ? saveAboutMe : toggleEditing}
            >
              {actualIsEditing ? (
                <Save className="h-4 w-4" />
              ) : (
                <Edit className="h-4 w-4" />
              )}
            </Button>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {actualIsEditing ? (
            <motion.div
              key="edit-mode"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={contentVariants}
              className="overflow-hidden"
            >
              <div className="relative">
                <PenLine className="absolute top-3 right-3 h-4 w-4 text-orange-500/50" />
                <Textarea
                  className="min-h-[150px] border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-500/10 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none pr-10"
                  value={aboutMe}
                  onChange={(e) => setAboutMe(e.target.value)}
                  placeholder="Compartilhe um pouco sobre você, seus interesses e objetivos..."
                />
              </div>
              <div className="flex justify-end mt-4">
                <motion.div
                  variants={buttonVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button
                    onClick={saveAboutMe}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/20"
                  >
                    <Save className="mr-2 h-4 w-4" /> Salvar
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="view-mode"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={contentVariants}
              className="overflow-hidden"
            >
              <motion.div 
                className="bg-gray-50/80 dark:bg-gray-900/30 backdrop-blur-sm p-5 rounded-lg border border-gray-100 dark:border-gray-700/50"
                whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)" }}
                transition={{ duration: 0.3 }}
              >
                <motion.p 
                  className="text-gray-700 dark:text-gray-300 leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {aboutMe.split('\n').map((paragraph, index) => (
                    <motion.span 
                      key={index} 
                      className="block mb-2 last:mb-0 relative"
                      whileHover={{ x: 3 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {paragraph}
                    </motion.span>
                  ))}
                </motion.p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
