import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowLeft,
  Clock,
  Award,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Array de dados dos banners
const bannerData = [
  {
    id: 1,
    title: "Webinar Gratuito:",
    subtitle: "Domine a Matemática do ENEM!",
    description:
      "Aprenda os melhores métodos para gabaritar a prova com o Prof. Carlos Santos",
    tags: [
      {
        icon: <Clock className="w-3.5 h-3.5 text-orange-500" />,
        text: "Ao vivo",
        color: "text-white",
      },
      {
        icon: (
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
        ),
        text: "Gratuito",
        color: "text-white",
      },
      {
        icon: <Award className="w-3.5 h-3.5 text-yellow-500" />,
        text: "Certificado",
        color: "text-white",
      },
      {
        icon: <Users className="w-3.5 h-3.5 text-blue-500" />,
        text: "12.5k inscritos",
        color: "text-white",
      },
    ],
    buttonText: "Inscreva-se",
    image:
      "https://images.unsplash.com/photo-1596496181848-3091d4878b24?w=800&q=80",
    imageAlt: "Matemática ENEM",
    titleColor: "text-orange-400",
    gradientFrom: "from-[#001427]",
    gradientVia: "via-[#1a2a4a]",
    gradientTo: "to-[#29335C]",
    buttonGradientFrom: "from-orange-500",
    buttonGradientTo: "to-orange-600",
    buttonHoverFrom: "hover:from-orange-600",
    buttonHoverTo: "hover:to-orange-700",
    buttonShadow: "shadow-orange-500/20",
  },
  {
    id: 2,
    title: "Curso Intensivo:",
    subtitle: "Redação Nota 1000",
    description:
      "Técnicas exclusivas para estruturar sua redação e garantir a nota máxima",
    tags: [
      {
        icon: <Clock className="w-3.5 h-3.5 text-blue-500" />,
        text: "4 semanas",
        color: "text-white",
      },
      {
        icon: (
          <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse"></div>
        ),
        text: "Online",
        color: "text-white",
      },
      {
        icon: <Award className="w-3.5 h-3.5 text-yellow-500" />,
        text: "Material incluso",
        color: "text-white",
      },
      {
        icon: <Users className="w-3.5 h-3.5 text-green-500" />,
        text: "8.3k alunos",
        color: "text-white",
      },
    ],
    buttonText: "Saiba mais",
    image:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
    imageAlt: "Redação ENEM",
    titleColor: "text-blue-400",
    gradientFrom: "from-[#0f172a]",
    gradientVia: "via-[#1e293b]",
    gradientTo: "to-[#334155]",
    buttonGradientFrom: "from-blue-500",
    buttonGradientTo: "to-blue-600",
    buttonHoverFrom: "hover:from-blue-600",
    buttonHoverTo: "hover:to-blue-700",
    buttonShadow: "shadow-blue-500/20",
  },
];

const PromotionalBanner = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentBanner = bannerData[currentIndex];

  useEffect(() => {
    // Tornar o banner visível imediatamente, sem delay
    setIsVisible(true);
  }, []);

  const goToNextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % bannerData.length);
  };

  const goToPrevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + bannerData.length) % bannerData.length,
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full overflow-hidden relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner.id}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className={`
            relative w-full overflow-hidden shadow-2xl 
            bg-gradient-to-r ${currentBanner.gradientFrom} ${currentBanner.gradientVia} ${currentBanner.gradientTo} 
            border border-blue-500/20 backdrop-blur-sm
            transition-all duration-300 ease-in-out
            ${isHovered ? "scale-[1.01] shadow-blue-500/20" : ""}
            max-h-[180px] sm:max-h-[200px] md:max-h-[220px]
          `}
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -inset-[10px] bg-grid-white/[0.02] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)]" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
          </div>

          <div className="flex flex-col md:flex-row items-center relative z-10">
            <div className="p-3 sm:p-4 md:p-5 flex-1 w-full">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-base sm:text-lg md:text-xl font-bold text-white mb-1.5 flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-0"
              >
                <span className={`mr-0 sm:mr-2 ${currentBanner.titleColor}`}>
                  {currentBanner.title}
                </span>{" "}
                <span className="break-words">{currentBanner.subtitle}</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="text-white/80 text-xs sm:text-sm md:text-base mb-2 sm:mb-3"
              >
                {currentBanner.description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 mb-2"
              >
                {currentBanner.tags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1.5 sm:gap-2 bg-[#0c1c33]/50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm"
                  >
                    {tag.icon}
                    <span className={tag.color}>{tag.text}</span>
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-3 sm:mt-4 inline-block"
              >
                <Button
                  className={`bg-gradient-to-r ${currentBanner.buttonGradientFrom} ${currentBanner.buttonGradientTo} ${currentBanner.buttonHoverFrom} ${currentBanner.buttonHoverTo} text-white border-none shadow-lg ${currentBanner.buttonShadow} transition-all duration-300 text-sm sm:text-base px-3 sm:px-4 py-2`}
                >
                  {currentBanner.buttonText}{" "}
                  <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="w-full md:w-1/3 p-3 sm:p-4 flex justify-center"
            >
              <div className="relative overflow-hidden rounded-lg border border-white/10 shadow-2xl w-full max-w-[280px] sm:max-w-none">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 z-10" />
                <img
                  src={currentBanner.image}
                  alt={currentBanner.imageAlt}
                  className="rounded-lg w-full h-auto max-h-[100px] sm:max-h-[120px] md:max-h-[140px] object-cover transition-transform duration-700 ease-in-out hover:scale-110"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="absolute top-1/2 left-0 transform -translate-y-1/2 z-20">
        <Button
          onClick={goToPrevSlide}
          variant="ghost"
          size="icon"
          className="rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white h-8 w-8 ml-2"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="absolute top-1/2 right-0 transform -translate-y-1/2 z-20">
        <Button
          onClick={goToNextSlide}
          variant="ghost"
          size="icon"
          className="rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white h-8 w-8 mr-2"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {bannerData.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all ${index === currentIndex ? "w-6 bg-white" : "w-2 bg-white/50"}`}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default PromotionalBanner;
