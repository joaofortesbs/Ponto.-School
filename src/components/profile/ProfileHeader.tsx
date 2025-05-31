
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, MapPin, Calendar, Briefcase } from "lucide-react";
import type { UserProfile } from "@/types/user-profile";

interface ProfileHeaderProps {
  userProfile: UserProfile | null;
  onEditClick: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  userProfile,
  onEditClick,
}) => {
  const defaultAvatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";

  return (
    <Card className="bg-white dark:bg-[#0A2540] border-[#E0E1DD] dark:border-white/10 overflow-hidden shadow-sm">
      <div className="relative h-32 bg-gradient-to-r from-[#FF6B00] to-[#FF8533] dark:from-[#FF6B00]/80 dark:to-[#FF8533]/80"></div>
      
      <CardContent className="p-6 relative">
        <div className="flex flex-col items-center -mt-16 mb-4">
          <div className="relative">
            <img
              src={userProfile?.avatar_url || defaultAvatar}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-white dark:border-[#0A2540] object-cover shadow-lg"
            />
            <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        </div>

        <div className="text-center space-y-3">
          <div>
            <h3 className="text-xl font-bold text-[#29335C] dark:text-white">
              {userProfile?.full_name || "Nome do Usuário"}
            </h3>
            <p className="text-[#64748B] dark:text-white/60 text-sm">
              @{userProfile?.username || "username"}
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 text-sm text-[#64748B] dark:text-white/60">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{userProfile?.location || "São Paulo, BR"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Desde 2024</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary" className="bg-[#FF6B00]/10 text-[#FF6B00] dark:bg-[#FF6B00]/20">
              <Briefcase className="h-3 w-3 mr-1" />
              {userProfile?.rank || "Aprendiz"}
            </Badge>
            <Badge variant="outline" className="text-[#64748B] dark:text-white/60 dark:border-white/20">
              Nível {userProfile?.level || 1}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-4 py-3 border-t border-[#E0E1DD] dark:border-white/10">
            <div className="text-center">
              <div className="text-lg font-bold text-[#29335C] dark:text-white">
                {userProfile?.followers_count || 0}
              </div>
              <div className="text-xs text-[#64748B] dark:text-white/60">Seguidores</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-[#29335C] dark:text-white">
                {userProfile?.following_count || 0}
              </div>
              <div className="text-xs text-[#64748B] dark:text-white/60">Seguindo</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-[#29335C] dark:text-white">
                {userProfile?.posts_count || 0}
              </div>
              <div className="text-xs text-[#64748B] dark:text-white/60">Posts</div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onEditClick}
            className="w-full mt-4 border-[#E0E1DD] dark:border-white/20 text-[#64748B] dark:text-white/60 hover:bg-[#F8F9FA] dark:hover:bg-white/5"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
