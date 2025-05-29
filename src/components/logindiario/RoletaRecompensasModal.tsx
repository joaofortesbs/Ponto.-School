
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Gift, X, Calendar, Clock, Trophy, RotateCcw, Coins } from "lucide-react";
import { motion } from "framer-motion";
import { RegenerationService } from "@/services/regenerationService";
import { supabase } from "@/lib/supabase";

interface RoletaRecompensasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Recompensa {
  id: string;
  nome: string;
  icone: string;
  chance: number;
}

const GRUPOS_RECOMPENSAS = {
  0: { // Grupo inicial
    custo: 25,
    recompensas: [
      { id: "1", nome: "100 SPs", icone: "💰", chance: 25 },
      { id: "2", nome: "250 XPs", icone: "⭐", chance: 45 },
      { id: "3", nome: "Avatar Raro", icone: "👤", chance: 15 },
      { id: "4", nome: "Material Exclusivo", icone: "📚", chance: 5 },
      { id: "5", nome: "999 SPs", icone: "💎", chance: 3 },
      { id: "6", nome: "Epictus Turbo", icone: "🚀", chance: 7 }
    ]
  },
  1: { // Após 1ª regeneração
    custo: 50,
    recompensas: [
      { id: "1", nome: "3 Avatares Raros", icone: "👥", chance: 5 },
      { id: "2", nome: "+3 Giros Grátis", icone: "🎲", chance: 15 },
      { id: "3", nome: "Kit de Estudos ENEM", icone: "📖", chance: 3 },
      { id: "4", nome: "99 SPs", icone: "💰", chance: 25 },
      { id: "5", nome: "50 XP", icone: "⭐", chance: 45 },
      { id: "6", nome: "Giro Especial", icone: "🎰", chance: 7 }
    ]
  },
  2: { // Após 2ª regeneração
    custo: 99,
    recompensas: [
      { id: "1", nome: "+50% Chance Aumentada", icone: "📈", chance: 7 },
      { id: "2", nome: "Kit Materiais", icone: "🎁", chance: 3 },
      { id: "3", nome: "199 SPs", icone: "💰", chance: 25 },
      { id: "4", nome: "75 XP", icone: "⭐", chance: 45 },
      { id: "5", nome: "15% Desconto Mercado", icone: "🛒", chance: 5 },
      { id: "6", nome: "+3 Giros Grátis", icone: "🎲", chance: 15 }
    ]
  },
  3: { // Após 3ª regeneração
    custo: 0, // Não há mais regeneração possível
    recompensas: [
      { id: "1", nome: "299 SPs", icone: "💰", chance: 25 },
      { id: "2", nome: "150 XP", icone: "⭐", chance: 45 },
      { id: "3", nome: "Giro Especial", icone: "🎰", chance: 15 },
      { id: "4", nome: "Conquistas Especiais", icone: "🏆", chance: 7 },
      { id: "5", nome: "Evento Exclusivo", icone: "🎉", chance: 3 },
      { id: "6", nome: "1 Badge Raro", icone: "🎖️", chance: 5 }
    ]
  }
};

