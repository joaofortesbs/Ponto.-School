import React from "react";
import { MODAL_CONFIG } from "../SidebarModal";

interface PowersData {
  totalPowers: number;
  usedPowers: number;
  maxPowers: number;
  dailyRenewable: number;
  planType: string;
}

interface CardDeUsoProps {
  powersData: PowersData;
  isLoading?: boolean;
}

const CARD_DE_USO_CONFIG = {
  borderRadius: 24,
  borderColor: '#0c1334',
  backgroundColor: '#0c1334',
  progressCircle: {
    size: 120,
    strokeWidth: 8,
  },
} as const;

const ProgressCircle: React.FC<{
  current: number;
  max: number;
  size?: number;
  strokeWidth?: number;
}> = ({ current, max, size = 120, strokeWidth = 8 }) => {
  const colors = MODAL_CONFIG.colors.dark;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((current / max) * 100, 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(255, 107, 0, 0.2)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#FF6B00"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span 
          className="text-lg font-semibold"
          style={{ color: colors.textPrimary }}
        >
          {current}/{max}
        </span>
      </div>
    </div>
  );
};

const CardDeUsoSkeleton: React.FC = () => {
  return (
    <div 
      className="rounded-3xl p-6 animate-pulse"
      style={{
        backgroundColor: CARD_DE_USO_CONFIG.backgroundColor,
        border: `1px solid ${CARD_DE_USO_CONFIG.borderColor}`,
        borderRadius: `${CARD_DE_USO_CONFIG.borderRadius}px`,
      }}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="h-8 w-20 bg-gray-700 rounded" />
        <div className="h-10 w-24 bg-gray-700 rounded-full" />
      </div>
      <div className="border-t border-dashed border-orange-500/50 my-4" />
      <div className="flex items-center gap-8">
        <div className="w-28 h-28 bg-gray-700 rounded-full" />
        <div className="flex-1 space-y-4">
          <div className="h-6 w-32 bg-gray-700 rounded" />
          <div className="h-6 w-48 bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
};

export const CardDeUso: React.FC<CardDeUsoProps> = ({ powersData, isLoading = false }) => {
  const colors = MODAL_CONFIG.colors.dark;

  if (isLoading) {
    return <CardDeUsoSkeleton />;
  }

  return (
    <div 
      className="rounded-3xl overflow-hidden"
      style={{
        backgroundColor: CARD_DE_USO_CONFIG.backgroundColor,
        border: `1px solid ${CARD_DE_USO_CONFIG.borderColor}`,
        borderRadius: `${CARD_DE_USO_CONFIG.borderRadius}px`,
      }}
    >
      <div className="p-5 pb-4">
        <div className="flex justify-between items-center">
          <h2 
            className="text-2xl font-bold"
            style={{ color: colors.textPrimary }}
          >
            {powersData.planType}
          </h2>
          <button
            disabled
            className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 opacity-50 cursor-not-allowed"
            style={{
              backgroundColor: 'transparent',
              border: `2px solid #FF6B00`,
              color: '#FF6B00',
            }}
          >
            Atualizar
          </button>
        </div>
      </div>

      <div 
        className="mx-5 mb-4"
        style={{
          borderTop: '2px dashed rgba(255, 107, 0, 0.4)',
        }}
      />

      <div className="px-5 pb-6">
        <div className="flex items-center gap-6">
          <ProgressCircle 
            current={powersData.usedPowers} 
            max={powersData.maxPowers}
            size={CARD_DE_USO_CONFIG.progressCircle.size}
            strokeWidth={CARD_DE_USO_CONFIG.progressCircle.strokeWidth}
          />

          <div className="flex-1 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 
                  className="text-base font-semibold"
                  style={{ color: colors.textPrimary }}
                >
                  Powers gastos
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  Powers gratuitos
                </p>
              </div>
              <div className="text-right">
                <span 
                  className="text-base font-semibold"
                  style={{ color: colors.textPrimary }}
                >
                  {powersData.usedPowers}
                </span>
                <p 
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  300
                </p>
              </div>
            </div>

            <div className="flex justify-between items-start">
              <div>
                <h3 
                  className="text-base font-semibold"
                  style={{ color: colors.textPrimary }}
                >
                  Powers diários renováveis
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  Atualize para 300 às 19:00 todos os dias
                </p>
              </div>
              <div className="text-right">
                <span 
                  className="text-base font-semibold"
                  style={{ color: colors.textPrimary }}
                >
                  {powersData.dailyRenewable}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDeUso;
