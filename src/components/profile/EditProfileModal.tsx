
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { Edit, Save, X, User, Award, Share2, Sparkles, Wifi } from "lucide-react";
import type { UserProfile } from "@/types/user-profile";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  onProfileUpdate: (updatedProfile: UserProfile) => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  userProfile,
  onProfileUpdate
}: EditProfileModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    display_name: "",
    full_name: "",
    student_title: "",
    activity_status: "",
    website: "",
    social_links: {
      tiktok: "",
      instagram: "",
      twitter: "",
      youtube: ""
    }
  });

  useEffect(() => {
    if (userProfile && isOpen) {
      setFormData({
        display_name: userProfile.display_name || "",
        full_name: userProfile.full_name || "",
        student_title: userProfile.student_title || "",
        activity_status: userProfile.activity_status || "online",
        website: userProfile.website || "",
        social_links: {
          tiktok: userProfile.social_links?.tiktok || "",
          instagram: userProfile.social_links?.instagram || "",
          twitter: userProfile.social_links?.twitter || "",
          youtube: userProfile.social_links?.youtube || ""
        }
      });
    }
  }, [userProfile, isOpen]);

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('social_links.')) {
      const socialField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        social_links: {
          ...prev.social_links,
          [socialField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async () => {
    if (!userProfile) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: formData.display_name,
          full_name: formData.full_name,
          student_title: formData.student_title,
          activity_status: formData.activity_status,
          website: formData.website,
          social_links: formData.social_links,
          updated_at: new Date().toISOString()
        })
        .eq("id", userProfile.id);

      if (error) throw error;

      // Atualizar perfil local
      const updatedProfile = {
        ...userProfile,
        ...formData,
        updated_at: new Date().toISOString()
      };

      onProfileUpdate(updatedProfile);
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        <DialogHeader className="pb-6 border-b border-gray-200 dark:border-gray-700">
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900 dark:text-white">
            <div className="p-2 bg-[#FF6B00] rounded-lg">
              <Edit className="h-5 w-5 text-white" />
            </div>
            Editar Perfil
          </DialogTitle>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Personalize suas informações e configure seu status
          </p>
        </DialogHeader>

        <div className="space-y-6 py-6">
            {/* Informações Pessoais */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-[#FF6B00]" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Informações Pessoais
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="display_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nome de Exibição
                  </Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => handleInputChange("display_name", e.target.value)}
                    placeholder="Como você quer ser chamado"
                    className="border-gray-300 dark:border-gray-600 focus:border-[#FF6B00] focus:ring-[#FF6B00]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nome Completo
                  </Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange("full_name", e.target.value)}
                    placeholder="Seu nome completo"
                    className="border-gray-300 dark:border-gray-600 focus:border-[#FF6B00] focus:ring-[#FF6B00]"
                  />
                </div>
              </div>
            </div>

            {/* Status de Atividade */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Wifi className="h-5 w-5 text-[#FF6B00]" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Status de Atividade
                </h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="activity_status" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Como você está agora?
                </Label>
                <Select
                  value={formData.activity_status}
                  onValueChange={(value) => handleInputChange("activity_status", value)}
                >
                  <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:border-[#FF6B00] focus:ring-[#FF6B00]">
                    <SelectValue placeholder="Selecione seu status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">🟢 Online</SelectItem>
                    <SelectItem value="ocupado">🔴 Ocupado</SelectItem>
                    <SelectItem value="estudando">📚 Estudando</SelectItem>
                    <SelectItem value="trabalhando">💼 Trabalhando</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Isso será exibido no seu perfil para outros usuários
                </p>
              </div>
            </div>

            {/* Título de Estudante */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Award className="h-5 w-5 text-[#FF6B00]" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Título de Estudante
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student_title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tipo de Estudante
                  </Label>
                  <Input
                    id="student_title"
                    value={formData.student_title}
                    onChange={(e) => handleInputChange("student_title", e.target.value)}
                    placeholder="Ex: Estudante de Engenharia, Vestibulanda, Estudante de Medicina..."
                    className="border-gray-300 dark:border-gray-600 focus:border-[#FF6B00] focus:ring-[#FF6B00]"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Isso nos ajuda a sugerir conteúdos personalizados para você
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Website Pessoal
                  </Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    placeholder="https://seusite.com"
                    className="border-gray-300 dark:border-gray-600 focus:border-[#FF6B00] focus:ring-[#FF6B00]"
                  />
                </div>
              </div>
            </div>

            {/* Redes Sociais */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Share2 className="h-5 w-5 text-[#FF6B00]" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Redes Sociais
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tiktok" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    TikTok
                  </Label>
                  <Input
                    id="tiktok"
                    value={formData.social_links.tiktok}
                    onChange={(e) => handleInputChange("social_links.tiktok", e.target.value)}
                    placeholder="https://tiktok.com/@seuusuario"
                    className="border-gray-300 dark:border-gray-600 focus:border-[#FF6B00] focus:ring-[#FF6B00]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    YouTube
                  </Label>
                  <Input
                    id="youtube"
                    value={formData.social_links.youtube}
                    onChange={(e) => handleInputChange("social_links.youtube", e.target.value)}
                    placeholder="https://youtube.com/@seucanal"
                    className="border-gray-300 dark:border-gray-600 focus:border-[#FF6B00] focus:ring-[#FF6B00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    value={formData.social_links.instagram}
                    onChange={(e) => handleInputChange("social_links.instagram", e.target.value)}
                    placeholder="https://instagram.com/seuusuario"
                    className="border-gray-300 dark:border-gray-600 focus:border-[#FF6B00] focus:ring-[#FF6B00]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    X (Twitter)
                  </Label>
                  <Input
                    id="twitter"
                    value={formData.social_links.twitter}
                    onChange={(e) => handleInputChange("social_links.twitter", e.target.value)}
                    placeholder="https://x.com/seuusuario"
                    className="border-gray-300 dark:border-gray-600 focus:border-[#FF6B00] focus:ring-[#FF6B00]"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleClose} 
              disabled={isLoading}
              className="border-gray-300 dark:border-gray-600"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading}
              className="bg-[#FF6B00] hover:bg-[#FF5500] text-white min-w-[140px]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Salvando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Salvar Alterações
                </div>
              )}
            </Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
