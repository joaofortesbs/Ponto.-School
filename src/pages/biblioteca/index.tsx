import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  BookOpen,
  Clock,
  Star,
  Download,
  Bookmark,
  Play,
  FileText,
} from "lucide-react";

export default function BibliotecaPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] p-6 space-y-6 transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#29335C] dark:text-white">
            Biblioteca
          </h1>
          <p className="text-[#64748B] dark:text-white/60">
            Acesse materiais de estudo, livros e recursos
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar na biblioteca..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" /> Filtros
        </Button>
      </div>

      <Tabs defaultValue="todos">
        <TabsList className="mb-6">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="livros">Livros</TabsTrigger>
          <TabsTrigger value="artigos">Artigos</TabsTrigger>
          <TabsTrigger value="videos">Vídeos</TabsTrigger>
          <TabsTrigger value="salvos">Salvos</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-[#29335C] dark:text-white mb-4">
              Livros Recomendados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                {
                  id: 1,
                  title: "Cálculo - Volume 1",
                  author: "James Stewart",
                  cover:
                    "https://images.unsplash.com/photo-1621944190310-e3cca1564bd7",
                  rating: 4.8,
                  subject: "Matemática",
                },
                {
                  id: 2,
                  title: "Física Conceitual",
                  author: "Paul G. Hewitt",
                  cover:
                    "https://images.unsplash.com/photo-1614332287897-cdc485fa562d",
                  rating: 4.5,
                  subject: "Física",
                },
                {
                  id: 3,
                  title: "Química Orgânica",
                  author: "John McMurry",
                  cover:
                    "https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14",
                  rating: 4.7,
                  subject: "Química",
                },
                {
                  id: 4,
                  title: "Biologia Molecular",
                  author: "Bruce Alberts",
                  cover:
                    "https://images.unsplash.com/photo-1518152006812-edab29b069ac",
                  rating: 4.6,
                  subject: "Biologia",
                },
              ].map((book) => (
                <div
                  key={book.id}
                  className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer group"
                >
                  <div className="h-40 overflow-hidden relative">
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-white/80 hover:bg-white text-[#29335C]"
                      >
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-3">
                    <Badge variant="outline" className="mb-2">
                      {book.subject}
                    </Badge>
                    <h3 className="font-medium text-[#29335C] dark:text-white line-clamp-1">
                      {book.title}
                    </h3>
                    <p className="text-sm text-[#64748B] dark:text-white/60 mb-2">
                      {book.author}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium">
                          {book.rating}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 text-xs"
                      >
                        <Download className="h-3 w-3" /> PDF
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium text-[#29335C] dark:text-white mb-4">
              Artigos Recentes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  id: 1,
                  title: "Avanços na Teoria das Cordas",
                  author: "Dr. Richard Feynman",
                  date: "15/06/2024",
                  subject: "Física",
                  readTime: "8 min",
                },
                {
                  id: 2,
                  title: "Aplicações de Machine Learning na Medicina",
                  author: "Dra. Maria Silva",
                  date: "12/06/2024",
                  subject: "Tecnologia",
                  readTime: "12 min",
                },
                {
                  id: 3,
                  title: "Descobertas Recentes em Neurociência",
                  author: "Dr. João Oliveira",
                  date: "10/06/2024",
                  subject: "Biologia",
                  readTime: "10 min",
                },
                {
                  id: 4,
                  title: "Métodos Avançados de Integração",
                  author: "Dra. Ana Santos",
                  date: "08/06/2024",
                  subject: "Matemática",
                  readTime: "15 min",
                },
              ].map((article) => (
                <div
                  key={article.id}
                  className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-4 hover:shadow-md transition-all duration-300 cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline">{article.subject}</Badge>
                    <div className="flex items-center gap-1 text-xs text-[#64748B] dark:text-white/60">
                      <Clock className="h-3 w-3" /> {article.readTime} de
                      leitura
                    </div>
                  </div>
                  <h3 className="font-medium text-[#29335C] dark:text-white mb-1">
                    {article.title}
                  </h3>
                  <p className="text-sm text-[#64748B] dark:text-white/60 mb-3">
                    {article.author}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#64748B] dark:text-white/60">
                      {article.date}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 text-xs"
                    >
                      <FileText className="h-3 w-3" /> Ler artigo
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium text-[#29335C] dark:text-white mb-4">
              Vídeo Aulas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                {
                  id: 1,
                  title: "Introdução ao Cálculo Diferencial",
                  instructor: "Prof. Carlos Santos",
                  duration: "45:30",
                  thumbnail:
                    "https://images.unsplash.com/photo-1544531585-9847b68c8c86",
                  subject: "Matemática",
                },
                {
                  id: 2,
                  title: "Mecânica Quântica Básica",
                  instructor: "Profa. Ana Oliveira",
                  duration: "38:15",
                  thumbnail:
                    "https://images.unsplash.com/photo-1635070041078-e363dbe005cb",
                  subject: "Física",
                },
                {
                  id: 3,
                  title: "Reações Orgânicas",
                  instructor: "Prof. Roberto Almeida",
                  duration: "52:20",
                  thumbnail:
                    "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6",
                  subject: "Química",
                },
              ].map((video) => (
                <div
                  key={video.id}
                  className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer group"
                >
                  <div className="h-40 overflow-hidden relative">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12 rounded-full bg-white/80 hover:bg-white text-[#FF6B00]"
                      >
                        <Play className="h-6 w-6 ml-1" />
                      </Button>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                  </div>
                  <div className="p-3">
                    <Badge variant="outline" className="mb-2">
                      {video.subject}
                    </Badge>
                    <h3 className="font-medium text-[#29335C] dark:text-white line-clamp-1">
                      {video.title}
                    </h3>
                    <p className="text-sm text-[#64748B] dark:text-white/60">
                      {video.instructor}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="livros">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              {
                id: 1,
                title: "Cálculo - Volume 1",
                author: "James Stewart",
                cover:
                  "https://images.unsplash.com/photo-1621944190310-e3cca1564bd7",
                rating: 4.8,
                subject: "Matemática",
              },
              {
                id: 2,
                title: "Física Conceitual",
                author: "Paul G. Hewitt",
                cover:
                  "https://images.unsplash.com/photo-1614332287897-cdc485fa562d",
                rating: 4.5,
                subject: "Física",
              },
              {
                id: 3,
                title: "Química Orgânica",
                author: "John McMurry",
                cover:
                  "https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14",
                rating: 4.7,
                subject: "Química",
              },
              {
                id: 4,
                title: "Biologia Molecular",
                author: "Bruce Alberts",
                cover:
                  "https://images.unsplash.com/photo-1518152006812-edab29b069ac",
                rating: 4.6,
                subject: "Biologia",
              },
              {
                id: 5,
                title: "Álgebra Linear",
                author: "David C. Lay",
                cover:
                  "https://images.unsplash.com/photo-1509228468518-180dd4864904",
                rating: 4.4,
                subject: "Matemática",
              },
              {
                id: 6,
                title: "Termodinâmica",
                author: "Yunus A. Çengel",
                cover:
                  "https://images.unsplash.com/photo-1581093458791-9d15482442f5",
                rating: 4.3,
                subject: "Física",
              },
              {
                id: 7,
                title: "Bioquímica",
                author: "Lubert Stryer",
                cover:
                  "https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe",
                rating: 4.5,
                subject: "Biologia",
              },
              {
                id: 8,
                title: "Estatística Básica",
                author: "Pedro A. Morettin",
                cover:
                  "https://images.unsplash.com/photo-1535320903710-d993d3d77d29",
                rating: 4.2,
                subject: "Matemática",
              },
            ].map((book) => (
              <div
                key={book.id}
                className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer group"
              >
                <div className="h-40 overflow-hidden relative">
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-white/80 hover:bg-white text-[#29335C]"
                    >
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-3">
                  <Badge variant="outline" className="mb-2">
                    {book.subject}
                  </Badge>
                  <h3 className="font-medium text-[#29335C] dark:text-white line-clamp-1">
                    {book.title}
                  </h3>
                  <p className="text-sm text-[#64748B] dark:text-white/60 mb-2">
                    {book.author}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">{book.rating}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 text-xs"
                    >
                      <Download className="h-3 w-3" /> PDF
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="artigos">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                id: 1,
                title: "Avanços na Teoria das Cordas",
                author: "Dr. Richard Feynman",
                date: "15/06/2024",
                subject: "Física",
                readTime: "8 min",
              },
              {
                id: 2,
                title: "Aplicações de Machine Learning na Medicina",
                author: "Dra. Maria Silva",
                date: "12/06/2024",
                subject: "Tecnologia",
                readTime: "12 min",
              },
              {
                id: 3,
                title: "Descobertas Recentes em Neurociência",
                author: "Dr. João Oliveira",
                date: "10/06/2024",
                subject: "Biologia",
                readTime: "10 min",
              },
              {
                id: 4,
                title: "Métodos Avançados de Integração",
                author: "Dra. Ana Santos",
                date: "08/06/2024",
                subject: "Matemática",
                readTime: "15 min",
              },
              {
                id: 5,
                title: "Impacto da Inteligência Artificial na Educação",
                author: "Dr. Carlos Mendes",
                date: "05/06/2024",
                subject: "Tecnologia",
                readTime: "11 min",
              },
              {
                id: 6,
                title: "Genética e Hereditariedade",
                author: "Dra. Juliana Costa",
                date: "03/06/2024",
                subject: "Biologia",
                readTime: "9 min",
              },
            ].map((article) => (
              <div
                key={article.id}
                className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-4 hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline">{article.subject}</Badge>
                  <div className="flex items-center gap-1 text-xs text-[#64748B] dark:text-white/60">
                    <Clock className="h-3 w-3" /> {article.readTime} de leitura
                  </div>
                </div>
                <h3 className="font-medium text-[#29335C] dark:text-white mb-1">
                  {article.title}
                </h3>
                <p className="text-sm text-[#64748B] dark:text-white/60 mb-3">
                  {article.author}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#64748B] dark:text-white/60">
                    {article.date}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 text-xs"
                  >
                    <FileText className="h-3 w-3" /> Ler artigo
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="videos">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              {
                id: 1,
                title: "Introdução ao Cálculo Diferencial",
                instructor: "Prof. Carlos Santos",
                duration: "45:30",
                thumbnail:
                  "https://images.unsplash.com/photo-1544531585-9847b68c8c86",
                subject: "Matemática",
              },
              {
                id: 2,
                title: "Mecânica Quântica Básica",
                instructor: "Profa. Ana Oliveira",
                duration: "38:15",
                thumbnail:
                  "https://images.unsplash.com/photo-1635070041078-e363dbe005cb",
                subject: "Física",
              },
              {
                id: 3,
                title: "Reações Orgânicas",
                instructor: "Prof. Roberto Almeida",
                duration: "52:20",
                thumbnail:
                  "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6",
                subject: "Química",
              },
              {
                id: 4,
                title: "Estrutura Celular",
                instructor: "Profa. Mariana Costa",
                duration: "41:10",
                thumbnail:
                  "https://images.unsplash.com/photo-1579154341098-e4e158cc7f55",
                subject: "Biologia",
              },
              {
                id: 5,
                title: "Equações Diferenciais",
                instructor: "Prof. Carlos Santos",
                duration: "49:25",
                thumbnail:
                  "https://images.unsplash.com/photo-1635070041078-e363dbe005cb",
                subject: "Matemática",
              },
              {
                id: 6,
                title: "Termodinâmica Aplicada",
                instructor: "Prof. Pedro Oliveira",
                duration: "37:45",
                thumbnail:
                  "https://images.unsplash.com/photo-1581093458791-9d15482442f5",
                subject: "Física",
              },
            ].map((video) => (
              <div
                key={video.id}
                className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer group"
              >
                <div className="h-40 overflow-hidden relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 rounded-full bg-white/80 hover:bg-white text-[#FF6B00]"
                    >
                      <Play className="h-6 w-6 ml-1" />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <div className="p-3">
                  <Badge variant="outline" className="mb-2">
                    {video.subject}
                  </Badge>
                  <h3 className="font-medium text-[#29335C] dark:text-white line-clamp-1">
                    {video.title}
                  </h3>
                  <p className="text-sm text-[#64748B] dark:text-white/60">
                    {video.instructor}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="salvos">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                id: 1,
                title: "Cálculo - Volume 1",
                type: "livro",
                author: "James Stewart",
                cover:
                  "https://images.unsplash.com/photo-1621944190310-e3cca1564bd7",
                savedDate: "15/06/2024",
                subject: "Matemática",
              },
              {
                id: 2,
                title: "Avanços na Teoria das Cordas",
                type: "artigo",
                author: "Dr. Richard Feynman",
                savedDate: "12/06/2024",
                subject: "Física",
              },
              {
                id: 3,
                title: "Introdução ao Cálculo Diferencial",
                type: "video",
                instructor: "Prof. Carlos Santos",
                thumbnail:
                  "https://images.unsplash.com/photo-1544531585-9847b68c8c86",
                savedDate: "10/06/2024",
                subject: "Matemática",
              },
              {
                id: 4,
                title: "Biologia Molecular",
                type: "livro",
                author: "Bruce Alberts",
                cover:
                  "https://images.unsplash.com/photo-1518152006812-edab29b069ac",
                savedDate: "05/06/2024",
                subject: "Biologia",
              },
              {
                id: 5,
                title: "Aplicações de Machine Learning na Medicina",
                type: "artigo",
                author: "Dra. Maria Silva",
                savedDate: "03/06/2024",
                subject: "Tecnologia",
              },
              {
                id: 6,
                title: "Reações Orgânicas",
                type: "video",
                instructor: "Prof. Roberto Almeida",
                thumbnail:
                  "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6",
                savedDate: "01/06/2024",
                subject: "Química",
              },
            ].map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer group"
              >
                <div className="h-32 overflow-hidden relative">
                  {item.type === "livro" || item.type === "video" ? (
                    <img
                      src={item.type === "livro" ? item.cover : item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-[#29335C] to-[#001427] flex items-center justify-center">
                      <FileText className="h-12 w-12 text-white/70" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-white/80 hover:bg-white text-red-500"
                    >
                      <Bookmark className="h-4 w-4 fill-current" />
                    </Button>
                  </div>
                  {item.type === "video" && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Play className="h-3 w-3" /> Vídeo
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="flex justify-between items-start mb-1">
                    <Badge variant="outline">{item.subject}</Badge>
                    <Badge variant="secondary" className="text-xs">
                      {item.type === "livro"
                        ? "Livro"
                        : item.type === "artigo"
                          ? "Artigo"
                          : "Vídeo"}
                    </Badge>
                  </div>
                  <h3 className="font-medium text-[#29335C] dark:text-white line-clamp-1 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-white/60">
                    {item.type === "livro"
                      ? item.author
                      : item.type === "artigo"
                        ? item.author
                        : item.instructor}
                  </p>
                  <p className="text-xs text-[#64748B] dark:text-white/60 mt-2">
                    Salvo em {item.savedDate}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
