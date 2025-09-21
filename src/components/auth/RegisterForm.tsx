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
  Users,
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
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    nomeUsuario: "",
    email: "",
    senha: "",
    confirmSenha: "",
    tipoConta: "",
    pais: "Brasil",
    estado: "",
    instituicaoEnsino: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando usuário começar a digitar
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

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

    if (!formData.tipoConta) {
      errors.tipoConta = "Tipo de conta é obrigatório";
    }

    if (!formData.estado) {
      errors.estado = "Estado é obrigatório";
    }

    if (!formData.instituicaoEnsino.trim()) {
      errors.instituicaoEnsino = "Instituição de ensino é obrigatória";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
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
        // Salvar dados para redirecionamento
        localStorage.setItem("lastRegisteredEmail", formData.email);
        localStorage.setItem("lastRegisteredUsername", formData.nomeUsuario);
        navigate("/dashboard");
      } else {
        console.error("❌ Erro no cadastro:", result.error);
      }
    } catch (error) {
      console.error("❌ Erro inesperado no cadastro:", error);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
            <Users className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Criar Conta</h2>
        <p className="text-white/70">Junte-se à nossa plataforma educacional</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Nome Completo */}
        <div>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
            <Input
              type="text"
              placeholder="Nome completo"
              value={formData.nomeCompleto}
              onChange={(e) => handleInputChange("nomeCompleto", e.target.value)}
              className="pl-10 bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-blue-400"
            />
          </div>
          {formErrors.nomeCompleto && (
            <p className="text-red-400 text-xs mt-1">{formErrors.nomeCompleto}</p>
          )}
        </div>

        {/* Nome de Usuário */}
        <div>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
            <Input
              type="text"
              placeholder="Nome de usuário"
              value={formData.nomeUsuario}
              onChange={(e) => handleInputChange("nomeUsuario", e.target.value)}
              className="pl-10 bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-blue-400"
            />
          </div>
          {formErrors.nomeUsuario && (
            <p className="text-red-400 text-xs mt-1">{formErrors.nomeUsuario}</p>
          )}
        </div>

        {/* E-mail */}
        <div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
            <Input
              type="email"
              placeholder="E-mail"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="pl-10 bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-blue-400"
            />
          </div>
          {formErrors.email && (
            <p className="text-red-400 text-xs mt-1">{formErrors.email}</p>
          )}
        </div>

        {/* Senha */}
        <div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={formData.senha}
              onChange={(e) => handleInputChange("senha", e.target.value)}
              className="pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-blue-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {formErrors.senha && (
            <p className="text-red-400 text-xs mt-1">{formErrors.senha}</p>
          )}
        </div>

        {/* Confirmar Senha */}
        <div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
            <Input
              type="password"
              placeholder="Confirmar senha"
              value={formData.confirmSenha}
              onChange={(e) => handleInputChange("confirmSenha", e.target.value)}
              className="pl-10 bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-blue-400"
            />
          </div>
          {formErrors.confirmSenha && (
            <p className="text-red-400 text-xs mt-1">{formErrors.confirmSenha}</p>
          )}
        </div>

        {/* Tipo de Conta */}
        <div>
          <div className="relative">
            <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5 z-10" />
            <Select value={formData.tipoConta} onValueChange={(value) => handleInputChange("tipoConta", value)}>
              <SelectTrigger className="pl-10 bg-white/5 border-white/20 text-white focus:border-blue-400">
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

        {/* País */}
        <div>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
            <Input
              type="text"
              value={formData.pais}
              readOnly
              className="pl-10 bg-white/5 border-white/20 text-white/70 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Estado */}
        <div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5 z-10" />
            <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
              <SelectTrigger className="pl-10 bg-white/5 border-white/20 text-white focus:border-blue-400">
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

        {/* Instituição de Ensino */}
        <div>
          <div className="relative">
            <School className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
            <Input
              type="text"
              placeholder="Instituição de ensino"
              value={formData.instituicaoEnsino}
              onChange={(e) => handleInputChange("instituicaoEnsino", e.target.value)}
              className="pl-10 bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-blue-400"
            />
          </div>
          {formErrors.instituicaoEnsino && (
            <p className="text-red-400 text-xs mt-1">{formErrors.instituicaoEnsino}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Criando conta...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Criar Conta
            </div>
          )}
        </Button>
      </form>

      <div className="text-center mt-6">
        <p className="text-white/70">
          Já tem uma conta?{" "}
          <button
            onClick={() => navigate("/auth/login")}
            className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
          >
            Fazer login
          </button>
        </p>
      </div>
    </div>
  );
}