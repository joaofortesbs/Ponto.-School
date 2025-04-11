
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, GraduationCap, BookOpen, Calendar, Edit, Save } from "lucide-react";
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm mb-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-orange-500" />
          Educação
        </h3>
        <div className="flex gap-2">
          {actualIsEditing && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <PlusCircle className="h-4 w-4 mr-1" /> Adicionar
            </Button>
          )}
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
        </div>
      </div>

      <AnimatePresence>
        <div className="space-y-6">
          {educationItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex gap-4"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-gray-700 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-orange-500" />
                </div>
              </div>
              
              <div className="flex-grow">
                <motion.h4 
                  className="text-base font-semibold text-gray-900 dark:text-white mb-1"
                  whileHover={{ x: 3 }}
                >
                  {item.institution}
                </motion.h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">{item.degree}</p>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  {item.period}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </motion.div>
  );
}
