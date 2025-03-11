import React from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Video,
  FileText,
  MessageCircle,
  Users,
  Clock,
  Calendar,
} from "lucide-react";

export default function TurmaDetailPage() {
  const { id } = useParams<{ id: string }>();

  const turmaData = {
    matematica: {
      name: "Matemática Avançada",
      teacher: "Prof. Carlos Santos",
      description:
        "Curso avançado de matemática abordando cálculo diferencial e integral, álgebra linear e estatística aplicada.",
      progress: 65,
      modules: [
        { name: "Cálculo Diferencial", lessons: 8, completed: 8 },
        { name: "Cálculo Integral", lessons: 10, completed: 7 },
        { name: "Álgebra Linear", lessons: 6, completed: 3 },
        { name: "Estatística Aplicada", lessons: 8, completed: 0 },
      ],
    },
    fisica: {
      name: "Física Quântica",
      teacher: "Profa. Ana Oliveira",
      description:
        "Introdução aos conceitos fundamentais da física quântica, incluindo mecânica quântica, partículas subatômicas e aplicações tecnológicas.",
      progress: 42,
      modules: [
        { name: "Fundamentos da Mecânica Quântica", lessons: 6, completed: 6 },
        { name: "Partículas Subatômicas", lessons: 8, completed: 3 },
        { name: "Princípio da Incerteza", lessons: 4, completed: 0 },
        { name: "Aplicações Tecnológicas", lessons: 6, completed: 0 },
      ],
    },
    quimica: {
      name: "Química Orgânica",
      teacher: "Prof. Roberto Almeida",
      description:
        "Estudo das estruturas, propriedades e reações dos compostos orgânicos, com foco em hidrocarbonetos, grupos funcionais e bioquímica.",
      progress: 78,
      modules: [
        { name: "Introdução à Química Orgânica", lessons: 4, completed: 4 },
        { name: "Hidrocarbonetos", lessons: 6, completed: 6 },
        { name: "Grupos Funcionais", lessons: 8, completed: 7 },
        { name: "Bioquímica", lessons: 6, completed: 2 },
      ],
    },
    biologia: {
      name: "Biologia Molecular",
      teacher: "Profa. Mariana Costa",
      description:
        "Estudo dos processos biológicos em nível molecular, incluindo estrutura e função do DNA, síntese proteica e engenharia genética.",
      progress: 35,
      modules: [
        { name: "Estrutura e Função do DNA", lessons: 5, completed: 5 },
        { name: "Replicação e Transcrição", lessons: 6, completed: 3 },
        { name: "Síntese Proteica", lessons: 4, completed: 0 },
        { name: "Engenharia Genética", lessons: 7, completed: 0 },
      ],
    },
  };

  const turma = turmaData[id as keyof typeof turmaData];

  if (!turma) {
    return <div>Turma não encontrada</div>;
  }

  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] p-6 space-y-6 transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#29335C] dark:text-white">
            {turma.name}
          </h1>
          <p className="text-[#64748B] dark:text-white/60">{turma.teacher}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Users className="h-4 w-4" />
            Ver Colegas
          </Button>
          <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white gap-2">
            <Video className="h-4 w-4" />
            Continuar Estudando
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-[#29335C] dark:text-white mb-1">
              Progresso do Curso
            </h3>
            <p className="text-sm text-[#64748B] dark:text-white/60 mb-2">
              {turma.description}
            </p>
          </div>
          <div className="text-2xl font-bold text-[#FF6B00]">
            {turma.progress}%
          </div>
        </div>
        <Progress value={turma.progress} className="h-2 w-full" />
      </div>

      <Tabs defaultValue="conteudo" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="conteudo" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Conteúdo
          </TabsTrigger>
          <TabsTrigger value="forum" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            Fórum
          </TabsTrigger>
          <TabsTrigger value="agenda" className="gap-2">
            <Calendar className="h-4 w-4" />
            Agenda
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conteudo" className="space-y-4">
          {turma.modules.map((module, index) => (
            <div
              key={index}
              className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 overflow-hidden"
            >
              <div className="p-4 border-b border-[#E0E1DD] dark:border-white/10">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-[#29335C] dark:text-white">
                    {module.name}
                  </h3>
                  <div className="text-sm text-[#64748B] dark:text-white/60">
                    {module.completed}/{module.lessons} aulas
                  </div>
                </div>
                <Progress
                  value={(module.completed / module.lessons) * 100}
                  className="h-1 w-full mt-2"
                />
              </div>
              <div className="p-4 space-y-2">
                {Array.from({ length: module.lessons }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-2 rounded-lg ${i < module.completed ? "text-[#29335C] dark:text-white" : "text-[#64748B] dark:text-white/40"} ${i < module.completed ? "hover:bg-[#E0E1DD]/20 dark:hover:bg-white/5 cursor-pointer" : ""}`}
                  >
                    {i < module.completed ? (
                      <div className="w-8 h-8 rounded-full bg-[#29335C]/10 dark:bg-white/10 flex items-center justify-center">
                        <Video className="h-4 w-4 text-[#29335C] dark:text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#E0E1DD]/50 dark:bg-white/5 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-[#64748B] dark:text-white/40" />
                      </div>
                    )}
                    <div>
                      <p
                        className={`text-sm ${i < module.completed ? "font-medium" : ""}`}
                      >
                        Aula {i + 1}
                      </p>
                      <p className="text-xs text-[#64748B] dark:text-white/40">
                        {i < module.completed
                          ? "45 min - Concluída"
                          : "45 min - Bloqueada"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="forum">
          <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-6">
            <h3 className="text-lg font-medium text-[#29335C] dark:text-white mb-4">
              Fórum de Discussão
            </h3>
            <p className="text-[#64748B] dark:text-white/60 mb-4">
              Participe das discussões sobre os tópicos do curso e tire suas
              dúvidas com colegas e professores.
            </p>
            <div className="space-y-4">
              {[
                {
                  title: "Dúvida sobre o teorema fundamental do cálculo",
                  author: "Maria Silva",
                  replies: 5,
                  date: "Ontem",
                },
                {
                  title: "Material complementar sobre séries",
                  author: "João Oliveira",
                  replies: 3,
                  date: "3 dias atrás",
                },
                {
                  title: "Exercício 4 da lista 2",
                  author: "Pedro Santos",
                  replies: 8,
                  date: "1 semana atrás",
                },
              ].map((topic, index) => (
                <div
                  key={index}
                  className="p-4 border border-[#E0E1DD] dark:border-white/10 rounded-lg hover:bg-[#E0E1DD]/10 dark:hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-[#29335C] dark:text-white">
                      {topic.title}
                    </h4>
                    <span className="text-xs bg-[#E0E1DD]/50 dark:bg-white/10 px-2 py-1 rounded-full text-[#64748B] dark:text-white/60">
                      {topic.replies} respostas
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-[#64748B] dark:text-white/60">
                    <span>Por: {topic.author}</span>
                    <span>•</span>
                    <span>{topic.date}</span>
                  </div>
                </div>
              ))}
            </div>
            <Button className="mt-4 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
              Nova Discussão
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="agenda">
          <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-6">
            <h3 className="text-lg font-medium text-[#29335C] dark:text-white mb-4">
              Agenda do Curso
            </h3>
            <p className="text-[#64748B] dark:text-white/60 mb-4">
              Acompanhe as próximas aulas ao vivo, prazos de entrega e eventos
              importantes.
            </p>
            <div className="space-y-4">
              {[
                {
                  title: "Aula ao vivo: Revisão para prova",
                  date: "Hoje, 19:00",
                  type: "live",
                },
                {
                  title: "Entrega de exercícios - Módulo 2",
                  date: "Amanhã, 23:59",
                  type: "deadline",
                },
                {
                  title: "Prova - Módulo 2",
                  date: "25/06/2024, 14:00",
                  type: "exam",
                },
                {
                  title: "Plantão de dúvidas",
                  date: "27/06/2024, 18:00",
                  type: "live",
                },
              ].map((event, index) => (
                <div
                  key={index}
                  className="p-4 border border-[#E0E1DD] dark:border-white/10 rounded-lg hover:bg-[#E0E1DD]/10 dark:hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-[#29335C] dark:text-white">
                      {event.title}
                    </h4>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${event.type === "live" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : event.type === "deadline" ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"}`}
                    >
                      {event.type === "live"
                        ? "Aula ao vivo"
                        : event.type === "deadline"
                          ? "Prazo de entrega"
                          : "Avaliação"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-[#64748B] dark:text-white/60">
                    <Calendar className="h-3 w-3" />
                    <span>{event.date}</span>
                  </div>
                </div>
              ))}
            </div>
            <Button className="mt-4 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
              Adicionar ao Calendário
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