const RoletaRecompensasModal: React.FC<RoletaRecompensasModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(0);
  const [regenerationCount, setRegenerationCount] = useState(0);
  const [userSPs, setUserSPs] = useState(0);
  const [resultadoGiro, setResultadoGiro] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [currentRecompensas, setCurrentRecompensas] = useState<Recompensa[]>([]);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    if (open) {
      loadUserData();
      loadRegenerationData();
    }
  }, [open]);

  useEffect(() => {
    const grupo = GRUPOS_RECOMPENSAS[currentGroup as keyof typeof GRUPOS_RECOMPENSAS];
    if (grupo) {
      setCurrentRecompensas(grupo.recompensas);
    }
  }, [currentGroup]);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('school_points')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUserSPs(profile.school_points || 0);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  };

  const loadRegenerationData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const regenData = await RegenerationService.getUserRegenerationData(user.id);
        if (regenData) {
          setRegenerationCount(regenData.regeneration_count);
          setCurrentGroup(regenData.current_group);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados de regeneração:', error);
    }
  };

  const handleRegenerate = async () => {
    if (regenerationCount >= 3) return;

    setIsRegenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const result = await RegenerationService.performRegeneration(user.id, userSPs);
        
        if (result.success) {
          setRegenerationCount(result.newRegenerationCount);
          setCurrentGroup(result.newCurrentGroup);
          setUserSPs(result.remainingSPs);
        } else {
          alert(result.error || 'Erro ao regenerar recompensas');
        }
      }
    } catch (error) {
      console.error('Erro na regeneração:', error);
      alert('Erro interno na regeneração');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSpin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setShowResult(false);

    // Seleciona uma recompensa baseada nas probabilidades
    const random = Math.random() * 100;
    let acumulado = 0;
    let recompensaSelecionada = currentRecompensas[0];

    for (const recompensa of currentRecompensas) {
      acumulado += recompensa.chance;
      if (random <= acumulado) {
        recompensaSelecionada = recompensa;
        break;
      }
    }

    // Simula o tempo de giro da roleta
    setTimeout(() => {
      setResultadoGiro(recompensaSelecionada.nome);
      setIsSpinning(false);
      setShowResult(true);
    }, 3000);
  };

  const canRegenerate = () => {
    if (regenerationCount >= 3) return false;
    const custoAtual = GRUPOS_RECOMPENSAS[currentGroup as keyof typeof GRUPOS_RECOMPENSAS]?.custo || 0;
    return userSPs >= custoAtual;
  };

  const getCustoProximaRegeneracao = () => {
    return GRUPOS_RECOMPENSAS[currentGroup as keyof typeof GRUPOS_RECOMPENSAS]?.custo || 0;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] bg-gradient-to-br from-[#001427] via-[#1a365d] to-[#2d5a87] border-[#FF6B00]/30 overflow-hidden">
        <div className="flex h-full">
          {/* Lado Esquerdo - Roleta */}
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              🎰 Roleta de Recompensas
            </h2>
            
            {/* Roleta Visual */}
            <div className="relative">
              <div 
                className={`w-64 h-64 rounded-full border-8 border-[#FF6B00] bg-gradient-to-br from-[#FF6B00]/20 to-[#FF8C40]/20 relative overflow-hidden ${
                  isSpinning ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: isSpinning ? '3s' : '0s' }}
              >
                {currentRecompensas.map((recompensa, index) => (
                  <div
                    key={recompensa.id}
                    className="absolute w-full h-full flex items-center justify-center text-white text-sm font-bold"
                    style={{
                      transform: `rotate(${(360 / currentRecompensas.length) * index}deg)`,
                      clipPath: `polygon(50% 50%, ${50 + 40 * Math.cos((360 / currentRecompensas.length) * index * Math.PI / 180)}% ${50 + 40 * Math.sin((360 / currentRecompensas.length) * index * Math.PI / 180)}%, ${50 + 40 * Math.cos((360 / currentRecompensas.length) * (index + 1) * Math.PI / 180)}% ${50 + 40 * Math.sin((360 / currentRecompensas.length) * (index + 1) * Math.PI / 180)}%)`
                    }}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">{recompensa.icone}</div>
                      <div className="text-xs">{recompensa.nome}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Ponteiro da Roleta */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[15px] border-r-[15px] border-b-[25px] border-l-transparent border-r-transparent border-b-[#FF6B00] z-10"></div>
            </div>

            {/* Botão de Girar */}
            <Button
              onClick={handleSpin}
              disabled={isSpinning}
              className="mt-8 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white px-8 py-3 text-lg font-bold"
            >
              {isSpinning ? "Girando..." : "🎰 Girar Roleta!"}
            </Button>
          </div>

          {/* Lado Direito - Informações */}
          <div className="w-80 border-l border-[#FF6B00]/30 p-6 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Painel de Controle</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Status do Usuário */}
            <div className="bg-[#FF6B00]/10 rounded-lg p-4 mb-6 border border-[#FF6B00]/30">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="h-5 w-5 text-[#FF6B00]" />
                <span className="text-white font-semibold">Seus SPs: {userSPs}</span>
              </div>
              <div className="text-sm text-gray-300">
                Regenerações hoje: {regenerationCount}/3
              </div>
            </div>

            {/* Recompensas Disponíveis */}
            <div className="bg-[#001427]/60 rounded-lg p-4 mb-6 border border-[#FF6B00]/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                    <Trophy className="w-3 h-3 text-white drop-shadow-sm" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">Recompensas Disponíveis</h3>
                </div>
                
                {regenerationCount < 3 && (
                  <Button
                    onClick={handleRegenerate}
                    disabled={!canRegenerate() || isRegenerating}
                    size="sm"
                    className="bg-[#FF6B00] hover:bg-[#FF8C40] text-white text-xs px-2 py-1"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    {isRegenerating ? "..." : `${getCustoProximaRegeneracao()} SP`}
                  </Button>
                )}
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {currentRecompensas.map((recompensa) => (
                  <div
                    key={recompensa.id}
                    className="flex items-center justify-between bg-[#FF6B00]/5 rounded p-2 border border-[#FF6B00]/10"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{recompensa.icone}</span>
                      <span className="text-xs text-white">{recompensa.nome}</span>
                    </div>
                    <span className="text-xs text-[#FF6B00] font-semibold">
                      {recompensa.chance}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Grupo Atual */}
            <div className="bg-[#FF6B00]/10 rounded-lg p-3 mb-4 border border-[#FF6B00]/30">
              <div className="text-sm text-white text-center">
                <div className="font-semibold">
                  {currentGroup === 0 && "🥇 Grupo Inicial"}
                  {currentGroup === 1 && "🥈 Após 1ª Regeneração"}
                  {currentGroup === 2 && "🥉 Após 2ª Regeneração"}
                  {currentGroup === 3 && "💎 Após 3ª Regeneração"}
                </div>
                {regenerationCount >= 3 && (
                  <div className="text-xs text-gray-300 mt-1">
                    Limite diário atingido
                  </div>
                )}
              </div>
            </div>

            {/* Informações Adicionais */}
            <div className="text-xs text-gray-400 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Calendar className="h-3 w-3" />
                <span>Reset diário à meia-noite</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Máximo 3 regenerações por dia</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Resultado */}
        {showResult && resultadoGiro && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] p-8 rounded-xl text-center max-w-md mx-4"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-white mb-2">Parabéns!</h3>
              <p className="text-xl text-white mb-6">
                Você ganhou: <strong>{resultadoGiro}</strong>
              </p>
              <Button
                onClick={() => setShowResult(false)}
                className="bg-white text-[#FF6B00] hover:bg-gray-100 font-semibold"
              >
                Continuar
              </Button>
            </motion.div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RoletaRecompensasModal;
