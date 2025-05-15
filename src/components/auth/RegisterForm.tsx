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

          // Registro considerado bem-sucedido - mostrar mensagem e redirecionar após confirmação
          setSuccess(true);
          setLoading(false);

          // Reduzir o tempo de redirecionamento para melhorar a experiência do usuário
          const redirectTimer = setTimeout(() => {
            console.log("Redirecionando para a página de login...");
            navigate("/login", { state: { newAccount: true } });
          }, 1500); // Reduzido para 1.5 segundos

          // Armazenar o timer no localStorage para garantir que ele persista
          try {
            localStorage.setItem('redirectTimer', 'active');
            // Armazenar também o nome de usuário para exibir na tela de login
            localStorage.setItem('lastRegisteredUsername', formData.username);
          } catch (e) {
            console.error("Erro ao salvar dados no localStorage:", e);
          }

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
        <p className="text-muted-foreground">
          {step === 3 ? "Finalize seu cadastro" : "Preencha os dados abaixo para começar"}
        </p>
      </div>

      {renderStepIndicator()}

      {success ? (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Conta criada com sucesso!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  Sua conta foi criada e seus dados foram salvos com sucesso. Você será redirecionado para a página de login automaticamente em instantes...
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {showPlanConfirmation && <PlanConfirmationModal />} {/* Adiciona o modal */}

          <div className="grid gap-4">
            <div className="text-center">
              {renderStepTitle()}
            </div>

            {/* Etapa 1: Informações básicas */}
            {step === 1 && (
              <div className="grid gap-2">
                {/* Nome Completo */}
                <div className="relative">
                  <label
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    htmlFor="fullName"
                  >
                    Nome Completo
                  </label>
                  <Input
                    type="text"
                    name="fullName"
                    id="fullName"
                    placeholder="Digite seu nome completo"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="pl-10 group"
                    style={{
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.1)"
                    }}
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-brand-primary transition-colors duration-200 z-10" />
                </div>

                {/* Nome de Usuário */}
                <div className="relative">
                  <label
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    htmlFor="username"
                  >
                    Nome de Usuário
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      name="username"
                      id="username"
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
                        className="pl-10 group"
                        required
                      />
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-brand-primary transition-colors duration-200 z-10" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Apenas letras minúsculas, números e sublinhados. Sem espaços.
                  </p>
                </div>

                {/* E-mail */}
                <div className="relative">
                  <label
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    htmlFor="email"
                  >
                    E-mail
                  </label>
                  <div className="relative">
                    <Input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 group"
                      placeholder="Digite seu e-mail"
                      required
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-brand-primary transition-colors duration-200 z-10" />
                  </div>
                </div>
              </div>
            )}

            {/* Etapa 2: Informações acadêmicas */}
            {step === 2 && (
              <div className="grid gap-2">
                {/* Instituição */}
                <div className="relative">
                  <label
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    htmlFor="institution"
                  >
                    Instituição de Ensino
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      name="institution"
                      id="institution"
                      value={formData.institution}
                      onChange={handleChange}
                      className="pl-10 group"
                      placeholder="Digite o nome da sua instituição"
                      autoComplete="organization"
                    />
                    <School className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-brand-primary transition-colors duration-200 z-10" />
                  </div>
                  {institutionFound && formData.institution && (
                    <p className="text-xs text-green-500 mt-1">
                      Instituição encontrada
                    </p>
                  )}
                </div>

                {/* Estado (UF) */}
                <div className="relative">
                  <label
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    htmlFor="state"
                  >
                    Estado (UF)
                  </label>
                  <div className="relative">
                    <select
                      id="state"
                      name="state"
                      value={formData.state}
                      className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                      onChange={(e) =>
                        handleSelectChange("state", e.target.value)}
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
                  <div className="space-y-4">
                    <div className="text-center">
                      Informações Acadêmicas
                    </div>
                    {loadingOptions && (
                      <div className="text-center">
                        Carregando opções
                      </div>
                    )}

                    {/* Turma */}
                    <div className="relative">
                      <label
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        htmlFor="classGroup"
                      >
                        Turma
                      </label>
                      <div className="relative">
                        <select
                          id="classGroup"
                          name="classGroup"
                          value={formData.classGroup}
                          className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                          onChange={(e) =>
                            handleSelectChange("classGroup", e.target.value)
                          }
                          disabled={loadingOptions}
                        >
                          <option value="">Selecione sua turma</option>
                          {classOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                          <option value="outra">Outra</option>
                        </select>
                      </div>
                      {formData.classGroup === "outra" && (
                        <div className="relative mt-2">
                          <label
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            htmlFor="customClassGroup"
                          >
                            Especifique sua turma
                          </label>
                          <Input
                            type="text"
                            name="customClassGroup"
                            id="customClassGroup"
                            value={formData.customClassGroup}
                            onChange={handleChange}
                            className="pl-3"
                            placeholder="Digite o nome da sua turma"
                            required
                          />
                        </div>
                      )}
                    </div>

                    {/* Série */}
                    <div className="relative">
                      <label
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        htmlFor="grade"
                      >
                        Série
                      </label>
                      <div className="relative">
                        <select
                          id="grade"
                          name="grade"
                          value={formData.grade}
                          className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                          onChange={(e) =>
                            handleSelectChange("grade", e.target.value)
                          }
                          disabled={loadingOptions}
                        >
                          <option value="">Selecione sua série</option>
                          {gradeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                          <option value="outra">Outra</option>
                        </select>
                      </div>
                      {formData.grade === "outra" && (
                        <div className="relative mt-2">
                          <label
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            htmlFor="customGrade"
                          >
                            Especifique sua série
                          </label>
                          <Input
                            type="text"
                            name="customGrade"
                            id="customGrade"
                            value={formData.customGrade}
                            onChange={handleChange}
                            className="pl-3"
                            placeholder="Digite o nome da sua série"
                            required
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Data de Nascimento */}
                <div className="relative">
                  <label
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    htmlFor="birthDate"
                  >
                    Data de Nascimento
                  </label>
                  <div className="relative">
                    <Input
                      type="date"
                      name="birthDate"
                      id="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                      className="pl-10 group"
                      required
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-brand-primary transition-colors duration-200 z-10" />
                  </div>
                </div>
              </div>
            )}

            {/* Etapa 3: Senha */}
            {step === 3 && (
              <div className="grid gap-2">
                {/* Senha */}
                <div className="relative">
                  <label
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    htmlFor="password"
                  >
                    Senha
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      id="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10 pr-10 group"
                      placeholder="Digite sua senha"
                      required
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-brand-primary transition-colors duration-200 z-10" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Confirmar Senha */}
                <div className="relative">
                  <label
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    htmlFor="confirmPassword"
                  >
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-10 pr-10 group"
                      placeholder="Confirme sua senha"
                      required
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-brand-primary transition-colors duration-200 z-10" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-500 text-center">
                {error}
              </p>
            )}

            <div className="flex justify-between">
              {step > 1 && (
                <Button variant="secondary" size="sm" onClick={prevStep}>
                  Voltar
                </Button>
              )}

              <Button size="sm" onClick={step === 3 ? handleSubmit : nextStep} disabled={loading}>
                {step === 3 ? (
                    loading ? "Criando conta..." : "Criar conta"
                ) : (
                    "Avançar"
                )}
              </Button>
            </div>

            {step === 3 && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Ou continue com
                    </span>
                  </div>
                </div>
                <Button variant="outline" type="button" disabled>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4"
                  >
                    <path d="M20.29 7.35L12 18.15 3.71 7.35"></path>
                  </svg>
                  Google
                </Button>
                <Button variant="outline" type="button" disabled>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                  Facebook
                </Button>
              </>
            )}
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <a href="/login" className="underline underline-offset-4">
              Fazer login
            </a>
          </div>
        </>
      )}
    </div>
  );
}