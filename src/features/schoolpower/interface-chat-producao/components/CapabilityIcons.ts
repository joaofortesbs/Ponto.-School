import { 
  Search, 
  FileSearch,
  Brain,
  Lightbulb,
  PenTool,
  Hammer,
  Sparkles,
  Target,
  BookOpen,
  Layers,
  Zap,
  CheckCircle,
  Database,
  type LucideIcon
} from 'lucide-react';

export interface CapabilityIconConfig {
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

const capabilityIconMap: Record<string, CapabilityIconConfig> = {
  pesquisar_atividades_disponiveis: {
    icon: Search,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  pesquisar_atividades_anteriores: {
    icon: FileSearch,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
  },
  decidir_atividades_criar: {
    icon: Brain,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
  },
  gerar_conteudo_atividades: {
    icon: Sparkles,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
  },
  criar_atividade: {
    icon: Hammer,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
  },
  criar_atividades: {
    icon: Layers,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
  },
  planejar_plano_de_acao: {
    icon: Target,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
  },
  executar_plano: {
    icon: Zap,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
  },
  analisar_contexto: {
    icon: BookOpen,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/20',
  },
  gerar_reflexao: {
    icon: Lightbulb,
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/20',
  },
  salvar_atividades_bd: {
    icon: Database,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
  },
};

const defaultConfig: CapabilityIconConfig = {
  icon: CheckCircle,
  color: 'text-gray-400',
  bgColor: 'bg-gray-500/20',
};

export function getCapabilityIcon(capabilityName: string): CapabilityIconConfig {
  const normalizedName = capabilityName.toLowerCase().replace(/\s+/g, '_');
  
  for (const [key, config] of Object.entries(capabilityIconMap)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return config;
    }
  }
  
  if (normalizedName.includes('pesquisar') || normalizedName.includes('buscar')) {
    return capabilityIconMap.pesquisar_atividades_disponiveis;
  }
  if (normalizedName.includes('decidir') || normalizedName.includes('escolher')) {
    return capabilityIconMap.decidir_atividades_criar;
  }
  if (normalizedName.includes('gerar') || normalizedName.includes('criar_conteudo')) {
    return capabilityIconMap.gerar_conteudo_atividades;
  }
  if (normalizedName.includes('criar') || normalizedName.includes('construir')) {
    return capabilityIconMap.criar_atividade;
  }
  
  return defaultConfig;
}

export function getCapabilityIconById(capabilityId: string): CapabilityIconConfig {
  const normalizedId = capabilityId.toLowerCase();
  
  for (const [key, config] of Object.entries(capabilityIconMap)) {
    if (normalizedId.includes(key)) {
      return config;
    }
  }
  
  return defaultConfig;
}

export { capabilityIconMap };
