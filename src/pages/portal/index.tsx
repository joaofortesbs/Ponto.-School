
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Bell } from "lucide-react";

export default function PortalPage() {
  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] p-6 space-y-6 transition-colors duration-300">
      <Card className="w-full bg-white dark:bg-[#0A2540] border-brand-border dark:border-white/10 overflow-hidden">
        {/* Header com gradiente laranja */}
        <div className="relative overflow-hidden rounded-t-xl bg-gradient-to-r from-[#FF6B00] to-[#FF8736] p-6 text-white">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=1932&auto=format&fit=crop')] opacity-10 bg-cover bg-center" />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#FF6B00]/80 to-[#FF8736]/80" />
          
          {/* Ícone da carteira no canto superior direito */}
          <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">
                Portal em Desenvolvimento
              </h3>
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="p-6 space-y-6 bg-[#29335C] text-white">
          <p className="text-sm text-white/80 leading-relaxed">
            Estamos trabalhando para criar um espaço onde você poderá gerenciar suas moedas, fazer transferências e acompanhar seu histórico financeiro na plataforma.
          </p>

          {/* Seção de informações */}
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-white">Lançamento Previsto</h4>
              <p className="text-xs text-white/60">Em breve teremos novidades!</p>
            </div>
          </div>

          {/* Botão de notificações */}
          <Button 
            className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-medium py-3 rounded-lg transition-all duration-300 hover:shadow-lg active:scale-[0.98]"
            onClick={() => {
              alert("Você será notificado quando o Portal estiver disponível!");
            }}
          >
            <Bell className="h-4 w-4 mr-2" />
            Ativar Notificações
          </Button>
        </div>
      </Card>
    </div>
  );
}
