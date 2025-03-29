import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Heart,
  Share2,
  MoreVertical,
  Users,
  UserPlus,
  ChevronRight,
  MessageCircle,
  Calendar,
  FileText,
  Info,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import TabNavigation from "./tabs/TabNavigation";

interface GroupDetailHeaderProps {
  group: {
    id?: string;
    nome?: string;
    descricao?: string;
    imagem?: string;
    membros?: number;
    curso?: string;
    tags?: string[];
  };
  onBack: () => void;
  onViewMembers?: () => void;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export const GroupDetailHeader: React.FC<GroupDetailHeaderProps> = ({
  group,
  onBack,
  onViewMembers = () => {},
  activeTab = "discussoes",
  onTabChange = () => {},
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const { theme } = useTheme();

  // Default cover image if not provided
  const coverImage =
    group.imagem ||
    "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80";

  // Mock member avatars for demonstration
  const memberAvatars = [
    {
      id: "1",
      name: "Ana Silva",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
    },
    {
      id: "2",
      name: "Pedro Costa",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro",
    },
    {
      id: "3",
      name: "Maria Oliveira",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    },
    {
      id: "4",
      name: "João Santos",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao",
    },
    {
      id: "5",
      name: "Carla Mendes",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carla",
    },
  ];

  const handleMemberClick = (memberId: string) => {
    console.log(`Navigate to member profile: ${memberId}`);
    // Implementation for navigating to member profile would go here
  };

  // Define tabs for navigation
  const tabs = [
    {
      id: "discussoes",
      label: "Discussões",
      icon: <MessageCircle className="h-4 w-4" />,
    },
    { id: "eventos", label: "Eventos", icon: <Calendar className="h-4 w-4" /> },
    { id: "membros", label: "Membros", icon: <Users className="h-4 w-4" /> },
    {
      id: "arquivos",
      label: "Arquivos",
      icon: <FileText className="h-4 w-4" />,
    },
    { id: "sobre", label: "Sobre", icon: <Info className="h-4 w-4" /> },
  ];

  return (
    <div className="sticky top-0 z-10 flex flex-col">
      <div className="relative h-56 w-full overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl">
        {/* Cover Image with animation */}
        <img
          src={coverImage}
          alt={group.nome || "Grupo de Estudos"}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105 hover:brightness-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

        {/* Back Button with special highlight */}
        <Button
          variant="outline"
          size="sm"
          className="absolute top-4 left-4 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border-white/30 rounded-lg px-4 py-2 transition-all shadow-lg hover:shadow-xl"
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5 mr-2" /> Voltar
        </Button>

        {/* Favorite Button with animation */}
        <Button
          variant="outline"
          size="sm"
          className={`absolute top-4 right-4 backdrop-blur-md rounded-full h-10 w-10 p-0 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 ${isFavorite ? "bg-red-500/30 text-red-500 border-red-500/30 hover:bg-red-500/40" : "bg-white/20 text-white border-white/30 hover:bg-white/30"}`}
          onClick={() => setIsFavorite(!isFavorite)}
        >
          <Heart
            className={`h-5 w-5 ${isFavorite ? "fill-red-500" : ""} transition-all duration-300`}
          />
        </Button>

        {/* Group Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                {group.nome || "Mecânica Quântica Avançada"}
              </h1>
              <div className="flex items-center mt-2 space-x-3">
                <Badge className="bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/30">
                  {group.curso || "Física Quântica"}
                </Badge>
                {group.tags && group.tags.length > 0 && (
                  <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    {group.tags[0]}
                  </Badge>
                )}

                {/* Member avatars with tooltip */}
                <div className="flex items-center">
                  <div className="flex -space-x-2 mr-2">
                    <TooltipProvider>
                      {memberAvatars.slice(0, 3).map((member) => (
                        <Tooltip key={member.id}>
                          <TooltipTrigger asChild>
                            <Avatar
                              className="h-6 w-6 border-2 border-white cursor-pointer transition-transform hover:scale-110 hover:z-10"
                              onClick={() => handleMemberClick(member.id)}
                            >
                              <AvatarImage
                                src={member.avatar}
                                alt={member.name}
                              />
                              <AvatarFallback>
                                {member.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{member.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </TooltipProvider>
                    {memberAvatars.length > 3 && (
                      <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-700 border-2 border-white flex items-center justify-center text-xs text-gray-700 dark:text-white">
                        +{memberAvatars.length - 3}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-white p-0 h-auto flex items-center hover:text-[#FF6B00] transition-colors"
                    onClick={onViewMembers}
                  >
                    <span className="text-sm">Ver membros</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Moved to bottom corner */}
            <div className="flex gap-2 absolute bottom-6 right-6">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105"
              >
                <Share2 className="h-4 w-4 mr-2" /> Compartilhar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 text-white transition-all duration-300 hover:scale-105"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Tab Navigation */}
      <div className="mt-4 px-2">
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
      </div>
    </div>
  );
};

export default GroupDetailHeader;
