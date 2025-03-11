import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Users,
  MessageCircle,
  Plus,
  TrendingUp,
  Clock,
  Filter,
} from "lucide-react";

export default function ComunidadesPage() {
  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] p-6 space-y-6 transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#29335C] dark:text-white">
            Comunidades
          </h1>
          <p className="text-[#64748B] dark:text-white/60">
            Conecte-se com outros estudantes e compartilhe conhecimento
          </p>
        </div>
        <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white gap-2">
          <Plus className="h-4 w-4" />
          Criar Comunidade
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-2/3 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Buscar comunidades..." className="pl-9" />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" /> Filtros
            </Button>
          </div>

          <Tabs defaultValue="todas">
            <TabsList className="mb-4">
              <TabsTrigger value="todas">Todas</TabsTrigger>
              <TabsTrigger value="minhas">Minhas Comunidades</TabsTrigger>
              <TabsTrigger value="populares">Populares</TabsTrigger>
              <TabsTrigger value="recentes">Recentes</TabsTrigger>
            </TabsList>

            <TabsContent value="todas" className="space-y-4">
              {[
                {
                  name: "Matemática Avançada",
                  members: 1250,
                  posts: 324,
                  category: "Matemática",
                  joined: true,
                },
                {
                  name: "Física Quântica",
                  members: 876,
                  posts: 215,
                  category: "Física",
                  joined: false,
                },
                {
                  name: "Programação Python",
                  members: 2340,
                  posts: 567,
                  category: "Tecnologia",
                  joined: true,
                },
                {
                  name: "Literatura Brasileira",
                  members: 654,
                  posts: 189,
                  category: "Literatura",
                  joined: false,
                },
                {
                  name: "Biologia Molecular",
                  members: 987,
                  posts: 276,
                  category: "Biologia",
                  joined: false,
                },
              ].map((community, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-4 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-[#29335C] dark:text-white">
                        {community.name}
                      </h3>
                      <Badge variant="outline" className="mt-1">
                        {community.category}
                      </Badge>
                    </div>
                    <Button
                      variant={community.joined ? "outline" : "default"}
                      size="sm"
                      className={
                        community.joined
                          ? ""
                          : "bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                      }
                    >
                      {community.joined ? "Participando" : "Participar"}
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-[#64748B] dark:text-white/60">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {community.members} membros
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {community.posts} posts
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="minhas" className="space-y-4">
              {[
                {
                  name: "Matemática Avançada",
                  members: 1250,
                  posts: 324,
                  category: "Matemática",
                  joined: true,
                },
                {
                  name: "Programação Python",
                  members: 2340,
                  posts: 567,
                  category: "Tecnologia",
                  joined: true,
                },
              ].map((community, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-4 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-[#29335C] dark:text-white">
                        {community.name}
                      </h3>
                      <Badge variant="outline" className="mt-1">
                        {community.category}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      Participando
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-[#64748B] dark:text-white/60">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {community.members} membros
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {community.posts} posts
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="populares" className="space-y-4">
              {[
                {
                  name: "Programação Python",
                  members: 2340,
                  posts: 567,
                  category: "Tecnologia",
                  joined: true,
                },
                {
                  name: "Matemática Avançada",
                  members: 1250,
                  posts: 324,
                  category: "Matemática",
                  joined: true,
                },
                {
                  name: "Biologia Molecular",
                  members: 987,
                  posts: 276,
                  category: "Biologia",
                  joined: false,
                },
              ].map((community, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-4 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-[#29335C] dark:text-white">
                          {community.name}
                        </h3>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          <TrendingUp className="h-3 w-3 mr-1" /> Popular
                        </Badge>
                      </div>
                      <Badge variant="outline" className="mt-1">
                        {community.category}
                      </Badge>
                    </div>
                    <Button
                      variant={community.joined ? "outline" : "default"}
                      size="sm"
                      className={
                        community.joined
                          ? ""
                          : "bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                      }
                    >
                      {community.joined ? "Participando" : "Participar"}
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-[#64748B] dark:text-white/60">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {community.members} membros
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {community.posts} posts
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="recentes" className="space-y-4">
              {[
                {
                  name: "Literatura Brasileira",
                  members: 654,
                  posts: 189,
                  category: "Literatura",
                  joined: false,
                  time: "2 dias atrás",
                },
                {
                  name: "Física Quântica",
                  members: 876,
                  posts: 215,
                  category: "Física",
                  joined: false,
                  time: "1 semana atrás",
                },
              ].map((community, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-4 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-[#29335C] dark:text-white">
                          {community.name}
                        </h3>
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          <Clock className="h-3 w-3 mr-1" /> Nova
                        </Badge>
                      </div>
                      <Badge variant="outline" className="mt-1">
                        {community.category}
                      </Badge>
                    </div>
                    <Button
                      variant={community.joined ? "outline" : "default"}
                      size="sm"
                      className={
                        community.joined
                          ? ""
                          : "bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                      }
                    >
                      {community.joined ? "Participando" : "Participar"}
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-[#64748B] dark:text-white/60">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {community.members} membros
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {community.posts} posts
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Criada {community.time}
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        <div className="w-full md:w-1/3 space-y-4">
          <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-4">
            <h3 className="font-medium text-[#29335C] dark:text-white mb-3">
              Comunidades Sugeridas
            </h3>
            <div className="space-y-3">
              {[
                { name: "Química Orgânica", members: 765, category: "Química" },
                {
                  name: "História Mundial",
                  members: 543,
                  category: "História",
                },
                { name: "Inglês Avançado", members: 1120, category: "Idiomas" },
              ].map((community, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 hover:bg-[#E0E1DD]/10 dark:hover:bg-white/5 rounded-lg transition-colors"
                >
                  <div>
                    <h4 className="text-sm font-medium text-[#29335C] dark:text-white">
                      {community.name}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-[#64748B] dark:text-white/60">
                      <Users className="h-3 w-3" />
                      {community.members} membros
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="h-8 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                  >
                    Participar
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-4">
            <h3 className="font-medium text-[#29335C] dark:text-white mb-3">
              Categorias Populares
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                "Matemática",
                "Física",
                "Química",
                "Biologia",
                "História",
                "Geografia",
                "Literatura",
                "Idiomas",
                "Tecnologia",
                "Artes",
                "Filosofia",
                "Sociologia",
              ].map((category, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-[#E0E1DD]/20 dark:hover:bg-white/10 transition-colors"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#29335C] to-[#001427] rounded-xl p-4 text-white">
            <h3 className="font-medium mb-2">Crie sua própria comunidade</h3>
            <p className="text-sm text-white/80 mb-3">
              Compartilhe conhecimento e conecte-se com pessoas que têm os
              mesmos interesses que você.
            </p>
            <Button className="w-full bg-white text-[#29335C] hover:bg-white/90">
              <Plus className="h-4 w-4 mr-2" /> Criar Comunidade
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
