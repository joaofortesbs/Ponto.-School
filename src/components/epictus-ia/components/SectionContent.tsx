
import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SectionContentProps {
  children: React.ReactNode;
}

export default function SectionContent({ children }: SectionContentProps) {
  const { theme } = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={`h-full rounded-xl border ${
        theme === "dark" ? "bg-gray-800/90 border-gray-700" : "bg-white/90 border-gray-200"
      }`}
      style={{ backdropFilter: "blur(8px)" }}
    >
      <ScrollArea className="h-full p-6">
        {children}
      </ScrollArea>
    </motion.div>
  );
}
