import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TurmasHeader from "@/components/turmas/TurmasHeader";
import TurmaCard from "@/components/turmas/TurmaCard";
import TurmaDetail from "@/components/turmas/TurmaDetail";
import OnboardingModal from "@/components/turmas/OnboardingModal";
import TourGuide from "@/components/turmas/TourGuide";
import EmptyTurmasState from "@/components/turmas/EmptyTurmasState";
import TurmaFilters from "@/components/turmas/TurmaFilters";
import EpictusIAHelper from "@/components/turmas/EpictusIAHelper";
import DesempenhoView from "@/components/turmas/DesempenhoView";
import GruposEstudoView from "@/components/turmas/minisecao-gruposdeestudo/GruposEstudoView";
import TopicosEstudoView from "@/components/turmas/TopicosEstudoView";
import {
  Atom,
  Calculator,
  Beaker,
  Dna,
  Landmark,
  Globe,
  Video,
  BookOpen,
  FileText,
  Play,
  MessageCircle,
  Rocket,
  Lightbulb,
  FileQuestion,
  Share2,
  UserCircle,
  Sparkles,
  Plus,
  Search as SearchIcon,
  Home,
  GraduationCap,
  FolderKanban,
  Users2,
  Calendar,
  CheckSquare,
  Presentation,
  Scroll,
  Palette,
  Languages,
  BookText,
  Telescope,
  DollarSign,
  Globe2,
  Cpu,
  BarChart,
} from "lucide-react";
import AddTurmaModal from "@/components/turmas/AddTurmaModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

