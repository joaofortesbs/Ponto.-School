
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Save } from "lucide-react";
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
    <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-6 shadow-sm mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-[#29335C] dark:text-white">
          Sobre Mim
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-[#64748B] dark:text-white/60 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
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
        <Textarea
          className="min-h-[120px] border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10"
          value={aboutMe}
          onChange={(e) => setAboutMe(e.target.value)}
        />
      ) : (
        <p className="text-[#64748B] dark:text-white/80">{aboutMe}</p>
      )}
    </div>
  );
}
