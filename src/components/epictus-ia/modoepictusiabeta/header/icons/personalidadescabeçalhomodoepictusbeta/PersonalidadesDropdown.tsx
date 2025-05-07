
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "lucide-react";

interface PersonalidadesDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const PersonalidadesDropdown: React.FC<PersonalidadesDropdownProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const options = [
    { id: "estudante", label: "Estudante" },
    { id: "professor", label: "Professor" },
    { id: "coordenador", label: "Coordenador" },
    { id: "expert", label: "Expert" }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          className="absolute top-full left-0 mt-1 w-48 rounded-md bg-[#0B1F5E] border border-[#1C3087] shadow-lg z-[9999]"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.15 }}
        >
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.id}
                className="flex items-center w-full px-4 py-2.5 text-left text-sm text-white hover:bg-[#1C3087] transition-colors"
                onClick={() => {
                  console.log(`Selected personality: ${option.label}`);
                  onClose();
                }}
              >
                <div className="w-6 h-6 rounded-full bg-[#1C3087] flex items-center justify-center mr-2">
                  <User className="h-3.5 w-3.5 text-[#4D68D9]" />
                </div>
                {option.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PersonalidadesDropdown;
