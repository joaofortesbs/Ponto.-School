
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Ícones SVG para cada perfil
const ProfileIcons = {
  student: (
    <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
    </svg>
  ),
  teacher: (
    <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
      <path d="M3 7h2V5H3v2zm0 4h2V9H3v2zm0 4h2v-2H3v2zm0 4h2v-2H3v2z"/>
    </svg>
  ),
  coordinator: (
    <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14 6V4h-4v2h4zM4 8v11h16V8H4zm16-2c1.11 0 2 .89 2 2v11c0 1.11-.89 2-2 2H4c-1.11 0-2-.89-2-2V8c0-1.11.89-2 2-2h16z"/>
      <path d="M12 9c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z"/>
      <path d="M12 16c-2.67 0-8 1.34-8 4v1h16v-1c0-2.66-5.33-4-8-4z"/>
    </svg>
  ),
  expert: (
    <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7.51-3.49L17.5 6.5 9.99 9.99 6.5 17.5zm5.5-6.6c.61 0 1.1.49 1.1 1.1s-.49 1.1-1.1 1.1-1.1-.49-1.1-1.1.49-1.1 1.1-1.1z"/>
    </svg>
  ),
  responsible: (
    <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      <path d="M12 13.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 8.5 12 8.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  )
};

// Dados dos perfis
const profiles = [
  {
    id: 'student',
    name: 'Aluno',
    icon: ProfileIcons.student,
    color: 'bg-orange-100',
    bgGradient: 'from-orange-100 to-orange-200'
  },
  {
    id: 'teacher',
    name: 'Professor',
    icon: ProfileIcons.teacher,
    color: 'bg-orange-100',
    bgGradient: 'from-orange-100 to-orange-200'
  },
  {
    id: 'coordinator',
    name: 'Coordenador',
    icon: ProfileIcons.coordinator,
    color: 'bg-orange-100',
    bgGradient: 'from-orange-100 to-orange-200'
  },
  {
    id: 'expert',
    name: 'Expert',
    icon: ProfileIcons.expert,
    color: 'bg-orange-100',
    bgGradient: 'from-orange-100 to-orange-200'
  },
  {
    id: 'responsible',
    name: 'Responsável',
    icon: ProfileIcons.responsible,
    color: 'bg-orange-100',
    bgGradient: 'from-orange-100 to-orange-200'
  }
];

// Componente GreetingMessage
const GreetingMessage = ({ selectedProfile, userName }) => {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    let timeGreeting = '';
    
    if (hour < 12) {
      timeGreeting = 'Bom dia';
    } else if (hour < 18) {
      timeGreeting = 'Boa tarde';
    } else {
      timeGreeting = 'Boa noite';
    }

    const profileMessages = {
      student: `${timeGreeting}, ${userName}! Pronto para aprender algo novo?`,
      teacher: `${timeGreeting}, ${userName}! Vamos planejar sua próxima aula?`,
      coordinator: `${timeGreeting}, ${userName}! Tudo pronto para organizar sua escola?`,
      expert: `${timeGreeting}, ${userName}! Vamos transformar educação com IA?`,
      responsible: `${timeGreeting}, ${userName}! Vamos acompanhar o progresso do seu filho?`
    };

    setGreeting(profileMessages[selectedProfile.id] || `${timeGreeting}, ${userName}!`);
  }, [selectedProfile, userName]);

  return (
    <motion.div
      key={selectedProfile.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="text-center mt-6 max-w-md mx-auto"
    >
      <p className="text-lg font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
        {greeting}
      </p>
    </motion.div>
  );
};

// Componente ProfileOptionBubble
const ProfileOptionBubble = ({ profile, onClick, index }) => {
  // Posicionamento horizontal alinhado: Coordenador à esquerda, outros à direita
  const positions = [
    { x: -140, y: 0 },  // Aluno - esquerda
    { x: 140, y: 0 },   // Professor - direita
    { x: -280, y: 0 },  // Coordenador - mais à esquerda
    { x: 280, y: 0 },   // Expert - mais à direita
    { x: 420, y: 0 }    // Responsável - extrema direita
  ];

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        x: positions[index].x,
        y: positions[index].y
      }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20,
        delay: index * 0.1 
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="absolute cursor-pointer z-20"
      onClick={() => onClick(profile)}
    >
      <div className={`
        w-20 h-20 rounded-full shadow-lg flex items-center justify-center
        bg-gradient-to-br ${profile.bgGradient}
        hover:shadow-xl transition-shadow duration-200
        border-2 border-orange-200/50
      `}>
        {profile.icon}
      </div>
      <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
        <span className="text-sm font-medium text-orange-700 dark:text-orange-300 bg-orange-100/90 dark:bg-orange-900/80 px-3 py-1 rounded-full shadow-sm border border-orange-200/50 dark:border-orange-700/50">
          {profile.name}
        </span>
      </div>
    </motion.div>
  );
};

// Componente principal AvatarCentral
const AvatarCentral = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(profiles[0]);
  const userName = "João Marcelo";

  const handleAvatarClick = () => {
    if (isExpanded) {
      // Se já está expandido, apenas fecha as opções
      setIsExpanded(false);
    } else {
      // Se não está expandido, abre as opções
      setIsExpanded(true);
    }
  };

  const handleProfileSelect = (profile) => {
    setSelectedProfile(profile);
    setIsExpanded(false);
    
    // Aqui você pode adicionar lógica para atualizar o contexto global
    console.log('Perfil selecionado:', profile);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 relative">
      {/* Container principal do avatar */}
      <div className="relative z-10">
        {/* Avatar central */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative cursor-pointer"
          onClick={handleAvatarClick}
        >
          <div className={`
            w-20 h-20 rounded-full shadow-xl flex items-center justify-center
            bg-gradient-to-br ${selectedProfile.bgGradient}
            border-2 border-orange-200/50
            transition-all duration-300
          `}>
            {selectedProfile.icon}
          </div>
          
          {/* Indicador de expansão */}
          <motion.div
            animate={{ rotate: isExpanded ? 45 : 0 }}
            className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center border-2 border-orange-200"
          >
            <svg className="w-3 h-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </motion.div>
        </motion.div>

        {/* Bolhas de perfil expandidas */}
        <AnimatePresence>
          {isExpanded && (
            <div className="absolute inset-0 pointer-events-none">
              {profiles.filter(profile => profile.id !== selectedProfile.id).map((profile, index) => (
                <div key={profile.id} className="pointer-events-auto">
                  <ProfileOptionBubble
                    profile={profile}
                    onClick={handleProfileSelect}
                    index={index}
                  />
                </div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Overlay para fechar quando expandido */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/10 z-0"
              onClick={() => setIsExpanded(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Mensagem de saudação com blur quando expandido */}
      <div className={`transition-all duration-300 ${isExpanded ? 'blur-sm' : ''}`}>
        <GreetingMessage selectedProfile={selectedProfile} userName={userName} />

        {/* Informações do perfil atual - posicionado abaixo do círculo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute top-28 left-1/2 transform -translate-x-1/2 text-center"
        >
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-orange-100/80 dark:bg-orange-900/30 shadow-sm border border-orange-200/50 dark:border-orange-700/50">
            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
              Perfil atual: {selectedProfile.name}
            </span>
          </span>
        </motion.div>

        {/* Versão mobile responsiva */}
        <div className="md:hidden mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Toque no avatar para alternar entre perfis
          </p>
        </div>
      </div>

      {/* Efeitos visuais adicionais */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-400/30 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-orange-400/30 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-orange-400/30 rounded-full animate-pulse delay-500"></div>
      </div>
    </div>
  );
};

export default AvatarCentral;
