import React from "react";
import { Button } from "@/components/ui/button";
import { Rocket, Zap, Bell, Star, Calendar, BookOpen } from "lucide-react";

export default function NovidadesPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#29335C] dark:text-white font-montserrat flex items-center">
          <Rocket className="h-8 w-8 mr-3 text-[#FF6B00]" /> Novidades
        </h1>
        <Button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
          <Bell className="h-4 w-4 mr-2" /> Ativar notificações
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
          <div className="h-2 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40]"></div>
          <div className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-[#FF6B00]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#29335C] dark:text-white text-lg">
                    Nova Funcionalidade
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Lançada em 15/06/2024
                  </p>
                </div>
              </div>
              <div className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded">
                Novo
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Estamos trabalhando em uma nova funcionalidade que permitirá aos
              usuários personalizar completamente sua experiência de
              aprendizado.
            </p>

            <Button
              variant="outline"
              className="w-full border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10"
            >
              Saiba mais
            </Button>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
          <div className="h-2 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40]"></div>
          <div className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-[#FF6B00]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#29335C] dark:text-white text-lg">
                    Agenda Aprimorada
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Lançada em 10/06/2024
                  </p>
                </div>
              </div>
              <div className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium px-2.5 py-0.5 rounded">
                Atualizado
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              A agenda agora conta com novos recursos de organização e
              sincronização com outros calendários populares.
            </p>

            <Button
              variant="outline"
              className="w-full border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10"
            >
              Saiba mais
            </Button>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
          <div className="h-2 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40]"></div>
          <div className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-[#FF6B00]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#29335C] dark:text-white text-lg">
                    Novos Cursos
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Lançados em 05/06/2024
                  </p>
                </div>
              </div>
              <div className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 text-xs font-medium px-2.5 py-0.5 rounded">
                Conteúdo
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Adicionamos 15 novos cursos em diversas áreas do conhecimento,
              incluindo Inteligência Artificial e Ciência de Dados.
            </p>

            <Button
              variant="outline"
              className="w-full border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10"
            >
              Explorar cursos
            </Button>
          </div>
        </div>

        {/* Card 4 - Em breve */}
        <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
          <div className="h-2 bg-gradient-to-r from-[#778DA9] to-[#29335C]"></div>
          <div className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#778DA9]/10 flex items-center justify-center">
                  <Star className="h-5 w-5 text-[#778DA9]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#29335C] dark:text-white text-lg">
                    Em Desenvolvimento
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Previsão: Julho/2024
                  </p>
                </div>
              </div>
              <div className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 text-xs font-medium px-2.5 py-0.5 rounded">
                Em breve
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Estamos trabalhando em recursos inovadores que serão anunciados em
              breve. Fique atento às próximas atualizações!
            </p>

            <Button
              variant="outline"
              className="w-full border-[#778DA9] text-[#778DA9] hover:bg-[#778DA9]/10"
            >
              Receber notificação
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-10 bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-xl font-bold text-[#29335C] dark:text-white mb-4">
          Linha do Tempo de Atualizações
        </h2>

        <div className="relative border-l-2 border-[#FF6B00] pl-6 pb-2 space-y-6">
          {/* Item 1 */}
          <div className="relative">
            <div className="absolute -left-9 top-0 w-4 h-4 rounded-full bg-[#FF6B00]"></div>
            <div className="mb-1 text-sm font-normal text-gray-400">
              15 de Junho, 2024
            </div>
            <h3 className="text-lg font-semibold text-[#29335C] dark:text-white">
              Nova Funcionalidade Anunciada
            </h3>
            <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">
              Anúncio da nova funcionalidade de personalização da experiência de
              aprendizado.
            </p>
          </div>

          {/* Item 2 */}
          <div className="relative">
            <div className="absolute -left-9 top-0 w-4 h-4 rounded-full bg-[#FF6B00]"></div>
            <div className="mb-1 text-sm font-normal text-gray-400">
              10 de Junho, 2024
            </div>
            <h3 className="text-lg font-semibold text-[#29335C] dark:text-white">
              Atualização da Agenda
            </h3>
            <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">
              Melhorias na agenda com novos recursos de organização e
              sincronização.
            </p>
          </div>

          {/* Item 3 */}
          <div className="relative">
            <div className="absolute -left-9 top-0 w-4 h-4 rounded-full bg-[#FF6B00]"></div>
            <div className="mb-1 text-sm font-normal text-gray-400">
              5 de Junho, 2024
            </div>
            <h3 className="text-lg font-semibold text-[#29335C] dark:text-white">
              Novos Cursos Adicionados
            </h3>
            <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">
              15 novos cursos em diversas áreas do conhecimento, incluindo
              Inteligência Artificial e Ciência de Dados.
            </p>
          </div>

          {/* Item 4 */}
          <div className="relative">
            <div className="absolute -left-9 top-0 w-4 h-4 rounded-full bg-[#778DA9]"></div>
            <div className="mb-1 text-sm font-normal text-gray-400">
              1 de Junho, 2024
            </div>
            <h3 className="text-lg font-semibold text-[#29335C] dark:text-white">
              Melhorias de Desempenho
            </h3>
            <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">
              Otimizações de desempenho em toda a plataforma para uma
              experiência mais rápida e fluida.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
