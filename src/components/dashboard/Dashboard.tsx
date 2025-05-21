
import React, { useState, useEffect } from "react";
import { profileService } from "@/services/profileService";
import { UserProfile } from "@/types/user-profile";
import { CalendarIcon, Clock, BarChart2, BookOpen, Brain, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const dataAtual = new Date();
  const diaAtual = dataAtual.getDate();
  const diaSemanaAtual = dataAtual.getDay();
  
  // Dias da semana para exibição
  const diasParaExibir = Array.from({ length: 7 }, (_, i) => {
    const data = new Date(dataAtual);
    data.setDate(diaAtual - diaSemanaAtual + i);
    return {
      dia: data.getDate(),
      diaSemana: diasSemana[data.getDay()],
      atual: i === diaSemanaAtual
    };
  });

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const cachedProfile = localStorage.getItem('userProfile');
        if (cachedProfile) {
          try {
            setUserProfile(JSON.parse(cachedProfile));
          } catch (e) {
            console.error('Erro ao parsear perfil em cache:', e);
          }
        }
        
        const profile = await profileService.getCurrentUserProfile();
        if (profile) {
          setUserProfile(profile);
          localStorage.setItem('userProfile', JSON.stringify(profile));
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      }
    };

    loadUserProfile();
  }, []);

  const primeiroNome = userProfile?.full_name?.split(' ')[0] || userProfile?.display_name || localStorage.getItem('userFirstName') || "Usuário";

  return (
    <div className="w-full h-full bg-[#0A1929] p-6 space-y-4">
      {/* Cards superiores */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard 
          icon={<Clock className="h-5 w-5 text-blue-400" />}
          title="Tempo de estudo"
          value="32"
          unit="horas"
          color="blue"
        />
        <MetricCard 
          icon={<CalendarIcon className="h-5 w-5 text-purple-400" />}
          title="Aulas visualizadas"
          value="24"
          unit=""
          color="purple"
        />
        <MetricCard 
          icon={<BarChart2 className="h-5 w-5 text-orange-400" />}
          title="Progresso semanal"
          value="842"
          unit="pontos"
          color="orange"
        />
        <MetricCard 
          icon={<BookOpen className="h-5 w-5 text-green-400" />}
          title="Tarefas finalizadas"
          value="1250"
          unit=""
          color="green"
        />
      </div>

      {/* Linha principal de cards */}
      <div className="grid grid-cols-3 gap-4">
        {/* Card tempo de estudo */}
        <div className="col-span-1 bg-[#0E2337] rounded-lg p-4 shadow-md">
          <div className="flex items-center mb-4">
            <Clock className="h-5 w-5 text-orange-500 mr-2" />
            <h2 className="text-white font-semibold">Tempo de estudo</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-[#112841] rounded-lg p-3">
              <p className="text-gray-400 text-sm">Tempo semanal</p>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-bold text-white">40h</span>
              </div>
            </div>
            <div className="bg-[#112841] rounded-lg p-3">
              <p className="text-gray-400 text-sm">Meta de horas</p>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-bold text-white">0h</span>
              </div>
            </div>
          </div>
          
          <h3 className="text-white text-sm mb-1">Estudo por matéria</h3>
          
          <div className="space-y-3">
            <SubjectTimeBar subject="Matemática" hours={8} />
            <SubjectTimeBar subject="Física" hours={6} />
            <SubjectTimeBar subject="Química" hours={4} />
            <SubjectTimeBar subject="Biologia" hours={3} />
          </div>
        </div>

        {/* Card agenda da semana */}
        <div className="col-span-1 bg-[#0E2337] rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-orange-500 mr-2" />
              <h2 className="text-white font-semibold">Agenda da semana</h2>
            </div>
            <p className="text-xs text-gray-400">Conteúdos mais importantes</p>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <button className="px-3 py-1 rounded-md bg-[#162B42] text-white text-sm font-medium">
              Agenda
            </button>
            <button className="px-3 py-1 rounded-md bg-transparent text-gray-400 text-sm">
              Tarefas
            </button>
          </div>
          
          <div className="flex gap-2 justify-between mb-4">
            {diasParaExibir.map((dia, index) => (
              <div 
                key={index} 
                className={`flex flex-col items-center ${dia.atual ? 'bg-orange-500 text-white' : 'bg-[#162B42] text-gray-300'} rounded-md py-1 px-2 w-9`}
              >
                <span className="text-xs">{dia.diaSemana}</span>
                <span className="text-sm font-medium">{dia.dia}</span>
              </div>
            ))}
          </div>
          
          <div className="space-y-2">
            <div className="bg-[#112841] rounded-lg p-2">
              <div className="flex items-center mb-1">
                <div className="h-2 w-2 rounded-full bg-orange-500 mr-2"></div>
                <p className="text-gray-100 text-sm">Matemática Avançada</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">Prof. Gustavo Santos</p>
                <p className="text-xs text-gray-400">14:00 - 15:30</p>
              </div>
            </div>
            
            <div className="bg-[#112841] rounded-lg p-2">
              <div className="flex items-center mb-1">
                <div className="h-2 w-2 rounded-full bg-orange-500 mr-2"></div>
                <p className="text-gray-100 text-sm">Entrega de Exercícios</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">Plataforma</p>
                <p className="text-xs text-gray-400">20:00 - 22:00</p>
              </div>
            </div>
            
            <div className="bg-[#112841] rounded-lg p-2">
              <div className="flex items-center mb-1">
                <div className="h-2 w-2 rounded-full bg-orange-500 mr-2"></div>
                <p className="text-gray-100 text-sm">Tempo de Estudos</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">Sala Virtual</p>
                <p className="text-xs text-gray-400">16:00 - 17:30</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card Epictus IA */}
        <div className="col-span-1 bg-[#0E2337] rounded-lg p-4 shadow-md overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="rounded-lg bg-orange-500 p-1">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-white font-semibold ml-2">Epictus IA</h2>
              <span className="ml-2 text-xs px-2 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full">Premium</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-6">Seu assistente de estudos pessoal</p>
          
          <div className="flex flex-col items-center justify-center text-center pt-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-300 to-orange-500 opacity-20 blur-xl rounded-full"></div>
              <div className="relative z-10">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M30 5L35.8 20.2H52.3L39.2 30L45 45.4L30 35.6L15 45.4L20.8 30L7.7 20.2H24.2L30 5Z" fill="#FF6B00"/>
                </svg>
              </div>
            </div>
            
            <h3 className="text-white font-bold text-xl mb-1">Assistente Inteligente</h3>
            <p className="text-gray-400 text-sm mb-4 px-4">
              Tire dúvidas, receba explicações personalizadas e melhore seu desempenho nos estudos da IA.
            </p>
            
            <button className="mt-2 w-full bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-md py-2 px-4 font-medium flex items-center justify-center">
              Conversar com Epictus IA
            </button>
          </div>
        </div>
      </div>

      {/* Cards inferiores */}
      <div className="grid grid-cols-3 gap-4">
        {/* Card Progresso por matéria */}
        <div className="col-span-1 bg-[#0E2337] rounded-lg p-4 shadow-md">
          <div className="flex items-center mb-4">
            <div className="flex justify-center items-center h-6 w-6 rounded-md bg-orange-500 mr-2">
              <span className="text-white text-xs font-bold">P</span>
            </div>
            <h2 className="text-white font-semibold">Progresso por matéria</h2>
          </div>
          
          <div className="space-y-4">
            <SubjectProgressBar subject="Matemática Avançada" progress={73} />
            <SubjectProgressBar subject="Física Quântica" progress={65} />
            <SubjectProgressBar subject="Química Orgânica" progress={42} />
            <SubjectProgressBar subject="Biologia Molecular" progress={58} />
            <SubjectProgressBar subject="História da Ciência" progress={30} />
          </div>
        </div>

        {/* Card de Novidades */}
        <div className="col-span-2 bg-[#0E2337] rounded-lg p-4 shadow-md">
          <div className="flex items-center mb-3">
            <div className="flex justify-center items-center h-6 w-6 rounded-md bg-orange-500 mr-2">
              <span className="text-white text-xs font-bold">N</span>
            </div>
            <h2 className="text-white font-semibold">NOVIDADES!</h2>
            <span className="ml-2 text-xs text-gray-400">• Para seu estudo ficar claro e estruturado</span>
          </div>
          
          <div className="flex items-start mb-2">
            <div className="mr-3 flex-shrink-0">
              <img src="/images/tempo-image-20250329T052809581Z.png" alt="Curso física quântica" className="h-20 w-24 object-cover rounded-md" />
            </div>
            <div className="flex-grow">
              <h3 className="text-white font-medium mb-1">Novos cursos de Física Quântica disponíveis</h3>
              <p className="text-gray-400 text-xs mb-2">
                Amplie seus conhecimentos sobre mecânica quântica com os novos conteúdos de Física Quântica, ministrados pelos melhores professores da área.
              </p>
              <div className="flex justify-between items-center">
                <button className="text-orange-500 text-xs flex items-center">
                  Acessar Curso <ChevronRight className="h-3 w-3 ml-1" />
                </button>
                <p className="text-xs text-gray-500">3 aulas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, title, value, unit, color }: { 
  icon: React.ReactNode, 
  title: string, 
  value: string,
  unit: string,
  color: string 
}) {
  const bgColors = {
    blue: "bg-[#0E2337]",
    purple: "bg-[#0E2337]",
    orange: "bg-[#0E2337]",
    green: "bg-[#0E2337]"
  };

  return (
    <div className={`${bgColors[color as keyof typeof bgColors]} rounded-lg p-3 shadow-md flex flex-col`}>
      <div className="flex items-center mb-1">
        <div className="mr-2">
          {icon}
        </div>
        <p className="text-gray-400 text-xs">{title}</p>
      </div>
      <div className="flex items-baseline mt-auto">
        <span className="text-white text-xl font-bold">{value}</span>
        {unit && <span className="text-gray-400 text-xs ml-1">{unit}</span>}
      </div>
    </div>
  );
}

function SubjectTimeBar({ subject, hours }: { subject: string, hours: number }) {
  return (
    <div className="flex flex-col">
      <div className="flex justify-between mb-1">
        <span className="text-gray-400 text-xs">{subject}</span>
        <span className="text-gray-400 text-xs">{hours}h</span>
      </div>
      <Progress value={hours * 5} className="h-2 bg-[#112841]" indicatorClassName="bg-blue-500" />
    </div>
  );
}

function SubjectProgressBar({ subject, progress }: { subject: string, progress: number }) {
  return (
    <div>
      <div className="flex items-center mb-1">
        <span className="text-xs text-gray-300 mr-1">►</span>
        <span className="text-gray-300 text-sm">{subject}</span>
        <span className="ml-auto text-gray-300 text-sm">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2 bg-[#112841]" indicatorClassName="bg-orange-500" />
    </div>
  );
}
