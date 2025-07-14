"use client";
import React from "react";
import {
  AnimatePresence,
  motion,
  LayoutGroup,
  useAnimation,
  stagger,
  useAnimate,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  useAnimationFrame,
  useMotionTemplate,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useId,
  useMemo,
} from "react";
import Particles from "@tsparticles/react";
import { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

// Função utilitária cn (clsx + tailwind-merge)
const cn = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

// Componente ShootingStars
const ShootingStars = ({
  minSpeed = 10,
  maxSpeed = 30,
  minDelay = 1200,
  maxDelay = 4200,
  starColor = "#9E00FF",
  trailColor = "#2EB9DF",
  starWidth = 10,
  starHeight = 1,
  className,
}) => {
  const [star, setStar] = useState(null);
  const svgRef = useRef(null);

  const getRandomStartPoint = () => {
    const side = Math.floor(Math.random() * 4);
    const offset = Math.random() * window.innerWidth;

    switch (side) {
      case 0:
        return { x: offset, y: 0, angle: 45 };
      case 1:
        return { x: window.innerWidth, y: offset, angle: 135 };
      case 2:
        return { x: offset, y: window.innerHeight, angle: 225 };
      case 3:
        return { x: 0, y: offset, angle: 315 };
      default:
        return { x: 0, y: 0, angle: 45 };
    }
  };

  useEffect(() => {
    const createStar = () => {
      const { x, y, angle } = getRandomStartPoint();
      const newStar = {
        id: Date.now(),
        x,
        y,
        angle,
        scale: 1,
        speed: Math.random() * (maxSpeed - minSpeed) + minSpeed,
        distance: 0,
      };
      setStar(newStar);

      const randomDelay = Math.random() * (maxDelay - minDelay) + minDelay;
      setTimeout(createStar, randomDelay);
    };

    createStar();

    return () => {};
  }, [minSpeed, maxSpeed, minDelay, maxDelay]);

  useEffect(() => {
    const moveStar = () => {
      if (star) {
        setStar((prevStar) => {
          if (!prevStar) return null;
          const newX =
            prevStar.x +
            prevStar.speed * Math.cos((prevStar.angle * Math.PI) / 180);
          const newY =
            prevStar.y +
            prevStar.speed * Math.sin((prevStar.angle * Math.PI) / 180);
          const newDistance = prevStar.distance + prevStar.speed;
          const newScale = 1 + newDistance / 100;
          if (
            newX < -20 ||
            newX > window.innerWidth + 20 ||
            newY < -20 ||
            newY > window.innerHeight + 20
          ) {
            return null;
          }
          return {
            ...prevStar,
            x: newX,
            y: newY,
            distance: newDistance,
            scale: newScale,
          };
        });
      }
    };

    const animationFrame = requestAnimationFrame(moveStar);
    return () => cancelAnimationFrame(animationFrame);
  }, [star]);

  return (
    <svg
      ref={svgRef}
      className={cn("w-full h-full absolute inset-0", className)}
    >
      {star && (
        <rect
          key={star.id}
          x={star.x}
          y={star.y}
          width={starWidth * star.scale}
          height={starHeight}
          fill="url(#gradient)"
          transform={`rotate(${star.angle}, ${
            star.x + (starWidth * star.scale) / 2
          }, ${star.y + starHeight / 2})`}
        />
      )}
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: trailColor, stopOpacity: 0 }} />
          <stop
            offset="100%"
            style={{ stopColor: starColor, stopOpacity: 1 }}
          />
        </linearGradient>
      </defs>
    </svg>
  );
};

// Componente StarsBackground
const StarsBackground = ({
  starDensity = 0.00015,
  allStarsTwinkle = true,
  twinkleProbability = 0.7,
  minTwinkleSpeed = 0.5,
  maxTwinkleSpeed = 1,
  className,
}) => {
  const [stars, setStars] = useState([]);
  const canvasRef = useRef(null);

  const generateStars = useCallback(
    (width, height) => {
      const area = width * height;
      const numStars = Math.floor(area * starDensity);
      return Array.from({ length: numStars }, () => {
        const shouldTwinkle =
          allStarsTwinkle || Math.random() < twinkleProbability;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 0.05 + 0.5,
          opacity: Math.random() * 0.5 + 0.5,
          twinkleSpeed: shouldTwinkle
            ? minTwinkleSpeed +
              Math.random() * (maxTwinkleSpeed - minTwinkleSpeed)
            : null,
        };
      });
    },
    [
      starDensity,
      allStarsTwinkle,
      twinkleProbability,
      minTwinkleSpeed,
      maxTwinkleSpeed,
    ],
  );

  useEffect(() => {
    const updateStars = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const { width, height } = canvas.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
        setStars(generateStars(width, height));
      }
    };

    updateStars();

    const resizeObserver = new ResizeObserver(updateStars);
    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current);
    }

    return () => {
      if (canvasRef.current) {
        resizeObserver.unobserve(canvasRef.current);
      }
    };
  }, [
    starDensity,
    allStarsTwinkle,
    twinkleProbability,
    minTwinkleSpeed,
    maxTwinkleSpeed,
    generateStars,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();

        if (star.twinkleSpeed !== null) {
          star.opacity =
            0.5 +
            Math.abs(Math.sin((Date.now() * 0.001) / star.twinkleSpeed) * 0.5);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [stars]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("h-full w-full absolute inset-0", className)}
    />
  );
};

