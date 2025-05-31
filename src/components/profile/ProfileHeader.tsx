import React, { useState } from "react";
import { Camera, Edit2, MapPin, Calendar, Mail, Phone, Settings, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { UserProfile } from "@/types/user-profile";
import { AddFriendsModal } from "@/components/friends/AddFriendsModal";

interface ProfileHeaderProps {
  userProfile: UserProfile | null;
  onEditClick: () => void;
}

export default function ProfileHeader({ userProfile, onEditClick }: ProfileHeaderProps) {
  const [showAddFriendsModal, setShowAddFriendsModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const handleCoverPhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadImage('cover', file);
    }
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadImage('profile', file);
    }
  };

  const uploadImage = async (type: 'cover' | 'profile', file: File) => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${type}-${userProfile?.id}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading image:', error);
        alert('Erro ao fazer upload da imagem.');
      } else {
        console.log('Image uploaded successfully:', data);
        const imageUrl = `${supabase.storageUrl}/avatars/${filePath}`;

        if (type === 'cover') {
          setCoverPhoto(imageUrl);
        } else {
          setProfilePicture(imageUrl);
        }

        // Atualizar o perfil do usuário no banco de dados
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            cover_url: type === 'cover' ? imageUrl : userProfile?.cover_url,
            avatar_url: type === 'profile' ? imageUrl : userProfile?.avatar_url
          })
          .eq('id', userProfile?.id);

        if (updateError) {
          console.error('Error updating profile:', updateError);
          alert('Erro ao atualizar o perfil.');
        } else {
          console.log('Profile updated successfully.');
          // Atualizar o estado do perfil localmente
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('Erro inesperado ao fazer upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 overflow-hidden shadow-sm">
        {/* Cover Photo Section */}
        <div className="relative h-32 bg-gradient-to-r from-[#FF6B00] to-[#FF8736] overflow-hidden">
          <img
            src={coverPhoto || userProfile?.cover_url || "https://source.unsplash.com/random/1920x1080/?city,night"}
            alt="Cover Photo"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/30" />
          <label htmlFor="cover-upload" className="absolute top-2 right-2 cursor-pointer">
            <input
              type="file"
              id="cover-upload"
              accept="image/*"
              className="hidden"
              onChange={handleCoverPhotoChange}
            />
            <Button
              variant="secondary"
              size="icon"
              disabled={isUploading}
              className="bg-black/20 hover:bg-black/40 text-white shadow-none"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </label>
        </div>

        {/* Profile Content */}
        <div className="px-6 pb-6">
          {/* Profile Picture */}
          <div className="flex justify-center mb-4 -mt-12">
            <div className="relative">
              <img
                src={profilePicture || userProfile?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                alt="Profile Picture"
                className="w-24 h-24 rounded-full object-cover object-center border-4 border-white dark:border-[#0A2540] shadow-md"
              />
              <label htmlFor="profile-upload" className="absolute bottom-1 right-1 cursor-pointer">
                <input
                  type="file"
                  id="profile-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePictureChange}
                />
                <Button
                  variant="secondary"
                  size="icon"
                  disabled={isUploading}
                  className="bg-black/20 hover:bg-black/40 text-white shadow-none"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </label>
            </div>
          </div>

          {/* User Info */}
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-semibold text-[#29335C] dark:text-white">
              {userProfile?.full_name || userProfile?.display_name || "Usuário"}
            </h2>
            <div className="flex items-center justify-center gap-2">
              <Badge className="bg-[#FFD3BF] text-[#FF6B00] text-xs rounded-full px-2 py-1 font-medium border-none shadow-none">
                {userProfile?.rank || "Aprendiz"}
              </Badge>
              <span className="text-[#64748B] dark:text-white/60 text-sm">
                Nível {userProfile?.level || 1}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 text-[#64748B] dark:text-white/60">
              <MapPin className="h-4 w-4" />
              <span>{userProfile?.location || "Brasil"}</span>
              <Calendar className="h-4 w-4" />
              <span>Entrou em 10/10/2024</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-[#E0E1DD] dark:border-white/10 text-[#29335C] dark:text-white hover:bg-[#F8F9FA] dark:hover:bg-white/10"
              onClick={onEditClick}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Editar Perfil
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-[#E0E1DD] dark:border-white/10 text-[#29335C] dark:text-white hover:bg-[#F8F9FA] dark:hover:bg-white/10"
              onClick={() => setShowAddFriendsModal(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Adicionar Amigos
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="border-[#E0E1DD] dark:border-white/10 text-[#29335C] dark:text-white hover:bg-[#F8F9FA] dark:hover:bg-white/10"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Add Friends Modal */}
      <AddFriendsModal
        isOpen={showAddFriendsModal}
        onClose={() => setShowAddFriendsModal(false)}
      />
    </>
  );
}
