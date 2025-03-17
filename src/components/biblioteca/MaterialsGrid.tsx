import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Video,
  FileText,
  Headphones,
  BrainCircuit,
  GraduationCap,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

export function MaterialsGrid() {
  // Mock data for materials
  const materials = [
    {
      id: "1",
      title: "Introdução à Mecânica Quântica",
      type: "video",
      icon: <Video className="h-12 w-12 text-red-500" />,
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
      icon: <FileText className="h-12 w-12 text-blue-500" />,
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
      icon: <Headphones className="h-12 w-12 text-green-500" />,
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
      icon: <BrainCircuit className="h-12 w-12 text-purple-500" />,
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
      icon: <GraduationCap className="h-12 w-12 text-orange-500" />,
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
    {
      id: "6",
      title: "Introdução à Genética Molecular",
      type: "video",
      icon: <Video className="h-12 w-12 text-red-500" />,
      subject: "Biologia",
      turma: "Biologia - 3º Ano",
      date: "2023-09-25",
      author: "Prof. Carlos Mendes",
      views: 198,
      likes: 45,
      isNew: false,
      isFavorite: false,
      isRead: true,
      tags: ["Genética", "DNA", "Biologia Molecular"],
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {materials.map((material) => (
        <Card
          key={material.id}
          className="overflow-hidden hover:border-[#FF6B00]/50 transition-all duration-200 cursor-pointer"
        >
          <div
            className={`h-32 flex items-center justify-center ${material.type === "video" ? "bg-red-100 dark:bg-red-900/20" : material.type === "pdf" ? "bg-blue-100 dark:bg-blue-900/20" : material.type === "audio" ? "bg-green-100 dark:bg-green-900/20" : material.type === "mapa" ? "bg-purple-100 dark:bg-purple-900/20" : "bg-orange-100 dark:bg-orange-900/20"}`}
          >
            {material.icon}
          </div>
          <CardHeader className="p-3">
            <CardTitle className="text-sm font-medium line-clamp-2">
              {material.title}
            </CardTitle>
          </CardHeader>
          <CardFooter className="p-3 pt-0 flex justify-between items-center">
            <Badge variant="outline" className="text-xs">
              {material.subject}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Eye className="h-3 w-3" /> {material.views}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