const TechCircle = ({ isDarkTheme = true }) => {
  const flipWords = [
    "estudar",
    "planejar",
    "programar",
    "construir",
    "compartilhar",
  ];

  // Função para obter a saudação baseada no horário atual
  const getGreeting = () => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const timeInMinutes = hour * 60 + minute;

    // 00:01 até 05:00
    if (timeInMinutes >= 1 && timeInMinutes <= 300) {
      return "Boa madrugada";
    }
    // 05:01 até 11:59
    else if (timeInMinutes >= 301 && timeInMinutes <= 719) {
      return "Bom dia";
    }
    // 12:00 até 18:30
    else if (timeInMinutes >= 720 && timeInMinutes <= 1110) {
      return "Boa tarde";
    }
    // 18:31 até 00:00
    else {
      return "Boa noite";
    }
  };

  const [greeting, setGreeting] = useState(getGreeting());

  // Atualizar a saudação a cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000); // Atualiza a cada minuto

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-full bg-transparent p-2 gap-2">
      <div className="relative">
        {/* Aura externa */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, rgba(249, 115, 22, 0.05) 50%, transparent 70%)",
            transform: "scale(0.9)",
            filter: "blur(25px)",
            animation: "pulse 4s ease-in-out infinite alternate",
          }}
        />

        {/* Aura média */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(249, 115, 22, 0.2) 0%, rgba(251, 146, 60, 0.1) 60%, transparent 80%)",
            transform: "scale(0.7)",
            filter: "blur(18px)",
            animation: "pulse 3s ease-in-out infinite alternate",
          }}
        />

        {/* Círculo principal */}
        <div
          className="relative w-20 h-20 rounded-full overflow-hidden"
          style={{
            background: "#111827",
            border: "3px solid transparent",
            backgroundImage: `
              linear-gradient(#111827, #111827),
              linear-gradient(45deg, 
                #f97316 0%, 
                #fb923c 20%, 
                #fdba74 40%, 
                #fbbf24 60%, 
                #fb923c 80%, 
                #f97316 100%
              )
            `,
            backgroundOrigin: "border-box",
            backgroundClip: "content-box, border-box",
            boxShadow: `
              0 0 12px rgba(249, 115, 22, 0.12),
              0 0 25px rgba(249, 115, 22, 0.06),
              inset 0 0 30px rgba(249, 115, 22, 0.03),
              inset 0 -15px 30px rgba(0, 0, 0, 0.4),
              inset 0 15px 30px rgba(255, 255, 255, 0.15),
              0 8px 25px rgba(0, 0, 0, 0.3),
              0 -8px 25px rgba(249, 115, 22, 0.03)
            `,
            transform: "perspective(1000px) rotateX(15deg)",
          }}
        >
          {/* Imagem quadrada */}
          <div className="w-full h-full flex items-center justify-center p-3">
            <div className="w-14 h-14 overflow-hidden pointer-events-none select-none">
              <img
                src="/lovable-uploads/Logo-Ponto.School-Icone.png"
                alt="Logo Ponto School"
                className="w-full h-full object-contain"
                style={{
                  filter: "brightness(1.1) contrast(1.1)",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  MozUserSelect: "none",
                  msUserSelect: "none",
                  WebkitUserDrag: "none",
                  WebkitTouchCallout: "none",
                }}
                draggable={false}
              />
            </div>
          </div>

          {/* Reflexo 3D */}
          <div
            className="absolute top-1 left-1 w-5 h-5 rounded-full opacity-30"
            style={{
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, transparent 70%)",
              filter: "blur(6px)",
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0px) scale(1);
          }
          100% {
            transform: translateY(-8px) scale(1.1);
          }
        }
      `}</style>

      {/* Texto com FlipWords abaixo do círculo */}
      <div className="text-center max-w-2xl space-y-0.5">
        {/* Primeira linha: Saudação */}
        <div
          className="text-xl font-bold tracking-tight leading-tight"
          style={{
            fontFamily:
              "'Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'sans-serif'",
            fontWeight: "700",
            letterSpacing: "-0.02em",
            color: isDarkTheme ? "white" : "#1f2937",
          }}
        >
          <span
            className={
              isDarkTheme
                ? "bg-gradient-to-r from-slate-100 via-white to-slate-100 bg-clip-text text-transparent"
                : "bg-gradient-to-r from-gray-900 via-black to-gray-900 bg-clip-text text-transparent"
            }
          >
            {greeting}, João!
          </span>
        </div>

        {/* Segunda linha: Pergunta com FlipWords */}
        <div
          className="flex flex-wrap items-center justify-center gap-2 text-lg font-semibold tracking-tight"
          style={{
            fontFamily:
              "'Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'sans-serif'",
            fontWeight: "600",
            letterSpacing: "-0.01em",
            color: isDarkTheme ? "white" : "#374151",
          }}
        >
          <span
            className={
              isDarkTheme
                ? "bg-gradient-to-r from-gray-300 via-white to-gray-300 bg-clip-text text-transparent"
                : "bg-gradient-to-r from-gray-700 via-gray-800 to-gray-700 bg-clip-text text-transparent"
            }
          >
            O que vamos
          </span>
          <FlipWords
            words={flipWords}
            duration={5000}
            className={`font-bold text-lg ${isDarkTheme ? "text-orange-500" : "text-orange-700"}`}
            style={{
              fontFamily:
                "'Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'sans-serif'",
              fontWeight: "700",
              letterSpacing: "-0.02em",
            }}
          />
          <span
            className={
              isDarkTheme
                ? "bg-gradient-to-r from-gray-300 via-white to-gray-300 bg-clip-text text-transparent"
                : "bg-gradient-to-r from-gray-700 via-gray-800 to-gray-700 bg-clip-text text-transparent"
            }
          >
            hoje?
          </span>
        </div>
      </div>
    </div>
  );
};

export const Cover = ({ children, className }) => {
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [beamPositions, setBeamPositions] = useState([]);

  useEffect(() => {
    if (ref.current) {
      setContainerWidth(ref.current?.clientWidth ?? 0);
      const height = ref.current?.clientHeight ?? 0;
      const numberOfBeams = Math.floor(height / 10);
      const positions = Array.from(
        { length: numberOfBeams },
        (_, i) => (i + 1) * (height / (numberOfBeams + 1)),
      );
      setBeamPositions(positions);
    }
  }, [ref.current]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      ref={ref}
      className="relative hover:bg-neutral-900 group/cover inline-block dark:bg-neutral-900 bg-neutral-100 px-2 py-2 transition duration-200 rounded-sm"
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 0.2 },
            }}
            className="h-full w-full overflow-hidden absolute inset-0"
          >
            <motion.div
              animate={{
                translateX: ["-50%", "0%"],
              }}
              transition={{
                translateX: {
                  duration: 10,
                  ease: "linear",
                  repeat: Infinity,
                },
              }}
              className="w-[200%] h-full flex"
            >
              <SparklesCore
                background="transparent"
                minSize={0.4}
                maxSize={1}
                particleDensity={500}
                className="w-full h-full"
                particleColor="#FFFFFF"
              />
              <SparklesCore
                background="transparent"
                minSize={0.4}
                maxSize={1}
                particleDensity={500}
                className="w-full h-full"
                particleColor="#FFFFFF"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {beamPositions.map((position, index) => (
        <Beam
          key={index}
          hovered={hovered}
          duration={Math.random() * 2 + 1}
          delay={Math.random() * 2 + 1}
          width={containerWidth}
          style={{
            top: `${position}px`,
          }}
        />
      ))}
      <motion.span
        key={String(hovered)}
        animate={{
          scale: hovered ? 0.8 : 1,
          x: hovered ? [0, -30, 30, -30, 30, 0] : 0,
          y: hovered ? [0, 30, -30, 30, -30, 0] : 0,
        }}
        exit={{
          filter: "none",
          scale: 1,
          x: 0,
          y: 0,
        }}
        transition={{
          duration: 0.2,
          x: {
            duration: 0.2,
            repeat: Infinity,
            repeatType: "loop",
          },
          y: {
            duration: 0.2,
            repeat: Infinity,
            repeatType: "loop",
          },
          scale: {
            duration: 0.2,
          },
          filter: {
            duration: 0.2,
          },
        }}
        className={cn(
          "dark:text-white inline-block text-neutral-900 relative z-20 group-hover/cover:text-white transition duration-200",
          className,
        )}
      >
        {children}
      </motion.span>
      <CircleIcon className="absolute -right-[2px] -top-[2px]" />
      <CircleIcon className="absolute -bottom-[2px] -right-[2px]" delay={0.4} />
      <CircleIcon className="absolute -left-[2px] -top-[2px]" delay={0.8} />
      <CircleIcon className="absolute -bottom-[2px] -left-[2px]" delay={1.6} />
    </div>
  );
};

export const Beam = ({
  className,
  delay,
  duration,
  hovered,
  width = 600,
  ...svgProps
}) => {
  const id = useId();

  return (
    <motion.svg
      width={width ?? "600"}
      height="1"
      viewBox={`0 0 ${width ?? "600"} 1`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("absolute inset-x-0 w-full", className)}
      {...svgProps}
    >
      <motion.path
        d={`M0 0.5H${width ?? "600"}`}
        stroke={`url(#svgGradient-${id})`}
      />

      <defs>
        <motion.linearGradient
          id={`svgGradient-${id}`}
          key={String(hovered)}
          gradientUnits="userSpaceOnUse"
          initial={{
            x1: "0%",
            x2: hovered ? "-10%" : "-5%",
            y1: 0,
            y2: 0,
          }}
          animate={{
            x1: "110%",
            x2: hovered ? "100%" : "105%",
            y1: 0,
            y2: 0,
          }}
          transition={{
            duration: hovered ? 0.5 : (duration ?? 2),
            ease: "linear",
            repeat: Infinity,
            delay: hovered ? Math.random() * (1 - 0.2) + 0.2 : 0,
            repeatDelay: hovered ? Math.random() * (2 - 1) + 1 : (delay ?? 1),
          }}
        >
          <stop stopColor="#2EB9DF" stopOpacity="0" />
          <stop stopColor="#3b82f6" />
          <stop offset="1" stopColor="#3b82f6" stopOpacity="0" />
        </motion.linearGradient>
      </defs>
    </motion.svg>
  );
};

