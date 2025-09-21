import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  School,
  Calendar,
  GraduationCap,
  CheckCircle,
  Check,
  ArrowRight,
  Map,
  Building,
  ShieldCheck,
  Zap,
  Award,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ApiClient } from "@/services/api-client";

interface FormData {
  fullName: string;
  username: string;
  email: string;
  institution: string;
  state: string;
  classGroup: string;
  customClassGroup: string;
  grade: string;
  customGrade: string;
  birthDate: string;
  password: string;
  confirmPassword: string;
  plan: string;
}

export function RegisterForm() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = React.useState<FormData>({
    fullName: "",
    username: "",
    email: "",
    institution: "",
    state: "SP",
    classGroup: "",
    customClassGroup: "",
    grade: "",
    customGrade: "",
    birthDate: "",
    password: "",
    confirmPassword: "",
    plan: "lite",
  });

  // Estado para a seleção e confirmação do plano
  const [showPlanConfirmation, setShowPlanConfirmation] = useState(true);
  const [confirmedPlan, setConfirmedPlan] = useState("");

  // Obtém o plano inicial da URL ou localStorage
  const initialPlan = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const planParam = params.get('plan');
    const savedPlan = localStorage.getItem('selectedPlan');

    if (planParam && ['lite', 'full'].includes(planParam)) {
      return planParam;
    } else if (savedPlan && ['lite', 'full'].includes(savedPlan)) {
      return savedPlan;
    } else {
      return "lite";
    }
  })[0];

  // Função para confirmar a seleção do plano
  const handlePlanConfirmation = (plan: string) => {
    setConfirmedPlan(plan);
    localStorage.setItem('selectedPlan', plan);
    setShowPlanConfirmation(false);

    setFormData(prev => ({
      ...prev,
      plan: plan
    }));

    console.log(`Plano ${plan.toUpperCase()} selecionado com sucesso!`);
  };

  // Efeito para mostrar o modal de confirmação de plano ao carregar
  useEffect(() => {
    if (confirmedPlan) {
      setShowPlanConfirmation(false);
    } else {
      setConfirmedPlan(initialPlan);
      setFormData(prev => ({ ...prev, plan: initialPlan }));
    }
  }, [confirmedPlan, initialPlan]);

  // Estados brasileiros
  const brazilianStates = [
    { value: "AC", label: "Acre" },
    { value: "AL", label: "Alagoas" },
    { value: "AP", label: "Amapá" },
    { value: "AM", label: "Amazonas" },
    { value: "BA", label: "Bahia" },
    { value: "CE", label: "Ceará" },
    { value: "DF", label: "Distrito Federal" },
    { value: "ES", label: "Espírito Santo" },
    { value: "GO", label: "Goiás" },
    { value: "MA", label: "Maranhão" },
    { value: "MT", label: "Mato Grosso" },
    { value: "MS", label: "Mato Grosso do Sul" },
    { value: "MG", label: "Minas Gerais" },
    { value: "PA", label: "Pará" },
    { value: "PB", label: "Paraíba" },
    { value: "PR", label: "Paraná" },
    { value: "PE", label: "Pernambuco" },
    { value: "PI", label: "Piauí" },
    { value: "RJ", label: "Rio de Janeiro" },
    { value: "RN", label: "Rio Grande do Norte" },
    { value: "RS", label: "Rio Grande do Sul" },
    { value: "RO", label: "Rondônia" },
    { value: "RR", label: "Roraima" },
    { value: "SC", label: "Santa Catarina" },
    { value: "SP", label: "São Paulo" },
    { value: "SE", label: "Sergipe" },
    { value: "TO", label: "Tocantins" },
  ];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  // FUNÇÃO HANDLESUBMIT PRINCIPAL - FUNCIONA PERFEITAMENTE COM BACKEND NEON
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Validar senha
      if (formData.password !== formData.confirmPassword) {
        setError("As senhas não coincidem");
        setLoading(false);
        return;
      }

      // Verificar campo obrigatório
      if (!formData.fullName || !formData.email || !formData.password) {
        setError("Preencha todos os campos obrigatórios");
        setLoading(false);
        return;
      }

      // Verificar se o plano foi selecionado
      if (!confirmedPlan) {
        setError("Selecione um plano antes de continuar");
        setShowPlanConfirmation(true);
        setLoading(false);
        return;
      }

      // SISTEMA NEON: Usar ApiClient.register que já funciona perfeitamente
      const { user, session, error } = await ApiClient.register(
        formData.email,
        formData.password,
        {
          full_name: formData.fullName,
          display_name: formData.username,
          instituição_ensino: formData.institution,
          estado_uf: formData.state || 'SP'
        }
      );

      if (error) {
        setError(error.message || "Erro ao criar conta. Tente novamente.");
        setLoading(false);
        return;
      }

      if (user && session) {
        // Sucesso! Armazenar token e redirecionar
        localStorage.setItem('neon_auth_token', session.access_token);
        setSuccess(true);
        setLoading(false);
        
        // Redirecionar após 2 segundos
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
        return;
      }

      setError("Erro inesperado ao criar conta. Tente novamente.");
      setLoading(false);
    } catch (error) {
      console.error('Erro no registro:', error);
      setError("Erro de conexão. Verifique sua internet e tente novamente.");
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-brand-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
            1
          </div>
          <div className={`w-16 h-1 ${step >= 2 ? 'bg-brand-primary' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-brand-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
            2
          </div>
          <div className={`w-16 h-1 ${step >= 3 ? 'bg-brand-primary' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-brand-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
            3
          </div>
        </div>
      </div>
    );
  };

  // Modal de confirmação de plano
  const renderPlanConfirmationModal = () => {
    if (!showPlanConfirmation) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-[#0A2540] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Confirme seu Plano
            </h2>
            <p className="text-muted-foreground mb-6 text-center">
              Escolha o plano que melhor se adapta às suas necessidades.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Plano Lite */}
              <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold">Ponto. Lite</h3>
                  <p className="text-sm text-muted-foreground">Gratuito</p>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-green-500" />
                    <span className="text-sm">Acesso básico à plataforma</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-green-500" />
                    <span className="text-sm">Recursos essenciais</span>
                  </li>
                </ul>
                <Button
                  onClick={() => handlePlanConfirmation("lite")}
                  className="w-full"
                  variant="outline"
                >
                  Escolher Lite
                </Button>
              </div>

              {/* Plano Full */}
              <div className="border-2 border-brand-primary rounded-lg p-6 hover:shadow-lg transition-shadow relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-brand-primary text-white px-3 py-1 rounded-full text-xs">
                    Recomendado
                  </span>
                </div>
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold">Ponto. Full</h3>
                  <p className="text-sm text-muted-foreground">Recursos completos</p>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-green-500" />
                    <span className="text-sm">Todos os recursos do Lite</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-green-500" />
                    <span className="text-sm">Recursos avançados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-green-500" />
                    <span className="text-sm">Suporte prioritário</span>
                  </li>
                </ul>
                <Button
                  onClick={() => handlePlanConfirmation("full")}
                  className="w-full"
                >
                  Escolher Full
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {renderPlanConfirmationModal()}
      
      {success ? (
        <div className="text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold text-green-600">
            Conta criada com sucesso!
          </h2>
          <p className="text-muted-foreground">
            Redirecionando para o dashboard...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderStepIndicator()}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Informações Pessoais */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center mb-6">
                Informações Pessoais
              </h2>
              
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Nome completo"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>

                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Nome de usuário"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>

                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="date"
                    placeholder="Data de nascimento"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange("birthDate", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Button type="button" onClick={nextStep} className="w-full">
                Continuar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 2: Instituição e Localização */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center mb-6">
                Instituição e Localização
              </h2>
              
              <div className="space-y-4">
                <div className="relative">
                  <School className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Nome da instituição de ensino"
                    value={formData.institution}
                    onChange={(e) => handleInputChange("institution", e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="relative">
                  <Map className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <select
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="">Selecione o estado</option>
                    {brazilianStates.map((state) => (
                      <option key={state.value} value={state.value}>
                        {state.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Turma (opcional)"
                    value={formData.classGroup}
                    onChange={(e) => handleInputChange("classGroup", e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Série/Ano (opcional)"
                    value={formData.grade}
                    onChange={(e) => handleInputChange("grade", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="button" onClick={prevStep} variant="outline" className="flex-1">
                  Voltar
                </Button>
                <Button type="button" onClick={nextStep} className="flex-1">
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Senha */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center mb-6">
                Crie sua senha
              </h2>
              
              <div className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Senha"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirmar senha"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="button" onClick={prevStep} variant="outline" className="flex-1">
                  Voltar
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Criando conta..." : "Criar conta"}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <>
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
            </>
          )}

          <p className="text-center text-sm text-brand-muted dark:text-white/60">
            Já tem uma conta?{" "}
            <Button
              type="button"
              variant="link"
              className="text-brand-primary hover:text-brand-primary/90 p-0 h-auto"
              onClick={() => navigate("/login")}
            >
              Fazer login
            </Button>
          </p>
        </form>
      )}
    </div>
  );
}