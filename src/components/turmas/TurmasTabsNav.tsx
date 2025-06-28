import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Home, BookOpen, Users2, BarChart, FolderKanban } from "lucide-react";

const TurmasTabsNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentView = searchParams.get("view") || "";

  const tabs = [
    {
      name: "Todas",
      value: "",
      icon: <Home className="h-4 w-4" />,
    },
    {
      name: "Turmas Oficiais",
      value: "oficiais",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      name: "Minhas Turmas",
      value: "proprias",
      icon: <FolderKanban className="h-4 w-4" />,
    },
    {
      name: "Grupos de Estudo",
      value: "grupos-estudo",
      icon: <Users2 className="h-4 w-4" />,
    },
    {
      name: "Desempenho",
      value: "desempenho",
      icon: <BarChart className="h-4 w-4" />,
    },
  ];

  const handleTabChange = (value: string) => {
    if (value) {
      navigate(`/turmas?view=${value}`);
    } else {
      navigate("/turmas");
    }
  };

  return (
    <div className="flex justify-center mt-4 mb-6">
      <div className="bg-[#001427] dark:bg-[#001427] bg-white p-1 rounded-xl flex space-x-1 shadow-md border border-[#FF6B00]/20 dark:border-[#FF6B00]/20 border-gray-200">
        {tabs.map((tab) => {
          const isActive = tab.value === currentView;
          return (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={cn(
                "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
                isActive
                  ? "text-white dark:text-white text-white"
                  : "text-gray-300 dark:text-gray-300 text-gray-600 hover:text-white dark:hover:text-white hover:text-[#FF6B00] hover:bg-white/10 dark:hover:bg-white/10 hover:bg-[#FF6B00]/10"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTurmaTab"
                  className="absolute inset-0 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-lg"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {tab.icon}
                {tab.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TurmasTabsNav;
```