import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Filter,
  ChevronRight,
  CheckCircle,
  MessageSquare,
  Trophy,
  Users,
  Clock,
  Calendar,
  FileText,
  BookOpen,
  Bookmark,
} from "lucide-react";

export default function ActivitiesTab() {
  return (
    <div className="space-y-6">
      {/* Recent Activity */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[#29335C] dark:text-white">
            Atividades Recentes
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs border-[#E0E1DD] dark:border-white/10 text-[#64748B] dark:text-white/60"
            >
              <Filter className="h-3 w-3 mr-1" /> Filtrar
            </Button>
            <Button
              variant="ghost"
              className="text-[#FF6B00] text-xs flex items-center gap-1 hover:bg-[#FF6B00]/10"
            >
              Ver Todas <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {[
            {
              type: "lesson",
              title: "Completou a aula de Cálculo Diferencial",
              time: "Hoje, 10:30",
              icon: <CheckCircle className="h-5 w-5 text-green-500" />,
            },
            {
              type: "comment",
              title: "Comentou na discussão sobre Física Quântica",
              time: "Ontem, 15:45",
              icon: <MessageSquare className="h-5 w-5 text-blue-500" />,
            },
            {
              type: "achievement",
              title: "Conquistou o troféu 'Mestre em Matemática'",
              time: "3 dias atrás",
              icon: <Trophy className="h-5 w-5 text-[#FF6B00]" />,
            },
            {
              type: "join",
              title: "Entrou na turma de Física Avançada",
              time: "1 semana atrás",
              icon: <Users className="h-5 w-5 text-purple-500" />,
            },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-[#f7f9fa] dark:bg-[#0A2540]/50 rounded-lg"
            >
              <div className="w-10 h-10 rounded-full bg-white dark:bg-[#29335C]/50 flex items-center justify-center flex-shrink-0">
                {activity.icon}
              </div>
              <div className="flex-1">
                <p className="text-[#29335C] dark:text-white">
                  {activity.title}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3 text-[#64748B] dark:text-white/60" />
                  <span className="text-xs text-[#64748B] dark:text-white/60">
                    {activity.time}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Study Progress */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[#29335C] dark:text-white">
            Progresso de Estudos
          </h3>
          <Button
            variant="ghost"
            className="text-[#FF6B00] text-xs flex items-center gap-1 hover:bg-[#FF6B00]/10"
          >
            Ver Detalhes <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#0A2540] p-4 rounded-lg border border-[#E0E1DD] dark:border-white/10">
            <h4 className="text-base font-medium text-[#29335C] dark:text-white mb-3">
              Disciplinas
            </h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-[#29335C] dark:text-white">
                    Matemática
                  </span>
                  <span className="text-xs text-[#FF6B00]">85%</span>
                </div>
                <Progress value={85} className="h-2 bg-gray-200" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-[#29335C] dark:text-white">
                    Física
                  </span>
                  <span className="text-xs text-[#FF6B00]">72%</span>
                </div>
                <Progress value={72} className="h-2 bg-gray-200" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-[#29335C] dark:text-white">
                    Química
                  </span>
                  <span className="text-xs text-[#FF6B00]">63%</span>
                </div>
                <Progress value={63} className="h-2 bg-gray-200" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-[#29335C] dark:text-white">
                    Biologia
                  </span>
                  <span className="text-xs text-[#FF6B00]">78%</span>
                </div>
                <Progress value={78} className="h-2 bg-gray-200" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0A2540] p-4 rounded-lg border border-[#E0E1DD] dark:border-white/10">
            <h4 className="text-base font-medium text-[#29335C] dark:text-white mb-3">
              Tempo de Estudo
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-[#f7f9fa] dark:bg-[#29335C]/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#FF6B00]" />
                  <span className="text-sm text-[#29335C] dark:text-white">
                    Esta semana
                  </span>
                </div>
                <span className="text-[#FF6B00] font-medium">12h 30min</span>
              </div>

              <div className="flex justify-between items-center p-2 bg-[#f7f9fa] dark:bg-[#29335C]/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#64748B] dark:text-white/60" />
                  <span className="text-sm text-[#29335C] dark:text-white">
                    Semana passada
                  </span>
                </div>
                <span className="text-[#64748B] dark:text-white/60">
                  10h 45min
                </span>
              </div>

              <div className="flex justify-between items-center p-2 bg-[#f7f9fa] dark:bg-[#29335C]/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#64748B] dark:text-white/60" />
                  <span className="text-sm text-[#29335C] dark:text-white">
                    Este mês
                  </span>
                </div>
                <span className="text-[#64748B] dark:text-white/60">
                  42h 15min
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Content */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[#29335C] dark:text-white">
            Conteúdos Salvos
          </h3>
          <Button
            variant="ghost"
            className="text-[#FF6B00] text-xs flex items-center gap-1 hover:bg-[#FF6B00]/10"
          >
            Ver Todos <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: "Introdução à Física Quântica",
              type: "Artigo",
              date: "Salvo em 22/06/2024",
              icon: <FileText className="h-5 w-5 text-[#FF6B00]" />,
            },
            {
              title: "Cálculo Diferencial e Integral",
              type: "Vídeo",
              date: "Salvo em 20/06/2024",
              icon: <BookOpen className="h-5 w-5 text-[#FF6B00]" />,
            },
          ].map((content, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10"
            >
              <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center flex-shrink-0">
                {content.icon}
              </div>
              <div className="flex-1">
                <h4 className="text-[#29335C] dark:text-white font-medium">
                  {content.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-[#29335C]/10 text-[#29335C] dark:bg-white/10 dark:text-white text-xs">
                    {content.type}
                  </Badge>
                  <span className="text-xs text-[#64748B] dark:text-white/60">
                    {content.date}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-[#64748B] dark:text-white/60 hover:text-[#FF6B00] hover:bg-[#FF6B00]/10"
              >
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
