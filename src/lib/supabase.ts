import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Ensure environment variables are loaded
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase environment variables are missing or invalid!");
}

// Track offline state
let isOffline = false;
let retryCount = 0;
const MAX_RETRIES = 5; // Increased retries

// Initialize a flag to track if we've shown the connection error
let connectionErrorShown = false;

// Custom fetch function with retry and offline detection
const customFetch = async (...args: [RequestInfo | URL, RequestInit | undefined]) => {
  const [resource, config] = args;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 second timeout
  
  // Add signal to config
  const updatedConfig = {
    ...config,
    signal: controller.signal
  };
  
  // If we're already offline, don't even try to fetch
  if (isOffline && localStorage.getItem('isOfflineMode') === 'true') {
    clearTimeout(timeoutId);
    return Promise.reject(new Error("Aplicação em modo offline"));
  }
  
  try {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`Tentativa ${attempt} de ${MAX_RETRIES}...`);
        }
        
        const response = await fetch(resource, updatedConfig);
        
        // Se a resposta for bem-sucedida, resete o contador de tentativas e estado offline
        if (response.ok) {
          isOffline = false;
          retryCount = 0;
          localStorage.removeItem('isOfflineMode');
        }
        
        return response;
      } catch (err: any) {
        // Se for a última tentativa, lance o erro
        if (attempt === MAX_RETRIES) {
          throw err;
        }
        
        // Caso contrário, espere um pouco antes de tentar novamente
        // Aumentando o tempo de espera a cada tentativa (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        console.log(`Falha na tentativa ${attempt}. Tentando novamente em ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // Caso improvavelmente chegue aqui
    throw new Error("Todas as tentativas falharam");
  } catch (err) {
    // Incrementar contador de falhas consecutivas
    retryCount++;
    
    // Se tivermos muitas falhas consecutivas, marcar como offline
    if (retryCount >= 3) {
      isOffline = true;
      localStorage.setItem('isOfflineMode', 'true');
      console.log("Aplicação entrando em modo offline após falhas consecutivas");
    }
    
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};

// Criar o cliente Supabase com configurações melhoradas
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
  global: {
    fetch: customFetch
  },
  // Adicionar mais tolerância a falhas
  db: {
    schema: 'public'
  },
  // Otimizações de desempenho
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
});

// Function to check connection status with more resilience
export const checkSupabaseConnection = async () => {
  // Se já soubermos que estamos offline, retorne imediatamente
  if (isOffline && localStorage.getItem('isOfflineMode') === 'true') {
    console.log("Verificação de conexão pulada - modo offline ativo");
    return { ok: false, offline: true };
  }
  
  try {
    const start = Date.now();
    
    // Use Promise.race com timeout mais curto
    const controller = new AbortController();
    const signal = controller.signal;
    
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 4000);
    
    try {
      // Tentar fazer uma consulta simples
      const { data, error } = await supabase.from('profiles')
        .select('id')
        .limit(1);
      
      clearTimeout(timeoutId);
      const elapsed = Date.now() - start;
      
      // Se temos dados ou um erro que não é de conectividade, a conexão funciona
      if (data || (error && error.code !== 'PGRST0001' && error.code !== '20000')) {
        isOffline = false;
        localStorage.removeItem('isOfflineMode');
        return { ok: true, latency: elapsed };
      } else {
        isOffline = true;
        localStorage.setItem('isOfflineMode', 'true');
        return { ok: false, latency: elapsed, error: error };
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      console.error("Erro na consulta:", fetchError);
      isOffline = true;
      localStorage.setItem('isOfflineMode', 'true');
      return { ok: false, error: fetchError, offline: true };
    }
  } catch (err) {
    console.error("Verificação de conexão falhou:", err);
    isOffline = true;
    localStorage.setItem('isOfflineMode', 'true');
    return { ok: false, error: err, offline: true };
  }
};

// Verificar conexão periodicamente
setInterval(async () => {
  if (navigator.onLine) {
    try {
      const { ok } = await checkSupabaseConnection();
      if (ok && isOffline) {
        console.log("Conexão com Supabase restaurada!");
        isOffline = false;
        localStorage.removeItem('isOfflineMode');
        
        // Avisar o usuário que voltamos ao modo online
        const event = new CustomEvent('supabaseConnectionRestored');
        window.dispatchEvent(event);
      }
    } catch (err) {
      console.log("Falha na verificação periódica de conexão", err);
    }
  }
}, 30000); // Verificar a cada 30 segundos

// Detectar quando o dispositivo fica online/offline
window.addEventListener('online', async () => {
  console.log("Dispositivo ficou online, verificando conexão com Supabase");
  const { ok } = await checkSupabaseConnection();
  if (ok) {
    isOffline = false;
    localStorage.removeItem('isOfflineMode');
    const event = new CustomEvent('supabaseConnectionRestored');
    window.dispatchEvent(event);
  }
});

window.addEventListener('offline', () => {
  console.log("Dispositivo ficou offline");
  isOffline = true;
  localStorage.setItem('isOfflineMode', 'true');
  const event = new CustomEvent('supabaseConnectionLost');
  window.dispatchEvent(event);
});