export const CircleIcon = ({ className, delay }) => {
  return (
    <div
      className={cn(
        `pointer-events-none animate-pulse group-hover/cover:hidden group-hover/cover:opacity-100 group h-2 w-2 rounded-full bg-neutral-600 dark:bg-white opacity-20 group-hover/cover:bg-white`,
        className,
      )}
    ></div>
  );
};

export const FlipWords = ({ words, duration = 3000, className }) => {
  const [currentWord, setCurrentWord] = useState(words[0]);
  const [isAnimating, setIsAnimating] = useState(false);

  const startAnimation = useCallback(() => {
    const word = words[words.indexOf(currentWord) + 1] || words[0];
    setCurrentWord(word);
    setIsAnimating(true);
  }, [currentWord, words]);

  useEffect(() => {
    if (!isAnimating)
      setTimeout(() => {
        startAnimation();
      }, duration);
  }, [isAnimating, duration, startAnimation]);

  return (
    <AnimatePresence
      onExitComplete={() => {
        setIsAnimating(false);
      }}
    >
      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          type: "spring",
          stiffness: 60,
          damping: 15,
        }}
        exit={{
          opacity: 0,
          y: -20,
          x: 20,
          filter: "blur(4px)",
          scale: 1.2,
          position: "absolute",
        }}
        className={cn("z-10 inline-block relative text-center px-2", className)}
        style={{
          fontFamily:
            "'Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'sans-serif'",
          fontWeight: "700",
          letterSpacing: "-0.02em",
        }}
        key={currentWord}
      >
        {currentWord.split(" ").map((word, wordIndex) => (
          <motion.span
            key={word + wordIndex}
            initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              delay: wordIndex * 0.4,
              duration: 0.5,
            }}
            className="inline-block whitespace-nowrap"
          >
            {word.split("").map((letter, letterIndex) => (
              <motion.span
                key={word + letterIndex}
                initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  delay: wordIndex * 0.4 + letterIndex * 0.08,
                  duration: 0.4,
                }}
                className="inline-block"
              >
                {letter}
              </motion.span>
            ))}
            <span className="inline-block">&nbsp;</span>
          </motion.span>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};

export const TypewriterEffect = ({ words, className, cursorClassName }) => {
  // split text inside of words into array of characters
  const wordsArray = words.map((word) => {
    return {
      ...word,
      text: word.text.split(""),
    };
  });

  const [scope, animate] = useAnimate();
  const isInView = useInView(scope);
  useEffect(() => {
    if (isInView) {
      animate(
        "span",
        {
          display: "inline-block",
          opacity: 1,
          width: "fit-content",
        },
        {
          duration: 0.3,
          delay: stagger(0.1),
          ease: "easeInOut",
        },
      );
    }
  }, [isInView]);

  const renderWords = () => {
    return (
      <motion.div ref={scope} className="inline">
        {wordsArray.map((word, idx) => {
          return (
            <div key={`word-${idx}`} className="inline-block">
              {word.text.map((char, index) => (
                <motion.span
                  initial={{}}
                  key={`char-${index}`}
                  className={cn(
                    `dark:text-white text-black opacity-0 hidden`,
                    word.className,
                  )}
                >
                  {char}
                </motion.span>
              ))}
              &nbsp;
            </div>
          );
        })}
      </motion.div>
    );
  };
  return (
    <div
      className={cn(
        "text-base sm:text-xl md:text-3xl lg:text-5xl font-bold text-center",
        className,
      )}
    >
      {renderWords()}
      <motion.span
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className={cn(
          "inline-block rounded-sm w-[4px] h-4 md:h-6 lg:h-10 bg-blue-500",
          cursorClassName,
        )}
      ></motion.span>
    </div>
  );
};

