
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { Edit, Save, X, User, Award, Share2, Sparkles } from "lucide-react";
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-gray-50/80 to-blue-50/30 dark:from-gray-900 dark:via-gray-800/90 dark:to-blue-900/20 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-2xl">
        {/* Background Effects */}
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10">
          <DialogHeader className="pb-6 border-b border-gray-200/60 dark:border-gray-700/60">
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-[#FF6B00] to-[#FF8533] bg-clip-text text-transparent">
              <div className="p-2 bg-gradient-to-r from-[#FF6B00] to-[#FF8533] rounded-xl shadow-lg">
                <Edit className="h-6 w-6 text-white" />
              </div>
              Editar Perfil
            </DialogTitle>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Personalize suas informações e conecte suas redes sociais
            </p>
          </DialogHeader>

          <div className="space-y-8 py-6">
            {/* Informações Pessoais */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-md">
                  <User className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                  Informações Pessoais
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="display_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nome de Exibição
                  </Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => handleInputChange("display_name", e.target.value)}
                    placeholder="Como você quer ser chamado"
                    className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-600 focus:border-[#FF6B00] focus:ring-[#FF6B00] transition-all duration-300"
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
                    className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-600 focus:border-[#FF6B00] focus:ring-[#FF6B00] transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Título de Estudante */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-md">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                  Título de Estudante
                </h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="student_title" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#FF6B00]" />
                  Tipo de Estudante
                </Label>
                <Input
                  id="student_title"
                  value={formData.student_title}
                  onChange={(e) => handleInputChange("student_title", e.target.value)}
                  placeholder="Ex: Estudante de Engenharia, Vestibulanda, Estudante de Medicina..."
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-600 focus:border-[#FF6B00] focus:ring-[#FF6B00] transition-all duration-300"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  🎯 Isso nos ajuda a sugerir conteúdos personalizados para você!
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
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-600 focus:border-[#FF6B00] focus:ring-[#FF6B00] transition-all duration-300"
                />
              </div>
            </div>

            {/* Redes Sociais */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg shadow-md">
                  <Share2 className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                  Redes Sociais
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tiktok" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <div className="w-4 h-4 bg-black dark:bg-white rounded-sm flex items-center justify-center">
                      <span className="text-white dark:text-black text-xs font-bold">T</span>
                    </div>
                    TikTok
                  </Label>
                  <Input
                    id="tiktok"
                    value={formData.social_links.tiktok}
                    onChange={(e) => handleInputChange("social_links.tiktok", e.target.value)}
                    placeholder="https://tiktok.com/@seuusuario"
                    className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-600 focus:border-[#FF6B00] focus:ring-[#FF6B00] transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-600 rounded-sm flex items-center justify-center">
                      <span className="text-white text-xs font-bold">▶</span>
                    </div>
                    YouTube
                  </Label>
                  <Input
                    id="youtube"
                    value={formData.social_links.youtube}
                    onChange={(e) => handleInputChange("social_links.youtube", e.target.value)}
                    placeholder="https://youtube.com/@seucanal"
                    className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-600 focus:border-[#FF6B00] focus:ring-[#FF6B00] transition-all duration-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-tr from-purple-600 via-pink-600 to-orange-400 rounded-sm"></div>
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    value={formData.social_links.instagram}
                    onChange={(e) => handleInputChange("social_links.instagram", e.target.value)}
                    placeholder="https://instagram.com/seuusuario"
                    className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-600 focus:border-[#FF6B00] focus:ring-[#FF6B00] transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <div className="w-4 h-4 bg-black dark:bg-white rounded-sm flex items-center justify-center">
                      <span className="text-white dark:text-black text-xs font-bold">𝕏</span>
                    </div>
                    X (Twitter)
                  </Label>
                  <Input
                    id="twitter"
                    value={formData.social_links.twitter}
                    onChange={(e) => handleInputChange("social_links.twitter", e.target.value)}
                    placeholder="https://x.com/seuusuario"
                    className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-600 focus:border-[#FF6B00] focus:ring-[#FF6B00] transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6 border-t border-gray-200/60 dark:border-gray-700/60 flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleClose} 
              disabled={isLoading}
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading}
              className="bg-gradient-to-r from-[#FF6B00] to-[#FF8533] hover:from-[#FF5500] hover:to-[#FF7333] text-white shadow-lg hover:shadow-xl transition-all duration-300 min-w-[140px]"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
