
// Organizador de Seções - Modelo COORDENADOR
// Este arquivo centraliza todas as seções e suas respectivas interfaces do modelo Coordenador

export const coordenadorSections = {
  // Seções principais do Coordenador
  painel: {
    path: '/dashboard',
    component: 'Dashboard',
    interface: '/src/pages/dashboard/index.tsx',
    status: 'active'
  },
  
  turmas: {
    path: '/turmas',
    component: 'Turmas',
    interface: '/src/pages/turmas/index.tsx',
    status: 'active'
  },
  
  trilhasSchool: {
    path: '/trilhas-school/coordenador',
    component: 'TrilhasSchoolCoordenadorInterface',
    interface: '/src/pages/trilhas-school/coordenador/interface.tsx', // A criar
    status: 'pending' // Interface a ser criada
  },
  
  schoolPlanner: {
    path: '/school-planner',
    component: 'SchoolPlanner',
    interface: '/src/pages/school-planner/index.tsx',
    status: 'pending'
  },
  
  epictusIA: {
    path: '/epictus-ia',
    component: 'EpictusIA',
    interface: '/src/pages/epictus-ia/index.tsx',
    status: 'active'
  },
  
  agenda: {
    path: '/agenda',
    component: 'Agenda',
    interface: '/src/pages/agenda/index.tsx',
    status: 'active'
  },
  
  biblioteca: {
    path: '/biblioteca',
    component: 'Biblioteca',
    interface: '/src/pages/biblioteca/index.tsx',
    status: 'active'
  },
  
  relatorios: {
    path: '/relatorios',
    component: 'Relatorios',
    interface: '/src/pages/relatorios/index.tsx', // A criar
    status: 'pending'
  },
  
  gestao: {
    path: '/gestao',
    component: 'Gestao',
    interface: '/src/pages/gestao/index.tsx', // A criar
    status: 'pending'
  }
};

export type CoordenadorSection = keyof typeof coordenadorSections;
