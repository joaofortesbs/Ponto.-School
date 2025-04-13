
import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/types/user-profile";

/**
 * Banco de dados de conhecimento para a IA do chat de suporte flutuante
 */

// Interface para as perguntas frequentes com respostas
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

// Interface para informações da plataforma
export interface PlatformInfo {
  id: string;
  section: string;
  path: string;
  description: string;
}

// Função para obter perfil completo do usuário
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Erro ao obter perfil do usuário:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erro ao obter perfil do usuário:", error);
    return null;
  }
};

// Função para obter estatísticas de conta do usuário
export const getUserAccountStats = async (userId: string) => {
  try {
    // Buscar informações de seguidores (pode precisar de tabela específica)
    const { data: followersData, error: followersError } = await supabase
      .from("user_relationships")
      .select("count")
      .eq("followed_id", userId)
      .eq("relationship_type", "follow");

    // Buscar informações de turmas
    const { data: classesData, error: classesError } = await supabase
      .from("user_classes")
      .select("class_id")
      .eq("user_id", userId);

    // Buscar outras estatísticas relevantes como nível, etc.
    const { data: statsData, error: statsError } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", userId)
      .single();

    return {
      followers: followersData?.length || 0,
      classes: classesData?.length || 0,
      level: statsData?.level || 1,
      plan: statsData?.plan_type || "Básico"
    };
  } catch (error) {
    console.error("Erro ao obter estatísticas do usuário:", error);
    return {
      followers: 0,
      classes: 0,
      level: 1,
      plan: "Básico"
    };
  }
};

// Função para obter turmas do usuário
export const getUserClasses = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("user_classes")
      .select(`
        classes (
          id,
          name,
          description,
          subject,
          teacher_name,
          start_date,
          end_date
        )
      `)
      .eq("user_id", userId);

    if (error) {
      console.error("Erro ao obter turmas do usuário:", error);
      return [];
    }

    return data?.map(item => item.classes) || [];
  } catch (error) {
    console.error("Erro ao obter turmas do usuário:", error);
    return [];
  }
};

