import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Zap, Clock, Users, Target, BookOpen, Lightbulb, BarChart3, FileText, Video, Gamepad2, Calculator } from 'lucide-react';

interface CarrosselDoresSolucoesProps {
  className?: string;
}

export const CarrosselDoresSolucoes: React.FC<CarrosselDoresSolucoesProps> = ({ className = "" }) => {
  const doresProfessores = [
    {
      id: 1,
      text: "Falta de tempo para planejamento",
      icon: <Clock className="h-4 w-4" />,
      color: "from-red-500 to-red-600"
    },
    {
      id: 2,
      text: "Dificuldade em personalizar para cada turma",
      icon: <Users className="h-4 w-4" />,
      color: "from-red-500 to-red-600"
    },
    {
      id: 3,
      text: "Gastando com materiais caros",
      icon: <AlertTriangle className="h-4 w-4" />,
      color: "from-red-500 to-red-600"
    },
    {
      id: 4,
      text: "Passando horas criando atividades",
      icon: <Clock className="h-4 w-4" />,
      color: "from-red-500 to-red-600"
    },
    {
      id: 5,
      text: "Sem tempo para inovação pedagógica",
      icon: <Lightbulb className="h-4 w-4" />,
      color: "from-red-500 to-red-600"
    },
    {
      id: 6,
      text: "Avaliações manuais demoradas",
      icon: <BarChart3 className="h-4 w-4" />,
      color: "from-red-500 to-red-600"
    }
  ];

  const ferramentasSchoolPower = [
    {
      id: 1,
      text: "Planos de Aula",
      icon: <FileText className="h-4 w-4" />,
      color: "from-orange-500 to-orange-600"
    },
    {
      id: 2,
      text: "Avaliações Automatizadas",
      icon: <Target className="h-4 w-4" />,
      color: "from-orange-500 to-orange-600"
    },
    {
      id: 3,
      text: "Material Visual Criativo",
      icon: <Video className="h-4 w-4" />,
      color: "from-orange-500 to-orange-600"
    },
    {
      id: 4,
      text: "Exercícios Adaptativos",
      icon: <BookOpen className="h-4 w-4" />,
      color: "from-orange-500 to-orange-600"
    },
    {
      id: 5,
      text: "Jogos Educativos",
      icon: <Gamepad2 className="h-4 w-4" />,
      color: "from-orange-500 to-orange-600"
    },
    {
      id: 6,
      text: "Experimentos Práticos",
      icon: <Zap className="h-4 w-4" />,
      color: "from-orange-500 to-orange-600"
    },
    {
      id: 7,
      text: "Calculadoras Automáticas",
      icon: <Calculator className="h-4 w-4" />,
      color: "from-orange-500 to-orange-600"
    }
  ];

  // Duplicar arrays para criar loop infinito
  const doresInfinitas = [...doresProfessores, ...doresProfessores];
  const ferramentasInfinitas = [...ferramentasSchoolPower, ...ferramentasSchoolPower];

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {/* Container Principal */}
      <div className="relative bg-transparent rounded-3xl p-8" style={{ backgroundColor: 'transparent' }}>

        {/* Fileira Superior - Dores (movimento para direita) */}
        <div className="relative mb-6 overflow-hidden rounded-2xl bg-transparent p-4">
          <div className="flex items-center mb-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-500 font-semibold text-sm">Principais Dores dos Professores</span>
          </div>

          <div className="relative h-16 overflow-hidden">
            <motion.div
              className="flex gap-4 absolute"
              animate={{
                x: [0, -50 * doresProfessores.length]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {doresInfinitas.map((dor, index) => (
                <motion.div
                  key={`dor-${index}`}
                  className="flex-shrink-0 min-w-[280px]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`bg-gradient-to-r ${dor.color} backdrop-blur-sm border border-red-500 rounded-xl p-4 h-full`}>
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 p-2 bg-white/20 rounded-lg text-white">
                        {dor.icon}
                      </div>
                      <span className="text-white font-medium text-sm leading-tight">
                        {dor.text}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Fileira Inferior - Ferramentas (movimento para esquerda) */}
        <div className="relative overflow-hidden rounded-2xl bg-transparent p-4">
          <div className="flex items-center mb-3">
            <Zap className="h-5 w-5 text-orange-500 mr-2" />
            <span className="text-orange-500 font-semibold text-sm">Ferramentas do School Power</span>
          </div>

          <div className="relative h-16 overflow-hidden">
            <motion.div
              className="flex gap-4 absolute"
              animate={{
                x: [-50 * ferramentasSchoolPower.length, 0]
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {ferramentasInfinitas.map((ferramenta, index) => (
                <motion.div
                  key={`ferramenta-${index}`}
                  className="flex-shrink-0 min-w-[240px]"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`bg-gradient-to-r ${ferramenta.color} backdrop-blur-sm border border-orange-500 rounded-xl p-4 h-full`}>
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 p-2 bg-white/20 rounded-lg text-white">
                        {ferramenta.icon}
                      </div>
                      <span className="text-white font-medium text-sm leading-tight">
                        {ferramenta.text}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Efeito de Partículas de Fundo */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-orange-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, 20],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Gradiente de Borda */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-red-500/10 via-orange-500/10 to-red-500/10 pointer-events-none" />
      </div>
    </div>
  );
};

export default CarrosselDoresSolucoes;