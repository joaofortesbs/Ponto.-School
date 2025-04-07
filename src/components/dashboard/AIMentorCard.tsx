import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Brain, ArrowRight, Zap, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EpictusIACard = () => {
  const navigate = useNavigate();
  return (
    <Card className="w-full h-[420px] bg-white dark:bg-[#0A2540] border-none shadow-lg overflow-hidden rounded-xl relative group">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF6B00] to-[#FF9B50]"></div>
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#FF6B00]/10 blur-3xl group-hover:bg-[#FF6B00]/20 transition-all duration-700"></div>
      <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-[#FF6B00]/5 blur-3xl group-hover:bg-[#FF6B00]/10 transition-all duration-700"></div>

      <CardHeader className="flex flex-row items-center justify-between p-5 border-b border-gray-100 dark:border-[#29335C]/30">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-gradient-to-br from-[#FF6B00] to-[#FF9B50] shadow-md">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-[#001427] dark:text-white flex items-center">
              Epictus IA
              <span className="ml-2 text-xs py-0.5 px-2 bg-[#FF6B00]/10 text-[#FF6B00] dark:bg-[#FF6B00]/20 rounded-full font-medium">
                Premium
              </span>
            </CardTitle>
            <p className="text-sm text-[#64748B] dark:text-white/60">
              Seu assistente de estudos pessoal
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 flex flex-col h-[calc(100%-84px)]">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF6B00]/20 to-[#FF9B50]/10 flex items-center justify-center mb-5 shadow-inner relative group-hover:scale-105 transition-transform duration-500">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FF6B00]/30 to-[#FF9B50]/20 blur-md opacity-50 group-hover:opacity-80 transition-opacity duration-500"></div>
            <Sparkles className="h-10 w-10 text-[#FF6B00] dark:text-[#FF9B50] relative z-10" />
          </div>

          <h3 className="text-2xl font-bold text-[#001427] dark:text-white mb-3 group-hover:text-[#FF6B00] dark:group-hover:text-[#FF9B50] transition-colors duration-300">
            Assistente Inteligente
          </h3>

          <p className="text-sm text-[#64748B] dark:text-white/70 max-w-xs mx-auto mb-6 leading-relaxed">
            Tire dúvidas, receba explicações personalizadas e melhore seu
            desempenho com ajuda da IA avançada.
          </p>

          <div className="flex flex-col w-full gap-3">
            <Button
              className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] hover:from-[#FF9B50] hover:to-[#FF6B00] text-white border-none shadow-md transition-all duration-300 font-medium"
              onClick={() => navigate("/epictus-ia")}
            >
              Conversar com o Epictus IA{" "}
              <ArrowRight className="ml-2 h-4 w-4 animate-pulse" />
            </Button>

            <div className="flex justify-center gap-2 mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-[#64748B] dark:text-white/60 hover:text-[#FF6B00] dark:hover:text-[#FF9B50] hover:bg-[#FF6B00]/5 whitespace-nowrap"
              >
                <Zap className="h-3.5 w-3.5 mr-1 text-[#FF6B00]" />
                <span className="text-[#64748B] dark:text-white/60">
                  Planos de estudo
                </span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-[#64748B] dark:text-white/60 hover:text-[#FF6B00] dark:hover:text-[#FF9B50] hover:bg-[#FF6B00]/5 whitespace-nowrap"
              >
                <Star className="h-3.5 w-3.5 mr-1 text-[#FF6B00]" />
                <span className="text-[#64748B] dark:text-white/60">
                  Resumos
                </span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EpictusIACard;
