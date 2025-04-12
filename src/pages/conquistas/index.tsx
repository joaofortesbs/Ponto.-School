import React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Medal,
  Star,
  Clock,
  BookOpen,
  Video,
  FileText,
  Target,
  Award,
  Crown,
  Zap,
  Brain,
  Rocket,
} from "lucide-react";

export default function ConquistasPage() {
  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] p-6 space-y-6 transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#29335C] dark:text-white">
            Conquistas
          </h1>
          <p className="text-[#64748B] dark:text-white/60">
            Acompanhe seu progresso e desbloqueie conquistas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-[#0A2540] rounded-lg px-4 py-2 border border-[#E0E1DD] dark:border-white/10">
            <Trophy className="h-5 w-5 text-[#FFD700]" />
            <div>
              <p className="text-xs text-[#64748B] dark:text-white/60">
                Pontuação Total
              </p>
              <p className="text-lg font-bold text-[#29335C] dark:text-white">
                2,450
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-[#0A2540] rounded-lg px-4 py-2 border border-[#E0E1DD] dark:border-white/10">
            <Medal className="h-5 w-5 text-[#C0C0C0]" />
            <div>
              <p className="text-xs text-[#64748B] dark:text-white/60">
                Nível Atual
              </p>
              <p className="text-lg font-bold text-[#29335C] dark:text-white">
                15
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-[#29335C] dark:text-white mb-1">
              Progresso para o próximo nível
            </h3>
            <p className="text-sm text-[#64748B] dark:text-white/60 mb-2">
              Nível 15 - Especialista
            </p>
          </div>
          <div className="text-lg font-bold text-[#FF6B00]">
            2,450 / 3,000 XP
          </div>
        </div>
        <Progress value={81.6} className="h-2 w-full" />
        <div className="flex justify-between mt-2 text-xs text-[#64748B] dark:text-white/60">
          <span>Nível 15</span>
          <span>Nível 16</span>
        </div>
      </div>

      <Tabs defaultValue="desbloqueadas">
        <TabsList className="mb-6">
          <TabsTrigger value="desbloqueadas">Desbloqueadas</TabsTrigger>
          <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="desbloqueadas" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              {
                id: 1,
                title: "Primeiro Passo",
                description: "Complete sua primeira aula",
                icon: <Rocket className="h-8 w-8 text-[#FF6B00]" />,
                points: 50,
                date: "10/01/2024",
                category: "Iniciante",
              },
              {
                id: 2,
                title: "Estudante Dedicado",
                description: "Complete 10 aulas",
                icon: <BookOpen className="h-8 w-8 text-[#FF6B00]" />,
                points: 100,
                date: "15/01/2024",
                category: "Aprendizado",
              },
              {
                id: 3,
                title: "Mestre do Conhecimento",
                description: "Obtenha nota máxima em um teste",
                icon: <Brain className="h-8 w-8 text-[#FF6B00]" />,
                points: 150,
                date: "22/01/2024",
                category: "Desempenho",
              },
              {
                id: 4,
                title: "Explorador",
                description: "Acesse todas as seções da plataforma",
                icon: <Target className="h-8 w-8 text-[#FF6B00]" />,
                points: 75,
                date: "05/02/2024",
                category: "Exploração",
              },
              {
                id: 5,
                title: "Maratonista",
                description: "Estude por 5 horas seguidas",
                icon: <Clock className="h-8 w-8 text-[#FF6B00]" />,
                points: 200,
                date: "12/02/2024",
                category: "Dedicação",
              },
              {
                id: 6,
                title: "Colaborador",
                description: "Responda 5 perguntas no fórum",
                icon: <FileText className="h-8 w-8 text-[#FF6B00]" />,
                points: 125,
                date: "20/02/2024",
                category: "Comunidade",
              },
              {
                id: 7,
                title: "Vídeo Maníaco",
                description: "Assista a 20 vídeo aulas",
                icon: <Video className="h-8 w-8 text-[#FF6B00]" />,
                points: 150,
                date: "01/03/2024",
                category: "Aprendizado",
              },
              {
                id: 8,
                title: "Colecionador de Estrelas",
                description: "Obtenha 10 avaliações 5 estrelas",
                icon: <Star className="h-8 w-8 text-[#FF6B00]" />,
                points: 250,
                date: "15/03/2024",
                category: "Desempenho",
              },
            ].map((achievement) => (
              <div
                key={achievement.id}
                className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-3 hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex flex-col items-center text-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                    {achievement.icon}
                  </div>
                  <h3 className="font-medium text-[#29335C] dark:text-white">
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-[#64748B] dark:text-white/60 mt-1">
                    {achievement.description}
                  </p>
                </div>
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#E0E1DD] dark:border-white/10">
                  <Badge variant="outline">{achievement.category}</Badge>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-[#FFD700]" />
                    <span className="text-sm font-medium">
                      {achievement.points} pts
                    </span>
                  </div>
                </div>
                <div className="text-xs text-[#64748B] dark:text-white/60 mt-2 text-right">
                  Desbloqueado em {achievement.date}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pendentes" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              {
                id: 9,
                title: "Mestre da Matemática",
                description: "Complete todos os cursos de matemática",
                icon: (
                  <Award className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                ),
                points: 500,
                progress: 60,
                category: "Especialização",
              },
              {
                id: 10,
                title: "Físico Quântico",
                description: "Complete o curso de Física Quântica",
                icon: (
                  <Zap className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                ),
                points: 300,
                progress: 42,
                category: "Especialização",
              },
              {
                id: 11,
                title: "Rei do Campus",
                description: "Alcance o topo do ranking por 1 semana",
                icon: (
                  <Crown className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                ),
                points: 1000,
                progress: 0,
                category: "Elite",
              },
              {
                id: 12,
                title: "Mentor",
                description: "Ajude 20 estudantes no fórum",
                icon: (
                  <FileText className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                ),
                points: 400,
                progress: 75,
                category: "Comunidade",
              },
              {
                id: 13,
                title: "Maratonista Extremo",
                description: "Estude por 10 horas seguidas",
                icon: (
                  <Clock className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                ),
                points: 350,
                progress: 50,
                category: "Dedicação",
              },
              {
                id: 14,
                title: "Biblioteca Ambulante",
                description: "Leia 30 artigos científicos",
                icon: (
                  <BookOpen className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                ),
                points: 450,
                progress: 33,
                category: "Aprendizado",
              },
              {
                id: 15,
                title: "Cientista",
                description: "Publique um artigo na plataforma",
                icon: (
                  <Brain className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                ),
                points: 800,
                progress: 0,
                category: "Elite",
              },
              {
                id: 16,
                title: "Colecionador de Cursos",
                description: "Complete 50 cursos",
                icon: (
                  <Trophy className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                ),
                points: 1500,
                progress: 24,
                category: "Elite",
              },
            ].map((achievement) => (
              <div
                key={achievement.id}
                className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-3 hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex flex-col items-center text-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                    {achievement.icon}
                  </div>
                  <h3 className="font-medium text-[#29335C] dark:text-white">
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-[#64748B] dark:text-white/60 mt-1">
                    {achievement.description}
                  </p>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-[#64748B] dark:text-white/60 mb-1">
                    <span>Progresso</span>
                    <span>{achievement.progress}%</span>
                  </div>
                  <Progress
                    value={achievement.progress}
                    className="h-1.5 w-full"
                  />
                </div>
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#E0E1DD] dark:border-white/10">
                  <Badge variant="outline">{achievement.category}</Badge>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-gray-400 dark:text-gray-600" />
                    <span className="text-sm font-medium">
                      {achievement.points} pts
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categorias" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              {
                id: 1,
                name: "Iniciante",
                description: "Conquistas para novos usuários",
                icon: <Rocket className="h-8 w-8 text-[#FF6B00]" />,
                total: 5,
                completed: 3,
                color: "bg-blue-500",
              },
              {
                id: 2,
                name: "Aprendizado",
                description: "Conquistas relacionadas ao estudo",
                icon: <BookOpen className="h-8 w-8 text-[#FF6B00]" />,
                total: 10,
                completed: 5,
                color: "bg-green-500",
              },
              {
                id: 3,
                name: "Desempenho",
                description: "Conquistas por boas notas e avaliações",
                icon: <Star className="h-8 w-8 text-[#FF6B00]" />,
                total: 8,
                completed: 4,
                color: "bg-yellow-500",
              },
              {
                id: 4,
                name: "Comunidade",
                description: "Conquistas por participação na comunidade",
                icon: <FileText className="h-8 w-8 text-[#FF6B00]" />,
                total: 7,
                completed: 2,
                color: "bg-purple-500",
              },
              {
                id: 5,
                name: "Dedicação",
                description: "Conquistas por tempo de estudo",
                icon: <Clock className="h-8 w-8 text-[#FF6B00]" />,
                total: 6,
                completed: 3,
                color: "bg-pink-500",
              },
              {
                id: 6,
                name: "Especialização",
                description: "Conquistas por domínio em áreas específicas",
                icon: <Brain className="h-8 w-8 text-[#FF6B00]" />,
                total: 12,
                completed: 0,
                color: "bg-indigo-500",
              },
              {
                id: 7,
                name: "Exploração",
                description: "Conquistas por explorar a plataforma",
                icon: <Target className="h-8 w-8 text-[#FF6B00]" />,
                total: 5,
                completed: 2,
                color: "bg-teal-500",
              },
              {
                id: 8,
                name: "Elite",
                description: "Conquistas raras e difíceis",
                icon: <Crown className="h-8 w-8 text-[#FF6B00]" />,
                total: 3,
                completed: 0,
                color: "bg-amber-500",
              },
            ].map((category) => (
              <div
                key={category.id}
                className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-3 hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-[#29335C] dark:text-white">
                      {category.name}
                    </h3>
                    <p className="text-sm text-[#64748B] dark:text-white/60">
                      {category.description}
                    </p>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-[#64748B] dark:text-white/60 mb-1">
                    <span>Progresso</span>
                    <span>
                      {category.completed}/{category.total} conquistas
                    </span>
                  </div>
                  <Progress
                    value={(category.completed / category.total) * 100}
                    className={`h-1.5 w-full ${category.color}`}
                  />
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  Ver Conquistas
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}