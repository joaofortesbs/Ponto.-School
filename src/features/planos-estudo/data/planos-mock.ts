import { ReactNode } from "react";

export interface Materia {
  nome: string;
  progresso: number;
  cor: string;
}

export interface Tarefa {
  id: string;
  nome: string;
  materia: string;
  data: string;
  concluida: boolean;
  prioridade: "alta" | "média" | "baixa";
}

export interface Meta {
  id: string;
  nome: string;
  progresso: number;
}

export interface Plano {
  id: string;
  nome: string;
  descricao: string;
  progresso: number;
  dataInicio: string;
  dataFim: string;
  materias: Materia[];
  tarefas: Tarefa[];
  metas: Meta[];
  tipo: "personalizado" | "curso" | "idioma";
  icone?: ReactNode;
}

const planosMock: Plano[] = [
  {
    id: "plano1",
    nome: "Preparação ENEM 2024",
    descricao:
      "Plano intensivo para o ENEM com foco em ciências da natureza e matemática",
    progresso: 68,
    dataInicio: "15/03/2024",
    dataFim: "10/11/2024",
    materias: [
      { nome: "Matemática", progresso: 75, cor: "#4C6EF5" },
      { nome: "Física", progresso: 62, cor: "#FF6B00" },
      { nome: "Química", progresso: 58, cor: "#12B76A" },
      { nome: "Biologia", progresso: 72, cor: "#F59E0B" },
    ],
    tarefas: [
      {
        id: "t1",
        nome: "Resolver exercícios de Cinemática",
        materia: "Física",
        data: "Hoje, 14:00",
        concluida: false,
        prioridade: "alta",
      },
      {
        id: "t2",
        nome: "Estudar Funções Exponenciais",
        materia: "Matemática",
        data: "Hoje, 16:30",
        concluida: false,
        prioridade: "média",
      },
      {
        id: "t3",
        nome: "Revisar Tabela Periódica",
        materia: "Química",
        data: "Amanhã, 10:00",
        concluida: false,
        prioridade: "baixa",
      },
      {
        id: "t4",
        nome: "Estudar Genética",
        materia: "Biologia",
        data: "25/06/2024",
        concluida: true,
        prioridade: "média",
      },
    ],
    metas: [
      {
        id: "m1",
        nome: "Completar 500 exercícios de matemática",
        progresso: 65,
      },
      {
        id: "m2",
        nome: "Ler 10 livros de literatura obrigatória",
        progresso: 40,
      },
      { id: "m3", nome: "Fazer 20 redações modelo ENEM", progresso: 35 },
    ],
    tipo: "personalizado",
  },
  {
    id: "plano2",
    nome: "Curso de Programação Web",
    descricao: "Desenvolvimento full-stack com React, Node.js e MongoDB",
    progresso: 42,
    dataInicio: "01/05/2024",
    dataFim: "30/08/2024",
    materias: [
      { nome: "HTML/CSS", progresso: 90, cor: "#E11D48" },
      { nome: "JavaScript", progresso: 75, cor: "#FBBF24" },
      { nome: "React", progresso: 45, cor: "#38BDF8" },
      { nome: "Node.js", progresso: 30, cor: "#22C55E" },
      { nome: "MongoDB", progresso: 15, cor: "#8B5CF6" },
    ],
    tarefas: [
      {
        id: "t5",
        nome: "Criar componente de navegação",
        materia: "React",
        data: "Hoje, 19:00",
        concluida: false,
        prioridade: "alta",
      },
      {
        id: "t6",
        nome: "Implementar autenticação JWT",
        materia: "Node.js",
        data: "Amanhã, 14:00",
        concluida: false,
        prioridade: "alta",
      },
      {
        id: "t7",
        nome: "Estilizar página de perfil",
        materia: "HTML/CSS",
        data: "26/06/2024",
        concluida: false,
        prioridade: "média",
      },
    ],
    metas: [
      { id: "m4", nome: "Desenvolver 3 projetos completos", progresso: 33 },
      {
        id: "m5",
        nome: "Contribuir em 2 projetos open-source",
        progresso: 0,
      },
    ],
    tipo: "curso",
  },
  {
    id: "plano3",
    nome: "Inglês Avançado",
    descricao: "Preparação para certificação de proficiência em inglês",
    progresso: 85,
    dataInicio: "10/01/2024",
    dataFim: "30/06/2024",
    materias: [
      { nome: "Gramática", progresso: 92, cor: "#8B5CF6" },
      { nome: "Vocabulário", progresso: 88, cor: "#EC4899" },
      { nome: "Conversação", progresso: 75, cor: "#14B8A6" },
      { nome: "Escrita", progresso: 82, cor: "#F59E0B" },
    ],
    tarefas: [
      {
        id: "t8",
        nome: "Praticar phrasal verbs",
        materia: "Vocabulário",
        data: "Hoje, 20:00",
        concluida: false,
        prioridade: "média",
      },
      {
        id: "t9",
        nome: "Escrever redação argumentativa",
        materia: "Escrita",
        data: "27/06/2024",
        concluida: false,
        prioridade: "alta",
      },
    ],
    metas: [
      { id: "m6", nome: "Ler 5 livros em inglês", progresso: 100 },
      { id: "m7", nome: "Assistir 20 palestras em inglês", progresso: 85 },
      { id: "m8", nome: "Praticar conversação 3x por semana", progresso: 75 },
    ],
    tipo: "idioma",
  },
];

export default planosMock;
