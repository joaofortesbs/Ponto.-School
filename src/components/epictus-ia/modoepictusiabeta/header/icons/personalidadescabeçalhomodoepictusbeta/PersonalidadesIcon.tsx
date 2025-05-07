import React, { useState, useRef, useEffect } from 'react';
import { User } from 'lucide-react';
import PersonalidadesDropdown from './PersonalidadesDropdown';

const PersonalidadesIcon: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPersonality, setSelectedPersonality] = useState('estudante');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelectPersonality = (personality: string) => {
    setSelectedPersonality(personality);
    setIsDropdownOpen(false);
  };

  // Fechar o dropdown quando clicar fora dele
  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        buttonRef.current && 
        !dropdownRef.current.contains(event.target as Node) && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div className="relative dropdown-isolate personalidades-root" style={{ zIndex: 100000 }}>
      <button
        ref={buttonRef}
        className="personalidades-button flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-md transition-colors"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        aria-expanded={isDropdownOpen}
        aria-haspopup="menu"
      >
        <User className="h-5 w-5" />
        <span>Personalidades</span>
        <svg
          className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div ref={dropdownRef}>
        <PersonalidadesDropdown
          isOpen={isDropdownOpen}
          onSelectPersonality={handleSelectPersonality}
        />
      </div>
    </div>
  );
};

export default PersonalidadesIcon;
export { PersonalidadesIcon };