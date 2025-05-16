
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setSuccess(false);

    if (!email.trim()) {
      setError("Por favor, digite seu e-mail cadastrado");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset-password",
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError("Ocorreu um erro ao processar sua solicitação");
      console.error("Erro ao solicitar recuperação de senha:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6 rounded-2xl max-w-md w-full mx-auto">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold tracking-tight text-brand-black dark:text-white drop-shadow-sm">
            Esqueceu a senha?
          </h1>
          <p className="text-sm text-brand-muted dark:text-white/70">
            Não se preocupe, nós vamos te ajudar.
            <br />
            Digite o e-mail cadastrado para prosseguir.
          </p>
        </div>

        {success ? (
          <div className="bg-green-100/80 dark:bg-green-900/30 border border-green-500/70 dark:border-green-600/70 text-green-800 dark:text-green-300 p-6 rounded-lg mb-6 animate-fade-in shadow-md backdrop-blur-sm">
            <h3 className="text-lg font-bold">E-mail enviado com sucesso!</h3>
            <p className="text-sm mt-1">
              Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-black dark:text-white drop-shadow-sm">
                E-mail
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-brand-primary transition-colors duration-200 z-10" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu e-mail cadastrado"
                  className="pl-10 h-11 bg-white/30 dark:bg-white/8 backdrop-blur-md border-[#FF6B00]/10 dark:border-[#FF6B00]/20 focus:border-[#FF6B00]/60 dark:focus:border-[#FF6B00]/60 transition-all duration-300 hover:border-[#FF6B00]/30 rounded-lg"
                  required
                  style={{
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.1)",
                  }}
                />
                <div
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none border border-[#FF6B00]/30 shadow-[0_0_15px_rgba(255,107,0,0.15)]"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255, 107, 0, 0.03) 0%, rgba(255, 140, 64, 0.02) 100%)",
                  }}
                ></div>
              </div>
            </div>

            {error && <div className="text-sm text-red-500 text-center">{error}</div>}
            
            {/* Divisão com asterisco - igual ao do login */}
            <div className="my-4 flex items-center">
              <div className="flex-1 border-t border-gray-300 dark:border-gray-700"></div>
              <div className="mx-4 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v20m7.0711-17.071L4.9289 19.071M22 12H2m17.0711 7.0711L4.9289 4.9289"></path>
                </svg>
              </div>
              <div className="flex-1 border-t border-gray-300 dark:border-gray-700"></div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base bg-[#0D00F5] hover:bg-[#0D00F5]/90 text-white transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-[#0D00F5]/20 relative overflow-hidden group"
              disabled={loading}
            >
              <span className="relative z-10">
                {loading ? "Processando..." : "Recuperar"}
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#0D00F5] to-[#3D30FF] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
            </Button>
          </form>
        )}

        <div className="text-center text-sm">
          <span className="text-brand-muted dark:text-white/70">Lembrou sua senha? </span>
          <Link
            to="/login"
            className="text-brand-primary hover:text-brand-primary/90 font-medium relative group"
          >
            Voltar para o login
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-primary group-hover:w-full transition-all duration-300"></span>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