// Sample data for classes
const turmasData = [
  // Turmas Oficiais
  {
    id: "mat",
    nome: "Matemática",
    professor: "Prof. Ricardo Oliveira",
    imagem:
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80",
    progresso: 68,
    proximaAula: {
      titulo: "Aula 7: Funções Trigonométricas",
      data: "18/03",
      hora: "10:00",
      prazoProximo: false,
    },
    status: "Em Andamento",
    novasMensagens: 2,
    disciplina: "Matemática",
    icone: <Calculator className="h-6 w-6 text-[#FF6B00]" />,
    categoria: "oficial",
  },
  {
    id: "port",
    nome: "Língua Portuguesa",
    professor: "Profa. Carla Mendes",
    imagem:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
    progresso: 75,
    proximaAula: {
      titulo: "Aula 8: Literatura Modernista",
      data: "16/03",
      hora: "14:00",
      prazoProximo: false,
    },
    status: "Em Andamento",
    novasMensagens: 0,
    disciplina: "Português",
    icone: <BookText className="h-6 w-6 text-[#FF6B00]" />,
    categoria: "oficial",
  },
  {
    id: "fis",
    nome: "Física",
    professor: "Prof. Carlos Santos",
    imagem:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    progresso: 65,
    proximaAula: {
      titulo: "Aula 5: Termodinâmica",
      data: "18/03",
      hora: "14:00",
      prazoProximo: false,
    },
    status: "Em Andamento",
    novasMensagens: 3,
    disciplina: "Física",
    icone: <Atom className="h-6 w-6 text-[#FF8C40]" />,
    categoria: "oficial",
  },
  {
    id: "quim",
    nome: "Química",
    professor: "Prof. Roberto Alves",
    imagem:
      "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=800&q=80",
    progresso: 90,
    proximaAula: {
      titulo: "Aula 8: Polímeros",
      data: "20/03",
      hora: "16:30",
      prazoProximo: false,
    },
    status: "Em Andamento",
    novasMensagens: 5,
    disciplina: "Química",
    icone: <Beaker className="h-6 w-6 text-[#E85D04]" />,
    categoria: "oficial",
  },
  {
    id: "bio",
    nome: "Biologia",
    professor: "Profa. Mariana Costa",
    imagem:
      "https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=800&q=80",
    progresso: 78,
    proximaAula: {
      titulo: "Aula 6: Genética",
      data: "19/03",
      hora: "13:15",
      prazoProximo: false,
    },
    status: "Em Andamento",
    novasMensagens: 1,
    disciplina: "Biologia",
    icone: <Dna className="h-6 w-6 text-[#DC2F02]" />,
    categoria: "oficial",
  },
  {
    id: "geo",
    nome: "Geografia",
    professor: "Profa. Lúcia Ferreira",
    imagem:
      "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80",
    progresso: 30,
    proximaAula: {
      titulo: "Aula 2: Geopolítica",
      data: "16/03",
      hora: "11:30",
      prazoProximo: false,
    },
    status: "Em Andamento",
    novasMensagens: 2,
    disciplina: "Geografia",
    icone: <Globe className="h-6 w-6 text-[#0077B6]" />,
    categoria: "oficial",
  },
  {
    id: "hist",
    nome: "História",
    professor: "Prof. Paulo Mendes",
    imagem:
      "https://images.unsplash.com/photo-1447069387593-a5de0862481e?w=800&q=80",
    progresso: 55,
    proximaAula: {
      titulo: "Aula 4: Guerra Fria",
      data: "17/03",
      hora: "09:00",
      prazoProximo: false,
    },
    status: "Em Andamento",
    novasMensagens: 0,
    disciplina: "História",
    icone: <Landmark className="h-6 w-6 text-[#9D0208]" />,
    categoria: "oficial",
  },
  {
    id: "filo",
    nome: "Filosofia",
    professor: "Prof. André Martins",
    imagem:
      "https://images.unsplash.com/photo-1544396821-4dd40b938ad3?w=800&q=80",
    progresso: 45,
    proximaAula: {
      titulo: "Aula 3: Filosofia Moderna",
      data: "19/03",
      hora: "10:30",
      prazoProximo: false,
    },
    status: "Em Andamento",
    novasMensagens: 1,
    disciplina: "Filosofia",
    icone: <Scroll className="h-6 w-6 text-[#6D597A]" />,
    categoria: "oficial",
  },
  {
    id: "socio",
    nome: "Sociologia",
    professor: "Profa. Beatriz Lima",
    imagem:
      "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=800&q=80",
    progresso: 60,
    proximaAula: {
      titulo: "Aula 5: Movimentos Sociais",
      data: "21/03",
      hora: "15:45",
      prazoProximo: false,
    },
    status: "Em Andamento",
    novasMensagens: 0,
    disciplina: "Sociologia",
    icone: <Users2 className="h-6 w-6 text-[#457B9D]" />,
    categoria: "oficial",
  },
  {
    id: "arte",
    nome: "Arte",
    professor: "Prof. Fernando Gomes",
    imagem:
      "https://images.unsplash.com/photo-1452802447250-470a88ac82bc?w=800&q=80",
    progresso: 70,
    proximaAula: {
      titulo: "Aula 6: Arte Contemporânea",
      data: "22/03",
      hora: "13:00",
      prazoProximo: false,
    },
    status: "Em Andamento",
    novasMensagens: 2,
    disciplina: "Arte",
    icone: <Palette className="h-6 w-6 text-[#E63946]" />,
    categoria: "oficial",
  },
  {
    id: "ing",
    nome: "Inglês",
    professor: "Prof. John Smith",
    imagem:
      "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=800&q=80",
    progresso: 85,
    proximaAula: {
      titulo: "Aula 7: Business English",
      data: "17/03",
      hora: "16:00",
      prazoProximo: false,
    },
    status: "Em Andamento",
    novasMensagens: 0,
    disciplina: "Inglês",
    icone: <Languages className="h-6 w-6 text-[#118AB2]" />,
    categoria: "oficial",
  },
  {
    id: "etica",
    nome: "Ética",
    professor: "Profa. Camila Rocha",
    imagem:
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80",
    progresso: 50,
    proximaAula: {
      titulo: "Aula 4: Ética Profissional",
      data: "23/03",
      hora: "11:00",
      prazoProximo: false,
    },
    status: "Em Andamento",
    novasMensagens: 1,
    disciplina: "Ética",
    icone: <BookText className="h-6 w-6 text-[#588157]" />,
    categoria: "oficial",
  },

  // Projetos Interdisciplinares
  {
    id: "astro",
    nome: "Astronomia",
    professor: "Prof. Lucas Pereira",
    imagem:
      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80",
    progresso: 40,
    proximaAula: {
      titulo: "Observação: Sistema Solar",
      data: "25/03",
      hora: "20:00",
      prazoProximo: false,
    },
    status: "Em Andamento",
    novasMensagens: 3,
    disciplina: "Interdisciplinar",
    icone: <Telescope className="h-6 w-6 text-[#073B4C]" />,
    categoria: "projeto",
  },
  {
    id: "fin",
    nome: "Educação Financeira",
    professor: "Prof. Marcos Silva",
    imagem:
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",
    progresso: 65,
    proximaAula: {
      titulo: "Workshop: Investimentos",
      data: "24/03",
      hora: "14:30",
      prazoProximo: false,
    },
    status: "Em Andamento",
    novasMensagens: 0,
    disciplina: "Interdisciplinar",
    icone: <DollarSign className="h-6 w-6 text-[#38B000]" />,
    categoria: "projeto",
  },
  {
    id: "onu",
    nome: "Debates ONU",
    professor: "Profa. Helena Castro",
    imagem:
      "https://images.unsplash.com/photo-1526280760714-f9e8b26f318f?w=800&q=80",
    progresso: 55,
    proximaAula: {
      titulo: "Simulação: Conselho de Segurança",
      data: "26/03",
      hora: "15:00",
      prazoProximo: true,
    },
    status: "Em Andamento",
    novasMensagens: 5,
    disciplina: "Interdisciplinar",
    icone: <Globe2 className="h-6 w-6 text-[#3A86FF]" />,
    categoria: "projeto",
  },
  {
    id: "robo",
    nome: "Robótica",
    professor: "Prof. Rafael Moreira",
    imagem:
      "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&q=80",
    progresso: 70,
    proximaAula: {
      titulo: "Prática: Montagem de Robôs",
      data: "27/03",
      hora: "16:30",
      prazoProximo: false,
    },
    status: "Em Andamento",
    novasMensagens: 2,
    disciplina: "Interdisciplinar",
    icone: <Cpu className="h-6 w-6 text-[#FB5607]" />,
    categoria: "projeto",
  },

  // Turmas próprias (criadas pelo usuário)
  {
    id: "7",
    nome: "Grupo de Estudos - Matemática",
    professor: "Você",
    imagem:
      "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&q=80",
    progresso: 25,
    proximaAula: {
      titulo: "Encontro Semanal",
      data: "15/03",
      hora: "18:00",
      prazoProximo: false,
    },
    status: "Em Andamento",
    novasMensagens: 0,
    disciplina: "Matemática",
    icone: <UserCircle className="h-6 w-6 text-[#FF6B00]" />,
    categoria: "propria",
  },
  {
    id: "8",
    nome: "Clube de Leitura Científica",
    professor: "Você",
    imagem:
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80",
    progresso: 40,
    proximaAula: {
      titulo: "Discussão do Livro",
      data: "20/03",
      hora: "19:30",
      prazoProximo: false,
    },
    status: "Em Andamento",
    novasMensagens: 3,
    disciplina: "Interdisciplinar",
    icone: <Sparkles className="h-6 w-6 text-[#FF8C40]" />,
    categoria: "propria",
  },
];

