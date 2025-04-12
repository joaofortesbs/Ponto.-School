import React, { useEffect } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  // Adicionando useEffect para garantir que o efeito de paralaxe seja ativado
  useEffect(() => {
    // Forçar repaint para garantir que o efeito seja aplicado corretamente
    const banner = document.querySelector('.banner');
    if (banner) {
      banner.classList.add('active-parallax');
    }
    
    // Adicionar interação com o movimento do dispositivo para dispositivos móveis
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', function(event) {
        const beta = event.beta; // -180 a 180 (inclinação frente/trás)
        const gamma = event.gamma; // -90 a 90 (inclinação esquerda/direita)
        
        if (beta !== null && gamma !== null) {
          const bgLayer = document.querySelector('.layer-bg') as HTMLElement;
          const fgLayer = document.querySelector('.layer-fg') as HTMLElement;
          
          if (bgLayer && fgLayer) {
            // Converter orientação para movimento suave na tela
            const xMovementBg = (gamma / 90) * 15;
            const yMovementBg = (beta / 180) * 15;
            
            const xMovementFg = -(gamma / 90) * 8;
            const yMovementFg = -(beta / 180) * 8;
            
            bgLayer.style.transform = `translate3d(${xMovementBg}px, ${yMovementBg}px, 0)`;
            fgLayer.style.transform = `translate3d(${xMovementFg}px, ${yMovementFg}px, 0)`;
          }
        }
      });
    }
    
    return () => {
      if (banner) {
        banner.classList.remove('active-parallax');
      }
      
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', () => {});
      }
    };
  }, []);
  
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}
