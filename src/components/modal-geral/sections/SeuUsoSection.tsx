import React, { useState, useEffect, useRef } from "react";
import { 
  Zap, 
  Clock, 
  BookOpen, 
  Shield,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Plus,
  Minus,
  Crown,
  Gift,
  ArrowUpRight,
  BarChart3
} from "lucide-react";
import { MODAL_CONFIG } from "../SidebarModal";
import { profileService } from "@/services/profileService";

interface PowersData {
  current: number | null;
  daily: number;
  total: number | null;
}

interface LifeDashboard {
  hoursRecovered: number | null;
  lessonsDelivered: number | null;
  bureaucracyEliminated: number | null;
}

interface ActivityEntry {
  id: string;
  description: string;
  date: Date;
  amount: number;
  type: 'debit' | 'credit';
}

interface UsageData {
  powers: PowersData;
  dashboard: LifeDashboard;
  activities: ActivityEntry[];
  userLevel: number | null;
  levelTitle: string;
  weeklyUsage: number[] | null;
  hasRealData: boolean;
}

const INSPIRATIONAL_MESSAGES = [
  "Você já recuperou o equivalente a 2 fins de semana este mês. Aproveite sua folga!",
  "Seu tempo é precioso. Deixe a burocracia com a gente.",
  "Professores como você merecem focar no que importa: ensinar.",
  "Cada minuto economizado é um sorriso a mais na sala de aula.",
  "A educação transforma. Sua energia também.",
];

const useCountUp = (end: number, duration: number = 1500, startOnMount: boolean = true) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  
  useEffect(() => {
    if (!startOnMount || hasStarted) return;
    setHasStarted(true);
    
    const startTime = Date.now();
    const startValue = 0;
    
    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + (end - startValue) * easeOut);
      
      setCount(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [end, duration, startOnMount, hasStarted]);
  
  return count;
};

const CircularProgress: React.FC<{
  current: number;
  max: number;
  size?: number;
  strokeWidth?: number;
}> = ({ current, max, size = 140, strokeWidth = 10 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(current / max, 1);
  const offset = circumference - (progress * circumference);
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 107, 0, 0.15)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#powerGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: 'drop-shadow(0 0 8px rgba(255, 107, 0, 0.5))',
          }}
        />
        <defs>
          <linearGradient id="powerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B00" />
            <stop offset="50%" stopColor="#FF8C40" />
            <stop offset="100%" stopColor="#FFB366" />
          </linearGradient>
        </defs>
      </svg>
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ filter: 'drop-shadow(0 0 20px rgba(255, 107, 0, 0.3))' }}
      >
        <Zap className="w-6 h-6 text-[#FF6B00] mb-1" />
        <span className="text-2xl font-bold text-white">{current}</span>
        <span className="text-xs text-gray-400">/{max}</span>
      </div>
    </div>
  );
};

const LifeStatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number | null;
  suffix: string;
  accentColor: string;
  delay?: number;
}> = ({ icon, label, value, suffix, accentColor, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const hasValue = value !== null && value !== undefined;
  const animatedValue = useCountUp(isVisible && hasValue ? value : 0, 1800);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group"
      style={{
        background: `linear-gradient(135deg, ${accentColor}08 0%, ${accentColor}03 100%)`,
        border: `1px solid ${accentColor}20`,
      }}
    >
      <div 
        className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10 group-hover:opacity-20 transition-opacity"
        style={{ background: accentColor }}
      />
      <div className="flex items-start gap-4">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: `linear-gradient(135deg, ${accentColor}25 0%, ${accentColor}10 100%)`,
            boxShadow: `0 4px 15px ${accentColor}20`,
          }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide">
            {label}
          </p>
          <div className="flex items-baseline gap-1">
            <span 
              className="text-3xl font-bold"
              style={{ 
                color: hasValue ? 'white' : '#6B7280',
                textShadow: hasValue ? `0 0 30px ${accentColor}40` : 'none',
              }}
            >
              {hasValue ? animatedValue : '--'}
            </span>
            {hasValue && <span className="text-sm text-gray-400">{suffix}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivityItem: React.FC<{ activity: ActivityEntry; isLast: boolean }> = ({ activity, isLast }) => {
  const isCredit = activity.type === 'credit';
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return `Hoje, ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (days === 1) {
      return `Ontem, ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    }
  };
  
  return (
    <div 
      className={`flex items-center gap-4 py-4 ${!isLast ? 'border-b border-white/5' : ''}`}
    >
      <div 
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          isCredit 
            ? 'bg-emerald-500/15 text-emerald-400' 
            : 'bg-orange-500/15 text-orange-400'
        }`}
      >
        {isCredit ? <Plus className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {activity.description}
        </p>
        <p className="text-xs text-gray-500">
          {formatDate(activity.date)}
        </p>
      </div>
      <span 
        className={`text-base font-bold ${
          isCredit ? 'text-emerald-400' : 'text-orange-400'
        }`}
      >
        {isCredit ? '+' : '-'}{Math.abs(activity.amount)}
      </span>
    </div>
  );
};

const WeeklyChart: React.FC<{ data: number[] | null }> = ({ data }) => {
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-gray-500 text-sm">
        Dados de uso ainda não disponíveis
      </div>
    );
  }
  
  const maxValue = Math.max(...data, 1);
  
  return (
    <div className="flex items-end justify-between gap-2 h-24 px-2">
      {data.map((value, index) => {
        const height = Math.max((value / maxValue) * 100, 8);
        return (
          <div key={index} className="flex flex-col items-center gap-2 flex-1">
            <div 
              className="w-full rounded-t-lg transition-all duration-500 hover:opacity-80"
              style={{
                height: `${height}%`,
                background: `linear-gradient(180deg, #FF6B00 0%, #FF8C40 100%)`,
                boxShadow: value > 0 ? '0 0 10px rgba(255, 107, 0, 0.3)' : 'none',
                opacity: value > 0 ? 1 : 0.3,
              }}
            />
            <span className="text-[10px] text-gray-500 font-medium">
              {days[index]}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export const SeuUsoSection: React.FC = () => {
  const colors = MODAL_CONFIG.colors.dark;
  const [isLoading, setIsLoading] = useState(true);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [inspirationalMessage, setInspirationalMessage] = useState('');

  useEffect(() => {
    setInspirationalMessage(
      INSPIRATIONAL_MESSAGES[Math.floor(Math.random() * INSPIRATIONAL_MESSAGES.length)]
    );
    
    const loadUsageData = async () => {
      setIsLoading(true);
      try {
        const profile = await profileService.getCurrentUserProfile();
        
        const profileData = profile as any || {};
        
        let activityCount: number | null = null;
        try {
          const storedActivities = localStorage.getItem('chosenActivities');
          if (storedActivities) {
            const parsed = JSON.parse(storedActivities);
            const count = parsed?.state?.activities?.length;
            if (typeof count === 'number') {
              activityCount = count;
            }
          }
        } catch (e) {
          console.error("Erro ao contar atividades:", e);
        }

        const currentPowers = typeof profileData.credits === 'number' 
          ? profileData.credits 
          : (typeof profileData.powers === 'number' ? profileData.powers : null);
        const dailyPowers = 300;
        
        const realActivities: ActivityEntry[] = [];
        try {
          const storedHistory = localStorage.getItem('powerHistory');
          if (storedHistory) {
            const history = JSON.parse(storedHistory);
            if (Array.isArray(history)) {
              history.slice(0, 10).forEach((item: any, index: number) => {
                if (item.description && typeof item.amount === 'number') {
                  realActivities.push({
                    id: item.id || String(index),
                    description: item.description,
                    date: new Date(item.date || Date.now()),
                    amount: Math.abs(item.amount),
                    type: item.amount >= 0 ? 'credit' : 'debit',
                  });
                }
              });
            }
          }
        } catch (e) {
          console.error("Erro ao carregar histórico de powers:", e);
        }

        const hasActivities = activityCount !== null && activityCount > 0;
        const userLevel = hasActivities ? Math.min(10, Math.floor(activityCount / 5) + 1) : null;

        const data: UsageData = {
          powers: {
            current: currentPowers,
            daily: dailyPowers,
            total: typeof profileData.total_powers === 'number' ? profileData.total_powers : null,
          },
          dashboard: {
            hoursRecovered: hasActivities ? activityCount * 2.5 : null,
            lessonsDelivered: activityCount,
            bureaucracyEliminated: hasActivities ? Math.floor(activityCount * 1.5) : null,
          },
          activities: realActivities,
          userLevel: userLevel,
          levelTitle: userLevel ? getLevelTitle(userLevel) : 'Iniciante',
          weeklyUsage: null,
          hasRealData: hasActivities || currentPowers !== null || realActivities.length > 0,
        };
        
        setUsageData(data);
      } catch (error) {
        console.error("Erro ao carregar dados de uso:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsageData();
  }, []);

  const getLevelTitle = (level: number): string => {
    const titles: Record<number, string> = {
      1: 'Iniciante',
      2: 'Explorador',
      3: 'Praticante',
      4: 'Especialista',
      5: 'Mestre do Tempo',
      6: 'Guardião da Educação',
      7: 'Pioneiro',
      8: 'Visionário',
      9: 'Lenda',
      10: 'Transcendente',
    };
    return titles[level] || 'Professor';
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col gap-6 animate-pulse">
        <div className="flex items-center gap-6">
          <div className="w-36 h-36 rounded-full bg-gray-700/30" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-40 bg-gray-700/30 rounded" />
            <div className="h-4 w-56 bg-gray-700/30 rounded" />
            <div className="h-10 w-48 bg-gray-700/30 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-700/20 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!usageData) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-400">Não foi possível carregar os dados de uso.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pr-1 custom-scrollbar">
      <div 
        className="rounded-3xl p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.08) 0%, rgba(255, 140, 64, 0.03) 100%)',
          border: '1px solid rgba(255, 107, 0, 0.15)',
        }}
      >
        <div className="flex items-center gap-6">
          <CircularProgress 
            current={usageData.powers.current ?? 0} 
            max={usageData.powers.daily}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-bold text-amber-400 uppercase tracking-wide">
                {usageData.userLevel !== null ? `Nível ${usageData.userLevel}` : 'Novo Usuário'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">
              {usageData.levelTitle}
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Powers diários renovam às 21:00
            </p>
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #FF6B00 0%, #FF8C40 100%)',
                boxShadow: '0 4px 20px rgba(255, 107, 0, 0.35)',
              }}
            >
              <Sparkles className="w-4 h-4" />
              Recarregar Powers
            </button>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Dashboard de Vida
        </h4>
        <div className="space-y-3">
          <LifeStatCard
            icon={<Clock className="w-6 h-6 text-cyan-400" />}
            label="Horas Recuperadas"
            value={usageData.dashboard.hoursRecovered !== null 
              ? Math.floor(usageData.dashboard.hoursRecovered) 
              : null}
            suffix={usageData.dashboard.hoursRecovered !== null 
              ? `h ${Math.floor((usageData.dashboard.hoursRecovered % 1) * 60)}min`
              : ''}
            accentColor="#06B6D4"
            delay={0}
          />
          <LifeStatCard
            icon={<BookOpen className="w-6 h-6 text-violet-400" />}
            label="Aulas Entregues"
            value={usageData.dashboard.lessonsDelivered}
            suffix="dossiês"
            accentColor="#8B5CF6"
            delay={200}
          />
          <LifeStatCard
            icon={<Shield className="w-6 h-6 text-emerald-400" />}
            label="Burocracia Eliminada"
            value={usageData.dashboard.bureaucracyEliminated}
            suffix="documentos"
            accentColor="#10B981"
            delay={400}
          />
        </div>
      </div>

      <div 
        className="rounded-2xl p-5"
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Uso Semanal
          </h4>
          <span className="text-xs text-gray-500">Últimos 7 dias</span>
        </div>
        <WeeklyChart data={usageData.weeklyUsage} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Extrato de Atividades
          </h4>
          {usageData.activities.length > 0 && (
            <button className="text-xs text-[#FF6B00] font-medium flex items-center gap-1 hover:underline">
              Ver tudo
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
        <div 
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          {usageData.activities.length > 0 ? (
            <div className="px-5">
              {usageData.activities.slice(0, 4).map((activity, index) => (
                <ActivityItem 
                  key={activity.id} 
                  activity={activity} 
                  isLast={index === Math.min(usageData.activities.length, 4) - 1}
                />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500">Nenhuma atividade registrada ainda</p>
              <p className="text-xs text-gray-600 mt-1">Suas ações aparecerão aqui</p>
            </div>
          )}
        </div>
      </div>

      <div 
        className="rounded-2xl p-5 mt-auto"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.06) 0%, rgba(139, 92, 246, 0.04) 100%)',
          border: '1px solid rgba(255, 107, 0, 0.1)',
        }}
      >
        <div className="flex items-start gap-4">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #FF6B00 0%, #8B5CF6 100%)',
            }}
          >
            <Gift className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-300 leading-relaxed">
              {inspirationalMessage}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeuUsoSection;
