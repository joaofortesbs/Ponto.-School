import React, { useState } from 'react';
import { UserProfile } from '@/types/user-profile';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Pencil, Camera, Check, X } from 'lucide-react';

interface ProfileHeaderProps {
  profile: UserProfile | null;
  isCurrentUser: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, isCurrentUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [previewCover, setPreviewCover] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAvatarFile(file);

      // Criar preview da imagem
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCoverFile(file);

      // Criar preview da imagem
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewCover(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = () => {
    // Aqui você implementaria a lógica para salvar as imagens atualizadas
    // Por exemplo, chamando uma API ou atualizando o estado global
    console.log('Avatar:', avatarFile);
    console.log('Cover:', coverFile);
    setIsEditing(false);

    // Limpar previews e arquivos
    setPreviewAvatar(null);
    setPreviewCover(null);
    setAvatarFile(null);
    setCoverFile(null);
  };

  const handleCancelChanges = () => {
    setIsEditing(false);
    setPreviewAvatar(null);
    setPreviewCover(null);
    setAvatarFile(null);
    setCoverFile(null);
  };

  if (!profile) {
    return (
      <div className="animate-pulse">
        <div className="relative overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-700 shadow-md mb-4" style={{ height: '200px' }}></div>
        <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12 px-4">
          <div className="relative z-10">
            <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-background overflow-hidden shadow-lg bg-gray-300 dark:bg-gray-600"></div>
          </div>
          <div className="flex-1 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-2 sm:gap-4 pt-2 mb-2">
            <div className="text-center sm:text-left w-full">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative overflow-hidden rounded-xl shadow-md mb-4" style={{ height: '200px' }}>
        <img 
          src={previewCover || profile.coverImage || '/images/tempo-image-20250329T044458419Z.png'} 
          alt="Capa do Perfil" 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/images/tempo-image-20250329T044458419Z.png';
          }}
        />

        {isEditing && (
          <label className="absolute bottom-4 right-4 p-2 bg-white dark:bg-gray-800 rounded-full cursor-pointer shadow-md">
            <Camera className="h-5 w-5 text-primary" />
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleCoverChange} 
              className="hidden"
            />
          </label>
        )}
      </div>

      <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12 px-4">
        <div className="relative z-10">
          <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-background overflow-hidden shadow-lg">
            <img 
              src={previewAvatar || profile.avatar || '/images/tempo-image-20250329T020819629Z.png'} 
              alt={profile.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/images/tempo-image-20250329T020819629Z.png';
              }}
            />
          </div>

          {isEditing && (
            <label className="absolute bottom-1 right-1 p-2 bg-white dark:bg-gray-800 rounded-full cursor-pointer shadow-md">
              <Camera className="h-4 w-4 text-primary" />
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleAvatarChange} 
                className="hidden"
              />
            </label>
          )}
        </div>

        <div className="flex-1 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-2 sm:gap-4 pt-2 mb-2">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">@{profile.username}</p>
          </div>

          <div className="flex gap-2">
            {isCurrentUser && !isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-1" />
                Editar Perfil
              </Button>
            )}

            {isEditing && (
              <>
                <Button onClick={handleCancelChanges} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
                <Button onClick={handleSaveChanges} variant="default" size="sm">
                  <Check className="h-4 w-4 mr-1" />
                  Salvar
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="space-y-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">Usuário desde</p>
          <p className="font-medium">{profile.joinDate || 'Não informado'}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">Último acesso</p>
          <p className="font-medium">{profile.lastActive || 'Não informado'}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">Plano</p>
          <p className="font-medium">{profile.plan || 'Não informado'}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileHeader;