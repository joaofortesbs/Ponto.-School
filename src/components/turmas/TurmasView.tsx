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
        // Turmas List View
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
                value="membros"
                className="data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00] rounded-lg px-4 py-2"
              >
                <Users className="h-4 w-4 mr-2" /> Membros
              </TabsTrigger>
              
              <TabsTrigger
                value="notas"
                className="data-[state=active]:bg-[#FF6B00]/10 data-[state=active]:text-[#FF6B00] rounded-lg px-4 py-2"
              >
                <FileText className="h-4 w-4 mr-2" /> Notas
              </TabsTrigger>
            </TabsList>
            
            {/* Conteúdo Tab */}
            <TabsContent value="conteudo" className="space-y-6">
              {/* Painel de Aprendizagem Personalizado */}
              <Card className="bg-white dark:bg-[#1E293B] border-[#FF6B00]/10 dark:border-[#FF6B00]/20 shadow-md hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white font-montserrat flex items-center">
                      <Brain className="h-5 w-5 mr-2 text-[#FF6B00]" /> Painel de Aprendizagem Personalizado
                    </h3>
                    <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] dark:bg-[#FF6B00]/20 dark:text-[#FF8C40]">
                      <Sparkles className="h-3.5 w-3.5 mr-1" /> Gerado pelo Mentor IA
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Seu Próximo Passo */}
                    <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-xl p-4 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white font-montserrat flex items-center mb-3">
                        <Rocket className="h-5 w-5 mr-2 text-[#FF6B00]" /> Seu Próximo Passo
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 mb-4 font-open-sans">
                        Revisar o conceito de Dualidade Onda-Partícula antes de prosseguir para o próximo módulo.
                      </p>
                      <Button className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white">
                        Ir para a Atividade
                      </Button>
                    </div>
                    
                    {/* Recomendado para Você */}
                    <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-xl p-4 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white font-montserrat flex items-center mb-3">
                        <Lightbulb className="h-5 w-5 mr-2 text-[#FF6B00]" /> Recomendado para Você
                      </h4>
                      <div className="space-y-3">
                        {turmaDetalhada.recomendacoes.map((rec) => (
                          <div key={rec.id} className="flex items-start gap-2">
                            {rec.icone}
                            <div className="flex-1">
                              <p className="text-sm text-gray-700 dark:text-gray-300 font-open-sans">
                                {rec.titulo}
                              </p>
                              <Badge className={`mt-1 text-xs ${getPriorityColor(rec.prioridade)}`}>
                                Prioridade {rec.prioridade}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Metas Semanais */}
                    <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-xl p-4 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white font-montserrat flex items-center mb-3">
                        <Target className="h-5 w-5 mr-2 text-[#FF6B00]" /> Metas Semanais
                      </h4>
                      <div className="space-y-3">
                        {turmaDetalhada.metasSemanais.map((meta) => (
                          <div key={meta.id} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <p className="text-sm text-gray-700 dark:text-gray-300 font-open-sans">
                                {meta.titulo}
                              </p>
                              <span className="text-xs font-bold text-[#FF6B00]">
                                {meta.progresso}%
                              </span>
                            </div>
                            <Progress value={meta.progresso} className="h-1.5 bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20" />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Seus Pontos Fortes */}
                    <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-xl p-4 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white font-montserrat flex items-center mb-3">
                        <Award className="h-5 w-5 mr-2 text-[#FF6B00]" /> Seus Pontos Fortes
                      </h4>
                      <div className="space-y-2">
                        {turmaDetalhada.pontosFortes.map((ponto, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <p className="text-sm text-gray-700 dark:text-gray-300 font-open-sans">
                              {ponto}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Áreas para Melhorar */}
                    <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-xl p-4 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white font-montserrat flex items-center mb-3">
                        <Zap className="h-5 w-5 mr-2 text-[#FF6B00]" /> Áreas para Melhorar
                      </h4>
                      <div className="space-y-2">
                        {turmaDetalhada.pontosFracos.map((ponto, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            <p className="text-sm text-gray-700 dark:text-gray-300 font-open-sans">
                              {ponto}
                            </p>
                          </div>
                        ))}
                      </div>
                      <Button variant="link" className="mt-2 p-0 h-auto text-[#FF6B00] hover:text-[#FF8C40]">
                        Ver materiais de revisão <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                    
                    {/* Comparativo com a Turma */}
                    <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-xl p-4 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white font-montserrat flex items-center mb-3">
                        <BarChart className="h-5 w-5 mr-2 text-[#FF6B00]" /> Comparativo com a Turma
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-700 dark:text-gray-300 font-open-sans">
                            Participação no Fórum
                          </p>
                          <div className="flex items-center gap-1">
                            {getComparativeIcon(turmaDetalhada.comparativoTurma.participacao)}
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {turmaDetalhada.comparativoTurma.participacao === "acima" ? "Acima da média" : 
                               turmaDetalhada.comparativoTurma.participacao === "abaixo" ? "Abaixo da média" : "Na média"}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-700 dark:text-gray-300 font-open-sans">
                            Entrega de Tarefas
                          </p>
                          <div className="flex items-center gap-1">
                            {getComparativeIcon(turmaDetalhada.comparativoTurma.entregaTarefas)}
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {turmaDetalhada.comparativoTurma.entregaTarefas === "acima" ? "Acima da média" : 
                               turmaDetalhada.comparativoTurma.entregaTarefas === "abaixo" ? "Abaixo da média" : "Na média"}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-700 dark:text-gray-300 font-open-sans">
                            Desempenho Geral
                          </p>
                          <div className="flex items-center gap-1">
                            {getComparativeIcon(turmaDetalhada.comparativoTurma.desempenhoGeral)}
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {turmaDetalhada.comparativoTurma.desempenhoGeral === "acima" ? "Acima da média" : 
                               turmaDetalhada.comparativoTurma.desempenhoGeral === "abaixo" ? "Abaixo da média" : "Na média"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Módulos */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white font-montserrat">
                  Módulos do Curso
                </h3>
                
                {turmaDetalhada.modulos.map((modulo) => (
                  <Card 
                    key={modulo.id} 
                    className={`bg-white dark:bg-[#1E293B] border-[#FF6B00]/10 dark:border-[#FF6B00]/20 shadow-md hover:shadow-lg transition-all duration-300 ${expandedModules.includes(modulo.id) ? "border-[#FF6B00]/30" : ""}`}
                  >
                    <div 
                      className="p-4 cursor-pointer flex items-center justify-between"
                      onClick={() => toggleModule(modulo.id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white font-montserrat">
                            {modulo.titulo}
                          </h4>
                          {modulo.progresso === 100 && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-open-sans">
                          {modulo.descricao}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#FF6B00]">
                            {modulo.progresso}%
                          </span>
                          <div className="w-20 h-2 bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#FF6B00] rounded-full" 
                              style={{ width: `${modulo.progresso}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        {expandedModules.includes(modulo.id) ? (
                          <ChevronUp className="h-5 w-5 text-[#FF6B00]" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-[#FF6B00]" />
                        )}
                      </div>
                    </div>
                    
                    {/* Conteúdos do Módulo */}
                    {expandedModules.includes(modulo.id) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-4 pb-4 space-y-3"
                      >
                        <div className="border-t border-[#FF6B00]/10 dark:border-[#FF6B00]/20 pt-3">
                          {modulo.conteudos.map((conteudo) => (
                            <div 
                              key={conteudo.id} 
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#FF6B00]/5 dark:hover:bg-[#FF6B00]/10 transition-colors cursor-pointer"
                            >
                              <div className="flex-shrink-0">
                                {conteudo.icone}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h5 className={`text-base font-medium font-montserrat ${conteudo.status === "concluido" ? "text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-white"}`}>
                                    {conteudo.titulo}
                                  </h5>
                                  <div className={getStatusColor(conteudo.status)}>
                                    {getStatusIcon(conteudo.status)}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3 text-[#FF6B00]" />
                                    <span>{conteudo.duracao}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3 text-[#FF6B00]" />
                                    <span>{conteudo.data}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 text-[#FF6B00] hover:bg-[#FF6B00]/10 hover:text-[#FF8C40]"
                              >
                                Acessar
                              </Button>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            {/* Visão Geral Tab */}
            <TabsContent value="visao-geral" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informações da Turma */}
                <Card className="bg-white dark:bg-[#1E293B] border-[#FF6B00]/10 dark:border-[#FF6B00]/20 shadow-md">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white font-montserrat flex items-center mb-4">
                      <Info className="h-5 w-5 mr-2 text-[#FF6B00]" /> Informações da Turma
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-2">
                        <Calendar className="h-5 w-5 text-[#FF6B00] mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Período
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400">
                            {turmaDetalhada.inicioFim}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <Clock className="h-5 w-5 text-[#FF6B00] mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Horários
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400">
                            {turmaDetalhada.horarios}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <BookOpen className="h-5 w-5 text-[#FF6B00] mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Carga Horária
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400">
                            {turmaDetalhada.cargaHoraria}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <GraduationCap className="h-5 w-5 text-[#FF6B00] mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Professor
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400">
                            {turmaDetalhada.professor.nome} ({turmaDetalhada.professor.email})
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">
                            Especialidade: {turmaDetalhada.professor.especialidade}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <FileText className="h-5 w-5 text-[#FF6B00] mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Descrição
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400">
                            {turmaDetalhada.descricao}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Progresso Geral */}
                <Card className="bg-white dark:bg-[#1E293B] border-[#FF6B00]/10 dark:border-[#FF6B00]/20 shadow-md">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white font-montserrat flex items-center mb-4">
                      <BarChart className="h-5 w-5 mr-2 text-[#FF6B00]" /> Progresso Geral
                    </h3>
                    
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Progresso Total
                          </span>
                          <span className="text-sm font-bold text-[#FF6B00]">
                            {turmaDetalhada.progresso}%
                          </span>
                        </div>
                        <Progress value={turmaDetalhada.progresso} className="h-3 bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20" />
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Progresso por Módulo
                        </h4>
                        
                        {turmaDetalhada.modulos.map((modulo) => (
                          <div key={modulo.id} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {modulo.titulo.split(":")[0]}
                              </span>
                              <span className="text-xs font-medium text-[#FF6B00]">
                                {modulo.progresso}%
                              </span>
                            </div>
                            <Progress value={modulo.progresso} className="h-2 bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20" />
                          </div>
                        ))}
                      </div>
                      
                      <div className="pt-4 border-t border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Estatísticas
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-[#FF6B00]">
                              {turmaDetalhada.modulos.reduce((acc, modulo) => acc + modulo.conteudos.filter(c => c.status === "concluido").length, 0)}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Atividades Concluídas
                            </div>
                          </div>
                          
                          <div className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-[#FF6B00]">
                              {turmaDetalhada.modulos.reduce((acc, modulo) => acc + modulo.conteudos.filter(c => c.status === "pendente").length, 0)}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Atividades Pendentes
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Grupos de Estudo */}
              <Card className="bg-white dark:bg-[#1E293B] border-[#FF6B00]/10 dark:border-[#FF6B00]/20 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white font-montserrat flex items-center">
                      <Users className="h-5 w-5 mr-2 text-[#FF6B00]" /> Grupos de Estudo
                    </h3>
                    <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white">
                      <Plus className="h-4 w-4 mr-1" /> Criar Grupo
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {turmaDetalhada.gruposEstudo.map((grupo) => (
                      <div key={grupo.id} className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-xl p-4 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white font-montserrat mb-2">
                          {grupo.nome}
                        </h4>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex -space-x-2">
                            {grupo.membros.slice(0, 3).map((membro, index) => (
                              <div key={index} className="w-8 h-8 rounded-full bg-[#FF6B00]/20 flex items-center justify-center text-xs font-bold text-[#FF6B00] border-2 border-white dark:border-[#1E293B]">
                                {membro === "Você" ? "Você" : membro.charAt(0)}
                              </div>
                            ))}
                            {grupo.membros.length > 3 && (
                              <div className="w-8 h-8 rounded-full bg-[#FF6B00]/20 flex items-center justify-center text-xs font-bold text-[#FF6B00] border-2 border-white dark:border-[#1E293B]">
                                +{grupo.membros.length - 3}
                              </div>
                            )}
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {grupo.membros.length} membros
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="h-4 w-4 text-[#FF6B00]" />
                            <span>Próxima reunião: {grupo.proximaReuniao}</span>
                          </div>
                          
                          <Button variant="ghost" className="h-8 text-[#FF6B00] hover:bg-[#FF6B00]/10 hover:text-[#FF8C40]">
                            Entrar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Fórum Tab */}
            <TabsContent value="forum" className="space-y-6">
              <Card className="bg-white dark:bg-[#1E293B] border-[#FF6B00]/10 dark:border-[#FF6B00]/20 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white font-montserrat flex items-center">
                      <MessageCircle className="h-5 w-5 mr-2 text-[#FF6B00]" /> Fórum da Turma
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FF6B00]">
                          <Search className="h-4 w-4" />
                        </div>
                        <Input
                          placeholder="Buscar no fórum..."
                          className="pl-9 w-[200px] border-[#FF6B00]/30 focus:border-[#FF6B00] focus:ring-[#FF6B00]/30 rounded-lg"
                        />
                      </div>
                      <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white">
                        <Plus className="h-4 w-4 mr-1" /> Novo Tópico
                      </Button>
                    </div>
                  </div>
                  
                  {/* Tópicos Fixados */}
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white font-montserrat mb-3">
                      Tópicos Fixados
                    </h4>
                    
                    <div className="space-y-3">
                      {turmaDetalhada.forumTopicos.filter(t => t.fixado).map((topico) => (
                        <div key={topico.id} className="bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-xl p-4 border border-[#FF6B00]/10 dark:border-[#FF6B00]/20 hover:border-[#FF6B00]/30 transition-colors cursor-pointer">
                          <div className="flex items-start gap-3">
                            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 flex-shrink-0 mt-1">
                              Fixado
                            </Badge>
                            
                            <div className="flex-1">
                              <h5 className="text-base font-bold text-gray-900 dark:text-white font-montserrat mb-1">
                                {topico.titulo}
                              </h5>
                              
                              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-2">
                                <div className="flex items-center gap-1">
                                  <span>Por: {topico.autor}</span>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3 text-[#FF6B00]" />
                                  <span>{topico.data}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                  <MessageCircle className="h-3 w-3 text-[#FF6B00]" />
                                  <span>{topico.respostas} respostas</span>
                                </div>
                                
                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                  <Eye className="h-3 w-3 text-[#FF6B00]" />
                                  <span>{topico.visualizacoes} visualizações</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Tópicos Recentes */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white font-montserrat mb-3">
                      Tópicos Recentes
                    </h4>
                    
                    <div className="space-y-3">
                      {turmaDetalhada.forumTopicos.filter(t => !t.fixado).map((topico) => (
                        <div key={topico.id} className="bg-white dark:bg-[#1E293B] rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-[#FF6B00]/30 transition-colors cursor-pointer">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <h5 className="text-base font-bold text-gray-900 dark:text-white font-montserrat mb-1">
                                {topico.titulo}
                              </h5>
                              
                              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-2">
                                <div className="flex items-center gap-1">
                                  <span>Por: {topico.autor}</span>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3 text-[#FF6B00]" />
                                  <span>{topico.data}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                  <MessageCircle className="h-3 w-3 text-[#FF6B00]" />
                                  <span>{topico.respostas} respostas</span>
                                </div>
                                
                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                  <Eye className="h-3 w-3 text-[#FF6B00]" />
                                  <span>{topico.visualizacoes} visualizações</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Agenda Tab */}
            <TabsContent value="agenda" className="space-y-6">
              <Card className="bg-white dark:bg-[#1E293B] border-[#FF6B00]/10 dark:border-[#FF6B00]/20 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white font-montserrat flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-[#FF6B00]" /> Agenda da Turma
                    </h3>
                    <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white">
                      Ver Calendário Completo
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white font-montserrat">
                      Próximos Eventos
                    </h4>
                    
                    <div className="space-y-3">
                      {turmaDetalhada.eventos.map((evento) => (
                        <div key={evento.id} className="bg-white dark:bg-[#1E293B] rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-[#FF6B00]/30 transition-colors cursor-pointer shadow-sm hover:shadow-md">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 flex items-center justify-center">
                              {getEventTypeIcon(evento.tipo)}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <h5 className="text-base font-bold text-gray-900 dark:text-white font-montserrat">
                                  {evento.titulo}
                                </h5>
                                
                                <Badge className={`
                                  ${evento.tipo === "aula" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" : 
                                    evento.tipo === "tarefa" ? "bg-amber-100 text-amber-800 dark:bg-amber-900