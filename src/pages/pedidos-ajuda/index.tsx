import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  MessageCircle,
} from "lucide-react";

export default function PedidosAjudaPage() {
  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] p-6 space-y-6 transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#29335C] dark:text-white">
            Pedidos de Ajuda
          </h1>
          <p className="text-[#64748B] dark:text-white/60">
            Faça perguntas e ajude outros estudantes
          </p>
        </div>
        <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white gap-2">
          <Plus className="h-4 w-4" />
          Novo Pedido de Ajuda
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-2/3 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar pedidos de ajuda..."
                className="pl-9"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" /> Filtros
            </Button>
          </div>

          <Tabs defaultValue="todos">
            <TabsList className="mb-4">
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="meus">Meus Pedidos</TabsTrigger>
              <TabsTrigger value="respondidos">Respondidos</TabsTrigger>
              <TabsTrigger value="abertos">Abertos</TabsTrigger>
            </TabsList>

            <TabsContent value="todos" className="space-y-4">
              {[
                {
                  title:
                    "Como resolver equações diferenciais de segunda ordem?",
                  subject: "Matemática",
                  user: "João Silva",
                  time: "2 horas atrás",
                  responses: 3,
                  status: "respondido",
                },
                {
                  title: "Dúvida sobre o princípio da incerteza de Heisenberg",
                  subject: "Física",
                  user: "Maria Oliveira",
                  time: "5 horas atrás",
                  responses: 1,
                  status: "aberto",
                },
                {
                  title:
                    "Como identificar grupos funcionais em compostos orgânicos?",
                  subject: "Química",
                  user: "Pedro Santos",
                  time: "1 dia atrás",
                  responses: 5,
                  status: "respondido",
                },
                {
                  title: "Diferença entre mitose e meiose",
                  subject: "Biologia",
                  user: "Ana Costa",
                  time: "2 dias atrás",
                  responses: 0,
                  status: "aberto",
                },
                {
                  title: "Como analisar poemas modernistas?",
                  subject: "Literatura",
                  user: "Carlos Mendes",
                  time: "3 dias atrás",
                  responses: 2,
                  status: "respondido",
                },
              ].map((question, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-4 hover:shadow-md transition-all duration-300 cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-[#29335C] dark:text-white">
                        {question.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{question.subject}</Badge>
                        <span className="text-xs text-[#64748B] dark:text-white/60">
                          {question.user}
                        </span>
                        <span className="text-xs text-[#64748B] dark:text-white/60">
                          •
                        </span>
                        <span className="text-xs text-[#64748B] dark:text-white/60 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {question.time}
                        </span>
                      </div>
                    </div>
                    <Badge
                      className={
                        question.status === "respondido"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                      }
                    >
                      {question.status === "respondido" ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" /> Respondido
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 mr-1" /> Aberto
                        </>
                      )}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-sm text-[#64748B] dark:text-white/60">
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {question.responses}{" "}
                      {question.responses === 1 ? "resposta" : "respostas"}
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="meus" className="space-y-4">
              {[
                {
                  title:
                    "Como resolver equações diferenciais de segunda ordem?",
                  subject: "Matemática",
                  user: "João Silva",
                  time: "2 horas atrás",
                  responses: 3,
                  status: "respondido",
                },
                {
                  title: "Diferença entre mitose e meiose",
                  subject: "Biologia",
                  user: "João Silva",
                  time: "2 dias atrás",
                  responses: 0,
                  status: "aberto",
                },
              ].map((question, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-4 hover:shadow-md transition-all duration-300 cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-[#29335C] dark:text-white">
                        {question.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{question.subject}</Badge>
                        <span className="text-xs text-[#64748B] dark:text-white/60">
                          Você
                        </span>
                        <span className="text-xs text-[#64748B] dark:text-white/60">
                          •
                        </span>
                        <span className="text-xs text-[#64748B] dark:text-white/60 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {question.time}
                        </span>
                      </div>
                    </div>
                    <Badge
                      className={
                        question.status === "respondido"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                      }
                    >
                      {question.status === "respondido" ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" /> Respondido
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 mr-1" /> Aberto
                        </>
                      )}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-sm text-[#64748B] dark:text-white/60">
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {question.responses}{" "}
                      {question.responses === 1 ? "resposta" : "respostas"}
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="respondidos" className="space-y-4">
              {[
                {
                  title:
                    "Como resolver equações diferenciais de segunda ordem?",
                  subject: "Matemática",
                  user: "João Silva",
                  time: "2 horas atrás",
                  responses: 3,
                  status: "respondido",
                },
                {
                  title:
                    "Como identificar grupos funcionais em compostos orgânicos?",
                  subject: "Química",
                  user: "Pedro Santos",
                  time: "1 dia atrás",
                  responses: 5,
                  status: "respondido",
                },
                {
                  title: "Como analisar poemas modernistas?",
                  subject: "Literatura",
                  user: "Carlos Mendes",
                  time: "3 dias atrás",
                  responses: 2,
                  status: "respondido",
                },
              ].map((question, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-4 hover:shadow-md transition-all duration-300 cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-[#29335C] dark:text-white">
                        {question.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{question.subject}</Badge>
                        <span className="text-xs text-[#64748B] dark:text-white/60">
                          {question.user}
                        </span>
                        <span className="text-xs text-[#64748B] dark:text-white/60">
                          •
                        </span>
                        <span className="text-xs text-[#64748B] dark:text-white/60 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {question.time}
                        </span>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      <CheckCircle className="h-3 w-3 mr-1" /> Respondido
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-sm text-[#64748B] dark:text-white/60">
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {question.responses}{" "}
                      {question.responses === 1 ? "resposta" : "respostas"}
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="abertos" className="space-y-4">
              {[
                {
                  title: "Dúvida sobre o princípio da incerteza de Heisenberg",
                  subject: "Física",
                  user: "Maria Oliveira",
                  time: "5 horas atrás",
                  responses: 1,
                  status: "aberto",
                },
                {
                  title: "Diferença entre mitose e meiose",
                  subject: "Biologia",
                  user: "Ana Costa",
                  time: "2 dias atrás",
                  responses: 0,
                  status: "aberto",
                },
              ].map((question, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-4 hover:shadow-md transition-all duration-300 cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-[#29335C] dark:text-white">
                        {question.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{question.subject}</Badge>
                        <span className="text-xs text-[#64748B] dark:text-white/60">
                          {question.user}
                        </span>
                        <span className="text-xs text-[#64748B] dark:text-white/60">
                          •
                        </span>
                        <span className="text-xs text-[#64748B] dark:text-white/60 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {question.time}
                        </span>
                      </div>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                      <Clock className="h-3 w-3 mr-1" /> Aberto
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-sm text-[#64748B] dark:text-white/60">
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {question.responses}{" "}
                      {question.responses === 1 ? "resposta" : "respostas"}
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
              Disciplinas Populares
            </h3>
            <div className="space-y-2">
              {[
                { name: "Matemática", count: 156 },
                { name: "Física", count: 124 },
                { name: "Química", count: 98 },
                { name: "Biologia", count: 87 },
                { name: "Literatura", count: 65 },
              ].map((subject, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 hover:bg-[#E0E1DD]/10 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                >
                  <span className="text-sm text-[#29335C] dark:text-white">
                    {subject.name}
                  </span>
                  <Badge variant="outline">{subject.count}</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-4">
            <h3 className="font-medium text-[#29335C] dark:text-white mb-3">
              Estatísticas
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#64748B] dark:text-white/60">
                  Total de pedidos
                </span>
                <span className="font-medium text-[#29335C] dark:text-white">
                  1,245
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#64748B] dark:text-white/60">
                  Respondidos
                </span>
                <span className="font-medium text-[#29335C] dark:text-white">
                  987
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#64748B] dark:text-white/60">
                  Abertos
                </span>
                <span className="font-medium text-[#29335C] dark:text-white">
                  258
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#64748B] dark:text-white/60">
                  Tempo médio de resposta
                </span>
                <span className="font-medium text-[#29335C] dark:text-white">
                  2h 15min
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#29335C] to-[#001427] rounded-xl p-4 text-white">
            <h3 className="font-medium mb-2">Precisa de ajuda?</h3>
            <p className="text-sm text-white/80 mb-3">
              Faça uma pergunta e receba ajuda de outros estudantes e
              professores.
            </p>
            <Button className="w-full bg-white text-[#29335C] hover:bg-white/90">
              <Plus className="h-4 w-4 mr-2" /> Novo Pedido de Ajuda
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
