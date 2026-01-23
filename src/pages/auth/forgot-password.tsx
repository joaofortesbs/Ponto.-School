import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<"email" | "password">("email");
  const navigate = useNavigate();

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email.trim()) {
      setError("Por favor, digite seu e-mail cadastrado");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/perfis/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.success && result.exists) {
        setStep("password");
      } else {
        setError("E-mail não encontrado. Verifique se digitou corretamente.");
      }
    } catch (err) {
      console.error("Erro ao verificar email:", err);
      setError("Erro ao verificar e-mail. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!novaSenha || !confirmarSenha) {
      setError("Por favor, preencha todos os campos");
      setLoading(false);
      return;
    }

    if (novaSenha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      setLoading(false);
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setError("As senhas não coincidem");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/perfis/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, nova_senha: novaSenha }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/login", { state: { passwordReset: true } });
        }, 3000);
      } else {
        setError(result.error || "Erro ao redefinir senha");
      }
    } catch (err) {
      console.error("Erro ao redefinir senha:", err);
      setError("Erro ao redefinir senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6 rounded-2xl max-w-md w-full mx-auto">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold tracking-tight text-brand-black dark:text-white drop-shadow-sm">
            {step === "email" ? "Esqueceu a senha?" : "Redefinir senha"}
          </h1>
          <p className="text-sm text-brand-muted dark:text-white/70">
            {step === "email" ? (
              <>
                Não se preocupe, nós vamos te ajudar.
                <br />
                Digite o e-mail cadastrado para prosseguir.
              </>
            ) : (
              <>
                Digite sua nova senha abaixo.
                <br />
                Escolha uma senha segura com pelo menos 6 caracteres.
              </>
            )}
          </p>
        </div>

        {success ? (
          <div className="bg-green-100/80 dark:bg-green-900/30 border border-green-500/70 dark:border-green-600/70 text-green-800 dark:text-green-300 p-6 rounded-lg mb-6 animate-fade-in shadow-md backdrop-blur-sm">
            <h3 className="text-lg font-bold">Senha redefinida com sucesso!</h3>
            <p className="text-sm mt-1">
              Sua senha foi atualizada. Redirecionando para o login...
            </p>
          </div>
        ) : step === "email" ? (
          <form onSubmit={handleCheckEmail} className="space-y-4">
            <div className="mb-4 flex items-center">
              <div className="flex-1 border-t border-gray-300 dark:border-gray-700"></div>
              <div className="mx-4 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v20m7.0711-17.071L4.9289 19.071M22 12H2m17.0711 7.0711L4.9289 4.9289"></path>
                </svg>
              </div>
              <div className="flex-1 border-t border-gray-300 dark:border-gray-700"></div>
            </div>

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
              </div>
            </div>

            {error && <div className="text-sm text-red-500 text-center mt-2">{error}</div>}

            <Button
              type="submit"
              className="w-full h-11 text-base bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-[#FF6B00]/20 relative overflow-hidden group"
              disabled={loading}
            >
              <span className="relative z-10">
                {loading ? "Verificando..." : "Continuar"}
              </span>
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="mb-4 flex items-center">
              <div className="flex-1 border-t border-gray-300 dark:border-gray-700"></div>
              <div className="mx-4 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v20m7.0711-17.071L4.9289 19.071M22 12H2m17.0711 7.0711L4.9289 4.9289"></path>
                </svg>
              </div>
              <div className="flex-1 border-t border-gray-300 dark:border-gray-700"></div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-black dark:text-white drop-shadow-sm">
                Nova Senha
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-brand-primary transition-colors duration-200 z-10" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Digite sua nova senha"
                  className="pl-10 pr-10 h-11 bg-white/30 dark:bg-white/8 backdrop-blur-md border-[#FF6B00]/10 dark:border-[#FF6B00]/20 focus:border-[#FF6B00]/60 dark:focus:border-[#FF6B00]/60 transition-all duration-300 hover:border-[#FF6B00]/30 rounded-lg"
                  required
                  minLength={6}
                  style={{
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.1)",
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent z-10"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground hover:text-[#FF6B00]" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground hover:text-[#FF6B00]" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-black dark:text-white drop-shadow-sm">
                Confirmar Nova Senha
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-brand-primary transition-colors duration-200 z-10" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Confirme sua nova senha"
                  className="pl-10 pr-10 h-11 bg-white/30 dark:bg-white/8 backdrop-blur-md border-[#FF6B00]/10 dark:border-[#FF6B00]/20 focus:border-[#FF6B00]/60 dark:focus:border-[#FF6B00]/60 transition-all duration-300 hover:border-[#FF6B00]/30 rounded-lg"
                  required
                  minLength={6}
                  style={{
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.1)",
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent z-10"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground hover:text-[#FF6B00]" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground hover:text-[#FF6B00]" />
                  )}
                </Button>
              </div>
            </div>

            {error && <div className="text-sm text-red-500 text-center mt-2">{error}</div>}

            <Button
              type="submit"
              className="w-full h-11 text-base bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-[#FF6B00]/20 relative overflow-hidden group"
              disabled={loading}
            >
              <span className="relative z-10">
                {loading ? "Redefinindo..." : "Redefinir Senha"}
              </span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-brand-muted hover:text-brand-primary"
              onClick={() => {
                setStep("email");
                setError("");
              }}
            >
              Voltar
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
