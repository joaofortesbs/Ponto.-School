
import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export function useTheme(): [Theme, (theme: Theme) => void] {
  const [theme, setTheme] = useState<Theme>(() => {
    // Recuperar do localStorage ou usar padrão
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme === 'dark' || savedTheme === 'light') ? savedTheme : 'light';
  });

  useEffect(() => {
    // Persistir no localStorage quando mudar
    localStorage.setItem('theme', theme);
    
    const root = document.documentElement;
    const body = document.body;
    
    // Remover classes existentes
    root.classList.remove('light', 'dark');
    body.classList.remove('light', 'dark');
    
    // Aplicar classe ao document para estilização global
    if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.add('light');
      body.classList.add('light');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
    
    // Disparar evento customizado para componentes que precisam reagir
    window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme } }));
  }, [theme]);

  return [theme, setTheme];
}
