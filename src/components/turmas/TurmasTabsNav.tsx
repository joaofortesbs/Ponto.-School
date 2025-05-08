
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Home, BookOpen, Users2, BarChart } from "lucide-react";

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
      value: "ativas",
      icon: <BookOpen className="h-4 w-4" />,
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
      <div className="bg-gray-800/30 backdrop-blur-sm p-1 rounded-lg flex space-x-1">
        {tabs.map((tab) => {
          const isActive = tab.value === currentView;
          return (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={cn(
                "relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2",
                isActive
                  ? "text-white"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTurmaTab"
                  className="absolute inset-0 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-md"
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
