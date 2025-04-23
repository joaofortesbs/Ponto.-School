import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Home,
  CheckSquare,
  Target,
  Plus,
  BookOpenCheck,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AgendaNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const isActive = location.pathname === "/agenda";
  const searchParams = new URLSearchParams(location.search);
  const currentView = searchParams.get("view") || "visao-geral";

  // Expand the menu when the Agenda section is active
  useEffect(() => {
    if (isActive) {
      setIsExpanded(true);
    }
  }, [isActive]);

  const handleMainClick = () => {
    if (!isActive) {
      navigate("/agenda?view=visao-geral");
      setIsExpanded(true);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="space-y-1">
      <Button
        variant="ghost"
        className={`flex items-center justify-start rounded-lg px-3 py-2 text-start w-full group hover:scale-[1.02] transition-all duration-200 relative ${isActive ? "bg-[#29335C] text-white dark:bg-[#29335C] dark:text-white" : "text-[#001427] hover:bg-[#001427]/10 dark:text-white dark:hover:bg-[#001427]/20"}`}
        onClick={handleMainClick}
      >
        <Calendar
          className={`h-5 w-5 mr-3 ${isActive ? "text-white" : "text-[#001427] dark:text-white"}`}
        />
        <span>Agenda</span>
        <div
          className={`absolute left-0 top-0 h-full w-1 rounded-r-md transition-all duration-300 ${isActive ? "bg-[#FF6B00]" : "bg-transparent group-hover:bg-[#001427]/30"}`}
        />
      </Button>

      <AnimatePresence>
        {isExpanded && isActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-2 space-y-3 mt-1">
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-start w-full ${currentView === "visao-geral" ? "bg-[#29335C]/10 text-[#29335C] dark:bg-[#29335C]/20 dark:text-white font-medium" : "text-[#001427] hover:bg-[#001427]/5 dark:text-white dark:hover:bg-[#001427]/10"} hover:translate-x-1 transition-transform`}
                onClick={() => navigate("/agenda?view=visao-geral")}
              >
                <Home className="h-4 w-4 text-[#FF6B00]" />
                <span>Visão Geral</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-start w-full ${currentView === "calendario" ? "bg-[#29335C]/10 text-[#29335C] dark:bg-[#29335C]/20 dark:text-white font-medium" : "text-[#001427] hover:bg-[#001427]/5 dark:text-white dark:hover:bg-[#001427]/10"} hover:translate-x-1 transition-transform`}
                onClick={() => navigate("/agenda?view=calendario")}
              >
                <Calendar className="h-4 w-4 text-[#FF6B00]" />
                <span>Calendário</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-start w-full ${currentView === "flow" ? "bg-[#29335C]/10 text-[#29335C] dark:bg-[#29335C]/20 dark:text-white font-medium" : "text-[#001427] hover:bg-[#001427]/5 dark:text-white dark:hover:bg-[#001427]/10"} hover:translate-x-1 transition-transform`}
                onClick={() => navigate("/agenda?view=flow")}
              >
                <BookOpenCheck className="h-4 w-4 text-[#FF6B00]" />
                <span>Flow</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-start w-full ${currentView === "rotina" ? "bg-[#29335C]/10 text-[#29335C] dark:bg-[#29335C]/20 dark:text-white font-medium" : "text-[#001427] hover:bg-[#001427]/5 dark:text-white dark:hover:bg-[#001427]/10"} hover:translate-x-1 transition-transform`}
                onClick={() => navigate("/agenda?view=rotina")}
              >
                <Clock className="h-4 w-4 text-[#FF6B00]" />
                <span>Rotina</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-start w-full ${currentView === "tarefas" ? "bg-[#29335C]/10 text-[#29335C] dark:bg-[#29335C]/20 dark:text-white font-medium" : "text-[#001427] hover:bg-[#001427]/5 dark:text-white dark:hover:bg-[#001427]/10"} hover:translate-x-1 transition-transform`}
                onClick={() => navigate("/agenda?view=tarefas")}
              >
                <CheckSquare className="h-4 w-4 text-[#FF6B00]" />
                <span>Tarefas</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-start w-full ${currentView === "rotina" ? "bg-[#29335C]/10 text-[#29335C] dark:bg-[#29335C]/20 dark:text-white font-medium" : "text-[#001427] hover:bg-[#001427]/5 dark:text-white dark:hover:bg-[#001427]/10"} hover:translate-x-1 transition-transform`}
                onClick={() => navigate("/agenda?view=rotina")}
              >
                <Clock className="h-4 w-4 text-[#FF6B00]" />
                <span>Rotina</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-start w-full ${currentView === "desafios" ? "bg-[#29335C]/10 text-[#29335C] dark:bg-[#29335C]/20 dark:text-white font-medium" : "text-[#001427] hover:bg-[#001427]/5 dark:text-white dark:hover:bg-[#001427]/10"} hover:translate-x-1 transition-transform`}
                onClick={() => navigate("/agenda?view=desafios")}
              >
                <Target className="h-4 w-4 text-[#FF6B00]" />
                <span>Desafios</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}