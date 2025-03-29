import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TabNavigationProps {
  tabs: {
    id: string;
    label: string;
    icon: React.ReactNode;
  }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="flex items-center justify-start gap-1 px-2 py-1 bg-white/10 backdrop-blur-md rounded-xl shadow-md mb-6 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300",
              isActive
                ? "text-white bg-[#FF6B00] shadow-lg"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100/10 hover:text-[#FF6B00]",
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {tab.icon}
            <span className="font-medium">{tab.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default TabNavigation;
