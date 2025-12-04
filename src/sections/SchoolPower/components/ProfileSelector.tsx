"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Ícones para perfis
const ProfileIcons = {
  student: (
    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
    </svg>
  ),
  teacher: (
    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
    </svg>
  ),
  coordinator: (
    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14 6V4h-4v2h4zM4 8v11h16V8H4zm16-2c1.11 0 2 .89 2 2v11c0 1.11-.89 2-2 2H4c-1.11 0-2-.89-2-2V8c0-1.11.89-2 2-2h16z" />
      <path d="M12 9c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z" />
    </svg>
  ),
  expert: (
    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7.51-3.49L17.5 6.5 9.99 9.99 6.5 17.5zm5.5-6.6c.61 0 1.1.49 1.1 1.1s-.49 1.1-1.1 1.1-1.1-.49-1.1-1.1.49-1.1 1.1-1.1z" />
    </svg>
  ),
  responsible: (
    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  ),
};

// Icon de Aluno
const StudentIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// Dados dos perfis
const profiles = [
  {
    id: "student",
    name: "Aluno",
    icon: ProfileIcons.student,
    color: "bg-orange-500",
  },
  {
    id: "teacher",
    name: "Professor",
    icon: ProfileIcons.teacher,
    color: "bg-orange-500",
  },
  {
    id: "coordinator",
    name: "Coordenador",
    icon: ProfileIcons.coordinator,
    color: "bg-orange-500",
  },
  {
    id: "expert",
    name: "Expert",
    icon: ProfileIcons.expert,
    color: "bg-orange-500",
  },
  {
    id: "responsible",
    name: "Responsável",
    icon: ProfileIcons.responsible,
    color: "bg-orange-500",
  },
];

// Componente ProfileOptionBubble
const ProfileOptionBubble = ({ profile, onClick, index }: any) => {
  const spacing = 120;

  const positions = [
    { x: -spacing * 2, y: 0 },
    { x: -spacing, y: 0 },
    { x: spacing, y: 0 },
    { x: spacing * 2, y: 0 },
  ];

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        x: positions[index]?.x || 0,
        y: positions[index]?.y || 0,
      }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: index * 0.1,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="absolute select-none"
      style={{
        zIndex: 999,
        cursor: "pointer",
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
      }}
      onClick={() => onClick(profile)}
    >
      <div
        className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center ${profile.color} hover:shadow-xl transition-shadow duration-200 border-2 border-orange-300/50`}
        style={{ cursor: "pointer" }}
      >
        <div className="pointer-events-none">{profile.icon}</div>
      </div>
      <div
        className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap pointer-events-none"
        style={{ zIndex: 1000 }}
      >
        <span className="text-xs font-medium text-orange-300 bg-black/80 px-3 py-1 rounded-full shadow-lg border border-orange-400/30">
          {profile.name}
        </span>
      </div>
    </motion.div>
  );
};

interface ProfileSelectorProps {
  onProfileSelect?: (profileId: string) => void;
  selectedProfile?: string;
  isQuizMode?: boolean;
}


// Componente do Ícone Central
export function ProfileSelector({ onProfileSelect, selectedProfile, isQuizMode }: ProfileSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(profiles[0]);
  const [isHovered, setIsHovered] = useState(false);

  const handleAvatarClick = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
  };

  const handleProfileSelect = (profile: any) => {
    setCurrentProfile(profile);
    setIsExpanded(false);
    if (onProfileSelect) {
      onProfileSelect(profile.id);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div className="relative">
      <motion.div
        className="relative select-none"
        style={{
          cursor: "default",
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
          pointerEvents: "none",
        }}
      >
        <div
          className="flex items-center justify-center rounded-full bg-orange-500 shadow-lg border-4 border-orange-300 transition-all duration-200 overflow-hidden"
          style={{
            width: "80px",
            height: "80px",
            zIndex: 1000,
            position: "relative",
            cursor: "default",
            pointerEvents: "none",
          }}
        >
          <img
            src="/images/avatar11-sobreposto-pv.webp"
            alt="Avatar"
            className="w-full h-full object-cover pointer-events-none"
          />
        </div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 999 }}
          >
            {profiles
              .filter((profile) => profile.id !== currentProfile.id)
              .map((profile, index) => (
                <div key={profile.id} className="pointer-events-auto">
                  <ProfileOptionBubble
                    profile={profile}
                    onClick={handleProfileSelect}
                    index={index}
                  />
                </div>
              ))}
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-20"
            style={{ cursor: "default" }}
            onClick={() => {
              setIsExpanded(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileSelector;