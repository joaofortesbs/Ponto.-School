
import React, { useState, useEffect } from "react";
import { BarChart2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import useFlowSessions from "@/hooks/useFlowSessions";

interface DisciplinaProgresso {
  nome: string;
  progresso: number;
  meta: number;
  cor: string;
  tempoTotal: number; // em segundos
}

const ProgressoDisciplina = () => {
  const [disciplinas, setDisciplinas] = useState<DisciplinaProgresso[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { sessions, loading, getStats } = useFlowSessions();

  // Função para obter cor baseada na disciplina
  const getColorForDisciplina = (nome: string): string => {
    const colorMap: Record<string, string> = {
      "Matemática": "#FF6B00", // Laranja
      "Física": "#FF6B00",  // Laranja
      "Química": "#FF6B00", // Laranja
      "Biologia": "#FF3B30", // Vermelho
      "História": "#FF2D55", // Vermelho escuro
      "Português": "#34C759", // Verde
      "Geografia": "#5856D6", // Roxo
      "Filosofia": "#007AFF", // Azul
      "Sociologia": "#5AC8FA", // Azul claro
      "Inglês": "#FFCC00", // Amarelo
    };
    
    return colorMap[nome] || "#FF6B00"; // Laranja padrão se não encontrado
  };

  // Função para obter meta baseada na disciplina
  const getMetaForDisciplina = (nome: string): number => {
    const metaMap: Record<string, number> = {
      "Matemática": 90,
      "Física": 80,
      "Química": 75,
      "Biologia": 85,
      "História": 80,
      "Português": 85,
      "Geografia": 70,
      "Filosofia": 75,
      "Sociologia": 70,
      "Inglês": 80,
    };
    
    return metaMap[nome] || 75; // Meta padrão se não encontrada
  };

  // Carregar dados das disciplinas baseado nas sessões de Flow
  useEffect(() => {
    if (!loading) {
      setIsLoading(false);

      // Para demonstração, vamos usar dados simulados semelhantes à imagem de referência
      // Em um ambiente real, você usaria os dados do getStats()
      const stats = getStats();
      const { subjectStats } = stats;

      if (Object.keys(subjectStats).length === 0) {
        // Se não há dados reais, mostrar dados de exemplo para demo
        const exemplosDisciplinas: DisciplinaProgresso[] = [
          { nome: "Matemática", progresso: 85, meta: 90, cor: "#FF6B00", tempoTotal: 7650 },
          { nome: "Física", progresso: 72, meta: 80, cor: "#FF6B00", tempoTotal: 6480 },
          { nome: "Química", progresso: 65, meta: 75, cor: "#FF6B00", tempoTotal: 5850 },
          { nome: "Biologia", progresso: 90, meta: 85, cor: "#FF3B30", tempoTotal: 8100 },
          { nome: "História", progresso: 78, meta: 80, cor: "#FF2D55", tempoTotal: 7020 }
        ];
        setDisciplinas(exemplosDisciplinas);
        return;
      }

      // Transformar dados das disciplinas para o formato esperado
      const disciplinasData: DisciplinaProgresso[] = Object.entries(subjectStats).map(([subject, timeInSeconds]) => {
        // Definir uma meta padrão (pode ser ajustada conforme necessário)
        // Por exemplo, 2 horas (7200 segundos) por disciplina por semana
        const metaEmSegundos = 7200;
        
        // Calcular progresso como percentual do tempo estudado em relação à meta
        const progressoCalculado = Math.min(Math.round((timeInSeconds / metaEmSegundos) * 100), 100);
        const meta = getMetaForDisciplina(subject);
        
        return {
          nome: subject,
          progresso: progressoCalculado,
          meta: meta, // Meta em percentual personalizada
          cor: getColorForDisciplina(subject), // Cor personalizada por disciplina
          tempoTotal: timeInSeconds
        };
      });

      // Ordenar disciplinas por tempo de estudo (decrescente)
      disciplinasData.sort((a, b) => b.tempoTotal - a.tempoTotal);
      
      // Limitar a 5 disciplinas mais estudadas para não sobrecarregar a interface
      setDisciplinas(disciplinasData.slice(0, 5));
    }
  }, [loading, sessions]);

  // Função para formatar tempo em horas e minutos
  const formatarTempoEstudo = (segundos: number): string => {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    
    if (horas > 0) {
      return `${horas}h ${minutos}min`;
    } else {
      return `${minutos}min`;
    }
  };

  return (
    <Card className="h-full overflow-hidden border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-md transition-shadow flex flex-col bg-white dark:bg-gradient-to-b dark:from-[#001427] dark:to-[#001a2f] rounded-xl">
      {/* Cabeçalho estilizado como o do card Tempo de Estudo */}
      <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-3 flex items-center justify-between shadow-md">
        <div className="flex items-center">
          <div className="bg-white/10 p-1.5 rounded-lg mr-2">
            <BarChart2 className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-white font-semibold text-sm">Progresso por Disciplina</h3>
        </div>
        {/* Seletores de período removidos */}
      </div>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="w-full">
            {/* Título removido do CardHeader como no modelo do Tempo de Estudo */}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 p-4">
        {isLoading ? (
          <div className="min-h-[200px] flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Carregando dados...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {disciplinas.length > 0 ? (
              disciplinas.map((disciplina, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${disciplina.cor}20` }}
                      >
                        <span style={{ color: disciplina.cor }} className="font-bold">
                          {disciplina.nome.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm text-[#29335C] dark:text-white">
                        {disciplina.nome}
                      </span>
                    </div>
                    <div className="flex gap-1 items-center">
                      <span className="text-sm font-medium" style={{ color: disciplina.cor }}>
                        {disciplina.progresso}%
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        / Meta: {disciplina.meta}%
                      </span>
                    </div>
                  </div>
                  <div className="relative w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ 
                        width: `${disciplina.progresso}%`,
                        backgroundColor: disciplina.cor 
                      }}
                    ></div>
                    {/* Indicador de meta */}
                    <div 
                      className="absolute top-0 bottom-0 w-px bg-white dark:bg-gray-300" 
                      style={{ 
                        left: `${disciplina.meta}%`,
                        zIndex: 10
                      }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="min-h-[200px] flex items-center justify-center">
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-[#F8F9FA] dark:bg-[#29335C]/50 flex items-center justify-center mx-auto mb-4">
                    <BarChart2 className="h-6 w-6 text-[#FF6B00]/60" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    Você ainda não tem disciplinas registradas
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 max-w-[220px] mx-auto">
                    Use a mini-seção de Flow para registrar seu tempo de estudo e visualizar seu progresso aqui
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Seção de média geral após os gráficos */}
        <div className="mt-4 pt-3 pb-2 border-t border-gray-200 dark:border-gray-700/30">
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#29335C] dark:text-white font-medium">Média geral: {disciplinas.length > 0 ? Math.round(disciplinas.reduce((sum, disc) => sum + disc.progresso, 0) / disciplinas.length) : 0}%</span>
            <a href="/agenda?view=flow" className="text-[#FF6B00] hover:underline flex items-center text-xs">
              Definir Metas <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        </div>
        
        {/* Botão para registrar tempo de estudo */}
        <div className="mt-2">
          <Button 
            variant="outline" 
            className="w-full border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
            onClick={() => window.location.href = '/agenda?view=flow'}
          >
            <ExternalLink className="h-4 w-4 mr-2" /> Registrar tempo de estudo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressoDisciplina;
