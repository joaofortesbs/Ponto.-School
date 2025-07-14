
"use client";
import React from "react";
import { motion, useMotionValue, useTransform, useAnimationFrame, useMotionTemplate } from "framer-motion";

// Função utilitária cn (clsx + tailwind-merge)
const cn = (...classes: any[]) => {
  return classes.filter(Boolean).join(" ");
};

// MovingBorder component
const MovingBorder = ({
  children,
  duration = 3000,
  rx = "30%",
  ry = "30%",
}: any) => {
  const pathRef = React.useRef<SVGRectElement>(null);
  const progress = useMotionValue(0);

  useAnimationFrame((time) => {
    const length = pathRef.current?.getTotalLength();
    if (length) {
      const pxPerMillisecond = length / duration;
      progress.set((time * pxPerMillisecond) % length);
    }
  });

  const x = useTransform(
    progress,
    (val) => pathRef.current?.getPointAtLength(val).x,
  );
  const y = useTransform(
    progress,
    (val) => pathRef.current?.getPointAtLength(val).y,
  );

  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`;

  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="absolute h-full w-full"
        width="100%"
        height="100%"
      >
        <rect
          fill="none"
          width="100%"
          height="100%"
          rx={rx}
          ry={ry}
          ref={pathRef}
        />
      </svg>
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          display: "inline-block",
          transform,
        }}
      >
        {children}
      </motion.div>
    </>
  );
};

interface Particles3DProps {
  isDarkTheme?: boolean;
  isBlurred?: boolean;
  mainCircleSize?: number;
  mainCircleOpacity?: number;
  numCircles?: number;
  className?: string;
}

// Ripple component - TOTALMENTE SIMPLES E FIXO
const Particles3D = React.memo<Particles3DProps>(function Particles3D({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 3,
  className,
  isDarkTheme = true,
  isBlurred = false,
  ...props
}) {
  const getBlurSettings = (lineIndex: number) => {
    if (!isBlurred) {
      return {
        filter: "blur(0px) brightness(1)",
        scale: 1,
      };
    }

    const settings: any = {
      0: {
        blur: isDarkTheme ? 8 : 6,
        brightness: isDarkTheme ? 0.7 : 0.8,
        scale: isDarkTheme ? 0.95 : 0.97,
      },
      1: {
        blur: isDarkTheme ? 10 : 8,
        brightness: isDarkTheme ? 0.6 : 0.75,
        scale: isDarkTheme ? 0.92 : 0.95,
      },
      2: {
        blur: isDarkTheme ? 12 : 10,
        brightness: isDarkTheme ? 0.5 : 0.7,
        scale: isDarkTheme ? 0.9 : 0.93,
      },
    };

    const config = settings[lineIndex];
    return {
      filter: `blur(${config.blur}px) brightness(${config.brightness}) ${isDarkTheme ? "" : "saturate(0.9)"}`,
      scale: config.scale,
    };
  };

  return (
    <div
      className={cn("absolute inset-0 select-none", className)}
      style={{
        maskImage:
          "linear-gradient(to bottom, white 30%, rgba(255,255,255,0.3) 60%, transparent 90%)",
      }}
      {...props}
    >
      <div
        className="absolute inset-0 select-none pointer-events-none"
        style={{ zIndex: 1000 }}
      >
        {Array.from({ length: numCircles }, (_, i) => {
          const size = mainCircleSize + i * 180;
          const opacity = mainCircleOpacity - i * 0.03;
          const animationDelay = `${i * 0.06}s`;

          return (
            <div key={i}>
              <div
                className="absolute rounded-full border shadow-xl pointer-events-none"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  opacity,
                  animationDelay,
                  borderWidth: "1px",
                  borderColor: isDarkTheme
                    ? "rgba(255, 255, 255, 0.3)"
                    : "rgba(0, 0, 0, 0.6)",
                  backgroundColor: isDarkTheme
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.25)",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%) scale(1)",
                }}
              />

              {/* LINHA 1 - 5 ÍCONES FIXOS NA BORDA */}
              {i === 0 && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    animation: "rotateClockwise 30s linear infinite",
                    ...getBlurSettings(0),
                    width: `${size}px`,
                    height: `${size}px`,
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {/* Ícone 1 */}
                  <div
                    className="absolute flex items-center justify-center rounded-full bg-orange-500 shadow-lg border-2 border-orange-300"
                    style={{
                      width: "40px",
                      height: "40px",
                      top: "50%",
                      left: "50%",
                      transform: `translate(-50%, -50%) rotate(0deg) translateY(-${size / 2}px) rotate(0deg)`,
                      opacity: 0.9,
                      zIndex: 15,
                    }}
                  >
                    <div className="text-white text-sm">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14,2 14,8 20,8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                    </div>
                  </div>

                  {/* Ícone 2 */}
                  <div
                    className="absolute flex items-center justify-center rounded-full bg-orange-500 shadow-lg border-2 border-orange-300"
                    style={{
                      width: "40px",
                      height: "40px",
                      top: "50%",
                      left: "50%",
                      transform: `translate(-50%, -50%) rotate(72deg) translateY(-${size / 2}px) rotate(-72deg)`,
                      opacity: 0.9,
                      zIndex: 15,
                    }}
                  >
                    <div className="text-white text-sm">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                        <path d="m9 16 2 2 4-4" />
                      </svg>
                    </div>
                  </div>

                  {/* Ícone 3 */}
                  <div
                    className="absolute flex items-center justify-center rounded-full bg-orange-500 shadow-lg border-2 border-orange-300"
                    style={{
                      width: "40px",
                      height: "40px",
                      top: "50%",
                      left: "50%",
                      transform: `translate(-50%, -50%) rotate(144deg) translateY(-${size / 2}px) rotate(-144deg)`,
                      opacity: 0.9,
                      zIndex: 15,
                    }}
                  >
                    <div className="text-white text-sm">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <path d="M12 17h.01" />
                      </svg>
                    </div>
                  </div>

                  {/* Ícone 4 */}
                  <div
                    className="absolute flex items-center justify-center rounded-full bg-orange-500 shadow-lg border-2 border-orange-300"
                    style={{
                      width: "40px",
                      height: "40px",
                      top: "50%",
                      left: "50%",
                      transform: `translate(-50%, -50%) rotate(216deg) translateY(-${size / 2}px) rotate(-216deg)`,
                      opacity: 0.9,
                      zIndex: 15,
                    }}
                  >
                    <div className="text-white text-sm">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="12" y1="20" x2="12" y2="10" />
                        <line x1="18" y1="20" x2="18" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="16" />
                      </svg>
                    </div>
                  </div>

                  {/* Ícone 5 */}
                  <div
                    className="absolute flex items-center justify-center rounded-full bg-orange-500 shadow-lg border-2 border-orange-300"
                    style={{
                      width: "40px",
                      height: "40px",
                      top: "50%",
                      left: "50%",
                      transform: `translate(-50%, -50%) rotate(288deg) translateY(-${size / 2}px) rotate(-288deg)`,
                      opacity: 0.9,
                      zIndex: 15,
                    }}
                  >
                    <div className="text-white text-sm">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* LINHA 2 - 4 ÍCONES FIXOS NA BORDA */}
              {i === 1 && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    animation: "rotateCounterClockwise 25s linear infinite",
                    ...getBlurSettings(1),
                    width: `${size}px`,
                    height: `${size}px`,
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {/* Ícone 1 */}
                  <div
                    className="absolute flex items-center justify-center rounded-full bg-orange-500 shadow-lg border-2 border-orange-300"
                    style={{
                      width: "40px",
                      height: "40px",
                      top: "50%",
                      left: "50%",
                      transform: `translate(-50%, -50%) rotate(0deg) translateY(-${size / 2}px) rotate(0deg)`,
                      opacity: 0.9,
                      zIndex: 15,
                    }}
                  >
                    <div className="text-white text-sm">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect
                          x="3"
                          y="3"
                          width="18"
                          height="14"
                          rx="2"
                          ry="2"
                        />
                        <path d="M7 8h10" />
                        <path d="M7 12h6" />
                      </svg>
                    </div>
                  </div>

                  {/* Ícone 2 */}
                  <div
                    className="absolute flex items-center justify-center rounded-full bg-orange-500 shadow-lg border-2 border-orange-300"
                    style={{
                      width: "40px",
                      height: "40px",
                      top: "50%",
                      left: "50%",
                      transform: `translate(-50%, -50%) rotate(90deg) translateY(-${size / 2}px) rotate(-90deg)`,
                      opacity: 0.9,
                      zIndex: 15,
                    }}
                  >
                    <div className="text-white text-sm">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 1v6m0 6v6" />
                        <path d="M21 12h-6m-6 0H3" />
                        <path d="m18.364 5.636-4.243 4.243m-4.243 4.243-4.242 4.242" />
                        <path d="m18.364 18.364-4.243-4.243m-4.243-4.243-4.242-4.242" />
                      </svg>
                    </div>
                  </div>

                  {/* Ícone 3 */}
                  <div
                    className="absolute flex items-center justify-center rounded-full bg-orange-500 shadow-lg border-2 border-orange-300"
                    style={{
                      width: "40px",
                      height: "40px",
                      top: "50%",
                      left: "50%",
                      transform: `translate(-50%, -50%) rotate(180deg) translateY(-${size / 2}px) rotate(-180deg)`,
                      opacity: 0.9,
                      zIndex: 15,
                    }}
                  >
                    <div className="text-white text-sm">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12,6 12,12 16,14" />
                      </svg>
                    </div>
                  </div>

                  {/* Ícone 4 */}
                  <div
                    className="absolute flex items-center justify-center rounded-full bg-orange-500 shadow-lg border-2 border-orange-300"
                    style={{
                      width: "40px",
                      height: "40px",
                      top: "50%",
                      left: "50%",
                      transform: `translate(-50%, -50%) rotate(270deg) translateY(-${size / 2}px) rotate(-270deg)`,
                      opacity: 0.9,
                      zIndex: 15,
                    }}
                  >
                    <div className="text-white text-sm">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* LINHA 3 - 6 ÍCONES FIXOS NA BORDA */}
              {i === 2 && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    animation: "rotateClockwise 35s linear infinite",
                    ...getBlurSettings(2),
                    width: `${size}px`,
                    height: `${size}px`,
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {/* Ícone 1 */}
                  <div
                    className="absolute flex items-center justify-center rounded-full bg-orange-500 shadow-lg border-2 border-orange-300"
                    style={{
                      width: "40px",
                      height: "40px",
                      top: "50%",
                      left: "50%",
                      transform: `translate(-50%, -50%) rotate(0deg) translateY(-${size / 2}px) rotate(0deg)`,
                      opacity: 0.9,
                      zIndex: 15,
                    }}
                  >
                    <div className="text-white text-sm">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        <circle cx="9" cy="10" r="1" />
                        <circle cx="15" cy="10" r="1" />
                        <path d="M9.5 13a3.5 3.5 0 0 0 5 0" />
                      </svg>
                    </div>
                  </div>

                  {/* Ícone 2 */}
                  <div
                    className="absolute flex items-center justify-center rounded-full bg-orange-500 shadow-lg border-2 border-orange-300"
                    style={{
                      width: "40px",
                      height: "40px",
                      top: "50%",
                      left: "50%",
                      transform: `translate(-50%, -50%) rotate(60deg) translateY(-${size / 2}px) rotate(-60deg)`,
                      opacity: 0.9,
                      zIndex: 15,
                    }}
                  >
                    <div className="text-white text-sm">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect
                          x="3"
                          y="3"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        />
                        <path d="M9 9h6v6H9z" />
                        <path d="M3 12h18" />
                        <path d="M12 3v18" />
                      </svg>
                    </div>
                  </div>

                  {/* Ícone 3 */}
                  <div
                    className="absolute flex items-center justify-center rounded-full bg-orange-500 shadow-lg border-2 border-orange-300"
                    style={{
                      width: "40px",
                      height: "40px",
                      top: "50%",
                      left: "50%",
                      transform: `translate(-50%, -50%) rotate(120deg) translateY(-${size / 2}px) rotate(-120deg)`,
                      opacity: 0.9,
                      zIndex: 15,
                    }}
                  >
                    <div className="text-white text-sm">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                  </div>

                  {/* Ícone 4 */}
                  <div
                    className="absolute flex items-center justify-center rounded-full bg-orange-500 shadow-lg border-2 border-orange-300"
                    style={{
                      width: "40px",
                      height: "40px",
                      top: "50%",
                      left: "50%",
                      transform: `translate(-50%, -50%) rotate(180deg) translateY(-${size / 2}px) rotate(-180deg)`,
                      opacity: 0.9,
                      zIndex: 15,
                    }}
                  >
                    <div className="text-white text-sm">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                      </svg>
                    </div>
                  </div>

                  {/* Ícone 5 */}
                  <div
                    className="absolute flex items-center justify-center rounded-full bg-orange-500 shadow-lg border-2 border-orange-300"
                    style={{
                      width: "40px",
                      height: "40px",
                      top: "50%",
                      left: "50%",
                      transform: `translate(-50%, -50%) rotate(240deg) translateY(-${size / 2}px) rotate(-240deg)`,
                      opacity: 0.9,
                      zIndex: 15,
                    }}
                  >
                    <div className="text-white text-sm">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="18" y1="20" x2="18" y2="10" />
                        <line x1="12" y1="20" x2="12" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="14" />
                      </svg>
                    </div>
                  </div>

                  {/* Ícone 6 */}
                  <div
                    className="absolute flex items-center justify-center rounded-full bg-orange-500 shadow-lg border-2 border-orange-300"
                    style={{
                      width: "40px",
                      height: "40px",
                      top: "50%",
                      left: "50%",
                      transform: `translate(-50%, -50%) rotate(300deg) translateY(-${size / 2}px) rotate(-300deg)`,
                      opacity: 0.9,
                      zIndex: 15,
                    }}
                  >
                    <div className="text-white text-sm">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <style jsx>{`
          @keyframes rotateClockwise {
            from {
              transform: translate(-50%, -50%) rotate(0deg);
            }
            to {
              transform: translate(-50%, -50%) rotate(360deg);
            }
          }

          @keyframes rotateCounterClockwise {
            from {
              transform: translate(-50%, -50%) rotate(0deg);
            }
            to {
              transform: translate(-50%, -50%) rotate(-360deg);
            }
          }
        `}</style>
      </div>
    </div>
  );
});

export default Particles3D;
