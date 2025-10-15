
import React, { useState, useEffect } from 'react';
import { BsCalendar2Minus } from 'react-icons/bs';
import { FiUsers } from 'react-icons/fi';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';

export default function PulsoDaTurmaCard() {
  const [alunosTotal, setAlunosTotal] = useState(2);
  const [alunosOntem, setAlunosOntem] = useState(0);
  const [porcentagemVariacao, setPorcentagemVariacao] = useState(0);

  useEffect(() => {
    // Simular busca de dados reais
    const buscarDadosAlunos = () => {
      const total = 2; // Número de alunos hoje
      const ontem = 0; // Número de alunos ontem
      
      setAlunosTotal(total);
      setAlunosOntem(ontem);
      
      // Calcular porcentagem real de variação
      let variacao = 0;
      if (ontem > 0) {
        variacao = ((total - ontem) / ontem) * 100;
      } else if (total > 0) {
        variacao = 100; // Se não havia alunos ontem e há hoje, é 100% de aumento
      }
      
      setPorcentagemVariacao(Math.round(variacao));
    };

    buscarDadosAlunos();
  }, []);

  const variacaoPositiva = porcentagemVariacao >= 0;

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Pulso da Turma
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Alunos ativos hoje
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <FiUsers className="w-5 h-5 text-white" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                {alunosTotal}
              </span>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                variacaoPositiva 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                  : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              }`}>
                {variacaoPositiva ? (
                  <IoIosArrowUp className="w-3 h-3" />
                ) : (
                  <IoIosArrowDown className="w-3 h-3" />
                )}
                <span className="text-xs font-semibold">
                  {Math.abs(porcentagemVariacao)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-800">
          <BsCalendar2Minus className="w-4 h-4" />
          <span>Comparado com ontem ({alunosOntem} alunos)</span>
        </div>
      </div>
    </div>
  );
}
