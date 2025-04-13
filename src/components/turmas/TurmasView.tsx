import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Filter,
  Calendar,
  Clock,
  BookOpen,
  MessageCircle,
  Users,
  GraduationCap,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  FileText,
  Video,
  Play,
  Bookmark,
  Star,
  BarChart,
  Brain,
  Target,
  Award,
  Zap,
  ArrowRight,
  Plus,
  Sparkles,
  Lightbulb,
  FileQuestion,
  CheckSquare,
  Rocket,
  Trophy,
  Flame,
  Laptop,
  Atom,
  Calculator,
  Beaker,
  Dna,
  Landmark,
  Globe,
  Palette,
  Music,
  Pen,
  Scroll,
  Microscope,
  Stethoscope,
  Gauge,
  Layers,
  Cpu,
  Code,
  Database,
  LineChart,
  PieChart,
  BarChart2,
  Briefcase,
  Building,
  Coins,
  DollarSign,
  TrendingUp,
  Presentation,
  Megaphone,
  Newspaper,
  Camera,
  Film,
  Mic,
  Headphones,
  Gamepad,
  Smartphone,
  Wifi,
  Share2,
  Heart,
  ThumbsUp,
  Eye,
  Bell,
  Info,
  HelpCircle,
  Settings,
  Menu,
  X,
  MoreHorizontal,
  MoreVertical,
  ExternalLink,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Edit,
  Save,
  Lock,
  Unlock,
  Shield,
  Key,
  Mail,
  Send,
  Home
} from "lucide-react";
import GroupDetail from "./GroupDetail";
import GroupCard from "./GroupCard";

// Sample data for classes
const turmasData = [
  {
    id: "1",
    nome: "Física Quântica",
    professor: "Prof. Carlos Santos",
    imagem: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    progresso: 65,
    proximaAula: {
      titulo: "Aula 5: Termodinâmica",
      data: "18/03",
      hora: "14:00",
      prazoProximo: false
    },
    status: "Em Andamento",
    novasMensagens: 3,
    disciplina: "Física",
    icone: <Atom className="h-6 w-6 text-[#FF8C40]" />
  },
  {
    id: "2",
    nome: "Cálculo Avançado",
    professor: "Profa. Ana Martins",
    imagem: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80",
    progresso: 42,
    proximaAula: {
      titulo: "Aula 3: Integrais Múltiplas",
      data: "15/03",
      hora: "10:00",
      prazoProximo: true
    },
    status: "Em Andamento",
    novasMensagens: 0,
    disciplina: "Matemática",
    icone: <Calculator className="h-6 w-6 text-[#FF6B00]" />
  },
  {
    id: "3",
    nome: "Química Orgânica",
    professor: "Prof. Roberto Alves",
    imagem: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=800&q=80",
    progresso: 90,
    proximaAula: {
      titulo: "Aula 8: Polímeros",
      data: "20/03",
      hora: "16:30",
      prazoProximo: false
    },
    status: "Em Andamento",
    novasMensagens: 5,
    disciplina: "Química",
    icone: <Beaker className="h-6 w-6 text-[#E85D04]" />
  },
  {
    id: "4",
    nome: "Biologia Molecular",
    professor: "Profa. Mariana Costa",
    imagem: "https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=800&q=80",
    progresso: 78,
    proximaAula: {
      titulo: "Aula 6: Genética",
      data: "19/03",
      hora: "13:15",
      prazoProximo: false
    },
    status: "Em Andamento",
    novasMensagens: 1,
    disciplina: "Biologia",
    icone: <Dna className="h-6 w-6 text-[#DC2F02]" />
  },
  {
    id: "5",
    nome: "História Contemporânea",
    professor: "Prof. Paulo Mendes",
    imagem: "https://images.unsplash.com/photo-1447069387593-a5de0862481e?w=800&q=80",
    progresso: 55,
    proximaAula: {
      titulo: "Aula 4: Guerra Fria",
      data: "17/03",
      hora: "09:00",
      prazoProximo: false
    },
    status: "Em Andamento",
    novasMensagens: 0,
    disciplina: "História",
    icone: <Landmark className="h-6 w-6 text-[#9D0208]" />
  },
  {
    id: "6",
    nome: "Geografia Mundial",
    professor: "Profa. Lúcia Ferreira",
    imagem: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80",
    progresso: 30,
    proximaAula: {
      titulo: "Aula 2: Geopolítica",
      data: "16/03",
      hora: "11:30",
      prazoProximo: false
    },
    status: "Em Andamento",
    novasMensagens: 2,
    disciplina: "Geografia",
    icone: <Globe className="h-6 w-6 text-[#0077B6]" />
  }
];

