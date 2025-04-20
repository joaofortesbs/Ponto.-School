
import React from "react";
import { motion } from "framer-motion";

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
      className="h-full"
    >
      {children}
    </motion.div>
  );
}