export const TypewriterEffectSmooth = ({
  words,
  className,
  cursorClassName,
}) => {
  // split text inside of words into array of characters
  const wordsArray = words.map((word) => {
    return {
      ...word,
      text: word.text.split(""),
    };
  });
  const renderWords = () => {
    return (
      <div>
        {wordsArray.map((word, idx) => {
          return (
            <div key={`word-${idx}`} className="inline-block">
              {word.text.map((char, index) => (
                <span
                  key={`char-${index}`}
                  className={cn(`dark:text-white text-black `, word.className)}
                >
                  {char}
                </span>
              ))}
              &nbsp;
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={cn("flex space-x-1 my-6", className)}>
      <motion.div
        className="overflow-hidden pb-2"
        initial={{
          width: "0%",
        }}
        whileInView={{
          width: "fit-content",
        }}
        transition={{
          duration: 2,
          ease: "linear",
          delay: 1,
        }}
      >
        <div
          className="text-xs sm:text-base md:text-xl lg:text:3xl xl:text-5xl font-bold"
          style={{
            whiteSpace: "nowrap",
          }}
        >
          {renderWords()}{" "}
        </div>{" "}
      </motion.div>
      <motion.span
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className={cn(
          "block rounded-sm w-[4px]  h-4 sm:h-6 xl:h-12 bg-blue-500",
          cursorClassName,
        )}
      ></motion.span>
    </div>
  );
};

export const SparklesCore = (props) => {
  const {
    id,
    className,
    background,
    minSize,
    maxSize,
    speed,
    particleColor,
    particleDensity,
  } = props;
  const [init, setInit] = useState(false);
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);
  const controls = useAnimation();

  const particlesLoaded = async (container) => {
    if (container) {
      controls.start({
        opacity: 1,
        transition: {
          duration: 1,
        },
      });
    }
  };

  const generatedId = useId();
  return (
    <motion.div animate={controls} className={cn("opacity-0", className)}>
      {init && (
        <Particles
          id={id || generatedId}
          className={cn("h-full w-full")}
          particlesLoaded={particlesLoaded}
          options={{
            background: {
              color: {
                value: background || "#0d47a1",
              },
            },
            fullScreen: {
              enable: false,
              zIndex: 1,
            },
            fpsLimit: 120,
            interactivity: {
              events: {
                onClick: {
                  enable: true,
                  mode: "push",
                },
                onHover: {
                  enable: false,
                  mode: "repulse",
                },
                resize: true,
              },
              modes: {
                push: {
                  quantity: 4,
                },
                repulse: {
                  distance: 200,
                  duration: 0.4,
                },
              },
            },
            particles: {
              bounce: {
                horizontal: {
                  value: 1,
                },
                vertical: {
                  value: 1,
                },
              },
              collisions: {
                absorb: {
                  speed: 2,
                },
                bounce: {
                  horizontal: {
                    value: 1,
                  },
                  vertical: {
                    value: 1,
                  },
                },
                enable: false,
                maxSpeed: 50,
                mode: "bounce",
                overlap: {
                  enable: true,
                  retries: 0,
                },
              },
              color: {
                value: particleColor || "#ffffff",
                animation: {
                  h: {
                    count: 0,
                    enable: false,
                    speed: 1,
                    decay: 0,
                    delay: 0,
                    sync: true,
                    offset: 0,
                  },
                  s: {
                    count: 0,
                    enable: false,
                    speed: 1,
                    decay: 0,
                    delay: 0,
                    sync: true,
                    offset: 0,
                  },
                  l: {
                    count: 0,
                    enable: false,
                    speed: 1,
                    decay: 0,
                    delay: 0,
                    sync: true,
                    offset: 0,
                  },
                },
              },
              effect: {
                close: true,
                fill: true,
                options: {},
                type: {},
              },
              groups: {},
              move: {
                angle: {
                  offset: 0,
                  value: 90,
                },
                attract: {
                  distance: 200,
                  enable: false,
                  rotate: {
                    x: 3000,
                    y: 3000,
                  },
                },
                center: {
                  x: 50,
                  y: 50,
                  mode: "percent",
                  radius: 0,
                },
                decay: 0,
                distance: {},
                direction: "none",
                drift: 0,
                enable: true,
                gravity: {
                  acceleration: 9.81,
                  enable: false,
                  inverse: false,
                  maxSpeed: 50,
                },
                path: {
                  clamp: true,
                  delay: {
                    value: 0,
                  },
                  enable: false,
                  options: {},
                },
                outModes: {
                  default: "out",
                },
                random: false,
                size: false,
                speed: {
                  min: 0.1,
                  max: 1,
                },
                spin: {
                  acceleration: 0,
                  enable: false,
                },
                straight: false,
                trail: {
                  enable: false,
                  length: 10,
                  fill: {},
                },
                vibrate: false,
                warp: false,
              },
              number: {
                density: {
                  enable: true,
                  width: 400,
                  height: 400,
                },
                limit: {
                  mode: "delete",
                  value: 0,
                },
                value: particleDensity || 120,
              },
              opacity: {
                value: {
                  min: 0.1,
                  max: 1,
                },
                animation: {
                  count: 0,
                  enable: true,
                  speed: speed || 4,
                  decay: 0,
                  delay: 0,
                  sync: false,
                  mode: "auto",
                  startValue: "random",
                  destroy: "none",
                },
              },
              reduceDuplicates: false,
              shadow: {
                blur: 0,
                color: {
                  value: "#000",
                },
                enable: false,
                offset: {
                  x: 0,
                  y: 0,
                },
              },
              shape: {
                close: true,
                fill: true,
                options: {},
                type: "circle",
              },
              size: {
                value: {
                  min: minSize || 1,
                  max: maxSize || 3,
                },
                animation: {
                  count: 0,
                  enable: false,
                  speed: 5,
                  decay: 0,
                  delay: 0,
                  sync: false,
                  mode: "auto",
                  startValue: "random",
                  destroy: "none",
                },
              },
              stroke: {
                width: 0,
              },
              zIndex: {
                value: 0,
                opacityRate: 1,
                sizeRate: 1,
                velocityRate: 1,
              },
              destroy: {
                bounds: {},
                mode: "none",
                split: {
                  count: 1,
                  factor: {
                    value: 3,
                  },
                  rate: {
                    value: {
                      min: 4,
                      max: 9,
                    },
                  },
                  sizeOffset: true,
                },
              },
              roll: {
                darken: {
                  enable: false,
                  value: 0,
                },
                enable: false,
                enlighten: {
                  enable: false,
                  value: 0,
                },
                mode: "vertical",
                speed: 25,
              },
              tilt: {
                value: 0,
                animation: {
                  enable: false,
                  speed: 0,
                  decay: 0,
                  sync: false,
                },
                direction: "clockwise",
                enable: false,
              },
              twinkle: {
                lines: {
                  enable: false,
                  frequency: 0.05,
                  opacity: 1,
                },
                particles: {
                  enable: false,
                  frequency: 0.05,
                  opacity: 1,
                },
              },
              wobble: {
                distance: 5,
                enable: false,
                speed: {
                  angle: 50,
                  move: 10,
                },
              },
              life: {
                count: 0,
                delay: {
                  value: 0,
                  sync: false,
                },
                duration: {
                  value: 0,
                  sync: false,
                },
              },
              rotate: {
                value: 0,
                animation: {
                  enable: false,
                  speed: 0,
                  decay: 0,
                  sync: false,
                },
                direction: "clockwise",
                path: false,
              },
              orbit: {
                animation: {
                  count: 0,
                  enable: false,
                  speed: 1,
                  decay: 0,
                  delay: 0,
                  sync: false,
                },
                enable: false,
                opacity: 1,
                rotation: {
                  value: 45,
                },
                width: 1,
              },
              links: {
                blink: false,
                color: {
                  value: "#fff",
                },
                consent: false,
                distance: 100,
                enable: false,
                frequency: 1,
                opacity: 1,
                shadow: {
                  blur: 5,
                  color: {
                    value: "#000",
                  },
                  enable: false,
                },
                triangles: {
                  enable: false,
                  frequency: 1,
                },
                width: 1,
                warp: false,
              },
              repulse: {
                value: 0,
                enabled: false,
                distance: 1,
                duration: 1,
                factor: 1,
                speed: 1,
              },
            },
            detectRetina: true,
          }}
        />
      )}
    </motion.div>
  );
};

// Icon de Aluno
const StudentIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// Ícones para o FloatingDock
const HistoryIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </svg>
);

const SuggestionsIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M12 1l3.5 8.5L24 12l-8.5 3.5L12 24l-3.5-8.5L0 12l8.5-3.5L12 1z" />
  </svg>
);

const NotificationsIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const SettingsIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

const MenuIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

// Componentes do FloatingDock
const FloatingDock = ({ items, desktopClassName, mobileClassName }) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
};

const FloatingDockMobile = ({ items, className }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("relative block md:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="absolute inset-x-0 bottom-full mb-2 flex flex-col gap-2"
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  transition: {
                    delay: idx * 0.05,
                  },
                }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                <a
                  href={item.href}
                  key={item.title}
                  className="flex h-10 w-10 items-center justify-center rounded-full transition-colors"
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #E9AB6C",
                  }}
                >
                  <div className="h-4 w-4" style={{ color: "#f97316" }}>
                    {item.icon}
                  </div>
                </a>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-full transition-colors"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #E9AB6C",
        }}
      >
        <MenuIcon style={{ color: "#f97316" }} />
      </button>
    </div>
  );
};

