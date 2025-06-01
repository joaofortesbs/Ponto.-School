
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { Edit, Save, X } from "lucide-react";
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
    bio: "",
    location: "",
    birth_date: "",
    phone: "",
    occupation: "",
    education: "",
    interests: "",
    website: "",
    social_links: {
      linkedin: "",
      instagram: "",
      twitter: "",
      github: ""
    }
  });

  useEffect(() => {
    if (userProfile && isOpen) {
      setFormData({
        display_name: userProfile.display_name || "",
        full_name: userProfile.full_name || "",
        bio: userProfile.bio || "",
        location: userProfile.location || "",
        birth_date: userProfile.birth_date || "",
        phone: userProfile.phone || "",
        occupation: userProfile.occupation || "",
        education: userProfile.education || "",
        interests: userProfile.interests || "",
        website: userProfile.website || "",
        social_links: {
          linkedin: userProfile.social_links?.linkedin || "",
          instagram: userProfile.social_links?.instagram || "",
          twitter: userProfile.social_links?.twitter || "",
          github: userProfile.social_links?.github || ""
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
          bio: formData.bio,
          location: formData.location,
          birth_date: formData.birth_date || null,
          phone: formData.phone,
          occupation: formData.occupation,
          education: formData.education,
          interests: formData.interests,
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Editar Perfil
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#29335C] dark:text-white">
              Informações Básicas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="display_name">Nome de Exibição</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) => handleInputChange("display_name", e.target.value)}
                  placeholder="Como você quer ser chamado"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  placeholder="Seu nome completo"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Biografia</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Conte um pouco sobre você..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          {/* Informações de Contato */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#29335C] dark:text-white">
              Informações de Contato
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="location">Localização</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="Cidade, Estado"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="birth_date">Data de Nascimento</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => handleInputChange("birth_date", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="https://seusite.com"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Informações Profissionais */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#29335C] dark:text-white">
              Informações Profissionais
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="occupation">Profissão</Label>
                <Input
                  id="occupation"
                  value={formData.occupation}
                  onChange={(e) => handleInputChange("occupation", e.target.value)}
                  placeholder="Sua profissão atual"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="education">Educação</Label>
                <Input
                  id="education"
                  value={formData.education}
                  onChange={(e) => handleInputChange("education", e.target.value)}
                  placeholder="Sua formação acadêmica"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="interests">Interesses</Label>
              <Input
                id="interests"
                value={formData.interests}
                onChange={(e) => handleInputChange("interests", e.target.value)}
                placeholder="Tecnologia, Programação, Design..."
                className="mt-1"
              />
            </div>
          </div>

          {/* Redes Sociais */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#29335C] dark:text-white">
              Redes Sociais
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={formData.social_links.linkedin}
                  onChange={(e) => handleInputChange("social_links.linkedin", e.target.value)}
                  placeholder="https://linkedin.com/in/seuperfil"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="github">GitHub</Label>
                <Input
                  id="github"
                  value={formData.social_links.github}
                  onChange={(e) => handleInputChange("social_links.github", e.target.value)}
                  placeholder="https://github.com/seuusuario"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={formData.social_links.instagram}
                  onChange={(e) => handleInputChange("social_links.instagram", e.target.value)}
                  placeholder="https://instagram.com/seuusuario"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  value={formData.social_links.twitter}
                  onChange={(e) => handleInputChange("social_links.twitter", e.target.value)}
                  placeholder="https://twitter.com/seuusuario"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="bg-[#FF6B00] hover:bg-[#FF6B00]/90"
          >
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
