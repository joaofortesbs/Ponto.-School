import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  Clock, 
  BookOpen, 
  Award, 
  TrendingUp, 
  Calendar,
  Zap,
  Target,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { MODAL_CONFIG } from "../SidebarModal";
import { profileService } from "@/services/profileService";

interface UsageStats {
  totalHoursUsed: number | null;
  activitiesCreated: number | null;
  lessonsCompleted: number | null;
  currentStreak: number | null;
  longestStreak: number | null;
  memberSince: string | null;
  planType: string | null;
  schoolPoints: number | null;
}

const SEU_USO_CONFIG = {
  cards: {
    borderRadius: 16,
    padding: 20,
  },
  statCard: {
    minHeight: 100,
  },
} as const;

export const SeuUsoSection: React.FC = () => {
  const colors = MODAL_CONFIG.colors.dark;
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [isNewUser, setIsNewUser] = useState(true);

  useEffect(() => {
    const loadUsageStats = async () => {
      setIsLoading(true);
      try {
        const profile = await profileService.getCurrentUserProfile();
        
        if (profile) {
          const profileData = profile as any;
          
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

          const memberDate = profile.created_at ? new Date(profile.created_at) : null;
          const formattedDate = memberDate 
            ? memberDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
            : null;

          const streakAtual = profileData.streak_atual || profileData.current_streak;
          const maiorStreak = profileData.maior_streak || profileData.longest_streak;
          const pontos = profileData.school_points || profileData.pontos_school;

          const currentStats: UsageStats = {
            totalHoursUsed: null,
            activitiesCreated: activityCount,
            lessonsCompleted: null,
            currentStreak: typeof streakAtual === 'number' ? streakAtual : null,
            longestStreak: typeof maiorStreak === 'number' ? maiorStreak : null,
            memberSince: formattedDate,
            planType: profile.plan_type || null,
            schoolPoints: typeof pontos === 'number' ? pontos : null,
          };

          setStats(currentStats);
          
          const hasAnyData = 
            (activityCount !== null && activityCount > 0) ||
            (currentStats.currentStreak !== null && currentStats.currentStreak > 0) ||
            (currentStats.schoolPoints !== null && currentStats.schoolPoints > 0);
          
          setIsNewUser(!hasAnyData);
        } else {
          setIsNewUser(true);
        }
      } catch (error) {
        console.error("Erro ao carregar estatísticas de uso:", error);
        setIsNewUser(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsageStats();
  }, []);

  const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | number | null;
    subLabel?: string;
    accentColor?: string;
  }> = ({ icon, label, value, subLabel, accentColor = '#FF6B00' }) => {
    const isEmpty = value === null || value === undefined;
    return (
    <div
      className="flex flex-col justify-between transition-all duration-200 hover:scale-[1.02]"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: `${SEU_USO_CONFIG.cards.borderRadius}px`,
        padding: `${SEU_USO_CONFIG.cards.padding}px`,
        minHeight: `${SEU_USO_CONFIG.statCard.minHeight}px`,
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${accentColor}20 0%, ${accentColor}10 100%)`,
          }}
        >
          {icon}
        </div>
        <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>
          {label}
        </span>
      </div>
      <div>
        <span 
          className="text-2xl font-bold"
          style={{ color: isEmpty ? colors.textSecondary : colors.textPrimary }}
        >
          {isEmpty ? '--' : value}
        </span>
        {subLabel && !isEmpty && (
          <span className="text-xs ml-2" style={{ color: colors.textSecondary }}>
            {subLabel}
          </span>
        )}
      </div>
    </div>
  );
  };

  const EmptyStateCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    actionLabel?: string;
    accentColor?: string;
  }> = ({ icon, title, description, actionLabel, accentColor = '#FF6B00' }) => (
    <div
      className="flex flex-col items-center justify-center text-center p-6"
      style={{
        backgroundColor: `${accentColor}08`,
        borderRadius: `${SEU_USO_CONFIG.cards.borderRadius}px`,
        border: `1px dashed ${accentColor}30`,
      }}
    >
      <div 
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{
          background: `linear-gradient(135deg, ${accentColor}15 0%, ${accentColor}08 100%)`,
        }}
      >
        {icon}
      </div>
      <h4 className="text-base font-semibold mb-2" style={{ color: colors.textPrimary }}>
        {title}
      </h4>
      <p className="text-sm mb-4 max-w-[280px]" style={{ color: colors.textSecondary }}>
        {description}
      </p>
      {actionLabel && (
        <button
          className="flex items-center gap-1 text-sm font-medium transition-all duration-200 hover:gap-2"
          style={{ color: accentColor }}
        >
          {actionLabel}
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gray-700 rounded-xl animate-pulse" />
            <div>
              <div className="h-6 w-24 bg-gray-700 rounded animate-pulse mb-1" />
              <div className="h-4 w-48 bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-700/30 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #FF6B00 0%, #FF8C40 100%)',
            }}
          >
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
              Seu Uso
            </h2>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              {isNewUser 
                ? "Comece a usar a plataforma para ver suas estatísticas"
                : "Acompanhe seu progresso na plataforma"
              }
            </p>
          </div>
        </div>
      </div>

      {stats && (stats.memberSince || stats.planType) && (
        <div 
          className="flex items-center gap-3 mb-6 px-4 py-3 rounded-xl"
          style={{
            backgroundColor: 'rgba(255, 107, 0, 0.08)',
            border: '1px solid rgba(255, 107, 0, 0.15)',
          }}
        >
          {stats.memberSince && (
            <>
              <Calendar className="w-5 h-5 text-[#FF6B00]" />
              <span className="text-sm" style={{ color: colors.textSecondary }}>
                Membro desde <strong style={{ color: colors.textPrimary }}>{stats.memberSince}</strong>
              </span>
            </>
          )}
          <div className="flex-1" />
          {stats.planType && (
            <span 
              className="px-3 py-1 rounded-full text-xs font-medium uppercase"
              style={{
                backgroundColor: stats.planType === 'premium' ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255, 107, 0, 0.15)',
                color: stats.planType === 'premium' ? '#FFD700' : '#FF6B00',
              }}
            >
              {stats.planType}
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard
          icon={<Clock className="w-5 h-5 text-[#3B82F6]" />}
          label="Tempo de uso"
          value={stats?.totalHoursUsed}
          subLabel="horas"
          accentColor="#3B82F6"
        />
        <StatCard
          icon={<BookOpen className="w-5 h-5 text-[#10B981]" />}
          label="Atividades criadas"
          value={stats?.activitiesCreated}
          accentColor="#10B981"
        />
        <StatCard
          icon={<Zap className="w-5 h-5 text-[#F59E0B]" />}
          label="Sequência atual"
          value={stats?.currentStreak}
          subLabel="dias"
          accentColor="#F59E0B"
        />
        <StatCard
          icon={<Award className="w-5 h-5 text-[#8B5CF6]" />}
          label="School Points"
          value={stats?.schoolPoints}
          subLabel="pts"
          accentColor="#8B5CF6"
        />
      </div>

      {isNewUser && (
        <div className="flex-1">
          <EmptyStateCard
            icon={<Sparkles className="w-7 h-7 text-[#FF6B00]" />}
            title="Comece sua jornada!"
            description="Use o School Power para criar sua primeira atividade e começar a acompanhar seu progresso aqui."
            actionLabel="Criar primeira atividade"
            accentColor="#FF6B00"
          />
        </div>
      )}

      {!isNewUser && stats && (
        <div 
          className="mt-auto p-4 rounded-xl"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-[#10B981]" />
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                Continue assim!
              </p>
              <p className="text-xs" style={{ color: colors.textSecondary }}>
                Você está no caminho certo para alcançar seus objetivos.
              </p>
            </div>
            <Target className="w-8 h-8 text-[#FF6B00]/30" />
          </div>
        </div>
      )}
    </div>
  );
};

export default SeuUsoSection;
