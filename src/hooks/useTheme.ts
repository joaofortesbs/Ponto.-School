
// Este hook foi renomeado para evitar conflitos com o useTheme do ThemeProvider
import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export function useCustomTheme(): [Theme, (theme: Theme) => void] {
  const [theme, setTheme] = useState<Theme>(() => {
    // Recuperar do localStorage ou usar padrão
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme === 'dark' || savedTheme === 'light') ? savedTheme : 'light';
  });

  useEffect(() => {
    // Persistir no localStorage quando mudar
    localStorage.setItem('theme', theme);
    
    // Aplicar classe ao document para estilização global
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return [theme, setTheme]
}
