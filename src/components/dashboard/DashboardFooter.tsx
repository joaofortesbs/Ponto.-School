import React, { useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { ArrowUp } from "lucide-react";
import AnimatedLogo from "./AnimatedLogo";

export default function DashboardFooter() {
  const scrollToTop = () => {
    // Scroll the main window to the top
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Ensure focus is at the top of the document
    document.body.scrollIntoView({ behavior: "smooth", block: "start" });

    // Seleção mais abrangente de elementos com scroll
    const scrollableElements = document.querySelectorAll(
      'div[style*="overflow"], div[style*="overflow-y"], div[class*="overflow"], div[class*="scroll"], .overflow-auto, .overflow-y-auto, .overflow-scroll, .overflow-y-scroll'
    );

    scrollableElements.forEach((element) => {
      if (element instanceof HTMLElement) {
        element.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
    
    // Garantir que o conteúdo principal também seja rolado para o topo
    const mainContent = document.querySelector('.dashboard-content');
    if (mainContent instanceof HTMLElement) {
      mainContent.scrollTop = 0;
    }
  };

  const sloganRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    // Reset animation when component mounts or updates
    if (sloganRef.current) {
      sloganRef.current.classList.remove("typing-animation");
      setTimeout(() => {
        sloganRef.current?.classList.add("typing-animation");
      }, 100);
    }
  }, []);

  return (
    <footer className="w-full py-6 mt-8 text-center bg-transparent relative z-50">
      {/* Sophisticated orange separator line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FF6B00]/10 via-[#FF6B00] to-[#FF6B00]/10 shadow-[0_0_8px_rgba(255,107,0,0.5)] animate-pulse"></div>

      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Logo and Slogan */}
          <div className="flex items-center gap-4">
            <AnimatedLogo size="md" />
            <div className="max-w-md hidden md:block">
              <p
                ref={sloganRef}
                className="text-sm text-gray-600 italic typing-animation interactive-light"
              >
                "Não é sobre conectar você com a tecnologia, é sobre conectar
                você com o futuro!"
              </p>
            </div>
          </div>

          {/* Copyright and Privacy */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <a
              href="#"
              className="hover:text-[#FF6B00] transition-colors hover:scale-105 transform duration-300"
            >
              Política de Privacidade
            </a>
            <span className="text-gray-400">•</span>
            <a
              href="#"
              className="hover:text-[#FF6B00] transition-colors hover:scale-105 transform duration-300"
            >
              Termos de Uso
            </a>
            <span className="text-gray-400">•</span>
            <p className="hover:text-[#FF6B00] transition-colors">
              © 2025 Ponto. School. Todos os direitos reservados
            </p>
          </div>

          {/* Back to top button */}
          <Button
            variant="outline"
            size="sm"
            className="rounded-full p-2 h-10 w-10 border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 hover:scale-110 transition-all duration-300 shadow-sm hover:shadow-[#FF6B00]/20"
            onClick={scrollToTop}
            aria-label="Voltar ao topo"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </footer>
  );
}
