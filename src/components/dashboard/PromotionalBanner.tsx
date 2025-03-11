import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const PromotionalBanner = () => {
  return (
    <div className="w-full max-w-[1192px] mx-auto bg-gradient-to-r from-[#001427] to-[#29335C] rounded-xl overflow-hidden shadow-lg mb-6">
      <div className="flex flex-col md:flex-row items-center">
        <div className="p-6 md:p-8 flex-1">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
            Webinar Gratuito: Domine a Matemática do ENEM!
          </h2>
          <p className="text-white/80 text-sm md:text-base mb-4">
            Aprenda os melhores métodos para gabaritar a prova com o Prof.
            Carlos Santos
          </p>
          <div className="flex flex-wrap gap-4 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-white text-sm">Ao vivo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-white text-sm">Gratuito</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-white text-sm">Certificado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-white text-sm">12.5k inscritos</span>
            </div>
          </div>
          <Button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white border-none">
            Inscreva-se <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="md:w-1/3 p-4 flex justify-center">
          <img
            src="https://images.unsplash.com/photo-1596496181848-3091d4878b24"
            alt="Matemática ENEM"
            className="rounded-lg max-h-[160px] object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default PromotionalBanner;
