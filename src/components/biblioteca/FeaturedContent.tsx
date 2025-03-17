import React from "react";
import { Atom, BrainCircuit, Lightbulb, BookMarked } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function FeaturedContent() {
  // Mock data for featured content
  const featuredContent = [
    {
      id: "1",
      type: "trilha",
      title: "Sua Trilha de Física",
      description: "Mecânica Clássica e Termodinâmica",
      progress: 65,
      icon: <Atom className="h-6 w-6 text-blue-500" />,
      color: "bg-blue-100 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      action: "Continuar Trilha",
    },
    {
      id: "2",
      type: "recomendado",
      title: "Equações Diferenciais",
      description: "Recomendado pelo Mentor IA",
      icon: <BrainCircuit className="h-6 w-6 text-purple-500" />,
      color: "bg-purple-100 dark:bg-purple-900/20",
      borderColor: "border-purple-200 dark:border-purple-800",
      action: "Acessar",
    },
    {
      id: "3",
      type: "novidade",
      title: "Termodinâmica - Aula 5",
      description: "Adicionado há 2 dias",
      icon: <Lightbulb className="h-6 w-6 text-yellow-500" />,
      color: "bg-yellow-100 dark:bg-yellow-900/20",
      borderColor: "border-yellow-200 dark:border-yellow-800",
      action: "Ver",
    },
    {
      id: "4",
      type: "clube-livro",
      title: "Clube do Livro",
      description: "Livro do mês: 'O Universo numa Casca de Noz'",
      icon: <BookMarked className="h-6 w-6 text-green-500" />,
      color: "bg-green-100 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
      action: "Participar",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {featuredContent.map((item) => (
        <Card
          key={item.id}
          className={`overflow-hidden border ${item.borderColor} hover:shadow-md transition-all duration-200 cursor-pointer`}
        >
          <CardHeader className={`p-4 ${item.color}`}>
            <div className="flex items-center justify-between">
              {item.icon}
              <Badge
                variant="outline"
                className="bg-white/80 dark:bg-gray-800/80"
              >
                {item.type === "trilha"
                  ? "Trilha"
                  : item.type === "recomendado"
                    ? "Recomendado"
                    : item.type === "novidade"
                      ? "Novidade"
                      : "Clube do Livro"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-3">
            <CardTitle className="text-base font-medium mb-1">
              {item.title}
            </CardTitle>
            <CardDescription className="text-sm">
              {item.description}
            </CardDescription>
            {item.type === "trilha" && (
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progresso</span>
                  <span>{item.progress}%</span>
                </div>
                <Progress value={item.progress} className="h-2" />
              </div>
            )}
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button
              className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
              size="sm"
            >
              {item.action}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