const FloatingDockDesktop = ({ items, className }) => {
  let mouseY = useMotionValue(Infinity);
  return (
    <motion.div
      onMouseMove={(e) => mouseY.set(e.pageY)}
      onMouseLeave={() => mouseY.set(Infinity)}
      className={cn(
        "mx-auto flex flex-col items-center gap-4 rounded-2xl px-3 py-4 border",
        className,
      )}
      style={{
        background: "linear-gradient(to bottom, #f97316, #E9AB6C)",
        borderColor: "#E9AB6C",
      }}
    >
      {items.map((item) => (
        <IconContainer mouseY={mouseY} key={item.title} {...item} />
      ))}
    </motion.div>
  );
};

function IconContainer({ mouseY, title, icon, href }) {
  let ref = useRef(null);

  let distance = useTransform(mouseY, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { y: 0, height: 0 };

    return val - bounds.y - bounds.height / 2;
  });

  let widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  let heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);

  let widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);
  let heightTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 40, 20],
  );

  let width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  let widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);

  return (
    <a href={href}>
      <motion.div
        ref={ref}
        style={{
          width,
          height,
          backgroundColor: "#ffffff",
          border: "1px solid #E9AB6C",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex aspect-square items-center justify-center rounded-full transition-colors"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, x: -10, y: "-50%" }}
              animate={{ opacity: 1, x: 0, y: "-50%" }}
              exit={{ opacity: 0, x: -2, y: "-50%" }}
              className="absolute top-1/2 rounded-md border px-2 py-0.5 text-xs whitespace-nowrap"
              style={{
                backgroundColor: "#ffffff",
                borderColor: "#E9AB6C",
                color: "#f97316",
                right: "calc(100% + 12px)",
                transform: "translateY(-50%)",
              }}
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{
            width: widthIcon,
            height: heightIcon,
            color: "#f97316",
          }}
          className="flex items-center justify-center"
        >
          {icon}
        </motion.div>
      </motion.div>
    </a>
  );
}

// Dados para o dock
const dockItems = [
  {
    title: "Histórico",
    icon: <HistoryIcon />,
    href: "#",
  },
  {
    title: "Sugestões",
    icon: <SuggestionsIcon />,
    href: "#",
  },
  {
    title: "Notificações",
    icon: <NotificationsIcon />,
    href: "#",
  },
  {
    title: "Configurações",
    icon: <SettingsIcon />,
    href: "#",
  },
];

// Ícones para perfis
const ProfileIcons = {
  student: (
    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
    </svg>
  ),
  teacher: (
    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
    </svg>
  ),
  coordinator: (
    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14 6V4h-4v2h4zM4 8v11h16V8H4zm16-2c1.11 0 2 .89 2 2v11c0 1.11-.89 2-2 2H4c-1.11 0-2-.89-2-2V8c0-1.11.89-2 2-2h16z" />
      <path d="M12 9c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z" />
    </svg>
  ),
  expert: (
    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7.51-3.49L17.5 6.5 9.99 9.99 6.5 17.5zm5.5-6.6c.61 0 1.1.49 1.1 1.1s-.49 1.1-1.1 1.1-1.1-.49-1.1-1.1.49-1.1 1.1-1.1z" />
    </svg>
  ),
  responsible: (
    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  ),
};

// Dados dos perfis
const profiles = [
  {
    id: "student",
    name: "Aluno",
    icon: ProfileIcons.student,
    color: "bg-orange-500",
  },
  {
    id: "teacher",
    name: "Professor",
    icon: ProfileIcons.teacher,
    color: "bg-orange-500",
  },
  {
    id: "coordinator",
    name: "Coordenador",
    icon: ProfileIcons.coordinator,
    color: "bg-orange-500",
  },
  {
    id: "expert",
    name: "Expert",
    icon: ProfileIcons.expert,
    color: "bg-orange-500",
  },
  {
    id: "responsible",
    name: "Responsável",
    icon: ProfileIcons.responsible,
    color: "bg-orange-500",
  },
];

