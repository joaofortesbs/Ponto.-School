import React from "react";
import { useTheme } from "@/components/ThemeProvider";
import EpictusIAInterface from "./EpictusIAInterface";

export default function EpictusIAWrapper() {
  const { theme } = useTheme();

  return (
    <div
      className={`w-full h-full ${theme === "dark" ? "bg-[#001427] text-white" : "bg-white text-[#29335C]"}`}
    >
      <EpictusIAInterface />
    </div>
  );
}
