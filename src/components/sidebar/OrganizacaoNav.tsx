import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FolderKanban, List, Calendar, Kanban } from "lucide-react";

export default function OrganizacaoNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === "/organizacao";
  const searchParams = new URLSearchParams(location.search);
  const currentView = searchParams.get("view") || "lista";

  return (
    <div className="space-y-1">
      <Button
        variant="ghost"
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-start w-full group hover:scale-[1.02] transition-all duration-200 relative ${isActive ? "bg-[#FF6B00]/10 text-[#FF6B00] dark:bg-[#FF6B00]/20 dark:text-white" : "text-[#001427] hover:bg-[#001427]/10 dark:text-white dark:hover:bg-[#001427]/20"}`}
        onClick={() => navigate("/organizacao")}
      >
        <div className="flex items-center gap-3">
          <FolderKanban
            className={`h-5 w-5 ${isActive ? "text-[#FF6B00] dark:text-white" : "text-[#001427] dark:text-white"}`}
          />
          <span>Organização</span>
        </div>
        <div
          className={`absolute left-0 top-0 h-full w-1 rounded-r-md transition-all duration-300 ${isActive ? "bg-[#FF6B00]" : "bg-transparent group-hover:bg-[#001427]/30"}`}
        />
      </Button>

      {isActive && (
        <div className="ml-8 space-y-1 border-l-2 border-[#001427]/20 dark:border-[#001427]/30 pl-2">
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-start w-full ${currentView === "lista" ? "bg-[#FF6B00]/10 text-[#FF6B00] dark:bg-[#FF6B00]/20" : "text-[#001427] hover:bg-[#001427]/5 dark:text-white dark:hover:bg-[#001427]/10"} hover:translate-x-1 transition-transform`}
            onClick={() => navigate("/organizacao?view=lista")}
          >
            <List className="h-4 w-4 text-[#FF6B00]" />
            <span>Lista</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-start w-full ${currentView === "calendario" ? "bg-[#FF6B00]/10 text-[#FF6B00] dark:bg-[#FF6B00]/20" : "text-[#001427] hover:bg-[#001427]/5 dark:text-white dark:hover:bg-[#001427]/10"} hover:translate-x-1 transition-transform`}
            onClick={() => navigate("/organizacao?view=calendario")}
          >
            <Calendar className="h-4 w-4 text-[#FF6B00]" />
            <span>Calendário</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-start w-full ${currentView === "kanban" ? "bg-[#FF6B00]/10 text-[#FF6B00] dark:bg-[#FF6B00]/20" : "text-[#001427] hover:bg-[#001427]/5 dark:text-white dark:hover:bg-[#001427]/10"} hover:translate-x-1 transition-transform`}
            onClick={() => navigate("/organizacao?view=kanban")}
          >
            <Kanban className="h-4 w-4 text-[#FF6B00]" />
            <span>Kanban</span>
          </Button>
        </div>
      )}
    </div>
  );
}
