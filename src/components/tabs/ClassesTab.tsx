
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
  UserPlus,
  GraduationCap,
  MessageCircle,
} from "lucide-react";

export default function ClassesTab() {
  // Para novos usuários, assumir que não há turmas
  const hasClasses = false;
  const hasRecommendations = true; // Sempre mostrar recomendações

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

        {hasClasses ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Turmas reais apareceriam aqui */}
          </div>
        ) : (
          <div className="bg-[#f7f9fa] dark:bg-[#0A2540]/50 rounded-lg p-8 text-center border border-[#E0E1DD] dark:border-white/10">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#FF6B00]/10 rounded-full flex items-center justify-center">
              <GraduationCap className="h-8 w-8 text-[#FF6B00]" />
            </div>
            <h4 className="text-lg font-semibold text-[#29335C] dark:text-white mb-2">
              Você ainda não faz parte de nenhuma turma
            </h4>
            <p className="text-[#64748B] dark:text-white/60 mb-6 max-w-md mx-auto">
              Participe de turmas para estudar com outros alunos, compartilhar conhecimento e ter acesso a materiais exclusivos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Criar Nova Turma
              </Button>
              <Button variant="outline" className="border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10">
                <UserPlus className="h-4 w-4 mr-2" />
                Buscar Turmas
              </Button>
            </div>
          </div>
        )}
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

        {hasRecommendations ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10 hover:border-[#FF6B00]/30 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-[#29335C] dark:text-white font-medium">
                    Matemática Básica - Iniciantes
                  </h4>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-[#64748B] dark:text-white/60">
                      Prof. Sistema Epictus
                    </span>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-[#64748B] dark:text-white/60" />
                      <span className="text-xs text-[#64748B] dark:text-white/60">
                        124 alunos
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-[#FF6B00]" />
                      <span className="text-xs text-[#FF6B00]">
                        4.8
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <Button className="h-8 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white text-xs">
                Participar
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10 hover:border-[#FF6B00]/30 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-[#29335C] dark:text-white font-medium">
                    Português - Fundamentos
                  </h4>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-[#64748B] dark:text-white/60">
                      Prof. Sistema Epictus
                    </span>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-[#64748B] dark:text-white/60" />
                      <span className="text-xs text-[#64748B] dark:text-white/60">
                        89 alunos
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-[#FF6B00]" />
                      <span className="text-xs text-[#FF6B00]">
                        4.7
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <Button className="h-8 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white text-xs">
                Participar
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white dark:bg-[#0A2540] rounded-lg border border-[#E0E1DD] dark:border-white/10 hover:border-[#FF6B00]/30 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-[#29335C] dark:text-white font-medium">
                    Introdução aos Estudos
                  </h4>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-[#64748B] dark:text-white/60">
                      Prof. Sistema Epictus
                    </span>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-[#64748B] dark:text-white/60" />
                      <span className="text-xs text-[#64748B] dark:text-white/60">
                        156 alunos
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-[#FF6B00]" />
                      <span className="text-xs text-[#FF6B00]">
                        4.9
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <Button className="h-8 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white text-xs">
                Participar
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-[#f7f9fa] dark:bg-[#0A2540]/50 rounded-lg p-6 text-center border border-[#E0E1DD] dark:border-white/10">
            <div className="w-12 h-12 mx-auto mb-3 bg-[#FF6B00]/10 rounded-full flex items-center justify-center">
              <Star className="h-6 w-6 text-[#FF6B00]" />
            </div>
            <p className="text-[#64748B] dark:text-white/60">
              Complete seu perfil para receber recomendações personalizadas
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
