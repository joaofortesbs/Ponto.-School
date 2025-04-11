
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Edit, Save, Code, Plus, X } from "lucide-react";
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm mb-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Code className="w-5 h-5 text-orange-500" />
          Habilidades
        </h3>
        <div className="flex gap-2">
          {actualIsEditing && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Plus className="h-4 w-4 mr-1" /> Adicionar
            </Button>
          )}
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
        </div>
      </div>

      <AnimatePresence>
        <div className="space-y-4 mb-6">
          {skillItems.map((skill, index) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="space-y-1"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{skill.name}</span>
                <span className="text-xs font-medium text-orange-600 dark:text-orange-400">{getLevelText(skill.level)}</span>
              </div>
              <div className="relative h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div 
                  className={`absolute h-full bg-gradient-to-r ${getLevelColor(skill.level)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${skill.level}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Tecnologias</h4>
          <div className="flex flex-wrap gap-2">
            {techBadges.map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + (index * 0.05) }}
                whileHover={{ scale: 1.05, y: -2 }}
                className={`px-3 py-1 rounded-full ${tech.color} text-white text-xs font-medium flex items-center gap-1`}
              >
                {tech.name}
                {actualIsEditing && (
                  <button className="hover:bg-white/20 rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </motion.div>
            ))}
            {actualIsEditing && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                className="px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> Adicionar
              </motion.button>
            )}
          </div>
        </div>
      </AnimatePresence>
    </motion.div>
  );
}
