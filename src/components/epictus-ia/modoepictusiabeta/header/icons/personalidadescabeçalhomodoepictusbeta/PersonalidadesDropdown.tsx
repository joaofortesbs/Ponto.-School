
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
          className="absolute top-full left-0 mt-1 w-48 rounded-md bg-[#0B1F5E] border border-[#1C3087] shadow-lg z-[9999] personalidades-dropdown"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.15 }}
        >
          <div className="py-1">
            {options.map((option) => {
              // Seleciona o ícone apropriado com base no ID da opção
              let Icon = User;
              if (option.id === "estudante") {
                Icon = User;
              } else if (option.id === "professor") {
                Icon = () => (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#4D68D9]">
                    <path d="M19 4H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" />
                    <path d="M12 9v8" />
                    <path d="M9 9h6" />
                  </svg>
                );
              } else if (option.id === "coordenador") {
                Icon = () => (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#4D68D9]">
                    <path d="M5 22h14" />
                    <path d="M5 2h14" />
                    <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
                    <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
                  </svg>
                );
              } else if (option.id === "expert") {
                Icon = () => (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#4D68D9]">
                    <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
                    <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                    <path d="M12 2v2" />
                    <path d="M12 22v-2" />
                    <path d="m17 20.66-1-1.73" />
                    <path d="M11 10.27 7 7" />
                    <path d="m20.66 17-1.73-1" />
                    <path d="m3.34 7 1.73 1" />
                  </svg>
                );
              }

              return (
                <button
                  key={option.id}
                  className="flex items-center w-full px-4 py-2.5 text-left text-sm text-white hover:bg-[#1C3087] transition-colors"
                  onClick={() => {
                    console.log(`Selected personality: ${option.label}`);
                    onClose();
                  }}
                >
                  <div className="w-6 h-6 rounded-full bg-[#1C3087] flex items-center justify-center mr-2">
                    <Icon />
                  </div>
                  {option.label}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PersonalidadesDropdown;
