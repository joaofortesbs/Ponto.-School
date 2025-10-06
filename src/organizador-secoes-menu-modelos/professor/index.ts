
// Organizador de Seções - Modelo PROFESSOR
// Este arquivo centraliza todas as seções e suas respectivas interfaces do modelo Professor

export const professorSections = {
  // Seções principais do Professor
  painel: {
    path: '/dashboard',
    component: 'Dashboard',
    interface: '/src/pages/dashboard/index.tsx'
  },
  
  turmas: {
    path: '/turmas',
    component: 'Turmas',
    interface: '/src/pages/turmas/index.tsx'
  },
  
  trilhasSchool: {
    path: '/trilhas-school/professores',
    component: 'TrilhasSchoolProfessorInterface',
    interface: '/src/pages/trilhas-school/professores/interface.tsx'
  },
  
  schoolPlanner: {
    path: '/school-planner',
    component: 'SchoolPlanner',
    interface: '/src/pages/school-planner/index.tsx' // A criar se necessário
  },
  
  epictusIA: {
    path: '/epictus-ia',
    component: 'EpictusIA',
    interface: '/src/pages/epictus-ia/index.tsx'
  },
  
  agenda: {
    path: '/agenda',
    component: 'Agenda',
    interface: '/src/pages/agenda/index.tsx'
  },
  
  biblioteca: {
    path: '/biblioteca',
    component: 'Biblioteca',
    interface: '/src/pages/biblioteca/index.tsx'
  },
  
  comunidades: {
    path: '/comunidades',
    component: 'Comunidades',
    interface: '/src/pages/comunidades/index.tsx'
  },
  
  conquistas: {
    path: '/conquistas',
    component: 'Conquistas',
    interface: '/src/pages/conquistas/index.tsx'
  },
  
  explorar: {
    path: '/explorar',
    component: 'Explorar',
    interface: '/src/pages/explorar/index.tsx' // A criar se necessário
  }
};

export type ProfessorSection = keyof typeof professorSections;
