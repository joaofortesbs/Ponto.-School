import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  ShoppingCart,
  Star,
  Clock,
  BookOpen,
  Bookmark,
  Tag,
  Users,
} from "lucide-react";

export default function MercadoPage() {
  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] p-6 space-y-6 transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#29335C] dark:text-white">
            Mercado
          </h1>
          <p className="text-[#64748B] dark:text-white/60">
            Explore e adquira cursos, materiais e recursos educacionais
          </p>
        </div>
        <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white gap-2">
          <ShoppingCart className="h-4 w-4" />
          Meu Carrinho (3)
        </Button>
      </div>

      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Buscar no mercado..." className="pl-9" />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" /> Filtros
        </Button>
      </div>

      <Tabs defaultValue="cursos">
        <TabsList className="mb-6">
          <TabsTrigger value="cursos">Cursos</TabsTrigger>
          <TabsTrigger value="materiais">Materiais</TabsTrigger>
          <TabsTrigger value="mentorias">Mentorias</TabsTrigger>
          <TabsTrigger value="promocoes">Promoções</TabsTrigger>
        </TabsList>

        <TabsContent value="cursos" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              {
                id: 1,
                title: "Cálculo Avançado",
                instructor: "Prof. Carlos Santos",
                price: 149.9,
                originalPrice: 199.9,
                rating: 4.8,
                students: 1250,
                thumbnail:
                  "https://images.unsplash.com/photo-1635070041078-e363dbe005cb",
                subject: "Matemática",
                featured: true,
              },
              {
                id: 2,
                title: "Física Quântica para Iniciantes",
                instructor: "Profa. Ana Oliveira",
                price: 129.9,
                originalPrice: 169.9,
                rating: 4.7,
                students: 980,
                thumbnail:
                  "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa",
                subject: "Física",
              },
              {
                id: 3,
                title: "Química Orgânica Completo",
                instructor: "Prof. Roberto Almeida",
                price: 159.9,
                originalPrice: 199.9,
                rating: 4.9,
                students: 1540,
                thumbnail:
                  "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6",
                subject: "Química",
              },
              {
                id: 4,
                title: "Biologia Celular e Molecular",
                instructor: "Profa. Mariana Costa",
                price: 139.9,
                originalPrice: 179.9,
                rating: 4.6,
                students: 870,
                thumbnail:
                  "https://images.unsplash.com/photo-1579154341098-e4e158cc7f55",
                subject: "Biologia",
              },
              {
                id: 5,
                title: "Estatística Aplicada",
                instructor: "Prof. Pedro Oliveira",
                price: 119.9,
                originalPrice: 149.9,
                rating: 4.5,
                students: 760,
                thumbnail:
                  "https://images.unsplash.com/photo-1535320903710-d993d3d77d29",
                subject: "Matemática",
              },
              {
                id: 6,
                title: "Termodinâmica e Aplicações",
                instructor: "Prof. João Silva",
                price: 134.9,
                originalPrice: 169.9,
                rating: 4.7,
                students: 920,
                thumbnail:
                  "https://images.unsplash.com/photo-1581093458791-9d15482442f5",
                subject: "Física",
              },
              {
                id: 7,
                title: "Bioquímica Fundamental",
                instructor: "Profa. Juliana Santos",
                price: 144.9,
                originalPrice: 189.9,
                rating: 4.8,
                students: 1050,
                thumbnail:
                  "https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe",
                subject: "Biologia",
              },
              {
                id: 8,
                title: "Álgebra Linear",
                instructor: "Prof. Carlos Santos",
                price: 109.9,
                originalPrice: 139.9,
                rating: 4.6,
                students: 830,
                thumbnail:
                  "https://images.unsplash.com/photo-1509228468518-180dd4864904",
                subject: "Matemática",
              },
            ].map((course) => (
              <div
                key={course.id}
                className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer group"
              >
                <div className="h-40 overflow-hidden relative">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {course.featured && (
                    <div className="absolute top-2 left-2 bg-[#FF6B00] text-white text-xs px-2 py-1 rounded">
                      Destaque
                    </div>
                  )}
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
                    {course.subject}
                  </Badge>
                  <h3 className="font-medium text-[#29335C] dark:text-white line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-sm text-[#64748B] dark:text-white/60 mb-2">
                    {course.instructor}
                  </p>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">
                        {course.rating}
                      </span>
                      <span className="text-xs text-[#64748B] dark:text-white/60">
                        ({course.students})
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#64748B] dark:text-white/60">
                      <Users className="h-3 w-3" /> {course.students}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-[#29335C] dark:text-white">
                        R$ {course.price.toFixed(2)}
                      </span>
                      {course.originalPrice > course.price && (
                        <span className="text-xs text-[#64748B] dark:text-white/60 line-through ml-2">
                          R$ {course.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                    >
                      Comprar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="materiais" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              {
                id: 1,
                title: "Apostila Completa de Cálculo",
                author: "Prof. Carlos Santos",
                price: 49.9,
                originalPrice: 69.9,
                format: "PDF",
                pages: 250,
                thumbnail:
                  "https://images.unsplash.com/photo-1544531585-9847b68c8c86",
                subject: "Matemática",
              },
              {
                id: 2,
                title: "Resumo de Física Quântica",
                author: "Profa. Ana Oliveira",
                price: 29.9,
                originalPrice: 39.9,
                format: "PDF",
                pages: 120,
                thumbnail:
                  "https://images.unsplash.com/photo-1635070041078-e363dbe005cb",
                subject: "Física",
              },
              {
                id: 3,
                title: "Guia de Reações Orgânicas",
                author: "Prof. Roberto Almeida",
                price: 39.9,
                originalPrice: 59.9,
                format: "PDF",
                pages: 180,
                thumbnail:
                  "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6",
                subject: "Química",
              },
              {
                id: 4,
                title: "Atlas de Biologia Celular",
                author: "Profa. Mariana Costa",
                price: 59.9,
                originalPrice: 79.9,
                format: "PDF",
                pages: 220,
                thumbnail:
                  "https://images.unsplash.com/photo-1579154341098-e4e158cc7f55",
                subject: "Biologia",
              },
              {
                id: 5,
                title: "Exercícios Resolvidos de Estatística",
                author: "Prof. Pedro Oliveira",
                price: 34.9,
                originalPrice: 44.9,
                format: "PDF",
                pages: 150,
                thumbnail:
                  "https://images.unsplash.com/photo-1535320903710-d993d3d77d29",
                subject: "Matemática",
              },
              {
                id: 6,
                title: "Mapas Mentais de Termodinâmica",
                author: "Prof. João Silva",
                price: 24.9,
                originalPrice: 34.9,
                format: "PDF",
                pages: 80,
                thumbnail:
                  "https://images.unsplash.com/photo-1581093458791-9d15482442f5",
                subject: "Física",
              },
            ].map((material) => (
              <div
                key={material.id}
                className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer group"
              >
                <div className="h-40 overflow-hidden relative">
                  <img
                    src={material.thumbnail}
                    alt={material.title}
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
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <BookOpen className="h-3 w-3" /> {material.pages} págs
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline">{material.subject}</Badge>
                    <Badge variant="secondary">{material.format}</Badge>
                  </div>
                  <h3 className="font-medium text-[#29335C] dark:text-white line-clamp-1">
                    {material.title}
                  </h3>
                  <p className="text-sm text-[#64748B] dark:text-white/60 mb-3">
                    {material.author}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-[#29335C] dark:text-white">
                        R$ {material.price.toFixed(2)}
                      </span>
                      {material.originalPrice > material.price && (
                        <span className="text-xs text-[#64748B] dark:text-white/60 line-through ml-2">
                          R$ {material.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                    >
                      Comprar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mentorias" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              {
                id: 1,
                title: "Mentoria em Matemática Avançada",
                mentor: "Prof. Carlos Santos",
                price: 199.9,
                originalPrice: 249.9,
                duration: "4 semanas",
                sessions: 8,
                thumbnail:
                  "https://images.unsplash.com/photo-1544531585-9847b68c8c86",
                subject: "Matemática",
              },
              {
                id: 2,
                title: "Mentoria em Física Quântica",
                mentor: "Profa. Ana Oliveira",
                price: 219.9,
                originalPrice: 279.9,
                duration: "6 semanas",
                sessions: 12,
                thumbnail:
                  "https://images.unsplash.com/photo-1635070041078-e363dbe005cb",
                subject: "Física",
              },
              {
                id: 3,
                title: "Mentoria em Química Orgânica",
                mentor: "Prof. Roberto Almeida",
                price: 189.9,
                originalPrice: 239.9,
                duration: "5 semanas",
                sessions: 10,
                thumbnail:
                  "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6",
                subject: "Química",
              },
              {
                id: 4,
                title: "Mentoria em Biologia Molecular",
                mentor: "Profa. Mariana Costa",
                price: 209.9,
                originalPrice: 259.9,
                duration: "6 semanas",
                sessions: 12,
                thumbnail:
                  "https://images.unsplash.com/photo-1579154341098-e4e158cc7f55",
                subject: "Biologia",
              },
              {
                id: 5,
                title: "Mentoria em Estatística Aplicada",
                mentor: "Prof. Pedro Oliveira",
                price: 179.9,
                originalPrice: 229.9,
                duration: "4 semanas",
                sessions: 8,
                thumbnail:
                  "https://images.unsplash.com/photo-1535320903710-d993d3d77d29",
                subject: "Matemática",
              },
              {
                id: 6,
                title: "Mentoria em Termodinâmica",
                mentor: "Prof. João Silva",
                price: 199.9,
                originalPrice: 249.9,
                duration: "5 semanas",
                sessions: 10,
                thumbnail:
                  "https://images.unsplash.com/photo-1581093458791-9d15482442f5",
                subject: "Física",
              },
            ].map((mentoria) => (
              <div
                key={mentoria.id}
                className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer group"
              >
                <div className="h-40 overflow-hidden relative">
                  <img
                    src={mentoria.thumbnail}
                    alt={mentoria.title}
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
                    {mentoria.subject}
                  </Badge>
                  <h3 className="font-medium text-[#29335C] dark:text-white line-clamp-1">
                    {mentoria.title}
                  </h3>
                  <p className="text-sm text-[#64748B] dark:text-white/60 mb-2">
                    {mentoria.mentor}
                  </p>
                  <div className="flex items-center justify-between mb-3 text-xs text-[#64748B] dark:text-white/60">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {mentoria.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {mentoria.sessions} sessões
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-[#29335C] dark:text-white">
                        R$ {mentoria.price.toFixed(2)}
                      </span>
                      {mentoria.originalPrice > mentoria.price && (
                        <span className="text-xs text-[#64748B] dark:text-white/60 line-through ml-2">
                          R$ {mentoria.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                    >
                      Comprar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="promocoes" className="space-y-6">
          <div className="bg-gradient-to-r from-[#29335C] to-[#001427] rounded-xl p-6 mb-6 text-white">
            <h2 className="text-xl font-bold mb-2">Promoção da Semana</h2>
            <p className="text-white/80 mb-4">
              Aproveite descontos especiais em cursos selecionados. Oferta
              válida até 30/06/2024.
            </p>
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-[#FF6B00]" />
              <span className="text-lg font-bold text-[#FF6B00]">
                Use o cupom: JUNHO30
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              {
                id: 1,
                title: "Cálculo Avançado",
                instructor: "Prof. Carlos Santos",
                price: 99.9,
                originalPrice: 199.9,
                discount: 50,
                rating: 4.8,
                students: 1250,
                thumbnail:
                  "https://images.unsplash.com/photo-1635070041078-e363dbe005cb",
                subject: "Matemática",
              },
              {
                id: 2,
                title: "Física Quântica para Iniciantes",
                instructor: "Profa. Ana Oliveira",
                price: 84.9,
                originalPrice: 169.9,
                discount: 50,
                rating: 4.7,
                students: 980,
                thumbnail:
                  "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa",
                subject: "Física",
              },
              {
                id: 3,
                title: "Química Orgânica Completo",
                instructor: "Prof. Roberto Almeida",
                price: 99.9,
                originalPrice: 199.9,
                discount: 50,
                rating: 4.9,
                students: 1540,
                thumbnail:
                  "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6",
                subject: "Química",
              },
              {
                id: 4,
                title: "Biologia Celular e Molecular",
                instructor: "Profa. Mariana Costa",
                price: 89.9,
                originalPrice: 179.9,
                discount: 50,
                rating: 4.6,
                students: 870,
                thumbnail:
                  "https://images.unsplash.com/photo-1579154341098-e4e158cc7f55",
                subject: "Biologia",
              },
              {
                id: 5,
                title: "Estatística Aplicada",
                instructor: "Prof. Pedro Oliveira",
                price: 74.9,
                originalPrice: 149.9,
                discount: 50,
                rating: 4.5,
                students: 760,
                thumbnail:
                  "https://images.unsplash.com/photo-1535320903710-d993d3d77d29",
                subject: "Matemática",
              },
              {
                id: 6,
                title: "Termodinâmica e Aplicações",
                instructor: "Prof. João Silva",
                price: 84.9,
                originalPrice: 169.9,
                discount: 50,
                rating: 4.7,
                students: 920,
                thumbnail:
                  "https://images.unsplash.com/photo-1581093458791-9d15482442f5",
                subject: "Física",
              },
              {
                id: 7,
                title: "Bioquímica Fundamental",
                instructor: "Profa. Juliana Santos",
                price: 94.9,
                originalPrice: 189.9,
                discount: 50,
                rating: 4.8,
                students: 1050,
                thumbnail:
                  "https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe",
                subject: "Biologia",
              },
              {
                id: 8,
                title: "Álgebra Linear",
                instructor: "Prof. Carlos Santos",
                price: 69.9,
                originalPrice: 139.9,
                discount: 50,
                rating: 4.6,
                students: 830,
                thumbnail:
                  "https://images.unsplash.com/photo-1509228468518-180dd4864904",
                subject: "Matemática",
              },
            ].map((course) => (
              <div
                key={course.id}
                className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer group"
              >
                <div className="h-40 overflow-hidden relative">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-[#FF6B00] text-white text-xs px-2 py-1 rounded">
                    {course.discount}% OFF
                  </div>
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
                    {course.subject}
                  </Badge>
                  <h3 className="font-medium text-[#29335C] dark:text-white line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-sm text-[#64748B] dark:text-white/60 mb-2">
                    {course.instructor}
                  </p>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">
                        {course.rating}
                      </span>
                      <span className="text-xs text-[#64748B] dark:text-white/60">
                        ({course.students})
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#64748B] dark:text-white/60">
                      <Users className="h-3 w-3" /> {course.students}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-[#29335C] dark:text-white">
                        R$ {course.price.toFixed(2)}
                      </span>
                      <span className="text-xs text-[#64748B] dark:text-white/60 line-through ml-2">
                        R$ {course.originalPrice.toFixed(2)}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                    >
                      Comprar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