// Sample data for study groups organized by topics
const gruposEstudosPorTopico = {
  "Matemática": [
    {
      id: "mat1",
      nome: "Função 1° Grau",
      disciplina: "Matemática",
      descricao: "Grupo de estudos focado em funções de primeiro grau, equações lineares e suas aplicações.",
      membros: 8,
      proximaReuniao: "18/03, 15:00",
      tags: ["Álgebra", "Funções", "Equações"],
      privacidade: "publico",
      icone: <Calculator className="h-6 w-6 text-[#FF6B00]" />
    },
    {
      id: "mat2",
      nome: "Dízima Periódica",
      disciplina: "Matemática",
      descricao: "Estudo sobre dízimas periódicas, frações geratrizes e aplicações práticas.",
      membros: 6,
      proximaReuniao: "20/03, 14:30",
      tags: ["Números", "Frações", "Decimais"],
      privacidade: "publico",
      icone: <Calculator className="h-6 w-6 text-[#FF6B00]" />
    },
    {
      id: "mat3",
      nome: "Conjuntos",
      disciplina: "Matemática",
      descricao: "Grupo dedicado ao estudo da teoria dos conjuntos, operações e aplicações.",
      membros: 7,
      proximaReuniao: "19/03, 16:00",
      tags: ["Teoria dos Conjuntos", "Lógica", "Operações"],
      privacidade: "publico",
      icone: <Calculator className="h-6 w-6 text-[#FF6B00]" />
    }
  ],
  "Língua Portuguesa": [
    {
      id: "port1",
      nome: "Interpretação de Texto",
      disciplina: "Língua Portuguesa",
      descricao: "Grupo focado em técnicas de interpretação textual e análise crítica de diferentes gêneros.",
      membros: 10,
      proximaReuniao: "17/03, 14:00",
      tags: ["Leitura", "Análise", "Compreensão"],
      privacidade: "publico",
      icone: <BookOpen className="h-6 w-6 text-[#FF6B00]" />
    },
    {
      id: "port2",
      nome: "Literatura",
      disciplina: "Língua Portuguesa",
      descricao: "Estudo das escolas literárias, autores clássicos e análise de obras importantes.",
      membros: 9,
      proximaReuniao: "21/03, 15:30",
      tags: ["Escolas Literárias", "Autores", "Obras"],
      privacidade: "publico",
      icone: <BookOpen className="h-6 w-6 text-[#FF6B00]" />
    },
    {
      id: "port3",
      nome: "Gênero Textual",
      disciplina: "Língua Portuguesa",
      descricao: "Grupo para estudo dos diferentes gêneros textuais e suas características específicas.",
      membros: 7,
      proximaReuniao: "22/03, 16:00",
      tags: ["Redação", "Tipologia", "Estrutura"],
      privacidade: "publico",
      icone: <BookOpen className="h-6 w-6 text-[#FF6B00]" />
    }
  ],
  "Química": [
    {
      id: "quim1",
      nome: "Densidade",
      disciplina: "Química",
      descricao: "Estudo sobre densidade, massa específica e suas aplicações em diferentes contextos.",
      membros: 6,
      proximaReuniao: "18/03, 14:00",
      tags: ["Físico-Química", "Propriedades", "Medidas"],
      privacidade: "publico",
      icone: <Beaker className="h-6 w-6 text-[#E85D04]" />
    },
    {
      id: "quim2",
      nome: "Sistemas - Química",
      disciplina: "Química",
      descricao: "Grupo dedicado ao estudo de sistemas químicos, equilíbrio e transformações.",
      membros: 8,
      proximaReuniao: "20/03, 15:30",
      tags: ["Equilíbrio", "Transformações", "Reações"],
      privacidade: "publico",
      icone: <Beaker className="h-6 w-6 text-[#E85D04]" />
    },
    {
      id: "quim3",
      nome: "Misturas - Química",
      disciplina: "Química",
      descricao: "Estudo sobre tipos de misturas, métodos de separação e aplicações práticas.",
      membros: 7,
      proximaReuniao: "21/03, 16:00",
      tags: ["Separação", "Soluções", "Compostos"],
      privacidade: "publico",
      icone: <Beaker className="h-6 w-6 text-[#E85D04]" />
    }
  ],
  "Física": [
    {
      id: "fis1",
      nome: "Notação Científica",
      disciplina: "Física",
      descricao: "Grupo focado no estudo e aplicação da notação científica em problemas físicos.",
      membros: 6,
      proximaReuniao: "19/03, 14:30",
      tags: ["Medidas", "Grandezas", "Cálculos"],
      privacidade: "publico",
      icone: <Atom className="h-6 w-6 text-[#FF8C40]" />
    },
    {
      id: "fis2",
      nome: "Velocidade Média",
      disciplina: "Física",
      descricao: "Estudo sobre cinemática, velocidade média e aplicações em problemas práticos.",
      membros: 8,
      proximaReuniao: "22/03, 15:00",
      tags: ["Cinemática", "Movimento", "Cálculos"],
      privacidade: "publico",
      icone: <Atom className="h-6 w-6 text-[#FF8C40]" />
    }
  ],
  "Biologia": [
    {
      id: "bio1",
      nome: "Células",
      disciplina: "Biologia",
      descricao: "Grupo dedicado ao estudo da estrutura e funcionamento celular.",
      membros: 9,
      proximaReuniao: "18/03, 16:30",
      tags: ["Citologia", "Organelas", "Processos Celulares"],
      privacidade: "publico",
      icone: <Dna className="h-6 w-6 text-[#DC2F02]" />
    },
    {
      id: "bio2",
      nome: "Fotossíntese",
      disciplina: "Biologia",
      descricao: "Estudo detalhado do processo de fotossíntese e sua importância para os seres vivos.",
      membros: 7,
      proximaReuniao: "20/03, 14:00",
      tags: ["Metabolismo", "Plantas", "Energia"],
      privacidade: "publico",
      icone: <Dna className="h-6 w-6 text-[#DC2F02]" />
    },
    {
      id: "bio3",
      nome: "Fermentação",
      disciplina: "Biologia",
      descricao: "Grupo focado no estudo dos processos de fermentação e suas aplicações.",
      membros: 6,
      proximaReuniao: "21/03, 15:00",
      tags: ["Metabolismo", "Microbiologia", "Biotecnologia"],
      privacidade: "publico",
      icone: <Dna className="h-6 w-6 text-[#DC2F02]" />
    }
  ],
  "Geografia": [
    {
      id: "geo1",
      nome: "Relevo",
      disciplina: "Geografia",
      descricao: "Estudo das formas de relevo, processos de formação e transformação da paisagem.",
      membros: 7,
      proximaReuniao: "19/03, 16:00",
      tags: ["Geomorfologia", "Paisagem", "Formações"],
      privacidade: "publico",
      icone: <Globe className="h-6 w-6 text-[#0077B6]" />
    },
    {
      id: "geo2",
      nome: "Projeções",
      disciplina: "Geografia",
      descricao: "Grupo dedicado ao estudo de projeções cartográficas e representações espaciais.",
      membros: 5,
      proximaReuniao: "22/03, 14:30",
      tags: ["Cartografia", "Mapas", "Escalas"],
      privacidade: "publico",
      icone: <Globe className="h-6 w-6 text-[#0077B6]" />
    },
    {
      id: "geo3",
      nome: "Geomorfologia",
      disciplina: "Geografia",
      descricao: "Estudo aprofundado sobre as formas de relevo e processos geomorfológicos.",
      membros: 6,
      proximaReuniao: "23/03, 15:30",
      tags: ["Relevo", "Processos", "Formações"],
      privacidade: "publico",
      icone: <Globe className="h-6 w-6 text-[#0077B6]" />
    }
  ],
  "História": [
    {
      id: "hist1",
      nome: "Memória",
      disciplina: "História",
      descricao: "Grupo focado no estudo da memória histórica, patrimônio e identidade cultural.",
      membros: 8,
      proximaReuniao: "18/03, 15:30",
      tags: ["Patrimônio", "Identidade", "Cultura"],
      privacidade: "publico",
      icone: <Landmark className="h-6 w-6 text-[#9D0208]" />
    }
  ],
  "Filosofia": [
    {
      id: "fil1",
      nome: "Senso Comum",
      disciplina: "Filosofia",
      descricao: "Estudo sobre o senso comum, conhecimento científico e suas diferenças.",
      membros: 7,
      proximaReuniao: "20/03, 16:30",
      tags: ["Epistemologia", "Conhecimento", "Ciência"],
      privacidade: "publico",
      icone: <Brain className="h-6 w-6 text-[#3A0CA3]" />
    },
    {
      id: "fil2",
      nome: "Discurso Filosófico",
      disciplina: "Filosofia",
      descricao: "Grupo dedicado à análise do discurso filosófico e suas características.",
      membros: 6,
      proximaReuniao: "22/03, 16:00",
      tags: ["Linguagem", "Argumentação", "Lógica"],
      privacidade: "publico",
      icone: <Brain className="h-6 w-6 text-[#3A0CA3]" />
    }
  ],
  "Sociologia": [
    {
      id: "soc1",
      nome: "Iluminismo",
      disciplina: "Sociologia",
      descricao: "Estudo sobre o movimento iluminista e suas influências na sociedade moderna.",
      membros: 8,
      proximaReuniao: "19/03, 15:00",
      tags: ["Movimentos", "Pensamento", "Modernidade"],
      privacidade: "publico",
      icone: <Users className="h-6 w-6 text-[#4361EE]" />
    },
    {
      id: "soc2",
      nome: "Positivismo",
      disciplina: "Sociologia",
      descricao: "Grupo focado no estudo do positivismo e suas contribuições para as ciências sociais.",
      membros: 7,
      proximaReuniao: "21/03, 14:30",
      tags: ["Teoria", "Ciência", "Auguste Comte"],
      privacidade: "publico",
      icone: <Users className="h-6 w-6 text-[#4361EE]" />
    }
  ]
};

