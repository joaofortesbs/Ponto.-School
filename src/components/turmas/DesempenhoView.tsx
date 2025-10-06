import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Trophy,
  Star,
  Target,
  AlertCircle,
  ArrowRight,
  Lightbulb,
  ChevronRight,
  CheckCircle,
} from "lucide-react";

interface TurmaDesempenho {
  id: string;
  nome: string;
  nota: number;
  cor: string;
}

const DesempenhoView: React.FC = () => {
  // Dados de exemplo para o gráfico
  const turmas: TurmaDesempenho[] = [
    { id: "mat", nome: "Matemática", nota: 8.5, cor: "#4361EE" },
    { id: "port", nome: "Língua Portuguesa", nota: 7.8, cor: "#3A86FF" },
    { id: "fis", nome: "Física", nota: 9.2, cor: "#4CC9F0" },
    { id: "quim", nome: "Química", nota: 6.5, cor: "#4895EF" },
    { id: "bio", nome: "Biologia", nota: 8.0, cor: "#560BAD" },
  ];

  // Ordenar turmas por nota (decrescente)
  const turmasOrdenadas = [...turmas].sort((a, b) => b.nota - a.nota);

  // Calcular média geral
  const mediaGeral =
    turmas.reduce((acc, turma) => acc + turma.nota, 0) / turmas.length;

  // Determinar tendência (exemplo: comparado com o período anterior)
  const tendenciaAnterior = 8.1; // Exemplo: média do período anterior
  const tendencia =
    mediaGeral > tendenciaAnterior
      ? "up"
      : mediaGeral < tendenciaAnterior
        ? "down"
        : "stable";

  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] p-6 space-y-6 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] flex items-center justify-center shadow-md">
            <BarChart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#001427] dark:text-white bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] bg-clip-text text-transparent font-montserrat">
              Desempenho Acadêmico
            </h1>
            <p className="text-[#778DA9] dark:text-gray-400 text-sm font-open-sans">
              Acompanhe seu progresso e evolução nas turmas
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Desempenho por Turma */}
        <Card className="lg:col-span-2 bg-white dark:bg-[#1E293B] border-[#FF6B00]/10 dark:border-[#FF6B00]/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white font-montserrat flex items-center gap-2">
                <BarChart className="h-5 w-5 text-[#FF6B00]" />
                Desempenho por Turma
              </h3>
              <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] dark:bg-[#FF6B00]/20 dark:text-[#FF8C40]">
                Atualizado hoje
              </Badge>
            </div>

            <div className="space-y-4 mt-6">
              {turmasOrdenadas.map((turma) => (
                <div key={turma.id} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: turma.cor }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-montserrat">
                        {turma.nome}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-[#FF6B00]">
                      {turma.nota.toFixed(1)}
                    </span>
                  </div>
                  <div className="relative">
                    <Progress
                      value={(turma.nota / 10) * 100}
                      className="h-3 bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20"
                      style={
                        {
                          "--tw-progress-bar-background": turma.cor,
                        } as React.CSSProperties
                      }
                    />
                    {/* Linha de média */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-white dark:bg-gray-200 z-10"
                      style={{ left: `${(mediaGeral / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-white dark:bg-gray-200"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Média Geral: {mediaGeral.toFixed(1)}
                </span>
              </div>
              <Button
                variant="link"
                className="text-[#FF6B00] hover:text-[#FF8C40] p-0 h-auto"
                onClick={() =>
                  window.open("/turmas?view=desempenho&detail=true", "_blank")
                }
              >
                Ver Análise Detalhada <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Indicadores Chave */}
        <Card className="bg-white dark:bg-[#1E293B] border-[#FF6B00]/10 dark:border-[#FF6B00]/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white font-montserrat flex items-center gap-2 mb-6">
              <Target className="h-5 w-5 text-[#FF6B00]" />
              Indicadores Chave
            </h3>

            <div className="space-y-6">
              {/* Média Geral */}
              <div className="flex items-center gap-4 p-4 bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-xl border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                <div className="w-12 h-12 rounded-full bg-[#FF6B00]/20 dark:bg-[#FF6B00]/30 flex items-center justify-center">
                  <BarChart className="h-6 w-6 text-[#FF6B00]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Média Geral
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {mediaGeral.toFixed(1)}
                    </span>
                    {tendencia === "up" ? (
                      <ArrowRight className="h-4 w-4 text-green-500 rotate-[-45deg]" />
                    ) : tendencia === "down" ? (
                      <ArrowRight className="h-4 w-4 text-red-500 rotate-45" />
                    ) : (
                      <ArrowRight className="h-4 w-4 text-amber-500 rotate-0" />
                    )}
                  </div>
                </div>
              </div>

              {/* Nível na Jornada */}
              <div className="flex items-center gap-4 p-4 bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-xl border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                <div className="w-12 h-12 rounded-full bg-[#FF6B00]/20 dark:bg-[#FF6B00]/30 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-[#FF6B00]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Nível na Jornada
                  </p>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    Nível 5
                  </span>
                </div>
              </div>

              {/* Pontos Totais */}
              <div className="flex items-center gap-4 p-4 bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-xl border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                <div className="w-12 h-12 rounded-full bg-[#FF6B00]/20 dark:bg-[#FF6B00]/30 flex items-center justify-center">
                  <Star className="h-6 w-6 text-[#FF6B00]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Pontos Totais
                  </p>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    1,250
                  </span>
                </div>
              </div>

              {/* Desafios Concluídos */}
              <div className="flex items-center gap-4 p-4 bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-xl border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                <div className="w-12 h-12 rounded-full bg-[#FF6B00]/20 dark:bg-[#FF6B00]/30 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-[#FF6B00]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Desafios Concluídos
                  </p>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    12
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dica do Mentor IA */}
      <Card className="bg-white dark:bg-[#1E293B] border-[#FF6B00]/10 dark:border-[#FF6B00]/20 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#FF6B00]/20 dark:bg-[#FF6B00]/30 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="h-6 w-6 text-[#FF6B00]" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white font-montserrat mb-2">
                Dica do Mentor IA
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Baseado no seu desempenho, recomendo que você concentre-se em
                revisar os tópicos de Trigonometria em Matemática e
                Termodinâmica em Física para melhorar ainda mais suas notas.
                Você está indo muito bem em Biologia e Língua Portuguesa!
              </p>
              <div className="flex items-center gap-4">
                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 px-3 py-1">
                  <AlertCircle className="h-3.5 w-3.5 mr-1" /> Área de Atenção:
                  Química (6.5)
                </Badge>
                <Button
                  variant="link"
                  className="text-[#FF6B00] hover:text-[#FF8C40] p-0 h-auto"
                  onClick={() => window.open("/epictus-ia", "_blank")}
                >
                  Ver Plano de Estudos Personalizado{" "}
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão de Relatório Completo */}
      <div className="flex justify-center mt-8">
        <Button
          className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white px-6 py-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02] font-montserrat font-semibold text-lg animate-gradient-x"
          onClick={() =>
            window.open("/turmas?view=desempenho&detail=true", "_blank")
          }
        >
          Ver Relatório Completo de Desempenho
        </Button>
      </div>
    </div>
  );
};

export default DesempenhoView;
