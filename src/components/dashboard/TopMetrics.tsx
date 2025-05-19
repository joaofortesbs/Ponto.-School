import React from "react";
import { Card } from "@/components/ui/card";
import { Clock, GraduationCap, Trophy, Plus, Send } from "lucide-react";
import { CoinDialog } from "./CoinDialog";

const PokerChip = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Base orange circle */}
    <circle cx="12" cy="12" r="12" fill="#FF6B00" />

    {/* White segments */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
      <path
        key={angle}
        d="M12 0L14 3L12 3L10 3Z"
        fill="#FFFFFF"
        transform={`rotate(${angle} 12 12)`}
      />
    ))}

    {/* Dollar symbol */}
    <text
      x="12"
      y="12"
      textAnchor="middle"
      dominantBaseline="central"
      fill="#FFFFFF"
      style={{
        font: "bold 10px Arial",
      }}
    >
      $
    </text>
  </svg>
);

interface TopMetricsProps {
  studyTime?: {
    hours: number;
    percentageChange: number;
  };
  completedClasses?: number;
  ranking?: number;
  points?: number;
}

const TopMetrics = ({
  studyTime = { hours: 32, percentageChange: 1.2 },
  completedClasses = 24,
  ranking = 42,
  points = 1250,
}: TopMetricsProps) => {
  // Dados de estudo removidos
  return (
    <div className="grid grid-cols-4 gap-4 w-full max-w-[1192px] mx-auto">
      {/* Study Time */}
      <Card className="p-4 bg-white dark:bg-[#0A2540] border-brand-border dark:border-white/10 transition-all duration-300 hover:scale-[1.02] cursor-pointer group">
        <div className="flex items-center justify-between mb-2">
          <Clock className="h-5 w-5 text-brand-primary" />
          <span className="text-xs text-brand-primary">
            +{studyTime.percentageChange}%
          </span>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-brand-muted dark:text-white/60">
            Tempo de estudo
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-brand-black dark:text-white group-hover:text-brand-primary transition-colors">
              {studyTime.hours}
            </span>
            <span className="text-sm text-brand-muted dark:text-white/60">
              horas
            </span>
          </div>
        </div>
      </Card>
      {/* Completed Classes */}
      <Card className="p-4 bg-white dark:bg-[#0A2540] border-brand-border dark:border-white/10 transition-all duration-300 hover:scale-[1.02] cursor-pointer group">
        <div className="flex items-center justify-between mb-2">
          <GraduationCap className="h-5 w-5 text-brand-primary" />
        </div>
        <div className="space-y-1">
          <p className="text-sm text-brand-muted dark:text-white/60">
            Aulas concluídas
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-brand-black dark:text-white group-hover:text-brand-primary transition-colors">
              {completedClasses}
            </span>
            <span className="text-sm text-brand-muted dark:text-white/60">
              aulas
            </span>
          </div>
        </div>
      </Card>
      {/* Ranking */}
      <Card className="p-4 bg-white dark:bg-[#0A2540] border-brand-border dark:border-white/10 transition-all duration-300 hover:scale-[1.02] cursor-pointer group">
        <div className="flex items-center justify-between mb-2">
          <Trophy className="h-5 w-5 text-brand-primary" />
        </div>
        <div className="space-y-1">
          <p className="text-sm text-brand-muted dark:text-white/60">
            Posição ranking
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-brand-black dark:text-white group-hover:text-brand-primary transition-colors">
              #{ranking}
            </span>
            <span className="text-sm text-brand-muted dark:text-white/60">
              / ranking
            </span>
          </div>
        </div>
      </Card>
      {/* Points */}
      <Card
        className="p-4 bg-white dark:bg-[#0A2540] border-brand-border dark:border-white/10 transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
        onClick={() => (window.location.href = "/wallet")}
      >
        <div className="flex items-center justify-between mb-2">
          <PokerChip />
          <div className="flex gap-1">
            <CoinDialog
              type="recharge"
              onSubmit={(amount) => console.log("Recharge:", amount)}
            />
            <CoinDialog
              type="send"
              onSubmit={(amount) => console.log("Send:", amount)}
            />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-brand-muted dark:text-white/60">
            School Points
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-brand-black dark:text-white group-hover:text-[#FFD700] transition-colors">
              {points}
            </span>
            <span className="text-sm text-brand-muted dark:text-white/60">
              sp
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TopMetrics;