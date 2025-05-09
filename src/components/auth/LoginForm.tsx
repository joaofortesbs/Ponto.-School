import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, CheckCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accountCreated, setAccountCreated] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [success, setSuccess] = useState(false); // Added success state
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Verificar se veio da tela de registro
    if (location.state && location.state.newAccount) {
      setAccountCreated(true);
      setTimeout(() => {
        setAccountCreated(false);
      }, 5000);
      
      // Limpar flag de redirecionamento
      localStorage.removeItem('redirectTimer');
      
      // Preencher o campo de email com o último username registrado
      const lastUsername = localStorage.getItem('lastRegisteredUsername');
      if (lastUsername) {
        setFormData(prev => ({ ...prev, email: lastUsername }));
      }
    }
    
    // Verificar o parâmetro na URL também
    const params = new URLSearchParams(location.search);
    if (params.get('newAccount') === 'true') {
      setAccountCreated(true);
      setTimeout(() => {
        setAccountCreated(false);
      }, 5000);
      
      // Limpar flag de redirecionamento
      localStorage.removeItem('redirectTimer');
    }
  }, [location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setSuccess(false); // Reset success on submit

    // Basic field validation
    if (!formData.email || !formData.password) {
      setError("Preencha todos os campos");
      setLoading(false);
      return;
    }

    // Feedback visual imediato para melhorar a percepção
    setSuccess(true);
    localStorage.setItem('auth_checked', 'pending');
    localStorage.setItem('auth_status', 'authenticating');

    // Iniciar redirecionamento antecipado para melhorar percepção de velocidade
    // Um timeout curto para dar percepção de resposta instantânea
    const preloadTimeout = setTimeout(() => {
      if (localStorage.getItem('auth_status') === 'authenticating') {
        // Pré-carregar a rota de dashboard enquanto aguarda autenticação
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'prefetch';
        preloadLink.href = '/dashboard';
        document.head.appendChild(preloadLink);
      }
    }, 300);

    // Timeout mais curto (5 segundos) para feedback em caso de lentidão
    const authTimeout = setTimeout(() => {
      if (localStorage.getItem('auth_status') === 'authenticating') {
        // Não cancelar o login, apenas mostrar feedback
        setError("Estamos processando seu login, aguarde um momento...");
      }
    }, 5000);

    try {
      let authResult;
      const inputValue = formData.email;
      const isEmail = inputValue.includes('@');

      if (isEmail) {
        // Login com email
        authResult = await Promise.race([
          supabase.auth.signInWithPassword({
            email: inputValue,
            password: formData.password,
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Tempo limite excedido")), 8000)
          )
        ]);
      } else {
        // Login com nome de usuário
        // Primeiro, buscar o email associado ao nome de usuário
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', inputValue)
          .single();

        if (profileError || !profileData?.email) {
          setSuccess(false);
          setError("Nome de usuário não encontrado");
          setLoading(false);
          clearTimeout(preloadTimeout);
          clearTimeout(authTimeout);
          localStorage.removeItem('auth_checked');
          localStorage.removeItem('auth_status');
          return;
        }

        // Agora fazer login com o email encontrado
        authResult = await Promise.race([
          supabase.auth.signInWithPassword({
            email: profileData.email,
            password: formData.password,
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Tempo limite excedido")), 8000)
          )
        ]);
      }

      const { data, error } = authResult;

      clearTimeout(preloadTimeout);
      clearTimeout(authTimeout);

      if (error) {
        setSuccess(false);
        if (error.message.includes("Invalid login credentials") ||
            error.message.includes("Email not confirmed")) {
          setError("Email ou senha inválidos");
        } else if (error.status === 0) { //Improved network error handling
          setError("Erro de conexão. Verifique sua internet.");
        } else {
          setError("Erro ao fazer login: " + error.message);
        }
        localStorage.removeItem('auth_checked');
        localStorage.removeItem('auth_status');
        setLoading(false);
        return;
      }

      if (data?.user) {
        localStorage.setItem('auth_checked', 'true');
        localStorage.setItem('auth_status', 'authenticated');

        // Redirecionar rapidamente para melhorar percepção de velocidade
        navigate("/");
      } else {
        setSuccess(false);
        setError("Erro ao completar login");
        localStorage.removeItem('auth_checked');
        localStorage.removeItem('auth_status');
      }
    } catch (err: any) {
      clearTimeout(authTimeout);
      setSuccess(false);
      setError("Erro ao fazer login, tente novamente");
      console.error("Erro ao logar:", err);
      localStorage.removeItem('auth_checked');
      localStorage.removeItem('auth_status');
    } finally {
      setLoading(false);
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
            <p className="text-sm mt-1">Sua conta foi criada e seus dados foram salvos com sucesso. Use suas credenciais para fazer login.</p>
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
              <span className="font-medium text-green-600 dark:text-green-400">Login bem-sucedido!</span>
              <p className="text-sm text-green-600/80 dark:text-green-400/80">Redirecionando para o dashboard...</p>
            </div>
          </div>
        </div>
      )}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-brand-black dark:text-white drop-shadow-sm">
          Entrar na plataforma
        </h1>
        <p className="text-sm text-brand-muted dark:text-white/70">
          Insira suas credenciais para acessar
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
        <div className="space-y-2">
          <label className="text-sm font-medium text-brand-black dark:text-white drop-shadow-sm">
            Nome de Usuário ou E-mail
          </label>
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-brand-primary transition-colors duration-200 z-10" />
            <Input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Digite seu nome de usuário ou e-mail"
              className="pl-10 h-11 bg-white/30 dark:bg-white/8 backdrop-blur-md border-[#FF6B00]/10 dark:border-[#FF6B00]/20 focus:border-[#FF6B00]/60 dark:focus:border-[#FF6B00]/60 transition-all duration-300 hover:border-[#FF6B00]/30 rounded-lg"
              required
              style={{
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.1)"
              }}
            />
            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none border border-[#FF6B00]/30 shadow-[0_0_15px_rgba(255,107,0,0.15)]" style={{
              background: "linear-gradient(135deg, rgba(255, 107, 0, 0.03) 0%, rgba(255, 140, 64, 0.02) 100%)"
            }}></div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-brand-black dark:text-white drop-shadow-sm">
              Senha
            </label>
            <Button
              variant="link"
              className="text-xs text-brand-primary hover:text-brand-primary/90 p-0 h-auto drop-shadow-sm"
            >
              Esqueci minha senha
            </Button>
          </div>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-brand-primary transition-colors duration-200 z-10" />
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Digite sua senha"
              className="pl-10 pr-10 h-11 bg-white/30 dark:bg-white/8 backdrop-blur-md border-[#FF6B00]/10 dark:border-[#FF6B00]/20 focus:border-[#FF6B00]/60 dark:focus:border-[#FF6B00]/60 transition-all duration-300 hover:border-[#FF6B00]/30 rounded-lg"
              required
              style={{
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.1)"
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
            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none border border-[#FF6B00]/30 shadow-[0_0_15px_rgba(255,107,0,0.15)]" style={{
              background: "linear-gradient(135deg, rgba(255, 107, 0, 0.03) 0%, rgba(255, 140, 64, 0.02) 100%)"
            }}></div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="rememberMe"
            name="rememberMe"
            checked={formData.rememberMe}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, rememberMe: checked === true }))
            }
          />
          <label
            htmlFor="rememberMe"
            className="text-sm text-brand-muted dark:text-white/60 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Lembrar de mim
          </label>
        </div>

        {error && (
          <div className="text-sm text-red-500 text-center">{error}</div>
        )}

        <Button
          type="submit"
          className="w-full h-11 text-base bg-brand-primary hover:bg-brand-primary/90 text-white transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-brand-primary/20 relative overflow-hidden group"
          disabled={loading}
        >
          <span className="relative z-10">{loading ? "Entrando..." : "Entrar"}</span>
          <span className="absolute inset-0 bg-gradient-to-r from-brand-primary to-[#FF8C40] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200 dark:border-gray-700/50" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white/70 dark:bg-[#0A2540]/70 px-2 text-muted-foreground backdrop-blur-sm">
              Ou continue com
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-11 bg-white/15 dark:bg-white/3 backdrop-blur-2xl border border-white/25 dark:border-white/8 hover:bg-white/25 dark:hover:bg-white/8 transition-all duration-300 hover:shadow-lg group rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-1500 ease-in-out"></div>
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF6B00]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <img
              src="https://www.svgrepo.com/show/506498/google.svg"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            <span className="relative z-10">Google</span>
          </Button>
          <Button variant="outline" className="h-11 bg-white/15 dark:bg-white/3 backdrop-blur-2xl border border-white/25 dark:border-white/8 hover:bg-white/25 dark:hover:bg-white/8 transition-all duration-300 hover:shadow-lg group rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-1500 ease-in-out"></div>
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF6B00]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <img
              src="https://www.svgrepo.com/show/521654/facebook.svg"
              alt="Facebook"
              className="w-5 h-5 mr-2"
            />
            <span className="relative z-10">Facebook</span>
          </Button>
        </div>

        <p className="text-center text-sm text-brand-muted dark:text-white/70">
          Ainda não tem conta?{" "}
          <Button
            variant="link"
            className="text-brand-primary hover:text-brand-primary/90 p-0 h-auto font-medium relative group"
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


//This is a placeholder for the registration form. A complete implementation would require a separate component.
export function RegistrationForm(){
    //Implementation for registration form here.  This would include fields for name, email, password, etc., and a submit handler to create a new user account in Supabase.  Error handling and success messages would also be necessary.
    return <div>Registration Form (Not implemented)</div>
}