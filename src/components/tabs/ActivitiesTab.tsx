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
  Plus,
  TrendingUp,
  Target,
  Star,
} from "lucide-react";

export default function ActivitiesTab() {
  // Simular dados baseados no perfil real do usuário
  const hasActivities = false; // Para novos usuários
  const hasStudyTime = false;
  const hasSavedContent = false;

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

        {hasActivities ? (
          <div className="space-y-4">
            {/* Atividades reais apareceriam aqui */}
          </div>
        ) : (
          <div className="bg-[#f7f9fa] dark:bg-[#0A2540]/50 rounded-lg p-8 text-center border border-[#E0E1DD] dark:border-white/10">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#FF6B00]/10 rounded-full flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-[#FF6B00]" />
            </div>
            <h4 className="text-lg font-semibold text-[#29335C] dark:text-white mb-2">
              Suas atividades aparecerão aqui
            </h4>
            <p className="text-[#64748B] dark:text-white/60 mb-4 max-w-md mx-auto">
              Quando você começar a estudar, completar aulas e interagir com a plataforma, suas atividades serão exibidas aqui.
            </p>
            <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Começar a Estudar
            </Button>
          </div>
        )}
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

        {hasStudyTime ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Progresso real apareceria aqui */}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#0A2540] p-6 rounded-lg border border-[#E0E1DD] dark:border-white/10">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-[#FF6B00]/10 rounded-full flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-[#FF6B00]" />
                </div>
                <h4 className="text-base font-medium text-[#29335C] dark:text-white mb-2">
                  Disciplinas
                </h4>
                <p className="text-sm text-[#64748B] dark:text-white/60 mb-4">
                  Você ainda não começou a estudar nenhuma disciplina
                </p>
                <Button size="sm" className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                  Escolher Disciplinas
                </Button>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0A2540] p-6 rounded-lg border border-[#E0E1DD] dark:border-white/10">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-[#FF6B00]/10 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-[#FF6B00]" />
                </div>
                <h4 className="text-base font-medium text-[#29335C] dark:text-white mb-2">
                  Tempo de Estudo
                </h4>
                <p className="text-sm text-[#64748B] dark:text-white/60 mb-4">
                  Comece a estudar para acompanhar seu progresso
                </p>
                <Button size="sm" className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                  Iniciar Estudos
                </Button>
              </div>
            </div>
          </div>
        )}
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

        {hasSavedContent ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Conteúdos salvos apareceriam aqui */}
          </div>
        ) : (
          <div className="bg-[#f7f9fa] dark:bg-[#0A2540]/50 rounded-lg p-8 text-center border border-[#E0E1DD] dark:border-white/10">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#FF6B00]/10 rounded-full flex items-center justify-center">
              <Bookmark className="h-8 w-8 text-[#FF6B00]" />
            </div>
            <h4 className="text-lg font-semibold text-[#29335C] dark:text-white mb-2">
              Nenhum conteúdo salvo ainda
            </h4>
            <p className="text-[#64748B] dark:text-white/60 mb-4 max-w-md mx-auto">
              Quando você salvar artigos, vídeos ou outros materiais de estudo, eles aparecerão aqui para fácil acesso.
            </p>
            <Button variant="outline" className="border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10">
              <Star className="h-4 w-4 mr-2" />
              Explorar Biblioteca
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}