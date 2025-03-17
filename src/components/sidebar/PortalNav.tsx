import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  BookOpen,
  FolderKanban,
  Heart,
  Rocket,
  ChevronRight,
} from "lucide-react";

export default function PortalNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const searchParams = new URLSearchParams(location.search);
  const view = searchParams.get("view");

  const isActive = (viewName: string) => {
    return view === viewName;
  };

  return (
    <div className="space-y-1 py-2">
      <Button
        variant="ghost"
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-start w-full justify-between",
          pathname === "/portal" && !view
            ? "bg-[#FF6B00]/10 text-[#FF6B00] dark:bg-[#FF6B00]/20 dark:text-white"
            : "text-[#001427] hover:bg-[#001427]/10 dark:text-white dark:hover:bg-[#001427]/20",
          "group hover:scale-[1.02] transition-all duration-200 hover:shadow-sm active:scale-[0.98]",
        )}
        onClick={() => navigate("/portal")}
      >
        <div className="flex items-center gap-3">
          <Home className="h-4 w-4 text-[#29335C]" />
          <span>Visão Geral</span>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
      </Button>

      <Button
        variant="ghost"
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-start w-full justify-between",
          isActive("minhas-turmas")
            ? "bg-[#FF6B00]/10 text-[#FF6B00] dark:bg-[#FF6B00]/20 dark:text-white"
            : "text-[#001427] hover:bg-[#001427]/10 dark:text-white dark:hover:bg-[#001427]/20",
          "group hover:scale-[1.02] transition-all duration-200 hover:shadow-sm active:scale-[0.98]",
        )}
        onClick={() => navigate("/portal?view=minhas-turmas")}
      >
        <div className="flex items-center gap-3">
          <BookOpen className="h-4 w-4 text-[#29335C]" />
          <span>Minhas Turmas</span>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
      </Button>

      <Button
        variant="ghost"
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-start w-full justify-between",
          isActive("disciplinas")
            ? "bg-[#FF6B00]/10 text-[#FF6B00] dark:bg-[#FF6B00]/20 dark:text-white"
            : "text-[#001427] hover:bg-[#001427]/10 dark:text-white dark:hover:bg-[#001427]/20",
          "group hover:scale-[1.02] transition-all duration-200 hover:shadow-sm active:scale-[0.98]",
        )}
        onClick={() => navigate("/portal?view=disciplinas")}
      >
        <div className="flex items-center gap-3">
          <FolderKanban className="h-4 w-4 text-[#29335C]" />
          <span>Disciplinas</span>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
      </Button>

      <Button
        variant="ghost"
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-start w-full justify-between",
          isActive("favoritos")
            ? "bg-[#FF6B00]/10 text-[#FF6B00] dark:bg-[#FF6B00]/20 dark:text-white"
            : "text-[#001427] hover:bg-[#001427]/10 dark:text-white dark:hover:bg-[#001427]/20",
          "group hover:scale-[1.02] transition-all duration-200 hover:shadow-sm active:scale-[0.98]",
        )}
        onClick={() => navigate("/portal?view=favoritos")}
      >
        <div className="flex items-center gap-3">
          <Heart className="h-4 w-4 text-[#29335C]" />
          <span>Favoritos</span>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
      </Button>

      <Button
        variant="ghost"
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-start w-full justify-between",
          isActive("trilhas")
            ? "bg-[#FF6B00]/10 text-[#FF6B00] dark:bg-[#FF6B00]/20 dark:text-white"
            : "text-[#001427] hover:bg-[#001427]/10 dark:text-white dark:hover:bg-[#001427]/20",
          "group hover:scale-[1.02] transition-all duration-200 hover:shadow-sm active:scale-[0.98]",
        )}
        onClick={() => navigate("/portal?view=trilhas")}
      >
        <div className="flex items-center gap-3">
          <Rocket className="h-4 w-4 text-[#29335C]" />
          <span>Trilhas</span>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </div>
  );
}
