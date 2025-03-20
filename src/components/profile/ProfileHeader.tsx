import React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Edit, Share2, Diamond, Camera } from "lucide-react";
import type { UserProfile } from "@/types/user-profile";

interface ProfileHeaderProps {
  userProfile: UserProfile | null;
  onEditClick: () => void;
}

export default function ProfileHeader({
  userProfile,
  onEditClick,
}: ProfileHeaderProps) {
  return (
    <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 overflow-hidden shadow-sm">
      <div className="relative">
        <div className="h-32 bg-gradient-to-r from-[#29335C] to-[#001427]"></div>
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-white dark:border-[#0A2540] overflow-hidden bg-white dark:bg-[#0A2540]">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#FF6B00] text-white flex items-center justify-center hover:bg-[#FF6B00]/90 transition-colors">
              <Camera className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="pt-16 pb-6 px-6 text-center">
        <h2 className="text-xl font-bold text-[#29335C] dark:text-white">
          {userProfile?.display_name || userProfile?.username || "Usuário"}
        </h2>
        <div className="flex items-center justify-center gap-1 mt-1">
          <p className="text-xs text-[#64748B] dark:text-white/60">
            ID: {userProfile?.user_id || "--"}
          </p>
        </div>
        <div className="flex items-center justify-center gap-1 mt-1">
          <Diamond className="h-4 w-4 text-[#FF6B00]" />
          <span className="text-sm text-[#FF6B00] font-medium">
            {userProfile?.plan_type === "premium"
              ? "Plano Premium"
              : "Plano Lite"}
          </span>
        </div>
        <p className="text-[#64748B] dark:text-white/60 text-sm mt-2">
          Estudante de Engenharia de Software
        </p>

        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="text-center">
            <p className="text-lg font-bold text-[#29335C] dark:text-white">
              {userProfile?.level || 1}
            </p>
            <p className="text-xs text-[#64748B] dark:text-white/60">Nível</p>
          </div>
          <div className="h-10 border-r border-[#E0E1DD] dark:border-white/10"></div>
          <div className="text-center">
            <p className="text-lg font-bold text-[#29335C] dark:text-white">
              8
            </p>
            <p className="text-xs text-[#64748B] dark:text-white/60">Turmas</p>
          </div>
          <div className="h-10 border-r border-[#E0E1DD] dark:border-white/10"></div>
          <div className="text-center">
            <p className="text-lg font-bold text-[#29335C] dark:text-white">
              12
            </p>
            <p className="text-xs text-[#64748B] dark:text-white/60">
              Conquistas
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-[#64748B] dark:text-white/60">
              Progresso para o próximo nível
            </span>
            <span className="text-xs font-medium text-[#FF6B00]">72%</span>
          </div>
          <Progress value={72} className="h-2" />
        </div>

        <div className="mt-6 flex gap-2">
          <Button
            className="flex-1 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
            onClick={onEditClick}
          >
            <Edit className="h-4 w-4 mr-2" /> Editar Perfil
          </Button>
          <Button
            variant="outline"
            className="w-10 h-10 p-0 border-[#E0E1DD] dark:border-white/10"
          >
            <Share2 className="h-4 w-4 text-[#64748B] dark:text-white/60" />
          </Button>
        </div>
      </div>
    </div>
  );
}
