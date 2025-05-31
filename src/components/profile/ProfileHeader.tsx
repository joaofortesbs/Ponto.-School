
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Camera, Edit, MapPin, Calendar, Star, Upload, X } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useProfileCover } from "@/hooks/useProfileCover";
import type { UserProfile } from "@/types/user-profile";

interface ProfileHeaderProps {
  userProfile: UserProfile | null;
  onEditClick: () => void;
}

export default function ProfileHeader({ userProfile, onEditClick }: ProfileHeaderProps) {
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isEditingCover, setIsEditingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadCoverImage, removeCoverImage, isUploading } = useProfileCover();

  // Carregar capa do perfil do Supabase
  useEffect(() => {
    if (userProfile?.cover_url) {
      setCoverImage(userProfile.cover_url);
    }
  }, [userProfile]);

  const handleCoverImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validação de tipo de arquivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        return;
      }

      // Validação de tamanho (máx 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 10MB.');
        return;
      }

      // Upload para Supabase
      const uploadedUrl = await uploadCoverImage(file);
      if (uploadedUrl) {
        setCoverImage(uploadedUrl);
      }
    }
  };

  const handleRemoveCover = async () => {
    const success = await removeCoverImage();
    if (success) {
      setCoverImage(null);
    }
    setIsEditingCover(false);
  };

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 10MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatJoinDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Membro desde 2024";
    try {
      const date = new Date(dateString);
      return `Membro desde ${date.getFullYear()}`;
    } catch {
      return "Membro desde 2024";
    }
  };

  return (
    <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 overflow-hidden shadow-sm w-full transition-all duration-300 backdrop-blur-sm bg-gradient-to-br from-white to-white/90 dark:from-[#0A2540] dark:to-[#0A2540]/95" style={{ height: "420px", minHeight: "420px" }}>
      {/* Cover Image Section */}
      <div
        className="relative h-32 bg-gradient-to-br from-[#FF6B00] via-[#FF9D4D] to-[#FFAB5C] overflow-hidden group cursor-pointer"
        onMouseEnter={() => setIsEditingCover(true)}
        onMouseLeave={() => setIsEditingCover(false)}
        onClick={() => !coverImage && coverInputRef.current?.click()}
      >
        {coverImage && (
          <img
            src={coverImage}
            alt="Capa do perfil"
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Cover edit overlay */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isEditingCover ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex gap-2">
            {!coverImage ? (
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/90 text-gray-800 hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  coverInputRef.current?.click();
                }}
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-1" />
                {isUploading ? 'Enviando...' : 'Adicionar Capa'}
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/90 text-gray-800 hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    coverInputRef.current?.click();
                  }}
                  disabled={isUploading}
                >
                  <Camera className="h-4 w-4 mr-1" />
                  {isUploading ? 'Enviando...' : 'Alterar'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-red-500/90 text-white hover:bg-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveCover();
                  }}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4 mr-1" />
                  Remover
                </Button>
              </>
            )}
          </div>
        </div>

        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          onChange={handleCoverImageChange}
          className="hidden"
        />
      </div>

      {/* Profile Section */}
      <div className="p-6 relative">
        {/* Profile Picture */}
        <div className="absolute -top-12 left-6">
          <div className="relative group">
            <Avatar className="w-20 h-20 border-4 border-white dark:border-[#0A2540] shadow-lg">
              <AvatarImage
                src={profileImage || userProfile?.avatar_url || ""}
                alt={userProfile?.display_name || userProfile?.full_name || "Usuário"}
              />
              <AvatarFallback className="bg-gradient-to-br from-[#FF6B00] to-[#FF9D4D] text-white text-lg font-bold">
                {getInitials(userProfile?.display_name || userProfile?.full_name)}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="secondary"
              size="icon"
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white dark:bg-[#0A2540] border-2 border-[#E0E1DD] dark:border-white/10 hover:bg-gray-50 dark:hover:bg-[#0A2540]/80 opacity-0 group-hover:opacity-100 transition-all duration-300"
              onClick={() => profileInputRef.current?.click()}
            >
              <Camera className="h-3 w-3 text-[#64748B] dark:text-white/60" />
            </Button>
            <input
              ref={profileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Edit Button */}
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#64748B] dark:text-white/60 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 rounded-full transition-all duration-300"
            onClick={onEditClick}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>

        {/* Profile Info */}
        <div className="mt-10 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-[#29335C] dark:text-white">
                {userProfile?.display_name || userProfile?.full_name || "Nome do Usuário"}
              </h2>
              <Badge
                variant="secondary"
                className="bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/20 px-2 py-1"
              >
                <Star className="h-3 w-3 mr-1" />
                {userProfile?.rank || "Aprendiz"}
              </Badge>
            </div>
            <p className="text-sm text-[#64748B] dark:text-white/60 mb-3">
              {userProfile?.email || "email@exemplo.com"}
            </p>
          </motion.div>

          <motion.div
            className="flex items-center gap-4 text-sm text-[#64748B] dark:text-white/60"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-[#FF6B00]" />
              <span>{userProfile?.location || "São Paulo, Brasil"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-[#FF6B00]" />
              <span>{formatJoinDate(userProfile?.created_at)}</span>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center gap-6 pt-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="text-center">
              <div className="text-lg font-bold text-[#29335C] dark:text-white">
                {userProfile?.level || 1}
              </div>
              <div className="text-xs text-[#64748B] dark:text-white/60">Nível</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-[#29335C] dark:text-white">
                {userProfile?.xp || 0}
              </div>
              <div className="text-xs text-[#64748B] dark:text-white/60">XP Total</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-[#29335C] dark:text-white">
                {userProfile?.achievements_count || 0}
              </div>
              <div className="text-xs text-[#64748B] dark:text-white/60">Conquistas</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
