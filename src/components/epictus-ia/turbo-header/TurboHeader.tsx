import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Clock, 
  Star, 
  Calendar, 
  Bell, 
  User,
  ChevronDown,
  Search,
  Settings,
  Zap
} from "lucide-react";
import LogoSection from "./LogoSection";
import { PersonalitiesDropdown } from "./PersonalitiesDropdown";
import GlowingBackground from "./GlowingBackground";
import { HeaderIcons } from "../modoepictusiabeta/header/icons/HeaderIcons";

interface ProfileOption {
  id: string;
  icon: React.ReactNode;
  color: string;
  name: string;
  onClick: () => void;
}

interface TurboHeaderProps {
  profileOptions: ProfileOption[];
  initialProfileIcon: React.ReactNode;
  initialProfileName: string;
  isBetaMode?: boolean;
}

const TurboHeader: React.FC<TurboHeaderProps> = ({ 
  profileOptions, 
  initialProfileIcon, 
  initialProfileName,
  isBetaMode = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [userInitials, setUserInitials] = useState("JF");

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Get user initials from local storage or session
    const username = localStorage.getItem('username') || sessionStorage.getItem('username') || 'JF';
    if (username) {
      // Extract initials (first letter of first and last names)
      const nameParts = username.split(' ');
      if (nameParts.length > 1) {
        setUserInitials((nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase());
      } else {
        setUserInitials(username.substring(0, 2).toUpperCase());
      }
    }
  }, []);

  return (
    <div className="w-full p-4">
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full rounded-xl relative bg-gradient-to-r from-[#0c2342] to-[#0f3665] p-4 flex items-center justify-between"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <GlowingBackground isHovered={isHovered} />

        <div className="flex items-center z-10">
          <LogoSection />
          <PersonalitiesDropdown 
            profileOptions={profileOptions} 
            initialProfileIcon={initialProfileIcon}
            initialProfileName={initialProfileName}
          />
        </div>

        <div className="flex items-center space-x-2 z-10">
          {isBetaMode ? (
            <HeaderIcons userInitials={userInitials} />
          ) : (
            <>
              <Clock size={20} className="text-white/70" />
              <Star size={20} className="text-white/70" />
              <Calendar size={20} className="text-white/70" />
              <Bell size={20} className="text-white/70" />
              <div className="w-8 h-8 rounded-full bg-[#1d3c5c] flex items-center justify-center text-white">
                {userInitials}
              </div>
            </>
          )}
        </div>
      </motion.header>
    </div>
  );
};

export default TurboHeader;