// Sample data for a specific class
const turmaDetalhada = {
  id: "1",
  nome: "Física Quântica",
  professor: {
    nome: "Prof. Carlos Santos",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
    email: "carlos.santos@pontoschool.com",
    especialidade: "Física Teórica",
  },
  imagem:
    "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&q=90",
  progresso: 65,
  status: "Em Andamento",
  descricao:
    "Estudo dos princípios fundamentais da física quântica e suas aplicações no mundo moderno. Abordagem teórica e prática com experimentos virtuais.",
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
          icone: <Video className="h-5 w-5 text-blue-500" />,
        },
        {
          id: "c1-2",
          tipo: "leitura",
          titulo: "Capítulo 1: História da Física Quântica",
          duracao: "45 min",
          data: "03/02/2023",
          status: "concluido",
          icone: <BookOpen className="h-5 w-5 text-purple-500" />,
        },
        {
          id: "c1-3",
          tipo: "exercicio",
          titulo: "Lista de Exercícios 1",
          duracao: "60 min",
          data: "05/02/2023",
          status: "concluido",
          icone: <FileText className="h-5 w-5 text-green-500" />,
        },
        {
          id: "c1-4",
          tipo: "video",
          titulo: "Vídeo: Experimento da Dupla Fenda",
          duracao: "30 min",
          data: "08/02/2023",
          status: "concluido",
          icone: <Play className="h-5 w-5 text-red-500" />,
        },
      ],
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
          icone: <Video className="h-5 w-5 text-blue-500" />,
        },
        {
          id: "c2-2",
          tipo: "leitura",
          titulo: "Capítulo 2: Princípio da Incerteza",
          duracao: "60 min",
          data: "17/02/2023",
          status: "concluido",
          icone: <BookOpen className="h-5 w-5 text-purple-500" />,
        },
        {
          id: "c2-3",
          tipo: "exercicio",
          titulo: "Lista de Exercícios 2",
          duracao: "90 min",
          data: "20/02/2023",
          status: "concluido",
          icone: <FileText className="h-5 w-5 text-green-500" />,
        },
        {
          id: "c2-4",
          tipo: "discussao",
          titulo: "Discussão: Interpretações da Mecânica Quântica",
          duracao: "45 min",
          data: "22/02/2023",
          status: "pendente",
          icone: <MessageCircle className="h-5 w-5 text-amber-500" />,
        },
      ],
    },
    {
      id: "m3",
      titulo: "Módulo 3: Aplicações da Física Quântica",
      descricao:
        "Exploração das aplicações práticas da física quântica no mundo moderno",
      progresso: 30,
      conteudos: [
        {
          id: "c3-1",
          tipo: "aula",
          titulo: "Aula 3: Computação Quântica",
          duracao: "120 min",
          data: "01/03/2023",
          status: "concluido",
          icone: <Video className="h-5 w-5 text-blue-500" />,
        },
        {
          id: "c3-2",
          tipo: "leitura",
          titulo: "Capítulo 3: Criptografia Quântica",
          duracao: "60 min",
          data: "03/03/2023",
          status: "pendente",
          icone: <BookOpen className="h-5 w-5 text-purple-500" />,
        },
        {
          id: "c3-3",
          tipo: "exercicio",
          titulo: "Lista de Exercícios 3",
          duracao: "90 min",
          data: "06/03/2023",
          status: "pendente",
          icone: <FileText className="h-5 w-5 text-green-500" />,
        },
        {
          id: "c3-4",
          tipo: "video",
          titulo: "Vídeo: Futuro da Tecnologia Quântica",
          duracao: "45 min",
          data: "08/03/2023",
          status: "pendente",
          icone: <Play className="h-5 w-5 text-red-500" />,
        },
      ],
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
          icone: <Video className="h-5 w-5 text-blue-500" />,
        },
        {
          id: "c4-2",
          tipo: "leitura",
          titulo: "Capítulo 4: Emaranhamento Quântico",
          duracao: "60 min",
          data: "17/03/2023",
          status: "pendente",
          icone: <BookOpen className="h-5 w-5 text-purple-500" />,
        },
        {
          id: "c4-3",
          tipo: "exercicio",
          titulo: "Lista de Exercícios 4",
          duracao: "90 min",
          data: "20/03/2023",
          status: "pendente",
          icone: <FileText className="h-5 w-5 text-green-500" />,
        },
        {
          id: "c4-4",
          tipo: "projeto",
          titulo: "Projeto Final: Simulação Quântica",
          duracao: "240 min",
          data: "25/03/2023",
          status: "pendente",
          icone: <Rocket className="h-5 w-5 text-indigo-500" />,
        },
      ],
    },
  ],
  recomendacoes: [
    {
      id: "r1",
      titulo: "Revisar o conceito de Dualidade Onda-Partícula",
      tipo: "revisao",
      prioridade: "alta",
      icone: <Lightbulb className="h-5 w-5 text-[#FF6B00]" />,
    },
    {
      id: "r2",
      titulo: "Praticar exercícios sobre Equação de Schrödinger",
      tipo: "exercicio",
      prioridade: "media",
      icone: <FileQuestion className="h-5 w-5 text-[#FF8C40]" />,
    },
    {
      id: "r3",
      titulo: "Assistir vídeo complementar sobre Computação Quântica",
      tipo: "video",
      prioridade: "baixa",
      icone: <Play className="h-5 w-5 text-[#E85D04]" />,
    },
  ],
  pontosFracos: ["Equação de Schrödinger", "Princípio da Incerteza"],
  pontosFortes: [
    "História da Física Quântica",
    "Experimento da Dupla Fenda",
    "Computação Quântica",
  ],
  metasSemanais: [
    {
      id: "m1",
      titulo: "Completar o Módulo 2",
      progresso: 75,
    },
    {
      id: "m2",
      titulo: "Fazer 20 exercícios de Mecânica Quântica",
      progresso: 60,
    },
    {
      id: "m3",
      titulo: "Participar de 3 discussões no fórum",
      progresso: 33,
    },
  ],
  comparativoTurma: {
    participacao: "acima",
    entregaTarefas: "na media",
    desempenhoGeral: "acima",
  },
  colegas: [
    {
      id: "a1",
      nome: "Ana Silva",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
      online: true,
    },
    {
      id: "a2",
      nome: "Pedro Oliveira",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro",
      online: false,
    },
    {
      id: "a3",
      nome: "Mariana Santos",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mariana",
      online: true,
    },
    {
      id: "a4",
      nome: "João Costa",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao",
      online: false,
    },
    {
      id: "a5",
      nome: "Carla Mendes",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carla",
      online: true,
    },
  ],
  forumTopicos: [
    {
      id: "t1",
      titulo: "Dúvida sobre o Princípio da Incerteza",
      autor: "Ana Silva",
      data: "10/02/2023",
      respostas: 5,
      visualizacoes: 28,
      fixado: true,
    },
    {
      id: "t2",
      titulo: "Material complementar sobre Computação Quântica",
      autor: "Prof. Carlos Santos",
      data: "01/03/2023",
      respostas: 3,
      visualizacoes: 42,
      fixado: true,
    },
    {
      id: "t3",
      titulo: "Dificuldade com os exercícios da Lista 2",
      autor: "Pedro Oliveira",
      data: "22/02/2023",
      respostas: 8,
      visualizacoes: 35,
      fixado: false,
    },
    {
      id: "t4",
      titulo: "Grupo de estudo para o projeto final",
      autor: "Mariana Santos",
      data: "05/03/2023",
      respostas: 12,
      visualizacoes: 40,
      fixado: false,
    },
    {
      id: "t5",
      titulo: "Artigo interessante sobre Emaranhamento Quântico",
      autor: "João Costa",
      data: "08/03/2023",
      respostas: 2,
      visualizacoes: 15,
      fixado: false,
    },
  ],
  eventos: [
    {
      id: "e1",
      titulo: "Aula 4: Teoria Quântica de Campos",
      data: "15/03/2023",
      hora: "14:00 - 16:00",
      tipo: "aula",
      local: "Sala Virtual 3",
    },
    {
      id: "e2",
      titulo: "Entrega da Lista de Exercícios 3",
      data: "20/03/2023",
      hora: "23:59",
      tipo: "tarefa",
      local: "Plataforma",
    },
    {
      id: "e3",
      titulo: "Discussão: Interpretações da Mecânica Quântica",
      data: "22/03/2023",
      hora: "15:00 - 16:00",
      tipo: "discussao",
      local: "Fórum da Turma",
    },
    {
      id: "e4",
      titulo: "Prova Parcial",
      data: "30/03/2023",
      hora: "14:00 - 16:00",
      tipo: "avaliacao",
      local: "Sala Virtual 3",
    },
  ],
  notas: [
    {
      id: "n1",
      avaliacao: "Lista de Exercícios 1",
      nota: 9.5,
      peso: 10,
      data: "10/02/2023",
    },
    {
      id: "n2",
      avaliacao: "Participação nas Discussões - Módulo 1",
      nota: 8.0,
      peso: 5,
      data: "14/02/2023",
    },
    {
      id: "n3",
      avaliacao: "Lista de Exercícios 2",
      nota: 7.5,
      peso: 10,
      data: "25/02/2023",
    },
    {
      id: "n4",
      avaliacao: "Participação nas Discussões - Módulo 2",
      nota: 9.0,
      peso: 5,
      data: "28/02/2023",
    },
    {
      id: "n5",
      avaliacao: "Prova Parcial",
      nota: null,
      peso: 30,
      data: "30/03/2023",
    },
  ],
  gruposEstudo: [
    {
      id: "g1",
      nome: "Grupo de Mecânica Quântica",
      membros: ["Ana Silva", "Pedro Oliveira", "Você"],
      proximaReuniao: "16/03/2023, 18:00",
    },
    {
      id: "g2",
      nome: "Preparação para o Projeto Final",
      membros: ["Mariana Santos", "João Costa", "Carla Mendes", "Você"],
      proximaReuniao: "23/03/2023, 19:00",
    },
  ],
};

