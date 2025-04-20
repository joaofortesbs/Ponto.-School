import React from "react";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AssistantCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onButtonClick?: () => void;
  className?: string;
  isPopular?: boolean;
}

const AssistantCard = ({
  icon,
  title,
  description,
  buttonText,
  onButtonClick,
  className = "",
  isPopular = false,
}: AssistantCardProps) => {
  return (
    <div className={`relative ${isPopular ? 'enhanced-glow-card' : ''}`}>
      <Card
        className={`bg-[#001427] border border-[#29335C]/30 p-5 h-full flex flex-col ${className} relative overflow-hidden transition-all duration-300 hover:shadow-lg`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="h-12 w-12 bg-[#0043CE]/10 rounded-full flex items-center justify-center">
            {icon}
          </div>
          {isPopular && (
            <Badge className="bg-[#4870FF] text-white font-medium px-3 py-1">
              Popular
            </Badge>
          )}
        </div>

        <h3 className="text-xl font-semibold text-white mt-4 mb-2">
          {title}
        </h3>

        <p className="text-[#E0E1DD]/70 mb-6 flex-grow">
          {description}
        </p>

        <button
          onClick={onButtonClick}
          className="flex items-center justify-center w-full py-3 px-4 bg-gradient-to-r from-[#3B82F6] to-[#4870FF] text-white rounded-lg hover:from-[#2563EB] hover:to-[#3B62E0] transition-all duration-300"
        >
          {buttonText} <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </Card>
    </div>
  );
};

export default AssistantCard;