// Sample data for a specific class
const turmaDetalhada = {
  id: "1",
  nome: "Física Quântica",
  professor: {
    nome: "Prof. Carlos Santos",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
    email: "carlos.santos@pontoschool.com",
    especialidade: "Física Teórica"
  },
  imagem: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&q=90",
  progresso: 65,
  status: "Em Andamento",
  descricao: "Estudo dos princípios fundamentais da física quântica e suas aplicações no mundo moderno. Abordagem teórica e prática com experimentos virtuais.",
  inicioFim: "01/02/2023 - 30/06/2023",
  horarios: "Segundas e Quartas, 14:00 - 16:00",
  cargaHoraria: "80 horas",
  modulos: [
    {
      id: "m1",
      titulo: "Módulo 1: Fundamentos da Física Quântica",
      descricao: "Introdução aos conceitos básicos da física quântica",
      progresso: 100,
      conteudos: [
        {
          id: "c1-1",
          tipo: "aula",
          titulo: "Aula 1: Introdução à Física Quântica",
          duracao: "120 min",
          data: "01/02/2023",
          status: "concluido",
          icone: <Video className="h-5 w-5 text-blue-500" />
        },
        {
          id: "c1-2",
          tipo: "leitura",
          titulo: "Capítulo 1: História da Física Quântica",
          duracao: "45 min",
          data: "03/02/2023",
          status: "concluido",
          icone: <BookOpen className="h-5 w-5 text-purple-500" />
        },
        {
          id: "c1-3",
          tipo: "exercicio",
          titulo: "Lista de Exercícios 1",
          duracao: "60 min",
          data: "05/02/2023",
          status: "concluido",
          icone: <FileText className="h-5 w-5 text-green-500" />
        },
        {
          id: "c1-4",
          tipo: "video",
          titulo: "Vídeo: Experimento da Dupla Fenda",
          duracao: "30 min",
          data: "08/02/2023",
          status: "concluido",
          icone: <Play className="h-5 w-5 text-red-500" />
        }
      ]
    },
    {
      id: "m2",
      titulo: "Módulo 2: Mecânica Quântica",
      descricao: "Estudo dos princípios da mecânica quântica e suas aplicações",
      progresso: 75,
      conteudos: [
        {
          id: "c2-1",
          tipo: "aula",
          titulo: "Aula 2: Equação de Schrödinger",
          duracao: "120 min",
          data: "15/02/2023",
          status: "concluido",
          icone: <Video className="h-5 w-5 text-blue-500" />
        },
        {
          id: "c2-2",
          tipo: "leitura",
          titulo: "Capítulo 2: Princípio da Incerteza",
          duracao: "60 min",
          data: "17/02/2023",
          status: "concluido",
          icone: <BookOpen className="h-5 w-5 text-purple-500" />
        },
        {
          id: "c2-3",
          tipo: "exercicio",
          titulo: "Lista de Exercícios 2",
          duracao: "90 min",
          data: "20/02/2023",
          status: "concluido",
          icone: <FileText className="h-5 w-5 text-green-500" />
        },
        {
          id: "c2-4",
          tipo: "discussao",
          titulo: "Discussão: Interpretações da Mecânica Quântica",
          duracao: "45 min",
          data: "22/02/2023",
          status: "pendente",
          icone: <MessageCircle className="h-5 w-5 text-amber-500" />
        }
      ]
    },
    {
      id: "m3",
      titulo: "Módulo 3: Aplicações da Física Quântica",
      descricao: "Exploração das aplicações práticas da física quântica no mundo moderno",
      progresso: 30,
      conteudos: [
        {
          id: "c3-1",
          tipo: "aula",
          titulo: "Aula 3: Computação Quântica",
          duracao: "120 min",
          data: "01/03/2023",
          status: "concluido",
          icone: <Video className="h-5 w-5 text-blue-500" />
        },
        {
          id: "c3-2",
          tipo: "leitura",
          titulo: "Capítulo 3: Criptografia Quântica",
          duracao: "60 min",
          data: "03/03/2023",
          status: "pendente",
          icone: <BookOpen className="h-5 w-5 text-purple-500" />
        },
        {
          id: "c3-3",
          tipo: "exercicio",
          titulo: "Lista de Exercícios 3",
          duracao: "90 min",
          data: "06/03/2023",
          status: "pendente",
          icone: <FileText className="h-5 w-5 text-green-500" />
        },
        {
          id: "c3-4",
          tipo: "video",
          titulo: "Vídeo: Futuro da Tecnologia Quântica",
          duracao: "45 min",
          data: "08/03/2023",
          status: "pendente",
          icone: <Play className="h-5 w-5 text-red-500" />
        }
      ]
    },
    {
      id: "m4",
      titulo: "Módulo 4: Física Quântica Avançada",
      descricao: "Tópicos avançados em física quântica para aprofundamento",
      progresso: 0,
      conteudos: [
        {
          id: "c4-1",
          tipo: "aula",
          titulo: "Aula 4: Teoria Quântica de Campos",
          duracao: "120 min",
          data: "15/03/2023",
          status: "pendente",
          icone: <Video className="h-5 w-5 text-blue-500" />
        },
        {
          id: "c4-2",
          tipo: "leitura",
          titulo: "Capítulo 4: Emaranhamento Quântico",
          duracao: "60 min",
          data: "17/03/2023",
          status: "pendente",
          icone: <BookOpen className="h-5 w-5 text-purple-500" />
        },
        {
          id: "c4-3",
          tipo: "exercicio",
          titulo: "Lista de Exercícios 4",
          duracao: "90 min",
          data: "20/03/2023",
          status: "pendente",
          icone: <FileText className="h-5 w-5 text-green-500" />
        },
        {
          id: "c4-4",
          tipo: "projeto",
          titulo: "Projeto Final: Simulação Quântica",
          duracao: "240 min",
          data: "25/03/2023",
          status: "pendente",
          icone: <Rocket className="h-5 w-5 text-indigo-500" />
        }
      ]
    }
  ],
  recomendacoes: [
    {
      id: "r1",
      titulo: "Revisar o conceito de Dualidade Onda-Partícula",
      tipo: "revisao",
      prioridade: "alta",
      icone: <Lightbulb className="h-5 w-5 text-[#FF6B00]" />
    },
    {
      id: "r2",
      titulo: "Praticar exercícios sobre Equação de Schrödinger",
      tipo: "exercicio",
      prioridade: "media",
      icone: <FileQuestion className="h-5 w-5 text-[#FF8C40]" />
    },
    {
      id: "r3",
      titulo: "Assistir vídeo complementar sobre Computação Quântica",
      tipo: "video",
      prioridade: "baixa",
      icone: <Play className="h-5 w-5 text-[#E85D04]" />
    }
  ],
  pontosFracos: ["Equação de Schrödinger", "Princípio da Incerteza"],
  pontosFortes: ["História da Física Quântica", "Experimento da Dupla Fenda", "Computação Quântica"],
  metasSemanais: [
    {
      id: "m1",
      titulo: "Completar o Módulo 2",
      progresso: 75
    },
    {
      id: "m2",
      titulo: "Fazer 20 exercícios de Mecânica Quântica",
      progresso: 60
    },
    {
      id: "m3",
      titulo: "Participar de 3 discussões no fórum",
      progresso: 33
    }
  ],
  comparativoTurma: {
    participacao: "acima",
    entregaTarefas: "na media",
    desempenhoGeral: "acima"
  },
  colegas: [
    {
      id: "a1",
      nome: "Ana Silva",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
      online: true
    },
    {
      id: "a2",
      nome: "Pedro Oliveira",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro",
      online: false
    },
    {
      id: "a3",
      nome: "Mariana Santos",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mariana",
      online: true
    },
    {
      id: "a4",
      nome: "João Costa",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao",
      online: false
    },
    {
      id: "a5",
      nome: "Carla Mendes",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carla",
      online: true
    }
  ],
  forumTopicos: [
    {
      id: "t1",
      titulo: "Dúvida sobre o Princípio da Incerteza",
      autor: "Ana Silva",
      data: "10/02/2023",
      respostas: 5,
      visualizacoes: 28,
      fixado: true
    },
    {
      id: "t2",
      titulo: "Material complementar sobre Computação Quântica",
      autor: "Prof. Carlos Santos",
      data: "01/03/2023",
      respostas: 3,
      visualizacoes: 42,
      fixado: true
    },
    {
      id: "t3",
      titulo: "Dificuldade com os exercícios da Lista 2",
      autor: "Pedro Oliveira",
      data: "22/02/2023",
      respostas: 8,
      visualizacoes: 35,
      fixado: false
    },
    {
      id: "t4",
      titulo: "Grupo de estudo para o projeto final",
      autor: "Mariana Santos",
      data: "05/03/2023",
      respostas: 12,
      visualizacoes: 40,
      fixado: false
    },
    {
      id: "t5",
      titulo: "Artigo interessante sobre Emaranhamento Quântico",
      autor: "João Costa",
      data: "08/03/2023",
      respostas: 2,
      visualizacoes: 15,
      fixado: false
    }
  ],
  eventos: [
    {
      id: "e1",
      titulo: "Aula 4: Teoria Quântica de Campos",
      data: "15/03/2023",
      hora: "14:00 - 16:00",
      tipo: "aula",
      local: "Sala Virtual 3"
    },
    {
      id: "e2",
      titulo: "Entrega da Lista de Exercícios 3",
      data: "20/03/2023",
      hora: "23:59",
      tipo: "tarefa",
      local: "Plataforma"
    },
    {
      id: "e3",
      titulo: "Discussão: Interpretações da Mecânica Quântica",
      data: "22/03/2023",
      hora: "15:00 - 16:00",
      tipo: "discussao",
      local: "Fórum da Turma"
    },
    {
      id: "e4",
      titulo: "Prova Parcial",
      data: "30/03/2023",
      hora: "14:00 - 16:00",
      tipo: "avaliacao",
      local: "Sala Virtual 3"
    }
  ],
  notas: [
    {
      id: "n1",
      avaliacao: "Lista de Exercícios 1",
      nota: 9.5,
      peso: 10,
      data: "10/02/2023"
    },
    {
      id: "n2",
      avaliacao: "Participação nas Discussões - Módulo 1",
      nota: 8.0,
      peso: 5,
      data: "14/02/2023"
    },
    {
      id: "n3",
      avaliacao: "Lista de Exercícios 2",
      nota: 7.5,
      peso: 10,
      data: "25/02/2023"
    },
    {
      id: "n4",
      avaliacao: "Participação nas Discussões - Módulo 2",
      nota: 9.0,
      peso: 5,
      data: "28/02/2023"
    },
    {
      id: "n5",
      avaliacao: "Prova Parcial",
      nota: null,
      peso: 30,
      data: "30/03/2023"
    }
  ],
  gruposEstudo: [
    {
      id: "g1",
      nome: "Grupo de Mecânica Quântica",
      membros: ["Ana Silva", "Pedro Oliveira", "Você"],
      proximaReuniao: "16/03/2023, 18:00"
    },
    {
      id: "g2",
      nome: "Preparação para o Projeto Final",
      membros: ["Mariana Santos", "João Costa", "Carla Mendes", "Você"],
      proximaReuniao: "23/03/2023, 19:00"
    }
  ]
};

