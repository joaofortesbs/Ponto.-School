import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  Users,
  Calendar,
  MessageCircle,
  FileText,
  Settings,
  Filter,
  ChevronRight,
  Sparkles,
  UserPlus,
  Clock,
  Bell,
  Brain,
  Star,
  BookOpen,
  Video,
  Zap,
  ArrowRight,
} from "lucide-react";

// Sample data for study groups
const studyGroups = [
  {
    id: "g1",
    name: "Matemática",
    members: [
      {
        id: "m1",
        name: "Ana Silva",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
        online: true,
      },
      {
        id: "m2",
        name: "Pedro Oliveira",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro",
        online: false,
      },
      {
        id: "m3",
        name: "Você",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
        online: true,
      },
    ],
    nextMeeting: "16/03, 18:00",
    course: "Física Quântica",
    description:
      "Grupo dedicado ao estudo de Matemática, com foco na preparação para o projeto final da disciplina.",
    hasNewMessages: true,
    lastActivity: "Hoje, 14:30",
    image:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    upcomingEvents: [
      {
        id: "e1",
        title: "Discussão sobre Equação de Schrödinger",
        date: "16/03",
        time: "18:00",
      },
      {
        id: "e2",
        title: "Revisão para a prova parcial",
        date: "23/03",
        time: "19:00",
      },
    ],
    resources: [
      {
        id: "r1",
        title: "Resumo: Princípios da Mecânica Quântica",
        type: "pdf",
      },
      { id: "r2", title: "Lista de exercícios resolvidos", type: "pdf" },
      { id: "r3", title: "Vídeo: Experimento da Dupla Fenda", type: "video" },
    ],
  },
  {
    id: "g2",
    name: "Preparação para o Projeto Final",
    members: [
      {
        id: "m4",
        name: "Mariana Santos",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mariana",
        online: true,
      },
      {
        id: "m5",
        name: "João Costa",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao",
        online: false,
      },
      {
        id: "m6",
        name: "Carla Mendes",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carla",
        online: true,
      },
      {
        id: "m7",
        name: "Você",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
        online: true,
      },
    ],
    nextMeeting: "23/03, 19:00",
    course: "Física Quântica",
    description:
      "Grupo focado na preparação e desenvolvimento do projeto final da disciplina de Física Quântica.",
    hasNewMessages: true,
    lastActivity: "Ontem, 20:15",
    image:
      "https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?w=800&q=80",
    upcomingEvents: [
      {
        id: "e3",
        title: "Definição dos tópicos do projeto",
        date: "23/03",
        time: "19:00",
      },
      { id: "e4", title: "Divisão de tarefas", date: "30/03", time: "19:00" },
    ],
    resources: [
      { id: "r4", title: "Template do projeto final", type: "doc" },
      { id: "r5", title: "Exemplos de projetos anteriores", type: "folder" },
      { id: "r6", title: "Guia de formatação", type: "pdf" },
    ],
  },
  {
    id: "g3",
    name: "Grupo de Cálculo Avançado",
    members: [
      {
        id: "m8",
        name: "Roberto Alves",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto",
        online: false,
      },
      {
        id: "m9",
        name: "Luiza Ferreira",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Luiza",
        online: true,
      },
      {
        id: "m10",
        name: "Você",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
        online: true,
      },
    ],
    nextMeeting: "18/03, 17:30",
    course: "Cálculo Avançado",
    description:
      "Grupo para estudo e resolução de exercícios de Cálculo Avançado, com foco em integrais múltiplas e aplicações.",
    hasNewMessages: false,
    lastActivity: "3 dias atrás",
    image:
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80",
    upcomingEvents: [
      {
        id: "e5",
        title: "Resolução de exercícios",
        date: "18/03",
        time: "17:30",
      },
    ],
    resources: [
      {
        id: "r7",
        title: "Lista de exercícios - Integrais Múltiplas",
        type: "pdf",
      },
      { id: "r8", title: "Resumo: Teorema de Green", type: "pdf" },
    ],
  },
];

