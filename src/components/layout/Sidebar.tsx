
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useLocation } from "react-router-dom";
import SidebarMenu from "./SidebarMenu";
import AvatarUpload from "@/components/profile/AvatarUpload";
import { useUserProfile } from "@/hooks/useUserProfile";

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const { theme } = useTheme();
  const isLightMode = theme === "light";
  const location = useLocation();
  const { profile, loading, updateAvatarUrl } = useUserProfile();

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const getUserDisplayName = () => {
    if (loading) return "Carregando...";
    if (!profile) return "Usuário";
    return profile.display_name || profile.email?.split('@')[0] || "Usuário";
  };

  return (
    <div
      className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      } ${
        isLightMode
          ? "bg-white border-r border-gray-200"
          : "bg-[#0A2540] border-r border-white/10"
      }`}
    >
      {/* Header with Avatar and Greeting */}
      <div className={`p-4 border-b ${isLightMode ? "border-gray-200" : "border-white/10"}`}>
        <div className="flex items-center gap-3">
          <AvatarUpload
            currentAvatarUrl={profile?.avatar_url}
            onAvatarUpdate={updateAvatarUrl}
            size={isCollapsed ? "sm" : "md"}
          />
          
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${
                isLightMode ? "text-gray-900" : "text-white"
              }`}>
                {getGreeting()}!
              </p>
              <p className={`text-xs truncate ${
                isLightMode ? "text-gray-600" : "text-gray-400"
              }`}>
                {getUserDisplayName()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto">
        <SidebarMenu isCollapsed={isCollapsed} currentPath={location.pathname} />
      </div>

      {/* Toggle Button */}
      <div className={`p-4 border-t ${isLightMode ? "border-gray-200" : "border-white/10"}`}>
        <button
          onClick={onToggleCollapse}
          className={`w-full flex items-center justify-center p-2 rounded-lg transition-colors ${
            isLightMode
              ? "hover:bg-gray-100 text-gray-600"
              : "hover:bg-white/10 text-gray-400"
          }`}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
