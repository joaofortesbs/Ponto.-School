import React from 'react';
import { UserProfile } from '@/types/user-profile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, Globe, MapPin } from 'lucide-react';

interface ContactInfoProps {
  profile: UserProfile | null;
}

const ContactInfo: React.FC<ContactInfoProps> = ({ profile }) => {
  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Informações de Contato</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500">Informações não disponíveis</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Informações de Contato</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {profile.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm">{profile.email}</span>
          </div>
        )}

        {profile.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm">{profile.phone}</span>
          </div>
        )}

        {profile.website && (
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <a 
              href={profile.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {profile.website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}

        {profile.location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm">{profile.location}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactInfo;