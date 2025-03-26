export const members = [
  {
    id: 1,
    name: "Ana Pereira",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
    role: "Membro",
    isOnline: true,
    lastActive: "Agora",
  },
  {
    id: 2,
    name: "Pedro Costa",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro",
    role: "Membro",
    isOnline: true,
    lastActive: "Agora",
  },
  {
    id: 3,
    name: "Você",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Voce",
    role: "Membro",
    isOnline: true,
    lastActive: "Agora",
  },
  {
    id: 4,
    name: "Mariana Santos",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mariana",
    role: "Administrador",
    isOnline: false,
    lastActive: "Há 2 horas",
  },
  {
    id: 5,
    name: "João Silva",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao",
    role: "Membro",
    isOnline: false,
    lastActive: "Há 5 horas",
  },
  {
    id: 6,
    name: "Carla Mendes",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carla",
    role: "Membro",
    isOnline: false,
    lastActive: "Ontem",
  },
];

export const files = [
  {
    id: 1,
    name: "exemplos_derivadas.pdf",
    type: "pdf",
    size: "2.4 MB",
    uploadedBy: "Ana Pereira",
    uploadedAt: "Hoje, 17:03",
  },
  {
    id: 2,
    name: "resumo_calculo_avancado.docx",
    type: "doc",
    size: "1.8 MB",
    uploadedBy: "Mariana Santos",
    uploadedAt: "Ontem, 14:30",
  },
  {
    id: 3,
    name: "exercicios_resolvidos.pdf",
    type: "pdf",
    size: "3.5 MB",
    uploadedBy: "Pedro Costa",
    uploadedAt: "15/03, 10:15",
  },
  {
    id: 4,
    name: "cronograma_estudos.xlsx",
    type: "excel",
    size: "0.9 MB",
    uploadedBy: "João Silva",
    uploadedAt: "12/03, 09:45",
  },
];

export const events = [
  {
    id: 1,
    title: "Monitoria de Cálculo",
    date: "Hoje",
    time: "18:30 - 20:00",
    location: "Sala 305 - Bloco B",
    description: "Monitoria para tirar dúvidas sobre derivadas e integrais.",
    participants: [1, 2, 3, 5],
  },
  {
    id: 2,
    title: "Estudo em grupo para prova",
    date: "18/03",
    time: "14:00 - 17:00",
    location: "Biblioteca Central",
    description: "Preparação para a prova de Cálculo Avançado.",
    participants: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 3,
    title: "Apresentação de trabalho",
    date: "25/03",
    time: "10:30 - 12:00",
    location: "Sala 201 - Bloco A",
    description: "Apresentação do trabalho sobre aplicações de derivadas.",
    participants: [2, 3, 4],
  },
];

export const topics = [
  {
    id: 1,
    title: "Equação de Schrödinger",
    resources: 5,
  },
  {
    id: 2,
    title: "Dualidade Onda-Partícula",
    resources: 3,
  },
  {
    id: 3,
    title: "Princípio da Incerteza",
    resources: 4,
  },
  {
    id: 4,
    title: "Computação Quântica",
    resources: 6,
  },
];

export const tools = [
  {
    id: 1,
    name: "Quadro Branco",
    description: "Ferramenta colaborativa para o brainstorming de ideias",
    icon: "whiteboard",
    color: "green",
  },
  {
    id: 2,
    name: "Editor De Código",
    description: "Ambiente para escrever e compartilhar código",
    icon: "code",
    color: "blue",
  },
  {
    id: 3,
    name: "Editor De Fórmulas",
    description: "Ferramenta para escrever equações matemáticas",
    icon: "formula",
    color: "purple",
  },
];
