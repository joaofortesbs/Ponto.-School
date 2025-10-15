
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useNeonAuth } from "@/hooks/useNeonAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  School,
  MapPin,
  GraduationCap,
  CheckCircle,
  Globe,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";

const ESTADOS_BRASIL = [
  "Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará",
  "Distrito Federal", "Espírito Santo", "Goiás", "Maranhão",
  "Mato Grosso", "Mato Grosso do Sul", "Minas Gerais", "Pará",
  "Paraíba", "Paraná", "Pernambuco", "Piauí", "Rio de Janeiro",
  "Rio Grande do Norte", "Rio Grande do Sul", "Rondônia",
  "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins"
];

export function RegisterForm() {
  const navigate = useNavigate();
  const { register, isLoading, error } = useNeonAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    nomeUsuario: "",
    email: "",
    tipoConta: "",
    pais: "Brasil",
    estado: "",
    instituicaoEnsino: "",
    senha: "",
    confirmSenha: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep = (step: number) => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.nomeCompleto.trim()) {
        errors.nomeCompleto = "Nome completo é obrigatório";
      }
      if (!formData.nomeUsuario.trim()) {
        errors.nomeUsuario = "Nome de usuário é obrigatório";
      }
      if (!formData.email.trim()) {
        errors.email = "E-mail é obrigatório";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = "E-mail inválido";
      }
    }

    if (step === 2) {
      if (!formData.tipoConta) {
        errors.tipoConta = "Tipo de conta é obrigatório";
      }
      if (!formData.estado) {
        errors.estado = "Estado é obrigatório";
      }
      if (!formData.instituicaoEnsino.trim()) {
        errors.instituicaoEnsino = "Instituição de ensino é obrigatória";
      }
    }

    if (step === 3) {
      if (!formData.senha) {
        errors.senha = "Senha é obrigatória";
      } else if (formData.senha.length < 6) {
        errors.senha = "Senha deve ter pelo menos 6 caracteres";
      }
      if (!formData.confirmSenha) {
        errors.confirmSenha = "Confirmação de senha é obrigatória";
      } else if (formData.senha !== formData.confirmSenha) {
        errors.confirmSenha = "Senhas não coincidem";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(3)) {
      return;
    }

    try {
      console.log("📝 Iniciando processo de cadastro...");
      
      const result = await register({
        nome_completo: formData.nomeCompleto,
        nome_usuario: formData.nomeUsuario,
        email: formData.email,
        senha: formData.senha,
        tipo_conta: formData.tipoConta,
        pais: formData.pais,
        estado: formData.estado,
        instituicao_ensino: formData.instituicaoEnsino,
      });

      if (result.success) {
        console.log("✅ Cadastro realizado com sucesso!");
        localStorage.setItem("lastRegisteredEmail", formData.email);
        localStorage.setItem("lastRegisteredUsername", formData.nomeUsuario);
        
        // Verificar se existe URL de retorno para atividade compartilhada
        const returnToActivity = localStorage.getItem('returnToActivityAfterRegister');
        
        if (!result.needsManualLogin) {
          // Login automático BEM-SUCEDIDO
          console.log("🎉 Login automático realizado com sucesso!");
          
          if (returnToActivity) {
            console.log("🎯 Redirecionando para atividade compartilhada após cadastro:", returnToActivity);
            // Limpar o localStorage
            localStorage.removeItem('returnToActivityAfterRegister');
            // Adicionar parâmetro para abrir modo apresentação automaticamente
            const separator = returnToActivity.includes('?') ? '&' : '?';
            const urlComParametro = `${returnToActivity}${separator}openPresentation=true`;
            // Redirecionar para a atividade com parâmetro
            window.location.href = urlComParametro;
            return;
          } else {
            console.log("🏠 Redirecionando para dashboard...");
            navigate("/", { replace: true });
          }
        } else {
          // Login automático FALHOU - usuário precisa fazer login manual
          console.log("⚠️ Login automático falhou, redirecionando para login...");
          // MANTER returnToActivity no localStorage para usar após login manual
          navigate("/login", { 
            state: { 
              newAccount: true, 
              email: formData.email 
            } 
          });
        }
      } else {
        console.error("❌ Erro no cadastro:", result.error);
      }
    } catch (error) {
      console.error("❌ Erro inesperado no cadastro:", error);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3].map((step) => (
        <React.Fragment key={step}>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
            currentStep > step 
              ? 'bg-[#FF6B00] text-white' 
              : currentStep === step 
              ? 'bg-[#FF6B00] text-white scale-110' 
              : 'bg-white/10 text-white/50'
          }`}>
            {currentStep > step ? <Check className="h-5 w-5" /> : step}
          </div>
          {step < 3 && (
            <div className={`h-0.5 w-12 transition-all duration-300 ${
              currentStep > step ? 'bg-[#FF6B00]' : 'bg-white/10'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 rounded-2xl">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <img
            src="/lovable-uploads/Logo-Ponto. School.png"
            alt="Ponto School Logo"
            className="w-73 h-73 object-contain"
          />
        </div>
      </div>

      {renderStepIndicator()}

      <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* ETAPA 1 - Informações Básicas */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-xl font-bold text-white text-center mb-4">Informações Básicas</h3>
            
            <div>
              <div className="relative group">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 group-hover:text-[#FF6B00] transition-colors duration-200 z-10 ${
                  formErrors.nomeCompleto ? "text-red-500" : formData.nomeCompleto ? "text-[#FF6B00]" : "text-white/50"
                }`} />
                <Input
                  type="text"
                  value={formData.nomeCompleto}
                  onChange={(e) => handleInputChange("nomeCompleto", e.target.value)}
                  placeholder="Nome completo"
                  className={`pl-10 h-11 rounded-lg transition-all duration-300 hover:border-[#FF6B00]/30 bg-[#031223]/60 text-white backdrop-blur-md dark:bg-white/8 ${
                    formErrors.nomeCompleto
                      ? "border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                      : formData.nomeCompleto
                      ? "border-[#FF6B00] dark:border-[#FF6B00] focus:border-[#FF6B00] dark:focus:border-[#FF6B00] shadow-[0_0_15px_rgba(255,107,0,0.3)]"
                      : "border-[#FF6B00]/10 dark:border-[#FF6B00]/20 focus:border-[#FF6B00]/60 dark:focus:border-[#FF6B00]/60"
                  }`}
                  style={{
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.1)",
                  }}
                />
              </div>
              {formErrors.nomeCompleto && (
                <p className="text-red-400 text-xs mt-1">{formErrors.nomeCompleto}</p>
              )}
            </div>

            <div>
              <div className="relative group">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 group-hover:text-[#FF6B00] transition-colors duration-200 z-10 ${
                  formErrors.nomeUsuario ? "text-red-500" : formData.nomeUsuario ? "text-[#FF6B00]" : "text-white/50"
                }`} />
                <Input
                  type="text"
                  value={formData.nomeUsuario}
                  onChange={(e) => handleInputChange("nomeUsuario", e.target.value)}
                  placeholder="Nome de usuário"
                  className={`pl-10 h-11 rounded-lg transition-all duration-300 hover:border-[#FF6B00]/30 bg-[#031223]/60 text-white backdrop-blur-md dark:bg-white/8 ${
                    formErrors.nomeUsuario
                      ? "border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                      : formData.nomeUsuario
                      ? "border-[#FF6B00] dark:border-[#FF6B00] focus:border-[#FF6B00] dark:focus:border-[#FF6B00] shadow-[0_0_15px_rgba(255,107,0,0.3)]"
                      : "border-[#FF6B00]/10 dark:border-[#FF6B00]/20 focus:border-[#FF6B00]/60 dark:focus:border-[#FF6B00]/60"
                  }`}
                  style={{
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.1)",
                  }}
                />
              </div>
              {formErrors.nomeUsuario && (
                <p className="text-red-400 text-xs mt-1">{formErrors.nomeUsuario}</p>
              )}
            </div>

            <div>
              <div className="relative group">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 group-hover:text-[#FF6B00] transition-colors duration-200 z-10 ${
                  formErrors.email ? "text-red-500" : formData.email ? "text-[#FF6B00]" : "text-white/50"
                }`} />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="E-mail"
                  className={`pl-10 h-11 rounded-lg transition-all duration-300 hover:border-[#FF6B00]/30 bg-[#031223]/60 text-white backdrop-blur-md dark:bg-white/8 ${
                    formErrors.email
                      ? "border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                      : formData.email
                      ? "border-[#FF6B00] dark:border-[#FF6B00] focus:border-[#FF6B00] dark:focus:border-[#FF6B00] shadow-[0_0_15px_rgba(255,107,0,0.3)]"
                      : "border-[#FF6B00]/10 dark:border-[#FF6B00]/20 focus:border-[#FF6B00]/60 dark:focus:border-[#FF6B00]/60"
                  }`}
                  style={{
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.1)",
                  }}
                />
              </div>
              {formErrors.email && (
                <p className="text-red-400 text-xs mt-1">{formErrors.email}</p>
              )}
            </div>
          </div>
        )}

        {/* ETAPA 2 - Informações Acadêmicas */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-xl font-bold text-white text-center mb-4">Informações Acadêmicas</h3>
            
            <div>
              <div className="relative group">
                <GraduationCap className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 group-hover:text-[#FF6B00] transition-colors duration-200 z-10 ${
                  formErrors.tipoConta ? "text-red-500" : formData.tipoConta ? "text-[#FF6B00]" : "text-white/50"
                }`} />
                <Select value={formData.tipoConta} onValueChange={(value) => handleInputChange("tipoConta", value)}>
                  <SelectTrigger className={`pl-10 h-11 rounded-lg transition-all duration-300 hover:border-[#FF6B00]/30 bg-[#031223]/60 text-white backdrop-blur-md ${
                    formErrors.tipoConta
                      ? "border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500"
                      : formData.tipoConta
                      ? "border-[#FF6B00] dark:border-[#FF6B00] focus:border-[#FF6B00] dark:focus:border-[#FF6B00]"
                      : "border-[#FF6B00]/10 dark:border-[#FF6B00]/20 focus:border-[#FF6B00]/60"
                  }`}>
                    <SelectValue placeholder="Tipo de conta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Professor">Professor</SelectItem>
                    <SelectItem value="Aluno">Aluno</SelectItem>
                    <SelectItem value="Coordenador">Coordenador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formErrors.tipoConta && (
                <p className="text-red-400 text-xs mt-1">{formErrors.tipoConta}</p>
              )}
            </div>

            <div>
              <div className="relative group">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 h-4 w-4" />
                <Input
                  type="text"
                  value={formData.pais}
                  readOnly
                  className="pl-10 h-11 rounded-lg bg-[#031223]/60 border-[#FF6B00]/10 text-white/70 cursor-not-allowed backdrop-blur-md"
                  style={{
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                  }}
                />
              </div>
            </div>

            <div>
              <div className="relative group">
                <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 group-hover:text-[#FF6B00] transition-colors duration-200 z-10 ${
                  formErrors.estado ? "text-red-500" : formData.estado ? "text-[#FF6B00]" : "text-white/50"
                }`} />
                <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
                  <SelectTrigger className={`pl-10 h-11 rounded-lg transition-all duration-300 hover:border-[#FF6B00]/30 bg-[#031223]/60 text-white backdrop-blur-md ${
                    formErrors.estado
                      ? "border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500"
                      : formData.estado
                      ? "border-[#FF6B00] dark:border-[#FF6B00] focus:border-[#FF6B00] dark:focus:border-[#FF6B00]"
                      : "border-[#FF6B00]/10 dark:border-[#FF6B00]/20 focus:border-[#FF6B00]/60"
                  }`}>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS_BRASIL.map((estado) => (
                      <SelectItem key={estado} value={estado}>
                        {estado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formErrors.estado && (
                <p className="text-red-400 text-xs mt-1">{formErrors.estado}</p>
              )}
            </div>

            <div>
              <div className="relative group">
                <School className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 group-hover:text-[#FF6B00] transition-colors duration-200 z-10 ${
                  formErrors.instituicaoEnsino ? "text-red-500" : formData.instituicaoEnsino ? "text-[#FF6B00]" : "text-white/50"
                }`} />
                <Input
                  type="text"
                  value={formData.instituicaoEnsino}
                  onChange={(e) => handleInputChange("instituicaoEnsino", e.target.value)}
                  placeholder="Instituição de ensino"
                  className={`pl-10 h-11 rounded-lg transition-all duration-300 hover:border-[#FF6B00]/30 bg-[#031223]/60 text-white backdrop-blur-md dark:bg-white/8 ${
                    formErrors.instituicaoEnsino
                      ? "border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                      : formData.instituicaoEnsino
                      ? "border-[#FF6B00] dark:border-[#FF6B00] focus:border-[#FF6B00] dark:focus:border-[#FF6B00] shadow-[0_0_15px_rgba(255,107,0,0.3)]"
                      : "border-[#FF6B00]/10 dark:border-[#FF6B00]/20 focus:border-[#FF6B00]/60 dark:focus:border-[#FF6B00]/60"
                  }`}
                  style={{
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.1)",
                  }}
                />
              </div>
              {formErrors.instituicaoEnsino && (
                <p className="text-red-400 text-xs mt-1">{formErrors.instituicaoEnsino}</p>
              )}
            </div>
          </div>
        )}

        {/* ETAPA 3 - Senha */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-xl font-bold text-white text-center mb-4">Defina sua Senha</h3>
            
            <div>
              <div className="relative group">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 group-hover:text-[#FF6B00] transition-colors duration-200 z-10 ${
                  formErrors.senha ? "text-red-500" : formData.senha ? "text-[#FF6B00]" : "text-white/50"
                }`} />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.senha}
                  onChange={(e) => handleInputChange("senha", e.target.value)}
                  placeholder="Senha"
                  className={`pl-10 pr-10 h-11 rounded-lg transition-all duration-300 hover:border-[#FF6B00]/30 bg-[#031223]/60 text-white backdrop-blur-md dark:bg-white/8 ${
                    formErrors.senha
                      ? "border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                      : formData.senha
                      ? "border-[#FF6B00] dark:border-[#FF6B00] focus:border-[#FF6B00] dark:focus:border-[#FF6B00] shadow-[0_0_15px_rgba(255,107,0,0.3)]"
                      : "border-[#FF6B00]/10 dark:border-[#FF6B00]/20 focus:border-[#FF6B00]/60 dark:focus:border-[#FF6B00]/60"
                  }`}
                  style={{
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.1)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-[#FF6B00] transition-colors z-10"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formErrors.senha && (
                <p className="text-red-400 text-xs mt-1">{formErrors.senha}</p>
              )}
            </div>

            <div>
              <div className="relative group">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 group-hover:text-[#FF6B00] transition-colors duration-200 z-10 ${
                  formErrors.confirmSenha ? "text-red-500" : formData.confirmSenha ? "text-[#FF6B00]" : "text-white/50"
                }`} />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmSenha}
                  onChange={(e) => handleInputChange("confirmSenha", e.target.value)}
                  placeholder="Confirmar senha"
                  className={`pl-10 pr-10 h-11 rounded-lg transition-all duration-300 hover:border-[#FF6B00]/30 bg-[#031223]/60 text-white backdrop-blur-md dark:bg-white/8 ${
                    formErrors.confirmSenha
                      ? "border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                      : formData.confirmSenha
                      ? "border-[#FF6B00] dark:border-[#FF6B00] focus:border-[#FF6B00] dark:focus:border-[#FF6B00] shadow-[0_0_15px_rgba(255,107,0,0.3)]"
                      : "border-[#FF6B00]/10 dark:border-[#FF6B00]/20 focus:border-[#FF6B00]/60 dark:focus:border-[#FF6B00]/60"
                  }`}
                  style={{
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.1)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-[#FF6B00] transition-colors z-10"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formErrors.confirmSenha && (
                <p className="text-red-400 text-xs mt-1">{formErrors.confirmSenha}</p>
              )}
            </div>
          </div>
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

        {/* Botões de Navegação */}
        <div className="flex gap-3">
          {currentStep > 1 && (
            <Button
              type="button"
              onClick={handleBack}
              variant="outline"
              className="flex-1 h-11 text-base border-[#FF6B00]/30 text-white hover:bg-[#FF6B00]/10 transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          )}
          
          {currentStep < 3 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="flex-1 h-11 text-base bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-[#FF6B00]/20 relative overflow-hidden group"
            >
              <span className="relative z-10 font-bold flex items-center justify-center">
                Próximo
                <ArrowRight className="h-4 w-4 ml-2" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-11 text-base bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-[#FF6B00]/20 relative overflow-hidden group"
            >
              <span className="relative z-10 font-bold flex items-center justify-center">
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Criando conta...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Criar Conta
                  </>
                )}
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
            </Button>
          )}
        </div>

        <div className="mt-8"></div>

        <p className="text-center text-sm text-white/70 font-bold">
          Já tem uma conta?{" "}
          <button
            type="button"
            onClick={() => navigate("/auth/login")}
            className="text-[#FF6B00] hover:text-[#FF6B00]/90 font-bold relative group"
          >
            Fazer login
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FF6B00] group-hover:w-full transition-all duration-300"></span>
          </button>
        </p>
      </form>
    </div>
  );
}