// Sample data for forum topics
const forumTopicos = [
  {
    id: "t1",
    titulo: "Dúvida sobre o Princípio da Incerteza",
    autor: {
      nome: "Ana Silva",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana"
    },
    data: "10/02/2023",
    conteudo: "Olá pessoal, estou com dificuldade para entender o Princípio da Incerteza de Heisenberg. Alguém poderia explicar de forma mais simples ou indicar algum material que ajude a compreender melhor?",
    respostas: [
      {
        id: "r1-1",
        autor: {
          nome: "Prof. Carlos Santos",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
          professor: true
        },
        data: "10/02/2023",
        conteudo: "Olá Ana, o Princípio da Incerteza estabelece que não podemos conhecer com precisão absoluta, simultaneamente, a posição e o momento (velocidade) de uma partícula. Quanto mais precisamente conhecemos uma dessas grandezas, menos precisamente conhecemos a outra. Vou compartilhar um vídeo na próxima aula que explica isso de forma visual.",
        likes: 8
      },
      {
        id: "r1-2",
        autor: {
          nome: "Pedro Oliveira",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro"
        },
        data: "11/02/2023",
        conteudo: "Ana, eu também tive dificuldade com esse conceito. O que me ajudou foi pensar em uma analogia: é como tentar tirar uma foto de um objeto em movimento. Se você quer capturar exatamente onde ele está (posição), a foto fica borrada e você não consegue determinar bem a velocidade. Se você quer capturar claramente a velocidade, a posição fica incerta. Na física quântica isso não é uma limitação tecnológica, mas uma propriedade fundamental da natureza.",
        likes: 5
      }
    ],
    tags: ["Princípio da Incerteza", "Heisenberg", "Dúvida"],
    fixado: true,
    resolvido: true
  },
  {
    id: "t2",
    titulo: "Material complementar sobre Computação Quântica",
    autor: {
      nome: "Prof. Carlos Santos",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
      professor: true
    },
    data: "01/03/2023",
    conteudo: "Olá turma, como prometido, estou compartilhando alguns materiais complementares sobre Computação Quântica que podem ajudar na compreensão do tema abordado na última aula:\n\n1. Artigo: 'Introdução à Computação Quântica' (PDF anexo)\n2. Vídeo: 'Como funcionam os computadores quânticos' (link)\n3. Simulador online de circuitos quânticos (link)\n\nEstes materiais não são obrigatórios, mas altamente recomendados para quem deseja se aprofundar no assunto. Qualquer dúvida, postem aqui neste tópico.",
    respostas: [
      {
        id: "r2-1",
        autor: {
          nome: "Mariana Santos",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mariana"
        },
        data: "01/03/2023",
        conteudo: "Muito obrigada, professor! O simulador é incrível, já estou testando alguns circuitos básicos. Recomendo a todos!",
        likes: 4
      },
      {
        id: "r2-2",
        autor: {
          nome: "João Costa",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao"
        },
        data: "02/03/2023",
        conteudo: "Professor, encontrei este outro artigo que complementa bem o material que você compartilhou: [link]. Achei que poderia ser útil para a turma.",
        likes: 6
      }
    ],
    tags: ["Computação Quântica", "Material Complementar", "Recursos"],
    fixado: true,
    resolvido: false
  }
];

