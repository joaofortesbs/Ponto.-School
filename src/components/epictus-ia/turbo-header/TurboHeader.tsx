import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  User,
  Trash2,
  Loader2,
  Star,
  Search,
  FileText,
  PenLine,
  Share,
  Copy,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import PersonalitiesDropdown from "./PersonalitiesDropdown";
import HistoricoModal from "../modals/HistoricoModal";

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
}

const TurboHeader: React.FC<TurboHeaderProps> = ({
  profileOptions,
  initialProfileIcon,
  initialProfileName,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHistoricoModalOpen, setIsHistoricoModalOpen] = useState(false);

  return (
    <header className="w-full bg-gradient-to-r from-[#1E293B] to-[#2F3B4C] border-b border-[#3A4B5C]/30 p-3 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] flex items-center justify-center shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path>
            <path d="M8.5 8.5v.01"></path>
            <path d="M16 15.5v.01"></path>
            <path d="M12 12v.01"></path>
            <path d="M11 17v.01"></path>
            <path d="M7 14v.01"></path>
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Epictus IA</h1>
          <div className="flex items-center gap-2">
            <span className="text-[#A0A0A0] text-sm">BETA</span>
            <div className="h-2 w-2 rounded-full bg-[#4CAF50] animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#1E293B] to-[#2F3B4C] border border-[#3A4B5C]/30 rounded-lg p-2 text-white hover:bg-[#2F3B4C] transition-all duration-300"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] flex items-center justify-center shadow-md">
              {initialProfileIcon}
            </div>
            <span className="text-sm font-medium">{initialProfileName}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <PersonalitiesDropdown
                options={profileOptions}
                onClose={() => setIsDropdownOpen(false)}
              />
            )}
          </AnimatePresence>
        </div>

        <button
          className="p-2 rounded-full text-[#A0A0A0] hover:text-white hover:bg-[#2F3B4C] transition-colors"
          onClick={() => setIsHistoricoModalOpen(true)}
          title="Histórico de conversas"
        >
          <Clock />
        </button>

        <button className="p-2 rounded-full text-[#A0A0A0] hover:text-white hover:bg-[#2F3B4C] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3" />
            <circle cx="12" cy="10" r="3" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        </button>
      </div>

      <HistoricoModal
        isOpen={isHistoricoModalOpen}
        onClose={() => setIsHistoricoModalOpen(false)}
      />
    </header>
  );
};