import React, { useState } from 'react';
import { UserProfile } from '@/types/user-profile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Save } from 'lucide-react';

interface AboutMeProps {
  profile: UserProfile | null;
  isCurrentUser: boolean;
}

const AboutMe: React.FC<AboutMeProps> = ({ profile, isCurrentUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [bioText, setBioText] = useState(profile?.bio || '');

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // Aqui você implementaria a lógica para salvar a bio atualizada
    // Por exemplo, chamando uma API ou atualizando o estado global
    console.log('Bio atualizada:', bioText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setBioText(profile?.bio || '');
    setIsEditing(false);
  };

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Sobre Mim</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500">Informações não disponíveis</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Sobre Mim</CardTitle>
        {isCurrentUser && !isEditing && (
          <Button onClick={handleEdit} variant="ghost" size="sm">
            <Pencil className="h-4 w-4 mr-1" />
            Editar
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-3">
            <Textarea 
              value={bioText} 
              onChange={(e) => setBioText(e.target.value)}
              placeholder="Conte um pouco sobre você..."
              className="min-h-[120px]"
            />
            <div className="flex justify-end gap-2">
              <Button onClick={handleCancel} variant="outline" size="sm">
                Cancelar
              </Button>
              <Button onClick={handleSave} size="sm">
                <Save className="h-4 w-4 mr-1" />
                Salvar
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
            {profile.bio || 'Nenhuma informação disponível.'}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AboutMe;