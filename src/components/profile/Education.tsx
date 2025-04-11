
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, GraduationCap, BookOpen, Calendar, Edit, Save, ChevronRight, School } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { UserProfile } from "@/types/user-profile";

interface EducationProps {
  userProfile: UserProfile | null;
  isEditing: boolean;
}

interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  period: string;
  logo?: string;
}

export default function Education({ userProfile, isEditing }: EducationProps) {
  const [localIsEditing, setLocalIsEditing] = useState(false);
  const [educationItems, setEducationItems] = useState<EducationItem[]>([
    {
      id: '1',
      institution: 'Universidade de São Paulo',
      degree: 'Bacharelado em Engenharia de Software',
      period: '2020 - Presente',
      logo: '/images/usp-logo.png'
    },
    {
      id: '2',
      institution: 'Colégio Técnico de São Paulo',
      degree: 'Técnico em Desenvolvimento de Sistemas',
      period: '2017 - 2019',
      logo: '/images/colegio-logo.png'
    }
  ]);

  const toggleEditing = () => {
    setLocalIsEditing(!localIsEditing);
  };

  const saveEducation = () => {
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
        ease: [0.6, 0.05, -0.01, 0.9],
        delay: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (custom: number) => ({ 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.4,
        ease: [0.6, 0.05, -0.01, 0.9],
        delay: 0.1 * custom
      }
    })
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.05,
      boxShadow: "0 5px 15px rgba(255, 107, 0, 0.3)"
    },
    tap: { scale: 0.95 }
  };

  const timelineLineVariants = {
    hidden: { height: 0 },
    visible: (custom: number) => ({ 
      height: '100%',
      transition: { 
        delay: 0.3 * custom,
        duration: 0.8,
        ease: [0.6, 0.05, -0.01, 0.9]
      }
    })
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg mb-6 relative overflow-hidden group"
    >
      {/* Decorative elements */}
      <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-orange-500/5 rounded-full blur-xl group-hover:bg-orange-500/10 transition-all duration-700"></div>
      <div className="absolute -left-10 top-1/2 transform -translate-y-1/2 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-all duration-700"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <motion.h3 
            className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"
            whileHover={{ x: 3 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <GraduationCap className="w-5 h-5 text-orange-500" />
            </div>
            Educação
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
                onClick={actualIsEditing ? saveEducation : toggleEditing}
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

        <AnimatePresence>
          <div className="relative">
            {educationItems.map((item, index) => (
              <motion.div
                key={item.id}
                custom={index}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10"
              >
                <div className="flex gap-4 mb-6 last:mb-0 relative">
                  {/* Timeline style vertical line */}
                  {index < educationItems.length - 1 && (
                    <motion.div 
                      className="absolute left-6 top-12 bottom-0 w-0.5 bg-gradient-to-b from-orange-400 to-orange-200 dark:from-orange-500 dark:to-orange-700/30"
                      custom={index}
                      variants={timelineLineVariants}
                      initial="hidden"
                      animate="visible"
                    />
                  )}
                  
                  <div className="flex-shrink-0">
                    <motion.div 
                      className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center"
                      whileHover={{ 
                        scale: 1.1,
                        boxShadow: "0 0 0 4px rgba(255, 107, 0, 0.15)"
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <School className="w-6 h-6 text-orange-500" />
                    </motion.div>
                  </div>
                  
                  <motion.div 
                    className="flex-grow"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <motion.h4 
                          className="text-base font-semibold text-gray-900 dark:text-white mb-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.1 * index + 0.3 }}
                        >
                          {item.institution}
                        </motion.h4>
                        <motion.p 
                          className="text-sm text-gray-700 dark:text-gray-300 mb-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.1 * index + 0.4 }}
                        >
                          {item.degree}
                        </motion.p>
                      </div>
                      <motion.div 
                        className="flex items-center text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 * index + 0.5 }}
                      >
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        {item.period}
                      </motion.div>
                    </div>
                    
                    {actualIsEditing && (
                      <motion.div 
                        className="mt-2 flex gap-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * index + 0.6 }}
                      >
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          <Edit className="h-3 w-3 mr-1" /> Editar
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                          Remover
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                  
                  {!actualIsEditing && (
                    <motion.div 
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      whileHover={{ scale: 1.2, rotate: 10 }}
                    >
                      <ChevronRight className="h-5 w-5 text-orange-500" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
