import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Eye,
  CheckCircle2,
  Video,
  FileText,
  Headphones,
  BrainCircuit,
  GraduationCap,
} from "lucide-react";

export function MaterialsList() {
  // Mock data for materials
  const materials = [
    {
      id: "1",
      title: "Introdução à Mecânica Quântica",
      type: "video",
      icon: <Video className="h-5 w-5 text-red-500" />,
      subject: "Física",
      turma: "Física - 3º Ano",
      date: "2023-10-15",
      author: "Prof. Ricardo Oliveira",
      views: 245,
      likes: 56,
      isNew: true,
      isFavorite: true,
      isRead: false,
      tags: ["Quântica", "Física Moderna", "Partículas"],
    },
    {
      id: "2",
      title: "Equações Diferenciais - Exercícios Resolvidos",
      type: "pdf",
      icon: <FileText className="h-5 w-5 text-blue-500" />,
      subject: "Matemática",
      turma: "Matemática - 3º Ano",
      date: "2023-10-10",
      author: "Profa. Maria Silva",
      views: 189,
      likes: 42,
      isNew: false,
      isFavorite: false,
      isRead: true,
      tags: ["Cálculo", "Equações", "Exercícios"],
    },
    {
      id: "3",
      title: "Podcast: História da Química",
      type: "audio",
      icon: <Headphones className="h-5 w-5 text-green-500" />,
      subject: "Química",
      turma: "Química - 3º Ano",
      date: "2023-10-05",
      author: "Prof. Carlos Santos",
      views: 120,
      likes: 35,
      isNew: false,
      isFavorite: true,
      isRead: false,
      tags: ["História", "Química", "Cientistas"],
    },
    {
      id: "4",
      title: "Mapa Mental: Sistema Circulatório",
      type: "mapa",
      icon: <BrainCircuit className="h-5 w-5 text-purple-500" />,
      subject: "Biologia",
      turma: "Biologia - 3º Ano",
      date: "2023-10-01",
      author: "Profa. Ana Costa",
      views: 210,
      likes: 48,
      isNew: true,
      isFavorite: false,
      isRead: true,
      tags: ["Anatomia", "Circulação", "Coração"],
    },
    {
      id: "5",
      title: "Simulado ENEM - Física e Matemática",
      type: "exercicio",
      icon: <GraduationCap className="h-5 w-5 text-orange-500" />,
      subject: "Multidisciplinar",
      turma: "Física - 3º Ano",
      date: "2023-09-28",
      author: "Equipe Ponto.School",
      views: 315,
      likes: 89,
      isNew: false,
      isFavorite: true,
      isRead: false,
      tags: ["ENEM", "Simulado", "Exercícios"],
    },
  ];

  return (
    <div className="space-y-3">
      {materials.map((material) => (
        <div
          key={material.id}
          className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#FF6B00]/50 transition-all duration-200 cursor-pointer"
        >
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${material.type === "video" ? "bg-red-100 dark:bg-red-900/20" : material.type === "pdf" ? "bg-blue-100 dark:bg-blue-900/20" : material.type === "audio" ? "bg-green-100 dark:bg-green-900/20" : material.type === "mapa" ? "bg-purple-100 dark:bg-purple-900/20" : "bg-orange-100 dark:bg-orange-900/20"}`}
          >
            {material.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {material.title}
              </p>
              {material.isNew && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs">
                  Novo
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>{material.subject}</span>
              <span>•</span>
              <span>{new Date(material.date).toLocaleDateString()}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" /> {material.views}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-full ${material.isFavorite ? "text-red-500" : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"}`}
            >
              <Heart
                className={`h-4 w-4 ${material.isFavorite ? "fill-red-500" : ""}`}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <CheckCircle2
                className={`h-4 w-4 ${material.isRead ? "fill-green-500 text-green-500" : ""}`}
              />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
