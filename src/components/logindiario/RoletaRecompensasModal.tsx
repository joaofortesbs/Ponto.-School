import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Gift, X, Calendar, Clock, Trophy } from "lucide-react";
import { motion } from "framer-motion";

interface RoletaRecompensasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SequenciaGirosCardProps {
  isSpinning: boolean;
  showResult: boolean;
}

interface RecompensasDisponiveisCardProps {
  currentPrizes: Array<{name: string; color: string; angle: number; icon: React.ReactNode; chance: number}>;
  onRegeneratePrizes: () => void;
  regenerationCount: number;
  userSPs: number;
}

const RecompensasDisponiveisCard: React.FC<RecompensasDisponiveisCardProps> = ({ 
  currentPrizes, 
  onRegeneratePrizes, 
  regenerationCount, 
  userSPs 
}) => {
  const getRegenerationCost = (count: number) => {
    if (count === 0) return 25;
    if (count === 1) return 50;
    if (count === 2) return 99;
    return 99; // Máximo
  };

  const cost = getRegenerationCost(regenerationCount);
  const canRegenerate = userSPs >= cost && regenerationCount < 3;

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, type: "spring", damping: 20 }}
      className="w-72 h-72 rounded-xl overflow-hidden relative bg-white/10 backdrop-blur-sm border border-orange-200/30 mt-4"
      style={{
        boxShadow: "0 4px 16px rgba(255, 107, 0, 0.1)"
      }}
    >
      {/* Efeito de brilho sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-100/5 via-transparent to-orange-200/5 pointer-events-none" />

      <div className="relative z-10 p-4 h-full flex flex-col">
        {/* Topo - Título e Botão de Regeneração */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* Ícone de troféu para recompensas */}
            <div className="w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg transform rotate-12">
              <Trophy className="w-3 h-3 text-white drop-shadow-sm" />
            </div>
            <h3 className="text-sm font-semibold text-white">Recompensas Disponíveis</h3>
          </div>

          {/* Botão de Regeneração */}
          <motion.button
            whileHover={canRegenerate ? { scale: 1.05 } : {}}
            whileTap={canRegenerate ? { scale: 0.95 } : {}}
            onClick={canRegenerate ? onRegeneratePrizes : undefined}
            disabled={!canRegenerate}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
              canRegenerate 
                ? 'bg-orange-500/20 hover:bg-orange-500/30 text-white border border-orange-300/30 cursor-pointer'
                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30 cursor-not-allowed opacity-50'
            }`}
            title={!canRegenerate ? (userSPs < cost ? "SPs insuficientes" : "Limite de regenerações atingido") : ""}
          >
            <motion.div
              animate={{ rotate: canRegenerate ? [0, 360] : 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </motion.div>
            <span>{cost} SPs</span>
          </motion.button>
        </div>

        {/* Grade de Recompensas */}
        <div className="flex-1 grid grid-cols-3 gap-3">
          {currentPrizes.map((prize, index) => (
            <motion.div
              key={`${prize.name}-${regenerationCount}-${index}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="relative bg-white/5 backdrop-blur-sm rounded-lg p-2 border border-orange-200/20 hover:border-orange-300/40 transition-all duration-200"
            >
              {/* Badge de Probabilidade */}
              <div className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-orange-300/50">
                {prize.chance}%
              </div>

              {/* Ícone da Recompensa */}
              <div className="flex items-center justify-center mb-1.5">
                <div className="w-6 h-6 flex items-center justify-center">
                  {prize.icon}
                </div>
              </div>

              {/* Nome da Recompensa */}
              <div className="text-center">
                <p className="text-[9px] text-white/90 font-medium leading-tight">
                  {prize.name.split(' ').map((word, i) => (
                    <span key={i} className="block">{word}</span>
                  ))}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const SequenciaGirosCard: React.FC<SequenciaGirosCardProps> = ({ isSpinning, showResult }) => {
  const [diasSequencia, setDiasSequencia] = React.useState(4); // Exemplo: 4 dias seguidos
  const [proximoGiroEm, setProximoGiroEm] = React.useState<string>("");
  const [jaGirouHoje, setJaGirouHoje] = React.useState(false);
  const [tempoRestante, setTempoRestante] = React.useState<{
    horas: number;
    minutos: number;
    segundos: number;
  }>({ horas: 0, minutos: 0, segundos: 0 });

  // Efeito para calcular tempo até próximo giro (meia-noite)
  React.useEffect(() => {
    const calcularProximoGiro = () => {
      const agora = new Date();
      const proximaMeiaNoite = new Date();
      proximaMeiaNoite.setDate(agora.getDate() + 1);
      proximaMeiaNoite.setHours(0, 0, 0, 0);

      const diferenca = proximaMeiaNoite.getTime() - agora.getTime();

      const horas = Math.floor(diferenca / (1000 * 60 * 60));
      const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
      const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);

      setTempoRestante({ horas, minutos, segundos });
    };

    // Calcular imediatamente
    calcularProximoGiro();

    // Atualizar a cada segundo se já girou hoje
    let intervalo: NodeJS.Timeout | null = null;
    if (jaGirouHoje) {
      intervalo = setInterval(calcularProximoGiro, 1000);
    }

    return () => {
      if (intervalo) clearInterval(intervalo);
    };
  }, [jaGirouHoje]);

  // Efeito para detectar quando o usuário girou a roleta
  React.useEffect(() => {
    if (showResult && !jaGirouHoje) {
      setJaGirouHoje(true);
      setDiasSequencia(prev => prev + 1); // Incrementa a sequência
    }
  }, [showResult, jaGirouHoje]);

  // Estado 1: Antes de girar (Contador de Dias)
  if (!jaGirouHoje) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring", damping: 20 }}
        className="w-72 h-32 rounded-xl overflow-hidden relative bg-white/10 backdrop-blur-sm border border-orange-200/30"
        style={{
          boxShadow: "0 4px 16px rgba(255, 107, 0, 0.1)"
        }}
      >
        {/* Efeito de brilho sutil */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100/5 via-transparent to-orange-200/5 pointer-events-none" />

        <div className="relative z-10 p-4 h-full flex flex-col justify-between">
          {/* Topo - Label e dias */}
          <div className="text-center">
            <p className="text-xs text-white/70 font-medium mb-1">
              Dias de sequência:
            </p>
            <motion.div
              key={diasSequencia}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="flex items-center justify-center gap-2 text-lg font-bold text-white"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <Calendar className="h-5 w-5 text-orange-300" />
              </motion.div>
              {diasSequencia} dias seguidos!
            </motion.div>
          </div>

          {/* Centro - Texto motivacional */}
          <div className="text-center flex-1 flex flex-col justify-center">
            <p className="text-xs text-white/80 font-medium">
              Continue a sequência!
            </p>
          </div>

          {/* Rodapé - Status */}
          <div className="text-center">
            <div className="bg-orange-500/20 backdrop-blur-sm rounded-lg px-2 py-1 border border-orange-300/20">
              <p className="text-xs text-white/90 font-medium">
                Gire hoje para manter!
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Estado 2: Após girar (Cronômetro)
  return (
    <motion.div
      initial={{ scale: 1.05, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, type: "spring", damping: 15 }}
      className="w-72 h-32 rounded-xl overflow-hidden relative bg-white/15 backdrop-blur-sm border border-orange-200/40"
      style={{
        boxShadow: "0 6px 20px rgba(255, 107, 0, 0.15)"
      }}
    >
      {/* Efeito de brilho sutil após giro */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-100/10 via-transparent to-orange-200/10 pointer-events-none" />

      <div className="relative z-10 p-4 h-full flex flex-col justify-between">
        {/* Topo - Mantém a sequência visível */}
        <div className="text-center">
          <p className="text-xs text-white/70 font-medium mb-1">
            Dias de sequência:
          </p>
          <motion.div
            animate={{ 
              scale: [1, 1.02, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center justify-center gap-2 text-lg font-bold text-white"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <Calendar className="h-5 w-5 text-orange-300" />
            </motion.div>
            {diasSequencia} dias seguidos!
          </motion.div>
        </div>

        {/* Centro - Cronômetro */}
        <div className="text-center flex-1 flex flex-col justify-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Clock className="h-4 w-4 text-orange-300" />
            </motion.div>
            <p className="text-xs text-white/80 font-medium">
              Próximo giro liberado em:
            </p>
          </div>

          {/* Cronômetro Digital */}
          <motion.div
            key={`${tempoRestante.horas}-${tempoRestante.minutos}-${tempoRestante.segundos}`}
            initial={{ scale: 1.05, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-orange-500/20 backdrop-blur-sm rounded-lg px-2 py-1 border border-orange-300/30"
          >
            <div className="text-sm font-mono font-bold text-white tracking-wider">
              {String(tempoRestante.horas).padStart(2, '0')}:
              {String(tempoRestante.minutos).padStart(2, '0')}:
              {String(tempoRestante.segundos).padStart(2, '0')}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const RoletaRecompensasModal: React.FC<RoletaRecompensasModalProps> = ({
  open,
  onOpenChange,
}) => {
  // Estados para a funcionalidade da roleta
  const [isSpinning, setIsSpinning] = React.useState(false);
  const [currentRotation, setCurrentRotation] = React.useState(0);
  const [selectedPrize, setSelectedPrize] = React.useState<string | null>(null);
  const [showResult, setShowResult] = React.useState(false);
  const [pinoBlinking, setPinoBlinking] = React.useState(false);
  const [pinoTilt, setPinoTilt] = React.useState(0); // Estado para inclinação do lápis
  const [pinoColor, setPinoColor] = React.useState('#FF6B00'); // Cor do pino
  const [activePoint, setActivePoint] = React.useState<number | null>(null); // Ponto ativo atual
  const [regenerationCount, setRegenerationCount] = React.useState(0);
  const [userSPs, setUserSPs] = React.useState(150); // Mock de SPs do usuário

  // Ref para áudio
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Grupos de recompensas por regeneração
  const prizeGroups = [
    // Grupo Inicial (Padrão) - Ordenado por probabilidade (maior para menor)
    [
      { name: "250 XPs", color: "#FFA366", angle: 240, chance: 45 },
      { name: "100 SPs", color: "#FF9933", angle: 180, chance: 25 },
      { name: "Avatar Raro", color: "#FF8C40", angle: 60, chance: 15 },
      { name: "Epictus Turbo", color: "#FF7A1A", angle: 300, chance: 7 },
      { name: "Material Exclusivo", color: "#FFB366", angle: 120, chance: 5 },
      { name: "999 SPs", color: "#FF6B00", angle: 0, chance: 3 },
    ],
    // Após 1ª Regeneração
    [
      { name: "50 XP", color: "#FF9933", angle: 180, chance: 45 },
      { name: "99 SPs", color: "#FFA366", angle: 240, chance: 25 },
      { name: "+3 Giros Grátis", color: "#FF7A1A", angle: 300, chance: 15 },
      { name: "Giro Especial", color: "#FF6B00", angle: 0, chance: 7 },
      { name: "3 Avatares Raros", color: "#FF8C40", angle: 60, chance: 5 },
      { name: "Kit de Estudos ENEM", color: "#FFB366", angle: 120, chance: 3 },
    ],
    // Após 2ª Regeneração
    [
      { name: "75 XP", color: "#FF9933", angle: 180, chance: 45 },
      { name: "199 SPs", color: "#FFA366", angle: 240, chance: 25 },
      { name: "+3 Giros Grátis", color: "#FF7A1A", angle: 300, chance: 15 },
      { name: "+50% Chance Aumentada", color: "#FF6B00", angle: 0, chance: 7 },
      { name: "15% Desconto Mercado", color: "#FF8C40", angle: 60, chance: 5 },
      { name: "Kit Materiais", color: "#FFB366", angle: 120, chance: 3 },
    ],
    // Após 3ª Regeneração
    [
      { name: "299 SPs", color: "#FFA366", angle: 240, chance: 25 },
      { name: "150 XP", color: "#FF9933", angle: 180, chance: 45 },
      { name: "Giro Especial", color: "#FF7A1A", angle: 300, chance: 15 },
      { name: "Conquistas Especiais", color: "#FF6B00", angle: 0, chance: 7 },
      { name: "1 Badge Raro", color: "#FF8C40", angle: 60, chance: 5 },
      { name: "Evento Exclusivo", color: "#FFB366", angle: 120, chance: 3 },
    ]
  ];

  // Estado atual dos prêmios
  const [currentPrizeGroup, setCurrentPrizeGroup] = React.useState(0);
  const prizes = prizeGroups[currentPrizeGroup];

  // Inicialização do áudio
  React.useEffect(() => {
    // Criar áudio sintético para clique (já que não temos arquivo de áudio)
    const createClickSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      return () => {
        try {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);

          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
          console.log('Áudio não disponível:', error);
        }
      };
    };

    audioRef.current = createClickSound();
  }, []);

  // Função para reproduzir som de clique
  const playClickSound = () => {
    if (audioRef.current) {
      try {
        audioRef.current();
      } catch (error) {
        console.log('Erro ao reproduzir áudio:', error);
      }
    }

    // Alternativa: vibração se disponível
    if (navigator.vibrate) {
      navigator.vibrate(25);
    }
  };

  // Função para animar inclinação do lápis com movimento físico realista
  const animatePencilTilt = () => {
    // Movimento de empurrão para trás (impulso rápido)
    setPinoTilt(-12); // Inclinação negativa (para trás)

    // Retorno elástico com efeito de mola
    setTimeout(() => {
      setPinoTilt(3); // Pequeno overshoot para frente

      setTimeout(() => {
        setPinoTilt(-1); // Leve movimento de volta

        setTimeout(() => {
          setPinoTilt(0); // Posição final original
        }, 80);
      }, 120);
    }, 100);
  };

  // Função para efeitos visuais do pino
  const animatePinoEffects = (pointIndex: number) => {
    // Definir ponto ativo
    setActivePoint(pointIndex);

    // Mudar cor do pino temporariamente
    setPinoColor('#FF0000'); // Vermelho ao ativar

    // Efeito de piscada
    setPinoBlinking(true);

    // Reproduzir som
    playClickSound();

    // Restaurar cor original após efeito
    setTimeout(() => {
      setPinoColor('#FF6B00');
      setPinoBlinking(false);
      setActivePoint(null);
    }, 150);
  };

  // Função para detectar colisão com os pontos divisórios
  const detectCollision = (angle: number, previousAngle: number) => {
    const sectorBoundaries = [0, 60, 120, 180, 240, 300];

    for (let i = 0; i < sectorBoundaries.length; i++) {
      const boundary = sectorBoundaries[i];

      // Normaliza ângulos para comparação precisa
      const prevNormalized = ((previousAngle % 360) + 360) % 360;
      const currentNormalized = ((angle % 360) + 360) % 360;

      // Verifica se passou por um ponto divisório
      const crossedBoundary = 
        (prevNormalized < boundary && currentNormalized >= boundary) ||
        (prevNormalized > boundary && currentNormalized <= boundary) ||
        // Casos especiais para cruzamento do 0°/360°
        (prevNormalized > 350 && currentNormalized < 10 && boundary === 0) ||
        (prevNormalized < 10 && currentNormalized > 350 && boundary === 0);

      if (crossedBoundary) {
        // Aplicar todos os efeitos visuais e auditivos
        animatePinoEffects(i);

        // Movimento físico realista do lápis
        animatePencilTilt();

        break;
      }
    }
  };

  // Função para determinar o prêmio vencedor baseado em probabilidade
  const determinePrize = (finalAngle: number) => {
    // Gera um número aleatório para determinar o prêmio baseado na probabilidade
    const random = Math.random() * 100;
    let cumulativeChance = 0;

    for (const prize of prizes) {
      cumulativeChance += prize.chance;
      if (random <= cumulativeChance) {
        return prize;
      }
    }

    // Fallback para o último prêmio
    return prizes[prizes.length - 1];
  };

  // Função para regenerar recompensas
  const handleRegeneratePrizes = () => {
    if (regenerationCount >= 3) return;

    const cost = regenerationCount === 0 ? 25 : regenerationCount === 1 ? 50 : 99;
    if (userSPs < cost) return;

    // Remove o resultado anterior se existir
    setShowResult(false);
    setSelectedPrize(null);

    setUserSPs(prev => prev - cost);
    setRegenerationCount(prev => prev + 1);
    setCurrentPrizeGroup(prev => Math.min(prev + 1, 3));
  };

  // Função para obter ícone da recompensa
  const getPrizeIcon = (prizeName: string) => {
    if (prizeName.includes('Avatar') || prizeName.includes('Avatares')) {
      return (
        <div className="w-4 h-4 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      );
    }
    if (prizeName.includes('Material') || prizeName.includes('Kit')) {
      return (
        <div className="w-4 h-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded flex items-center justify-center">
          <div className="w-2 h-1 bg-white rounded"></div>
        </div>
      );
    }
    if (prizeName.includes('SP')) {
      return (
        <div className="w-4 h-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      );
    }
    if (prizeName.includes('XP')) {
      return (
        <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-[8px] font-bold text-white">
          XP
        </div>
      );
    }
    if (prizeName.includes('Turbo')) {
      return (
        <div className="w-4 h-4 bg-gradient-to-br from-violet-400 to-purple-600 rounded-full flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          <div className="absolute w-1 h-1 bg-purple-200 rounded-full transform translate-x-0.5 -translate-y-0.5"></div>
        </div>
      );
    }
    if (prizeName.includes('Giros') || prizeName.includes('Giro')) {
      return (
        <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          <div className="absolute w-1 h-1 bg-green-200 rounded-full transform translate-x-0.5 -translate-y-0.5"></div>
        </div>
      );
    }
    if (prizeName.includes('Chance') || prizeName.includes('Desconto')) {
      return (
        <div className="w-4 h-4 bg-gradient-to-br from-indigo-400 to-purple-600 rounded flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
      );
    }
    if (prizeName.includes('Conquistas') || prizeName.includes('Badge')) {
      return (
        <div className="w-4 h-4 bg-gradient-to-br from-amber-400 to-yellow-600 rounded flex items-center justify-center">
          <div className="w-2 h-1.5 bg-white rounded-sm"></div>
        </div>
      );
    }
    if (prizeName.includes('Evento')) {
      return (
        <div className="w-4 h-4 bg-gradient-to-br from-pink-400 to-red-600 rounded-full flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
      );
    }
    if (prizeName.includes('ENEM')) {
      return (
        <div className="w-4 h-4 bg-gradient-to-br from-teal-400 to-cyan-600 rounded flex items-center justify-center">
          <div className="w-2 h-1.5 bg-white rounded-sm"></div>
        </div>
      );
    }
    return (
      <div className="w-4 h-4 bg-gradient-to-br from-gray-400 to-gray-600 rounded flex items-center justify-center">
        <div className="w-2 h-2 bg-white rounded"></div>
      </div>
    );
  };

  // Adiciona ícone aos prêmios
  const prizesWithIcons = prizes.map(prize => ({
    ...prize,
    icon: getPrizeIcon(prize.name)
  }));

  // Função principal de giro da roleta
  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setShowResult(false);
    setSelectedPrize(null);

    // Parâmetros de giro
    let velocity = 15 + Math.random() * 10; // Velocidade inicial aleatória
    const friction = 0.02; // Fator de atrito
    const minSpins = 3; // Mínimo de voltas completas
    let totalRotation = currentRotation + (360 * minSpins) + Math.random() * 360;
    let previousAngle = currentRotation;

    const animate = () => {
      // Atualiza a rotação
      setCurrentRotation(prev => {
        const newRotation = prev + velocity;

        // Detecta colisão com pontos divisórios
        detectCollision(newRotation, previousAngle);
        previousAngle = newRotation;

        return newRotation;
      });

      // Reduz a velocidade (atrito)
      velocity -= friction;

      // Continua girando se ainda há velocidade
      if (velocity > 0.1) {
        requestAnimationFrame(animate);
      } else {
        // Para a roleta e determina o prêmio
        setIsSpinning(false);

        // Pequeno delay para mostrar o resultado
        setTimeout(() => {
          const winner = determinePrize(totalRotation);
          setSelectedPrize(winner.name);
          setShowResult(true);
        }, 500);
      }
    };

    // Inicia a animação
    requestAnimationFrame(animate);
  };

  // Configuração otimizada do pino da roleta para eventos futuros
  const pinoConfig = {
    // Propriedades de posicionamento
    position: {
      x: 128 + (128 * 1.1), // 1.1 * raio da roleta
      y: 128, // Centro vertical
      angle: -15, // Ângulo de inclinação para dentro
    },

    // Propriedades visuais
    design: {
      grafiteColor: '#333333',
      madeiraColor: '#FF6B00',
      borrachaColor: '#FFC1CC',
      seloColor: '#FF6B00'
    },

    // Estado do pino
    state: {
      active: true,
      interactionEnabled: false // Para expansão futura
    },

    // Métodos para eventos futuros (placeholders otimizados)
    events: {
      onClick: () => {
        // Placeholder para clique no pino
        console.log('Pino clicado - evento futuro');
      },

      onHover: () => {
        // Placeholder para hover no pino
        console.log('Pino hover - evento futuro');
      },

      onInteraction: () => {
        // Placeholder para interações gerais
        console.log('Pino interação - evento futuro');
      },

      onCollisionDetection: (target: any) => {
        // Placeholder para detecção de colisão
        console.log('Pino colisão detectada:', target);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[650px] p-0 bg-transparent border-0 shadow-none"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative bg-orange-50/20 backdrop-blur-md border border-orange-200/30 rounded-2xl p-8 shadow-2xl"
          style={{
            background: "rgba(255, 245, 235, 0.15)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          {/* Botão de fechar */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 border border-orange-200/30 transition-all duration-300"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4 text-orange-700" />
          </Button>

          {/* Título moderno e sofisticado inspirado na imagem */}
          <div className="mb-8">
            <div className="flex items-center gap-5 mb-6">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", damping: 20, stiffness: 300 }}
                className="relative flex-shrink-0"
              >
                {/* Ícone moderno com design sofisticado */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-4 rounded-2xl shadow-2xl border border-orange-300/20">
                    <Gift className="h-8 w-8 text-white drop-shadow-lg" />
                  </div>

                  {/* Efeito de brilho moderno */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400/40 to-orange-600/40 rounded-2xl blur-xl animate-pulse"></div>

                  {/* Anel de destaque */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-400/30 via-orange-500/20 to-orange-600/30 rounded-2xl blur-sm"></div>
                </div>
              </motion.div>

              <div className="flex-1">
                <motion.h1
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.6, type: "spring", damping: 25 }}
                  className="text-3xl font-semibold tracking-tight leading-tight text-white"
                  style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    letterSpacing: "-0.04em",
                    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  }}
                >
                  Login Diário
                </motion.h1>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="text-sm font-medium text-white/80 mt-1"
                  style={{
                    textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                  }}
                >
                  Resgate sua recompensa
                </motion.p>

                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "100%", opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="h-1 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 rounded-full mt-2 shadow-lg"
                  style={{
                    background: "linear-gradient(90deg, transparent 0%, #FF6B00 25%, #FF8C40 50%, #FF6B00 75%, transparent 100%)",
                  }}
                />
              </div>
            </div>



            {/* Roleta de Recompensas */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8, type: "spring", damping: 15 }}
              className="mt-8 flex justify-start items-start gap-12"
            >
              <div className="relative">
                {/* Container da Roleta */}
                <div className="relative w-64 h-64">
                  {/* Círculo da Roleta */}
                  <div 
                    className="w-full h-full rounded-full border-4 border-orange-300 bg-gradient-to-br from-orange-100 to-orange-200 relative overflow-hidden shadow-xl transition-transform duration-100"
                    style={{
                      transform: `rotate(${currentRotation}deg)`,
                      transformOrigin: 'center'
                    }}
                  >
                    {/* Seções da Roleta */}
                    <div className="absolute inset-0 rounded-full" style={{
                      background: `conic-gradient(
                        from 0deg,
                        #FF6B00 0deg 60deg,
                        #FF8C40 60deg 120deg,
                        #FFB366 120deg 180deg,
                        #FF9933 180deg 240deg,
                        #FFA366 240deg 300deg,
                        #FF7A1A 300deg 360deg
                      )`
                    }}>
                      {/* Linhas divisórias entre as seções */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        {/* Gerando as 6 linhas divisórias com ângulos de 60 graus */}
                        {[...Array(6)].map((_, index) => {
                          const angle = index * 60; // 0°, 60°, 120°, 180°, 240°, 300°
                          return (
                            <div 
                              key={`linha-${index}`}
                              className="absolute w-0.5 h-32 bg-white/50 origin-bottom"
                              style={{
                                transform: `rotate(${angle}deg)`,
                                transformOrigin: '50% 100%',
                                bottom: '50%',
                                left: '50%',
                                marginLeft: '-1px'
                              }}
                            ></div>
                          );
                        })}
                      </div>

                      {/* Textos e ícones dos prêmios nos setores */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        {prizesWithIcons.map((prize, index) => {
                          const angle = prize.angle + 30; // Centro do setor (30° do início)
                          const radius = 80; // Distância do centro para o texto

                          // Convertendo ângulo para radianos e calculando posição
                          const angleRad = (angle - 90) * (Math.PI / 180); // -90 para começar no topo
                          const x = radius * Math.cos(angleRad);
                          const y = radius * Math.sin(angleRad);

                          return (
                            <div
                              key={`prize-${index}-${currentPrizeGroup}`}
                              className="absolute text-white font-bold text-xs text-center flex flex-col items-center"
                              style={{
                                left: '50%',
                                top: '50%',
                                transform: `translate(${x - 25}px, ${y - 15}px)`,
                                zIndex: 15,
                                width: '50px',
                                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                                fontSize: '10px',
                                lineHeight: '1.2'
                              }}
                            >
                              {/* Ícone temático */}
                              <div 
                                className="mb-1 flex items-center justify-center"
                                style={{ 
                                  filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))'
                                }}
                              >
                                {prize.icon}
                              </div>

                              {/* Texto do prêmio */}
                              <div>
                                {prize.name.split(' ').map((word, i) => (
                                  <div key={i}>{word}</div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Bolinhas nas linhas divisórias */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        {[...Array(6)].map((_, index) => {
                          const angle = index * 60; // Ângulos: 0°, 60°, 120°, 180°, 240°, 300°
                          const radius = 121; // Ajustado para 95% do raio original (128 * 0.95) para evitar cortes
                          const ballRadius = 6; // Raio das bolinhas (5% do diâmetro da roleta)
                          const isActive = activePoint === index;

                          // Convertendo ângulo para radianos e calculando posição
                          const angleRad = (angle - 90) * (Math.PI / 180); // -90 para começar no topo
                          const x = radius * Math.cos(angleRad);
                          const y = radius * Math.sin(angleRad);

                          return (
                            <div
                              key={`bolinha-${index}`}
                              className={`absolute w-3 h-3 rounded-full shadow-lg transition-all duration-150 ${
                                isActive ? 'bg-red-400 scale-125' : 'bg-white'
                              }`}
                              style={{
                                left: '50%',
                                top: '50%',
                                transform: `translate(${x - ballRadius}px, ${y - ballRadius}px) ${isActive ? 'scale(1.25)' : 'scale(1)'}`,
                                zIndex: 10,
                                border: isActive ? '2px solid #FF0000' : '2px solid #FFA500',
                                boxShadow: isActive 
                                  ? '0 0 15px rgba(255, 0, 0, 0.6), 2px 2px 8px rgba(0,0,0,0.3)'
                                  : '2px 2px 4px rgba(0,0,0,0.2)'
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Centro da Roleta */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full border-4 border-orange-400 flex items-center justify-center shadow-lg z-10">
                    <Gift className="h-8 w-8 text-orange-600" />
                  </div>

                  {/* Pino da Roleta - Design Educacional de Lápis */}
                  <div 
                    className={`absolute z-20 transition-all duration-150 ${pinoBlinking ? 'scale-110 brightness-150 drop-shadow-lg' : ''}`}
                    style={{
                      right: '-24px', // Posiciona 1.1 * raio da roleta (128px * 1.1 = ~140px, ajustado para -24px)
                      top: '50%',
                      transform: `translateY(-50%) rotate(${-15 + pinoTilt}deg)`, // Inclinação base + movimento físico
                      transformOrigin: 'center bottom', // Origem na base do lápis para movimento realista
                      transition: pinoTilt !== 0 ? 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)' : 'transform 0.1s ease-out',
                      filter: pinoBlinking ? 'drop-shadow(0 0 10px rgba(255, 0, 0, 0.8))' : 'none'
                    }}
                  >
                    {/* Container do Pino Educacional */}
                    <div className="relative flex items-center">
                      {/* Ponta do Grafite (cinza escura) */}
                      <div 
                        className="absolute left-0 z-30"
                        style={{
                          width: '0',
                          height: '0',
                          borderTop: '6px solid transparent',
                          borderBottom: '6px solid transparent',
                          borderRight: '12px solid #333333',
                          filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))'
                        }}
                      ></div>

                      {/* Corpo do Lápis (laranja educacional) */}
                      <div 
                        className="relative ml-3 transition-all duration-150"
                        style={{
                          width: '32px',
                          height: '16px',
                          backgroundColor: pinoColor,
                          borderRadius: '0 8px 8px 0',
                          background: pinoBlinking 
                            ? `linear-gradient(135deg, ${pinoColor} 0%, #FF0000 50%, ${pinoColor} 100%)`
                            : `linear-gradient(135deg, ${pinoColor} 0%, #FF8F40 50%, ${pinoColor} 100%)`,
                          boxShadow: pinoBlinking 
                            ? '2px 2px 8px rgba(255,0,0,0.4), inset 1px 1px 2px rgba(255,255,255,0.3), 0 0 15px rgba(255,0,0,0.3)'
                            : '2px 2px 4px rgba(0,0,0,0.2), inset 1px 1px 2px rgba(255,255,255,0.3)',
                          transform: pinoBlinking ? 'scale(1.05)' : 'scale(1)'
                        }}
                      >
                        {/* Detalhes de Textura do Lápis */}
                        <div 
                          className="absolute top-1 left-2 w-6 h-0.5 rounded"
                          style={{ backgroundColor: '#E55A00', opacity: 0.6 }}
                        ></div>
                        <div 
                          className="absolute bottom-1 left-2 w-4 h-0.5 rounded"
                          style={{ backgroundColor: '#E55A00', opacity: 0.4 }}
                        ></div>

                        {/* Borracha Rosa (detalhe superior) */}
                        <div 
                          className="absolute -right-1 top-1/2 transform -translate-y-1/2"
                          style={{
                            width: '8px',
                            height: '10px',
                            backgroundColor: '#FFC1CC',
                            borderRadius: '0 4px 4px 0',
                            background: 'linear-gradient(135deg, #FFC1CC 0%, #FFB3C1 50%, #FFC1CC 100%)',
                            boxShadow: '1px 1px 2px rgba(0,0,0,0.15)'
                          }}
                        ></div>
                      </div>

                      {/* Marca Educacional (pequeno selo de qualidade) */}
                      <div 
                        className="absolute top-0 left-4 w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: '#FF6B00',
                          opacity: 0.8,
                          boxShadow: '0 0 3px rgba(255, 107, 0, 0.5)'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Resultado da Roleta */}
                {showResult && selectedPrize && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mt-4 p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white text-center"
                  >
                    <h3 className="text-lg font-bold">🎉 Parabéns!</h3>
                    <p className="text-sm mt-1">Você ganhou: <span className="font-bold">{selectedPrize}</span></p>
                  </motion.div>
                )}

                {/* Botão Girar */}
                <motion.button
                  whileHover={{ scale: isSpinning ? 1 : 1.05 }}
                  whileTap={{ scale: isSpinning ? 1 : 0.95 }}
                  onClick={spinWheel}
                  disabled={isSpinning}
                  className={`mt-6 w-full font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                    isSpinning 
                      ? 'bg-gray-400 cursor-not-allowed text-gray-200' 
                      : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
                  }`}
                >
                  {isSpinning && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {isSpinning ? 'Girando...' : 'Girar Roleta'}
                </motion.button>
              </div>

              {/* Cards laterais */}
              <motion.div
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="flex flex-col justify-start"
              >
                {/* Card Sequência de Giros */}
                <SequenciaGirosCard isSpinning={isSpinning} showResult={showResult} />

                {/* Card Recompensas Disponíveis */}
                <RecompensasDisponiveisCard 
                  currentPrizes={prizesWithIcons}
                  onRegeneratePrizes={handleRegeneratePrizes}
                  regenerationCount={regenerationCount}
                  userSPs={userSPs}
                />
              </motion.div>
            </motion.div>
          </div>

          {/* Efeitos decorativos */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-2xl">
            {/* Partículas flutuantes */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full opacity-60"
                initial={{ 
                  x: Math.random() * 400, 
                  y: Math.random() * 300,
                  scale: 0 
                }}
                animate={{ 
                  y: [null, -20, 20, -10, 5],
                  scale: [0, 1, 0.8, 1, 0.6],
                  opacity: [0, 0.8, 0.4, 0.8, 0]
                }}
                transition={{
                  duration: 3,
                  delay: i * 0.3,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              />
            ))}
          </div>

          {/* Gradiente sutil no fundo */}
          <div 
            className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 50% 50%, rgba(255, 107, 0, 0.1) 0%, transparent 70%)"
            }}
          />
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default RoletaRecompensasModal;