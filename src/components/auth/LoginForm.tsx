import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase, checkSupabaseConnection } from "@/lib/supabase";
import { profileService } from "@/services/profileService";
import { useToast } from "@/components/ui/use-toast";

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
    if (location.state && location.state.newAccount) {
      setAccountCreated(true);
      setTimeout(() => {
        setAccountCreated(false);
      }, 5000);
    }

    // Check Supabase connection on component mount
    const verifyConnection = async () => {
      const { ok } = await checkSupabaseConnection();
      if (!ok) {
        console.warn("Supabase connection check failed on login page load");
      }
    };

    verifyConnection();
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

    try {
      // Obter perfis armazenados localmente
      const localProfiles = localStorage.getItem('tempUserProfiles');
      const offlineProfiles = localProfiles ? JSON.parse(localProfiles) : [];
      const matchingProfile = offlineProfiles.find((p: any) => p.email === formData.email);

      // Verificar primeiro o modo offline ou problema de conectividade
      const isOffline = !navigator.onLine || localStorage.getItem('isOfflineMode') === 'true';

      // Tentar login com Supabase se não estiver em modo offline
      if (!isOffline) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });

          if (error) {
            console.log("Login error:", error);

            // Verificar se é um erro de credenciais e temos um perfil local
            if (error.message.includes("Invalid login credentials") && matchingProfile) {
              console.log("Tentando validar localmente devido a credenciais inválidas no Supabase");
              
              // Verificar senha do perfil local (em um app real, isso seria feito com hash)
              if (matchingProfile.password === formData.password) {
                console.log("Login local bem-sucedido");
                setSuccess(true);
                
                // Armazenar estado de sessão local
                localStorage.setItem('isOfflineMode', 'true');
                localStorage.setItem('currentUserProfile', JSON.stringify(matchingProfile));
                
                setTimeout(() => {
                  navigate("/");
                }, 1000);
                return;
              } else {
                setError("Email ou senha inválidos");
                setLoading(false);
                return;
              }
            } 
            
            // Verificar erros de conectividade para tentar modo offline
            else if (error.status === 0 || 
                    error.message.includes("fetch") || 
                    error.message.includes("Failed to fetch") ||
                    error.message.includes("network")) {
              
              // Se temos um perfil local, tentar modo offline
              if (matchingProfile) {
                // Verificar a senha no modo offline
                if (matchingProfile.password === formData.password) {
                  console.log("Login offline bem-sucedido");
                  setSuccess(true);
                  
                  localStorage.setItem('isOfflineMode', 'true');
                  localStorage.setItem('currentUserProfile', JSON.stringify(matchingProfile));
                  
                  toast({
                    title: "Conectado em modo offline",
                    description: "Você está usando o aplicativo em modo offline devido a problemas de conexão.",
                    variant: "warning",
                    duration: 5000,
                  });
                  
                  // Disparar evento de login bem-sucedido
                  const loginEvent = new CustomEvent('login-status-changed', {
                    detail: { user: matchingProfile }
                  });
                  window.dispatchEvent(loginEvent);
                  
                  setTimeout(() => {
                    navigate("/");
                  }, 1000);
                  return;
                } else {
                  setError("Email ou senha inválidos");
                  setLoading(false);
                  return;
                }
              } else {
                setError("Erro de conexão. Verifique sua internet e tente novamente.");
                setLoading(false);
                return;
              }
            } else {
              // Outros erros do Supabase
              setError(error.message || "Erro ao fazer login. Por favor, tente novamente.");
              setLoading(false);
              return;
            }
          } 
          
          // Login bem-sucedido no Supabase
          if (data?.user) {
            setSuccess(true);
            
            // Carregar o perfil do usuário
            try {
              await profileService.createProfileIfNotExists();
            } catch (profileErr) {
              console.warn("Erro ao carregar perfil, continuando com login:", profileErr);
            }
            
            // Armazenar sessão para uso offline futuro
            try {
              localStorage.setItem('lastLoginSession', JSON.stringify({
                user: data.user,
                timestamp: new Date().toISOString()
              }));
              
              // Se temos um perfil local, atualizar também
              if (matchingProfile) {
                localStorage.setItem('currentUserProfile', JSON.stringify({
                  ...matchingProfile,
                  id: data.user.id
                }));
              }
              
              localStorage.removeItem('isOfflineMode');
            } catch (storageErr) {
              console.warn("Erro ao salvar dados de sessão:", storageErr);
            }
            
            // Disparar evento de login bem-sucedido para atualizar componentes
            const loginEvent = new CustomEvent('login-status-changed', {
              detail: { user: data.user }
            });
            window.dispatchEvent(loginEvent);
            
            setTimeout(() => {
              navigate("/");
            }, 1000);
            return;
          }
        } catch (authError) {
          console.error("Erro na autenticação:", authError);
          
          // Se temos um perfil local, tentar modo offline
          if (matchingProfile) {
            if (matchingProfile.password === formData.password) {
              console.log("Fallback para login offline após erro de autenticação");
              setSuccess(true);
              
              localStorage.setItem('isOfflineMode', 'true');
              localStorage.setItem('currentUserProfile', JSON.stringify(matchingProfile));
              
              toast({
                title: "Conectado em modo limitado",
                description: "Usando dados locais devido a problemas de conexão.",
                variant: "warning",
                duration: 5000,
              });
              
              setTimeout(() => {
                navigate("/");
              }, 1000);
              return;
            }
          }
          
          setError("Erro ao tentar autenticar. Verifique sua conexão e tente novamente.");
          setLoading(false);
          return;
        }
      } 
      
      // Modo offline direto
      else if (matchingProfile) {
        console.log("Modo offline ativo, tentando login local");
        
        // Verificar senha no modo offline
        if (matchingProfile.password === formData.password) {
          console.log("Login offline bem-sucedido");
          setSuccess(true);
          
          localStorage.setItem('isOfflineMode', 'true');
          localStorage.setItem('currentUserProfile', JSON.stringify(matchingProfile));
          
          toast({
            title: "Conectado em modo offline",
            description: "Você está usando o aplicativo em modo offline.",
            variant: "warning",
            duration: 5000,
          });
          
          setTimeout(() => {
            navigate("/");
          }, 1000);
          return;
        } else {
          setError("Email ou senha inválidos");
          setLoading(false);
          return;
        }
      } 
      
      // Não temos perfil local e estamos offline
      else {
        setError("Não foi possível fazer login. Verifique sua conexão ou crie uma conta.");
        setLoading(false);
        return;
      }
    } catch (err: any) {
      console.error("Erro fatal no login:", err);
      setError("Ocorreu um erro inesperado. Tente novamente mais tarde.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {accountCreated && (
        <div className="bg-green-100 dark:bg-green-900/30 border-2 border-green-500 dark:border-green-600 text-green-800 dark:text-green-300 p-6 rounded-lg mb-6 animate-fade-in flex items-center gap-4 shadow-md">
          <div className="rounded-full bg-green-200 dark:bg-green-800 p-3 flex-shrink-0">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold">Conta criada com sucesso!</h3>
            <p className="text-sm mt-1">Sua conta foi criada e seus dados foram salvos com sucesso. Use suas credenciais para fazer login.</p>
          </div>
        </div>
      )}
      {success && ( //Improved success message
        <div className="success-message mb-4 rounded-lg p-4">
          <div className="success-message-icon">
            <CheckCircle className="h-5 w-5 text-[#00a045]" />
          </div>
          <div>
            <span className="font-medium text-[#00a045]">Login bem-sucedido!</span>
            <p className="text-sm text-[#00a045]">Redirecionando para o dashboard...</p>
          </div>
        </div>
      )}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-brand-black dark:text-white">
          Entrar na plataforma
        </h1>
        <p className="text-sm text-brand-muted dark:text-white/60">
          Insira suas credenciais para acessar
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-brand-black dark:text-white">
            Usuário ou E-mail
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Digite seu usuário ou e-mail"
              className="pl-10 h-11"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-brand-black dark:text-white">
              Senha
            </label>
            <Button
              variant="link"
              className="text-xs text-brand-primary hover:text-brand-primary/90 p-0 h-auto"
            >
              Esqueci minha senha
            </Button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Digite sua senha"
              className="pl-10 pr-10 h-11"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
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
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md mb-4">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 dark:text-red-400">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span className="text-sm font-medium text-red-700 dark:text-red-300">{error}</span>
            </div>
            {error.includes("conexão") && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-1 pl-6">
                Dica: Verifique se o Supabase está acessível e se sua conexão com a internet está funcionando.
              </div>
            )}
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-11 text-base bg-brand-primary hover:bg-brand-primary/90 text-white"
          disabled={loading}
        >
          {loading ? "Entrando..." : "Entrar"}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-[#0A2540] px-2 text-muted-foreground">
              Ou continue com
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-11">
            <img
              src="https://www.svgrepo.com/show/506498/google.svg"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            Google
          </Button>
          <Button variant="outline" className="h-11">
            <img
              src="https://www.svgrepo.com/show/521654/facebook.svg"
              alt="Facebook"
              className="w-5 h-5 mr-2"
            />
            Facebook
          </Button>
        </div>

        <p className="text-center text-sm text-brand-muted dark:text-white/60">
          Ainda não tem conta?{" "}
          <Button
            variant="link"
            className="text-brand-primary hover:text-brand-primary/90 p-0 h-auto"
            onClick={() => navigate("/select-plan")}
          >
            Cadastre-se
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