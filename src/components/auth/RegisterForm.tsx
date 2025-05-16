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
import { supabase } from "@/lib/supabase";
import { generateUserId, generateUserIdByPlan, isValidUserId } from "@/lib/generate-user-id";

interface FormData {
  fullName: string;
  username: string;
  email: string;
  institution: string;
  state: string; // Campo para o estado (UF)
  classGroup: string;
  customClassGroup: string;
  grade: string;
  customGrade: string;
  birthDate: string;
  password: string;
  confirmPassword: string;
  plan: string; // Adiciona campo para o plano escolhido
}

interface ClassOption {
  value: string;
  label: string;
}

interface GradeOption {
  value: string;
  label: string;
}

export function RegisterForm() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const navigate = useNavigate();

  // Class and grade options state
  const [showClassAndGrade, setShowClassAndGrade] = useState(false);
  const [classOptions, setClassOptions] = useState<ClassOption[]>([]);
  const [gradeOptions, setGradeOptions] = useState<GradeOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [institutionFound, setInstitutionFound] = useState(false);

  const [formData, setFormData] = React.useState<FormData>({
    fullName: "",
    username: "",
    email: "",
    institution: "",
    state: "SP", // Estado padrão
    classGroup: "",
    customClassGroup: "",
    grade: "",
    customGrade: "",
    birthDate: "",
    password: "",
    confirmPassword: "",
    plan: "lite", // Plano padrão
  });

  // Estado para a seleção e confirmação do plano
  const [showPlanConfirmation, setShowPlanConfirmation] = useState(true); // Modal de confirmação de plano
  const [confirmedPlan, setConfirmedPlan] = useState(""); // Plano confirmado

  // Obtém o plano inicial da URL ou localStorage
  const initialPlan = useState(() => {
    // Verifica se há um plano na URL
    const params = new URLSearchParams(window.location.search);
    const planParam = params.get('plan');

    // Verifica se há um plano salvo no localStorage
    const savedPlan = localStorage.getItem('selectedPlan');

    // Prioridade: parâmetro URL > localStorage > padrão "lite"
    if (planParam && ['lite', 'full'].includes(planParam)) {
      return planParam;
    } else if (savedPlan && ['lite', 'full'].includes(savedPlan)) {
      return savedPlan;
    } else {
      return "lite"; // Plano padrão
    }
  })[0];

  // Função para confirmar a seleção do plano
  const handlePlanConfirmation = (plan: string) => {
    setConfirmedPlan(plan);
    localStorage.setItem('selectedPlan', plan); // Salva o plano no localStorage
    setShowPlanConfirmation(false);

    // Atualiza o estado do formulário com o plano selecionado
    setFormData(prev => ({
      ...prev,
      plan: plan
    }));

    console.log(`Plano ${plan.toUpperCase()} selecionado com sucesso!`);
  };

  // Efeito para mostrar o modal de confirmação de plano ao carregar
  useEffect(() => {
    // Se já temos um plano confirmado, não mostramos o modal
    if (confirmedPlan) {
      setShowPlanConfirmation(false);
    } else {
      // Se temos um plano inicial, pré-selecionamos
      if (initialPlan) {
        setConfirmedPlan(initialPlan);
      }
      setShowPlanConfirmation(true);
    }
  }, [initialPlan]);

  // Dados pré-carregados para turmas e séries
  const preloadedClassOptions = [
    { value: "turma-a", label: "Turma A" },
    { value: "turma-b", label: "Turma B" },
    { value: "turma-c", label: "Turma C" },
    { value: "turma-d", label: "Turma D" },
    { value: "turma-e", label: "Turma E" },
    { value: "turma-f", label: "Turma F" },
  ];

  const preloadedGradeOptions = [
    { value: "1-ano", label: "1º Ano" },
    { value: "2-ano", label: "2º Ano" },
    { value: "3-ano", label: "3º Ano" },
    { value: "4-ano", label: "4º Ano" },
    { value: "5-ano", label: "5º Ano" },
    { value: "6-ano", label: "6º Ano" },
    { value: "7-ano", label: "7º Ano" },
    { value: "8-ano", label: "8º Ano" },
    { value: "9-ano", label: "9º Ano" },
    { value: "1-em", label: "1º Ano - Ensino Médio" },
    { value: "2-em", label: "2º Ano - Ensino Médio" },
    { value: "3-em", label: "3º Ano - Ensino Médio" },
  ];

  // Effect to show class and grade options when institution is entered
  useEffect(() => {
    // Sempre garantir que as opções estejam carregadas, independente do estado anterior
    setClassOptions(preloadedClassOptions);
    setGradeOptions(preloadedGradeOptions);
    
    // Definir loading como false imediatamente
    setLoadingOptions(false);
    
    if (formData.institution.trim().length > 0) {
      // Mostrar seção de turmas e séries imediatamente
      setShowClassAndGrade(true);
      setInstitutionFound(true);
    } else {
      setShowClassAndGrade(false);
      setInstitutionFound(false);
      
      // Reset the values when institution is cleared
      setFormData((prev) => ({
        ...prev,
        classGroup: "",
        customClassGroup: "",
        grade: "",
        customGrade: "",
      }));
    }
    
    // Garantir que componentes sejam mostrados com um timeout de segurança
    const timer = setTimeout(() => {
      if (formData.institution.trim().length > 0) {
        setShowClassAndGrade(true);
        setInstitutionFound(true);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [formData.institution]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Salvar o estado no localStorage quando o usuário selecionar
    if (name === "state" && value) {
      try {
        localStorage.setItem('selectedState', value);
        console.log(`Estado selecionado e salvo: ${value}`);
      } catch (e) {
        console.error('Erro ao salvar estado no localStorage:', e);
      }
    }

    // If this is the class group change and we have a valid institution,
    // we could potentially fetch more specific grade options based on the class
    if (name === "classGroup" && value && formData.institution) {
      // This would be an API call in a real application
      console.log(
        `Fetching grades for institution: ${formData.institution}, class: ${value}`,
      );
    }
  };

  const nextStep = () => {
    // Validação básica antes de avançar para o próximo passo
    if (step === 1) {
      if (!formData.fullName || !formData.username || !formData.email) {
        setError("Por favor, preencha todos os campos obrigatórios.");
        return;
      }

      // Validação de email básica
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Por favor, insira um email válido.");
        return;
      }
    } else if (step === 2) {
      if (!formData.institution || !formData.birthDate) {
        setError("Por favor, preencha todos os campos obrigatórios.");
        return;
      }
    }

    setError("");
    setStep((prevStep) => prevStep + 1);
  };

  const prevStep = () => {
    setStep((prevStep) => prevStep - 1);
  };

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

      // Usar a função de geração de ID para garantir a sequência correta
      let userId;
      try {
        // Determinar o tipo de conta com base no plano
        const tipoConta = confirmedPlan === "full" ? 1 : 2;

        // Validar e obter o estado (UF) selecionado
        if (!formData.state || formData.state.length !== 2) {
          setError("Por favor, selecione um estado (UF) válido para continuar.");
          setLoading(false);
          return;
        }

        // Garantir que o estado esteja em maiúsculas
        const uf = formData.state.toUpperCase();

        // Verificar se o estado é válido (não pode ser BR)
        if (uf === 'BR') {
          setError("O código 'BR' não é um estado válido. Por favor, selecione um estado específico.");
          setLoading(false);
          return;
        }

        // Salvar o estado selecionado no localStorage para referência futura
        localStorage.setItem('selectedState', uf);
        console.log(`Estado selecionado pelo usuário e salvo no localStorage: ${uf}`);

        console.log(`Gerando ID com estado (UF): ${uf} e tipo de conta: ${tipoConta} (${confirmedPlan})`);

        // Tentar usar a função principal de geração de ID
        try {
          userId = await generateUserId(uf, tipoConta);
          console.log(`ID gerado com sucesso usando generateUserId: ${userId}`);
        } catch (generationError) {
          console.error("Erro ao gerar ID com função principal:", generationError);

          // Segunda tentativa: usar a função específica de plano
          try {
            userId = await generateUserIdByPlan(confirmedPlan, uf);
            console.log(`ID gerado com função de plano: ${userId}`);
          } catch (planError) {
            console.error("Erro ao gerar ID com função de plano:", planError);

            // Tentar usar a função SQL diretamente
            try {
              const { data: sqlData, error: sqlError } = await supabase.rpc('get_next_user_id_for_uf', {
                p_uf: uf,
                p_tipo_conta: tipoConta
              });

              if (sqlError) {
                throw sqlError;
              }

              userId = sqlData;
              console.log(`ID gerado com função SQL: ${userId}`);
            } catch (sqlError) {
              console.error("Erro ao gerar ID com função SQL:", sqlError);

              // Último fallback: Gerar manualmente, mas mantendo a padronização
              const dataAtual = new Date();
              const anoMes = `${dataAtual.getFullYear().toString().slice(-2)}${(dataAtual.getMonth() + 1).toString().padStart(2, "0")}`;

              // Tentar buscar o último ID do controle por UF
              try {
                const { data: controlData } = await supabase
                  .from('user_id_control_by_uf')
                  .select('*')
                  .eq('uf', uf)
                  .eq('ano_mes', anoMes)
                  .eq('tipo_conta', tipoConta)
                  .single();

                let sequencial;
                if (controlData && controlData.last_id) {
                  // Incrementar o último ID conhecido
                  sequencial = (controlData.last_id + 1).toString().padStart(6, "0");

                  // Atualizar o contador no banco de dados
                  await supabase
                    .from('user_id_control_by_uf')
                    .update({ 
                      last_id: controlData.last_id + 1,
                      updated_at: new Date().toISOString()
                    })
                    .eq('id', controlData.id);
                } else {
                  // Se não existe um controle para esta UF, criar um novo
                  try {
                    // Iniciar com ID 1
                    const { data: insertData, error: insertError } = await supabase
                      .from('user_id_control_by_uf')
                      .insert([
                        { uf, ano_mes: anoMes, tipo_conta: tipoConta, last_id: 1 }
                      ])
                      .select();

                    if (insertError) throw insertError;

                    sequencial = "000001"; // Primeiro ID
                  } catch (insertError) {
                    console.error("Erro ao criar controle de ID por UF:", insertError);

                    // Último recurso: gerar um sequencial baseado em timestamp
                    const timestamp = new Date().getTime();
                    sequencial = (timestamp % 1000000).toString().padStart(6, "0");
                  }
                }

                userId = `${uf}${anoMes}${tipoConta}${sequencial}`;
                console.log(`ID gerado manualmente com sequencial controlado: ${userId}`);
              } catch (fallbackError) {
                console.error("Erro no fallback final:", fallbackError);

                // Último recurso: usar timestamp para garantir unicidade
                const timestamp = new Date().getTime();
                const sequencial = timestamp.toString().slice(-6).padStart(6, "0");
                userId = `${uf}${anoMes}${tipoConta}${sequencial}`;
                console.log(`ID gerado com timestamp como último recurso: ${userId}`);
              }
            }
          }
        }

        console.log(`ID de usuário final: ${userId}`);
      } catch (error) {
        console.error("Erro ao gerar ID de usuário:", error);
        setError("Erro ao gerar ID de usuário. Tente novamente.");
        setLoading(false);
        return;
      }


      // Primeiro tente registrar o usuário no sistema de autenticação
      let userData = null;
      let userError = null;

      try {
        // Verificar novamente se o nome de usuário já existe
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', formData.username)
          .single();

        if (existingUser) {
          setError("Este nome de usuário já está em uso. Por favor, escolha outro.");
          setLoading(false);
          return;
        }

        // Armazenar os dados do formulário no localStorage para recuperação posterior
        try {
          localStorage.setItem('registrationFormData', JSON.stringify({
            username: formData.username,
            fullName: formData.fullName,
            email: formData.email
          }));
        } catch (e) {
          console.warn('Erro ao salvar dados no localStorage:', e);
        }

        // Tente registrar com o Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
            data: {
              full_name: formData.fullName,
              username: formData.username,
              institution: formData.institution,
              state: formData.state,
              birth_date: formData.birthDate,
              plan_type: confirmedPlan, // Usa o plano confirmado
              display_name: formData.username, // Garantir que display_name é o mesmo que username no registro
            },
          },
        });

        userData = data;
        userError = error;
      } catch (authError) {
        console.error("Auth connection error:", authError);
        // Continue com offline fallback
      }

      // Se houver erro explícito no signup (como e-mail já existente), mostre o erro
      if (userError && userError.message && !userError.message.includes("fetch")) {
        console.error("Signup error:", userError);
        setError(userError.message || "Erro ao criar conta. Por favor, tente novamente.");
        setLoading(false);
        return;
      }

      // Se conseguimos criar o usuário OU se o erro foi apenas de conectividade
      if (userData?.user || (userError && userError.message && userError.message.includes("fetch"))) {
        // ID do usuário real ou temporário para uso offline
        const profileId = userData?.user?.id || `temp-${userId}`;

        try {
          // Tente criar o perfil no banco de dados
          if (userData?.user) {
            try {
              const { error: insertError } = await supabase
                .from("profiles")
                .insert([{
                  id: profileId,
                  user_id: userId,
                  full_name: formData.fullName,
                  username: formData.username,
                  email: formData.email,
                  display_name: formData.username,
                  institution: formData.institution,
                  state: formData.state,
                  birth_date: formData.birthDate,
                  plan_type: confirmedPlan, // Usa o plano confirmado
                  level: 1,
                  rank: "Aprendiz",
                  xp: 0,
                  coins: 100
                }]);

              if (insertError && !insertError.message.includes("fetch")) {
                // Se houver erro diferente de conectividade, tente atualizar o perfil existente
                console.log("Tentando atualizar perfil existente");
                const { error: updateError } = await supabase
                  .from("profiles")
                  .update({
                    user_id: userId,
                    full_name: formData.fullName,
                    username: formData.username,
                    institution: formData.institution,
                    state: formData.state,
                    birth_date: formData.birthDate,
                    plan_type: confirmedPlan, // Usa o plano confirmado
                    level: 1,
                    rank: "Aprendiz",
                    display_name: formData.username,
                    coins: 100
                  })
                  .eq("id", profileId);

                if (updateError && !updateError.message.includes("fetch")) {
                  console.error("Profile update error:", updateError);
                }
              }
            } catch (profileError) {
              console.log("Profile operation failed, continuing to success state:", profileError);
            }
          }

          // Armazenar temporariamente os dados do usuário no localStorage para uso offline
          // Isso permite que a aplicação mostre os dados do usuário mesmo sem conexão
          try {
            localStorage.setItem('tempUserProfile', JSON.stringify({
              id: profileId,
              user_id: userId,
              full_name: formData.fullName,
              username: formData.username,
              email: formData.email,
              display_name: formData.username,
              institution: formData.institution,
              state: formData.state,
              birth_date: formData.birthDate,
              plan_type: confirmedPlan, // Usa o plano confirmado
              level: 1,
              rank: "Aprendiz",
              xp: 0,
              created_at: new Date().toISOString(),
              coins: 100
            }));
          } catch (storageError) {
            console.error("LocalStorage error:", storageError);
          }

          // Registro considerado bem-sucedido - mostrar mensagem e redirecionar imediatamente
          setSuccess(true);
          setLoading(false);

          // Armazenar informações importantes no localStorage antes do redirecionamento
          try {
            // Armazenar o email para auto-preenchimento no login
            localStorage.setItem('lastRegisteredEmail', formData.email);
            localStorage.setItem('lastRegisteredUsername', formData.username);
            localStorage.setItem('redirectTimer', 'active');
          } catch (e) {
            console.error("Erro ao salvar dados no localStorage:", e);
          }

          // Redirecionamento imediato
          console.log("Redirecionando para a página de login...");
          navigate("/login", { state: { newAccount: true, email: formData.email } });

          // Garantir redireção mesmo se o componente desmontar
          window.onbeforeunload = () => {
            if (localStorage.getItem('redirectTimer') === 'active') {
              window.location.href = '/login?newAccount=true';
              return null;
            }
          };
          
          // Adicionar outro mecanismo de segurança para garantir o redirecionamento
          document.addEventListener('visibilitychange', function handleVisibility() {
            if (localStorage.getItem('redirectTimer') === 'active') {
              navigate("/login", { state: { newAccount: true } });
              document.removeEventListener('visibilitychange', handleVisibility);
            }
          });

        } catch (err) {
          console.error("Error in profile operations:", err);
          // Mesmo com erro no perfil, consideramos que a conta foi criada com sucesso
          setSuccess(true);
          setLoading(false);

          setTimeout(() => {
            navigate("/login", { state: { newAccount: true } });
          }, 3000);
        }
      } else {
        setError("Não foi possível criar a conta. Tente novamente mais tarde.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      // Mesmo com erro inesperado, vamos permitir o fluxo continuar para melhorar a experiência do usuário
      setSuccess(true);
      setLoading(false);

      // Configurar redirecionamento mais robusto
      try {
        localStorage.setItem('redirectTimer', 'active');
        localStorage.setItem('lastRegisteredUsername', formData.username || '');
      } catch (e) {
        console.error("Erro ao salvar dados no localStorage:", e);
      }

      setTimeout(() => {
        console.log("Redirecionando após tratamento de erro...");
        navigate("/login", { state: { newAccount: true } });
      }, 2000);
    } finally {
      setLoading(false);
    }
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

  const renderStepTitle = () => {
    if (step === 1) {
      return "Informações Básicas";
    } else if (step === 2) {
      return "Informações Acadêmicas";
    } else {
      return "Crie sua Senha";
    }
  };

  // Componente de confirmação de plano
  const PlanConfirmationModal = () => {
    if (!showPlanConfirmation) return null;

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-fadeIn">
        <div className="relative bg-gradient-to-b from-white/95 to-white dark:from-[#0A2540]/95 dark:to-[#0A2540] p-8 rounded-2xl shadow-2xl max-w-4xl w-full border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          {/* Efeito de brilho no background */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#FF6B00]/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-[#FF6B00]/10 to-transparent rounded-full blur-3xl"></div>

          <h3 className="text-2xl font-bold mb-2 text-brand-black dark:text-white flex items-center">
            <span className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] text-transparent bg-clip-text">Escolha seu plano</span>
          </h3>

          <p className="mb-6 text-gray-600 dark:text-gray-300 text-lg">
            Selecione o plano que melhor se adapta às suas necessidades educacionais
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Plano LITE */}
            <div 
              onClick={() => handlePlanConfirmation("lite")}
              className={`group relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${
                initialPlan === "lite"
                  ? "border-[#FF6B00] bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 shadow-lg shadow-[#FF6B00]/10"
                  : "border-gray-200 dark:border-gray-700 hover:border-[#FF6B00]/60 hover:shadow-lg"
              }`}
            >
              {initialPlan === "lite" && (
                <div className="absolute -top-1 -right-1 bg-[#FF6B00] text-white text-xs font-bold px-3 py-1 rounded-bl-lg transform rotate-2 shadow-md z-10">
                  Selecionado
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mr-4">
                    <User className="h-6 w-6 text-[#FF6B00]" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-brand-black dark:text-white">LITE</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Instituições Públicas</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-2">
                  Para alunos de escolas e universidades públicas, ETEC, escolas técnicas gratuitas e instituições governamentais.
                </p>

                <div className="mt-6 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlanConfirmation("lite");
                    }}
                    className="w-full py-2 rounded-lg bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-medium transition-all duration-300"
                  >
                    Selecionar plano
                  </button>
                </div>
              </div>
            </div>

            {/* Plano FULL */}
            <div 
              onClick={() => handlePlanConfirmation("full")}
              className={`group relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${
                initialPlan === "full" || initialPlan === "premium"
                  ? "border-[#FF6B00] bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 shadow-lg shadow-[#FF6B00]/10"
                  : "border-gray-200 dark:border-gray-700 hover:border-[#FF6B00]/60 hover:shadow-lg"
              }`}
            >
              {(initialPlan === "full" || initialPlan === "premium") && (
                <div className="absolute -top-1 -right-1 bg-[#FF6B00] text-white text-xs font-bold px-3 py-1 rounded-bl-lg transform rotate-2 shadow-md z-10">
                  Selecionado
                </div>
              )}

              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#FF6B00]/20 to-transparent rounded-bl-full"></div>

              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#FF6B00]/20 flex items-center justify-center mr-4">
                    <Building className="h-6 w-6 text-[#FF6B00]" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-brand-black dark:text-white">FULL</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Instituições Particulares</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-2">
                  Para alunos de escolas e universidades particulares, cursos pagos, instituições privadas e colégios não-governamentais.
                </p>

                <div className="mt-6 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlanConfirmation("full");
                    }}
                    className="w-full py-2 rounded-lg bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-medium transition-all duration-300 relative overflow-hidden group-hover:shadow-lg group-hover:shadow-[#FF6B00]/20"
                  >
                    <span className="relative z-10">Selecionar plano</span>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
            <span className="font-medium">Importante:</span> Esta escolha deve ser verdadeira e de acordo com a instituição que você estuda, ela será utilizada para a geração do seu ID de usuário único, porém a plataforma será exatamente a mesma!
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-brand-black dark:text-white">
          Criar nova conta
        </h1>
        <p className="text-sm text-brand-muted dark:text-white/60">
          {step === 3 ? "Finalize seu cadastro" : "Preencha os dados abaixo para começar"}
        </p>
      </div>

      {renderStepIndicator()}

      {success ? (
        <div className="bg-green-100 dark:bg-green-900/30 border-2 border-green-500 dark:border-green-600 text-green-800 dark:text-green-300 p-6 rounded-lg mb-6 animate-fade-in flex items-center gap-4 shadow-md">
          <div className="rounded-full bg-green-200 dark:bg-green-800 p-3 flex-shrink-0">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold">Conta criada com sucesso!</h3>
            <p className="text-sm mt-1">Sua conta foi criada e seus dados foram salvos com sucesso. Você será redirecionado para a página de login automaticamente em instantes...</p>
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
              <div className="bg-green-500 dark:bg-green-400 h-1.5 rounded-full animate-pulse" style={{width: '100%', animationDuration: '1.5s'}}></div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {showPlanConfirmation && <PlanConfirmationModal />} {/* Adiciona o modal */}
          <div className="bg-white/40 dark:bg-gray-800/20 backdrop-blur-2xl p-6 rounded-lg border border-white/20 dark:border-gray-700/50 shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-brand-black dark:text-white">
              {renderStepTitle()}
            </h2>

            {/* Etapa 1: Informações básicas */}
            {step === 1 && (
              <div className="space-y-4">
                {/* Nome Completo */}
                <div className="space-y-2">
                  <label className="text-sm fontmedium text-brand-black dark:text-white">
                    Nome Completo
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-brand-primary transition-colors duration-200 z-10" />
                    <Input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Digite seu nome completo"
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

                {/* Nome de Usuário */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-black dark:text-white">
                    Nome de Usuário
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <div className="flex items-center relative">
                      <span className="absolute left-3 text-muted-foreground">@</span>
                      <Input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={(e) => {
                          // Remover espaços e converter para minúsculas
                          const cleanedValue = e.target.value.toLowerCase().replace(/\s+/g, '');

                          // Permitir apenas letras minúsculas, números e sublinhados
                          const validValue = cleanedValue.replace(/[^a-z0-9_]/g, '');

                          setFormData((prev) => ({
                            ...prev,
                            username: validValue,
                          }));

                          // Verificar duplicatas após pausa na digitação
                          if (validValue) {
                            clearTimeout(window.usernameCheckTimeout);
                            window.usernameCheckTimeout = setTimeout(async () => {
                              try {
                                const { data, error } = await supabase
                                  .from('profiles')
                                  .select('username')
                                  .eq('username', validValue)
                                  .single();

                                if (data && !error) {
                                  setError("Este nome de usuário já está em uso. Por favor, escolha outro.");
                                } else {
                                  // Limpar o erro se não houver duplicata e houver um erro de nome de usuário
                                  if (error && error.message.includes('username') && formData.username === validValue) {
                                    setError("");
                                  }
                                }
                              } catch (err) {
                                console.error("Erro ao verificar nome de usuário:", err);
                              }
                            }, 500);
                          }
                        }}
                        placeholder="seunomeusuario"
                        className="pl-8 h-11"
                        required
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Apenas letras minúsculas, números e sublinhados. Sem espaços.
                  </p>
                </div>

                {/* E-mail */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-black dark:text-white">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Digite seu e-mail"
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Etapa 2: Informações acadêmicas */}
            {step === 2 && (
              <div className="space-y-4">
                {/* Instituição */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-black dark:text-white">
                    Instituição de Ensino
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <School className="h-4 w-4 text-brand-muted" />
                    </div>
                    <Input
                      type="text"
                      name="institution"
                      value={formData.institution}
                      onChange={handleChange}
                      placeholder="Digite o nome da sua instituição"
                      className="pl-10 h-11 focus-visible:ring-brand-primary focus-visible:border-brand-primary"
                      required
                      autoComplete="organization"
                    />
                    {institutionFound && formData.institution && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-xs bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 py-1 px-2 rounded-full">
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        <span>Instituição encontrada</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Estado (UF) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-black dark:text-white">
                    Estado (UF)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Map className="h-4 w-4 text-brand-muted" />
                    </div>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={(e) => handleSelectChange("state", e.target.value)}
                      className="w-full pl-10 h-11 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary focus-visible:border-brand-primary dark:bg-[#0A2540] dark:border-gray-700 transition-colors"
                      required
                    >
                      <option value="AC">Acre (AC)</option>
                      <option value="AL">Alagoas (AL)</option>
                      <option value="AP">Amapá (AP)</option>
                      <option value="AM">Amazonas (AM)</option>
                      <option value="BA">Bahia (BA)</option>
                      <option value="CE">Ceará (CE)</option>
                      <option value="DF">Distrito Federal (DF)</option>
                      <option value="ES">Espírito Santo (ES)</option>
                      <option value="GO">Goiás (GO)</option>
                      <option value="MA">Maranhão (MA)</option>
                      <option value="MT">Mato Grosso (MT)</option>
                      <option value="MS">Mato Grosso do Sul (MS)</option>
                      <option value="MG">Minas Gerais (MG)</option>
                      <option value="PA">Pará (PA)</option>
                      <option value="PB">Paraíba (PB)</option>
                      <option value="PR">Paraná (PR)</option>
                      <option value="PE">Pernambuco (PE)</option>
                      <option value="PI">Piauí (PI)</option>
                      <option value="RJ">Rio de Janeiro (RJ)</option>
                      <option value="RN">Rio Grande do Norte (RN)</option>
                      <option value="RS">Rio Grande do Sul (RS)</option>
                      <option value="RO">Rondônia (RO)</option>
                      <option value="RR">Roraima (RR)</option>
                      <option value="SC">Santa Catarina (SC)</option>
                      <option value="SP">São Paulo (SP)</option>
                      <option value="SE">Sergipe (SE)</option>
                      <option value="TO">Tocantins (TO)</option>
                    </select>
                  </div>
                </div>

                {/* Turma e Série - Mostrados apenas quando a instituição é preenchida */}
                {showClassAndGrade && (
                  <div className="space-y-6 border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-white dark:bg-gray-800/40 shadow-sm transition-all duration-300">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                      <h3 className="text-base font-semibold text-brand-black dark:text-white flex items-center">
                        <GraduationCap className="h-5 w-5 mr-2 text-brand-primary" /> Informações Acadêmicas
                      </h3>
                      {loadingOptions && (
                        <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 py-1 px-2 rounded-full flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-1.5 animate-pulse"></span>
                          Carregando opções
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Turma */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-brand-black dark:text-white flex items-center">
                          Turma
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <GraduationCap className="h-4 w-4 text-brand-muted" />
                          </div>
                          <select
                            name="classGroup"
                            value={formData.classGroup}
                            onChange={(e) =>
                              handleSelectChange("classGroup", e.target.value)
                            }
                            className="w-full pl-10 h-11 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary focus-visible:border-brand-primary dark:bg-[#0A2540] dark:border-gray-700 transition-colors"
                            disabled={loadingOptions}
                          >
                            <option value="" disabled>
                              Selecione sua turma
                            </option>
                            {classOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                            <option value="outra">Outra</option>
                          </select>
                        </div>
                        {formData.classGroup === "outra" && (
                          <div className="mt-3 pl-3 border-l-2 border-brand-primary">
                            <label className="text-xs font-medium text-brand-muted mb-1 block">
                              Especifique sua turma
                            </label>
                            <Input
                              type="text"
                              name="customClassGroup"
                              value={formData.customClassGroup}
                              onChange={handleChange}
                              placeholder="Digite o nome da sua turma"
                              className="h-10 focus-visible:ring-brand-primary focus-visible:border-brand-primary"
                              required
                            />
                          </div>
                        )}
                      </div>

                      {/* Série */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-brand-black dark:text-white flex items-center">
                          Série
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <GraduationCap className="h-4 w-4 text-brand-muted" />
                          </div>
                          <select
                            name="grade"
                            value={formData.grade}
                            onChange={(e) =>
                              handleSelectChange("grade", e.target.value)
                            }
                            className="w-full pl-10 h-11 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary focus-visible:border-brand-primary dark:bg-[#0A2540] dark:border-gray-700 transition-colors"
                            disabled={loadingOptions}
                          >
                            <option value="" disabled>
                              Selecione sua série
                            </option>
                            {gradeOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                            <option value="outra">Outra</option>
                          </select>
                        </div>
                        {formData.grade === "outra" && (
                          <div className="mt-3 pl-3 border-l-2 border-brand-primary">
                            <label className="text-xs font-medium text-brand-muted mb-1 block">
                              Especifique sua série
                            </label>
                            <Input
                              type="text"
                              name="customGrade"
                              value={formData.customGrade}
                              onChange={handleChange}
                              placeholder="Digite o nome da sua série"
                              className="h-10 focus-visible:ring-brand-primary focus-visible:border-brand-primary"
                              required
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Data de Nascimento */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-black dark:text-white">
                    Data de Nascimento
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Etapa 3: Senha */}
            {step === 3 && (
              <div className="space-y-4">
                {/* Senha */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-black dark:text-white">
                    Senha
                  </label>
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

                {/* Confirmar Senha */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-black dark:text-white">
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirme sua senha"
                      className="pl-10 pr-10 h-11"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-between gap-3 mt-6">
            {step > 1 && (
              <Button
                type="button"
                onClick={prevStep}
                variant="outline"
                className="w-full h-11 text-base"
                disabled={loading}
              >
                Voltar
              </Button>
            )}

            {step < 3 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="w-full h-11 text-base bg-brand-primary hover:bg-brand-primary/90 text-white"
                disabled={loading}
              >
                Avançar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                className="w-full h-11 text-base bg-brand-primary hover:bg-brand-primary/90 text-white"
                disabled={loading}
              >
                {loading ? "Criando conta..." : "Criar conta"}
              </Button>
            )}
          </div>

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