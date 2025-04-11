
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Save, Code, Plus, X, Star, PlusCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { UserProfile } from "@/types/user-profile";

interface SkillsProps {
  userProfile: UserProfile | null;
  isEditing: boolean;
}

interface SkillItem {
  id: string;
  name: string;
  level: number;
  category: string;
}

interface TechBadge {
  name: string;
  color: string;
}

export default function Skills({ userProfile, isEditing }: SkillsProps) {
  const [localIsEditing, setLocalIsEditing] = useState(false);
  const [skillItems, setSkillItems] = useState<SkillItem[]>([
    { id: '1', name: 'Programação', level: 90, category: 'hard' },
    { id: '2', name: 'Matemática', level: 85, category: 'hard' },
    { id: '3', name: 'Física', level: 65, category: 'hard' },
    { id: '4', name: 'Química', level: 50, category: 'hard' }
  ]);

  const [techBadges, setTechBadges] = useState<TechBadge[]>([
    { name: 'JavaScript', color: 'bg-yellow-400' },
    { name: 'Python', color: 'bg-blue-500' },
    { name: 'React', color: 'bg-cyan-400' },
    { name: 'Node.js', color: 'bg-green-500' },
    { name: 'SQL', color: 'bg-indigo-500' },
    { name: 'Git', color: 'bg-orange-600' },
    { name: 'Docker', color: 'bg-blue-600' },
    { name: 'AWS', color: 'bg-amber-500' }
  ]);

  const toggleEditing = () => {
    setLocalIsEditing(!localIsEditing);
  };

  const saveSkills = () => {
    // Aqui você adicionaria a lógica para salvar no banco de dados
    setLocalIsEditing(false);
  };

  const actualIsEditing = isEditing || localIsEditing;

  const getLevelText = (level: number) => {
    if (level >= 90) return 'Avançado';
    if (level >= 70) return 'Avançado';
    if (level >= 40) return 'Intermediário';
    return 'Básico';
  };

  const getLevelColor = (level: number) => {
    if (level >= 90) return 'from-green-400 to-green-500';
    if (level >= 70) return 'from-blue-400 to-blue-500';
    if (level >= 40) return 'from-orange-400 to-orange-500';
    return 'from-red-400 to-red-500';
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
        delay: 0.2
      }
    }
  };

  const skillBarVariants = {
    hidden: { width: 0, opacity: 0 },
    visible: (custom: number) => ({ 
      width: `${custom}%`, 
      opacity: 1,
      transition: {
        width: { duration: 1, ease: "easeOut" },
        opacity: { duration: 0.3 },
        delay: 0.3
      }
    })
  };

  const skillItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({ 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.6, 0.05, -0.01, 0.9],
        delay: 0.1 * custom + 0.3
      }
    })
  };

  const techBadgeVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 10 },
    visible: (custom: number) => ({ 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.6, 0.05, -0.01, 0.9],
        delay: 0.05 * custom + 0.5
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

  const shimmerVariants = {
    initial: { x: "-100%", opacity: 0 },
    animate: { 
      x: ["-100%", "200%"],
      opacity: [0, 0.5, 0]
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg mb-6 relative overflow-hidden group"
    >
      {/* Decorative elements */}
      <div className="absolute -left-10 -top-10 w-32 h-32 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-all duration-700"></div>
      <div className="absolute right-20 bottom-10 w-28 h-28 bg-orange-500/5 rounded-full blur-xl group-hover:bg-orange-500/10 transition-all duration-700"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <motion.h3 
            className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"
            whileHover={{ x: 3 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Code className="w-5 h-5 text-orange-500" />
            </div>
            Habilidades
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
                onClick={actualIsEditing ? saveSkills : toggleEditing}
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
          <div className="space-y-5 mb-8">
            {skillItems.map((skill, index) => (
              <motion.div
                key={skill.id}
                custom={index}
                variants={skillItemVariants}
                initial="hidden"
                animate="visible"
                className="bg-gray-50/80 dark:bg-gray-900/30 backdrop-blur-sm p-4 rounded-lg border border-gray-100 dark:border-gray-700/50 group/skill"
                whileHover={{ 
                  y: -3,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
                  borderColor: "rgba(255, 107, 0, 0.2)"
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">{skill.name}</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.div 
                          key={star}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ 
                            opacity: star <= Math.ceil(skill.level / 20) ? 1 : 0.3,
                            scale: 1
                          }}
                          transition={{ delay: 0.5 + (index * 0.1) + (star * 0.1), duration: 0.3 }}
                          whileHover={{ rotate: 20 }}
                        >
                          <Star className={`h-3.5 w-3.5 ${star <= Math.ceil(skill.level / 20) ? 'text-orange-500 fill-orange-500' : 'text-gray-300 dark:text-gray-600'}`} />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  <span 
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      skill.level >= 90 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                      skill.level >= 70 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 
                      skill.level >= 40 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    {getLevelText(skill.level)}
                  </span>
                </div>
                
                <div className="relative h-2.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div 
                    className={`absolute h-full bg-gradient-to-r ${getLevelColor(skill.level)}`}
                    custom={skill.level}
                    variants={skillBarVariants}
                    initial="hidden"
                    animate="visible"
                  />
                  
                  {/* Shimmer effect on hover */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    variants={shimmerVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 0.5,
                      ease: "easeInOut"
                    }}
                  />
                </div>
                
                {actualIsEditing && (
                  <motion.div 
                    className="mt-3 flex justify-end gap-2"
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
            ))}
          </div>

          <div>
            <motion.h4 
              className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <span className="w-1 h-5 bg-orange-500 rounded-full mr-2 inline-block"></span>
              Tecnologias
            </motion.h4>
            <div className="flex flex-wrap gap-2">
              {techBadges.map((tech, index) => (
                <motion.div
                  key={tech.name}
                  custom={index}
                  variants={techBadgeVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ 
                    scale: 1.1, 
                    y: -5,
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                  }}
                  className={`px-3 py-1.5 rounded-full ${tech.color} text-white text-xs font-medium flex items-center gap-1.5 shadow-sm`}
                >
                  {tech.name}
                  {actualIsEditing && (
                    <motion.button 
                      className="hover:bg-white/20 rounded-full p-0.5"
                      whileHover={{ rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="h-3 w-3" />
                    </motion.button>
                  )}
                </motion.div>
              ))}
              {actualIsEditing && (
                <motion.button
                  variants={techBadgeVariants}
                  custom={techBadges.length}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="px-3 py-1.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="h-3 w-3" /> Adicionar
                </motion.button>
              )}
            </div>
          </div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