// Sample data for recommended groups
const recommendedGroups = [
  {
    id: "rg1",
    name: "Grupo de Química Orgânica",
    members: 8,
    course: "Química Orgânica",
    description:
      "Grupo para discussão e resolução de exercícios de Química Orgânica, com foco em reações e mecanismos.",
    matchScore: 95,
    image:
      "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=800&q=80",
    topics: ["Reações Orgânicas", "Mecanismos de Reação", "Estereoquímica"],
  },
  {
    id: "rg2",
    name: "Biologia Molecular Avançada",
    members: 5,
    course: "Biologia Molecular",
    description:
      "Grupo dedicado ao estudo aprofundado de Biologia Molecular, com discussões sobre técnicas e aplicações modernas.",
    matchScore: 87,
    image:
      "https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=800&q=80",
    topics: ["DNA Recombinante", "PCR", "Sequenciamento"],
  },
  {
    id: "rg3",
    name: "Grupo de Estudos de História Contemporânea",
    members: 12,
    course: "História Contemporânea",
    description:
      "Grupo para discussão e análise de eventos históricos contemporâneos e suas implicações no mundo atual.",
    matchScore: 82,
    image:
      "https://images.unsplash.com/photo-1447069387593-a5de0862481e?w=800&q=80",
    topics: ["Guerra Fria", "Globalização", "Conflitos Modernos"],
  },
  {
    id: "rg4",
    name: "Geografia Mundial e Geopolítica",
    members: 7,
    course: "Geografia Mundial",
    description:
      "Grupo focado em discussões sobre geografia política mundial e relações internacionais contemporâneas.",
    matchScore: 78,
    image:
      "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80",
    topics: ["Geopolítica", "Recursos Naturais", "Conflitos Territoriais"],
  },
];

// Sample data for popular groups
const popularGroups = [
  {
    id: "pg1",
    name: "Programação em Python",
    members: 32,
    course: "Introdução à Programação",
    activity: "Alta",
    image:
      "https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?w=800&q=80",
  },
  {
    id: "pg2",
    name: "Inteligência Artificial e Machine Learning",
    members: 28,
    course: "Ciência da Computação",
    activity: "Alta",
    image:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80",
  },
  {
    id: "pg3",
    name: "Anatomia Humana",
    members: 24,
    course: "Medicina",
    activity: "Média",
    image:
      "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&q=80",
  },
];

// Sample data for recent activities
const recentActivities = [
  {
    id: "a1",
    groupId: "g1",
    groupName: "Matemática",
    type: "message",
    user: "Ana Silva",
    content:
      "Compartilhou um novo material: 'Resumo sobre Dualidade Onda-Partícula'",
    time: "Hoje, 14:30",
  },
  {
    id: "a2",
    groupId: "g2",
    groupName: "Preparação para o Projeto Final",
    type: "event",
    user: "Sistema",
    content:
      "Novo evento agendado: 'Definição dos tópicos do projeto' para 23/03 às 19:00",
    time: "Ontem, 20:15",
  },
  {
    id: "a3",
    groupId: "g1",
    groupName: "Matemática",
    type: "member",
    user: "Sistema",
    content: "Pedro Oliveira entrou no grupo",
    time: "2 dias atrás",
  },
  {
    id: "a4",
    groupId: "g3",
    groupName: "Grupo de Cálculo Avançado",
    type: "file",
    user: "Roberto Alves",
    content:
      "Adicionou um novo arquivo: 'Lista de exercícios - Integrais Múltiplas'",
    time: "3 dias atrás",
  },
];

