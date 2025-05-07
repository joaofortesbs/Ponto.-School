import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, GraduationCap, UserCheck, Users, Brain } from "lucide-react";

interface PersonalidadesDropdownProps {
  isOpen: boolean;
  onSelectPersonality: (personality: string) => void;
}

const PersonalidadesDropdown: React.FC<PersonalidadesDropdownProps> = ({ 
  isOpen, 
  onSelectPersonality 
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onSelectPersonality(""); //Added to handle closing and reset selection.
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onSelectPersonality]);

  const personalities = [
    { id: 'estudante', name: 'Estudante', icon: <GraduationCap className="h-4 w-4 mr-2" /> },
    { id: 'professor', name: 'Professor', icon: <UserCheck className="h-4 w-4 mr-2" /> },
    { id: 'coordenador', name: 'Coordenador', icon: <Users className="h-4 w-4 mr-2" /> },
    { id: 'expert', name: 'Expert', icon: <Brain className="h-4 w-4 mr-2" /> }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          className="fixed right-0 mt-2 w-48 bg-blue-900/95 backdrop-blur-md shadow-lg rounded-md py-1" 
          style={{ 
            zIndex: 100000, // Increased z-index
            position: 'absolute',
            boxShadow: '0 0 15px rgba(0, 0, 0, 0.3)'
          }}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.15 }}
        >
          {personalities.map((personality) => (
            <button
              key={personality.id}
              className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-blue-800 transition-colors"
              onClick={() => onSelectPersonality(personality.id)}
            >
              {personality.icon}
              {personality.name}
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PersonalidadesDropdown;