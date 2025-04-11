import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/types/user-profile";
import { updateUserProfileField } from "@/services/profileService";
import { Edit2, Save, X } from "lucide-react";

interface AboutMeProps {
  profile: UserProfile | null;
  isOwnProfile?: boolean;
}

const AboutMe: React.FC<AboutMeProps> = ({ profile, isOwnProfile = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [aboutMeText, setAboutMeText] = useState(profile?.about_me || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = () => {
    setAboutMeText(profile?.about_me || "");
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const { success, error } = await updateUserProfileField("about_me", aboutMeText);

      if (!success) {
        setError(error || "Erro ao salvar informações");
        return;
      }

      setIsEditing(false);
    } catch (err) {
      setError("Ocorreu um erro inesperado");
      console.error("Erro ao salvar sobre mim:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-md dark:bg-gray-900/50 profile-3d-element">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white profile-3d-text">
            Sobre Mim
          </CardTitle>
          {isOwnProfile && !isEditing && (
            <Button
              variant="ghost" 
              size="icon"
              onClick={handleEdit}
              className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <Edit2 size={16} className="text-[#FF6B00]" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <Textarea
              value={aboutMeText}
              onChange={(e) => setAboutMeText(e.target.value)}
              placeholder="Conte um pouco sobre você..."
              className="resize-none min-h-[120px] focus:ring-[#FF6B00] focus:border-[#FF6B00]"
            />

            {error && (
              <p className="text-sm text-red-500 dark:text-red-400">
                {error}
              </p>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
                className="h-9"
              >
                <X size={14} className="mr-1" /> Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
                className="h-9 bg-[#FF6B00] hover:bg-[#FF6B00]/90"
              >
                {isSaving ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Salvando...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Save size={14} className="mr-1" /> Salvar
                  </span>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="prose dark:prose-invert max-w-none">
            {profile?.about_me ? (
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {profile.about_me}
              </p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">
                {isOwnProfile 
                  ? "Clique em editar para adicionar informações sobre você"
                  : "Este usuário ainda não adicionou informações sobre si"
                }
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AboutMe;