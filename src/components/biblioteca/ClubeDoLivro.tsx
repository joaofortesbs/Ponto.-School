import React from "react";
import {
  BookMarked,
  BookText,
  Star,
  MessageSquare,
  Users,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ClubeDoLivro() {
  return (
    <div className="space-y-4">
      {/* Clube do Livro Content */}
      <Card className="overflow-hidden border border-green-200 dark:border-green-800">
        <div className="relative h-40 bg-gradient-to-r from-green-500 to-emerald-600">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <BookMarked className="h-12 w-12 mx-auto mb-2" />
              <h3 className="text-xl font-bold">Clube do Livro Ponto.School</h3>
              <p className="text-sm opacity-90">
                Expandindo horizontes através da leitura
              </p>
            </div>
          </div>
        </div>
        <CardContent className="p-4">
          <h4 className="text-lg font-bold mb-2">Livro do Mês</h4>
          <div className="flex gap-4">
            <div className="w-24 h-36 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
              <BookText className="h-10 w-10 text-gray-400" />
            </div>
            <div className="flex-1">
              <h5 className="font-bold">O Universo numa Casca de Noz</h5>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Stephen Hawking
              </p>
              <div className="flex items-center gap-1 text-yellow-400 mt-1">
                <Star className="h-4 w-4 fill-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400" />
                <Star className="h-4 w-4 fill-yellow-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                  (42 avaliações)
                </span>
              </div>
              <p className="text-sm mt-2 line-clamp-2">
                Uma jornada fascinante pelos mistérios do cosmos, explicados de
                forma acessível pelo renomado físico teórico.
              </p>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Ler Agora
                </Button>
                <Button size="sm" variant="outline">
                  Ver Discussão
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex flex-wrap gap-2">
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <MessageSquare className="h-3 w-3 mr-1" /> 28 discussões ativas
          </Badge>
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            <Users className="h-3 w-3 mr-1" /> 156 membros
          </Badge>
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
            <Calendar className="h-3 w-3 mr-1" /> Próximo encontro: 15/11
          </Badge>
        </CardFooter>
      </Card>

      <h4 className="text-lg font-bold mt-6 mb-3">Próximos Livros</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            className="overflow-hidden hover:border-green-500/50 transition-all duration-200 cursor-pointer"
          >
            <div className="h-40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <BookText className="h-12 w-12 text-gray-400" />
            </div>
            <CardHeader className="p-3">
              <CardTitle className="text-sm font-medium">
                Título do Livro {i}
              </CardTitle>
              <CardDescription className="text-xs">
                Autor do Livro {i}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <h4 className="text-lg font-bold mt-6 mb-3">Fórum do Clube</h4>
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-base">Discussões Recentes</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
                  />
                  <AvatarFallback>U{i}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">Tópico de discussão {i}</p>
                  <p className="text-xs text-gray-500">
                    Iniciado por Usuário {i} • 5 respostas
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button className="w-full" variant="outline">
            Ver Todas as Discussões
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
