
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Save, Heart, Plus, X, PlusCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { UserProfile } from "@/types/user-profile";

interface InterestsProps {
  userProfile: UserProfile | null;
  isEditing: boolean;
}

interface InterestTag {
  id: string;
  name: string;
  icon?: string;
}

export default function Interests({ userProfile, isEditing }: InterestsProps) {
  const [localIsEditing, setLocalIsEditing] = useState(false);
  const [interests, setInterests] = useState<InterestTag[]>([
    { id: '1', name: 'Programação' },
    { id: '2', name: 'Inteligência Artificial' },
    { id: '3', name: 'Matemática' },
    { id: '4', name: 'Física Quântica' },
    { id: '5', name: 'Xadrez' },
    { id: '6', name: 'Ficção Científica' },
    { id: '7', name: 'Astronomia' },
    { id: '8', name: 'Música' }
  ]);

  const toggleEditing = () => {
    setLocalIsEditing(!localIsEditing);
  };

  const saveInterests = () => {
    // Aqui você adicionaria a lógica para salvar no banco de dados
    setLocalIsEditing(false);
  };

  const actualIsEditing = isEditing || localIsEditing;
  
  // Cores aleatórias para os badges de interesse
  const getRandomColor = (id: string) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-red-500 to-red-600',
      'from-yellow-500 to-yellow-600',
      'from-orange-500 to-orange-600',
      'from-teal-500 to-teal-600',
      'from-cyan-500 to-cyan-600'
    ];
    
    // Usar o id para gerar um índice consistente
    const index = parseInt(id, 10) % colors.length;
    return colors[index];
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.6, 0.05, -0.01, 0.9],
        delay: 0.3
      }
    }
  };

  const tagCloudVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.05,
        delayChildren: 0.3
      }
    }
  };

  const tagVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15
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
      <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-green-500/5 rounded-full blur-xl group-hover:bg-green-500/10 transition-all duration-700"></div>
      <div className="absolute -left-10 top-10 w-28 h-28 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-all duration-700"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <motion.h3 
            className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"
            whileHover={{ x: 3 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Heart className="w-5 h-5 text-orange-500" />
            </div>
            Interesses
          </motion.h3>
          <div className="flex gap-2">
            {actualIsEditing && (
              <motion.div
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <PlusCircle className="h-4 w-4 mr-1" /> Adicionar
                </Button>
              </motion.div>
            )}
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
                onClick={actualIsEditing ? saveInterests : toggleEditing}
              >
                {actualIsEditing ? (
                  <Save className="h-4 w-4" />
                ) : (
                  <Edit className="h-4 w-4" />
                )}
              </Button>
            </motion.div>
          </div>
        </div>

        <motion.div 
          className="bg-gray-50/80 dark:bg-gray-900/30 backdrop-blur-sm p-6 rounded-lg border border-gray-100 dark:border-gray-700/50"
          whileHover={{ 
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)"
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="flex flex-wrap gap-3"
            variants={tagCloudVariants}
            initial="hidden"
            animate="visible"
          >
            {interests.map((interest) => (
              <motion.div
                key={interest.id}
                variants={tagVariants}
                whileHover={{ 
                  scale: 1.1, 
                  y: -5,
                  boxShadow: "0 15px 30px -10px rgba(0, 0, 0, 0.2)"
                }}
                className={`px-4 py-2 rounded-full bg-gradient-to-r ${getRandomColor(interest.id)} text-white text-sm font-medium flex items-center gap-2 shadow-md`}
                style={{ 
                  transformStyle: "preserve-3d"
                }}
              >
                <span style={{ transform: "translateZ(5px)" }}>{interest.name}</span>
                {actualIsEditing && (
                  <motion.button 
                    className="hover:bg-white/20 rounded-full p-0.5"
                    whileHover={{ rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    style={{ transform: "translateZ(10px)" }}
                  >
                    <X className="h-3.5 w-3.5" />
                  </motion.button>
                )}
                
                {/* Subtle glow effect */}
                <motion.div 
                  className="absolute inset-0 rounded-full opacity-0 hover:opacity-80"
                  style={{ 
                    boxShadow: `0 0 20px 2px rgba(${parseInt(interest.id) * 30 % 255}, ${parseInt(interest.id) * 50 % 255}, ${parseInt(interest.id) * 70 % 255}, 0.5)`,
                    zIndex: -1
                  }}
                  initial={false}
                  whileHover={{ opacity: 0.5 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            ))}
            
            {actualIsEditing && (
              <motion.button
                variants={tagVariants}
                whileHover={{ scale: 1.05, y: -2 }}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium flex items-center gap-2 shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" /> Novo interesse
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
