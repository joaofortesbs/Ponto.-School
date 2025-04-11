
import React, { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, Star } from "lucide-react";
import { UserProfile } from "@/types/user-profile";
import { profileService } from "@/services/profileService";

interface ProfileHeaderProps {
  userProfile: UserProfile | null;
  onEditClick: () => void;
}

export default function ProfileHeader({ userProfile, onEditClick }: ProfileHeaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const profileLevelRef = useRef<HTMLDivElement>(null);
  const [displayName, setDisplayName] = useState(userProfile?.display_name || "Usuário");
  const [userInitials, setUserInitials] = useState("U");

  // Calcular iniciais do nome
  useEffect(() => {
    if (userProfile?.display_name) {
      const nameParts = userProfile.display_name.split(" ");
      if (nameParts.length > 1) {
        setUserInitials(nameParts[0][0] + nameParts[1][0]);
      } else if (nameParts.length === 1 && nameParts[0].length > 0) {
        setUserInitials(nameParts[0][0]);
      }
    }
  }, [userProfile]);

  // Animação de cartão 3D para o perfil
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current) return;

      const { clientX, clientY } = event;
      const { left, top, width, height } = containerRef.current.getBoundingClientRect();

      const x = (clientX - left) / width - 0.5;
      const y = (clientY - top) / height - 0.5;

      // Transforma baseado na posição do mouse
      const rotateY = x * 10; // Rotate horizontally
      const rotateX = -y * 10; // Rotate vertically

      if (containerRef.current) {
        containerRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1, 1, 1)`;
      }

      if (profileLevelRef.current) {
        profileLevelRef.current.style.transform = `rotateX(${rotateX * 1.2}deg) rotateY(${rotateY * 1.2}deg) translateZ(5px)`;
      }
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Certifique-se de que o perfil é carregado corretamente
  useEffect(() => {
    console.log("ProfileHeader - userProfile:", userProfile);
  }, [userProfile]);

  useEffect(() => {
    // Attempt to load display name
    const loadDisplayName = async () => {
      try {
        const name = await profileService.getUserDisplayName();
        setDisplayName(name);
      } catch (error) {
        console.error("Error loading display name:", error);
        setDisplayName("Usuário"); // Fallback
      }
    };

    if (!userProfile?.display_name) {
      loadDisplayName();
    } else {
      setDisplayName(userProfile.display_name);
    }
  }, [userProfile]);

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 overflow-hidden shadow-sm transition-all duration-300 profile-3d-container"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="p-6">
        <div className="flex flex-col items-center">
          <Avatar className="h-24 w-24 border-4 border-white dark:border-[#0A2540] shadow-lg mb-4">
            <AvatarImage
              src={userProfile?.avatar_url || ""}
              alt={displayName}
              className="object-cover"
            />
            <AvatarFallback className="text-xl bg-[#FF6B00]/10 text-[#FF6B00]">
              {userInitials}
            </AvatarFallback>
          </Avatar>

          <h2 className="text-2xl font-bold text-center mb-1 text-[#0A2540] dark:text-white">
            {displayName}
          </h2>

          <div className="flex items-center space-x-1 mb-4">
            <span className="text-[#64748B] dark:text-white/60 text-sm">
              @{userProfile?.username || displayName.toLowerCase().replace(/\s/g, '')}
            </span>
          </div>

          <div
            ref={profileLevelRef}
            className="relative flex items-center justify-center w-full py-3 px-4 mb-4 bg-gradient-to-br from-[#FF6B00]/10 to-[#FF8A00]/5 rounded-lg dark:from-[#FF6B00]/20 dark:to-[#FF8A00]/10 transition-all duration-300"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="flex items-center">
              <div className="mr-3">
                <div className="text-xs text-[#64748B] dark:text-white/60 mb-1">
                  Nível
                </div>
                <div className="text-xl font-bold text-[#FF6B00]">
                  {userProfile?.level || 1}
                </div>
              </div>
              <div className="h-10 border-r border-[#E0E1DD] dark:border-white/10"></div>
              <div className="mx-3">
                <div className="text-xs text-[#64748B] dark:text-white/60 mb-1">
                  Rank
                </div>
                <div className="text-xl font-bold text-[#0A2540] dark:text-white flex items-center">
                  <span>{userProfile?.rank || "Aprendiz"}</span>
                  <Star className="h-4 w-4 text-[#FFD700] ml-1 fill-[#FFD700]" />
                </div>
              </div>
              <div className="h-10 border-r border-[#E0E1DD] dark:border-white/10"></div>
              <div className="ml-3">
                <div className="text-xs text-[#64748B] dark:text-white/60 mb-1">
                  School Points
                </div>
                <div className="text-xl font-bold text-[#0A2540] dark:text-white">
                  {userProfile?.balance || 0}
                </div>
              </div>
            </div>

            {/* Decoração de fundo */}
            <div
              className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 30% 30%, #FF6B00 0%, transparent 20%), radial-gradient(circle at 70% 60%, #FF8A00 0%, transparent 20%)",
              }}
            ></div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full border-[#E0E1DD] dark:border-white/10 text-[#64748B] dark:text-white/60 hover:text-[#FF6B00] hover:border-[#FF6B00] transition-all"
            onClick={onEditClick}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar Perfil
          </Button>
        </div>
      </div>
    </div>
  );
}
