
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Save, Heart, Plus, X, PlusCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { UserProfile } from "@/types/user-profile";

interface InterestsProps {
  userProfile: UserProfile | null;
  isEditing: boolean;
}

export default function Interests({ userProfile, isEditing }: InterestsProps) {
  const [localIsEditing, setLocalIsEditing] = useState(false);
  const [interests, setInterests] = useState([
    "Programação",
    "Inteligência Artificial",
    "Matemática",
    "Física Quântica",
    "Xadrez",
    "Ficção Científica",
    "Astronomia",
    "Música"
  ]);
  const [newInterest, setNewInterest] = useState("");

  const toggleEditing = () => {
    setLocalIsEditing(!localIsEditing);
  };

  const saveInterests = () => {
    // Aqui você adicionaria a lógica para salvar no banco de dados
    setLocalIsEditing(false);
  };

  const addInterest = () => {
    if (newInterest.trim() !== "") {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest("");
    }
  };

  const removeInterest = (index: number) => {
    setInterests(interests.filter((_, i) => i !== index));
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
        staggerChildren: 0.05,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10
      }
    }
  };

  const colors = [
    "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
    "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
    "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mb-6"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Interesses</h2>
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
            <div className="flex mb-4">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="Adicionar novo interesse..."
                className="flex-grow px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-l-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addInterest();
                  }
                }}
              />
              <Button
                onClick={addInterest}
                className="rounded-l-none bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Plus size={16} />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {interests.map((interest, index) => (
                <div 
                  key={index} 
                  className="group flex items-center bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md px-3 py-1.5 text-sm"
                >
                  {interest}
                  <button
                    onClick={() => removeInterest(index)}
                    className="ml-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
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
                onClick={saveInterests}
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
              className="flex flex-wrap gap-2"
            >
              {interests.map((interest, index) => (
                <motion.div 
                  key={index} 
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  className={`${colors[index % colors.length]} flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200`}
                >
                  <Heart size={12} className="opacity-70" />
                  {interest}
                </motion.div>
              ))}
              
              <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 rounded-full px-3 py-1.5 text-sm flex items-center gap-1.5 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                onClick={toggleEditing}
              >
                <PlusCircle size={12} />
                Adicionar
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
