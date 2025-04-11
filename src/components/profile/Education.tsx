
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Save, X, Graduation, Calendar } from "lucide-react";
import type { UserProfile } from "@/types/user-profile";

interface EducationProps {
  userProfile: UserProfile | null;
  isEditing: boolean;
}

export default function Education({ userProfile, isEditing }: EducationProps) {
  const [localIsEditing, setLocalIsEditing] = useState(false);
  const [education, setEducation] = useState([
    {
      institution: "Universidade de São Paulo",
      degree: "Bacharelado em Engenharia de Software",
      startYear: "2020",
      endYear: "Presente",
      logo: "https://api.dicebear.com/6.x/initials/svg?seed=USP"
    },
    {
      institution: "Colégio Técnico de São Paulo",
      degree: "Técnico em Desenvolvimento de Sistemas",
      startYear: "2017",
      endYear: "2019",
      logo: "https://api.dicebear.com/6.x/initials/svg?seed=CTSP"
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
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
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
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Educação</h2>
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
              Adicione ou edite suas informações educacionais.
            </p>
            
            <div className="space-y-4">
              {education.map((edu, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Instituição</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => {
                          const newEducation = [...education];
                          newEducation[index].institution = e.target.value;
                          setEducation(newEducation);
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Curso/Formação</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const newEducation = [...education];
                          newEducation[index].degree = e.target.value;
                          setEducation(newEducation);
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Ano de Início</label>
                        <input
                          type="text"
                          value={edu.startYear}
                          onChange={(e) => {
                            const newEducation = [...education];
                            newEducation[index].startYear = e.target.value;
                            setEducation(newEducation);
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Ano de Conclusão</label>
                        <input
                          type="text"
                          value={edu.endYear}
                          onChange={(e) => {
                            const newEducation = [...education];
                            newEducation[index].endYear = e.target.value;
                            setEducation(newEducation);
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex justify-end">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setEducation(education.filter((_, i) => i !== index));
                      }}
                      className="text-xs"
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4">
              <Button
                onClick={() => {
                  setEducation([...education, {
                    institution: "Nova Instituição",
                    degree: "Curso",
                    startYear: "2023",
                    endYear: "Presente",
                    logo: "https://api.dicebear.com/6.x/initials/svg?seed=NEW"
                  }]);
                }}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Plus size={16} />
                <span>Adicionar Formação</span>
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
                onClick={saveEducation}
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
              {education.map((edu, index) => (
                <motion.div 
                  key={index} 
                  variants={itemVariants}
                  className="flex items-start gap-4 relative group"
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center overflow-hidden">
                      <Graduation className="w-5 h-5 text-orange-500" />
                    </div>
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="text-base font-medium text-gray-800 dark:text-white">
                      {edu.institution}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                      {edu.degree}
                    </p>
                    <div className="flex items-center mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar size={12} className="mr-1" />
                      <span>{edu.startYear} - {edu.endYear}</span>
                    </div>
                  </div>
                  
                  {/* Efeito de decoração */}
                  {index < education.length - 1 && (
                    <div className="absolute left-5 top-12 w-0.5 h-12 bg-gray-200 dark:bg-gray-700 z-0"></div>
                  )}
                </motion.div>
              ))}
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 flex justify-center"
            >
              <button className="text-xs text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 font-medium">
                Ver certificações adicionais
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