export default function GruposEstudo2() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("meus-grupos");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  // Filter groups based on search query
  const filteredGroups = studyGroups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.course.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Filter recommended groups based on search query
  const filteredRecommended = recommendedGroups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.course.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Handle group selection
  const handleGroupSelect = (groupId: string) => {
    setSelectedGroup(groupId);
  };

  // Handle back to groups list
  const handleBackToList = () => {
    setSelectedGroup(null);
  };

  // Get selected group details
  const selectedGroupDetails = studyGroups.find(
    (group) => group.id === selectedGroup,
  );

  // Função para acessar um grupo específico
  const accessGroup = async (groupId: string) => {
    try {
      console.log(`Acessando grupo ${groupId}...`);

      // Ocultar o cabeçalho "Minhas Turmas"
      const header = document.querySelector('.groups-header');
      if (header) {
        (header as HTMLElement).style.display = 'none';
        console.log('Cabeçalho "Minhas Turmas" ocultado.');
      }

      // Placeholder URLs para banner e imagem do grupo (a serem configurados no modal de configurações)
      const bannerUrl = 'https://via.placeholder.com/800x200/FF6B00/ffffff?text=Banner+do+Grupo';
      const groupImageUrl = 'https://via.placeholder.com/80x80/0A2540/ffffff?text=GE';

      // Cache para nomes e imagens de perfil dos usuários
      const userCache = new Map();

      // Criar interface do grupo
      const groupInterface = document.createElement('div');
      groupInterface.id = 'group-interface';
      groupInterface.className = 'group-interface-container';
      groupInterface.style.cssText = `
        margin-left: 250px; 
        padding: 20px; 
        min-height: 100vh;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      `;

      groupInterface.innerHTML = `
        <div style="position: relative; margin-bottom: 20px;">
          <!-- Banner do Grupo -->
          <div style="position: relative; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <img src="${bannerUrl}" alt="Capa do Grupo" 
                 style="width: 100%; height: 200px; object-fit: cover; display: block;">
            <div style="position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 100%);"></div>

            <!-- Imagem circular do grupo -->
            <div style="position: absolute; bottom: -20px; left: 20px; z-index: 10;">
              <img src="${groupImageUrl}" alt="Imagem do Grupo" 
                   style="width: 80px; height: 80px; border-radius: 50%; border: 4px solid #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            </div>

            <!-- Botão de voltar -->
            <button id="back-to-groups" style="
              position: absolute; 
              top: 15px; 
              left: 15px; 
              background: rgba(255,255,255,0.9); 
              border: none; 
              border-radius: 8px; 
              padding: 8px 12px; 
              cursor: pointer; 
              display: flex; 
              align-items: center; 
              gap: 5px;
              font-weight: 500;
              color: #333;
              transition: all 0.2s ease;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            " onmouseover="this.style.background='rgba(255,255,255,1)'" onmouseout="this.style.background='rgba(255,255,255,0.9)'">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 12H5"></path>
                <path d="M12 19l-7-7 7-7"></path>
              </svg>
              Voltar
            </button>
          </div>

          <!-- Título e descrição do grupo -->
          <div style="margin-top: 30px; padding-left: 20px;">
            <h1 style="
              font-size: 2rem; 
              font-weight: 700; 
              color: #2d3748; 
              margin: 0 0 8px 0;
              text-shadow: 0 1px 3px rgba(0,0,0,0.1);
            ">Nome do Grupo</h1>
            <p style="color: #718096; font-size: 1.1rem; margin: 0; line-height: 1.5;">Descrição do grupo.</p>
          </div>
        </div>

        <!-- Navegação das seções -->
        <div style="
          background: white; 
          border-radius: 12px; 
          padding: 16px 20px; 
          margin-bottom: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
          display: flex; 
          justify-content: space-between; 
          align-items: center;
        ">
          <div class="mini-sections" style="display: flex; gap: 8px;">
            <button class="section-btn active" data-section="discussions" style="
              background: #FF6B00; 
              color: white; 
              border: none; 
              padding: 8px 16px; 
              border-radius: 8px; 
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s ease;
            ">Discussões</button>
            <button class="section-btn" data-section="tasks" disabled style="
              background: #e2e8f0; 
              color: #a0aec0; 
              border: none; 
              padding: 8px 16px; 
              border-radius: 8px; 
              font-weight: 500;
              cursor: not-allowed;
            ">Tarefas</button>
            <button class="section-btn" data-section="members" disabled style="
              background: #e2e8f0; 
              color: #a0aec0; 
              border: none; 
              padding: 8px 16px; 
              border-radius: 8px; 
              font-weight: 500;
              cursor: not-allowed;
            ">Membros</button>
            <button class="section-btn" data-section="settings" disabled style="
              background: #e2e8f0; 
              color: #a0aec0; 
              border: none; 
              padding: 8px 16px; 
              border-radius: 8px; 
              font-weight: 500;
              cursor: not-allowed;
            ">Configurações</button>
            <button class="section-btn" data-section="notifications" disabled style="
              background: #e2e8f0; 
              color: #a0aec0; 
              border: none; 
              padding: 8px 16px; 
              border-radius: 8px; 
              font-weight: 500;
              cursor: not-allowed;
            ">Notificações</button>
          </div>

          <div style="display: flex; align-items: center; gap: 15px;">
            <span id="online-count" style="
              color: #48bb78; 
              font-weight: 500;
              display: flex;
              align-items: center;
              gap: 5px;
            ">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                <circle cx="4" cy="4" r="4"/>
              </svg>
              Online: <span id="online-number">0</span>
            </span>

            <button id="search-icon" style="
              background: none; 
              border: none; 
              cursor: pointer; 
              padding: 6px;
              border-radius: 6px;
              transition: background 0.2s ease;
            " onmouseover="this.style.background='#f7fafc'" onmouseout="this.style.background='none'">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>

            <button id="menu-icon" style="
              background: none; 
              border: none; 
              cursor: pointer;
              padding: 6px;
              border-radius: 6px;
              transition: background 0.2s ease;
            " onmouseover="this.style.background='#f7fafc'" onmouseout="this.style.background='none'">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="12" cy="5" r="1"></circle>
                <circle cx="12" cy="19" r="1"></circle>
              </svg>
            </button>
          </div>
        </div>

        <!-- Área de pesquisa (inicialmente oculta) -->
        <div id="search-bar" style="
          display: none; 
          background: white; 
          border-radius: 12px; 
          padding: 16px 20px; 
          margin-bottom: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
          display: none;
        ">
          <div style="display: flex; gap: 10px; align-items: center;">
            <input id="search-input" type="text" placeholder="Pesquisar mensagens..." style="
              flex: 1; 
              padding: 10px 12px; 
              border: 1px solid #e2e8f0; 
              border-radius: 8px; 
              font-size: 14px;
              outline: none;
            ">
            <button onclick="hideSearchBar()" style="
              background: #ef4444; 
              color: white; 
              border: none; 
              padding: 10px 16px; 
              border-radius: 8px; 
              cursor: pointer;
              font-weight: 500;
            ">Fechar</button>
          </div>
        </div>

        <!-- Conteúdo das discussões -->
        <div style="
          background: white; 
          border-radius: 12px; 
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
        ">
          <div id="discussions-content" style="
            height: 400px; 
            overflow-y: auto; 
            padding: 20px;
            background: #fafafa;
          ">
            <div id="chat-messages" style="
              display: flex; 
              flex-direction: column-reverse;
              gap: 12px;
            "></div>
          </div>

          <!-- Área de input de mensagem -->
          <div style="
            padding: 16px 20px; 
            border-top: 1px solid #e2e8f0;
            background: white;
          ">
            <div style="display: flex; gap: 12px; align-items: center;">
              <input id="chat-input" type="text" placeholder="Digite sua mensagem..." style="
                flex: 1; 
                padding: 12px 16px; 
                border: 1px solid #e2e8f0; 
                border-radius: 8px; 
                font-size: 14px;
                outline: none;
                transition: border-color 0.2s ease;
              " onfocus="this.style.borderColor='#FF6B00'" onblur="this.style.borderColor='#e2e8f0'">
              <button onclick="sendMessage()" style="
                background: #FF6B00; 
                color: white; 
                border: none; 
                padding: 12px 20px; 
                border-radius: 8px; 
                cursor: pointer;
                font-weight: 500;
                transition: background 0.2s ease;
              " onmouseover="this.style.background='#e55a00'" onmouseout="this.style.background='#FF6B00'">
                Enviar
              </button>
            </div>
          </div>
        </div>
      `;

      // Limpar conteúdo e adicionar interface do grupo
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.innerHTML = '';
        mainContent.appendChild(groupInterface);
      }

      // Configurar evento do botão voltar
      const backButton = document.getElementById('back-to-groups');
      if (backButton) {
        backButton.addEventListener('click', returnToGroups);
      }

      // Configurar evento do ícone de pesquisa
      const searchIcon = document.getElementById('search-icon');
      if (searchIcon) {
        searchIcon.addEventListener('click', () => {
          const searchBar = document.getElementById('search-bar');
          if (searchBar) {
            searchBar.style.display = 'block';
            const searchInput = document.getElementById('search-input') as HTMLInputElement;
            if (searchInput) {
              searchInput.focus();
            }
          }
        });
      }

      // Configurar evento do ícone de menu
      const menuIcon = document.getElementById('menu-icon');
      if (menuIcon) {
        menuIcon.addEventListener('click', () => {
          // Aqui seria implementado o modal de configurações do grupo
          console.log('Abrir modal de configurações do grupo');
        });
      }


      console.log(`Interface do grupo ${groupId} carregada com sucesso.`);

    } catch (error) {
      console.error('Erro ao acessar grupo:', error);

      // Em caso de erro, restaurar o cabeçalho
      const header = document.querySelector('.groups-header');
      if (header) {
        (header as HTMLElement).style.display = 'flex';
      }

      
    }
  };

  // Função para retornar à lista de grupos
  const returnToGroups = () => {
    try {
      console.log('Retornando para a lista de grupos...');

      // Restaurar o cabeçalho "Minhas Turmas"
      const header = document.querySelector('.groups-header');
      if (header) {
        (header as HTMLElement).style.display = 'flex';
        console.log('Cabeçalho "Minhas Turmas" restaurado.');
      }

      // Limpar a interface do grupo
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.innerHTML = '';
      }

      // Recarregar a view de grupos
      

    } catch (error) {
      console.error('Erro ao retornar para grupos:', error);
      
    }
  };


  // Função global para esconder barra de pesquisa
  (window as any).hideSearchBar = () => {
    const searchBar = document.getElementById('search-bar');
    if (searchBar) {
      searchBar.style.display = 'none';
    }
  };

  // Função global para enviar mensagem
  (window as any).sendMessage = () => {
   console.log("sendMessage function called");
  };

  React.useEffect(() => {
    (window as any).accessGroup = accessGroup;
    return () => {
      delete (window as any).accessGroup;
    };
  }, []);

  return (
    <div className="flex-1 space-y-6">
      <div className="groups-header">
        {/*<TurmasHeader />*/}
      </div>

      <div id="main-content" className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Grupos de Estudos
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Conecte-se com outros estudantes e compartilhe conhecimento
            </p>
          </div>
        </div>

        {/*<GruposEstudoView />*/}
      </div>
    </div>
  );
}