// Base de conhecimento com perguntas frequentes
export const getFAQDatabase = (): FAQItem[] => {
  return [
    {
      id: "faq-1",
      question: "Onde encontro minhas turmas?",
      answer: "Você pode acessar todas as suas turmas clicando em \"Minhas Turmas\" no menu lateral esquerdo. Lá você verá cards para cada turma em que está inscrito.",
      category: "Navegação"
    },
    {
      id: "faq-2",
      question: "Como acesso a Biblioteca?",
      answer: "A \"Biblioteca\" está disponível como um item no menu lateral principal. Clique lá para explorar todos os materiais de estudo, recomendações e mais!",
      category: "Navegação"
    },
    {
      id: "faq-3",
      question: "Onde vejo minhas tarefas pendentes?",
      answer: "A forma mais rápida de ver suas tarefas pendentes é acessando sua \"Agenda\" no menu lateral e clicando na aba \"Tarefas\". Você também pode ver as tarefas mais urgentes no seu \"Painel\" principal.",
      category: "Navegação"
    },
    {
      id: "faq-4",
      question: "Como acesso o chat de um grupo de estudo?",
      answer: "Primeiro, vá até a seção \"Grupos de Estudo\" (dentro de \"Minhas Turmas\" ou no menu principal). Depois, clique no grupo que você quer acessar. A aba \"Discussões\" (que geralmente abre primeiro) é onde fica o chat.",
      category: "Funcionalidades"
    },
    {
      id: "faq-5",
      question: "Onde vejo meus pontos ou badges?",
      answer: "Você pode acompanhar seus pontos (Ponto Coins) e suas badges conquistadas na seção \"Conquistas\" no menu lateral.",
      category: "Gamificação"
    },
    {
      id: "faq-6",
      question: "Onde fica a seção \"Conexão Expert\"?",
      answer: "A \"Conexão Expert\", onde você pode pedir ajuda com suas dúvidas, está no menu lateral. O ícone é um ponto de interrogação (?). ",
      category: "Navegação"
    },
    {
      id: "faq-7",
      question: "Como faço para pedir ajuda em uma matéria?",
      answer: "Vá até a seção \"Conexão Expert\" (ícone de ?) no menu lateral e clique no botão \"+ Novo Pedido\" (laranja, no canto superior direito). Você precisará preencher um formulário com sua dúvida, disciplina, etc.",
      category: "Funcionalidades"
    },
    {
      id: "faq-8",
      question: "Como funciona esse sistema de \"leilão\" ou \"propostas\" na Conexão Expert?",
      answer: "Ao criar um pedido de ajuda, você paga uma pequena taxa (5 SP). Opcionalmente, você pode oferecer uma recompensa extra (em Ponto Coins) para atrair mais \"experts\". Os \"experts\" podem responder diretamente ou, se acharem o valor baixo, fazer uma contraproposta. Você sempre escolhe qual \"expert\" vai te ajudar.",
      category: "Funcionalidades"
    },
    {
      id: "faq-9",
      question: "Como eu vejo a resposta de um expert que escolhi?",
      answer: "Depois de clicar em \"Escolher Expert\" na página do seu pedido de ajuda, a resposta completa dele(a) aparecerá na aba \"Respostas\". Um chat privado também será aberto para vocês conversarem.",
      category: "Funcionalidades"
    },
    {
      id: "faq-10",
      question: "Outras pessoas podem ver a resposta que eu recebi na Conexão Expert?",
      answer: "Sim, após o seu pedido ser marcado como \"Resolvido\", outros alunos podem pagar uma pequena taxa (5 Ponto Coins) para visualizar a resposta que você recebeu. Isso ajuda a criar uma base de conhecimento na plataforma. Sua identidade como autor do pedido é preservada, se você preferir.",
      category: "Funcionalidades"
    },
    {
      id: "faq-11",
      question: "Como crio um grupo de estudo?",
      answer: "Você pode criar um grupo clicando no botão \"+ Criar Novo Grupo\" na seção \"Grupos de Estudo\". Você precisará definir um nome, descrição (opcional), privacidade (público/privado) e, se quiser, vincular a uma turma ou convidar membros.",
      category: "Funcionalidades"
    },
    {
      id: "faq-12",
      question: "Como adiciono um material aos meus favoritos na Biblioteca?",
      answer: "Ao visualizar a lista de materiais ou a página de um material específico, procure pelo ícone de coração. Clicar nele adicionará o material aos seus favoritos. Você pode acessar todos os seus favoritos na aba \"Favoritos\" da Biblioteca.",
      category: "Funcionalidades"
    },
    {
      id: "faq-13",
      question: "O que é o \"Modo Foco\" na Biblioteca?",
      answer: "O \"Modo Foco\" é um ambiente de estudo especial que oculta todos os elementos da interface (menus, notificações, etc.), permitindo que você se concentre totalmente no material que está estudando. Você pode ativá-lo clicando no botão \"Modo Foco\" na página do material.",
      category: "Funcionalidades"
    },
    {
      id: "faq-14",
      question: "Como funcionam as Trilhas de Aprendizagem?",
      answer: "As Trilhas de Aprendizagem são sequências de materiais e atividades organizadas para te ajudar a atingir um objetivo específico (ex: \"Preparação para o ENEM\"). O Mentor IA pode sugerir trilhas personalizadas para você, ou você pode explorar as trilhas disponíveis na seção \"Trilhas\" da Biblioteca.",
      category: "Funcionalidades"
    },
    {
      id: "faq-15",
      question: "Como mudo minha foto de perfil?",
      answer: "Clique no seu avatar (no canto superior direito), vá em \"Editar Perfil\" e procure pela opção de alterar a foto.",
      category: "Gerenciamento de Conta"
    },
    {
      id: "faq-16",
      question: "Como altero minha senha?",
      answer: "Vá em \"Editar Perfil\" (clicando no seu avatar) e procure pela seção de segurança ou alteração de senha.",
      category: "Gerenciamento de Conta"
    },
    {
      id: "faq-17",
      question: "Onde configuro minhas notificações?",
      answer: "Nas \"Configurações\" do seu perfil, você encontrará as opções de notificação. Lá você pode escolher quais tipos de notificações quer receber (novas mensagens, prazos, etc.) e por quais canais (plataforma, e-mail).",
      category: "Gerenciamento de Conta"
    },
    {
      id: "faq-18",
      question: "Como vejo meu saldo de Ponto Coins?",
      answer: "Seu saldo atual de Ponto Coins geralmente fica visível no canto superior direito da tela, próximo ao seu nome e avatar. Você também pode gerenciá-lo na seção \"Carteira\" no menu lateral.",
      category: "Gerenciamento de Conta"
    },
    {
      id: "faq-19",
      question: "Não consigo encontrar um material específico.",
      answer: "Tente usar a barra de busca no topo da Biblioteca. Você pode buscar por título, autor, disciplina ou palavra-chave. Se ainda assim não encontrar, você pode pedir ajuda na seção \"Conexão Expert\" ou verificar se o material pertence a uma turma específica em \"Minhas Turmas\".",
      category: "Ajuda e Suporte"
    },
    {
      id: "faq-20",
      question: "Tive um problema com um expert na \"Conexão Expert\". O que faço?",
      answer: "Na página do pedido de ajuda onde ocorreu o problema, você encontrará um botão ou link para \"Denunciar\". Descreva o ocorrido, e nossa equipe de moderação analisará a situação.",
      category: "Ajuda e Suporte"
    }
  ];
};

