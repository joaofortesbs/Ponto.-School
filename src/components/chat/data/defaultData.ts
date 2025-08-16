
export const defaultData = {
  tickets: [
    {
      id: "1",
      title: "Problema ao acessar curso de Física",
      description: "Não consigo acessar as aulas do módulo 3 do curso de Física Quântica.",
      status: "in_progress" as const,
      category: "Acesso e Conteúdo",
      createdAt: new Date("2024-02-28"),
    },
    {
      id: "2",
      title: "Dúvida sobre certificado",
      description: "Completei o curso mas não recebi meu certificado por email.",
      status: "open" as const,
      category: "Certificados",
      createdAt: new Date("2024-02-28"),
    },
  ],

  faqs: [
    {
      id: "1",
      question: "Como funciona o sistema de pontos?",
      answer: "O sistema de School Points permite que você acumule pontos ao completar cursos, participar de fóruns e realizar outras atividades na plataforma. Esses pontos podem ser trocados por recompensas como cursos premium, mentorias e materiais exclusivos.",
      category: "Pontos e Recompensas",
    },
    {
      id: "2",
      question: "Como recuperar minha senha?",
      answer: "Para recuperar sua senha, clique em 'Esqueci minha senha' na tela de login. Você receberá um email com instruções para criar uma nova senha. Se não receber o email, verifique sua pasta de spam.",
      category: "Conta e Acesso",
    },
    {
      id: "3",
      question: "Como obter um certificado?",
      answer: "Os certificados são emitidos automaticamente após a conclusão de um curso. Você pode acessá-los na seção 'Meus Certificados' do seu perfil. Caso tenha problemas, abra um ticket de suporte.",
      category: "Certificados",
    },
  ],

  suggestions: [
    {
      id: "1",
      title: "Modo escuro para o aplicativo móvel",
      description: "Seria ótimo ter um modo escuro no aplicativo móvel para reduzir o cansaço visual durante estudos noturnos.",
      votes: 42,
      status: "approved" as const,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
      userVoted: true,
    },
    {
      id: "2",
      title: "Integração com Google Calendar",
      description: "Gostaria que a plataforma sincronizasse eventos e prazos com o Google Calendar automaticamente.",
      votes: 28,
      status: "reviewing" as const,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      userVoted: false,
    },
  ],

  chatHistory: [
    {
      id: "1",
      title: "Suporte Técnico",
      lastMessage: "Obrigado por sua mensagem. Como posso ajudar você hoje?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      unread: false,
    },
    {
      id: "2",
      title: "Dúvidas sobre Curso",
      lastMessage: "Os certificados são emitidos automaticamente após a conclusão do curso.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      unread: true,
    },
  ],

  notifications: [
    {
      id: "1",
      title: "Nova promoção disponível",
      message: "Aproveite 50% de desconto em cursos de Física até o final da semana!",
      type: "info" as const,
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: "2",
      title: "Ticket respondido",
      message: "Seu ticket sobre certificados foi respondido pela equipe de suporte.",
      type: "success" as const,
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
    },
  ],
};
