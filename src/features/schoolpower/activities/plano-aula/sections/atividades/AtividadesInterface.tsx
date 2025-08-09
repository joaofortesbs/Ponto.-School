
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { 
  BookOpen, 
  FileText, 
  Calculator, 
  Palette, 
  Music, 
  Beaker, 
  Globe, 
  Gamepad2,
  Video,
  Headphones,
  Image,
  Monitor,
  Lightbulb,
  Target,
  Users,
  Clock,
  Star,
  CheckCircle
} from 'lucide-react';

interface AtividadesInterfaceProps {
  planoData?: any;
}

interface AtividadeRecurso {
  id: string;
  nome: string;
  tipo: 'atividade' | 'recurso';
  descricao?: string;
  fonte?: string;
}

const AtividadesInterface: React.FC<AtividadesInterfaceProps> = ({ planoData }) => {
  const { theme } = useTheme();
  const [atividadesRecursos, setAtividadesRecursos] = useState<AtividadeRecurso[]>([]);

  // Função para extrair atividades e recursos do desenvolvimento
  useEffect(() => {
    if (planoData?.desenvolvimento) {
      const recursos: AtividadeRecurso[] = [];
      
      planoData.desenvolvimento.forEach((etapa: any, index: number) => {
        // Extrair recursos da etapa
        if (etapa.recurso_gerado || etapa.recursos_utilizados) {
          const recursoNome = etapa.recurso_gerado || etapa.recursos_utilizados;
          if (recursoNome && recursoNome.trim()) {
            recursos.push({
              id: `recurso-${index}-${Date.now()}`,
              nome: recursoNome,
              tipo: 'recurso',
              descricao: etapa.descricao || `Recurso da ${etapa.titulo || `Etapa ${etapa.etapa || index + 1}`}`,
              fonte: 'Desenvolvimento'
            });
          }
        }

        // Extrair atividades mencionadas na descrição
        if (etapa.descricao) {
          const atividadesMencionadas = [
            'exercício', 'atividade', 'tarefa', 'prática', 'dinâmica', 
            'discussão', 'apresentação', 'trabalho', 'projeto', 'quiz',
            'jogo', 'simulação', 'experimento', 'pesquisa', 'análise'
          ];

          atividadesMencionadas.forEach(palavra => {
            if (etapa.descricao.toLowerCase().includes(palavra)) {
              recursos.push({
                id: `atividade-${palavra}-${index}`,
                nome: `${palavra.charAt(0).toUpperCase() + palavra.slice(1)} - ${etapa.titulo || `Etapa ${etapa.etapa || index + 1}`}`,
                tipo: 'atividade',
                descricao: etapa.descricao,
                fonte: etapa.titulo || `Etapa ${etapa.etapa || index + 1}`
              });
            }
          });
        }
      });

      // Adicionar recursos gerais se disponíveis
      if (planoData.visao_geral?.recursos) {
        planoData.visao_geral.recursos.forEach((recurso: string, index: number) => {
          if (Array.isArray(recurso)) {
            recurso.forEach((subRecurso: string, subIndex: number) => {
              recursos.push({
                id: `geral-recurso-${index}-${subIndex}`,
                nome: subRecurso,
                tipo: 'recurso',
                descricao: 'Recurso necessário para a aula',
                fonte: 'Visão Geral'
              });
            });
          } else {
            recursos.push({
              id: `geral-recurso-${index}`,
              nome: recurso,
              tipo: 'recurso',
              descricao: 'Recurso necessário para a aula',
              fonte: 'Visão Geral'
            });
          }
        });
      }

      // Adicionar atividades específicas se disponíveis
      if (planoData.atividades) {
        planoData.atividades.forEach((atividade: any, index: number) => {
          recursos.push({
            id: `plano-atividade-${index}`,
            nome: atividade.nome || `Atividade ${index + 1}`,
            tipo: 'atividade',
            descricao: atividade.visualizar_como_aluno || atividade.descricao || 'Atividade do plano de aula',
            fonte: 'Plano de Aula'
          });
        });
      }

      // Remover duplicatas baseado no nome
      const recursosUnicos = recursos.filter((item, index, arr) => 
        arr.findIndex(other => other.nome.toLowerCase() === item.nome.toLowerCase()) === index
      );

      setAtividadesRecursos(recursosUnicos);
    }
  }, [planoData]);

  // Função para obter ícone baseado no tipo de atividade/recurso
  const getIconeRecurso = (nome: string, tipo: 'atividade' | 'recurso') => {
    const nomeMinusculo = nome.toLowerCase();
    
    if (nomeMinusculo.includes('lousa') || nomeMinusculo.includes('quadro')) return Monitor;
    if (nomeMinusculo.includes('livro') || nomeMinusculo.includes('texto')) return BookOpen;
    if (nomeMinusculo.includes('exercício') || nomeMinusculo.includes('lista')) return FileText;
    if (nomeMinusculo.includes('calculadora')) return Calculator;
    if (nomeMinusculo.includes('pincel') || nomeMinusculo.includes('caneta')) return Palette;
    if (nomeMinusculo.includes('música') || nomeMinusculo.includes('áudio')) return Music;
    if (nomeMinusculo.includes('experimento') || nomeMinusculo.includes('laboratório')) return Beaker;
    if (nomeMinusculo.includes('internet') || nomeMinusculo.includes('site')) return Globe;
    if (nomeMinusculo.includes('jogo') || nomeMinusculo.includes('dinâmica')) return Gamepad2;
    if (nomeMinusculo.includes('vídeo') || nomeMinusculo.includes('filme')) return Video;
    if (nomeMinusculo.includes('headphone') || nomeMinusculo.includes('fone')) return Headphones;
    if (nomeMinusculo.includes('imagem') || nomeMinusculo.includes('foto')) return Image;
    if (nomeMinusculo.includes('projetor')) return Monitor;
    if (nomeMinusculo.includes('discussão') || nomeMinusculo.includes('debate')) return Users;
    if (nomeMinusculo.includes('apresentação')) return Target;
    if (nomeMinusculo.includes('tempo') || nomeMinusculo.includes('cronômetro')) return Clock;
    
    return tipo === 'atividade' ? Lightbulb : Star;
  };

  return (
    <div className={`w-full h-full ${theme === "dark" ? "bg-transparent text-white" : "bg-transparent text-[#29335C]"}`}>
      {/* Header da Seção */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#FF6B00] to-[#FF8736] flex items-center justify-center">
            <Target className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-xl font-bold text-[#29335C] dark:text-white">
            Atividades e Recursos
          </h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-11">
          Recursos e atividades necessários para aplicar o plano de aula
        </p>
      </div>

      {/* Grade de Mini-Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {atividadesRecursos.length > 0 ? (
          atividadesRecursos.map((item) => {
            const IconComponent = getIconeRecurso(item.nome, item.tipo);
            
            return (
              <div
                key={item.id}
                className={`
                  p-4 rounded-2xl border transition-all duration-200 hover:scale-105 cursor-pointer
                  ${theme === "dark" 
                    ? "bg-[#1E293B] border-gray-700 hover:border-[#FF6B00]/50" 
                    : "bg-white border-gray-200 hover:border-[#FF6B00]/50"
                  }
                  hover:shadow-lg hover:shadow-[#FF6B00]/10
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                    ${item.tipo === 'atividade' 
                      ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8736]' 
                      : 'bg-gradient-to-r from-blue-500 to-blue-600'
                    }
                  `}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm text-[#29335C] dark:text-white truncate">
                        {item.nome}
                      </h3>
                      <span className={`
                        px-2 py-0.5 text-xs rounded-full flex-shrink-0
                        ${item.tipo === 'atividade' 
                          ? 'bg-[#FF6B00]/10 text-[#FF6B00]' 
                          : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        }
                      `}>
                        {item.tipo === 'atividade' ? 'Atividade' : 'Recurso'}
                      </span>
                    </div>
                    
                    {item.descricao && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                        {item.descricao.length > 60 
                          ? `${item.descricao.substring(0, 60)}...` 
                          : item.descricao
                        }
                      </p>
                    )}
                    
                    {item.fonte && (
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B00]" />
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {item.fonte}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          // Estado vazio
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <Target className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-[#29335C] dark:text-white mb-2">
              Nenhuma atividade encontrada
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
              As atividades e recursos serão extraídos automaticamente das etapas de desenvolvimento do seu plano de aula.
            </p>
          </div>
        )}
      </div>

      {/* Estatísticas no rodapé */}
      {atividadesRecursos.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#FF6B00]">
                {atividadesRecursos.filter(item => item.tipo === 'atividade').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Atividades
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {atividadesRecursos.filter(item => item.tipo === 'recurso').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Recursos
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AtividadesInterface;
