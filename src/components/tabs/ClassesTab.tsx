import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  Plus,
  Users,
  Calendar,
  ChevronRight,
  BookOpen,
  Star,
} from "lucide-react";

export default function ClassesTab() {
  return (
    <div className="space-y-6">
      {/* My Classes */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[#29335C] dark:text-white">
            Minhas Turmas
          </h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#64748B] dark:text-white/60 h-4 w-4" />
              <Input
                placeholder="Buscar turmas..."
                className="pl-9 h-8 text-sm border-[#E0E1DD] dark:border-white/10 focus:border-[#FF6B00] focus:ring-[#FF6B00]/10 w-60"
              />
            </div>
            <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white h-8 text-sm">
              <Plus className="h-4 w-4 mr-1" /> Nova Turma
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              name: "Matemática Avançada",
              teacher: "Prof. Carlos Oliveira",
              students: 28,
              progress: 85,
              nextClass: "Hoje, 14:00",
            },
            {
              name: "Física Quântica",
              teacher: "Profa. Ana Souza",
              students: 22,
              progress: 72,
              nextClass: "Amanhã, 10:30",
            },
            {
              name: "Química Orgânica",
              teacher: "Prof. Roberto Santos",
              students: 25,
              progress: 63,
              nextClass: "Quinta, 16:00",
            },
            {
              name: "Biologia Molecular",
              teacher: "Profa. Mariana Lima",
              students: 30,
              progress: 78,
              nextClass: "Sexta, 08:30",
            },
          ].map((course, index) => (
            <div
              key={index}
              className="bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10 overflow-hidden hover:shadow-md transition-all duration-300 hover:border-[#FF6B00]/30 cursor-pointer"
            >
              <div className="h-3 bg-[#FF6B00]"></div>
              <div className="p-4">
                <h4 className="text-[#29335C] dark:text-white font-bold">
                  {course.name}
                </h4>
                <p className="text-sm text-[#64748B] dark:text-white/60">
                  {course.teacher}
                </p>

                <div className="flex items-center gap-2 mt-3">
                  <Users className="h-4 w-4 text-[#64748B] dark:text-white/60" />
                  <span className="text-xs text-[#64748B] dark:text-white/60">
                    {course.students} alunos
                  </span>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-[#64748B] dark:text-white/60">
                      Progresso
                    </span>
                    <span className="text-xs text-[#FF6B00]">
                      {course.progress}%
                    </span>
                  </div>
                  <Progress
                    value={course.progress}
                    className="h-1.5 bg-gray-200"
                  />
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-[#FF6B00]" />
                    <span className="text-xs text-[#FF6B00]">
                      {course.nextClass}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    className="h-7 text-xs text-[#FF6B00] hover:bg-[#FF6B00]/10 p-0 px-2"
                  >
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Classes */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[#29335C] dark:text-white">
            Turmas Recomendadas
          </h3>
          <Button
            variant="ghost"
            className="text-[#FF6B00] text-xs flex items-center gap-1 hover:bg-[#FF6B00]/10"
          >
            Ver Todas <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {[
            {
              name: "Inteligência Artificial",
              teacher: "Prof. Lucas Mendes",
              students: 35,
              rating: 4.8,
            },
            {
              name: "Astronomia Básica",
              teacher: "Prof. Felipe Costa",
              students: 42,
              rating: 4.7,
            },
          ].map((course, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10 hover:border-[#FF6B00]/30 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-[#FF6B00]" />
                </div>
                <div>
                  <h4 className="text-[#29335C] dark:text-white font-medium">
                    {course.name}
                  </h4>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-[#64748B] dark:text-white/60">
                      {course.teacher}
                    </span>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-[#64748B] dark:text-white/60" />
                      <span className="text-xs text-[#64748B] dark:text-white/60">
                        {course.students}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-[#FF6B00]" />
                      <span className="text-xs text-[#FF6B00]">
                        {course.rating}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <Button className="h-8 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white text-xs">
                Participar
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