export default function TurmasPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTurmas, setFilteredTurmas] = useState(turmasData);
  const [selectedTurma, setSelectedTurma] = useState<string | null>(null);
  const searchParams = new URLSearchParams(location.search);
  const currentView = searchParams.get("view") || "todas";
  const currentAction = searchParams.get("action");
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showTour, setShowTour] = useState(false);
  const [favoritos, setFavoritos] = useState<string[]>(["mat", "fis"]);
  const [activeFilters, setActiveFilters] = useState<any>({});

  // Filter classes based on search query, view, and active filters
  useEffect(() => {
    let filtered = turmasData;

    // Filter by view/category
    if (currentView === "proprias") {
      filtered = filtered.filter((turma) => turma.categoria === "propria");
    } else if (currentView === "oficiais") {
      filtered = filtered.filter((turma) => turma.categoria === "oficial");
    } else if (currentView === "projetos") {
      filtered = filtered.filter((turma) => turma.categoria === "projeto");
    } else if (currentView === "grupos") {
      filtered = filtered.filter((turma) => turma.categoria === "propria");
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (turma) =>
          turma.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
          turma.professor.toLowerCase().includes(searchQuery.toLowerCase()) ||
          turma.disciplina.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Apply additional filters
    if (activeFilters.professores && activeFilters.professores.length > 0) {
      // This is a simplified example - in a real app, you'd have professor IDs
      filtered = filtered.filter((turma) =>
        activeFilters.professores.some((prof: string) =>
          turma.professor.includes(prof),
        ),
      );
    }

    if (activeFilters.disciplinas && activeFilters.disciplinas.length > 0) {
      filtered = filtered.filter((turma) =>
        activeFilters.disciplinas.includes(turma.id),
      );
    }

    if (activeFilters.favoritos) {
      filtered = filtered.filter((turma) => favoritos.includes(turma.id));
    }

    // Sort by progress if needed
    if (activeFilters.progressoSort) {
      filtered = [...filtered].sort((a, b) => {
        if (activeFilters.progressoSort === "desc") {
          return b.progresso - a.progresso;
        } else {
          return a.progresso - b.progresso;
        }
      });
    }

    // Add isFavorite property to each turma
    filtered = filtered.map((turma) => ({
      ...turma,
      isFavorite: favoritos.includes(turma.id),
      notificacoes: {
        mensagens: turma.novasMensagens,
        tarefas: Math.floor(Math.random() * 3), // Simulated data
        materiais: Math.floor(Math.random() * 2), // Simulated data
      },
    }));

    setFilteredTurmas(filtered);
  }, [searchQuery, currentView, activeFilters, favoritos]);

  // Check if onboarding should be shown
  useEffect(() => {
    const hideOnboarding = localStorage.getItem("hideMinhasTurmasOnboarding");
    if (hideOnboarding === "true") {
      setShowOnboarding(false);
    }
  }, []);

  const handleTurmaSelect = (turmaId: string) => {
    // Find the selected turma
    const selectedTurmaData = turmasData.find((turma) => turma.id === turmaId);

    // In a real app, you would fetch the detailed data for this specific turma
    // For now, we'll just set the ID and let the detail component handle it
    setSelectedTurma(turmaId);
  };

  const handleBackToList = () => {
    setSelectedTurma(null);
  };

  const handleViewForum = (e: React.MouseEvent, turmaId: string) => {
    e.stopPropagation();
    // In a real app, this would navigate to the forum view
    console.log(`View forum for turma ${turmaId}`);
  };

  const handleToggleFavorite = (turmaId: string) => {
    setFavoritos((prev) =>
      prev.includes(turmaId)
        ? prev.filter((id) => id !== turmaId)
        : [...prev, turmaId],
    );
  };

  const handleFilterChange = (filters: any) => {
    setActiveFilters(filters);
  };

  const [showAddTurmaModal, setShowAddTurmaModal] = useState(false);

  const handleAddTurma = () => {
    setShowAddTurmaModal(true);
  };

  const handleAddTurmaSubmit = (code: string) => {
    // In a real app, this would add the turma with the given code
    console.log(`Adding turma with code: ${code}`);
    // For demo purposes, let's just show a notification or redirect
    setShowAddTurmaModal(false);
  };

  const handleStartTour = () => {
    setShowOnboarding(false);
    setShowTour(true);
  };

  const handleCompleteTour = () => {
    setShowTour(false);
  };

  const handleSkipTour = () => {
    setShowTour(false);
  };

  const handleExplore = () => {
    // In a real app, this would navigate to a page with available classes
    console.log("Explore turmas");
  };

  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] p-6 space-y-6 transition-colors duration-300">
      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onStartTour={handleStartTour}
      />

      {/* Tour Guide */}
      {showTour && (
        <TourGuide
          isActive={showTour}
          onComplete={handleCompleteTour}
          onSkip={handleSkipTour}
        />
      )}

      {/* Add Turma Modal */}
      <AddTurmaModal
        isOpen={showAddTurmaModal || currentAction === "add"}
        onClose={() => {
          setShowAddTurmaModal(false);
          if (currentAction === "add") {
            navigate("/turmas");
          }
        }}
        onAddTurma={handleAddTurmaSubmit}
      />

      {/* Header */}
      <div className="turmas-header">
        <TurmasHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onAddTurma={handleAddTurma}
        />
      </div>

      {/* Main Content */}
      {selectedTurma ? (
        <TurmaDetail
          turmaDetalhada={turmaDetalhada}
          onBack={handleBackToList}
        />
      ) : (
        <>
          <div className="flex items-center justify-end mb-4">
            <div className="flex items-center gap-2 epictus-ia-helper">
              <EpictusIAHelper
                context="turmas"
                suggestions={[
                  "Como posso melhorar meu desempenho nas turmas?",
                  "Quais materiais complementares você recomenda?",
                  "Ajude-me a criar um plano de estudos para esta disciplina",
                  "Quais são os tópicos mais importantes desta matéria?",
                ]}
              />
            </div>
          </div>

          <div className="space-y-6">
            {/* Category Tabs */}
            <Tabs value={currentView} className="w-full">
              <TabsList className="turmas-tabs w-full max-w-4xl mx-auto bg-white dark:bg-[#1E293B] p-1.5 rounded-xl shadow-md border border-[#FF6B00]/10 dark:border-[#FF6B00]/20 flex justify-between animate-gradient-x hidden">
                <motion.div className="contents" layout>
                  <TabsTrigger
                    value="todas"
                    onClick={() => navigate("/turmas?view=todas")}
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00]/10 data-[state=active]:to-[#FF8C40]/10 data-[state=active]:text-[#FF6B00] data-[state=active]:border-[#FF6B00] border rounded-lg px-4 py-2 font-montserrat flex items-center gap-2 transition-all duration-300 hover:shadow-md data-[state=active]:shadow-md transform hover:scale-[1.02] data-[state=active]:scale-[1.02]"
                  >
                    <Home className="h-4 w-4" /> Todas
                  </TabsTrigger>
                  <TabsTrigger
                    value="oficiais"
                    onClick={() => navigate("/turmas?view=oficiais")}
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00]/10 data-[state=active]:to-[#FF8C40]/10 data-[state=active]:text-[#FF6B00] data-[state=active]:border-[#FF6B00] border rounded-lg px-4 py-2 font-montserrat flex items-center gap-2 transition-all duration-300 hover:shadow-md data-[state=active]:shadow-md transform hover:scale-[1.02] data-[state=active]:scale-[1.02]"
                  >
                    <GraduationCap className="h-4 w-4" /> Turmas Oficiais
                  </TabsTrigger>
                  <TabsTrigger
                    value="proprias"
                    onClick={() => navigate("/turmas?view=proprias")}
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00]/10 data-[state=active]:to-[#FF8C40]/10 data-[state=active]:text-[#FF6B00] data-[state=active]:border-[#FF6B00] border rounded-lg px-4 py-2 font-montserrat flex items-center gap-2 transition-all duration-300 hover:shadow-md data-[state=active]:shadow-md transform hover:scale-[1.02] data-[state=active]:scale-[1.02]"
                  >
                    <FolderKanban className="h-4 w-4" /> Minhas Turmas
                  </TabsTrigger>
                  <TabsTrigger
                    value="grupos-estudo"
                    onClick={() => navigate("/turmas?view=grupos-estudo")}
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00]/10 data-[state=active]:to-[#FF8C40]/10 data-[state=active]:text-[#FF6B00] data-[state=active]:border-[#FF6B00] border rounded-lg px-4 py-2 font-montserrat flex items-center gap-2 transition-all duration-300 hover:shadow-md data-[state=active]:shadow-md transform hover:scale-[1.02] data-[state=active]:scale-[1.02]"
                  >
                    <Users2 className="h-4 w-4" /> Grupos de Estudo
                  </TabsTrigger>
                  <TabsTrigger
                    value="desempenho"
                    onClick={() => navigate("/turmas?view=desempenho")}
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FF6B00]/10 data-[state=active]:to-[#FF8C40]/10 data-[state=active]:text-[#FF6B00] data-[state=active]:border-[#FF6B00] border rounded-lg px-4 py-2 font-montserrat flex items-center gap-2 transition-all duration-300 hover:shadow-md data-[state=active]:shadow-md transform hover:scale-[1.02] data-[state=active]:scale-[1.02]"
                  >
                    <BarChart className="h-4 w-4" /> Desempenho
                  </TabsTrigger>
                </motion.div>
              </TabsList>

              {/* Tab Content */}
              <TabsContent value="todas" className="mt-6">
                <div className="mb-4 turmas-filters">
                  <TurmaFilters
                    professores={[
                      { id: "prof1", nome: "Prof. Ricardo Oliveira" },
                      { id: "prof2", nome: "Profa. Carla Mendes" },
                      { id: "prof3", nome: "Prof. Carlos Santos" },
                      { id: "prof4", nome: "Prof. Roberto Alves" },
                      { id: "prof5", nome: "Profa. Mariana Costa" },
                    ]}
                    disciplinas={[
                      { id: "mat", nome: "Matemática" },
                      { id: "port", nome: "Língua Portuguesa" },
                      { id: "fis", nome: "Física" },
                      { id: "quim", nome: "Química" },
                      { id: "bio", nome: "Biologia" },
                    ]}
                    onFilterChange={handleFilterChange}
                    favoritos={favoritos}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 turmas-grid">
                  {filteredTurmas.map((turma) => (
                    <TurmaCard
                      key={turma.id}
                      turma={turma}
                      onClick={handleTurmaSelect}
                      onViewForum={handleViewForum}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="oficiais" className="mt-6">
                <div className="mb-4 flex justify-between items-center">
                  <TurmaFilters
                    professores={[
                      { id: "prof1", nome: "Prof. Ricardo Oliveira" },
                      { id: "prof2", nome: "Profa. Carla Mendes" },
                      { id: "prof3", nome: "Prof. Carlos Santos" },
                      { id: "prof4", nome: "Prof. Roberto Alves" },
                      { id: "prof5", nome: "Profa. Mariana Costa" },
                    ]}
                    disciplinas={[
                      { id: "mat", nome: "Matemática" },
                      { id: "port", nome: "Língua Portuguesa" },
                      { id: "fis", nome: "Física" },
                      { id: "quim", nome: "Química" },
                      { id: "bio", nome: "Biologia" },
                    ]}
                    onFilterChange={handleFilterChange}
                    favoritos={favoritos}
                  />
                  <EpictusIAHelper context="turmas oficiais" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 turmas-grid">
                  {filteredTurmas
                    .filter((turma) => turma.categoria === "oficial")
                    .map((turma) => (
                      <TurmaCard
                        key={turma.id}
                        turma={turma}
                        onClick={handleTurmaSelect}
                        onViewForum={handleViewForum}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="proprias" className="mt-6">
                <div className="mb-4 flex justify-end">
                  <EpictusIAHelper context="minhas turmas" />
                </div>
                <div className="text-center py-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center justify-center"
                  >
                    <div className="w-24 h-24 rounded-full bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 flex items-center justify-center mb-6 animate-pulse-custom">
                      <FolderKanban className="h-12 w-12 text-[#FF6B00]" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-white mb-3 font-montserrat animate-highlight">
                      Você ainda não criou nenhuma turma própria
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8 font-open-sans">
                      Crie sua primeira turma personalizada e comece a
                      compartilhar conhecimento com outros estudantes.
                    </p>
                    <Button
                      className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white px-6 py-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02] font-montserrat font-semibold text-lg animate-gradient-x"
                      onClick={() => navigate("/turmas/criar-turma")}
                    >
                      <Plus className="h-5 w-5 mr-2" /> Criar Minha Primeira
                      Turma
                    </Button>
                  </motion.div>
                </div>
              </TabsContent>



              <TabsContent value="desempenho" className="mt-6">
                <DesempenhoView />
              </TabsContent>
              <TabsContent value="grupos-estudo" className="mt-6">
                <GruposEstudoView className="mb-8" />
                <TopicosEstudoView className="mb-8" />
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}
    </div>
  );
}

// Esta é uma função local apenas para fallback
function GruposEstudoPlaceholder() {
  return (
    <div>
      {/* Implement Grupos de Estudo view here */}
      <p>Grupos de Estudo view</p>
    </div>
  );
}