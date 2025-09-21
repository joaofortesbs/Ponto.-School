
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
  AlertCircle,
  Wifi,
  WifiOff
} from "lucide-react";

export default function RegisterForm() {
  const navigate = useNavigate();
  const { register, isLoading, error } = useNeonAuth();

  const [formData, setFormData] = useState({
    nome_completo: "",
    nome_usuario: "",
    email: "",
    senha: "",
    confirmar_senha: "",
    tipo_conta: "",
    pais: "Brasil",
    estado: "",
    instituicao_ensino: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  const estadosBrasil = [
    "Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará", 
    "Distrito Federal", "Espírito Santo", "Goiás", "Maranhão", 
    "Mato Grosso", "Mato Grosso do Sul", "Minas Gerais", "Pará", 
    "Paraíba", "Paraná", "Pernambuco", "Piauí", "Rio de Janeiro", 
    "Rio Grande do Norte", "Rio Grande do Sul", "Rondônia", 
    "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins"
  ];

  React.useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setConnectionStatus('checking');
    try {
      const response = await fetch('http://0.0.0.0:3001/api/status', {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });
      setConnectionStatus(response.ok ? 'online' : 'offline');
    } catch {
      try {
        const response = await fetch('http://localhost:3001/api/status', {
          method: 'GET',
          signal: AbortSignal.timeout(3000)
        });
        setConnectionStatus(response.ok ? 'online' : 'offline');
      } catch {
        setConnectionStatus('offline');
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.nome_completo.trim()) {
      errors.nome_completo = "Nome completo é obrigatório";
    }

    if (!formData.nome_usuario.trim()) {
      errors.nome_usuario = "Nome de usuário é obrigatório";
    } else if (formData.nome_usuario.length < 3) {
      errors.nome_usuario = "Nome de usuário deve ter pelo menos 3 caracteres";
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

    if (!formData.confirmar_senha) {
      errors.confirmar_senha = "Confirmação de senha é obrigatória";
    } else if (formData.senha !== formData.confirmar_senha) {
      errors.confirmar_senha = "Senhas não coincidem";
    }

    if (!formData.tipo_conta) {
      errors.tipo_conta = "Tipo de conta é obrigatório";
    }

    if (!formData.estado) {
      errors.estado = "Estado é obrigatório";
    }

    if (!formData.instituicao_ensino.trim()) {
      errors.instituicao_ensino = "Instituição de ensino é obrigatória";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (connectionStatus === 'offline') {
      setValidationErrors({ general: "Sem conexão com o servidor. Verifique sua internet." });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('📝 Enviando dados de registro:', formData);
      
      const registerData = {
        nome_completo: formData.nome_completo.trim(),
        nome_usuario: formData.nome_usuario.trim().toLowerCase(),
        email: formData.email.trim().toLowerCase(),
        senha: formData.senha,
        tipo_conta: formData.tipo_conta,
        pais: formData.pais,
        estado: formData.estado,
        instituicao_ensino: formData.instituicao_ensino.trim()
      };

      const result = await register(registerData);
      
      if (result.success) {
        console.log('✅ Cadastro realizado com sucesso');
        navigate('/dashboard');
      } else {
        console.error('❌ Erro no cadastro:', result.error);
        setValidationErrors({ general: result.error || "Erro no cadastro" });
      }
    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      setValidationErrors({ general: "Erro inesperado. Tente novamente." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'online': return <Wifi className="h-4 w-4 text-green-500" />;
      case 'offline': return <WifiOff className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
    }
  };

  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'online': return 'Conectado';
      case 'offline': return 'Sem conexão';
      default: return 'Verificando...';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent mb-2">
          Criar Conta
        </h1>
        <p className="text-gray-600">Junte-se à nossa plataforma educacional</p>
        
        <div className="flex items-center justify-center gap-2 mt-4 text-sm">
          {getConnectionIcon()}
          <span className={`${connectionStatus === 'online' ? 'text-green-600' : connectionStatus === 'offline' ? 'text-red-600' : 'text-blue-600'}`}>
            {getConnectionText()}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {(validationErrors.general || error) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <span className="text-red-600 text-sm">{validationErrors.general || error}</span>
          </div>
        )}

        <div className="space-y-2">
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Nome completo"
              value={formData.nome_completo}
              onChange={(e) => handleInputChange('nome_completo', e.target.value)}
              className={`pl-10 ${validationErrors.nome_completo ? 'border-red-500' : ''}`}
              disabled={isSubmitting}
            />
          </div>
          {validationErrors.nome_completo && (
            <p className="text-red-500 text-xs">{validationErrors.nome_completo}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Nome de usuário"
              value={formData.nome_usuario}
              onChange={(e) => handleInputChange('nome_usuario', e.target.value)}
              className={`pl-10 ${validationErrors.nome_usuario ? 'border-red-500' : ''}`}
              disabled={isSubmitting}
            />
          </div>
          {validationErrors.nome_usuario && (
            <p className="text-red-500 text-xs">{validationErrors.nome_usuario}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`pl-10 ${validationErrors.email ? 'border-red-500' : ''}`}
              disabled={isSubmitting}
            />
          </div>
          {validationErrors.email && (
            <p className="text-red-500 text-xs">{validationErrors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={formData.senha}
              onChange={(e) => handleInputChange('senha', e.target.value)}
              className={`pl-10 pr-10 ${validationErrors.senha ? 'border-red-500' : ''}`}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
              disabled={isSubmitting}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
          {validationErrors.senha && (
            <p className="text-red-500 text-xs">{validationErrors.senha}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmar senha"
              value={formData.confirmar_senha}
              onChange={(e) => handleInputChange('confirmar_senha', e.target.value)}
              className={`pl-10 pr-10 ${validationErrors.confirmar_senha ? 'border-red-500' : ''}`}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
              disabled={isSubmitting}
            >
              {showConfirmPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
          {validationErrors.confirmar_senha && (
            <p className="text-red-500 text-xs">{validationErrors.confirmar_senha}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="relative">
            <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Select
              value={formData.tipo_conta}
              onValueChange={(value) => handleInputChange('tipo_conta', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger className={`pl-10 ${validationErrors.tipo_conta ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Tipo de conta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Aluno">Aluno</SelectItem>
                <SelectItem value="Professor">Professor</SelectItem>
                <SelectItem value="Coordenador">Coordenador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {validationErrors.tipo_conta && (
            <p className="text-red-500 text-xs">{validationErrors.tipo_conta}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="relative">
            <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              value="Brasil"
              disabled
              className="pl-10 bg-gray-50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Select
              value={formData.estado}
              onValueChange={(value) => handleInputChange('estado', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger className={`pl-10 ${validationErrors.estado ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                {estadosBrasil.map((estado) => (
                  <SelectItem key={estado} value={estado}>
                    {estado}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {validationErrors.estado && (
            <p className="text-red-500 text-xs">{validationErrors.estado}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="relative">
            <School className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Instituição de ensino"
              value={formData.instituicao_ensino}
              onChange={(e) => handleInputChange('instituicao_ensino', e.target.value)}
              className={`pl-10 ${validationErrors.instituicao_ensino ? 'border-red-500' : ''}`}
              disabled={isSubmitting}
            />
          </div>
          {validationErrors.instituicao_ensino && (
            <p className="text-red-500 text-xs">{validationErrors.instituicao_ensino}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || connectionStatus === 'offline'}
          className="w-full bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Criando conta...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Criar Conta
            </>
          )}
        </Button>

        <p className="text-center text-sm text-gray-600">
          Já tem uma conta?{" "}
          <button
            type="button"
            onClick={() => navigate('/auth/login')}
            className="text-blue-600 hover:text-blue-800 font-semibold"
            disabled={isSubmitting}
          >
            Fazer login
          </button>
        </p>
      </form>
    </div>
  );
}
