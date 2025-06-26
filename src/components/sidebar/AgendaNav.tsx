import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export default function AgendaNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === "/agenda";

  const handleMainClick = () => {
    navigate("/agenda?view=visao-geral");
  };

  return (
    <div className="space-y-1">
      <Button
        variant="ghost"
        className={`flex items-center justify-start rounded-lg px-3 py-2 text-start w-full group hover:scale-[1.02] transition-all duration-200 relative ${isActive ? "bg-[#29335C] text-white dark:bg-[#29335C] dark:text-white" : "text-[#001427] hover:bg-[#FF6B00]/10 dark:text-white dark:hover:bg-[#FF6B00]/20"}`}
        onClick={handleMainClick}
      >
        <Calendar
          className={`h-5 w-5 mr-3 ${isActive ? "text-white" : "text-[#001427] dark:text-white"}`}
        />
        <span>Agenda</span>
        <div
          className={`absolute left-0 top-0 h-full w-1 rounded-r-md transition-all duration-300 ${isActive ? "bg-[#FF6B00]" : "bg-transparent group-hover:bg-[#FF6B00]/50"}`}
        />
      </Button>
    </div>
  );
}