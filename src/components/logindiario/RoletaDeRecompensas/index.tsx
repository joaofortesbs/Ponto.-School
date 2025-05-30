
import React from "react";
import { Gift } from "lucide-react";
import { motion } from "framer-motion";

interface RoletaDeRecompensasProps {
  isSpinning: boolean;
  currentRotation: number;
  prizesWithIcons: Array<{
    name: string;
    color: string;
    angle: number;
    icon: React.ReactNode;
    chance: number;
  }>;
  selectedPrize: string | null;
  showResult: boolean;
  onSpin: () => void;
  activePoint: number | null;
  currentPrizeGroup: number;
  pinoTilt: number;
  pinoBlinking: boolean;
  pinoColor: string;
  canSpin: boolean;
}

const RoletaDeRecompensas: React.FC<RoletaDeRecompensasProps> = ({
  isSpinning,
  currentRotation,
  prizesWithIcons,
  selectedPrize,
  showResult,
  onSpin,
  activePoint,
  pinoTilt,
  pinoBlinking,
  pinoColor,
  canSpin,
}) => {
  return (
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
                    key={`prize-${index}`}
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
        whileHover={{ scale: (isSpinning || !canSpin) ? 1 : 1.05 }}
        whileTap={{ scale: (isSpinning || !canSpin) ? 1 : 0.95 }}
        onClick={canSpin ? onSpin : undefined}
        disabled={isSpinning || !canSpin}
        className={`mt-6 w-full font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
          isSpinning 
            ? 'bg-gray-400 cursor-not-allowed text-gray-200' 
            : !canSpin
            ? 'bg-gray-500 cursor-not-allowed text-gray-300 opacity-60'
            : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
        }`}
      >
        {isSpinning && (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        )}
        {isSpinning ? 'Girando...' : !canSpin ? 'Sem Giros Disponíveis' : 'Girar Roleta'}
      </motion.button>
    </div>
  );
};

export default RoletaDeRecompensas;
