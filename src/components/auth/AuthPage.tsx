import React, { useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { useNavigate } from "react-router-dom";

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f7f9fa] dark:bg-[#001427] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex flex-col md:flex-row rounded-xl overflow-hidden shadow-lg">
        {/* Left side - Branding */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-[#29335C] to-[#001427] p-8 flex flex-col justify-center">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Plataforma de Aprendizagem
            </h1>
            <p className="text-white/80 mb-6">
              Acompanhe seu progresso acadêmico, acesse suas turmas e expanda
              seus conhecimentos em um só lugar.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FF6B00]/20 flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[#FF6B00]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-white">
                  Acompanhe seu progresso em tempo real
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FF6B00]/20 flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[#FF6B00]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <p className="text-white">
                  Acesse materiais de estudo exclusivos
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FF6B00]/20 flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[#FF6B00]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <p className="text-white">Interaja com professores e colegas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth forms */}
        <div className="w-full md:w-1/2 bg-white dark:bg-[#0A2540] p-8 flex items-center justify-center">
          {isLogin ? (
            <div className="w-full max-w-md">
              <LoginForm />
              <p className="text-center text-sm text-brand-muted dark:text-white/60 mt-4">
                Não tem uma conta?{" "}
                <button
                  className="text-brand-primary hover:text-brand-primary/90 font-medium"
                  onClick={() => setIsLogin(false)}
                >
                  Criar conta
                </button>
              </p>
            </div>
          ) : (
            <div className="w-full max-w-md">
              <RegisterForm />
              <p className="text-center text-sm text-brand-muted dark:text-white/60 mt-4">
                Já tem uma conta?{" "}
                <button
                  className="text-brand-primary hover:text-brand-primary/90 font-medium"
                  onClick={() => setIsLogin(true)}
                >
                  Fazer login
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
