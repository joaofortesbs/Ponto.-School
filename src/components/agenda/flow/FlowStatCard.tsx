import React from "react";
import { LucideIcon } from "lucide-react";

interface FlowStatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
}

const FlowStatCard: React.FC<FlowStatCardProps> = ({
  icon,
  title,
  value,
  subtitle,
}) => {
  return (
    <div className="bg-[#F8F9FA] dark:bg-[#29335C]/30 rounded-lg p-4 border border-[#FF6B00]/10">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <h5 className="text-sm font-medium text-[#29335C] dark:text-white">
          {title}
        </h5>
      </div>
      <p className="text-2xl font-bold text-[#FF6B00]">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
    </div>
  );
};

export default FlowStatCard;
