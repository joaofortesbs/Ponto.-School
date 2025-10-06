
// Organizador de Seções - Modelo ALUNO
// Este arquivo centraliza todas as seções e suas respectivas interfaces do modelo Aluno

export const alunoSections = {
  // Seções principais do Aluno
  painel: {
    path: '/dashboard',
    component: 'Dashboard',
    interface: '/src/pages/dashboard/index.tsx',
    status: 'active' // Interface funcional
  },
  
  minhasTurmas: {
    path: '/turmas',
    component: 'AlunoUnderConstruction',
    interface: '/src/pages/under-construction/AlunoUnderConstruction.tsx',
    status: 'construction' // Interface em construção
  },
  
  trilhasSchool: {
    path: '/trilhas-school/alunos',
    component: 'AlunoUnderConstruction',
    interface: '/src/pages/trilhas-school/alunos/interface.tsx',
    status: 'construction' // Interface em construção
  },
  
  schoolPlanner: {
    path: '/school-planner',
    component: 'AlunoUnderConstruction',
    interface: '/src/pages/under-construction/AlunoUnderConstruction.tsx',
    status: 'construction' // Interface em construção
  },
  
  epictusIA: {
    path: '/epictus-ia',
    component: 'AlunoUnderConstruction',
    interface: '/src/pages/under-construction/AlunoUnderConstruction.tsx',
    status: 'construction' // Interface em construção
  },
  
  agenda: {
    path: '/agenda',
    component: 'AlunoUnderConstruction',
    interface: '/src/pages/under-construction/AlunoUnderConstruction.tsx',
    status: 'construction' // Interface em construção
  },
  
  comunidades: {
    path: '/comunidades',
    component: 'AlunoUnderConstruction',
    interface: '/src/pages/under-construction/AlunoUnderConstruction.tsx',
    status: 'construction' // Interface em construção
  },
  
  conquistas: {
    path: '/conquistas',
    component: 'AlunoUnderConstruction',
    interface: '/src/pages/under-construction/AlunoUnderConstruction.tsx',
    status: 'construction' // Interface em construção
  },
  
  explorar: {
    path: '/explorar',
    component: 'AlunoUnderConstruction',
    interface: '/src/pages/under-construction/AlunoUnderConstruction.tsx',
    status: 'construction' // Interface em construção
  }
};

export type AlunoSection = keyof typeof alunoSections;
