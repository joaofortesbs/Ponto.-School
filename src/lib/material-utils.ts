
import { 
  Video, 
  FileText, 
  Headphones, 
  Link, 
  PenTool, 
  Network, 
  BookText 
} from "lucide-react";
import { MaterialType } from "@/types/global";
import React from "react";

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
};

export const getIconForMaterialType = (type: MaterialType, className = "h-5 w-5") => {
  switch (type) {
    case "video":
      return React.createElement(Video, { className });
    case "pdf":
      return React.createElement(FileText, { className });
    case "audio":
      return React.createElement(Headphones, { className });
    case "link":
      return React.createElement(Link, { className });
    case "exercise":
      return React.createElement(PenTool, { className });
    case "mindmap":
      return React.createElement(Network, { className });
    default:
      return React.createElement(BookText, { className });
  }
};

export const getColorForMaterialType = (type: MaterialType) => {
  switch (type) {
    case "video":
      return "text-blue-500";
    case "pdf":
      return "text-red-500";
    case "audio":
      return "text-purple-500";
    case "link":
      return "text-green-500";
    case "exercise":
      return "text-amber-500";
    case "mindmap":
      return "text-cyan-500";
    default:
      return "text-gray-500";
  }
};

export const getBackgroundForMaterialType = (type: MaterialType) => {
  switch (type) {
    case "video":
      return "bg-blue-50 dark:bg-blue-900/20";
    case "pdf":
      return "bg-red-50 dark:bg-red-900/20";
    case "audio":
      return "bg-purple-50 dark:bg-purple-900/20";
    case "link":
      return "bg-green-50 dark:bg-green-900/20";
    case "exercise":
      return "bg-amber-50 dark:bg-amber-900/20";
    case "mindmap":
      return "bg-cyan-50 dark:bg-cyan-900/20";
    default:
      return "bg-gray-50 dark:bg-gray-900/20";
  }
};
