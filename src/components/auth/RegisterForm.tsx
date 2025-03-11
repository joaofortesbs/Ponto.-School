import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Mail, Lock, User, School, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface FormData {
  fullName: string;
  username: string;
  email: string;
  institution: string;
  birthDate: string;
  password: string;
  confirmPassword: string;
}

export function RegisterForm() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = React.useState<FormData>({
    fullName: "",
    username: "",
    email: "",
    institution: "",
    birthDate: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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
      console.log("Attempting signup with:", {
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            username: formData.username,
            institution: formData.institution,
            birth_date: formData.birthDate,
            plan_type: plan,
          },
        },
      });
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
        navigate("/login");
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
          <div className="relative">
            <School className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              placeholder="Digite o nome da sua instituição"
              className="pl-10 h-11"
              required
            />
          </div>
        </div>

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
    </div>
  );
}
