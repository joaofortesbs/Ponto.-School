import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Sun
            className={`h-4 w-4 rotate-0 scale-100 transition-all ${theme === "dark" ? "-rotate-90 scale-0" : ""} ${theme === "dark" ? "text-white" : "text-[#29335C]"}`}
          />
          <Moon
            className={`absolute h-4 w-4 rotate-90 scale-0 transition-all ${theme === "dark" ? "rotate-0 scale-100" : ""} ${theme === "dark" ? "text-white" : "text-[#29335C]"}`}
          />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={
          theme === "dark"
            ? "bg-[#1E293B] border-gray-800"
            : "bg-white border-gray-200"
        }
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={
            theme === "dark"
              ? "text-white hover:bg-[#29335C]/20"
              : "text-[#29335C] hover:bg-gray-100"
          }
        >
          <Sun className="h-4 w-4 mr-2 text-[#FF6B00]" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={
            theme === "dark"
              ? "text-white hover:bg-[#29335C]/20"
              : "text-[#29335C] hover:bg-gray-100"
          }
        >
          <Moon className="h-4 w-4 mr-2 text-[#FF6B00]" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={
            theme === "dark"
              ? "text-white hover:bg-[#29335C]/20"
              : "text-[#29335C] hover:bg-gray-100"
          }
        >
          <span className="h-4 w-4 mr-2 flex items-center justify-center text-[#FF6B00]">
            💻
          </span>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
