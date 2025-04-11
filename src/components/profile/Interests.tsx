
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Save, Heart, Plus, X } from "lucide-react";
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
      'bg-blue-500 hover:bg-blue-600',
      'bg-green-500 hover:bg-green-600',
      'bg-purple-500 hover:bg-purple-600',
      'bg-pink-500 hover:bg-pink-600',
      'bg-indigo-500 hover:bg-indigo-600',
      'bg-red-500 hover:bg-red-600',
      'bg-yellow-500 hover:bg-yellow-600',
      'bg-orange-500 hover:bg-orange-600',
      'bg-teal-500 hover:bg-teal-600',
      'bg-cyan-500 hover:bg-cyan-600'
    ];
    
    // Usar o id para gerar um índice consistente
    const index = parseInt(id, 10) % colors.length;
    return colors[index];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm mb-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Heart className="w-5 h-5 text-orange-500" />
          Interesses
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
            onClick={actualIsEditing ? saveInterests : toggleEditing}
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
        <div className="flex flex-wrap gap-2">
          {interests.map((interest, index) => (
            <motion.div
              key={interest.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 + (index * 0.05) }}
              whileHover={{ scale: 1.05, y: -2 }}
              className={`px-4 py-2 rounded-full ${getRandomColor(interest.id)} text-white text-sm font-medium flex items-center gap-1.5`}
            >
              {interest.name}
              {actualIsEditing && (
                <button className="hover:bg-white/20 rounded-full p-0.5">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </motion.div>
          ))}
          {actualIsEditing && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              className="px-4 py-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Novo interesse
            </motion.button>
          )}
        </div>
      </AnimatePresence>
    </motion.div>
  );
}
