
import React from "react";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SectionContentProps {
  children: React.ReactNode;
}

export default function SectionContent({ children }: SectionContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="h-full w-full"
    >
      <ScrollArea className="h-full w-full pr-2" style={{ overflow: "auto" }}>
        <div className="pb-6 pr-4">
          {children}
        </div>
      </ScrollArea>
    </motion.div>
  );
}
