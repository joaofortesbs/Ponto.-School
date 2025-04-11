import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Save, X } from "lucide-react";
import type { UserProfile } from "@/types/user-profile";
import { useMediaQuery } from "@/lib/utils"; // Added import

interface AboutMeProps {
  userProfile: UserProfile | null;
  isEditing: boolean;
}

export default function AboutMe({ userProfile, isEditing }: AboutMeProps) {
  const [localIsEditing, setLocalIsEditing] = useState(false);
  const [aboutMe, setAboutMe] = useState(
    userProfile?.bio || 
    "Olá! Sou estudante e estou sempre em busca de novos conhecimentos e habilidades. Nas horas vagas, gosto de jogar xadrez, ler livros de ficção científica e praticar esportes."
  );

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
      className="mb-6"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Sobre Mim</h2>
          <div className="ml-2 h-px w-16 bg-gradient-to-r from-orange-500 to-transparent"></div>
        </div>

        {!isEditing && (
          <motion.button
            onClick={toggleEditing}
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            className="text-sm text-gray-500 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400 flex items-center gap-1 transition-colors py-1 px-2 rounded-md"
          >
            {localIsEditing ? <Save size={16} /> : <Edit size={16} />}
            <span>{localIsEditing ? "Salvar" : "Editar"}</span>
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
          >
            <Textarea
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              placeholder="Conte um pouco sobre você, suas habilidades e interesses..."
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 min-h-[120px]"
            />

            <div className="flex justify-end gap-2 mt-3">
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
                onClick={saveAboutMe}
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
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/50 shadow-sm"
          >
            <motion.p 
              className="text-gray-700 dark:text-gray-300 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {aboutMe}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}