import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen,
  Home,
  Users2,
  GraduationCap,
  FolderKanban,
  BarChart,
  UserPlus,
  Plus,
  Search,
  Calendar,
  MessageCircle,
  Sparkles,
  Brain,
  Lightbulb,
  Target,
  LineChart,
} from "lucide-react";
import NotificationIndicator from "../turmas/NotificationIndicator";
import { motion, AnimatePresence } from "framer-motion";

export default function TurmasNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const isActive =
    location.pathname === "/turmas" || location.pathname.startsWith("/turmas/");
  const searchParams = new URLSearchParams(location.search);
  const currentView = searchParams.get("view") || "todas";

  // Simulated notification counts
  const notifications = {
    todas: 5,
    oficiais: 3,
    proprias: 0,
    //grupos: 2,  //This line is left as is to avoid unnecessary changes outside the scope
    desempenho: 1,
    grupos2: 3,
    estudos: 4,
  };

  // Simulated study groups data (This data is not used after removing the button, but keeping it as it is to avoid unintended side effects)
  const studyGroups = [
    {
      id: "g1",
      name: "Grupo de Mecânica Quântica",
      members: ["Ana", "Pedro", "Você"],
      nextMeeting: "16/03, 18:00",
      course: "Física Quântica",
      hasNewMessages: true,
    },
    {
      id: "g2",
      name: "Preparação para o Projeto Final",
      members: ["Mariana", "João", "Carla", "Você"],
      nextMeeting: "23/03, 19:00",
      course: "Física Quântica",
      hasNewMessages: true,
    },
    {
      id: "g3",
      name: "Grupo de Cálculo Avançado",
      members: ["Roberto", "Luiza", "Você"],
      nextMeeting: "18/03, 17:30",
      course: "Cálculo Avançado",
      hasNewMessages: false,
    },
  ];

  // Simulated recommended groups (This data is not used after removing the button, but keeping it as it is to avoid unintended side effects)
  const recommendedGroups = [
    {
      id: "rg1",
      name: "Grupo de Química Orgânica",
      members: 8,
      course: "Química Orgânica",
      matchScore: 95,
    },
    {
      id: "rg2",
      name: "Biologia Molecular Avançada",
      members: 5,
      course: "Biologia Molecular",
      matchScore: 87,
    },
  ];

  // Expand the menu when the Turmas section is active
  useEffect(() => {
    if (isActive) {
      setIsExpanded(true);
    }
  }, [isActive]);

  const handleMainClick = () => {
    if (!isActive) {
      navigate("/turmas");
      setIsExpanded(true);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="space-y-1">
      <Button
        variant="ghost"
        className={`flex items-center justify-start rounded-lg px-3 py-2 text-start w-full group hover:scale-[1.02] transition-all duration-200 relative ${isActive ? "bg-[#FF6B00]/10 text-[#FF6B00] dark:bg-[#FF6B00]/20 dark:text-white" : "text-[#001427] hover:bg-[#001427]/10 dark:text-white dark:hover:bg-[#001427]/20"}`}
        onClick={handleMainClick}
      >
        <BookOpen
          className={`h-5 w-5 mr-3 ${isActive ? "text-[#FF6B00]" : "text-[#001427] dark:text-white"}`}
        />
        <span>Minhas Turmas</span>
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
            <div className="ml-2 space-y-1 mt-1">
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-start w-full ${currentView === "todas" ? "bg-[#FF6B00]/10 text-[#FF6B00] dark:bg-[#FF6B00]/20 dark:text-white font-medium" : "text-[#001427] hover:bg-[#001427]/5 dark:text-white dark:hover:bg-[#001427]/10"} hover:translate-x-1 transition-transform text-xs`}
                onClick={() => navigate("/turmas?view=todas")}
              >
                <div className="flex items-center gap-2">
                  <Home className="h-3.5 w-3.5 text-[#FF6B00]" />
                  <span>Todas</span>
                </div>
                {notifications.todas > 0 && (
                  <NotificationIndicator
                    count={notifications.todas}
                    type="general"
                  />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-start w-full ${currentView === "oficiais" ? "bg-[#FF6B00]/10 text-[#FF6B00] dark:bg-[#FF6B00]/20 dark:text-white font-medium" : "text-[#001427] hover:bg-[#001427]/5 dark:text-white dark:hover:bg-[#001427]/10"} hover:translate-x-1 transition-transform text-xs`}
                onClick={() => navigate("/turmas?view=oficiais")}
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-3.5 w-3.5 text-[#FF6B00]" />
                  <span>Turmas Oficiais</span>
                </div>
                {notifications.oficiais > 0 && (
                  <NotificationIndicator
                    count={notifications.oficiais}
                    type="general"
                  />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-start w-full ${currentView === "proprias" ? "bg-[#FF6B00]/10 text-[#FF6B00] dark:bg-[#FF6B00]/20 dark:text-white font-medium" : "text-[#001427] hover:bg-[#001427]/5 dark:text-white dark:hover:bg-[#001427]/10"} hover:translate-x-1 transition-transform text-xs`}
                onClick={() => navigate("/turmas?view=proprias")}
              >
                <div className="flex items-center gap-2">
                  <FolderKanban className="h-3.5 w-3.5 text-[#FF6B00]" />
                  <span>Minhas Turmas</span>
                </div>
                {notifications.proprias > 0 && (
                  <NotificationIndicator
                    count={notifications.proprias}
                    type="general"
                  />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-start w-full ${currentView === "desempenho" ? "bg-[#FF6B00]/10 text-[#FF6B00] dark:bg-[#FF6B00]/20 dark:text-white font-medium" : "text-[#001427] hover:bg-[#001427]/5 dark:text-white dark:hover:bg-[#001427]/10"} hover:translate-x-1 transition-transform text-xs`}
                onClick={() => navigate("/turmas?view=desempenho")}
              >
                <div className="flex items-center gap-2">
                  <BarChart className="h-3.5 w-3.5 text-[#FF6B00]" />
                  <span>Desempenho</span>
                </div>
                {notifications.desempenho > 0 && (
                  <NotificationIndicator
                    count={notifications.desempenho}
                    type="general"
                  />
                )}
              </Button>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}