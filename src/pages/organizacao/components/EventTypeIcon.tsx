import React from "react";
import {
  Video,
  FileText,
  CheckCircle,
  AlertCircle,
  Calendar,
  Users,
} from "lucide-react";
import { EventType } from "../types";

interface EventTypeIconProps {
  type: EventType;
  className?: string;
}

// Componente Trophy para o ícone de desafio
const Trophy = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
};

export default function EventTypeIcon({ type, className }: EventTypeIconProps) {
  switch (type) {
    case "aula_ao_vivo":
      return <Video className={className || "h-5 w-5"} />;
    case "aula_gravada":
      return <FileText className={className || "h-5 w-5"} />;
    case "tarefa":
      return <CheckCircle className={className || "h-5 w-5"} />;
    case "prova":
      return <AlertCircle className={className || "h-5 w-5"} />;
    case "trabalho":
      return <FileText className={className || "h-5 w-5"} />;
    case "evento":
      return <Calendar className={className || "h-5 w-5"} />;
    case "plantao":
      return <Users className={className || "h-5 w-5"} />;
    case "grupo_estudo":
      return <Users className={className || "h-5 w-5"} />;
    case "desafio":
      return <Trophy className={className || "h-5 w-5"} />;
    default:
      return <Calendar className={className || "h-5 w-5"} />;
  }
}
