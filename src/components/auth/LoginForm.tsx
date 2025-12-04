import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, CheckCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useNeonAuth } from "@/hooks/useNeonAuth";
import { 
  getPostLoginRedirectPath, 
  markUserHasLoggedIn,
  hasPendingMessage 
} from "@/lib/message-sync";

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [success, setSuccess] = useState(false);
  const [invalidCredentials, setInvalidCredentials] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error } = useNeonAuth();

  useEffect(() => {
    // Verificar se veio da tela de registro
    if (location.state && location.state.newAccount) {
      setAccountCreated(true);
      setTimeout(() => {
        setAccountCreated(false);
      }, 8000);

      // Limpar flag de redirecionamento
      localStorage.removeItem("redirectTimer");

      // Verificar se temos o email direto do state (redirecionamento imediato)
      if (location.state.email) {
        setFormData((prev) => ({ ...prev, email: location.state.email }));
        console.log("Preenchendo campo de email do state:", location.state.email);
      } else {
        // Usar email registrado (preferencial)
        const lastRegisteredEmail = localStorage.getItem("lastRegisteredEmail");
        if (lastRegisteredEmail) {
          setFormData((prev) => ({ ...prev, email: lastRegisteredEmail }));
          console.log("Preenchendo campo de email:", lastRegisteredEmail);
        } else {
          // Fallback para username se não tiver email
          const lastUsername = localStorage.getItem("lastRegisteredUsername");
          if (lastUsername) {
            setFormData((prev) => ({ ...prev, email: lastUsername }));
            console.log("Preenchendo campo de email com username:", lastUsername);
          }
        }
      }
    }

    // Verificar o parâmetro na URL também
    const params = new URLSearchParams(location.search);
    if (params.get("newAccount") === "true") {
      setAccountCreated(true);
      setTimeout(() => {
        setAccountCreated(false);
      }, 8000);

      // Limpar flag de redirecionamento
      localStorage.removeItem("redirectTimer");

      // Verificar se há username no localStorage mesmo quando vindo por parâmetro de URL
      const lastUsername = localStorage.getItem("lastRegisteredUsername");
      if (lastUsername && !formData.email) {
        setFormData((prev) => ({ ...prev, email: lastUsername }));
      }
    }

    // Executar sempre na montagem do componente para verificar se existe um redirecionamento pendente
    const pendingRedirect = localStorage.getItem("redirectTimer");
    if (pendingRedirect === "active") {
      setAccountCreated(true);
      localStorage.removeItem("redirectTimer");

      const lastUsername = localStorage.getItem("lastRegisteredUsername");
      if (lastUsername) {
        setFormData((prev) => ({ ...prev, email: lastUsername }));
      }
    }
  }, [location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [e.target.name]: value }));

    // Clear invalid credentials state when user starts typing in email or password fields
    if (e.target.name === "email" || e.target.name === "password") {
      setInvalidCredentials(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      e.preventDefault();
      const form = e.currentTarget.closest("form");
      if (form) {
        form.requestSubmit();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic field validation
    if (!formData.email || !formData.password) {
      setInvalidCredentials(true);
      return;
    }

    console.log("🔐 Tentando login com Neon Auth...");

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        console.log("✅ Login realizado com sucesso!");
        setSuccess(true);

        // Marcar que usuário já fez login
        markUserHasLoggedIn();

        // Limpar dados de registro
        localStorage.removeItem("lastRegisteredEmail");
        localStorage.removeItem("lastRegisteredUsername");

        // Verificar se existe URL de retorno para atividade compartilhada
        const returnToActivity = localStorage.getItem('returnToActivityAfterRegister');
        
        if (returnToActivity) {
          console.log("🎯 Redirecionando para modo apresentação após login:", returnToActivity);
          localStorage.removeItem('returnToActivityAfterRegister');
          setTimeout(() => {
            window.location.href = returnToActivity;
          }, 1000);
        } else {
          // Verificar se há mensagem pendente da página de vendas
          const redirectPath = getPostLoginRedirectPath();
          console.log("🎯 Caminho de redirecionamento pós-login:", redirectPath);
          
          if (hasPendingMessage()) {
            console.log("📨 Mensagem pendente encontrada - redirecionando para School Power");
          }
          
          setTimeout(() => {
            navigate(redirectPath, { replace: true });
          }, 1000);
        }
      } else {
        console.error("❌ Erro no login:", result.error);
        setInvalidCredentials(true);
        // The error from useNeonAuth might be a string or an object, ensure it's displayed correctly
        // For simplicity, we'll just set invalidCredentials to true which handles the red border
      }
    } catch (err) {
      console.error("❌ Erro inesperado no login:", err);
      setInvalidCredentials(true);
    }
  };

  return (
    <div className="space-y-6 rounded-2xl">
      {accountCreated && (
        <div className="bg-green-100/80 dark:bg-green-900/30 border border-green-500/70 dark:border-green-600/70 text-green-800 dark:text-green-300 p-6 rounded-lg mb-6 animate-fade-in flex items-center gap-4 shadow-md backdrop-blur-sm">
          <div className="rounded-full bg-green-200 dark:bg-green-800 p-3 flex-shrink-0">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold">Conta criada com sucesso!</h3>
            <p className="text-sm mt-1">
              Sua conta foi criada e seus dados foram salvos com sucesso. Use
              suas credenciais para fazer login.
            </p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-white/30 dark:bg-[#0A2540]/30 border border-green-500/50 backdrop-blur-md mb-4 rounded-lg p-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 dark:bg-green-800/50 p-2 flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <span className="font-medium text-green-600 dark:text-green-400">
                Login bem-sucedido!
              </span>
              <p className="text-sm text-green-600/80 dark:text-green-400/80">
                Redirecionando para o dashboard...
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <img
            src="/lovable-uploads/Logo-Ponto. School.webp"
            alt="Ponto School Logo"
            className="w-73 h-73 object-contain"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
        <div className="space-y-2">
          <label className="text-sm font-bold text-brand-black dark:text-white drop-shadow-sm">
            E-mail
          </label>
          <div className="relative group">
            <Mail
              className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 group-hover:text-brand-primary transition-colors duration-200 z-10 ${
                invalidCredentials
                  ? "text-red-500"
                  : formData.email
                    ? "text-[#FF6B00]"
                    : "text-muted-foreground"
              }`}
            />
            <Input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              placeholder="Digite seu e-mail"
              className={`pl-10 h-11 rounded-lg transition-all duration-300 hover:border-[#FF6B00]/30 bg-[#031223]/60 text-white backdrop-blur-md dark:bg-white/8 ${
                invalidCredentials
                  ? "border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                  : formData.email
                    ? "border-[#FF6B00] dark:border-[#FF6B00] focus:border-[#FF6B00] dark:focus:border-[#FF6B00] shadow-[0_0_15px_rgba(255,107,0,0.3)]"
                    : "border-[#FF6B00]/10 dark:border-[#FF6B00]/20 focus:border-[#FF6B00]/60 dark:focus:border-[#FF6B00]/60"
              }`}
              required
              style={{
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.1)",
              }}
            />
            <div
              className="absolute inset-0 rounded-lg opacity-0 group-focus:opacity-20 transition-all duration-300 pointer-events-none border border-[#FF6B00]/30 shadow-[0_0_15px_rgba(255,107,0,0.15)]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255, 107, 0, 0.03) 0%, rgba(255, 140, 64, 0.02) 100%)",
              }}
            ></div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-brand-black dark:text-white drop-shadow-sm">
            Senha
          </label>
          <div className="relative group">
            <Lock
              className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 group-hover:text-brand-primary transition-colors duration-200 z-10 ${
                invalidCredentials
                  ? "text-red-500"
                  : formData.password
                    ? "text-[#FF6B00]"
                    : "text-muted-foreground"
              }`}
            />
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua senha"
              className={`pl-10 pr-10 h-11 rounded-lg transition-all duration-300 hover:border-[#FF6B00]/30 bg-[#031223]/60 text-white backdrop-blur-md dark:bg-white/8 ${
                invalidCredentials
                  ? "border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                  : formData.password
                    ? "border-[#FF6B00] dark:border-[#FF6B00] focus:border-[#FF6B00] dark:focus:border-[#FF6B00] shadow-[0_0_15px_rgba(255,107,0,0.3)]"
                    : "border-[#FF6B00]/10 dark:border-[#FF6B00]/20 focus:border-[#FF6B00]/60 dark:focus:border-[#FF6B00]/60"
              }`}
              required
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
            <div
              className="absolute inset-0 rounded-lg opacity-0 group-focus:opacity-20 transition-all duration-300 pointer-events-none border border-[#FF6B00]/30 shadow-[0_0_15px_rgba(255,107,0,0.15)]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255, 107, 0, 0.03) 0%, rgba(255, 140, 64, 0.02) 100%)",
              }}
            ></div>
          </div>

          <div className="flex justify-between items-center mt-8">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    rememberMe: checked === true,
                  }))
                }
              />
              <label
                htmlFor="rememberMe"
                className="text-sm text-brand-muted dark:text-white/60 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Lembrar de mim
              </label>
            </div>
            <Button
              variant="link"
              className="text-xs text-brand-primary hover:text-brand-primary/90 p-0 h-auto drop-shadow-sm"
              onClick={() => navigate("/forgot-password")}
            >
              Esqueci minha senha
            </Button>
          </div>
        </div>

        {/* The error state is now managed by the hook, so we might not need this custom error display if the hook's error message is sufficient.
            However, to maintain consistency with the original structure and handle potential specific error messages from the hook,
            we'll keep this conditional rendering, but it might need adjustment based on the actual error format from useNeonAuth.
            If `error` from the hook is directly usable as a string message, this part might be simplified or removed.
            For now, we check if `error` exists and display it, otherwise show the invalidCredentials message. */}
        {error ? (
          <div className="text-sm text-red-500 text-center">
            {typeof error === "string" ? error : "Credenciais inválidas. Verifique seu email e senha."}
          </div>
        ) : (
          invalidCredentials && (
            <div className="text-sm text-red-500 text-center">
              Credenciais inválidas. Verifique seu email e senha.
            </div>
          )
        )}


        {/* Divisão com asterisco */}
        <div className="mt-10 mb-6 flex items-center">
          <div className="flex-1 border-t border-gray-300 dark:border-gray-700"></div>
          <div className="mx-4 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 2v20m7.0711-17.071L4.9289 19.071M22 12H2m17.0711 7.0711L4.9289 4.9289"
              ></path>
            </svg>
          </div>
          <div className="flex-1 border-t border-gray-300 dark:border-gray-700"></div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 text-base bg-brand-primary hover:bg-brand-primary/90 text-white transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-brand-primary/20 relative overflow-hidden group"
          disabled={isLoading}
        >
          <span className="relative z-10 font-bold">
            {isLoading ? "Entrando..." : "Acessar minha conta"}
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-brand-primary to-[#FF8C40] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
        </Button>

        <div className="mt-8"></div>

        <p className="text-center text-sm text-brand-muted dark:text-white/70 font-bold">
          Ainda não tem conta?{" "}
          <Button
            variant="link"
            className="text-brand-primary hover:text-brand-primary/90 p-0 h-auto font-bold relative group"
            onClick={() => navigate("/register")}
          >
            Cadastre-se
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-primary group-hover:w-full transition-all duration-300"></span>
          </Button>
        </p>
      </form>
    </div>
  );
}