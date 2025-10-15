import React, { useState, useEffect } from 'react';
import { ArrowUp, Users, CalendarCheck, CalendarMinus, Activity, LineChart, UserCheck2, UsersGroup } from 'lucide-react'; // Import icons from lucide-react

const Cards = ({ isLightMode }) => {
  const [estatisticas, setEstatisticas] = useState({
    visitantes: 0,
    hoje: 0,
    total: 0,
  });

  useEffect(() => {
    // Simula o recebimento de dados de uma API
    const fetchEstatisticas = async () => {
      // Em um cenário real, você faria uma chamada de API aqui
      // const response = await fetch('/api/estatisticas');
      // const data = await response.json();
      const data = {
        visitantes: 1500,
        hoje: 50,
        total: 1200,
      };
      setEstatisticas(data);
    };

    fetchEstatisticas();
  }, []);

  const calcularPorcentagemCrescimento = (hoje, total) => {
    if (total === 0) return 0; // Evita divisão por zero
    const diferenca = hoje - (total - hoje); // Calcula a diferença em relação ao dia anterior (aproximado)
    const porcentagem = (diferenca / (total - hoje)) * 100;
    return porcentagem;
  };

  const porcentagemCrescimentoVisitantes = calcularPorcentagemCrescimento(
    estatisticas.hoje,
    estatisticas.total,
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      <div className={`relative flex flex-col p-6 rounded-xl shadow-lg ${isLightMode ? 'bg-white' : 'bg-gray-800'}`}>
        <div className="flex justify-between items-center mb-4">
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center
            ${isLightMode ? 'bg-blue-100' : 'bg-blue-500/10'}
          `}>
            <LineChart className="text-blue-500 text-2xl" />
          </div>
          <div className="text-3xl font-bold text-gray-700 dark:text-white">{estatisticas.visitantes}</div>
        </div>
        <div className="flex items-center gap-1 text-sm font-medium">
          <span className="text-green-500">
            <ArrowUp className="w-4 h-4" />
          </span>
          <span className={`
            ${porcentagemCrescimentoVisitantes >= 0
              ? 'text-green-500'
              : 'text-red-500'}
          `}>
            {porcentagemCrescimentoVisitantes.toFixed(1)}%
          </span>
          <span>{isLightMode ? 'vs last week' : 'vs semana passada'}</span>
        </div>
        <div className="text-xs text-gray-500 mt-2">Total Visitors</div>
      </div>

      <div className={`relative flex flex-col p-6 rounded-xl shadow-lg ${isLightMode ? 'bg-white' : 'bg-gray-800'}`}>
        <div className="flex justify-between items-center mb-4">
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center
            ${isLightMode ? 'bg-purple-100' : 'bg-purple-500/10'}
          `}>
            <CalendarMinus className="text-purple-500 text-2xl" />
          </div>
          <div className="text-3xl font-bold text-gray-700 dark:text-white">{estatisticas.total}</div>
        </div>
        <div className="flex items-center gap-1 text-sm font-medium">
          <span className="text-green-500">
            <ArrowUp className="w-4 h-4" />
          </span>
          <span className="text-green-500">10.5%</span>
          <span>{isLightMode ? 'vs last week' : 'vs semana passada'}</span>
        </div>
        <div className="text-xs text-gray-500 mt-2">Total Bookings</div>
      </div>

      <div className={`relative flex flex-col p-6 rounded-xl shadow-lg ${isLightMode ? 'bg-white' : 'bg-gray-800'}`}>
        <div className="flex justify-between items-center mb-4">
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center
            ${isLightMode ? 'bg-yellow-100' : 'bg-yellow-500/10'}
          `}>
            <CalendarCheck className="text-yellow-500 text-2xl" />
          </div>
          <div className="text-3xl font-bold text-gray-700 dark:text-white">{estatisticas.hoje}</div>
        </div>
        <div className="flex items-center gap-1 text-sm font-medium">
          <span className="text-green-500">
            <ArrowUp className="w-4 h-4" />
          </span>
          <span className="text-green-500">8.2%</span>
          <span>{isLightMode ? 'vs last week' : 'vs semana passada'}</span>
        </div>
        <div className="text-xs text-gray-500 mt-2">Bookings Today</div>
      </div>

      <div className={`relative flex flex-col p-6 rounded-xl shadow-lg ${isLightMode ? 'bg-white' : 'bg-gray-800'}`}>
        <div className="flex justify-between items-center mb-4">
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center
            ${isLightMode ? 'bg-red-50' : 'bg-red-500/10'}
          `}>
            <Users className="text-red-500 text-2xl" />
          </div>
          <div className="text-3xl font-bold text-gray-700 dark:text-white">1,250</div>
        </div>
        <div className="flex items-center gap-1 text-sm font-medium">
          <span className="text-red-500">
            <ArrowUp className="w-4 h-4" />
          </span>
          <span className="text-red-500">-3.5%</span>
          <span>{isLightMode ? 'vs last week' : 'vs semana passada'}</span>
        </div>
        <div className="text-xs text-gray-500 mt-2">Total Users</div>
      </div>

      {/* Novo Card para Alunos */}
      <div className={`relative flex flex-col p-6 rounded-xl shadow-lg ${isLightMode ? 'bg-white' : 'bg-gray-800'}`}>
        <div className="flex justify-between items-center mb-4">
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center
            ${isLightMode ? 'bg-orange-50' : 'bg-orange-500/10'}
          `}>
            <div className="text-lg font-bold text-orange-500">{estatisticas.total}</div>
          </div>
          {(() => {
            const baseDoDiaAnterior = estatisticas.total - estatisticas.hoje;
            const crescimento = baseDoDiaAnterior > 0
              ? Math.round(((estatisticas.hoje - baseDoDiaAnterior) / baseDoDiaAnterior) * 100)
              : 0;

            return (
              <div className={`
                absolute -top-1 -right-2 px-2 py-0.5 rounded-full text-xs font-medium
                ${crescimento >= 0
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }
              `}>
                {crescimento >= 0 ? '+' : ''}{crescimento}%
              </div>
            );
          })()}
        </div>
        <div className="text-xs text-gray-500 mt-2">Alunos Totais</div>
      </div>

      {/* Card para Médias */}
      <div className={`relative flex flex-col p-6 rounded-xl shadow-lg ${isLightMode ? 'bg-white' : 'bg-gray-800'}`}>
        <div className="flex justify-between items-center mb-4">
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center
            ${isLightMode ? 'bg-cyan-50' : 'bg-cyan-500/10'}
          `}>
            <UserCheck2 className="text-cyan-500 text-2xl" />
          </div>
          <div className="text-3xl font-bold text-gray-700 dark:text-white">{estatisticas.hoje}</div>
        </div>
        <div className="flex items-center gap-1 text-sm font-medium">
          <span className="text-green-500">
            <ArrowUp className="w-4 h-4" />
          </span>
          <span className="text-green-500">5.0%</span>
          <span>{isLightMode ? 'vs last week' : 'vs semana passada'}</span>
        </div>
        <div className="text-xs text-gray-500 mt-2">Média de Alunos</div>
      </div>

      {/* Card para Grupos */}
      <div className={`relative flex flex-col p-6 rounded-xl shadow-lg ${isLightMode ? 'bg-white' : 'bg-gray-800'}`}>
        <div className="flex justify-between items-center mb-4">
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center
            ${isLightMode ? 'bg-indigo-50' : 'bg-indigo-500/10'}
          `}>
            <UsersGroup className="text-indigo-500 text-2xl" />
          </div>
          <div className="text-3xl font-bold text-gray-700 dark:text-white">30</div>
        </div>
        <div className="flex items-center gap-1 text-sm font-medium">
          <span className="text-red-500">
            <ArrowUp className="w-4 h-4" />
          </span>
          <span className="text-red-500">-1.2%</span>
          <span>{isLightMode ? 'vs last week' : 'vs semana passada'}</span>
        </div>
        <div className="text-xs text-gray-500 mt-2">Total Grupos</div>
      </div>
    </div>
  );
};

export default Cards;