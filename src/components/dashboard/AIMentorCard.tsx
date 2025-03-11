import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Bot, ArrowRight } from "lucide-react";

const AIMentorCard = () => {
  return (
    <Card className="w-full h-[420px] bg-white dark:bg-[#001427]/20 border-none shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#E0E1DD]/20">
            <Bot className="h-5 w-5 text-[#001427] dark:text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-[#001427] dark:text-white">
              Mentor IA
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Seu assistente de estudos pessoal
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 flex flex-col h-[calc(100%-76px)]">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-[#29335C]/10 flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-[#29335C] dark:text-white" />
          </div>
          <h3 className="text-xl font-bold text-[#001427] dark:text-white mb-2">
            Assistente Inteligente
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
            Tire dúvidas, receba explicações personalizadas e melhore seu
            desempenho com ajuda da IA.
          </p>
          <Button className="bg-[#29335C] hover:bg-[#29335C]/90 text-white">
            Conversar com o Mentor IA <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIMentorCard;
