import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Gift, X } from "lucide-react";
import { motion } from "framer-motion";

// Importar os novos componentes
import RoletaDeRecompensas from "./RoletaDeRecompensas";
import CardDiasDeSequencia from "./CardDiasDeSequencia";
import CardRecompensasDisponiveis from "./CardRecompensasDisponiveis";
import GirosDisponiveisIndicador from "./GirosDisponiveisIndicador";
import { useTheme } from "@/components/ThemeProvider";

interface RoletaRecompensasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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
  const [pinoTilt, setPinoTilt] = React.useState(0);
  const [pinoColor, setPinoColor] = React.useState('#FF6B00');
  const [activePoint, setActivePoint] = React.useState<number | null>(null);
  const [regenerationCount, setRegenerationCount] = React.useState(0);
  const [userSPs, setUserSPs] = React.useState(150);

  // Estados para controle de giros
  const [girosDisponiveis, setGirosDisponiveis] = React.useState(1);
  const [girosEspeciais, setGirosEspeciais] = React.useState(0);
  const [jaGirouHoje, setJaGirouHoje] = React.useState(false);

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

    if (navigator.vibrate) {
      navigator.vibrate(25);
    }
  };

  // Função para animar inclinação do lápis
  const animatePencilTilt = () => {
    setPinoTilt(-12);
    setTimeout(() => {
      setPinoTilt(3);
      setTimeout(() => {
        setPinoTilt(-1);
        setTimeout(() => {
          setPinoTilt(0);
        }, 80);
      }, 120);
    }, 100);
  };

  // Função para efeitos visuais do pino
  const animatePinoEffects = (pointIndex: number) => {
    setActivePoint(pointIndex);
    setPinoColor('#FF0000');
    setPinoBlinking(true);
    playClickSound();

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

      const prevNormalized = ((previousAngle % 360) + 360) % 360;
      const currentNormalized = ((angle % 360) + 360) % 360;

      const crossedBoundary = 
        (prevNormalized < boundary && currentNormalized >= boundary) ||
        (prevNormalized > boundary && currentNormalized <= boundary) ||
        (prevNormalized > 350 && currentNormalized < 10 && boundary === 0) ||
        (prevNormalized < 10 && currentNormalized > 350 && boundary === 0);

      if (crossedBoundary) {
        animatePinoEffects(i);
        animatePencilTilt();
        break;
      }
    }
  };

  // Função para determinar o prêmio vencedor
  const determinePrize = () => {
    const random = Math.random() * 100;
    let cumulativeChance = 0;

    for (const prize of prizes) {
      cumulativeChance += prize.chance;
      if (random <= cumulativeChance) {
        return prize;
      }
    }

    return prizes[prizes.length - 1];
  };

  // Função para processar recompensas especiais
  const processSpecialReward = (prizeName: string) => {
    if (prizeName.includes("+3 Giros Grátis")) {
      setGirosDisponiveis(prev => prev + 3);
    } else if (prizeName.includes("Giro Especial")) {
      setGirosEspeciais(prev => prev + 1);
    }
  };

  // Função para regenerar recompensas
  const handleRegeneratePrizes = () => {
    if (regenerationCount >= 3) return;

    const cost = regenerationCount === 0 ? 25 : regenerationCount === 1 ? 50 : 99;
    if (userSPs < cost) return;

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

  // Verificar se pode girar
  const canSpin = !isSpinning && (girosDisponiveis > 0 || girosEspeciais > 0) && !jaGirouHoje;

  // Função principal de giro da roleta
  const spinWheel = () => {
    if (!canSpin) return;

    // Verificar e deduzir giros
    if (girosEspeciais > 0) {
      setGirosEspeciais(prev => prev - 1);
    } else if (girosDisponiveis > 0) {
      setGirosDisponiveis(prev => prev - 1);
    } else {
      return; // Não pode girar
    }

    setIsSpinning(true);
    setShowResult(false);
    setSelectedPrize(null);

    let velocity = 15 + Math.random() * 10;
    const friction = 0.02;
    const minSpins = 3;
    let totalRotation = currentRotation + (360 * minSpins) + Math.random() * 360;
    let previousAngle = currentRotation;

    const animate = () => {
      setCurrentRotation(prev => {
        const newRotation = prev + velocity;
        detectCollision(newRotation, previousAngle);
        previousAngle = newRotation;
        return newRotation;
      });

      velocity -= friction;

      if (velocity > 0.1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);

        setTimeout(() => {
          const winner = determinePrize();
          setSelectedPrize(winner.name);
          setShowResult(true);

          // Processar recompensas especiais
          processSpecialReward(winner.name);

          // Verificar se é o primeiro giro do dia
          if (girosDisponiveis === 0 && girosEspeciais === 0) {
            setJaGirouHoje(true);
          }
        }, 500);
      }
    };

    requestAnimationFrame(animate);
  };

    const { theme } = useTheme();
    const isLightMode = theme === 'light';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[650px] p-0 bg-transparent border-0 shadow-none"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="relative w-full h-full">
          {/* Background com cor de fundo #FFECD6 */}
          <div className={`absolute inset-0 rounded-3xl border-4 shadow-[0_0_50px_rgba(255,106,0,0.05)]`}
          style={{ 
            backgroundColor: '#FFECD6',
            borderColor: '#FF6A00'
          }}>
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 p-8"
          >
          {/* Botão de fechar */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className={`absolute top-4 right-4 z-50 h-8 w-8 rounded-full transition-all duration-300 ${
              isLightMode
                ? 'bg-gray-100/80 hover:bg-gray-200/80 text-gray-600 hover:text-gray-800'
                : 'bg-black/30 hover:bg-black/50 text-white/60 hover:text-white'
            }`}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Título */}
          <div className="mb-8">
            <div className="flex items-center gap-5 mb-6">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", damping: 20, stiffness: 300 }}
                className="relative flex-shrink-0"
              >
                <div className="relative">
                  <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-4 rounded-2xl shadow-2xl border border-orange-300/20">
                    <Gift className="h-8 w-8 text-white drop-shadow-lg" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400/40 to-orange-600/40 rounded-2xl blur-xl animate-pulse"></div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-400/30 via-orange-500/20 to-orange-600/30 rounded-2xl blur-sm"></div>
                </div>
              </motion.div>

              <div className="flex-1">
                <motion.h1
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.6, type: "spring", damping: 25 }}
                  className="text-3xl font-semibold tracking-tight leading-tight"
                  style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    letterSpacing: "-0.04em",
                    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                    color: "#2D1B14"
                  }}
                >
                  Login Diário
                </motion.h1>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="text-sm font-medium mt-1"
                  style={{
                    textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                    color: "#5D4037"
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

            {/* Conteúdo do modal */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8, type: "spring", damping: 15 }}
              className="mt-8 flex justify-start items-start gap-12"
            >
              <div className="relative">
                {/* Indicador de Giros Disponíveis */}
                <GirosDisponiveisIndicador 
                  girosDisponiveis={girosDisponiveis}
                  girosEspeciais={girosEspeciais}
                />

                {/* Roleta de Recompensas */}
                <RoletaDeRecompensas
                  isSpinning={isSpinning}
                  currentRotation={currentRotation}
                  prizesWithIcons={prizesWithIcons}
                  selectedPrize={selectedPrize}
                  showResult={showResult}
                  onSpin={spinWheel}
                  activePoint={activePoint}
                  currentPrizeGroup={currentPrizeGroup}
                  pinoTilt={pinoTilt}
                  pinoBlinking={pinoBlinking}
                  pinoColor={pinoColor}
                  canSpin={canSpin}
                />
              </div>

              {/* Cards laterais */}
              <motion.div
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="flex flex-col justify-start"
              >
                {/* Card Sequência de Giros */}
                <CardDiasDeSequencia 
                  isSpinning={isSpinning} 
                  showResult={showResult} 
                />

                {/* Card Recompensas Disponíveis */}
                <CardRecompensasDisponiveis 
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
            className="absolute inset-0 rounded-3xl opacity-30 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 50% 50%, rgba(255, 107, 0, 0.1) 0%, transparent 70%)"
            }}
          />
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoletaRecompensasModal;