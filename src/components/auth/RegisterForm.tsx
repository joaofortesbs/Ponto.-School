import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useNeonAuth } from "@/hooks/useNeonAuth";
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
  Users,
} from "lucide-react";

interface FormData {
  nomeCompleto: string;
  nomeUsuario: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  tipoConta: string;
  pais: string;
  estado: string;
  instituicaoEnsino: string;
}

export function RegisterForm() {
  const navigate = useNavigate();
  const { register, isLoading, error } = useNeonAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<FormData>({
    nomeCompleto: "",
    nomeUsuario: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    tipoConta: "",
    pais: "Brasil",
    estado: "",
    instituicaoEnsino: "",
  });

  const estadosBrasil = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
    "RS", "RO", "RR", "SC", "SP", "SE", "TO"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Limpar erro de validação quando o usuário começar a digitar
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.nomeCompleto.trim()) {
      errors.nomeCompleto = "Nome completo é obrigatório";
    }

    if (!formData.nomeUsuario.trim()) {
      errors.nomeUsuario = "Nome de usuário é obrigatório";
    } else if (formData.nomeUsuario.length < 3) {
      errors.nomeUsuario = "Nome de usuário deve ter pelo menos 3 caracteres";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.nomeUsuario)) {
      errors.nomeUsuario = "Nome de usuário pode conter apenas letras, números e underscore";
    }

    if (!formData.email.trim()) {
      errors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Email inválido";
    }

    if (!formData.senha) {
      errors.senha = "Senha é obrigatória";
    } else if (formData.senha.length < 6) {
      errors.senha = "Senha deve ter pelo menos 6 caracteres";
    }

    if (formData.senha !== formData.confirmarSenha) {
      errors.confirmarSenha = "Senhas não coincidem";
    }

    if (!formData.tipoConta) {
      errors.tipoConta = "Tipo de conta é obrigatório";
    }

    if (!formData.estado) {
      errors.estado = "Estado é obrigatório";
    }

    if (!formData.instituicaoEnsino.trim()) {
      errors.instituicaoEnsino = "Instituição de ensino é obrigatória";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await register({
      nomeCompleto: formData.nomeCompleto,
      nomeUsuario: formData.nomeUsuario,
      email: formData.email,
      senha: formData.senha,
      tipoConta: formData.tipoConta,
      pais: formData.pais,
      estado: formData.estado,
      instituicaoEnsino: formData.instituicaoEnsino,
    });

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    }
  };

  if (success) {
    return (
      <div className="bg-green-100 dark:bg-green-900/30 border-2 border-green-500 dark:border-green-600 text-green-800 dark:text-green-300 p-6 rounded-lg mb-6 animate-fade-in flex items-center gap-4 shadow-md">
        <div className="rounded-full bg-green-200 dark:bg-green-800 p-3 flex-shrink-0">
          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold">Conta criada com sucesso!</h3>
          <p className="text-sm mt-1">
            Bem-vindo à plataforma! Você será redirecionado para o dashboard em instantes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-brand-black dark:text-white">
          Criar nova conta
        </h1>
        <p className="text-sm text-brand-muted dark:text-white/60">
          Preencha os dados abaixo para se cadastrar na plataforma
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white/40 dark:bg-gray-800/20 backdrop-blur-2xl p-6 rounded-lg border border-white/20 dark:border-gray-700/50 shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-brand-black dark:text-white">
            Informações Pessoais
          </h2>

          <div className="space-y-4">
            {/* Nome Completo */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-black dark:text-white">
                Nome Completo *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  name="nomeCompleto"
                  value={formData.nomeCompleto}
                  onChange={handleChange}
                  placeholder="Digite seu nome completo"
                  className="pl-10 h-11"
                  required
                />
              </div>
              {validationErrors.nomeCompleto && (
                <p className="text-sm text-red-600">{validationErrors.nomeCompleto}</p>
              )}
            </div>

            {/* Nome de Usuário */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-black dark:text-white">
                Nome de Usuário *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  name="nomeUsuario"
                  value={formData.nomeUsuario}
                  onChange={handleChange}
                  placeholder="@seunomeusuario"
                  className="pl-10 h-11"
                  required
                />
              </div>
              {validationErrors.nomeUsuario && (
                <p className="text-sm text-red-600">{validationErrors.nomeUsuario}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-black dark:text-white">
                E-mail *
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
              {validationErrors.email && (
                <p className="text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white/40 dark:bg-gray-800/20 backdrop-blur-2xl p-6 rounded-lg border border-white/20 dark:border-gray-700/50 shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-brand-black dark:text-white">
            Informações Acadêmicas
          </h2>

          <div className="space-y-4">
            {/* Tipo de Conta */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-black dark:text-white">
                Tipo de Conta *
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select
                  name="tipoConta"
                  value={formData.tipoConta}
                  onChange={handleChange}
                  className="w-full pl-10 h-11 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary focus-visible:border-brand-primary"
                  required
                >
                  <option value="">Selecione o tipo de conta</option>
                  <option value="Aluno">Aluno</option>
                  <option value="Professor">Professor</option>
                  <option value="Coordenador">Coordenador</option>
                </select>
              </div>
              {validationErrors.tipoConta && (
                <p className="text-sm text-red-600">{validationErrors.tipoConta}</p>
              )}
            </div>

            {/* País e Estado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-black dark:text-white">
                  País
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    name="pais"
                    value={formData.pais}
                    onChange={handleChange}
                    className="pl-10 h-11"
                    readOnly
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-black dark:text-white">
                  Estado *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    className="w-full pl-10 h-11 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary focus-visible:border-brand-primary"
                    required
                  >
                    <option value="">Selecione o estado</option>
                    {estadosBrasil.map(estado => (
                      <option key={estado} value={estado}>{estado}</option>
                    ))}
                  </select>
                </div>
                {validationErrors.estado && (
                  <p className="text-sm text-red-600">{validationErrors.estado}</p>
                )}
              </div>
            </div>

            {/* Instituição de Ensino */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-black dark:text-white">
                Instituição de Ensino *
              </label>
              <div className="relative">
                <School className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  name="instituicaoEnsino"
                  value={formData.instituicaoEnsino}
                  onChange={handleChange}
                  placeholder="Digite o nome da sua instituição"
                  className="pl-10 h-11"
                  required
                />
              </div>
              {validationErrors.instituicaoEnsino && (
                <p className="text-sm text-red-600">{validationErrors.instituicaoEnsino}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white/40 dark:bg-gray-800/20 backdrop-blur-2xl p-6 rounded-lg border border-white/20 dark:border-gray-700/50 shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-brand-black dark:text-white">
            Segurança
          </h2>

          <div className="space-y-4">
            {/* Senha */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-black dark:text-white">
                Senha *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  name="senha"
                  value={formData.senha}
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
              {validationErrors.senha && (
                <p className="text-sm text-red-600">{validationErrors.senha}</p>
              )}
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-black dark:text-white">
                Confirmar Senha *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmarSenha"
                  value={formData.confirmarSenha}
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
              {validationErrors.confirmarSenha && (
                <p className="text-sm text-red-600">{validationErrors.confirmarSenha}</p>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-11 text-base bg-brand-primary hover:bg-brand-primary/90 text-white"
          disabled={isLoading}
        >
          {isLoading ? "Criando conta..." : "Criar conta"}
        </Button>

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
    </div>
  );
}