// Banco de dados de informações da plataforma
export const getPlatformNavigationInfo = (): PlatformInfo[] => {
  return [
    {
      id: "nav-1",
      section: "Minhas Turmas",
      path: "/turmas",
      description: "Acesse todas as suas turmas e grupos de estudo."
    },
    {
      id: "nav-2",
      section: "Biblioteca",
      path: "/biblioteca",
      description: "Encontre materiais de estudo, trilhas de aprendizagem e favoritados."
    },
    {
      id: "nav-3",
      section: "Agenda",
      path: "/agenda",
      description: "Visualize suas aulas, tarefas, eventos e lembretes."
    },
    {
      id: "nav-4",
      section: "Conexão Expert",
      path: "/pedidos-ajuda",
      description: "Peça ajuda com dúvidas ou responda como expert."
    },
    {
      id: "nav-5",
      section: "Epictus IA",
      path: "/epictus-ia",
      description: "Converse com o Epictus IA para criar planos de estudo personalizados e obter resumos inteligentes."
    },
    {
      id: "nav-6",
      section: "Conquistas",
      path: "/conquistas",
      description: "Veja suas badges, pontos e progresso."
    },
    {
      id: "nav-7",
      section: "Carteira",
      path: "/carteira",
      description: "Gerencie seus Ponto Coins."
    },
    {
      id: "nav-8",
      section: "Perfil",
      path: "/profile",
      description: "Edite suas informações e configurações."
    }
  ];
};

// Função para buscar informações específicas da plataforma
export const searchPlatformInfo = (query: string): PlatformInfo[] => {
  const platformInfo = getPlatformNavigationInfo();
  const normalizedQuery = query.toLowerCase().trim();
  
  return platformInfo.filter(item => 
    item.section.toLowerCase().includes(normalizedQuery) || 
    item.description.toLowerCase().includes(normalizedQuery)
  );
};

// Função para buscar FAQs com base em uma consulta
export const searchFAQs = (query: string): FAQItem[] => {
  const faqs = getFAQDatabase();
  const normalizedQuery = query.toLowerCase().trim();
  
  return faqs.filter(item => 
    item.question.toLowerCase().includes(normalizedQuery) || 
    item.answer.toLowerCase().includes(normalizedQuery) ||
    item.category.toLowerCase().includes(normalizedQuery)
  );
};

// Função para formatar as informações do usuário para a IA
export const formatUserInfoForAI = async (userId: string) => {
  try {
    const profile = await getUserProfile(userId);
    const stats = await getUserAccountStats(userId);
    const classes = await getUserClasses(userId);
    
    if (!profile) return "Desculpe, não consegui encontrar suas informações no momento.";
    
    return {
      id: profile.id,
      user_id: profile.id,
      email: profile.email || "Não disponível",
      full_name: profile.full_name || "Não disponível",
      display_name: profile.display_name || profile.username || "Usuário",
      followers: stats.followers,
      plan_type: profile.plan_type || stats.plan,
      level: stats.level,
      classes: classes,
      bio: profile.bio || "Sem biografia definida",
      created_at: profile.created_at || "Não disponível",
      institution: profile.institution || "Não disponível"
    };
  } catch (error) {
    console.error("Erro ao formatar informações do usuário:", error);
    return "Desculpe, ocorreu um erro ao acessar suas informações.";
  }
};
