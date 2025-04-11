
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Save, User } from "lucide-react";
import { motion } from "framer-motion";
import type { UserProfile } from "@/types/user-profile";

interface AboutMeProps {
  userProfile: UserProfile | null;
  isEditing: boolean;
}

export default function AboutMe({ userProfile, isEditing }: AboutMeProps) {
  const [localIsEditing, setLocalIsEditing] = useState(false);
  const [aboutMe, setAboutMe] = useState(userProfile?.bio || "Minha biografia ainda não foi preenchida. Clique em editar para adicionar informações sobre você.");

  const toggleEditing = () => {
    setLocalIsEditing(!localIsEditing);
  };

  const saveAboutMe = () => {
    // Aqui você adicionaria a lógica para salvar no banco de dados
    setLocalIsEditing(false);
  };

  const actualIsEditing = isEditing || localIsEditing;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm mb-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <User className="w-5 h-5 text-orange-500" />
          Sobre Mim
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-500 dark:text-gray-400 hover:text-orange-500 hover:bg-orange-500/10"
          onClick={actualIsEditing ? saveAboutMe : toggleEditing}
        >
          {actualIsEditing ? (
            <Save className="h-4 w-4" />
          ) : (
            <Edit className="h-4 w-4" />
          )}
        </Button>
      </div>

      {actualIsEditing ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Textarea
            className="min-h-[120px] border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-500/10 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={aboutMe}
            onChange={(e) => setAboutMe(e.target.value)}
          />
          <div className="flex justify-end mt-3">
            <Button
              onClick={saveAboutMe}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Save className="mr-2 h-4 w-4" /> Salvar
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.p 
          className="text-gray-700 dark:text-gray-300"
          whileHover={{ x: 3 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {aboutMe}
        </motion.p>
      )}
    </motion.div>
  );
}
