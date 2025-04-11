import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Save, X, Code, ChevronRight } from "lucide-react";
import type { UserProfile } from "@/types/user-profile";
import { Progress } from "@/components/ui/progress";

interface SkillsProps {
  userProfile: UserProfile | null;
  isEditing: boolean;
}

export default function Skills({ userProfile, isEditing }: SkillsProps) {
  const [localIsEditing, setLocalIsEditing] = useState(false);
  const [skills, setSkills] = useState([
    { name: "Programação", level: 85, category: "tech" },
    { name: "Matemática", level: 75, category: "academic" },
    { name: "Física", level: 60, category: "academic" },
    { name: "Química", level: 55, category: "academic" },
  ]);
  const [techSkills, setTechSkills] = useState([
    { name: "JavaScript", level: 4 },
    { name: "Python", level: 3 },
    { name: "React", level: 4 },
    { name: "Node.js", level: 3 },
    { name: "SQL", level: 2 },
    { name: "Git", level: 3 },
    { name: "Docker", level: 2 },
    { name: "AWS", level: 2 },
  ]);

  const toggleEditing = () => {
    setLocalIsEditing(!localIsEditing);
  };

  const saveSkills = () => {
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

  const listVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  const skillColors = {
    "Avançado": "bg-green-500",
    "Intermediário": "bg-yellow-500",
    "Iniciante": "bg-blue-500",
  };

  const getLevelText = (level: number) => {
    if (level >= 75) return "Avançado";
    if (level >= 50) return "Intermediário";
    return "Iniciante";
  };

  const getStarRating = (level: number) => {
    const fullStars = Math.floor(level / 20);
    const emptyStars = 5 - fullStars;

    return (
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <svg key={`full-${i}`} className="w-4 h-4 text-yellow-400 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
          </svg>
        ))}
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300 dark:text-gray-600 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
          </svg>
        ))}
      </div>
    );
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
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Habilidades</h2>
          <div className="ml-2 h-px w-16 bg-gradient-to-r from-orange-500 to-transparent"></div>
        </div>

        {!isEditing && (
          <motion.button
            onClick={toggleEditing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
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
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/50 shadow-sm"
          >
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Adicione ou edite suas habilidades arrastando o controle deslizante para definir seu nível de proficiência.
            </p>

            <div className="space-y-4">
              {skills.map((skill, index) => (
                <div key={index} className="flex flex-col">
                  <div className="flex justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{skill.name}</label>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{skill.level}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={skill.level}
                    onChange={(e) => {
                      const newSkills = [...skills];
                      newSkills[index].level = parseInt(e.target.value);
                      setSkills(newSkills);
                    }}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>
              ))}
            </div>

            <div className="mt-4">
              <Button
                onClick={() => {
                  setSkills([...skills, { name: "Nova Habilidade", level: 50, category: "other" }]);
                }}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Plus size={16} />
                <span>Adicionar Habilidade</span>
              </Button>
            </div>

            <div className="flex justify-end gap-2 mt-4">
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
                onClick={saveSkills}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/50 shadow-sm"
          >
            <motion.div 
              variants={listVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {skills.map((skill, index) => (
                <motion.div 
                  key={index} 
                  variants={itemVariants}
                  className="group"
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{skill.name}</span>
                      <span className={`text-xs ml-2 px-2 py-0.5 rounded-full ${skillColors[getLevelText(skill.level) as keyof typeof skillColors]} text-white`}>
                        {getLevelText(skill.level)}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{skill.level}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.level}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: index * 0.1 }}
                      className={`h-full ${skill.level >= 75 ? 'bg-green-500' : skill.level >= 50 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <Code size={16} className="mr-2 text-orange-500" />
                Habilidades Técnicas
              </h3>

              <div className="grid grid-cols-2 gap-3 mt-2">
                {techSkills.map((skill, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + (index * 0.05) }}
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <div className="flex items-center">
                      <ChevronRight size={14} className="mr-1.5 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{skill.name}</span>
                    </div>
                    {getStarRating(skill.level)}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}