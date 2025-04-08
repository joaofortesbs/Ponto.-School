import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Ensure environment variables are loaded
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase environment variables are missing or invalid!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
  global: {
    fetch: (...args) => {
      // Custom fetch with timeout for all Supabase requests
      const [resource, config] = args;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      return fetch(resource, {
        ...config,
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));
    }
  }
});

// Function to check connection status
export const checkSupabaseConnection = async () => {
  try {
    const start = Date.now();
    // Simple query to test connection
    const { data, error } = await supabase.from('profiles').select('id').limit(1).maybeSingle();
    const elapsed = Date.now() - start;
    
    if (error && error.code === 'PGRST116') {
      // This is a 404 error which means the table doesn't exist but connection works
      return { ok: true, latency: elapsed };
    }
    
    return { ok: !error, latency: elapsed, error };
  } catch (err) {
    console.error("Supabase connection check failed:", err);
    return { ok: false, error: err };
  }
};
