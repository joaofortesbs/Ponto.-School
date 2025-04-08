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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { generateUserId } from "@/lib/generate-user-id";

interface FormData {
  fullName: string;
  username: string;
  email: string;
  institution: string;
  classGroup: string;
  customClassGroup: string;
  grade: string;
  customGrade: string;
  birthDate: string;
  password: string;
  confirmPassword: string;
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
    classGroup: "",
    customClassGroup: "",
    grade: "",
    customGrade: "",
    birthDate: "",
    password: "",
    confirmPassword: "",
  });

  // Effect to show class and grade options when institution is entered
  useEffect(() => {
    if (formData.institution.trim().length > 0) {
      setShowClassAndGrade(true);
      setLoadingOptions(true);
      setInstitutionFound(true);

      // Simulate fetching class options based on institution
      // In a real app, this would be an API call to get classes for the institution
      setTimeout(() => {
        setClassOptions([
          { value: "turma-a", label: "Turma A" },
          { value: "turma-b", label: "Turma B" },
          { value: "turma-c", label: "Turma C" },
          { value: "turma-d", label: "Turma D" },
          { value: "turma-e", label: "Turma E" },
          { value: "turma-f", label: "Turma F" },
        ]);

        // Simulate fetching grade options
        setGradeOptions([
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
        ]);
        setLoadingOptions(false);
      }, 800); // Simulate API delay
    } else {
      setShowClassAndGrade(false);
      setInstitutionFound(false);
      setClassOptions([]);
      setGradeOptions([]);
      // Reset the values when institution is cleared
      setFormData((prev) => ({
        ...prev,
        classGroup: "",
        customClassGroup: "",
        grade: "",
        customGrade: "",
      }));
    }
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

    // If this is the class group change and we have a valid institution,
    // we could potentially fetch more specific grade options based on the class
    if (name === "classGroup" && value && formData.institution) {
      // This would be an API call in a real application
      console.log(
        `Fetching grades for institution: ${formData.institution}, class: ${value}`,
      );
    }
  };

  const searchParams = new URLSearchParams(window.location.search);
  const plan = searchParams.get("plan") || "lite";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem");
      setLoading(false);
      return;
    }

    try {
      // Generate a unique user ID
      const userId = await generateUserId("BR", plan === "premium" ? 1 : 2);

      // Determine the class group and grade values to use
      const effectiveClassGroup =
        formData.classGroup === "outra"
          ? formData.customClassGroup
          : formData.classGroup;
      const effectiveGrade =
        formData.grade === "outra" ? formData.customGrade : formData.grade;

      // Signup com apenas os campos necessários para o trigger automático
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            full_name: formData.fullName,
            username: formData.username,
            institution: formData.institution,
            birth_date: formData.birthDate,
            plan_type: plan,
            display_name: formData.username,
          },
        },
      });

      if (error) {
        console.error("Signup error:", error);
        setError(
          error.message || "Erro ao criar conta. Por favor, tente novamente.",
        );
        return;
      }

      if (data?.user) {
        try {
          // Verificar se o perfil já foi criado pelo trigger
          const { data: profileData, error: fetchError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();
          
          if (fetchError || !profileData) {
            // Se o perfil não existe, criamos manualmente
            const { error: insertError } = await supabase
              .from("profiles")
              .insert([{
                id: data.user.id,
                user_id: userId,
                full_name: formData.fullName,
                username: formData.username,
                email: formData.email,
                display_name: formData.username,
                institution: formData.institution,
                birth_date: formData.birthDate,
                plan_type: plan,
                level: 1,
                rank: "Aprendiz"
              }]);
            
            if (insertError) {
              console.error("Profile creation error:", insertError);
              throw new Error("Erro ao criar perfil de usuário");
            }
          } else {
            // Se o perfil existe, atualizamos
            const { error: updateError } = await supabase
              .from("profiles")
              .update({
                user_id: userId,
                level: 1,
                rank: "Aprendiz",
                display_name: formData.username,
              })
              .eq("id", data.user.id);
            
            if (updateError) {
              console.error("Profile update error:", updateError);
            }
          }
          
          // Mostrar mensagem de sucesso
          setSuccess(true);
          
          // Redirecionar após 3 segundos
          setTimeout(() => {
            navigate("/login");
          }, 3000);
          
        } catch (err) {
          console.error("Error creating/updating profile:", err);
          setError("Erro ao finalizar criação da conta");
          setLoading(false);
        }
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Erro inesperado ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-brand-black dark:text-white">
          Criar nova conta
        </h1>
        <p className="text-sm text-brand-muted dark:text-white/60">
          Preencha os dados abaixo para começar
        </p>
      </div>

      {success ? (
        <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-300 p-4 rounded-lg mb-6 animate-fade-in flex items-center gap-3">
          <div className="rounded-full bg-green-200 dark:bg-green-800 p-2 flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">Conta criada com sucesso!</h3>
            <p className="text-sm">Redirecionando para a página de login...</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome Completo */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-brand-black dark:text-white">
            Nome Completo
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Digite seu nome completo"
              className="pl-10 h-11"
              required
            />
          </div>
        </div>

        {/* Nome de Usuário */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-brand-black dark:text-white">
            Nome de Usuário
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Digite seu nome de usuário"
              className="pl-10 h-11"
              required
            />
          </div>
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

        {/* Turma e Série - Mostrados apenas quando a instituição é preenchida */}
        {showClassAndGrade && (
          <div className="space-y-6 border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-white dark:bg-gray-800/40 shadow-sm transition-all duration-300">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <h3 className="text-base font-semibold text-brand-black dark:text-white flex items-center">
                <GraduationCap className="h-5 w-5 mr-2 text-brand-primary" />
                Informações Acadêmicas
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
                    required
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
                    required
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

        {error && (
          <div className="text-sm text-red-500 text-center">{error}</div>
        )}

        <Button
          type="submit"
          className="w-full h-11 text-base bg-brand-primary hover:bg-brand-primary/90 text-white"
          disabled={loading}
        >
          {loading ? "Criando conta..." : "Criar conta"}
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
          Já tem uma conta?{" "}
          <Button
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