// Componente ProfileOptionBubble
const ProfileOptionBubble = ({ profile, onClick, index }) => {
  const spacing = 120;

  const positions = [
    { x: -spacing * 2, y: 0 },
    { x: -spacing, y: 0 },
    { x: spacing, y: 0 },
    { x: spacing * 2, y: 0 },
  ];

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        x: positions[index]?.x || 0,
        y: positions[index]?.y || 0,
      }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: index * 0.1,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="absolute select-none"
      style={{
        zIndex: 999,
        cursor: "pointer",
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
      }}
      onClick={() => onClick(profile)}
    >
      <div
        className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center ${profile.color} hover:shadow-xl transition-shadow duration-200 border-2 border-orange-300/50`}
        style={{ cursor: "pointer" }}
      >
        <div className="pointer-events-none">{profile.icon}</div>
      </div>
      <div
        className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap pointer-events-none"
        style={{ zIndex: 1000 }}
      >
        <span className="text-xs font-medium text-orange-300 bg-black/80 px-3 py-1 rounded-full shadow-lg border border-orange-400/30">
          {profile.name}
        </span>
      </div>
    </motion.div>
  );
};

// Componente do Ícone Central
const CentralIcon = ({ isDarkTheme, onExpandedChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(profiles[0]);
  const [isHovered, setIsHovered] = useState(false);

  const handleAvatarClick = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    onExpandedChange(newExpandedState);
  };

  const handleProfileSelect = (profile) => {
    setSelectedProfile(profile);
    setIsExpanded(false);
    onExpandedChange(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div className="relative">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative select-none"
        onClick={handleAvatarClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          cursor: "pointer",
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
      >
        <div
          className="flex items-center justify-center rounded-full bg-orange-500 shadow-lg border-4 border-orange-300 transition-all duration-200"
          style={{
            width: "80px",
            height: "80px",
            zIndex: 1000,
            position: "relative",
            cursor: "pointer",
            pointerEvents: "all",
          }}
        >
          <div className="text-white pointer-events-none">
            {selectedProfile.icon || <StudentIcon />}
          </div>
        </div>

        <motion.div
          animate={{ rotate: isExpanded ? 45 : 0 }}
          className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full shadow-md flex items-center justify-center border-2 transition-all duration-200 ${
            isDarkTheme
              ? "bg-white border-orange-200"
              : "bg-gray-100 border-orange-300"
          }`}
          style={{
            zIndex: 1001,
            cursor: "pointer",
            pointerEvents: "none",
          }}
        >
          <svg
            className="w-3 h-3 text-orange-500 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 999 }}
          >
            {profiles
              .filter((profile) => profile.id !== selectedProfile.id)
              .map((profile, index) => (
                <div key={profile.id} className="pointer-events-auto">
                  <ProfileOptionBubble
                    profile={profile}
                    onClick={handleProfileSelect}
                    index={index}
                  />
                </div>
              ))}
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-20"
            style={{ cursor: "default" }}
            onClick={() => {
              setIsExpanded(false);
              onExpandedChange(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// MovingBorder component
const MovingBorder = ({
  children,
  duration = 3000,
  rx = "30%",
  ry = "30%",
}) => {
  const pathRef = useRef(null);
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

// Componente AIMessageBox
const AIMessageBox = ({ isDarkTheme = true }) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedMode, setSelectedMode] = useState("Agente IA");
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const textareaRef = useRef(null);

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  const handleSend = () => {
    if (message.trim()) {
      console.log("Enviando mensagem:", message);
      setMessage("");
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [message]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <style jsx>{`
        @keyframes pulseGlow {
          0%,
          100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .message-container {
          position: relative;
          background: transparent;
          border-radius: 20px;
          padding: 2px;
          transition: all 0.3s ease;
          width: 600px;
          overflow: visible;
        }

        .message-container-inner {
          position: relative;
          background: linear-gradient(145deg, #1a1a1a, #2d2d2d);
          border-radius: 18px;
          height: 100%;
          width: 100%;
          box-shadow:
            0 25px 50px rgba(0, 0, 0, 0.5),
            0 15px 30px rgba(0, 0, 0, 0.4),
            0 5px 15px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          z-index: 3;
        }

        .moving-border-container {
          position: absolute;
          inset: 0;
          border-radius: 20px;
          opacity: 1;
          transition: opacity 0.3s ease;
          overflow: hidden;
          z-index: 2;
          pointer-events: none;
        }

        .typing .moving-border-container {
          opacity: 1;
        }

        .moving-gradient {
          width: 120px;
          height: 120px;
          background: radial-gradient(
            circle,
            rgba(255, 107, 53, 1) 30%,
            rgba(247, 147, 30, 0.8) 50%,
            transparent 70%
          );
          border-radius: 50%;
          filter: blur(12px);
          box-shadow:
            0 0 40px rgba(255, 107, 53, 0.6),
            0 0 80px rgba(255, 107, 53, 0.4),
            0 0 120px rgba(255, 107, 53, 0.2);
        }

        .inner-container {
          background: linear-gradient(145deg, #1e1e1e, #2a2a2a);
          border-radius: 18px;
          padding: 20px;
          border: 1px solid #333;
          transition: all 0.3s ease;
        }

        .typing .inner-container {
          border-color: #333;
          box-shadow: none;
        }

        .textarea-custom {
          background: transparent;
          border: none;
          color: #e0e0e0;
          font-size: 16px;
          line-height: 1.5;
          resize: none;
          outline: none;
          width: 100%;
          min-height: 24px;
          max-height: 200px;
          font-family:
            "Inter",
            -apple-system,
            BlinkMacSystemFont,
            sans-serif;
          caret-color: #ff6b35;
        }

        .textarea-custom::placeholder {
          color: #999;
          font-style: italic;
        }

        .action-button {
          background: linear-gradient(145deg, #ff6b35, #f7931e);
          border: none;
          border-radius: 50%;
          color: white;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow:
            0 8px 16px rgba(255, 107, 53, 0.3),
            0 4px 8px rgba(255, 107, 53, 0.2),
            inset 0 2px 4px rgba(255, 255, 255, 0.2),
            inset 0 -2px 4px rgba(0, 0, 0, 0.2);
        }

        .action-button:hover {
          transform: translateY(-3px);
          box-shadow:
            0 12px 24px rgba(255, 107, 53, 0.4),
            0 6px 12px rgba(255, 107, 53, 0.3),
            inset 0 2px 4px rgba(255, 255, 255, 0.3),
            inset 0 -2px 4px rgba(0, 0, 0, 0.1);
        }

        .action-button:active {
          transform: translateY(-1px);
          box-shadow:
            0 4px 8px rgba(255, 107, 53, 0.4),
            0 2px 4px rgba(255, 107, 53, 0.3),
            inset 0 2px 8px rgba(0, 0, 0, 0.3),
            inset 0 -1px 2px rgba(255, 255, 255, 0.2);
        }

        .voice-button {
          background: linear-gradient(145deg, #666, #888);
          box-shadow:
            0 8px 16px rgba(0, 0, 0, 0.2),
            0 4px 8px rgba(0, 0, 0, 0.15),
            inset 0 2px 4px rgba(255, 255, 255, 0.1),
            inset 0 -2px 4px rgba(0, 0, 0, 0.3);
        }

        .voice-button:hover {
          background: linear-gradient(145deg, #777, #999);
          box-shadow:
            0 12px 24px rgba(0, 0, 0, 0.3),
            0 6px 12px rgba(0, 0, 0, 0.2),
            inset 0 2px 4px rgba(255, 255, 255, 0.15),
            inset 0 -2px 4px rgba(0, 0, 0, 0.2);
        }

        .voice-button:active {
          transform: translateY(-1px);
          box-shadow:
            0 4px 8px rgba(0, 0, 0, 0.3),
            0 2px 4px rgba(0, 0, 0, 0.2),
            inset 0 2px 8px rgba(0, 0, 0, 0.4),
            inset 0 -1px 2px rgba(255, 255, 255, 0.1);
        }

        .file-button {
          background: linear-gradient(145deg, #444, #666);
          border: none;
          border-radius: 50%;
          color: #ccc;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow:
            0 8px 16px rgba(0, 0, 0, 0.2),
            0 4px 8px rgba(0, 0, 0, 0.15),
            inset 0 2px 4px rgba(255, 255, 255, 0.1),
            inset 0 -2px 4px rgba(0, 0, 0, 0.3);
        }

        .file-button:hover {
          background: linear-gradient(145deg, #555, #777);
          color: white;
          transform: translateY(-3px);
          box-shadow:
            0 12px 24px rgba(0, 0, 0, 0.3),
            0 6px 12px rgba(0, 0, 0, 0.2),
            inset 0 2px 4px rgba(255, 255, 255, 0.15),
            inset 0 -2px 4px rgba(0, 0, 0, 0.2);
        }

        .file-button:active {
          transform: translateY(-1px);
          box-shadow:
            0 4px 8px rgba(0, 0, 0, 0.3),
            0 2px 4px rgba(0, 0, 0, 0.2),
            inset 0 2px 8px rgba(0, 0, 0, 0.4),
            inset 0 -1px 2px rgba(255, 255, 255, 0.1);
        }

        .mode-selector {
          position: relative;
          display: inline-block;
        }

        .mode-button {
          background: linear-gradient(145deg, #444, #666);
          border: 1px solid #555;
          border-radius: 20px;
          color: #ccc;
          padding: 8px 16px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow:
            0 8px 16px rgba(0, 0, 0, 0.2),
            0 4px 8px rgba(0, 0, 0, 0.15),
            inset 0 2px 4px rgba(255, 255, 255, 0.1),
            inset 0 -2px 4px rgba(0, 0, 0, 0.3);
        }

        .mode-button:hover {
          background: linear-gradient(145deg, #555, #777);
          border-color: #666;
          color: white;
          transform: translateY(-3px);
          box-shadow:
            0 12px 24px rgba(0, 0, 0, 0.3),
            0 6px 12px rgba(0, 0, 0, 0.2),
            inset 0 2px 4px rgba(255, 255, 255, 0.15),
            inset 0 -2px 4px rgba(0, 0, 0, 0.2);
        }

        .mode-button:active {
          transform: translateY(-1px);
          box-shadow:
            0 4px 8px rgba(0, 0, 0, 0.3),
            0 2px 4px rgba(0, 0, 0, 0.2),
            inset 0 2px 8px rgba(0, 0, 0, 0.4),
            inset 0 -1px 2px rgba(255, 255, 255, 0.1);
        }

        .mode-dropdown {
          position: absolute;
          bottom: 100%;
          left: 0;
          background: linear-gradient(145deg, #2a2a2a, #1e1e1e);
          border: 1px solid #555;
          border-radius: 16px;
          padding: 12px;
          margin-bottom: 12px;
          min-width: 180px;
          box-shadow:
            0 20px 40px rgba(0, 0, 0, 0.6),
            0 10px 20px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(255, 107, 53, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          z-index: 1000;
          backdrop-filter: blur(10px);
        }

        .mode-option {
          padding: 12px 16px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #ccc;
          font-size: 13px;
          font-weight: 500;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 4px;
          position: relative;
          overflow: hidden;
        }

        .mode-option:last-child {
          margin-bottom: 0;
        }

        .mode-option::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(255, 107, 53, 0.1),
            rgba(247, 147, 30, 0.1)
          );
          opacity: 0;
          transition: opacity 0.3s ease;
          border-radius: 12px;
        }

        .mode-option:hover::before {
          opacity: 1;
        }

        .mode-option:hover {
          color: #ff6b35;
          transform: translateX(4px);
          background: rgba(255, 107, 53, 0.1);
          border: 1px solid rgba(255, 107, 53, 0.2);
          box-shadow: 0 4px 12px rgba(255, 107, 53, 0.2);
        }

        .mode-option.active {
          background: linear-gradient(135deg, #ff6b35, #f7931e);
          color: white;
          border: 1px solid #ff6b35;
          box-shadow:
            0 6px 16px rgba(255, 107, 53, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .mode-option.active::before {
          opacity: 0;
        }

        .mode-icon {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .mode-option:hover .mode-icon {
          transform: scale(1.1);
        }

        .mode-option.active .mode-icon {
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }

        .dropdown-arrow {
          transition: transform 0.3s ease;
        }

        .dropdown-arrow.open {
          transform: rotate(180deg);
        }

        .tech-accent {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          background: #ff6b35;
          border-radius: 50%;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .typing .tech-accent {
          opacity: 1;
          animation: pulseGlow 1.5s ease infinite;
        }

        .expanded-card {
          background: linear-gradient(
            145deg,
            rgba(30, 30, 30, 0.95),
            rgba(26, 26, 26, 0.9)
          );
          border: 1px solid rgba(68, 68, 68, 0.8);
          border-radius: 16px;
          padding: 16px 20px;
          position: relative;
          overflow: hidden;
        }

        .expanded-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(255, 107, 53, 0.05) 0%,
            transparent 50%,
            rgba(247, 147, 30, 0.05) 100%
          );
          border-radius: 16px;
          pointer-events: none;
        }

        .thinking-indicator {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .pulse-dot {
          width: 12px;
          height: 12px;
          background: linear-gradient(135deg, #ff6b35, #f7931e);
          border-radius: 50%;
          animation: softPulse 2s ease-in-out infinite;
          box-shadow:
            0 0 12px rgba(255, 107, 53, 0.4),
            0 0 24px rgba(255, 107, 53, 0.2);
        }

        .thinking-text {
          color: #ccc;
          font-size: 13px;
          font-weight: 400;
          line-height: 1.4;
        }

        @keyframes softPulse {
          0%,
          100% {
            opacity: 0.8;
            transform: scale(1);
            box-shadow:
              0 0 12px rgba(255, 107, 53, 0.4),
              0 0 24px rgba(255, 107, 53, 0.2);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
            box-shadow:
              0 0 16px rgba(255, 107, 53, 0.6),
              0 0 32px rgba(255, 107, 53, 0.3);
          }
        }
      `}</style>

      <div
        className={`message-container ${isTyping || isFocused ? "typing" : ""}`}
      >
        <div className="moving-border-container">
          <MovingBorder duration={3000} rx="20px" ry="20px">
            <div className="moving-gradient" />
          </MovingBorder>
        </div>
        <div className="message-container-inner">
          <div className="tech-accent"></div>
          <div className="inner-container">
            <div className="flex flex-col gap-3 relative">
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Digite sua mensagem para a IA..."
                  className="textarea-custom"
                  rows={1}
                />
              </div>

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.85,
                  y: 20,
                  filter: "blur(10px)",
                }}
                animate={
                  isTyping
                    ? {
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        filter: "blur(0px)",
                      }
                    : {
                        opacity: 0,
                        scale: 0.85,
                        y: 20,
                        filter: "blur(10px)",
                      }
                }
                transition={{
                  duration: 0.6,
                  ease: [0.23, 1, 0.32, 1],
                  opacity: { duration: 0.4 },
                  scale: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
                  y: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
                  filter: { duration: 0.3 },
                }}
                className="expanded-section"
                style={{
                  position: "absolute",
                  top: "-85px",
                  left: 0,
                  right: 0,
                  zIndex: 1000,
                  pointerEvents: isTyping ? "auto" : "none",
                }}
              >
                <motion.div
                  className="expanded-card"
                  initial={{ backdropFilter: "blur(0px)" }}
                  animate={{ backdropFilter: "blur(20px)" }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <div className="thinking-indicator">
                    <motion.div
                      className="pulse-dot"
                      initial={{ scale: 0 }}
                      animate={isTyping ? { scale: 1 } : { scale: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.3,
                        ease: [0.68, -0.55, 0.265, 1.55],
                      }}
                    />
                    <motion.div
                      className="thinking-text"
                      initial={{ opacity: 0, x: -10 }}
                      animate={
                        isTyping ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }
                      }
                      transition={{
                        duration: 0.4,
                        delay: 0.4,
                        ease: [0.25, 0.1, 0.25, 1],
                      }}
                    >
                      {selectedMode === "Agente IA"
                        ? "Seu Agente IA está pensando em uma resposta para isso..."
                        : "Seu Assistente IA está pensando em uma resposta para isso..."}
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>

              <div className="flex gap-3 items-center justify-between">
                <div className="mode-selector">
                  <button
                    className="mode-button"
                    onClick={() => setShowModeDropdown(!showModeDropdown)}
                  >
                    {selectedMode === "Agente IA" ? (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9 12l2 2 4-4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    {selectedMode}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      className={`dropdown-arrow ${showModeDropdown ? "open" : ""}`}
                    >
                      <path
                        d="M6 9l6 6 6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {showModeDropdown && (
                    <div className="mode-dropdown">
                      <button
                        className={`mode-option ${selectedMode === "Agente IA" ? "active" : ""}`}
                        onClick={() => {
                          setSelectedMode("Agente IA");
                          setShowModeDropdown(false);
                        }}
                      >
                        <svg
                          className="mode-icon"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M9 12l2 2 4-4"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Agente IA
                      </button>
                      <button
                        className={`mode-option ${selectedMode === "Assistente IA" ? "active" : ""}`}
                        onClick={() => {
                          setSelectedMode("Assistente IA");
                          setShowModeDropdown(false);
                        }}
                      >
                        <svg
                          className="mode-icon"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Assistente IA
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 items-center">
                  <button className="file-button">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 5V19M5 12H19"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={handleSend}
                    className={`action-button ${message.trim() ? "" : "voice-button"}`}
                  >
                    {message.trim() ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M12 1C10.3431 1 9 2.34315 9 4V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V4C15 2.34315 13.6569 1 12 1Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M19 10V12C19 16.4183 15.4183 20 11 20H13C17.4183 20 21 16.4183 21 12V10"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 20V23"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Ripple component - TOTALMENTE SIMPLES E FIXO
const Ripple = React.memo(function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 3,
  className,
  isDarkTheme = true,
  isBlurred = false,
  ...props
}) {
  const getBlurSettings = (lineIndex) => {
    if (!isBlurred) {
      return {
        filter: "blur(0px) brightness(1)",
        scale: 1,
      };
    }

    const settings = {
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

export function SchoolPowerPage() {
  const [isDarkTheme] = useState(true);
  const [isCentralExpanded, setIsCentralExpanded] = useState(false);

  const handleCentralExpandedChange = (expanded) => {
    setIsCentralExpanded(expanded);
  };

  return (
    <div
      className="relative flex h-[90vh] min-h-[650px] w-full flex-col items-center justify-center overflow-hidden rounded-lg"
      style={{ backgroundColor: "transparent" }}
    >
      {/* Background de estrelas */}
      {isDarkTheme && (
        <>
          <StarsBackground
            starDensity={0.00015}
            allStarsTwinkle={true}
            twinkleProbability={0.7}
            minTwinkleSpeed={0.5}
            maxTwinkleSpeed={1}
            className="z-0"
          />
          <ShootingStars
            minSpeed={10}
            maxSpeed={30}
            minDelay={1200}
            maxDelay={4200}
            starColor="#f97316"
            trailColor="#fb923c"
            starWidth={10}
            starHeight={1}
            className="z-0"
          />
        </>
      )}

      {/* Vertical dock positioned at right side */}
      <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-40">
        <FloatingDock
          items={dockItems}
          desktopClassName="shadow-xl flex-col h-auto w-16 py-4"
        />
      </div>

      {/* Container Ripple fixo e centralizado no background */}
      <div className="absolute top-[62%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
        <div className="relative" style={{ width: "900px", height: "617px" }}>
          {/* TechCircle posicionado no topo do container Ripple */}
          <div
            className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full z-30 pointer-events-none"
            style={{ marginTop: "7px" }}
          >
            <TechCircle isDarkTheme={isDarkTheme} />
          </div>

          {/* Ripple centralizado */}
          <div className="absolute inset-0">
            <Ripple isDarkTheme={isDarkTheme} isBlurred={isCentralExpanded} />
          </div>

          {/* Ícone Central no centro do Ripple */}
          <div
            className="absolute z-50 pointer-events-auto"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <CentralIcon
              isDarkTheme={isDarkTheme}
              onExpandedChange={handleCentralExpandedChange}
            />
          </div>

          {/* Caixa de Mensagem dentro do mesmo container Ripple */}
          <div
            className="absolute bottom-24 left-1/2 transform -translate-x-1/2 translate-y-full z-40 pointer-events-auto"
            style={{ marginTop: "-190px" }}
          >
            <AIMessageBox isDarkTheme={isDarkTheme} />
          </div>
        </div>
      </div>
    </div>
  );
}