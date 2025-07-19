import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
      <div 
        className={cn(
          "menu-item",
          isActive ? "active" : ""
        )}
        onClick={handleMainClick}
      >
        <div className="item-content">
          <div className={cn(
            "icon-container",
            isActive ? "active" : ""
          )}>
            <i className="fas fa-calendar-alt"></i>
            <div className="icon-glow"></div>
          </div>
          <div className="item-text">
            <span className="item-title">Agenda</span>
          </div>
          <div className="item-indicator"></div>
        </div>
      </div>
    </div>
  );
}