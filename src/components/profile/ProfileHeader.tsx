import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Clock,
  UserCheck,
  Trophy,
  Pencil,
} from "lucide-react";

interface ProfileHeaderProps {
  name: string;
  avatarUrl?: string;
  coverUrl?: string;
  level?: number;
  status?: "Online" | "Offline" | "Ausente";
  location?: string;
  occupation?: string;
  education?: string;
  memberSince?: string;
  connections?: number;
  achievements?: number;
  isCurrentUser?: boolean;
}

const ProfileHeader = ({
  name,
  avatarUrl,
  coverUrl,
  level = 1,
  status = "Online",
  location = "São Paulo, Brasil",
  occupation = "Estudante",
  education = "Universidade de São Paulo",
  memberSince = "Março 2024",
  connections = 127,
  achievements = 15,
  isCurrentUser = true,
}: ProfileHeaderProps) => {
  const navigate = useNavigate();

  return (
    <Card className="w-full overflow-hidden shadow-md border-0 max-w-3xl mx-auto bg-gradient-to-b from-brand-card to-white dark:from-slate-900 dark:to-slate-800">
      {/* Capa */}
      <div 
        className="h-32 w-full relative bg-gradient-to-r from-indigo-950 to-slate-800 overflow-hidden"
        style={{ 
          backgroundImage: `url(${coverUrl || '/images/pattern-grid.svg'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
      </div>

      {/* Avatar e Info - POSICIONADO FORA DA CAPA */}
      <div className="relative px-6 pb-5 pt-1">
        {/* Avatar - posicionado para ficar sobreposto à capa */}
        <div className="absolute -top-12 left-6 animate-avatar-entrance">
          <div className="relative">
            <Avatar className="w-20 h-20 border-4 border-white dark:border-slate-900 shadow-lg">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-brand-primary text-white text-xl">
                {name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-white dark:border-slate-900"></div>
          </div>
        </div>

        {/* Informações do perfil */}
        <div className="flex flex-col sm:flex-row justify-between items-start mt-10 sm:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-brand-black dark:text-white profile-3d-text">
                {name}
              </h1>
              <Badge className="bg-brand-primary hover:bg-brand-primary/90 text-xs">
                Nível {level}
              </Badge>
              <Badge variant="outline" className="text-xs font-normal">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span> {status}
              </Badge>
            </div>

            <div className="text-sm text-brand-muted flex items-center mt-1">
              <MapPin className="w-3 h-3 mr-1" /> {location}
            </div>
          </div>

          {isCurrentUser ? (
            <Button 
              size="sm" 
              variant="outline"
              className="mt-2 sm:mt-0 text-xs flex items-center gap-1 bg-white dark:bg-transparent shadow-sm hover:shadow-md transition-all"
              onClick={() => navigate("/configuracoes")}
            >
              <Pencil className="w-3 h-3" /> Editar Perfil
            </Button>
          ) : (
            <Button 
              size="sm" 
              className="mt-2 sm:mt-0 text-xs bg-brand-primary hover:bg-brand-primary/90 shadow-sm"
            >
              Conectar
            </Button>
          )}
        </div>

        {/* Detalhes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="flex items-center text-sm text-brand-muted">
            <Briefcase className="w-4 h-4 mr-2 text-brand-primary" />
            <span className="text-brand-black dark:text-white/80">{occupation}</span>
          </div>
          <div className="flex items-center text-sm text-brand-muted">
            <GraduationCap className="w-4 h-4 mr-2 text-brand-primary" />
            <span className="text-brand-black dark:text-white/80">{education}</span>
          </div>
          <div className="flex items-center text-sm text-brand-muted">
            <Clock className="w-4 h-4 mr-2 text-brand-primary" />
            <span className="text-brand-black dark:text-white/80">Membro desde {memberSince}</span>
          </div>
        </div>
      </div>

      <Separator className="mt-1" />

      {/* Estatísticas */}
      <CardContent className="py-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-primary/10 mb-1">
              <UserCheck className="w-4 h-4 text-brand-primary" />
            </div>
            <span className="text-lg font-semibold text-brand-black dark:text-white">{connections}</span>
            <span className="text-xs text-brand-muted">Conexões</span>
          </div>

          <div className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-primary/10 mb-1">
              <Trophy className="w-4 h-4 text-brand-primary" />
            </div>
            <span className="text-lg font-semibold text-brand-black dark:text-white">{achievements}</span>
            <span className="text-xs text-brand-muted">Conquistas</span>
          </div>

          <div className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-primary/10 mb-1">
              <Mail className="w-4 h-4 text-brand-primary" />
            </div>
            <span className="text-lg font-semibold text-brand-black dark:text-white">85%</span>
            <span className="text-xs text-brand-muted">Responsividade</span>
          </div>

          <div className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-primary/10 mb-1">
              <GraduationCap className="w-4 h-4 text-brand-primary" />
            </div>
            <span className="text-lg font-semibold text-brand-black dark:text-white">4.8</span>
            <span className="text-xs text-brand-muted">Reputação</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;