
import { useState, useEffect } from 'react';

interface NeonUserData {
  nome_completo?: string;
  nome_usuario?: string;
  email?: string;
}

export function useUserName() {
  const [userName, setUserName] = useState<string>("Usuário");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserName = () => {
      try {
        // 1. Tentar buscar do Neon DB (prioridade máxima)
        const neonUser = localStorage.getItem("neon_user");
        if (neonUser) {
          const userData: NeonUserData = JSON.parse(neonUser);
          const fullName = userData.nome_completo || userData.nome_usuario || userData.email;
          
          if (fullName) {
            const firstName = fullName.split(" ")[0].split("@")[0];
            if (firstName && firstName !== "Usuário") {
              setUserName(firstName);
              localStorage.setItem("userFirstName", firstName);
              setIsLoading(false);
              return;
            }
          }
        }

        // 2. Fallback para localStorage
        const storedFirstName = localStorage.getItem("userFirstName");
        if (storedFirstName && storedFirstName !== "Usuário") {
          setUserName(storedFirstName);
          setIsLoading(false);
          return;
        }

        // 3. Último fallback
        setUserName("Usuário");
        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao buscar nome do usuário:", error);
        setUserName("Usuário");
        setIsLoading(false);
      }
    };

    fetchUserName();

    // Listener para mudanças no localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "neon_user" || e.key === "userFirstName") {
        fetchUserName();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return { userName, isLoading };
}