const TurmasView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTurmas, setFilteredTurmas] = useState(turmasData);
  const [selectedTurma, setSelectedTurma] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("conteudo");
  const [expandedModules, setExpandedModules] = useState<string[]>(["m1"]);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  // Filter classes based on search query
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim() === "") {
      setFilteredTurmas(turmasData);
    } else {
      const filtered = turmasData.filter(turma => 
        turma.nome.toLowerCase().includes(query.toLowerCase()) ||
        turma.professor.toLowerCase().includes(query.toLowerCase()) ||
        turma.disciplina.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredTurmas(filtered);
    }
  };

  // Toggle module expansion
  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  // Handle class selection
  const handleTurmaSelect = (turmaId: string) => {
    setSelectedTurma(turmaId);
    setActiveTab("conteudo");
    // In a real app, you would fetch the detailed data for the selected class
  };

  // Handle back to classes list
  const handleBackToList = () => {
    setSelectedTurma(null);
  };

  // Handle group selection
  const handleGroupSelect = (group: any) => {
    setSelectedGroup(group);
  };

  // Handle back from group detail
  const handleBackFromGroup = () => {
    setSelectedGroup(null);
  };

  // Get topic icon
  const getTopicIcon = (topic: string) => {
    switch (topic) {
      case "Matemática":
        return <Calculator className="h-6 w-6 text-[#FF6B00]" />;
      case "Língua Portuguesa":
        return <BookOpen className="h-6 w-6 text-[#FF6B00]" />;
      case "Química":
        return <Beaker className="h-6 w-6 text-[#E85D04]" />;
      case "Física":
        return <Atom className="h-6 w-6 text-[#FF8C40]" />;
      case "Biologia":
        return <Dna className="h-6 w-6 text-[#DC2F02]" />;
      case "Geografia":
        return <Globe className="h-6 w-6 text-[#0077B6]" />;
      case "História":
        return <Landmark className="h-6 w-6 text-[#9D0208]" />;
      case "Filosofia":
        return <Brain className="h-6 w-6 text-[#3A0CA3]" />;
      case "Sociologia":
        return <Users className="h-6 w-6 text-[#4361EE]" />;
      default:
        return <BookOpen className="h-6 w-6 text-[#FF6B00]" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "concluido":
        return "text-green-500";
      case "pendente":
        return "text-amber-500";
      case "novo":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "concluido":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pendente":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "novo":
        return <Star className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "alta":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "media":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      case "baixa":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  // Get comparative icon
  const getComparativeIcon = (status: string) => {
    switch (status) {
      case "acima":
        return <ArrowRight className="h-4 w-4 text-green-500 rotate-[-45deg]" />;
      case "abaixo":
        return <ArrowRight className="h-4 w-4 text-red-500 rotate-45" />;
      case "na media":
        return <ArrowRight className="h-4 w-4 text-amber-500 rotate-0" />;
      default:
        return null;
    }
  };

  // Get event type icon
  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "aula":
        return <Video className="h-4 w-4 text-blue-500" />;
      case "tarefa":
        return <FileText className="h-4 w-4 text-amber-500" />;
      case "discussao":
        return <MessageCircle className="h-4 w-4 text-green-500" />;
      case "avaliacao":
        return <FileQuestion className="h-4 w-4 text-red-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  // Function to scroll horizontally within a topic container
  const scrollContainer = (containerId: string, direction: 'left' | 'right') => {
    const container = document.getElementById(containerId);
    if (container) {
      const scrollAmount = 300; // Adjust scroll amount as needed
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  // Sample group data for demonstration
  const sampleGroup = {
    id: "g1",
    nome: "Grupo de Mecânica Quântica",
    disciplina: "Física",
    membros: 5,
    tipoGrupo: "estudo",
    proximaReuniao: "16/03/2023, 18:00",
    descricao: "Grupo dedicado ao estudo aprofundado de Mecânica Quântica, com foco em preparação para as avaliações e desenvolvimento de projetos colaborativos.",
    objetivos: "Aprofundar conhecimentos em Mecânica Quântica, preparar para avaliações e desenvolver projetos colaborativos.",
    frequencia: "semanal",
    horarios: "Quintas-feiras, 18:00 - 20:00",
    tags: ["Mecânica Quântica", "Física Teórica", "Equação de Schrödinger"],
    imagem: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&q=90",
    icone: <Atom className="h-6 w-6 text-[#FF8C40]" />
  };

  // If a group is selected, show the group detail view
  if (selectedGroup) {
    return <GroupDetail group={selectedGroup} onBack={handleBackFromGroup} />;
  }

  return (
    <div className="container mx-auto p-6 max-w-[1400px]">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] flex items-center justify-center shadow-md">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#001427] dark:text-white bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] bg-clip-text text-transparent">
              Minhas Turmas
            </h1>
            <p className="text-[#778DA9] dark:text-gray-400 text-sm">
              Seu centro de estudos personalizado
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FF6B00]">
              <Search className="h-4 w-4" />
            </div>
            <Input
              placeholder="Buscar turmas..."
              className="pl-9 w-[250px] border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30 rounded-lg"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <Button
            className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4 mr-1" /> Adicionar Turma
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {!selectedTurma ? (
        // Turmas List View with Topics and Study Groups
        <div className="space-y-8">
          {/* Study Groups by Topics Section */}
          <GruposEstudoPorTopico 
            gruposEstudosPorTopico={gruposEstudosPorTopico} 
            getTopicIcon={getTopicIcon}
            scrollContainer={scrollContainer}
            handleGroupSelect={handleGroupSelect}
          />
          
          {/* Regular Classes Section */}
          <div className="bg-white dark:bg-[#1E293B] rounded-xl p-6 shadow-md border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
            <h2 className="text-2xl font-bold text-[#001427] dark:text-white mb-6 font-montserrat">Minhas Turmas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTurmas.map((turma) => (
                <motion.div
                  key={turma.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20 transform hover:translate-y-[-3px] cursor-pointer"
                  onClick={() => handleTurmaSelect(turma.id)}
                >
                  <div className="flex flex-col h-full">
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={turma.imagem}
                        alt={turma.nome}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-center gap-2 mb-1">
                          {turma.icone}
                          <h3 className="text-xl font-bold text-white font-montserrat">
                            {turma.nome}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-200 font-open-sans">
                          {turma.professor}
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-montserrat">
                              Progresso
                            </span>
                            <span className="text-sm font-bold text-[#FF6B00] font-montserrat">
                              {turma.progresso}%
                            </span>
                          </div>
                          <Progress
                            value={turma.progresso}
                            className="h-2.5 bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <Clock className="h-4 w-4 text-[#FF6B00]" />
                            <span className={turma.proximaAula.prazoProximo ? "text-red-500 dark:text-red-400 font-medium" : ""}>
                              {turma.proximaAula.titulo} - {turma.proximaAula.data}, {turma.proximaAula.hora}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] dark:bg-[#FF6B00]/20 dark:text-[#FF8C40]">
                              {turma.status}
                            </Badge>
                            
                            {turma.novasMensagens > 0 && (
                              <Badge className="bg-blue-500 text-white">
                                <MessageCircle className="h-3 w-3 mr-1" />
                                {turma.novasMensagens} {turma.novasMensagens === 1 ? "nova mensagem" : "novas mensagens"}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button
                          className="flex-1 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white font-montserrat font-semibold uppercase text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTurmaSelect(turma.id);
                          }}
                        >
                          Acessar Turma
                        </Button>
                        
                        <Button
                          variant="outline"
                          className="border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10 font-montserrat text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            // In a real app, this would navigate to the forum
                          }}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" /> Ver Fórum
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Turma Detail View
        <div className="space-y-6">
          {/* Turma Header */}
          <div className="relative h-64 rounded-xl overflow-hidden">
            <img
              src={turmaDetalhada.imagem}
              alt={turmaDetalhada.nome}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            
            <div className="absolute top-4 left-4">
              <Button
                variant="ghost"
                className="bg-black/30 text-white hover:bg-black/50 backdrop-blur-sm"
                onClick={handleBackToList}
              >
                <ArrowRight className="h-4 w-4 mr-1 rotate-180" /> Voltar para Minhas Turmas
              </Button>
            </div>
            
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="ghost"
                className="bg-black/30 text-white hover:bg-black/50 backdrop-blur-sm"
              >
                <MessageCircle className="h-4 w-4 mr-1" /> Ver Fórum
              </Button>
              
              <Button
                variant="ghost"
                className="bg-black/30 text-white hover:bg-black/50 backdrop-blur-sm"
              >
                <Users className="h-4 w-4 mr-1" /> Ver Colegas
              </Button>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-12 w-12 border-2 border-white">
                  <AvatarImage src={turmaDetalhada.professor.avatar} />
                  <AvatarFallback>{turmaDetalhada.professor.nome.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold text-white font-montserrat">
                    {turmaDetalhada.nome}
                  </h1>
                  <p className="text-gray-200 font-open-sans">
                    {turmaDetalhada.professor.nome} • {turmaDetalhada.professor.especialidade}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Badge className="bg-[#FF6B00]/20 text-[#FF6B00] backdrop-blur-sm">
                  {turmaDetalhada.status}
                </Badge>
                
                <div className="flex items-center gap-1 text-white text-sm">
                  <Calendar className="h-4 w-4 text-[#FF6B00]" />
                  <span>{turmaDetalhada.inicioFim}</span>
                </div>
                
                <div className="flex items-center gap-1 text-white text-sm">
                  <Clock className="h-4 w-4 text-[#FF6B00]" />
                  <span>{turmaDetalhada.horarios}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="bg-white dark:bg-[#1E293B] p-1 rounded-xl shadow-md border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
              <TabsTrigger
                value="conteudo"
                className="data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00] rounded-lg px-4 py-2"
              >
                <BookOpen className="h-4 w-4 mr-2" /> Conteúdo
              </TabsTrigger>
              
              <TabsTrigger
                value="visao-geral"
                className="data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00] rounded-lg px-4 py-2"
              >
                <BarChart className="h-4 w-4 mr-2" /> Visão Geral
              </TabsTrigger>
              
              <TabsTrigger
                value="forum"
                className="data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00] rounded-lg px-4 py-2"
              >
                <MessageCircle className="h-4 w-4 mr-2" /> Fórum
              </TabsTrigger>
              
              <TabsTrigger
                value="agenda"
                className="data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00] rounded-lg px-4 py-2"
              >
                <Calendar className="h-4 w-4 mr-2" /> Agenda
              </TabsTrigger>
              
              <TabsTrigger
                value="notas"
                className="data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00] rounded-lg px-4 py-2"
              >
                <FileText className="h-4 w-4 mr-2" /> Notas
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="conteudo" className="space-y-6">
              {/* Content Tab */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Modules */}
                  <div className="bg-white dark:bg-[#1E293B] rounded-xl p-6 shadow-md border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                    <h3 className="text-xl font-bold text-[#001427] dark:text-white mb-4 font-montserrat">Módulos</h3>
                    
                    <div className="space-y-4">
                      {turmaDetalhada.modulos.map((modulo) => (
                        <div key={modulo.id} className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                          <div 
                            className="bg-gray-50 dark:bg-[#0f1525] p-4 flex items-center justify-between cursor-pointer"
                            onClick={() => toggleModule(modulo.id)}
                          >
                            <div className="flex-1">
                              <h4 className="font-bold text-[#001427] dark:text-white">{modulo.titulo}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{modulo.descricao}</p>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-[#FF6B00]">{modulo.progresso}%</span>
                                <Progress
                                  value={modulo.progresso}
                                  className="h-2 w-20 bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20"
                                />
                              </div>
                              
                              {expandedModules.includes(modulo.id) ? (
                                <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                              )}
                            </div>
                          </div>
                          
                          {expandedModules.includes(modulo.id) && (
                            <div className="p-4 bg-white dark:bg-[#1E293B] space-y-3">
                              {modulo.conteudos.map((conteudo) => (
                                <div 
                                  key={conteudo.id} 
                                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#0f1525] transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 dark:bg-[#0f1525] rounded-lg">
                                      {conteudo.icone}
                                    </div>
                                    
                                    <div>
                                      <h5 className="font-medium text-[#001427] dark:text-white">{conteudo.titulo}</h5>
                                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" /> {conteudo.duracao}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Calendar className="h-3 w-3" /> {conteudo.data}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <Badge className={`${getStatusColor(conteudo.status)}`}>
                                      <div className="flex items-center gap-1">
                                        {getStatusIcon(conteudo.status)}
                                        <span className="capitalize">{conteudo.status}</span>
                                      </div>
                                    </Badge>
                                    
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                                      <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Recommendations */}
                  <div className="bg-white dark:bg-[#1E293B] rounded-xl p-6 shadow-md border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                    <h3 className="text-xl font-bold text-[#001427] dark:text-white mb-4 font-montserrat">Recomendações</h3>
                    
                    <div className="space-y-3">
                      {turmaDetalhada.recomendacoes.map((recomendacao) => (
                        <div 
                          key={recomendacao.id} 
                          className={`p-3 rounded-lg ${getPriorityColor(recomendacao.prioridade)} flex items-start gap-3`}
                        >
                          <div className="p-2 bg-white dark:bg-[#0f1525] rounded-lg">
                            {recomendacao.icone}
                          </div>
                          
                          <div>
                            <h5 className="font-medium">{recomendacao.titulo}</h5>
                            <div className="flex items-center gap-1 text-xs mt-1">
                              <Badge className="bg-white/50 dark:bg-[#0f1525]/50 text-gray-700 dark:text-gray-300">
                                {recomendacao.tipo}
                              </Badge>
                              <Badge className="bg-white/50 dark:bg-[#0f1525]/50 text-gray-700 dark:text-gray-300 capitalize">
                                {recomendacao.prioridade}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Weekly Goals */}
                  <div className="bg-white dark:bg-[#1E293B] rounded-xl p-6 shadow-md border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                    <h3 className="text-xl font-bold text-[#001427] dark:text-white mb-4 font-montserrat">Metas Semanais</h3>
                    
                    <div className="space-y-4">
                      {turmaDetalhada.metasSemanais.map((meta) => (
                        <div key={meta.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <h5 className="font-medium text-[#001427] dark:text-white">{meta.titulo}</h5>
                            <span className="text-sm font-medium text-[#FF6B00]">{meta.progresso}%</span>
                          </div>
                          <Progress
                            value={meta.progresso}
                            className="h-2 bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Study Groups */}
                  <div className="bg-white dark:bg-[#1E293B] rounded-xl p-6 shadow-md border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                    <h3 className="text-xl font-bold text-[#001427] dark:text-white mb-4 font-montserrat">Grupos de Estudo</h3>
                    
                    <div className="space-y-3">
                      {turmaDetalhada.gruposEstudo.map((grupo) => (
                        <div 
                          key={grupo.id} 
                          className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#0f1525] transition-colors cursor-pointer"
                        >
                          <h5 className="font-medium text-[#001427] dark:text-white mb-2">{grupo.nome}</h5>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                              <Users className="h-4 w-4 text-[#FF6B00]" />
                              <span>{grupo.membros.length} membros</span>
                            </div>
                            
                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                              <Calendar className="h-4 w-4 text-[#FF6B00]" />
                              <span>{grupo.proximaReuniao}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="visao-geral">
              {/* Overview Tab */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Description */}
                  <div className="bg-white dark:bg-[#1E293B] rounded-xl p-6 shadow-md border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                    <h3 className="text-xl font-bold text-[#001427] dark:text-white mb-4 font-montserrat">Descrição da Turma</h3>
                    <p className="text-gray-700 dark:text-gray-300">{turmaDetalhada.descricao}</p>
                  </div>
                  
                  {/* Strengths and Weaknesses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-[#1E293B] rounded-xl p-6 shadow-md border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                      <h3 className="text-xl font-bold text-[#001427] dark:text-white mb-4 font-montserrat">Pontos Fortes</h3>
                      
                      <div className="space-y-2">
                        {turmaDetalhada.pontosFortes.map((ponto, index) => (
                          <div 
                            key={index} 
                            className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>{ponto}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-[#1E293B] rounded-xl p-6 shadow-md border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                      <h3 className="text-xl font-bold text-[#001427] dark:text-white mb-4 font-montserrat">Pontos a Melhorar</h3>
                      
                      <div className="space-y-2">
                        {turmaDetalhada.pontosFracos.map((ponto, index) => (
                          <div 
                            key={index} 
                            className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300"
                          >
                            <AlertCircle className="h-4 w-4" />
                            <span>{ponto}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Comparative Performance */}
                  <div className="bg-white dark:bg-[#1E293B] rounded-xl p-6 shadow-md border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                    <h3 className="text-xl font-bold text-[#001427] dark:text-white mb-4 font-montserrat">Comparativo com a Turma</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-gray-50 dark:bg-[#0f1525] border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-[#001427] dark:text-white">Participação</h5>
                          {getCom