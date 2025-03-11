import React from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Brain,
  CheckSquare,
  Flame,
  TrendingUp,
  Zap,
} from "lucide-react";

interface AIRecommendation {
  id: number;
  priority: string;
  title: string;
  description: string;
  actions: {
    label: string;
    icon: React.ReactNode;
    variant: "outline" | "default";
  }[];
}

interface AIMentorProps {
  recommendations: AIRecommendation[];
}

const AIMentor: React.FC<AIMentorProps> = ({ recommendations }) => {
  return (
    <div className="bg-[#001427] text-white rounded-lg overflow-hidden shadow-md">
      <div className="bg-gradient-to-r from-[#00FFFF] to-[#4A89DC] p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          <h3 className="text-base font-bold text-white">
            O Mentor IA Recomenda
          </h3>
        </div>
        <div className="text-xs text-white/80">
          Recomendações personalizadas para você
        </div>
      </div>
      <div className="divide-y divide-[#29335C]/20">
        {recommendations.map((recommendation) => {
          // Get icon based on priority
          let PriorityIcon = Zap;
          let iconBgColor = "bg-[#FF6B00]/20";
          let iconColor = "text-[#FF6B00]";

          if (recommendation.priority === "medium") {
            PriorityIcon = TrendingUp;
            iconBgColor = "bg-[#4A89DC]/20";
            iconColor = "text-[#4A89DC]";
          } else if (recommendation.priority === "low") {
            PriorityIcon = Flame;
            iconBgColor = "bg-[#00FFFF]/20";
            iconColor = "text-[#00FFFF]";
          }

          return (
            <div
              key={recommendation.id}
              className="p-4 hover:bg-[#29335C]/10 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <div
                    className={`w-8 h-8 rounded-full ${iconBgColor} flex items-center justify-center`}
                  >
                    <PriorityIcon className={`h-4 w-4 ${iconColor}`} />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-white text-sm">
                    {recommendation.title}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">
                    {recommendation.description}
                  </p>
                  <div className="flex gap-2 mt-3">
                    {recommendation.actions.map((action, index) => (
                      <Button
                        key={index}
                        size="sm"
                        variant={action.variant}
                        className={
                          action.variant === "outline"
                            ? "h-7 text-xs border-[#29335C] bg-transparent text-white hover:bg-[#29335C]/30"
                            : "h-7 text-xs bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                        }
                      >
                        <span>{action.label}</span>
                        {action.variant === "default" && (
                          <ArrowRight className="h-3 w-3 ml-1" />
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AIMentor;
